# 03 — Shared Kotlin module: `GuestitConnectivityCore`

**[DESIGN]** — adapt names, DI and libraries to the real repositories. The interfaces below are a starting point, not a requirement to replace compatible existing ones [REQ §3].

## 1. Packaging (one implementation, two consumers)
Decide in Phase 0, based on the repository layout:

| Option | When | Note |
|---|---|---|
| **A. Separate Gradle library published to a private Maven repo** (e.g. GitHub Packages / Nexus) | eMenu and kiosk live in separate repos | Versioned; both apps pin the same version. Preferred. |
| B. Git submodule + `includeBuild` | No private Maven available | Same source, but pin the submodule commit in both apps. |
| C. Module in a monorepo | Apps already share a repo | Simplest. |

Never copy the code into both apps.

## 2. Module layout
```
guestit-connectivity-core/
  api/            ConnectionState, ServerRole, ServerEndpoint, RoutingDescriptor, HealthResult, FailoverCoordinator
  routing/        DescriptorVerifier (Ed25519), DescriptorStore (DataStore), AuthorityResolver
  health/         ReadinessProbe, FailureDetector (thresholds + hysteresis), NetworkMonitor (ConnectivityManager callback)
  transport/      ActiveEndpointInterceptor (OkHttp), EpochHeaderInterceptor, RealtimeSwitcher, CircuitBreaker
  outbox/         OutboxEntity/Dao (Room), OutboxRepository, OutboxProcessor (WorkManager + in-process), Reconciler
  session/        SessionGuard (generation + per-session Mutex)
  payments/       PaymentAttemptStore, PaymentReconciler (interfaces; app supplies the PSP/terminal adapter)
  diagnostics/    DiagnosticsSnapshot, StructuredLog (no PII), StaffDiagnosticsProvider
  testing/        FakeControlPlane, FaultInjectingInterceptor (test-only artifact, never in release)
```

## 3. Public API (illustrative)
```kotlin
enum class ServerRole { LOCAL_PRIMARY, LOCAL_SECONDARY, CLOUD_ACTIVE }

sealed interface ConnectionState {
    data class Connected(val role: ServerRole, val nodeId: String, val epoch: Long) : ConnectionState
    data class Suspect(val since: Instant, val reason: FailureReason) : ConnectionState
    data class Resolving(val attempt: Int) : ConnectionState
    data class Switching(val from: String?, val to: String, val epoch: Long) : ConnectionState
    data class Reconciling(val pending: Int, val unknown: Int) : ConnectionState
    data class NoAuthority(val reason: FailureReason, val retryAt: Instant) : ConnectionState
}

interface GuestitFailoverCoordinator {
    val connectionState: StateFlow<ConnectionState>
    val activeEndpoint: StateFlow<ServerEndpoint?>
    val canSubmitWrites: StateFlow<Boolean>          // true only in Connected
    suspend fun initialize()
    suspend fun resolveActiveServer(): ServerEndpoint?
    suspend fun executeHealthCheck(): HealthResult
    suspend fun requestRecovery()                     // staff action: re-resolve now (never forces a writer)
    fun setPaymentInProgress(active: Boolean)         // payment guard for voluntary switches
}

interface OrderOutbox {
    suspend fun enqueue(op: OutboxOperation): OutboxId      // persists BEFORE any network call
    fun observe(id: OutboxId): Flow<OutboxRecord>
    fun observeCounts(): Flow<OutboxCounts>
}
```

## 4. Authority resolution
1. Load the last accepted descriptor from DataStore (survives restart).
2. Ask candidates for `GET /routing` in preference order (configured A, B, cloud control plane) **in parallel with short timeouts**; take the **valid descriptor with the highest epoch**.
3. Probe `/health/ready` on the descriptor's writer; accept only if readiness matches (C2).
4. If no valid descriptor or readiness fails: `NoAuthority` with backoff. **Never** pick a node because "it answers".

## 5. Transport switching
- One shared `OkHttpClient`. `ActiveEndpointInterceptor` rewrites scheme/host/port from `activeEndpoint` per request, so Retrofit instances do not have to be rebuilt and no UI reload happens. (If the app uses Ktor: a `defaultRequest` plugin reading the same StateFlow.)
- `EpochHeaderInterceptor` adds `X-Guestit-Epoch` to writes; a response `409 STALE_EPOCH` / `503 NOT_WRITER` triggers `Resolving` and turns the outbox item into `PENDING` (nothing committed) — never a blind retry on another host.
- In-flight requests that started against the old endpoint finish or time out; they are never silently re-sent to the new one. Writes go through the outbox only.
- Realtime (WebSocket/SSE): close the old socket, open one to the new writer, then resubscribe with the last seen sequence numbers; ignore events with an epoch lower than the current one.

## 6. Failure detector
- Inputs: probe results, real request failures (timeouts, connection refused, 5xx, TLS errors), Android `NetworkCallback` (lost/available), descriptor changes.
- Thresholds and hysteresis per `01-architecture.md` §4; configurable via remote config.
- Circuit breaker per endpoint: open after threshold, half-open probe after the backoff; prevents request storms on 2 GB devices.

## 7. Durable outbox (Room)
```kotlin
@Entity(tableName = "outbox", indices = [Index(value = ["idempotencyKey"], unique = true), Index("state")])
data class OutboxEntity(
    @PrimaryKey val id: String,
    val idempotencyKey: String,
    val type: String,                 // ORDER_SUBMIT, ORDER_ADD, PAYMENT_LINK, LOYALTY_COMMIT, SESSION_CLOSE …
    val payloadJson: String,          // no card data, minimal personal data (e.g. pickup name only if needed)
    val sessionId: String?, val sessionGeneration: Long?,
    val state: String,                // DRAFT, PENDING, IN_FLIGHT, UNKNOWN, CONFIRMED, REJECTED, RECONCILED
    val attempts: Int,
    val firstAttemptAt: Long?, val firstAttemptNodeId: String?, val lastEpoch: Long?,
    val serverOrderId: String?, val serverOrderNo: String?,
    val lastError: String?, val createdAt: Long, val updatedAt: Long,
)
```
- State transitions are written in a Room transaction; `IN_FLIGHT → UNKNOWN` on any timeout or lost connection after the request body may have been sent.
- Processor: a single in-process consumer (coroutine) + a `WorkManager` unique job for process restarts. Sequential per session; parallel across sessions with a small limit (2).
- Retention: CONFIRMED/RECONCILED purged after 24 h; UNKNOWN never purged automatically.
- Bound: 500 operations / 5 MB → staff warning at 80 %; new orders still accepted locally only if the business rule allows it (decide in Phase 0).

## 8. Session guard (eMenu and kiosk)
- Every cart/session mutation goes through `SessionGuard.mutate(sessionId) { … }` (one `Mutex` per active session, or a single actor).
- Responses carry `sessionId` + `sessionGeneration`; the guard discards responses for a generation that is no longer current [REQ §6].
- Session binding (device ↔ table/guest session) changes only inside the guard, atomically with the cart reset.

## 9. Diagnostics
- `StaffDiagnosticsProvider` exposes: state, role, node ID, epoch, last verified health (time + fields), last failure reason, outbox counts per state, list of UNKNOWN/PAID_ORDER_PENDING items, last switch (from → to, duration).
- Structured log events (`connectivity.state`, `connectivity.switch`, `outbox.transition`, `payment.reconcile`) with device ID, epoch and correlation IDs — no personal data, no card data.

## 10. Testing hooks
- `FaultInjectingInterceptor` and `FakeControlPlane` live in a `testFixtures` / `-testing` artifact, never in release builds.
- Unit tests prove logic (state machine, outbox transitions, descriptor validation). They are **not** evidence of failover; that comes from the fault-injection lab (`08-test-plan.md`).
