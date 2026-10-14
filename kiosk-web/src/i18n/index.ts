import type { L10n, Lang } from '../domain/types'

export const LANG_LABELS: Record<Lang, string> = { nl: 'Nederlands', en: 'English', mk: 'Македонски' }

const S: Record<string, L10n> = {
  // Attract / service
  'attract.tap': { nl: 'Tik om te bestellen', en: 'Tap to order', mk: 'Допрете за нарачка' },
  'service.title': { nl: 'Waar eet je vandaag?', en: 'Where are you eating today?', mk: 'Каде јадете денес?' },
  'service.eatIn': { nl: 'Hier eten', en: 'Eat in', mk: 'Овде' },
  'service.takeaway': { nl: 'Meenemen', en: 'Takeaway', mk: 'За носење' },

  // Menu
  'menu.unavailable': { nl: 'Uitverkocht', en: 'Sold out', mk: 'Распродадено' },
  'menu.viewOrder': { nl: 'Bekijk bestelling', en: 'View order', mk: 'Види нарачка' },
  'menu.items': { nl: '{n} items', en: '{n} items', mk: '{n} ставки' },
  'menu.item': { nl: '1 item', en: '1 item', mk: '1 ставка' },
  'menu.from': { nl: 'vanaf', en: 'from', mk: 'од' },
  'menu.start': { nl: 'Begin je bestelling', en: 'Start your order', mk: 'Започнете нарачка' },

  // Product
  'product.serving': { nl: 'Grootte', en: 'Size', mk: 'Големина' },
  'product.extras': { nl: 'Extra’s', en: 'Extras', mk: 'Додатоци' },
  'product.allergens': { nl: 'Allergenen', en: 'Allergens', mk: 'Алергени' },
  'product.required': { nl: 'Verplicht', en: 'Required', mk: 'Задолжително' },
  'product.optional': { nl: 'Optioneel', en: 'Optional', mk: 'Опционално' },
  'product.pickUpTo': { nl: 'Kies max. {n}', en: 'Pick up to {n}', mk: 'Изберете до {n}' },
  'product.add': { nl: 'Toevoegen', en: 'Add to order', mk: 'Додади' },
  'product.update': { nl: 'Bijwerken', en: 'Update', mk: 'Ажурирај' },
  'product.pickServing': { nl: 'Kies een grootte', en: 'Choose a size', mk: 'Изберете големина' },
  'product.quantity': { nl: 'Aantal', en: 'Quantity', mk: 'Количина' },
  'product.close': { nl: 'Sluiten', en: 'Close', mk: 'Затвори' },

  // Cart
  'cart.title': { nl: 'Je bestelling', en: 'Your order', mk: 'Вашата нарачка' },
  'cart.empty': { nl: 'Je bestelling is nog leeg.', en: 'Your order is empty.', mk: 'Нарачката е празна.' },
  'cart.backToMenu': { nl: 'Verder bestellen', en: 'Keep ordering', mk: 'Продолжи со нарачка' },
  'cart.checkout': { nl: 'Afrekenen', en: 'Checkout', mk: 'Плати' },
  'cart.subtotal': { nl: 'Subtotaal', en: 'Subtotal', mk: 'Подзбир' },
  'cart.total': { nl: 'Totaal', en: 'Total', mk: 'Вкупно' },
  'cart.remove': { nl: 'Verwijderen', en: 'Remove', mk: 'Отстрани' },
  'cart.edit': { nl: 'Wijzigen', en: 'Edit', mk: 'Измени' },
  'cart.clear': { nl: 'Bestelling wissen', en: 'Clear order', mk: 'Испразни нарачка' },
  'cart.menuUpgrade': { nl: 'Menu: friet + {drink}', en: 'Meal: fries + {drink}', mk: 'Мени: помфрит + {drink}' },
  'cart.loyaltyAsk': { nl: 'Spaarkaart?', en: 'Loyalty card?', mk: 'Картичка за лојалност?' },
  'cart.loyaltyEnter': { nl: 'Voer je 6-cijferige code in', en: 'Enter your 6-digit code', mk: 'Внесете го 6-цифрениот код' },
  'cart.loyaltyUnknown': { nl: 'Code niet gevonden.', en: 'Code not found.', mk: 'Кодот не е пронајден.' },
  'cart.loyaltyMember': { nl: '{name} · {points} punten', en: '{name} · {points} points', mk: '{name} · {points} поени' },
  'cart.loyaltyRemove': { nl: 'Koppeling verwijderen', en: 'Unlink', mk: 'Отповрзи' },
  'cart.unavailableInCart': { nl: 'Een item is niet meer beschikbaar. Verwijder het om verder te gaan.', en: 'An item is no longer available. Remove it to continue.', mk: 'Една ставка повеќе не е достапна. Отстранете ја за да продолжите.' },
  'cart.checking': { nl: 'Beschikbaarheid controleren…', en: 'Checking availability…', mk: 'Проверка на достапност…' },
  'cart.checkFailed': { nl: 'Controle mislukt. Probeer het opnieuw.', en: 'Check failed. Please try again.', mk: 'Проверката не успеа. Обидете се повторно.' },
  'cart.offline': { nl: 'De kassa is niet bereikbaar. Betalen is even niet mogelijk; je bestelling blijft bewaard.', en: 'The till is unreachable. Payment is paused for now; your order is kept.', mk: 'Касата не е достапна. Плаќањето е паузирано; нарачката е зачувана.' },

  // Price change
  'price.title': { nl: 'Prijzen zijn gewijzigd', en: 'Prices have changed', mk: 'Цените се променија' },
  'price.body': { nl: 'Controleer je nieuwe totaal voordat je betaalt.', en: 'Please check your new total before paying.', mk: 'Проверете го новиот вкупен износ пред да платите.' },
  'price.accept': { nl: 'Akkoord, verder', en: 'OK, continue', mk: 'Во ред, продолжи' },
  'price.back': { nl: 'Terug naar bestelling', en: 'Back to order', mk: 'Назад кон нарачката' },

  // Upsell
  'upsell.title': { nl: 'Nog iets lekkers erbij?', en: 'Anything else?', mk: 'Уште нешто?' },
  'upsell.add': { nl: 'Toevoegen', en: 'Add', mk: 'Додади' },
  'upsell.added': { nl: 'Toegevoegd', en: 'Added', mk: 'Додадено' },
  'upsell.skip': { nl: 'Nee, bedankt', en: 'No, thanks', mk: 'Не, благодарам' },
  'upsell.continue': { nl: 'Verder', en: 'Continue', mk: 'Продолжи' },
  'upsell.forLine': { nl: 'Bij {product}', en: 'With {product}', mk: 'Со {product}' },
  'upsell.pickDrink': { nl: 'Kies je drankje', en: 'Choose your drink', mk: 'Изберете пијалак' },
  'upsell.swap': { nl: 'Upgrade voor {delta}', en: 'Upgrade for {delta}', mk: 'Надгради за {delta}' },

  // Order tag
  'tag.table.title': { nl: 'Welk bordjesnummer heb je?', en: 'What is your table sign number?', mk: 'Кој е бројот на вашата табла?' },
  'tag.table.help': { nl: 'Neem een bordje van de balie en voer het nummer in.', en: 'Take a sign from the counter and enter its number.', mk: 'Земете табла од пултот и внесете го бројот.' },
  'tag.pager.title': { nl: 'Welk piepernummer heb je?', en: 'What is your pager number?', mk: 'Кој е бројот на вашиот пејџер?' },
  'tag.pager.help': { nl: 'Neem een pieper van de balie. We roepen je op als je bestelling klaar is.', en: 'Take a pager from the counter. We will buzz you when your order is ready.', mk: 'Земете пејџер од пултот. Ќе ве повикаме кога нарачката е готова.' },
  'tag.name.title': { nl: 'Op welke naam?', en: 'What name should we call?', mk: 'На кое име?' },
  'tag.name.help': { nl: 'We roepen deze naam om als je bestelling klaar is.', en: 'We will call this name when your order is ready.', mk: 'Ќе го повикаме ова име кога нарачката е готова.' },
  'tag.range': { nl: 'Nummer tussen {min} en {max}', en: 'Number between {min} and {max}', mk: 'Број помеѓу {min} и {max}' },
  'tag.err.range': { nl: 'Dat nummer bestaat niet. Kies tussen {min} en {max}.', en: 'That number does not exist. Choose between {min} and {max}.', mk: 'Тој број не постои. Изберете помеѓу {min} и {max}.' },
  'tag.err.length': { nl: 'Gebruik {min} tot {max} tekens.', en: 'Use {min} to {max} characters.', mk: 'Користете {min} до {max} знаци.' },
  'tag.err.blocked': { nl: 'Deze naam kunnen we niet omroepen. Kies een andere.', en: 'We can’t call that name. Please choose another.', mk: 'Не можеме да го повикаме тоа име. Изберете друго.' },
  'tag.err.chars': { nl: 'Alleen letters en cijfers.', en: 'Letters and numbers only.', mk: 'Само букви и бројки.' },
  'tag.skip': { nl: 'Overslaan', en: 'Skip', mk: 'Прескокни' },
  'tag.confirm': { nl: 'Bevestigen', en: 'Confirm', mk: 'Потврди' },
  'tag.label.table': { nl: 'Bordje', en: 'Table sign', mk: 'Табла' },
  'tag.label.pager': { nl: 'Pieper', en: 'Pager', mk: 'Пејџер' },
  'tag.label.name': { nl: 'Naam', en: 'Name', mk: 'Име' },

  // Payment
  'pay.title': { nl: 'Betalen', en: 'Payment', mk: 'Плаќање' },
  'pay.amount': { nl: 'Te betalen', en: 'Amount due', mk: 'За плаќање' },
  'pay.connecting': { nl: 'Verbinden met de betaalterminal…', en: 'Connecting to the card terminal…', mk: 'Поврзување со терминалот…' },
  'pay.waiting': { nl: 'Houd je kaart of telefoon bij de terminal', en: 'Hold your card or phone to the terminal', mk: 'Приближете ја картичката или телефонот до терминалот' },
  'pay.processing': { nl: 'Betaling wordt verwerkt…', en: 'Processing payment…', mk: 'Плаќањето се обработува…' },
  'pay.cancelRequested': { nl: 'Betaling wordt geannuleerd…', en: 'Cancelling payment…', mk: 'Плаќањето се откажува…' },
  'pay.approved': { nl: 'Betaling gelukt', en: 'Payment approved', mk: 'Плаќањето е одобрено' },
  'pay.submitting': { nl: 'Bestelling wordt doorgegeven aan de keuken…', en: 'Sending your order to the kitchen…', mk: 'Нарачката се испраќа до кујната…' },
  'pay.declined': { nl: 'Betaling geweigerd', en: 'Payment declined', mk: 'Плаќањето е одбиено' },
  'pay.declinedBody': { nl: 'Er is niets afgeschreven. Probeer een andere kaart of betaal aan de balie.', en: 'Nothing was charged. Try another card or pay at the counter.', mk: 'Ништо не е наплатено. Обидете се со друга картичка или платете на пултот.' },
  'pay.cancelled': { nl: 'Betaling geannuleerd', en: 'Payment cancelled', mk: 'Плаќањето е откажано' },
  'pay.cancelledBody': { nl: 'Er is niets afgeschreven.', en: 'Nothing was charged.', mk: 'Ништо не е наплатено.' },
  'pay.offline': { nl: 'Betaalterminal niet bereikbaar', en: 'Card terminal unavailable', mk: 'Терминалот не е достапен' },
  'pay.offlineBody': { nl: 'Er is niets afgeschreven. Probeer opnieuw te verbinden of vraag een medewerker.', en: 'Nothing was charged. Try reconnecting or ask a staff member.', mk: 'Ништо не е наплатено. Обидете се повторно или прашајте вработен.' },
  'pay.timeout': { nl: 'We weten nog niet of de betaling is gelukt', en: 'We can’t tell yet whether the payment went through', mk: 'Уште не знаеме дали плаќањето успеа' },
  'pay.timeoutBody': { nl: 'Betaal niet opnieuw. Controleer de status of vraag een medewerker.', en: 'Please don’t pay again. Check the status or ask a staff member.', mk: 'Не плаќајте повторно. Проверете го статусот или прашајте вработен.' },
  'pay.lookup': { nl: 'Betaalstatus controleren…', en: 'Checking payment status…', mk: 'Проверка на статусот на плаќањето…' },
  'pay.statusCheck': { nl: 'Vorige betaling controleren…', en: 'Checking a previous payment…', mk: 'Проверка на претходно плаќање…' },
  'pay.cancel': { nl: 'Annuleren', en: 'Cancel', mk: 'Откажи' },
  'pay.retry': { nl: 'Opnieuw proberen', en: 'Try again', mk: 'Обиди се повторно' },
  'pay.reconnect': { nl: 'Opnieuw verbinden', en: 'Reconnect', mk: 'Поврзи повторно' },
  'pay.backToOrder': { nl: 'Terug naar bestelling', en: 'Back to order', mk: 'Назад кон нарачката' },
  'pay.checkStatus': { nl: 'Controleer betalingsstatus', en: 'Check payment status', mk: 'Провери статус на плаќање' },
  'pay.callStaff': { nl: 'Vraag een medewerker', en: 'Ask a staff member', mk: 'Прашајте вработен' },
  'pay.storeFail': { nl: 'Dit apparaat kan de bestelling niet veilig opslaan. Vraag een medewerker.', en: 'This device cannot safely store the order. Please ask a staff member.', mk: 'Уредот не може безбедно да ја зачува нарачката. Прашајте вработен.' },

  // Recovery / assistance
  'recovery.title': { nl: 'Betaling ontvangen', en: 'Payment received', mk: 'Плаќањето е примено' },
  'recovery.body': { nl: 'Je bestelling wordt bevestigd — je hoeft niet opnieuw te betalen.', en: 'Your order is being confirmed — no need to pay again.', mk: 'Нарачката се потврдува — не плаќајте повторно.' },
  'recovery.ref': { nl: 'Referentie voor de medewerker', en: 'Reference for staff', mk: 'Референца за вработен' },
  'recovery.resend': { nl: 'Bestelling opnieuw versturen', en: 'Resend order', mk: 'Испрати повторно' },
  'assist.title': { nl: 'Een medewerker helpt je verder', en: 'A staff member will help you', mk: 'Вработен ќе ви помогне' },
  'assist.body': { nl: 'We konden de status van je betaling niet vaststellen. Betaal niet opnieuw.', en: 'We could not determine the status of your payment. Please don’t pay again.', mk: 'Не можевме да го утврдиме статусот на плаќањето. Не плаќајте повторно.' },

  // Done
  'done.title': { nl: 'Bedankt voor je bestelling!', en: 'Thank you for your order!', mk: 'Благодариме за нарачката!' },
  'done.orderNo': { nl: 'Bestelnummer', en: 'Order number', mk: 'Број на нарачка' },
  'done.tag.table': { nl: 'Zet bordje {value} op je tafel — we brengen het naar je toe.', en: 'Place sign {value} on your table — we’ll bring it over.', mk: 'Ставете ја таблата {value} на масата — ќе ви донесеме.' },
  'done.tag.pager': { nl: 'Pieper {value} gaat af als je bestelling klaar is.', en: 'Pager {value} will buzz when your order is ready.', mk: 'Пејџер {value} ќе ѕвони кога нарачката е готова.' },
  'done.tag.name': { nl: 'We roepen “{value}” om als je bestelling klaar is.', en: 'We’ll call “{value}” when your order is ready.', mk: 'Ќе повикаме „{value}“ кога нарачката е готова.' },
  'done.receipt.printing': { nl: 'Bon wordt geprint…', en: 'Printing receipt…', mk: 'Сметката се печати…' },
  'done.receipt.printed': { nl: 'Neem je bon mee.', en: 'Take your receipt.', mk: 'Земете ја сметката.' },
  'done.receipt.failed': { nl: 'De bon kon niet worden geprint. Vraag er een aan de balie.', en: 'The receipt could not be printed. Ask for one at the counter.', mk: 'Сметката не можеше да се испечати. Побарајте на пултот.' },
  'done.receipt.unknown': { nl: 'Geen bon? Vraag er een aan de balie.', en: 'No receipt? Ask for one at the counter.', mk: 'Нема сметка? Побарајте на пултот.' },
  'done.newOrder': { nl: 'Nieuwe bestelling', en: 'New order', mk: 'Нова нарачка' },
  'done.autoReset': { nl: 'Dit scherm sluit in {s} s', en: 'This screen closes in {s} s', mk: 'Екранот се затвора за {s} с' },
  'done.kitchenPending': { nl: 'Bestelling ontvangen — de keuken wordt op de hoogte gebracht.', en: 'Order accepted — the kitchen is being notified.', mk: 'Нарачката е примена — кујната се известува.' },

  // Connectivity (handover docs/07)
  'conn.waitSubmit': { nl: 'We maken opnieuw verbinding. Je bestelling is bewaard en wordt automatisch verstuurd.', en: 'We’re reconnecting. Your order is saved and will be sent automatically.', mk: 'Повторно се поврзуваме. Нарачката е зачувана и ќе се испрати автоматски.' },
  'conn.noAuthority': { nl: 'Bestellingen kunnen nu niet worden bevestigd. Je bestelling is bewaard — vraag een medewerker.', en: 'Orders can’t be confirmed right now. Your order is saved — please ask a staff member.', mk: 'Нарачките моментално не можат да се потврдат. Нарачката е зачувана — прашајте вработен.' },
  'conn.confirming': { nl: 'We bevestigen je bestelling bij het restaurant.', en: 'We’re confirming your order with the restaurant.', mk: 'Ја потврдуваме нарачката со ресторанот.' },
  'conn.paidPending': { nl: 'Betaling ontvangen. Je bestelling wordt bevestigd — je hoeft niet opnieuw te betalen.', en: 'Payment received. Your order is being confirmed — no need to pay again.', mk: 'Плаќањето е примено. Нарачката се потврдува — не плаќајте повторно.' },
  'conn.kitchenPending': { nl: 'Bestelling ontvangen — de keuken wordt op de hoogte gebracht.', en: 'Order accepted — the kitchen is being notified.', mk: 'Нарачката е примена — кујната се известува.' },
  'conn.status.local': { nl: 'Lokaal verbonden', en: 'Connected locally', mk: 'Локално поврзано' },
  'conn.status.standby': { nl: 'Verbonden met lokale standby', en: 'Connected to local standby', mk: 'Поврзано со локален резервен сервер' },
  'conn.status.cloud': { nl: 'Verbonden via Guestit Cloud', en: 'Connected through Guestit Cloud', mk: 'Поврзано преку Guestit Cloud' },
  'conn.status.reconnecting': { nl: 'Opnieuw verbinden…', en: 'Reconnecting…', mk: 'Повторно поврзување…' },
  'conn.status.noAuthority': { nl: 'Bestellingen kunnen niet worden bevestigd', en: 'Unable to confirm orders', mk: 'Нарачките не можат да се потврдат' },

  // Idle
  'idle.title': { nl: 'Ben je er nog?', en: 'Still there?', mk: 'Сè уште сте тука?' },
  'idle.body': { nl: 'Je bestelling wordt gewist over {s} seconden.', en: 'Your order will be cleared in {s} seconds.', mk: 'Нарачката ќе се избрише за {s} секунди.' },
  'idle.continue': { nl: 'Ik ben er nog', en: 'I’m still here', mk: 'Тука сум' },
  'idle.restart': { nl: 'Opnieuw beginnen', en: 'Start over', mk: 'Почни одново' },

  // Staff
  'staff.title': { nl: 'Medewerkersmenu', en: 'Staff panel', mk: 'Панел за вработени' },
  'staff.pin': { nl: 'Voer de pincode in', en: 'Enter the PIN', mk: 'Внесете PIN' },
  'staff.pinWrong': { nl: 'Onjuiste pincode', en: 'Wrong PIN', mk: 'Погрешен PIN' },
  'staff.close': { nl: 'Sluiten', en: 'Close', mk: 'Затвори' },

  // Generic
  'common.back': { nl: 'Terug', en: 'Back', mk: 'Назад' },
  'common.ok': { nl: 'OK', en: 'OK', mk: 'Во ред' },
  'common.loading': { nl: 'Laden…', en: 'Loading…', mk: 'Вчитување…' },
  'common.error': { nl: 'Er ging iets mis.', en: 'Something went wrong.', mk: 'Нешто тргна наопаку.' },
  'common.delete': { nl: 'Wis', en: 'Delete', mk: 'Избриши' },
  'boot.failed': { nl: 'De kiosk kon niet starten. Vraag een medewerker.', en: 'The kiosk could not start. Please ask a staff member.', mk: 'Киоскот не можеше да стартува. Прашајте вработен.' },
}

export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = S[key]
  let s = entry ? (entry[lang] ?? entry.en) : key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
  }
  return s
}

export function l10n(value: L10n | undefined, lang: Lang): string {
  if (!value) return ''
  return value[lang] ?? value.en ?? Object.values(value)[0] ?? ''
}

export function hasKey(key: string): boolean {
  return key in S
}
