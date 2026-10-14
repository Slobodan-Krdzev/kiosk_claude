GUESTIT — Unified Hybrid Failover for Native Kotlin eMenu and Self-Service Kiosk

ROLE

Act as a Principal Android/Kotlin Engineer, Distributed Systems Architect and Hospitality POS Reliability Engineer.

Your assignment is to IMPLEMENT production-grade hybrid failover in BOTH Guestit native Kotlin applications:

1. Guestit eMenu / Tablet Ordering
2. Guestit Self-Service Kiosk

Both must behave consistently with the failover architecture being implemented in the latest Guestit POS Release 9.4.1 Core.

This is an implementation assignment, not merely a specification or architectural proposal.

Preserve all existing application features, UI/UX, business logic and API integrations.

1. FIRST: AUDIT THE EXISTING POS FAILOVER IMPLEMENTATION

Before writing Kotlin code:

* Inspect the latest Guestit POS 9.4.1 source and related backend contracts.
* Locate its failover manager, endpoint resolution, server-health monitoring, replication assumptions, active-writer authority, transaction handling and failback logic.
* Identify the difference between implemented functionality, mock/simulated behavior, unverified integrations and missing backend functionality.
* Inspect the current eMenu Kotlin project.
* Inspect the current kiosk Kotlin project.
* Identify existing networking, repositories, persistence, checkout, order submission, session management and payment integration.
* Inspect the existing backend API contracts and server infrastructure.

Do not assume that every mechanism shown in the POS interface is operational.

Do not invent API endpoints, database structures, payment protocols or infrastructure capabilities.

The POS is the behavioral and contract reference, not necessarily a source-code implementation that can be copied directly into Kotlin.

Produce a short compatibility assessment, then proceed with implementation using verified contracts.

2. TARGET ARCHITECTURE

Guestit must support the following server targets:

LOCAL_PRIMARY

The primary on-premises server.

This is the preferred operational endpoint for restaurant orders, menus, devices, sessions, kitchen communication and local workflows.

LOCAL_SECONDARY

An optional synchronized on-premises standby node.

When the primary becomes unavailable, eligible devices switch to the secondary once it is verified as the authoritative active writer.

Existing Guestit installations with an independent-data standby server must remain supported as a separate manual recovery configuration. Never silently promote an unsynchronized node.

CLOUD_ACTIVE

The hosted Guestit cloud fallback environment.

When no eligible local processing node remains available, devices must automatically connect to the cloud endpoint, provided the cloud has been safely authorized to accept production transactions.

DEGRADED / NO_AUTHORITY

No safe processing server is available.

The application must preserve recoverable local session data while preventing false order confirmations, duplicate payments and unsafe writes.

The normal preference order is:

LOCAL_PRIMARY → LOCAL_SECONDARY → CLOUD_ACTIVE.

However, backend leadership and transaction authority determine the actual writable target. Client devices must never unilaterally promote a server.

3. SHARED KOTLIN FAILOVER ENGINE

Implement one reusable Kotlin core component for both applications.

Suggested name:

GuestitConnectivityCore

It should expose the following capabilities:

* Endpoint discovery and configuration
* Active-server resolution
* Network and application-health monitoring
* Failover state management
* Connection switching
* Retry and circuit-breaker policies
* Durable order submission
* Transaction idempotency
* Recovery and reconciliation
* Failback coordination
* StateFlow-based connection state reporting
* Structured diagnostics and observability

Use Kotlin Coroutines, StateFlow and the existing dependency-injection and networking stacks wherever appropriate.

Both applications must consume the same implementation, not two independently maintained copies.

A possible public interface is:

interface GuestitFailoverCoordinator {
    val connectionState: StateFlow<ConnectionState>
    val activeEndpoint: StateFlow<ServerEndpoint?>
    suspend fun initialize()
    suspend fun resolveActiveServer(): ServerEndpoint?
    suspend fun executeHealthCheck(): HealthResult
    suspend fun requestRecovery()
}

This is an illustrative interface, not a requirement to replace compatible existing interfaces.

Use actual repository conventions and existing contracts.

4. AUTOMATIC FAILOVER BEHAVIOR

The applications must continuously monitor the active processing endpoint.

Health checks must verify more than network reachability.

Validate:

* Actual application responsiveness
* Processing and database readiness
* Active-writer authority
* Leadership generation or fencing epoch
* Server compatibility
* Required tenant/location configuration
* Relevant replication or recovery state
* Ability to accept orders safely

Do not use a successful HTTP 200 response as proof that an endpoint is authorized to process orders.

When the active server becomes unavailable:

1. Detect failure through bounded timeouts and configurable failure thresholds.
2. Pause new transactional submissions while authority is unresolved.
3. Preserve the current screen, cart, session and pending state.
4. Obtain the server-authorized replacement endpoint.
5. Verify its identity, version, tenant, readiness and write authority.
6. Switch the shared API transport and applicable real-time connections.
7. Reconcile pending requests and uncertain transactions.
8. Continue normal operation without requiring an application restart.

Introduce hysteresis to prevent repeated switching between endpoints.

Suggested initial detection targets are 2–5 seconds, subject to testing. Never trade transaction safety for an arbitrary timing target.

The application must not freeze, restart, reload its UI or discard the shopping cart.

If the primary returns, do not immediately reconnect.

Failback must be coordinated by the backend after synchronization, reconciliation and safe transfer of authority.

5. ONE AUTHORITATIVE SERVER FOR ALL DEVICES

The POS, eMenu, kiosk and associated ordering services must use consistent server authority.

An individual kiosk must not accept orders against Cloud C while the POS accepts conflicting orders against Local A.

Backend coordination must enforce one logical active writer per applicable ordering domain.

Implement or integrate:

* Monotonic authority epochs
* Fencing of obsolete writers
* Split-brain prevention
* Safe server promotion
* Stale-node rejection
* Versioned routing information
* Controlled failback

Do not implement server leadership election solely inside Android applications.

If backend control-plane functionality is missing, identify the exact missing components and implement the available integration without pretending that client-side routing alone provides safe failover.

6. PRESERVE GUEST SESSIONS AND SHOPPING CARTS

Both Kotlin applications must retain their active UI and transaction state during failover.

For the eMenu preserve:

* Table identity and session
* Active arrangements, including AYCE
* Current shopping cart
* Products, options and modifiers
* Quantities
* Session-specific pricing
* Active language
* Loyalty/member association
* Applied discounts and promotions
* Orders awaiting acknowledgment
* Checkout and payment-recovery state

For the kiosk preserve:

* Current shopping cart
* Product and variant selections
* Modifiers
* Upsell selections
* Loyalty identification
* Promotions and vouchers
* Active checkout state
* Payment attempt identity
* Order confirmation state

Never allow stale session updates to modify a newly assigned guest session.

Make cart updates and session binding atomic across concurrent coroutine operations.

Use the existing Room persistence and recovery architecture wherever possible.

Durable records must survive process termination and device restart.

7. ORDER SAFETY AND IDEMPOTENCY

This is a critical requirement.

Every submitted order must use a stable, unique idempotency key that survives:

* Retries
* Connectivity loss
* Endpoint switching
* Application restart
* Cloud failover
* Failback

Persist pending requests before submission.

Implement a durable outbox using the existing persistence architecture.

Distinguish:

* Local draft
* Pending submission
* Submission outcome unknown
* Confirmed by authoritative server
* Rejected
* Reconciled

A timeout does not mean an order failed.

Before retrying an uncertain order against another server, use the verified reconciliation contract to establish whether the operation has already been committed.

Never create a duplicate kitchen order because the first acknowledgment was lost.

Do not show an order as successfully accepted until the authoritative backend has confirmed durable acceptance.

8. PAYMENT CONTINUITY

Payments may use external PSP or payment-terminal infrastructure rather than the local server.

Keep payment transport separate from ordering-server routing where appropriate.

However, order and payment state must remain consistent throughout failover.

Requirements:

* Preserve the same payment-attempt identifier across retries.
* Never automatically initiate a second charge after an uncertain response.
* Reconcile payment status against the authoritative payment provider/backend.
* Handle delayed, duplicated and out-of-order payment callbacks.
* Preserve terminal transaction references.
* Avoid success screens before payment and order confirmation are consistent.
* Never treat switching servers as a reason to charge the guest again.
* Do not persist cardholder-sensitive data.

If payment succeeds but the ordering server fails before recording the order, enter a recoverable payment-confirmed/order-pending state.

Recover or reconcile the order using the original idempotency identity.

Do not lose a paid kiosk order during failover.

If network access to the payment provider is unavailable, do not pretend payment is completed.

9. PRINTING AND KITCHEN DELIVERY

Cloud failover is not successful unless accepted orders can reach the kitchen.

Determine the actual Guestit printer-routing and KDS infrastructure.

Integrate the existing local print service or a verified compatible local print gateway.

Requirements:

* Preserve established printer-routing rules.
* Preserve kitchen destinations and product routing.
* Route cloud-accepted orders to the correct physical location.
* Support cloud-originated commands to the on-premises print gateway over an authenticated outbound connection where required.
* Maintain durable print-job identifiers.
* Prevent duplicate dispatch during server switching.
* Reconcile uncertain delivery.
* Preserve KDS order identities and kitchen status.
* Support local-secondary takeover of printing services.

Do not assume that a failed print acknowledgment means the ticket was not physically printed.

Represent uncertain physical printing explicitly and provide safe recovery.

When the POS application service is down but network and printing hardware remain operational, cloud-originated orders must still be able to reach the kitchen through the designated print/KDS infrastructure.

If a verified delivery path is unavailable, the device must not display an unqualified successful kitchen-delivery state.

10. MENU, PROMOTIONS AND REAL-TIME DATA

The cloud environment must have the information needed to serve both applications.

Verify synchronization of:

* Menus and categories
* Products, options and modifiers
* Availability and stock restrictions
* Prices and tax configuration
* Venue settings
* Tables and guest sessions
* Active arrangements and AYCE rules
* Loyalty integration requirements
* Promotion/campaign configuration
* Device-specific configuration
* Relevant order status and fulfillment data

Use versioned data contracts.

Invalidate stale caches when switching server generations.

Preserve usable local menu data while verifying freshness and compatibility against the newly authoritative server.

Do not accept an order calculated using invalid pricing or expired arrangement state.

11. REPLICATION AND DATA-LOSS GUARANTEES

Do not claim zero data loss without proving the durability mechanism.

The existing deployment may prioritize very fast local operation and continue operating while the internet is unavailable.

That requirement must be preserved.

Investigate the exact guarantees offered by local-to-local and local-to-cloud replication.

Clearly distinguish:

* Acknowledged operations durable on local nodes
* Operations already durable in the cloud
* Pending device-side operations
* Operations with uncertain durability after a catastrophic local outage

A cloud-only node cannot automatically be assumed to contain every acknowledged local transaction if replication is asynchronous.

Specify the recovery-point guarantees and demonstrate how device-side durable journals, reconciliation and backend replication work together.

If synchronous cloud durability is proposed, evaluate its impact on local latency and operation during WAN outages.

If cloud state is insufficient for safe promotion, prevent unsafe confirmations and provide explicit recovery behavior.

Never silently discard, overwrite or fabricate transaction history.

12. AUTOMATIC FAILBACK

When local service is restored:

* Verify the returning node’s identity and software compatibility.
* Keep it non-writable until properly synchronized.
* Reconcile cloud-era orders and payments.
* Reconcile KDS and print delivery states.
* Validate ordering sequences and outstanding operations.
* Confirm backend authority transfer.
* Update clients without losing active sessions.
* Return to local-first operation.

Avoid unnecessary automatic switching while guests are paying.

The returning original primary must never independently resume accepting transactions with an obsolete authority epoch.

13. SECURITY

Use secure, authenticated endpoint provisioning.

Do not hardcode production secrets or credentials into APKs.

Require authenticated device identity, venue binding and tenant isolation.

Use TLS and appropriate certificate validation for cloud connectivity.

Use secure on-premises connectivity consistent with Guestit deployment policy.

Ensure that switching endpoints cannot redirect devices to an unauthorized server.

Log administrative overrides and recovery interventions.

Do not expose private staff networks, database credentials or internal management interfaces through the application.

14. PERFORMANCE AND DEVICE LIMITATIONS

The native eMenu must remain suitable for tablets with 2 GB RAM.

Do not introduce heavy polling, excessive object allocation, unbounded retry queues or persistent socket proliferation.

Keep the connection monitor lightweight.

Use bounded caches, structured concurrency and lifecycle-aware collection.

The POS and both ordering applications must remain responsive during server failure.

Network operations must never block the main UI thread.

The existing Android UI must not be redesigned as part of this task.

15. CONNECTION STATUS UI

Normal operation should require no employee interaction.

Avoid unnecessary popups.

Provide subtle status indications:

* Connected locally
* Connected to local standby
* Connected through Guestit Cloud
* Reconnecting
* Temporarily unable to confirm orders

Staff/diagnostic screens should provide detailed information such as active endpoint, last verified health, failure reason and pending submissions.

Guest-facing applications must display clear, non-technical messaging only when the interruption materially affects ordering or payment.

Never close the cart automatically.

16. REQUIRED INTEGRATION TESTS

Implement automated regression and fault-injection tests covering at least:

1. Primary local server failure, synchronized standby healthy.
2. Both local nodes unavailable, cloud eligible for takeover.
3. Primary returns during active cloud orders.
4. WAN failure while local service remains healthy.
5. All server endpoints unavailable.
6. Failed order acknowledgment after successful commit.
7. Duplicate order retries after failover.
8. Payment completes during primary-server failure.
9. Delayed or duplicate payment callback.
10. Server changes during an active AYCE session.
11. Kiosk checkout interrupted by failover.
12. eMenu cart preserved after application restart.
13. Returning stale server attempts to accept writes.
14. Cloud and local endpoint concurrently claim authority.
15. Cloud-accepted order reaches the correct kitchen destination.
16. Duplicate or ambiguous physical printer acknowledgment.
17. Cloud replica behind acknowledged local transactions.
18. Venue configuration changes during failover.
19. Rapid repeated network interruptions.
20. Simultaneous failover of multiple kiosk and eMenu devices.

Test together with the POS, not only each Android app in isolation.

Use repeatable fault injection, not mocked UI indicators as evidence of a working production failover.

17. DELIVERABLES

Implement the code in both native Kotlin applications.

Provide:

1. Source-code changes for both applications.
2. The shared Kotlin connectivity/failover component.
3. Integration with existing networking repositories and persistence.
4. Backend changes or concrete integration requirements where needed.
5. Automated unit, integration and fault-injection tests.
6. Android build and test output.
7. A short architecture document explaining endpoint authority, order durability, failover and failback.
8. A test matrix containing PASS / FAIL / BLOCKED with actual evidence.
9. A list of unresolved backend dependencies, without invented workarounds.
10. A production-readiness assessment.

For each capability distinguish:

* Actually implemented
* Integrated and tested
* Implemented but not verified against real infrastructure
* Blocked by missing backend capability
* Not implemented

A successful local unit test is not proof of operational cloud failover.

18. NON-NEGOTIABLE ACCEPTANCE CRITERIA

The work is not complete unless:

* Both Kotlin applications use the same verified failover contract as Guestit POS.
* Both automatically switch between authorized processing endpoints.
* Local operation remains the normal, preferred mode.
* Current carts and guest sessions survive connectivity transitions.
* Orders cannot be duplicated by retrying after a lost acknowledgment.
* Payments cannot be charged twice because of failover.
* Cloud-confirmed orders can reach the correct kitchen and printer infrastructure, or an explicit safe failure state is shown.
* No obsolete server can accept conflicting writes.
* Failback is controlled and reconciled.
* No existing ordering, loyalty, promotion or arrangement features are lost.
* Android application builds pass.
* Physical-device performance is measured or explicitly reported as unverified.
* All safety-critical fault scenarios are tested.

Final instruction:

Do not produce another conceptual prototype or a mock failover switch.

Inspect the real source code and implement working production-oriented connectivity and recovery behavior in both applications.

Where backend functionality is missing, provide the exact integration and implementation requirements, and identify the affected acceptance tests as BLOCKED.

Do not mark cloud failover complete until real transaction routing, authority, durability, reconciliation and kitchen delivery have been demonstrated.

The target is one unified, local-first Guestit operating architecture across POS, eMenu and kiosk.