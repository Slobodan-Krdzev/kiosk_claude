
'use strict';
window.addEventListener('error', e=>{
  const h=document.getElementById('hint');
  if(h && !document.body.classList.contains('bare')){
    h.style.color='#e2574c'; h.textContent='⚠ '+(e.message||'script error'); }
});
/* homepage photography — supplied brand assets, optimised & embedded */
const ASSETS={
  hero:'ASSET(asset24.webp)',
  lychee:'ASSET(asset25.webp)',
  platter:'ASSET(asset26.webp)',
  plateSal:'ASSET(asset27.webp)',
  nigUna:'ASSET(asset28.webp)',
  fries:'ASSET(asset29.webp)',
  pokeSal:'ASSET(asset30.webp)',
  plateTer:'ASSET(asset31.webp)',
  rice:'ASSET(asset32.webp)',
};

ASSETS.lycheePromo='ASSET(asset33.webp)'; ASSETS.platterPromo='ASSET(asset34.webp)';
const ASSETS2={
  salRoll:'ASSET(asset35.webp)',
  craRoll:'ASSET(asset36.webp)',
  vegRoll:'ASSET(asset37.webp)',
  nigSal:'ASSET(asset38.webp)',
  pokeChick:'ASSET(asset39.webp)',
  pokeVeg:'ASSET(asset40.webp)',
  pokeShr:'ASSET(asset41.webp)',
  plateBeef:'ASSET(asset42.webp)',
  bibim:'ASSET(asset43.webp)',
  bulgogi:'ASSET(asset44.webp)',
  sbVeg:'ASSET(asset45.webp)',
  tonkotsu:'ASSET(asset46.webp)',
  misoRam:'ASSET(asset47.webp)',
  vegRam:'ASSET(asset48.webp)',
  greenCur:'ASSET(asset49.webp)',
  katsu:'ASSET(asset50.webp)',
  redCur:'ASSET(asset51.webp)',
  gyoza:'ASSET(asset52.webp)',
  springR:'ASSET(asset53.webp)',
  edamame:'ASSET(asset54.webp)',
  kimchi:'ASSET(asset55.webp)',
  crackers:'ASSET(asset56.webp)',
  misoSoup:'ASSET(asset57.webp)',
  cola:'ASSET(asset58.webp)',
  colazero:'ASSET(asset59.webp)',
  sprite:'ASSET(asset60.webp)',
  water:'ASSET(asset61.webp)',
  oj:'ASSET(asset62.webp)',
  greentea:'ASSET(asset63.webp)',
  mochi:'ASSET(asset64.webp)',
  matcha:'ASSET(asset65.webp)',
  mangoR:'ASSET(asset66.webp)',
  banana:'ASSET(asset67.webp)',
};
ASSETS2.ddbowlImg='ASSET(asset68.webp)';
ASSETS2.gyozaCut=ASSETS2.gyoza; ASSETS2.springRCut=ASSETS2.springR; ASSETS2.edamameCut=ASSETS2.edamame;
ASSETS.platterPromo=ASSETS2.ddPlatter;
ASSETS2.ddPlatter='ASSET(asset69.webp)';
ASSETS2.steakPlate='ASSET(asset70.webp)';
ASSETS2.riceSide='ASSET(asset71.webp)';
ASSETS2.xSalmon='ASSET(asset72.webp)';
ASSETS2.xAvocado='ASSET(asset73.webp)';
ASSETS2.xMayo='ASSET(asset74.webp)';
ASSETS2.gyozaCut='ASSET(asset75.webp)';
ASSETS2.edamameCut='ASSET(asset76.webp)';
ASSETS2.springRCut='ASSET(asset77.webp)';
ASSETS2.menuCombo='ASSET(asset78.webp)';
ASSETS2.pokeSalCut='ASSET(asset79.webp)';

/* ══════════════════════════════════════════════════════════════
   1 · CUSTOMER THEME — everything brand-specific lives here.
       Swap this object → same engine, different restaurant.
   ══════════════════════════════════════════════════════════════ */
const BRAND = {
  id:'dadawan', name:'DADAWAN',
  /* authentic supplied logo (black on transparent) — inverted on dark media */
  logoImg:'ASSET(asset80.png)',
  brandGraphic:'https://dadawan.nl/wp-content/uploads/2024/04/DADAWAN-kommenstapel-white_Tekengebied-1-650x1024.png',
  fonts:{ head:"'Bebas Neue','Inter',sans-serif", body:"'Inter',system-ui,sans-serif" },
  colors:{ paper:'#F5F0E4', pbright:'#20C991', card:'#FFFDF8', ink:'#1A1915', mute:'#6E6A5F',
    line:'#E7E1D2', shade:'#EDE7D9', primary:'#0F6B4F', primarysoft:'#E3EFE7',
    gold:'#C49A3A', ember:'#C43D2C', cream:'#F3EDE0' },
  radiusBtn:'999px',
  typography:{ displayFont:'Bebas Neue', bodyFont:'Inter', accentFont:'Caveat' },
  layout:{ sidebarWidth:240, basketOverlap:16, contentPadding:20, gridColumns:3, gridGap:24,
    heroHeight:450, promoHeight:300, productImageHeight:196, basketBottom:32, basketHeight:88 },   /* v34: compact promo, products sooner in view */
  motion:{ heroInterval:7000, heroFade:650, screenTransition:260, categoryIndicator:250,
    filterIndicator:200, cardEntrance:320, cardFast:240, gridStagger:26,
    addConfirm:400, fieldXfade:160, addNote:900, containerTransform:520, containerClose:380, contentStagger:45, pdpBarFade:200, reqHighlight:1400,
    basketEntrance:240, basketExit:160, quickAddLock:225 },
  /* attract-screen media — mode: 'image' | 'slider' | 'video' */
  assetVersion:'2026-09-16',                 /* bump in the CMS → remote branding is re-fetched and re-validated */
  hero:{
    mode:'slider', interval:7000,
    height:450, contentFocalPoint:{ x:72, y:50 }, textSafeWidth:58,
    images:[
      'https://dadawan.nl/wp-content/uploads/2026/07/dadawan-mix-food-scaled.jpg',
      'https://dadawan.nl/wp-content/uploads/2026/08/dadawan-worldly-food-small-town-prices-scaled.jpg',
      'https://dadawan.nl/wp-content/uploads/2024/08/dadawan-arnhem-gele-rijders-plein-1024x683.jpg',
    ],
    video:'', /* set an MP4 URL + mode:'video' for a background loop */
  },
  copy:{
    headline:{ en:'ASIAN\nFLAVORS\nBOLDER\nTOGETHER', nl:'ASIAN\nFLAVORS\nBOLDER\nTOGETHER', mk:'ASIAN\nFLAVORS\nBOLDER\nTOGETHER' },
    sub:{ en:'GOOD FOOD\nBRIGHTER DAYS', nl:'GOOD FOOD\nBRIGHTER DAYS', mk:'GOOD FOOD\nBRIGHTER DAYS' },
    logoTagline:'ASIAN KITCHEN',
    sideNote:'FRESH\nASIAN\nFLAVORS\nEVERY\nDAY',
    tagline:'WORLDLY FOOD · SMALL TOWN PRICES',
  },
  languages:['nl','en','mk'], defaultLanguage:'nl',
  orderTypes:['eatin','takeaway'], defaultOrderType:'takeaway',
  features:{ voucher:true, visualUpsells:true, loyalty:true },
  /* sidebar background — per restaurant: image OR solid color */
  sidebar:{
    backgroundType:'image',            /* 'image' | 'color' */
    backgroundImage:'https://dadawan.nl/wp-content/uploads/2026/08/dadawan-worldly-food-small-town-prices-scaled.jpg',
    backgroundColor:'#101511',
    backgroundPosition:'center',
    focalPoint:{ x:50, y:50 },     /* which part of the upload stays visible */
    overlayColor:'#191713', overlayOpacity:.58,
  },
  /* gamification: order-value reward (nudge toward larger baskets) */
  reward:{ threshold:25, pid:'mochi', variant:{ choices:{ mochiFl:'mMat' } } },   /* the gift is a fixed, pre-configured variant */
  sessionSettings:{ inactivityTimeoutMs:75000, inactivityWarningMs:15000 },
  adminPin:'2580',                            /* DEMO ONLY: production uses the auth adapter */
  cleaning:{ enabled:true },                  /* screen-cleaning mode, switchable in the staff settings */
  serviceModes:{ eatin:{ delivery:'counter' }, takeaway:{ delivery:'counter' } },   /* 'counter' | 'table-tracker' | 'table-number' | 'staff-procedure' */
  analytics:{ enabled:true },
  connectionSettings:{ serverUrl:'http://guestit.local', pingMs:600, bootGiveUpMs:12000, retryMs:[1000,2000,4000,8000], sessionTtlMs:180000 },
  paymentSettings:{ connectMs:700, cardWaitMs:2600, processingMs:1400, terminalTimeoutMs:20000,
                    lookupMs:1400, submitMs:900, doneCountdownS:15 },
};


/* ══════════════════════════════════════════════════════════════
   BRAND PRESETS (v33) — one engine, several restaurants. Pick with ?brand=<id> or window.GuestitConfig.brand.
   A preset only changes look & feel (logo, colours, type, brand copy, sidebar); menu, prices and flows stay the same.
   ══════════════════════════════════════════════════════════════ */
const BRAND_PRESETS={
  sojubar:{
    id:'sojubar', name:'SOJUBAR',
    /* PLACEHOLDER wordmark: "SOJUBAR" set in Bebas Neue, converted to outlines, Sojubar blue — replace with the official logo file */
    logoImg:'ASSET(asset81.svg)', logoFilter:'brightness(1)',
    brandGraphic:'',
    colors:{ paper:'#EEF2F4', pbright:'#5DB3E6', card:'#FFFFFF', ink:'#0B0B0B', mute:'#666C72', line:'#DCE3E8', shade:'#E6ECF0',
      primary:'#0B0B0B', primarysoft:'#E3F1FB', gold:'#E4479B', ember:'#D7262E', cream:'#FFFFFF' },
    typography:{ displayFont:'Bebas Neue', bodyFont:'Inter', accentFont:'Bebas Neue' },
    copy:{ headline:{ en:'MADE\nFOR\nSHARING', nl:'MADE\nFOR\nSHARING', mk:'MADE\nFOR\nSHARING' },
      sub:{ en:'LUNCH, DINNER\nDRINKS', nl:'LUNCH, DINNER\nDRINKS', mk:'LUNCH, DINNER\nDRINKS' },
      subIcon:'', logoTagline:'KOREAN FRIED CHICKEN & BEER', sideNote:'CRISPY\nJUICY\nTASTY', tagline:'LUNCH · DINNER · DRINKS' },
    sidebar:{ backgroundType:'color', backgroundColor:'#000000', overlayOpacity:0 },
  },
};
(function(){ let id=null; try{ id=new URLSearchParams(location.search).get('brand'); }catch(e){}
  id=id||(window.GuestitConfig&&window.GuestitConfig.brand)||null;
  const pre=id&&Object.prototype.hasOwnProperty.call(BRAND_PRESETS,id)?BRAND_PRESETS[id]:null; if(!pre) return;
  const merge=(a,b)=>{ for(const k of Object.keys(b)){ const v=b[k];
    if(v&&typeof v==='object'&&!Array.isArray(v)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k])) merge(a[k],v); else a[k]=v; } return a; };
  merge(BRAND,JSON.parse(JSON.stringify(pre)));
})();
function applyBrand(){
  const R=document.documentElement.style, hx=h=>{const n=parseInt(h.slice(1),16);
    return `${n>>16&255} ${n>>8&255} ${n&255}`; };
  for(const [k,v] of Object.entries(BRAND.colors)) R.setProperty('--c-'+k,hx(v));
  R.setProperty('--f-head',`'${BRAND.typography.displayFont}','${BRAND.typography.bodyFont}',sans-serif`);
  R.setProperty('--f-body',`'${BRAND.typography.bodyFont}',system-ui,sans-serif`);
  R.setProperty('--f-accent',`'${BRAND.typography.accentFont}',cursive`);
  R.setProperty('--m-herofade',BRAND.motion.heroFade+'ms');
  R.setProperty('--m-barin',BRAND.motion.basketEntrance+'ms');
  R.setProperty('--m-barout',BRAND.motion.basketExit+'ms');
  R.setProperty('--m-xfade',BRAND.motion.fieldXfade+'ms');
  R.setProperty('--m-ct',BRAND.motion.containerTransform+'ms');
  R.setProperty('--m-barfade',BRAND.motion.pdpBarFade+'ms');
  R.setProperty('--r-btn',BRAND.radiusBtn);
  document.title = BRAND.name+' — Self-order kiosk';
  document.documentElement.classList.add('brand-'+BRAND.id);   /* brand-specific look (v33) */
}
applyBrand();

/* ══════════════════════════════════════════════════════════════
   2 · ICONS (stroke set, engine-owned)
   ══════════════════════════════════════════════════════════════ */
const P={
  star:'m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8Z',
  bowl:'M4 11h16a8 8 0 0 1-16 0Zm3.5-2 8-5M11 9l6.5-4',
  plate:'M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-4a4 4 0 1 1 0-8',
  sushi:'M4 13c0-2.8 3.6-5 8-5s8 2.2 8 5-3.6 5-8 5-8-2.2-8-5Zm4-.4c0-1.2 1.8-2.1 4-2.1s4 .9 4 2.1',
  ramen:'M4 12h16a8 8 0 0 1-16 0Zm4-3.5V5m4 3.5V4m4 4.5V5',
  curry:'M5 12h14M7 12a5 5 0 0 0 10 0M3 12h2m14 0h2M9 8.5c0-1 .8-1 .8-2S9 5.5 9 4.5m4 4c0-1 .8-1 .8-2s-.8-1-.8-2',
  skewer:'M12 21V8M12 8l-2.5-2.5M12 8l2.5-2.5M9 11h6M8.5 14.5h7',
  cup:'M6 4h11l-1 9.5a4 4 0 0 1-4 3.5h-1a4 4 0 0 1-4-3.5Zm11 2h2.6a1 1 0 0 1 1 1.2l-.5 2.4a2 2 0 0 1-2 1.6H16M8 21h7',
  cake:'M4 20h16M5 20v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6M12 11V8m0 0c1.2 0 2-.9 2-2 0-1.4-2-3-2-3S10 4.6 10 6c0 1.1.8 2 2 2Z',
  cart:'M3 4h2.2l2.4 11.2a2 2 0 0 0 2 1.8h7.9a2 2 0 0 0 2-1.6L21 8H6.2M9.6 21a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm8.2 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
  chevL:'m14.5 5.5-6 6.5 6 6.5', chevR:'m9.5 5.5 6 6.5-6 6.5',
  arrR:'M4 12h15m0 0-6-6m6 6-6 6', arrL:'M20 12H5m0 0 6-6m-6 6 6 6',
  plus:'M12 5v14M5 12h14', minus:'M5 12h14',
  wipe:'M4 19.5h16M6.5 16.5l7.8-7.8a2.6 2.6 0 0 1 3.7 0l1.8 1.8a2.6 2.6 0 0 1 0 3.7l-2.4 2.3H6.5z',
  trash:'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5m4-5v5',
  pencil:'M4 20l4.2-.9L19.6 7.7a2 2 0 0 0 0-2.9l-.4-.4a2 2 0 0 0-2.9 0L4.9 15.8Z',
  info:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5v-5m0-3.4v-.2',
  globe:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0c2.6-2.2 4-5.4 4-9s-1.4-6.8-4-9c-2.6 2.2-4 5.4-4 9s1.4 6.8 4 9ZM3.5 12h17',
  check:'m5 13 4.5 4.5L19 7.5', x:'M6 6l12 12M18 6 6 18',
  bag:'M6.5 8h11l1 12.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Zm2.5 0V6a3 3 0 0 1 6 0v2',
  dish:'M8 3v7c0 1-.7 1.6-1.5 1.6S5 11 5 10V3m1.5 0v18M18 3c-1.7.8-3 2.8-3 5.5 0 2 .8 3 1.9 3.5V21M18 3v18',
  card:'M3 6.5h18v11H3Zm0 3.5h18M6.5 14H10',
  heart:'M12 20.6s-8-4.9-8-10.6A4.5 4.5 0 0 1 12 7.4a4.5 4.5 0 0 1 8 2.6c0 5.7-8 10.6-8 10.6Z',
  gift:'M4 11h16v10H4Zm-1-4h18v4H3Zm9 0v14M12 7c-1.2-2.6-5-3.8-5-1.3C7 7 9.6 7 12 7Zm0 0c1.2-2.6 5-3.8 5-1.3C17 7 14.4 7 12 7Z',
  coin:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13.6 1.4 2.9 3.2.4-2.3 2.2.6 3.2-2.9-1.6-2.9 1.6.6-3.2-2.3-2.2 3.2-.4Z',
};
const ic=(n,cls='',sw=2.1)=>`<svg viewBox="0 0 24 24" class="${cls}" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision"><path d="${P[n]}"/></svg>`;
const icQR=`<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm12-2h2v2h-2v-2Zm2 2h2v2h-2v-2Zm-2 2h2v2h-2v-2Zm-2-2h2v2h-2v-2Zm0 4h2v4h-2v-4Zm4 2h4v2h-4v-2Zm2-4h2v2h-2v-2Z"/></svg>`;

/* ══════════════════════════════════════════════════════════════
   3 · I18N — engine strings (brand copy lives in BRAND.copy)
   ══════════════════════════════════════════════════════════════ */
const I18N={
en:{
  start:'Start ordering', eatIn:'Dine in', takeAway:'Takeaway',
  voucherT:'Have a voucher?', voucherS:'Scan your code',
  voucherBody:'Hold your voucher code under the scanner next to the screen. Your discount is applied instantly.',
  inCartA:'{name}: {n} in your order — open to change or add another', 
  
  
  chooseA:'Choose — {name}', soldOutA:'Sold out — {name}', sizeT:'Size', sizeA:'{name}, size {size}', oneLess:'One less', oneMore:'One more', removeItem:'Remove', inOrderA:'{name}: {n} in your order',
  maxQtyA:'Maximum {n} per item', unavailPart:'{name} is sold out', unavailPartsB:'These are part of your menu: {list}',
  changeDrink:'Choose another drink', removePart:'Remove {name}', blockedUnavail:'Sold out: {list}', blockedChoice:'Make your required choices first',
  blockedQty:'Adjust the quantity first', blockedPrice:'Confirm the changed prices first', blockedConn:'Waiting for the restaurant system',
  giftLabel:'Gift from us', giftFixed:'Fixed combination', priceChangedAgain:'The prices changed again',
  adjustIngr:'Adjust ingredients', adjustBtn:'Adjust', maxReached:'Maximum {n}×', qtyOfA:'{name}: {n} in your order',
  drinkUpgradeT:'Make your menu even better', drinkUpgradeS:'Upgrade your drink.', drinkInclT:'Included with your menu', drinkInclS:'No extra charge.',
  drinkPickedT:'Your choice: {name}', drinkPickedS:'Choosing another drink replaces your current choice.', inclLabel:'Included', menuSummary:'Gyoza + drink of your choice', menuRemove:'Remove',
  backToProduct:'Back to product', noChanges:'No changes made', backAfterConfirm:'You will return to your product', confirmChoices:'Confirm choices', continueBtn:'Continue', alReset:'Reset all filters', alActive:'{n} active',
  needChoice:'Choose {label}', chooseFlavour:'Choose a flavour for your gift', alUnknown:'No allergen information — to be verified by the restaurant',
  alForOrder:'For your composition', alFilterHint:'Hides products that CONTAIN the selected allergens. Products that may contain traces stay visible.',
  alCartClash:'Your order contains products with an allergen you are now filtering: {names}. Check them before you pay.', alEmpty:'No products match this filter', alChange:'Change filter',
  reqLabel:'required', optLabel:'optional', chooseBtn:'Choose', fromPrice:'from {price}', plusPrice:'+ {price} as a menu', menuPriceA:'Menu {price}', menuBaseA:'dish only {price}', menuInclA:'incl. {what}', voucherDemo:'Demo: vouchers are not connected in this kiosk',
  cancelReqT:'Cancelling payment…', cancelReqB:'The kiosk is waiting for the card terminal to confirm that nothing was charged.',
  availCheckT:'Checking availability and prices…', availFailT:'Could not verify availability', availFailB:'The kiosk could not confirm prices and availability. Try again in a moment or ask a staff member.',
  catalogInvalidT:'Menu data needs attention', catalogInvalidB:'Some items are hidden until the restaurant corrects them.', lineInvalid:'This item can no longer be ordered as configured',
  prodBlockT:'Kiosk not ready', prodBlockB:'Required integrations are missing: {list}. Ask a staff member.', demoBadge:'DEMO',
  payStoreFail:'Payment cannot start: the kiosk could not save the order safely. Ask a staff member.',
  statusCheckT:'Checking the payment status…', statusCheckB:'A payment may have been in progress. The kiosk asks the payment service before anything else happens.',
  orderAccepted:'Order accepted', orderPending:'Order is being registered…', receiptPrinted:'Receipt printed', receiptFailed:'Receipt could not be printed — show your number at the counter', receiptPrinting:'Printing receipt…',
  pickupCounter:'Pick up your order at the counter when your number is called.', refT:'Reference',
  connBootT:'Connecting to the restaurant system…', connBootS:'Attempt {n}', connFailT:'The restaurant system is not reachable', connFailB:'Please ask a staff member. The kiosk will keep trying.',
  connRetry:'Try again', connLost:'Connection is being restored — your order is kept', connBack:'Connection restored', connPayBlock:'Payment is not possible while the connection is being restored',
  cleanT:'Cleaning the screen', cleanB:'Clean the screen hygienically: wipe it with a disinfectant screen wipe, including the edges. Touch is disabled while cleaning.',
  cleanDone:'Finished cleaning', cleanOpen:'Clean the screen', cleanOn:'Cleaning mode: on', cleanOff:'Cleaning mode: off', cleanToggle:'Switch cleaning mode',
  connResync:'Checking availability and prices…', adminT:'Staff settings', adminPin:'Enter PIN', adminWrong:'Wrong PIN', adminServer:'Server', adminClose:'Close',
  obMultiA:"{q} in your order, {cfg} — change quantity", r44NoneSel:"Nothing chosen", svcChange:"Change", svcChangeA:"Change eat in / take away",
  tag_nameBad:"Please choose a different name", tag_admin:"Order identification", tag_m_none:"None", tag_m_pager:"Pager", tag_m_table:"Table sign", tag_m_name:"Name", tag_adminDemo:"Demo: this choice is kept on this device; in production it comes from the backend", tag_adminProd:"Set in the backend", tag_tableT:"Where are you sitting?", tag_tableS:"Take a numbered table sign next to the kiosk, enter its number and put the sign on your table. We will bring your order to you.", tag_tableL:"Table sign", tag_pagerT:"Take a pager", tag_pagerS:"Take a pager next to the kiosk and enter the number on it. It buzzes when your order is ready; then collect it at the counter.", tag_pagerL:"Pager", tag_nameT:"What is your name?", tag_nameS:"We will call your name when your order is ready.", tag_nameL:"Name", tag_namePh:"Your name", tag_range:"Enter a number from {min} to {max}", tag_nameNeed:"Enter your name to continue", tag_nameMin:"Enter at least {n} letters", tag_go:"Continue to payment", tag_skip:"Skip", tag_clear:"Clear", tag_del:"Delete", tag_space:"Space", tag_kbSwitch:"Switch alphabet", tag_padA:"Number keypad", tag_kbA:"Keyboard", tag_doneTable:"Put table sign {v} on your table. We will bring your order as soon as it is ready.", tag_donePager:"Your pager ({v}) buzzes as soon as your order is ready. Then collect it at the counter.", tag_doneName:"We will call you, {v}, as soon as your order is ready.",
  lty_btn:"Earn & rewards", lty_nav:"Rewards", lty_sub:"Trade your points for free treats", lty_scanT:"Scan to log in", lty_scanS:"Open the DADAWAN app and scan this code with your phone.", lty_wait:"Waiting for your scan…", lty_expired:"This code has expired", lty_newCode:"New code", lty_demo:"Demo · simulate scan:", lty_welcome:"Welcome {name}", lty_welcomeB:"You are now logged in and can see and redeem your points right away.", lty_points:"{n} points", lty_ptsAvail:"points available", lty_ptsShort:"points", lty_toRewards:"See your rewards", lty_logout:"Log out", lty_hi:"Hi {name}", lty_loginT:"Log in to earn & redeem", lty_loginS:"Scan the QR code with the DADAWAN app", lty_loginBtn:"Log in with QR", lty_login:"Log in to redeem", lty_redeem:"Redeem", lty_inOrder:"In your order", lty_undoA:"Remove {name} from your order", lty_short:"{n} points to go", lty_free:"Free", lty_offShort:"off", lty_freeN:"Free {name}", lty_offN:"{p}% off {name}", lty_used:"{n} points reserved in this order", lty_line:"Reward", lty_lineS:"{n} points", lty_noPts:"Not enough points (or logged out) — remove the reward.", lty_doneS:"{spent} points redeemed · +{earned} earned · balance {bal}", lty_doneE:"+{earned} points earned · balance {bal}", lty_saving:"Updating your points…", lty_later:"Your points will be updated shortly.", lty_errT:"Logging in failed", lty_err:"Logging in isn't possible right now. Try again, or simply order without logging in.", lty_retry:"Try again", lty_nIn:"{n}× in your order", lty_moreA:"One more {name}", lty_lessA:"One less {name}", lty_max:"max {n}× per order", lty_progLoading:"Loading rewards…", lty_progErr:"Rewards can't be loaded right now.", lty_progEmpty:"There are no rewards available right now.", lty_rewardGone:"A reward in your order has changed or is no longer available — remove it.", lty_placeOrder:"Place order", lty_noCharge:"No payment needed", lty_sendingT:"Sending your order", cm_tabGifts:"My rewards", cm_tabShop:"Points shop", cm_apply:"Apply", cm_applied:"Applied", cm_removeA:"Stop applying {name}", cm_addX:"Add {name}", cm_goCat:"Go to {name}", cm_needItem:"Valid with {name} in your order", cm_needCat:"Valid with something from {name}", cm_needSpend:"{amount} more to use this reward", cm_short:"{amount} to go", cm_notNow:"Not applicable to this order", cm_validUntil:"Valid until {d}", cm_noGifts:"No rewards waiting right now. Redeem your points in the points shop.", cm_toShop:"Go to the points shop", cm_punchLeft:"{n} more to {reward}", cm_credit:"{amount} credit", cm_forYou:"Just for you, {name}", cm_add:"Add", cm_join:"Earn points with this order", cm_joinS:"Log in with the QR code and use your rewards", cm_earn:"You earn {n} points with this order", cm_calc:"Calculating your discounts…", cm_err:"Discounts can't be applied right now — you can simply order.", cm_wallet:"Pay with your credit", cm_walletS:"{amount} available", cm_subtotal:"Subtotal", cm_discount:"Discount", cm_src_deal:"Member deal", cm_src_asset:"Reward", cm_src_wallet:"Credit", cm_giftsReady:"{n} rewards are waiting for you", cm_saved:"You saved {amount}", cm_suggest:"Use a reward", obCountA:"{q} in your order — change quantity", obChooseA:"{name}: choose options", obLess:"One less", obRemove:"Remove", obMore:"One more", obAddA:"Add {name}", obAdded:"{name} added", obPlus1:"+1 {name} · {opts}", obPlus1n:"+1 {name}", obNoFilter:"not in your filter", obFilterA:"{name}: not in your filter", obLocked:"Your order is being processed", obVarA:"Add {name} {size} — {price}", obVarAq:"{name} {size}: {q} in your order — add one more", obFrom:"from", obSave:"Save {amount}", r44Req:"Required", r44Opt:"Optional", r44Size:"Size", r44Base:"Base size", r44DiffG:"+ {g} g for + {price}", r44Rec:"Recommended", r44AllEx:"See all extras ({n})", r44Allerg:"Allergens & info", r44AllergS:"Ingredients, allergens and nutrition", r44Pair:"Goes well with", r44Save:"Save", r44Direct:"Order now", r44Add:"Add", r44SelSize:"Selected size · {size}", r44Price:"Price", r44Need:"Make a choice first: {group}", r44NeedDrink:"Choose a drink for your menu", r44Blocked:"Doesn't match your allergens/preferences",
  howOrder:'How would you like to order?', rw_added:'Free {name} added', rw_gone:'Free {name} removed — order below {amt}', rw_gift:'Gift',
  alContains:'Contains', alTraces:'May contain traces of', alRemovable:'Ingredient can be left out', alRemovableNote:'Leaving an ingredient out does not guarantee the allergen is removed.',
  alFilterT:'Allergen filter', alFilterS:'Hide products that contain…', alFilterNote:'This filter is an aid, not a safety guarantee. Always tell a staff member about a serious allergy.',
  alFilterBtn:'Allergens', alFilterOn:'{n} hidden', alNone:'No allergens registered', alClear:'Clear filter',
  menuLbl:'Menu', navHome:'Home', homeT:'Featured', newIn:'New in', seeAll:'See all',
  cat_popular:'Popular', cat_pokewan:'Poké Wan', cat_stoneplate:'Stone Plate',
  cat_stonebowl:'Stone Bowl', cat_sushi:'Sushi', cat_ramen:'Japanese Ramen',
  cat_curry:'Curry', cat_sides:'Side Dishes', cat_drinks:'Drinks', cat_desserts:'Desserts',
  f_all:'All', f_maki:'Maki', f_nigiri:'Nigiri', f_special:'Specials',
  comboTileT:'Make it a combo', comboTileS:'2 gyoza + drink',
  makeCombo:'Make it a combo', comboIncl:'2 gyoza + drink of your choice',
  summaryCombo:'Menu', chooseDrink:'Choose your drink',
  customize:'Make it yours', yourWay:'Exactly the way you like it',
  allergens:'Allergens & info', optional:'Optional', free:'Free',
  addToOrder:'In my order', updateOrder:'Save changes',
  viewOrder:'View order', item:'item', items:'items',
  vuAdded:'Added', vuChoose:'Choose this', vuChosen:'Chosen', vuMenuAdded:'Menu added',
  back:'Back', basePrice:'Base price', qty:'Quantity', addBtnOrder:'Add to order',
  priceBase:'Base', priceExtras:'Extras', showAll:'Show all', showLess:'Show fewer',
  reqHint:'Choose an option to continue', reqMark:'required', menuDrink:'Choose your drink', menuDrinkS:'Choose 1 drink for your menu.',
  discardT:'Discard changes?', discardB:'Your selection for this product has not been added yet.',
  discardKeep:'Keep building', discardYes:'Discard changes',
  assistT:'Employee assistance required', assistB:'A payment may have been made. This screen stays protected until an employee resolves it.',
  assistData:'Recovery data could not be read. The raw record has been kept for diagnostics.', crashT:'Something went wrong', crashB:'Nothing has been charged. Start again to continue.', crashRestart:'Start again',
  unavailOpen:'This product is sold out right now.', fsAction:'Fullscreen',
  delLinkedT:'Remove product and side dishes?', delLinkedB:'{name} has {n} linked side dishes.', delLinkedB1:'{name} has 1 linked side dish.',
  delAll:'Remove everything', delMainOnly:'Remove main product only', delKeepSides:'Keep side dishes', xsLoose:'Side dish',
  priceChangedT:'A price has changed', priceChangedB:'The current price of {name} is {price} (was {old}).', priceConfirm:'Confirm new price',
  xsWith:'On the side with', extraPortion:'Extra portion', xsConflictT:'You already selected extra {name}.',
  xsKeep:'Keep as extra portion', xsDrop:'Remove extra portion', showAllX:'View all extras',
  priceBreakdown:'View price breakdown', priceProduct:'Product + extras', priceSide:'On the side', pcs:'pcs',
  qtyLabelPortion:'{n} pieces',
  yourOrder:'Your order', edit:'Edit', addMore:'Add more items',
  total:'Total', inclVat:'Incl. VAT', goPay:'Go to payment',
  sweetT:'Something sweet?', sweetS:'Mochi, matcha or mango to finish',
  drinkT:'Something to drink?', drinkS:'Sodas, juices and iced tea',
  viewDess:'View desserts', viewDrinks:'View drinks',
  emptyT:'Your order is still empty', emptyS:'Pick something delicious from the menu', browse:'Browse the menu',
  cancelOrder:'Cancel order', cancelQ:'Cancel this order?', cancelB:'Your current selection will be removed.',
  keepOrder:'Keep ordering', yesCancel:'Yes, cancel',
  payTitle:'Payment', followReader:'Follow the instructions on the card terminal below the screen',
  cancel:'Cancel', thanks:'Thank you! Enjoy your meal.', orderNo:'Your order number',
  printing:'Printing your receipt…',
  callNo:'We will call your number as soon as your order is ready.',
  bringTable:'Take your number with you — we will bring your order to your table.',
  newOrder:'New order', autoRestart:'New screen in',
  readyTerm:'Ready', tapTerm:'Present your card', okTerm:'Payment approved',
  idleT:'Are you still ordering?', idleB:'Your order will be cleared in {n} seconds.', idleGo:'Yes, continue', idleClear:'Clear order',
  payConnecting:'Connecting to the card terminal…', payProcessing:'Processing payment…', payApproved:'Payment approved',
  payDeclinedT:'Payment failed', payDeclinedB:'Nothing has been charged.', payRetry:'Try again', payOther:'Other payment method', payBack:'Back to order',
  payOfflineT:'Card terminal unreachable', payOfflineB:'Check the connection or try again.', payReconnect:'Reconnect',
  payTimeoutT:'No response from the card terminal', payTimeoutB:'First check whether the payment went through before trying again.',
  payCheck:'Check payment status', payChecking:'Checking payment status…', payNotCharged:'No payment was registered. You can try again.',
  payRecoverT:'Payment succeeded — restoring your order', payRecoverB:'You do not need to pay again.', payRef:'Reference', payRetrySubmit:'Retry sending the order',
  payCancelledT:'Payment cancelled', payAttempt:'Attempt', unavailT:'No longer available', unavailB:'This product is sold out. Remove it to continue.',
  unavailRemove:'Remove from order', unavailBlock:'Remove unavailable products to pay',
  b_pop:'Popular', b_new:'New', b_veg:'Veggie', b_spc:'Spicy', b_dea:'Deal', b_hal:'Halal',
  kcal:'kcal', perServing:'per serving', close:'Close',
  rw_prog:'{amt} to a free {name} 🎁', rw_line:'Free treat', popX:'Make it even better', addA:'Add {name}', removeA:'Remove {name}', qtyUp:'Increase quantity', qtyDown:'Decrease quantity', finishT:'Complete your meal', finishS:'Often ordered together', addBtn:'Add', promoOrder:'Order combo', promoView:'View deal',
},
nl:{
  start:'Start met bestellen', eatIn:'Hier eten', takeAway:'Meenemen',
  voucherT:'Heb je een voucher?', voucherS:'Scan je code',
  voucherBody:'Houd je vouchercode onder de scanner naast het scherm. Je korting wordt direct verrekend.',
  inCartA:'{name}: {n} in je bestelling — openen om te wijzigen of nog een toe te voegen', 
  
  
  chooseA:'Kies — {name}', soldOutA:'Uitverkocht — {name}', sizeT:'Formaat', sizeA:'{name}, formaat {size}', oneLess:'Eén minder', oneMore:'Eén meer', removeItem:'Verwijderen', inOrderA:'{name}: {n} in je bestelling',
  maxQtyA:'Maximaal {n} per item', unavailPart:'{name} is uitverkocht', unavailPartsB:'Dit hoort bij je menu: {list}',
  changeDrink:'Kies een ander drankje', removePart:'{name} verwijderen', blockedUnavail:'Uitverkocht: {list}', blockedChoice:'Maak eerst je verplichte keuzes',
  blockedQty:'Pas eerst het aantal aan', blockedPrice:'Bevestig eerst de gewijzigde prijzen', blockedConn:'Wachten op het restaurantsysteem',
  giftLabel:'Cadeautje van ons', giftFixed:'Vaste samenstelling', priceChangedAgain:'De prijzen zijn opnieuw gewijzigd',
  adjustIngr:'Pas ingrediënten aan', adjustBtn:'Aanpassen', maxReached:'Maximaal {n}×', qtyOfA:'{name}: {n} in je bestelling',
  drinkUpgradeT:'Maak je menu extra lekker', drinkUpgradeS:'Upgrade je drankje.', drinkInclT:'Inbegrepen bij je menu', drinkInclS:'Zonder meerprijs.',
  drinkPickedT:'Jouw keuze: {name}', drinkPickedS:'Een ander drankje kiezen vervangt je huidige keuze.', inclLabel:'Inbegrepen', menuSummary:'Gyoza + drankje naar keuze', menuRemove:'Verwijderen',
  backToProduct:'Terug naar product', noChanges:'Geen wijzigingen aangebracht', backAfterConfirm:'Je gaat terug naar je product', confirmChoices:'Bevestig keuzes', continueBtn:'Doorgaan', alReset:'Alle filters wissen', alActive:'{n} actief',
  needChoice:'Kies {label}', chooseFlavour:'Kies een smaak voor je cadeautje', alUnknown:'Geen allergeeninformatie — ter verificatie door het restaurant',
  alForOrder:'Voor jouw samenstelling', alFilterHint:'Verbergt producten die de gekozen allergenen BEVATTEN. Producten die sporen kunnen bevatten blijven zichtbaar.',
  alCartClash:'Je bestelling bevat producten met een allergeen dat je nu filtert: {names}. Controleer ze voordat je betaalt.', alEmpty:'Geen producten binnen dit filter', alChange:'Filter aanpassen',
  reqLabel:'verplicht', optLabel:'optioneel', chooseBtn:'Kies', fromPrice:'vanaf {price}', plusPrice:'+ {price} als menu', menuPriceA:'Menu {price}', menuBaseA:'los gerecht {price}', menuInclA:'incl. {what}', voucherDemo:'Demo: vouchers zijn in deze kiosk niet gekoppeld',
  cancelReqT:'Betaling wordt geannuleerd…', cancelReqB:'De kiosk wacht tot de betaalterminal bevestigt dat er niets is afgeschreven.',
  availCheckT:'Beschikbaarheid en prijzen worden gecontroleerd…', availFailT:'Beschikbaarheid kon niet worden gecontroleerd', availFailB:'De kiosk kon prijzen en beschikbaarheid niet bevestigen. Probeer het zo opnieuw of vraag een medewerker.',
  catalogInvalidT:'Menugegevens vragen aandacht', catalogInvalidB:'Sommige items zijn verborgen tot het restaurant ze corrigeert.', lineInvalid:'Dit item kan zo niet meer besteld worden',
  prodBlockT:'Kiosk niet gereed', prodBlockB:'Noodzakelijke koppelingen ontbreken: {list}. Vraag een medewerker.', demoBadge:'DEMO',
  payStoreFail:'Betalen kan niet starten: de kiosk kon de bestelling niet veilig opslaan. Vraag een medewerker.',
  statusCheckT:'Betaalstatus wordt gecontroleerd…', statusCheckB:'Er was mogelijk een betaling bezig. De kiosk vraagt eerst de betaalservice voordat er iets gebeurt.',
  orderAccepted:'Bestelling geaccepteerd', orderPending:'Bestelling wordt geregistreerd…', receiptPrinted:'Bon geprint', receiptFailed:'Bon kon niet worden geprint — toon je nummer aan de balie', receiptPrinting:'Bon wordt geprint…',
  pickupCounter:'Haal je bestelling op bij de balie zodra je nummer wordt omgeroepen.', refT:'Referentie',
  connBootT:'Verbinden met het restaurantsysteem…', connBootS:'Poging {n}', connFailT:'Het restaurantsysteem is niet bereikbaar', connFailB:'Vraag een medewerker om hulp. De kiosk blijft het proberen.',
  connRetry:'Opnieuw proberen', connLost:'Verbinding wordt hersteld — je bestelling blijft bewaard', connBack:'Verbinding hersteld', connPayBlock:'Betalen kan niet zolang de verbinding wordt hersteld',
  cleanT:'Scherm reinigen', cleanB:'Reinig het scherm hygiënisch: neem het af met een desinfecterend schermdoekje, ook langs de randen. Aanraken is uitgeschakeld tijdens het reinigen.',
  cleanDone:'Klaar met reinigen', cleanOpen:'Scherm reinigen', cleanOn:'Reinigingsmodus: aan', cleanOff:'Reinigingsmodus: uit', cleanToggle:'Reinigingsmodus omzetten',
  connResync:'Beschikbaarheid en prijzen worden gecontroleerd…', adminT:'Instellingen medewerker', adminPin:'Voer pincode in', adminWrong:'Onjuiste pincode', adminServer:'Server', adminClose:'Sluiten',
  obMultiA:"{q} in bestelling, {cfg} — aantal wijzigen", r44NoneSel:"Niets gekozen", svcChange:"Wijzigen", svcChangeA:"Hier eten / meenemen wijzigen",
  tag_nameBad:"Kies een andere naam", tag_admin:"Bestelling-herkenning", tag_m_none:"Geen", tag_m_pager:"Pieper", tag_m_table:"Bordje", tag_m_name:"Naam", tag_adminDemo:"Demo: deze keuze blijft bewaard op dit apparaat; in productie komt hij uit de backend", tag_adminProd:"Ingesteld in de backend", tag_tableT:"Waar ga je zitten?", tag_tableS:"Pak een bordje met een nummer naast de kiosk, vul het nummer in en zet het bordje op je tafel. Wij brengen je bestelling.", tag_tableL:"Bordje", tag_pagerT:"Pak een pieper", tag_pagerS:"Pak een pieper naast de kiosk en vul het nummer in dat erop staat. Hij gaat af zodra je bestelling klaar is; haal hem dan op bij de balie.", tag_pagerL:"Pieper", tag_nameT:"Op welke naam?", tag_nameS:"We roepen je naam om zodra je bestelling klaar is.", tag_nameL:"Naam", tag_namePh:"Je naam", tag_range:"Kies een nummer van {min} tot {max}", tag_nameNeed:"Vul je naam in om verder te gaan", tag_nameMin:"Vul minstens {n} letters in", tag_go:"Verder naar betalen", tag_skip:"Overslaan", tag_clear:"Wissen", tag_del:"Laatste teken wissen", tag_space:"Spatie", tag_kbSwitch:"Ander alfabet", tag_padA:"Cijfertoetsen", tag_kbA:"Toetsenbord", tag_doneTable:"Zet bordje {v} op je tafel. We brengen je bestelling zodra hij klaar is.", tag_donePager:"Je pieper ({v}) gaat af zodra je bestelling klaar is. Haal hem dan op bij de balie.", tag_doneName:"We roepen je om, {v}, zodra je bestelling klaar is.",
  lty_btn:"Spaar & beloningen", lty_nav:"Beloningen", lty_sub:"Wissel je punten in voor gratis lekkers", lty_scanT:"Scan om in te loggen", lty_scanS:"Open de DADAWAN-app en scan deze code met je telefoon.", lty_wait:"Wachten op je scan…", lty_expired:"Deze code is verlopen", lty_newCode:"Nieuwe code", lty_demo:"Demo · simuleer scan:", lty_welcome:"Welkom {name}", lty_welcomeB:"Je bent nu ingelogd en kunt rechtstreeks je punten zien en inwisselen.", lty_points:"{n} punten", lty_ptsAvail:"punten beschikbaar", lty_ptsShort:"punten", lty_toRewards:"Bekijk je beloningen", lty_logout:"Uitloggen", lty_hi:"Hoi {name}", lty_loginT:"Log in om te sparen & in te wisselen", lty_loginS:"Scan de QR-code met de DADAWAN-app", lty_loginBtn:"Inloggen met QR", lty_login:"Log in om in te wisselen", lty_redeem:"Inwisselen", lty_inOrder:"In je bestelling", lty_undoA:"{name} uit je bestelling halen", lty_short:"Nog {n} punten", lty_free:"Gratis", lty_offShort:"korting", lty_freeN:"Gratis {name}", lty_offN:"{p}% korting op {name}", lty_used:"{n} punten gereserveerd in deze bestelling", lty_line:"Beloning", lty_lineS:"{n} punten", lty_noPts:"Niet genoeg punten (of uitgelogd) — verwijder de beloning.", lty_doneS:"{spent} punten ingewisseld · +{earned} gespaard · saldo {bal}", lty_doneE:"+{earned} punten gespaard · saldo {bal}", lty_saving:"Je punten worden bijgewerkt…", lty_later:"Je punten worden zo snel mogelijk bijgewerkt.", lty_errT:"Inloggen lukt niet", lty_err:"Inloggen lukt op dit moment niet. Probeer het opnieuw, of bestel gewoon zonder in te loggen.", lty_retry:"Opnieuw proberen", lty_nIn:"{n}× in je bestelling", lty_moreA:"Nog een {name}", lty_lessA:"Eén {name} minder", lty_max:"max {n}× per bestelling", lty_progLoading:"Beloningen laden…", lty_progErr:"De beloningen kunnen nu niet geladen worden.", lty_progEmpty:"Er zijn op dit moment geen beloningen.", lty_rewardGone:"Een beloning in je bestelling is gewijzigd of niet meer beschikbaar — verwijder hem.", lty_placeOrder:"Bestelling plaatsen", lty_noCharge:"Geen betaling nodig", lty_sendingT:"Je bestelling wordt verstuurd", cm_tabGifts:"Mijn cadeaus", cm_tabShop:"Puntenshop", cm_apply:"Toepassen", cm_applied:"Toegepast", cm_removeA:"{name} niet meer toepassen", cm_addX:"Voeg {name} toe", cm_goCat:"Naar {name}", cm_needItem:"Geldig met {name} in je bestelling", cm_needCat:"Geldig met iets uit {name}", cm_needSpend:"Nog {amount} tot je dit cadeau kunt gebruiken", cm_short:"Nog {amount}", cm_notNow:"Niet van toepassing op deze bestelling", cm_validUntil:"Geldig t/m {d}", cm_noGifts:"Er staan nu geen cadeaus voor je klaar. Wissel je punten in de Puntenshop in.", cm_toShop:"Naar de Puntenshop", cm_punchLeft:"Nog {n} tot {reward}", cm_credit:"{amount} tegoed", cm_forYou:"Speciaal voor jou, {name}", cm_add:"Toevoegen", cm_join:"Spaar punten met deze bestelling", cm_joinS:"Log in met de QR-code en gebruik je cadeaus", cm_earn:"Je spaart {n} punten met deze bestelling", cm_calc:"Je kortingen worden berekend…", cm_err:"Kortingen kunnen nu niet worden toegepast — je kunt gewoon bestellen.", cm_wallet:"Betaal met je tegoed", cm_walletS:"{amount} beschikbaar", cm_subtotal:"Subtotaal", cm_discount:"Korting", cm_src_deal:"Ledenvoordeel", cm_src_asset:"Cadeau", cm_src_wallet:"Tegoed", cm_giftsReady:"Er staan {n} cadeaus voor je klaar", cm_saved:"Je bespaarde {amount}", cm_suggest:"Gebruik een cadeau", obCountA:"{q} in bestelling — aantal wijzigen", obChooseA:"{name}: kies opties", obLess:"Eén minder", obRemove:"Verwijderen", obMore:"Eén meer", obAddA:"{name} toevoegen", obAdded:"{name} toegevoegd", obPlus1:"+1 {name} · {opts}", obPlus1n:"+1 {name}", obNoFilter:"niet bij je filter", obFilterA:"{name}: niet bij je filter", obLocked:"Je bestelling wordt verwerkt", obVarA:"{name} {size} toevoegen — {price}", obVarAq:"{name} {size}: {q} in bestelling — nog een toevoegen", obFrom:"vanaf", obSave:"Voordeel {amount}", r44Req:"Verplicht", r44Opt:"Optioneel", r44Size:"Formaat", r44Base:"Basisformaat", r44DiffG:"+ {g} g voor + {price}", r44Rec:"Aanrader", r44AllEx:"Bekijk alle extra’s ({n})", r44Allerg:"Allergenen & info", r44AllergS:"Ingrediënten, allergenen en voedingswaarde", r44Pair:"Lekker hierbij", r44Save:"Opslaan", r44Direct:"Direct bestellen", r44Add:"Toevoegen", r44SelSize:"Geselecteerd formaat · {size}", r44Price:"Prijs", r44Need:"Maak eerst een keuze: {group}", r44NeedDrink:"Kies nog een drankje voor je menu", r44Blocked:"Past niet bij je allergenen/voorkeuren",
  howOrder:'Hoe wil je bestellen?', rw_added:'Gratis {name} toegevoegd', rw_gone:'Gratis {name} verwijderd — bestelling onder {amt}', rw_gift:'Cadeautje',
  alContains:'Bevat', alTraces:'Kan sporen bevatten van', alRemovable:'Ingrediënt kan worden weggelaten', alRemovableNote:'Weglaten van een ingrediënt garandeert niet dat het allergeen is verwijderd.',
  alFilterT:'Allergenenfilter', alFilterS:'Verberg producten die dit bevatten…', alFilterNote:'Dit filter is een hulpmiddel, geen veiligheidsgarantie. Overleg bij een ernstige allergie altijd met een medewerker.',
  alFilterBtn:'Allergenen', alFilterOn:'{n} verborgen', alNone:'Geen allergenen geregistreerd', alClear:'Filter wissen',
  menuLbl:'Menu', navHome:'Home', homeT:'Uitgelicht', newIn:'Nieuw', seeAll:'Bekijk alles',
  cat_popular:'Populair', cat_pokewan:'Poké Wan', cat_stoneplate:'Stone Plate',
  cat_stonebowl:'Stone Bowl', cat_sushi:'Sushi', cat_ramen:'Japanese Ramen',
  cat_curry:'Curry', cat_sides:'Bijgerechten', cat_drinks:'Dranken', cat_desserts:'Desserts',
  f_all:'Alles', f_maki:'Maki', f_nigiri:'Nigiri', f_special:'Specials',
  comboTileT:'Maak er een combo van', comboTileS:'2 gyoza + drankje',
  makeCombo:'Maak er een combo van', comboIncl:'2 gyoza + drankje naar keuze',
  summaryCombo:'Menu', chooseDrink:'Kies je drankje',
  customize:'Stel zelf samen', yourWay:'Helemaal zoals jij het wil',
  allergens:'Allergenen & info', optional:'Optioneel', free:'Gratis',
  addToOrder:'In mijn bestelling', updateOrder:'Wijzigingen opslaan',
  viewOrder:'Bekijk bestelling', item:'artikel', items:'artikelen',
  vuAdded:'Toegevoegd', vuChoose:'Kies deze', vuChosen:'Gekozen', vuMenuAdded:'Menu toegevoegd',
  back:'Terug', basePrice:'Basisprijs', qty:'Aantal', addBtnOrder:'Toevoegen aan bestelling',
  priceBase:'Basis', priceExtras:'Extra’s', showAll:'Toon alle', showLess:'Toon minder',
  reqHint:'Maak een keuze om verder te gaan', reqMark:'verplicht', menuDrink:'Kies je drankje', menuDrinkS:'Kies 1 drankje voor je menu.',
  discardT:'Wijzigingen verwijderen?', discardB:'Je samenstelling van dit product is nog niet toegevoegd.',
  discardKeep:'Verder samenstellen', discardYes:'Wijzigingen verwijderen',
  assistT:'Hulp van een medewerker nodig', assistB:'Er is mogelijk betaald. Dit scherm blijft beschermd tot een medewerker het afhandelt.',
  assistData:'Herstelgegevens konden niet worden gelezen. De ruwe gegevens zijn bewaard voor diagnose.', crashT:'Er ging iets mis', crashB:'Er is niets afgeschreven. Start opnieuw om verder te gaan.', crashRestart:'Opnieuw starten',
  unavailOpen:'Dit product is op dit moment uitverkocht.', fsAction:'Volledig scherm',
  delLinkedT:'Product en bijgerechten verwijderen?', delLinkedB:'{name} heeft {n} gekoppelde bijgerechten.', delLinkedB1:'{name} heeft 1 gekoppeld bijgerecht.',
  delAll:'Alles verwijderen', delMainOnly:'Alleen hoofdproduct verwijderen', delKeepSides:'Bijgerechten behouden', xsLoose:'Bijgerecht',
  priceChangedT:'Een prijs is gewijzigd', priceChangedB:'De actuele prijs van {name} is {price} (was {old}).', priceConfirm:'Nieuwe prijs bevestigen',
  xsWith:'Erbij bij', extraPortion:'Extra portie', xsConflictT:'Je hebt al extra {name} geselecteerd.',
  xsKeep:'Behouden als extra portie', xsDrop:'Extra portie verwijderen', showAllX:'Bekijk alle extra’s',
  priceBreakdown:'Bekijk prijsopbouw', priceProduct:'Product + extra’s', priceSide:'Erbij', pcs:'stuks',
  qtyLabelPortion:'{n} stuks',
  yourOrder:'Jouw bestelling', edit:'Wijzig', addMore:'Meer toevoegen',
  total:'Totaal', inclVat:'Incl. btw', goPay:'Afrekenen',
  sweetT:'Nog iets zoets?', sweetS:'Mochi, matcha of mango als afsluiter',
  drinkT:'Nog iets te drinken?', drinkS:'Fris, sap of iced tea erbij',
  viewDess:'Bekijk desserts', viewDrinks:'Bekijk dranken',
  emptyT:'Je bestelling is nog leeg', emptyS:'Kies iets lekkers uit het menu', browse:'Naar het menu',
  cancelOrder:'Bestelling annuleren', cancelQ:'Bestelling annuleren?', cancelB:'Je huidige keuzes worden verwijderd.',
  keepOrder:'Verder bestellen', yesCancel:'Ja, annuleren',
  payTitle:'Betalen', followReader:'Volg de instructies op de betaalterminal onder het scherm',
  cancel:'Annuleren', thanks:'Bedankt! Eet smakelijk.', orderNo:'Jouw bestelnummer',
  printing:'Je bon wordt geprint…',
  callNo:'We roepen je nummer om zodra je bestelling klaarstaat.',
  bringTable:'Neem je nummer mee — wij brengen je bestelling naar je tafel.',
  newOrder:'Nieuwe bestelling', autoRestart:'Nieuw scherm over',
  readyTerm:'Gereed', tapTerm:'Bied je kaart aan', okTerm:'Betaling geslaagd',
  idleT:'Ben je nog aan het bestellen?', idleB:'Je bestelling wordt over {n} seconden gewist.', idleGo:'Ja, doorgaan', idleClear:'Bestelling wissen',
  payConnecting:'Verbinden met de betaalterminal…', payProcessing:'Betaling wordt verwerkt…', payApproved:'Betaling geslaagd',
  payDeclinedT:'Betaling niet gelukt', payDeclinedB:'Er is niets afgeschreven.', payRetry:'Opnieuw proberen', payOther:'Andere betaalmethode', payBack:'Terug naar bestelling',
  payOfflineT:'Betaalterminal niet bereikbaar', payOfflineB:'Controleer de verbinding of probeer het opnieuw.', payReconnect:'Opnieuw verbinden',
  payTimeoutT:'Geen antwoord van de betaalterminal', payTimeoutB:'Controleer eerst of er toch betaald is voordat je opnieuw probeert.',
  payCheck:'Controleer betalingsstatus', payChecking:'Betalingsstatus wordt gecontroleerd…', payNotCharged:'Er is geen betaling geregistreerd. Je kunt opnieuw proberen.',
  payRecoverT:'Betaling gelukt — bestelling wordt hersteld', payRecoverB:'Je hoeft niet opnieuw te betalen.', payRef:'Referentie', payRetrySubmit:'Bestelling opnieuw versturen',
  payCancelledT:'Betaling geannuleerd', payAttempt:'Poging', unavailT:'Niet meer beschikbaar', unavailB:'Dit product is uitverkocht. Verwijder het om verder te gaan.',
  unavailRemove:'Uit bestelling halen', unavailBlock:'Verwijder niet-beschikbare producten om te betalen',
  b_pop:'Populair', b_new:'Nieuw', b_veg:'Vega', b_spc:'Pittig', b_dea:'Deal', b_hal:'Halal',
  kcal:'kcal', perServing:'per portie', close:'Sluiten',
  rw_prog:'Nog {amt} tot gratis {name} 🎁', rw_line:'Cadeautje', popX:'Maak het nóg beter', addA:'Voeg {name} toe', removeA:'Verwijder {name}', qtyUp:'Aantal verhogen', qtyDown:'Aantal verlagen', finishT:'Maak het helemaal af', finishS:'Vaak samen besteld', addBtn:'Toevoegen', promoOrder:'Bestel combo', promoView:'Bekijk deal',
},
mk:{
  start:'Започни нарачка', eatIn:'Јади тука', takeAway:'Понеси',
  voucherT:'Имаш ваучер?', voucherS:'Скенирај го кодот',
  voucherBody:'Држи го кодот на ваучерот под скенерот покрај екранот. Попустот се пресметува веднаш.',
  inCartA:'{name}: {n} во твојата нарачка — отвори за измена или уште едно', 
  
  
  chooseA:'Избери — {name}', soldOutA:'Распродадено — {name}', sizeT:'Формат', sizeA:'{name}, формат {size}', oneLess:'Едно помалку', oneMore:'Едно повеќе', removeItem:'Отстрани', inOrderA:'{name}: {n} во нарачката',
  maxQtyA:'Максимум {n} по ставка', unavailPart:'{name} е распродаден', unavailPartsB:'Ова е дел од твоето мени: {list}',
  changeDrink:'Избери друг пијалок', removePart:'Отстрани {name}', blockedUnavail:'Распродадено: {list}', blockedChoice:'Прво направи ги задолжителните избори',
  blockedQty:'Прво прилагоди ја количината', blockedPrice:'Прво потврди ги променетите цени', blockedConn:'Се чека системот на ресторанот',
  giftLabel:'Подарок од нас', giftFixed:'Фиксна комбинација', priceChangedAgain:'Цените повторно се променија',
  adjustIngr:'Прилагоди ги состојките', adjustBtn:'Прилагоди', maxReached:'Максимум {n}×', qtyOfA:'{name}: {n} во нарачката',
  drinkUpgradeT:'Направи го менито уште повкусно', drinkUpgradeS:'Надгради го пијалокот.', drinkInclT:'Вклучено во твоето мени', drinkInclS:'Без доплата.',
  drinkPickedT:'Твој избор: {name}', drinkPickedS:'Избор на друг пијалок го заменува тековниот.', inclLabel:'Вклучено', menuSummary:'Гиоза + пијалок по избор', menuRemove:'Отстрани',
  backToProduct:'Назад кон производот', noChanges:'Нема направени промени', backAfterConfirm:'Се враќаш на твојот производ', confirmChoices:'Потврди избор', continueBtn:'Продолжи', alReset:'Исчисти ги сите филтри', alActive:'{n} активни',
  needChoice:'Избери {label}', chooseFlavour:'Избери вкус за твојот подарок', alUnknown:'Нема информации за алергени — за проверка од ресторанот',
  alForOrder:'За твојата комбинација', alFilterHint:'Сокрива производи што ги СОДРЖАТ избраните алергени. Производите што може да содржат траги остануваат видливи.',
  alCartClash:'Твојата нарачка содржи производи со алерген што сега го филтрираш: {names}. Провери ги пред да платиш.', alEmpty:'Нема производи во овој филтер', alChange:'Промени филтер',
  reqLabel:'задолжително', optLabel:'по избор', chooseBtn:'Избери', fromPrice:'од {price}', plusPrice:'+ {price} како мени', menuPriceA:'Мени {price}', menuBaseA:'само јадење {price}', menuInclA:'со {what}', voucherDemo:'Демо: ваучерите не се поврзани во овој киоск',
  cancelReqT:'Плаќањето се откажува…', cancelReqB:'Киоскот чека терминалот да потврди дека ништо не е наплатено.',
  availCheckT:'Се проверуваат достапноста и цените…', availFailT:'Достапноста не можеше да се провери', availFailB:'Киоскот не можеше да ги потврди цените и достапноста. Обиди се повторно за момент или замоли вработен.',
  catalogInvalidT:'Податоците за менито бараат внимание', catalogInvalidB:'Некои ставки се скриени додека ресторанот не ги коригира.', lineInvalid:'Оваа ставка веќе не може да се нарача вака',
  prodBlockT:'Киоскот не е подготвен', prodBlockB:'Недостасуваат потребни интеграции: {list}. Замоли вработен.', demoBadge:'ДЕМО',
  payStoreFail:'Плаќањето не може да започне: киоскот не можеше безбедно да ја зачува нарачката. Замоли вработен.',
  statusCheckT:'Се проверува статусот на плаќањето…', statusCheckB:'Можеби беше во тек плаќање. Киоскот прво го прашува платежниот сервис пред да се случи нешто.',
  orderAccepted:'Нарачката е прифатена', orderPending:'Нарачката се регистрира…', receiptPrinted:'Сметката е испечатена', receiptFailed:'Сметката не можеше да се испечати — покажи го бројот на шалтерот', receiptPrinting:'Се печати сметката…',
  pickupCounter:'Подигни ја нарачката на шалтерот кога ќе биде повикан твојот број.', refT:'Референца',
  connBootT:'Поврзување со системот на ресторанот…', connBootS:'Обид {n}', connFailT:'Системот на ресторанот не е достапен', connFailB:'Замоли вработен за помош. Киоскот ќе продолжи да се обидува.',
  connRetry:'Обиди се повторно', connLost:'Врската се обновува — твојата нарачка е зачувана', connBack:'Врската е обновена', connPayBlock:'Плаќањето не е можно додека врската се обновува',
  cleanT:'Чистење на екранот', cleanB:'Исчистете го екранот хигиенски: избришете го со дезинфекциона крпичка за екран, вклучително и рабовите. Допирот е исклучен додека трае чистењето.',
  cleanDone:'Готово со чистење', cleanOpen:'Исчисти го екранот', cleanOn:'Режим за чистење: вклучен', cleanOff:'Режим за чистење: исклучен', cleanToggle:'Промени режим за чистење',
  connResync:'Се проверуваат достапноста и цените…', adminT:'Поставки за вработени', adminPin:'Внеси PIN', adminWrong:'Погрешен PIN', adminServer:'Сервер', adminClose:'Затвори',
  obMultiA:"{q} во нарачката, {cfg} — промени количина", r44NoneSel:"Ништо избрано", svcChange:"Промени", svcChangeA:"Промени овде / за носење",
  tag_nameBad:"Изберете друго име", tag_admin:"Препознавање на нарачка", tag_m_none:"Нема", tag_m_pager:"Пејџер", tag_m_table:"Табличка", tag_m_name:"Име", tag_adminDemo:"Демо: изборот се чува на овој уред; во продукција доаѓа од backend", tag_adminProd:"Поставено во backend", tag_tableT:"Каде ќе седите?", tag_tableS:"Земете табличка со број до киоскот, внесете го бројот и ставете ја табличката на вашата маса. Ние ќе ви ја донесеме нарачката.", tag_tableL:"Табличка", tag_pagerT:"Земете пејџер", tag_pagerS:"Земете пејџер до киоскот и внесете го бројот што е на него. Ќе заѕвони кога нарачката ќе биде готова; тогаш подигнете ја на шанкот.", tag_pagerL:"Пејџер", tag_nameT:"Како се викате?", tag_nameS:"Ќе ве повикаме по име кога нарачката ќе биде готова.", tag_nameL:"Име", tag_namePh:"Вашето име", tag_range:"Внесете број од {min} до {max}", tag_nameNeed:"Внесете го вашето име за да продолжите", tag_nameMin:"Внесете најмалку {n} букви", tag_go:"Продолжи кон плаќање", tag_skip:"Прескокни", tag_clear:"Избриши", tag_del:"Избриши го последниот знак", tag_space:"Празно место", tag_kbSwitch:"Промени азбука", tag_padA:"Нумеричка тастатура", tag_kbA:"Тастатура", tag_doneTable:"Ставете ја табличката {v} на вашата маса. Ќе ви ја донесеме нарачката штом биде готова.", tag_donePager:"Вашиот пејџер ({v}) ќе заѕвони штом нарачката е готова. Тогаш подигнете ја на шанкот.", tag_doneName:"Ќе ве повикаме, {v}, штом нарачката е готова.",
  lty_btn:"Собирај и награди", lty_nav:"Награди", lty_sub:"Замени ги поените за бесплатни вкусотии", lty_scanT:"Скенирај за најава", lty_scanS:"Отвори ја апликацијата DADAWAN и скенирај го кодот со телефонот.", lty_wait:"Се чека скенирање…", lty_expired:"Кодот е истечен", lty_newCode:"Нов код", lty_demo:"Демо · симулирај скенирање:", lty_welcome:"Добредојде {name}", lty_welcomeB:"Сега си најавен и веднаш можеш да ги видиш и искористиш поените.", lty_points:"{n} поени", lty_ptsAvail:"достапни поени", lty_ptsShort:"поени", lty_toRewards:"Види ги наградите", lty_logout:"Одјави се", lty_hi:"Здраво {name}", lty_loginT:"Најави се за собирање и користење", lty_loginS:"Скенирај го QR-кодот со апликацијата DADAWAN", lty_loginBtn:"Најава со QR", lty_login:"Најави се за да искористиш", lty_redeem:"Искористи", lty_inOrder:"Во нарачката", lty_undoA:"Отстрани {name} од нарачката", lty_short:"Уште {n} поени", lty_free:"Бесплатно", lty_offShort:"попуст", lty_freeN:"Бесплатно {name}", lty_offN:"{p}% попуст на {name}", lty_used:"{n} поени резервирани во оваа нарачка", lty_line:"Награда", lty_lineS:"{n} поени", lty_noPts:"Нема доволно поени (или си одјавен) — отстрани ја наградата.", lty_doneS:"{spent} поени искористени · +{earned} собрани · салдо {bal}", lty_doneE:"+{earned} собрани поени · салдо {bal}", lty_saving:"Поените се ажурираат…", lty_later:"Поените ќе бидат ажурирани наскоро.", lty_errT:"Најавата не успеа", lty_err:"Најавата моментално не е возможна. Обиди се повторно или нарачај без најава.", lty_retry:"Обиди се повторно", lty_nIn:"{n}× во нарачката", lty_moreA:"Уште едно {name}", lty_lessA:"Едно {name} помалку", lty_max:"макс. {n}× по нарачка", lty_progLoading:"Се вчитуваат наградите…", lty_progErr:"Наградите моментално не може да се вчитаат.", lty_progEmpty:"Моментално нема достапни награди.", lty_rewardGone:"Награда во нарачката е променета или повеќе не е достапна — отстрани ја.", lty_placeOrder:"Нарачај", lty_noCharge:"Не е потребно плаќање", lty_sendingT:"Нарачката се испраќа", cm_tabGifts:"Мои награди", cm_tabShop:"Продавница за поени", cm_apply:"Примени", cm_applied:"Применето", cm_removeA:"Не применувај {name}", cm_addX:"Додај {name}", cm_goCat:"Кон {name}", cm_needItem:"Важи со {name} во нарачката", cm_needCat:"Важи со нешто од {name}", cm_needSpend:"Уште {amount} за да ја искористиш наградата", cm_short:"Уште {amount}", cm_notNow:"Не важи за оваа нарачка", cm_validUntil:"Важи до {d}", cm_noGifts:"Моментално немаш награди. Искористи ги поените во продавницата.", cm_toShop:"Кон продавницата за поени", cm_punchLeft:"Уште {n} до {reward}", cm_credit:"{amount} кредит", cm_forYou:"Специјално за тебе, {name}", cm_add:"Додај", cm_join:"Собирај поени со оваа нарачка", cm_joinS:"Најави се со QR-кодот и искористи ги наградите", cm_earn:"Собираш {n} поени со оваа нарачка", cm_calc:"Се пресметуваат попустите…", cm_err:"Попустите моментално не може да се применат — можеш нормално да нарачаш.", cm_wallet:"Плати со кредитот", cm_walletS:"{amount} достапно", cm_subtotal:"Меѓузбир", cm_discount:"Попуст", cm_src_deal:"Членска поволност", cm_src_asset:"Награда", cm_src_wallet:"Кредит", cm_giftsReady:"{n} награди те чекаат", cm_saved:"Заштеде {amount}", cm_suggest:"Искористи награда", obCountA:"{q} во нарачката — промени количина", obChooseA:"{name}: избери опции", obLess:"Едно помалку", obRemove:"Отстрани", obMore:"Уште едно", obAddA:"Додај {name}", obAdded:"{name} е додадено", obPlus1:"+1 {name} · {opts}", obPlus1n:"+1 {name}", obNoFilter:"не е во твојот филтер", obFilterA:"{name}: не е во твојот филтер", obLocked:"Нарачката се обработува", obVarA:"Додај {name} {size} — {price}", obVarAq:"{name} {size}: {q} во нарачката — додај уште едно", obFrom:"од", obSave:"Заштеда {amount}", r44Req:"Задолжително", r44Opt:"Опционално", r44Size:"Големина", r44Base:"Основна големина", r44DiffG:"+ {g} g за + {price}", r44Rec:"Препорака", r44AllEx:"Види ги сите додатоци ({n})", r44Allerg:"Алергени и инфо", r44AllergS:"Состојки, алергени и хранливи вредности", r44Pair:"Оди добро со", r44Save:"Зачувај", r44Direct:"Нарачај веднаш", r44Add:"Додај", r44SelSize:"Избрана големина · {size}", r44Price:"Цена", r44Need:"Прво направи избор: {group}", r44NeedDrink:"Избери пијалок за менито", r44Blocked:"Не одговара на твоите алергени/преференции",
  howOrder:'Како сакаш да нарачаш?', rw_added:'Бесплатно {name} додадено', rw_gone:'Бесплатно {name} отстрането — нарачката е под {amt}', rw_gift:'Подарок',
  alContains:'Содржи', alTraces:'Може да содржи траги од', alRemovable:'Состојката може да се изостави', alRemovableNote:'Изоставувањето на состојка не гарантира дека алергенот е отстранет.',
  alFilterT:'Филтер за алергени', alFilterS:'Сокриј производи што содржат…', alFilterNote:'Овој филтер е помошно средство, не безбедносна гаранција. При сериозна алергија секогаш разговарај со вработен.',
  alFilterBtn:'Алергени', alFilterOn:'{n} скриени', alNone:'Нема регистрирани алергени', alClear:'Исчисти филтер',
  menuLbl:'Мени', navHome:'Почетна', homeT:'Издвоено', newIn:'Ново', seeAll:'Види ги сите',
  cat_popular:'Популарно', cat_pokewan:'Poké Wan', cat_stoneplate:'Stone Plate',
  cat_stonebowl:'Stone Bowl', cat_sushi:'Суши', cat_ramen:'Јапонски рамен',
  cat_curry:'Кари', cat_sides:'Прилози', cat_drinks:'Пијалоци', cat_desserts:'Десерти',
  f_all:'Сѐ', f_maki:'Маки', f_nigiri:'Нигири', f_special:'Специјални',
  comboTileT:'Направи го комбо', comboTileS:'2 гиоза + пијалок',
  makeCombo:'Направи го комбо', comboIncl:'2 гиоза + пијалок по избор',
  summaryCombo:'Мени', chooseDrink:'Избери пијалок',
  customize:'Состави го сам', yourWay:'Точно како што сакаш',
  allergens:'Алергени и инфо', optional:'По избор', free:'Бесплатно',
  addToOrder:'Во мојата нарачка', updateOrder:'Зачувај промени',
  viewOrder:'Види нарачка', item:'производ', items:'производи',
  vuAdded:'Додадено', vuChoose:'Избери го овој', vuChosen:'Избрано', vuMenuAdded:'Менито е додадено',
  back:'Назад', basePrice:'Основна цена', qty:'Количина', addBtnOrder:'Додај во нарачка',
  priceBase:'Основа', priceExtras:'Додатоци', showAll:'Прикажи сè', showLess:'Прикажи помалку',
  reqHint:'Изберете опција за да продолжите', reqMark:'задолжително', menuDrink:'Избери го пијалокот', menuDrinkS:'Избери 1 пијалок за твоето мени.',
  discardT:'Да се отфрлат промените?', discardB:'Твојот избор за овој производ сè уште не е додаден.',
  discardKeep:'Продолжи со составување', discardYes:'Отфрли ги промените',
  assistT:'Потребна е помош од вработен', assistB:'Можеби е извршено плаќање. Овој екран останува заштитен додека вработен не го реши.',
  assistData:'Податоците за обновување не можеа да се прочитаат. Суровиот запис е зачуван за дијагностика.', crashT:'Нешто тргна наопаку', crashB:'Ништо не е наплатено. Започни повторно за да продолжиш.', crashRestart:'Започни повторно',
  unavailOpen:'Овој производ моментално е распродаден.', fsAction:'Цел екран',
  delLinkedT:'Да се отстранат производот и прилозите?', delLinkedB:'{name} има {n} поврзани прилози.', delLinkedB1:'{name} има 1 поврзан прилог.',
  delAll:'Отстрани сè', delMainOnly:'Отстрани само главниот производ', delKeepSides:'Задржи ги прилозите', xsLoose:'Прилог',
  priceChangedT:'Една цена е променета', priceChangedB:'Актуелната цена на {name} е {price} (беше {old}).', priceConfirm:'Потврди ја новата цена',
  xsWith:'Покрај', extraPortion:'Дополнителна порција', xsConflictT:'Веќе избра дополнително {name}.',
  xsKeep:'Задржи како дополнителна порција', xsDrop:'Отстрани дополнителна порција', showAllX:'Види ги сите додатоци',
  priceBreakdown:'Види ја пресметката', priceProduct:'Производ + додатоци', priceSide:'Покрај', pcs:'парчиња',
  qtyLabelPortion:'{n} парчиња',
  yourOrder:'Твојата нарачка', edit:'Измени', addMore:'Додај уште',
  total:'Вкупно', inclVat:'Со ДДВ', goPay:'Кон плаќање',
  sweetT:'Нешто слатко?', sweetS:'Мочи, матча или манго за крај',
  drinkT:'Нешто за пиење?', drinkS:'Сокови, газирани и ладен чај',
  viewDess:'Види десерти', viewDrinks:'Види пијалоци',
  emptyT:'Нарачката е сè уште празна', emptyS:'Избери нешто вкусно од менито', browse:'Кон менито',
  cancelOrder:'Откажи нарачка', cancelQ:'Да се откаже нарачката?', cancelB:'Твоите избори ќе бидат избришани.',
  keepOrder:'Продолжи со нарачка', yesCancel:'Да, откажи',
  payTitle:'Плаќање', followReader:'Следи ги упатствата на терминалот под екранот',
  cancel:'Откажи', thanks:'Благодариме! Пријатно јадење.', orderNo:'Твојот број на нарачка',
  printing:'Сметката се печати…',
  callNo:'Ќе го повикаме твојот број штом нарачката е готова.',
  bringTable:'Земи го бројот со себе — нарачката ти ја носиме на маса.',
  newOrder:'Нова нарачка', autoRestart:'Нов екран за',
  readyTerm:'Подготвено', tapTerm:'Приближи ја картичката', okTerm:'Плаќањето успеа',
  idleT:'Дали сè уште нарачуваш?', idleB:'Твојата нарачка ќе се избрише за {n} секунди.', idleGo:'Да, продолжи', idleClear:'Избриши нарачка',
  payConnecting:'Поврзување со терминалот…', payProcessing:'Плаќањето се обработува…', payApproved:'Плаќањето успеа',
  payDeclinedT:'Плаќањето не успеа', payDeclinedB:'Ништо не е наплатено.', payRetry:'Обиди се повторно', payOther:'Друг начин на плаќање', payBack:'Назад кон нарачката',
  payOfflineT:'Терминалот не е достапен', payOfflineB:'Провери ја врската или обиди се повторно.', payReconnect:'Поврзи повторно',
  payTimeoutT:'Нема одговор од терминалот', payTimeoutB:'Прво провери дали е платено пред да се обидеш повторно.',
  payCheck:'Провери статус на плаќање', payChecking:'Се проверува статусот…', payNotCharged:'Не е регистрирано плаќање. Можеш да се обидеш повторно.',
  payRecoverT:'Плаќањето успеа — нарачката се обновува', payRecoverB:'Не треба да платиш повторно.', payRef:'Референца', payRetrySubmit:'Испрати ја нарачката повторно',
  payCancelledT:'Плаќањето е откажано', payAttempt:'Обид', unavailT:'Веќе не е достапно', unavailB:'Производот е распродаден. Отстрани го за да продолжиш.',
  unavailRemove:'Отстрани од нарачката', unavailBlock:'Отстрани ги недостапните производи за да платиш',
  b_pop:'Популарно', b_new:'Ново', b_veg:'Веге', b_spc:'Луто', b_dea:'Акција', b_hal:'Халал',
  kcal:'kcal', perServing:'по порција', close:'Затвори',
  rw_prog:'Уште {amt} до бесплатно {name} 🎁', rw_line:'Подарок', popX:'Направи го уште подобро', addA:'Додај {name}', removeA:'Отстрани {name}', qtyUp:'Зголеми количина', qtyDown:'Намали количина', finishT:'Заврши го оброкот', finishS:'Често нарачувано заедно', addBtn:'Додај', promoOrder:'Нарачај комбо', promoView:'Погледни акција',
},
};
const FLAGS={ nl:'🇳🇱', en:'🇬🇧', mk:'🇲🇰' };
const LOCALES={ nl:'nl-NL', en:'en-IE', mk:'mk-MK' };
const t=k=>(I18N[S.lang]&&I18N[S.lang][k])||I18N.en[k]||k;
const L=o=>typeof o==='string'?o:(o[S.lang]||o.en);
/* the i18n money engine stays; only the symbol and the decimal separator come from the shared CMS
   (GUESTIT_CMS.brand.money) — symbol:'' renders eMenu-style amounts such as 12,50 */
const formatMoney=minor=>{ const m=CMS_MONEY();
  const n=Math.round(minor|0), neg=n<0, v=Math.abs(n);
  if(m.symbol===''){                                  /* eMenu style: 12,50 — no symbol, separator from the contract */
    const whole=String(Math.floor(v/100)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
    return (neg?'-':'')+whole+(m.decimals||',')+String(v%100).padStart(2,'0'); }
  const txt=new Intl.NumberFormat(LOCALES[S.lang]||'nl-NL',{style:'currency',currency:'EUR'}).format(n/100);
  const out=txt.replace('€',m.symbol||'€');
  return (m.decimals&&m.decimals!==',')?out.replace(',',m.decimals):out; };
const CMS_MONEY=()=>((GUESTIT_CMS.brand||{}).money||{symbol:'€',decimals:','});
const fmt=formatMoney;   /* every amount in the engine is an integer minor unit */
const brandCopy=k=>L(BRAND.copy[k]);
const tf=(k,vars)=>Object.entries(vars).reduce((a,[kk,v])=>a.replaceAll('{'+kk+'}',v),t(k));

/* ══════════════════════════════════════════════════════════════
   4 · MENU CONTENT (customer catalogue — normally fed by the
       Guestit CMS; structure is engine-owned, content is brand)
   ══════════════════════════════════════════════════════════════ */
/* allergen dictionary (CMS): understandable names + icons per language */
const ALG_ICON={ gluten:'🌾', soy:'🫘', fish:'🐟', shell:'🦐', egg:'🥚', milk:'🥛', sesame:'🌱', nuts:'🥜', mustard:'🟡', celery:'🥬' };
const ALG={
  gluten:{en:'Gluten',nl:'Gluten',mk:'Глутен'}, soy:{en:'Soy',nl:'Soja',mk:'Соја'},
  fish:{en:'Fish',nl:'Vis',mk:'Риба'}, shell:{en:'Shellfish',nl:'Schaaldieren',mk:'Школки/ракови'},
  egg:{en:'Egg',nl:'Ei',mk:'Јајце'}, milk:{en:'Milk',nl:'Melk',mk:'Млеко'},
  sesame:{en:'Sesame',nl:'Sesam',mk:'Сусам'}, nuts:{en:'Peanuts / nuts',nl:"Pinda's / noten",mk:'Кикирики / јатки'},
  mustard:{en:'Mustard',nl:'Mosterd',mk:'Сенф'}, celery:{en:'Celery',nl:'Selderij',mk:'Целер'},
};
P.stone='M5 12a7 7 0 0 0 14 0M3.5 12h17M9.2 8.7c0-1 .8-1 .8-2M13.2 8.7c0-1 .8-1 .8-2';
P.home='m4 11 8-7.2L20 11M6.3 9.4V20h11.4V9.4M10 20v-6.2h4V20';

const MODS={
  spice:{ label:{en:'Spice level',nl:'Pittigheid',mk:'Лутина'}, type:'choice', items:[
    {id:'sMild',name:{en:'Mild',nl:'Mild',mk:'Благо'},price:0},
    {id:'sMed', name:{en:'Medium',nl:'Medium',mk:'Средно'},price:0},
    {id:'sHot', name:{en:'Hot 🌶',nl:'Pittig 🌶',mk:'Луто 🌶'},price:0},
    {id:'sXhot',name:{en:'Extra hot 🌶🌶',nl:'Extra pittig 🌶🌶',mk:'Екстра луто 🌶🌶'},price:0}]},
  protein:{ label:{en:'Your protein',nl:'Jouw proteïne',mk:'Твој протеин'}, type:'choice', req:true, items:[
    {id:'pChick',name:{en:'Chicken',nl:'Kip',mk:'Пилешко'},price:0},
    {id:'pBeef', name:{en:'Beef',nl:'Rund',mk:'Говедско'},price:1.50},
    {id:'pTofu', name:{en:'Crispy tofu',nl:'Krokante tofu',mk:'Крцкаво тофу'},price:0},
    {id:'pShrimp',name:{en:'Shrimp',nl:'Garnalen',mk:'Ракчиња'},price:2.00,allergens:{contains:['shell']}}]},   /* option allergens (CMS) — demo */
  bowlX:{ label:{en:'Extra toppings',nl:'Extra toppings',mk:'Екстра додатоци'}, type:'extra', items:[
    {id:'avo',  em:'🥑', name:{en:'Avocado',nl:'Avocado',mk:'Авокадо'},price:1.20},
    {id:'edam', em:'🌱', name:{en:'Edamame',nl:'Edamame',mk:'Едамаме'},price:1.00},
    {id:'mangoT',em:'🥭',name:{en:'Mango',nl:'Mango',mk:'Манго'},price:1.00},
    {id:'crisp',em:'🧅', name:{en:'Crispy onions',nl:'Krokante uitjes',mk:'Крцкав кромид'},price:0.70},
    {id:'ddx',  em:'🥣', name:{en:'Extra DADAWAN sauce',nl:'Extra DADAWAN-saus',mk:'Екстра DADAWAN сос'},price:0.50}]},
  bowlR:{ label:{en:'Remove ingredients',nl:'Ingrediënten weglaten',mk:'Без состојки'}, type:'remove', items:[
    {id:'noCor',name:{en:'No coriander',nl:'Zonder koriander',mk:'Без коријандер'},price:0},
    {id:'noPea',name:{en:'No peanuts',nl:"Zonder pinda's",mk:'Без кикирики'},price:0},
    {id:'noChi',name:{en:'No chili',nl:'Zonder chili',mk:'Без чили'},price:0},
    {id:'noGin',name:{en:'No ginger',nl:'Zonder gember',mk:'Без ѓумбир'},price:0},
    {id:'noSpr',name:{en:'No spring onion',nl:'Zonder bosui',mk:'Без млад кромид'},price:0}]},
  sushiX:{ label:{en:'Extra toppings',nl:'Extra toppings',mk:'Екстра додатоци'}, type:'extra', items:[
    {id:'spMayo',em:'🌶',name:{en:'Spicy mayo',nl:'Spicy mayo',mk:'Спајси мајонез'},price:0.50},
    {id:'unagi',em:'🥢', name:{en:'Unagi drizzle',nl:'Unagi-saus',mk:'Унаги прелив'},price:0.70},
    {id:'xgin', em:'🍥', name:{en:'Extra ginger',nl:'Extra gember',mk:'Екстра ѓумбир'},price:0.30}]},
  sushiR:{ label:{en:'Remove ingredients',nl:'Ingrediënten weglaten',mk:'Без состојки'}, type:'remove', items:[
    {id:'noWas',name:{en:'No wasabi',nl:'Zonder wasabi',mk:'Без васаби'},price:0},
    {id:'noGinS',name:{en:'No ginger',nl:'Zonder gember',mk:'Без ѓумбир'},price:0},
    {id:'noSes',name:{en:'No sesame',nl:'Zonder sesam',mk:'Без сусам'},price:0}]},
  ramenX:{ label:{en:'Extra toppings',nl:'Extra toppings',mk:'Екстра додатоци'}, type:'extra', items:[
    {id:'xEgg', em:'🥚',name:{en:'Extra egg',nl:'Extra ei',mk:'Екстра јајце'},price:1.00},
    {id:'xCha', em:'🥩',name:{en:'Extra chashu',nl:'Extra chashu',mk:'Екстра чашу'},price:2.00},
    {id:'xNood',em:'🍜',name:{en:'Extra noodles',nl:'Extra noedels',mk:'Екстра нудли'},price:1.50},
    {id:'xNori',em:'🌿',name:{en:'Extra nori',nl:'Extra nori',mk:'Екстра нори'},price:0.50}]},
  ramenR:{ label:{en:'Remove ingredients',nl:'Ingrediënten weglaten',mk:'Без состојки'}, type:'remove', items:[
    {id:'rEgg', name:{en:'No egg',nl:'Zonder ei',mk:'Без јајце'},price:0},
    {id:'rSpr', name:{en:'No spring onion',nl:'Zonder bosui',mk:'Без млад кромид'},price:0},
    {id:'rNori',name:{en:'No nori',nl:'Zonder nori',mk:'Без нори'},price:0},
    {id:'rOil', name:{en:'No chili oil',nl:'Zonder chili-olie',mk:'Без чили масло'},price:0}]},
  dips:{ label:{en:'Dips & sauces',nl:'Dips & sauzen',mk:'Сосови'}, type:'extra', items:[
    {id:'swChi',em:'🌶',name:{en:'Sweet chili',nl:'Sweet chili',mk:'Слатко чили'},price:0.50},
    {id:'pnut', em:'🥜',name:{en:'Peanut sauce',nl:'Pindasaus',mk:'Сос од кикирики'},price:0.70},
    {id:'ddip', em:'🥣',name:{en:'DADAWAN sauce',nl:'DADAWAN-saus',mk:'DADAWAN сос'},price:0.50},
    {id:'srir', em:'🔥',name:{en:'Sriracha mayo',nl:'Sriracha mayo',mk:'Срирача мајонез'},price:0.50}]},
  gyozaN:{ label:{en:'Portion',nl:'Portie',mk:'Порција'}, type:'choice', items:[
    {id:'g4',name:{en:'4 pieces',nl:'4 stuks',mk:'4 парчиња'},price:0},
    {id:'g6',name:{en:'6 pieces',nl:'6 stuks',mk:'6 парчиња'},price:1.80},
    {id:'g8',name:{en:'8 pieces',nl:'8 stuks',mk:'8 парчиња'},price:3.20}]},
  drinkSize:{ label:{en:'Size',nl:'Formaat',mk:'Големина'}, type:'choice', items:[
    {id:'dS',name:{en:'Small',nl:'Klein',mk:'Мало'},price:-0.40},
    {id:'dM',name:{en:'Medium',nl:'Medium',mk:'Средно'},price:0},
    {id:'dL',name:{en:'Large',nl:'Groot',mk:'Големо'},price:0.60}]},
  mochiFl:{ label:{en:'Flavour',nl:'Smaak',mk:'Вкус'}, type:'choice', req:true, items:[
    {id:'mMat',name:{en:'Matcha',nl:'Matcha',mk:'Матча'},price:0},
    {id:'mMan',name:{en:'Mango',nl:'Mango',mk:'Манго'},price:0},
    {id:'mStr',name:{en:'Strawberry',nl:'Aardbei',mk:'Јагода'},price:0}]},
  doneness:{ label:{en:'Choose doneness',nl:'Kies bereidingswijze',mk:'Избери печење'}, type:'choice', req:true, items:[
    {id:'dRare',name:{en:'Rare',nl:'Rare',mk:'Ретко'},price:0},
    {id:'dMed', name:{en:'Medium',nl:'Medium',mk:'Средно'},price:0},
    {id:'dWell',name:{en:'Well done',nl:'Well done',mk:'Добро печено'},price:0}]},
  garnish:{ label:{en:'Choose side',nl:'Kies garnituur',mk:'Избери прилог'}, type:'choice', req:true, items:[
    {id:'gFries',name:{en:'Fries',nl:'Friet',mk:'Помфрит'},price:0},
    {id:'gPot',  name:{en:'Potatoes',nl:'Aardappelen',mk:'Компири'},price:0},
    {id:'gSal',  name:{en:'Salad',nl:'Salade',mk:'Салата'},price:0}]},
  steakSauce:{ label:{en:'Choose sauce',nl:'Kies saus',mk:'Избери сос'}, type:'choice', req:true, items:[
    {id:'sPep', name:{en:'Pepper sauce',nl:'Pepersaus',mk:'Сос од пипер'},price:0},
    {id:'sMush',name:{en:'Mushroom sauce',nl:'Champignonsaus',mk:'Сос од печурки'},price:0},
    {id:'sNone',name:{en:'No sauce',nl:'Geen saus',mk:'Без сос'},price:0}]},
};
/* choice groups place first zero-priced item as default; sMed is nicer */
MODS.spice.def='sMed';

const ASSET_PX={"hero": [2160, 1220], "lychee": [520, 518], "platter": [1400, 1050], "salmongrill": [479, 520], "unaginigiri": [520, 511], "fries": [512, 520], "salmonpoke": [493, 520], "teribeef": [520, 518], "rice": [1400, 1050], "salmonroll": [520, 493], "chickenroll": [520, 516], "veggieroll": [520, 495], "sakenigiri": [520, 508], "chickenpoke": [518, 520], "tofupoke": [466, 520], "shrimppoke": [504, 520], "peppersteak": [520, 515], "bibimbap": [512, 520], "bulgogi": [501, 520], "tofudolsot": [476, 520], "tonkotsu": [520, 506], "misoRam": [520, 511], "shiitakeramen": [484, 520], "greenCur": [520, 517], "katsu": [493, 520], "redCur": [500, 520], "gyoza": [520, 495], "springR": [491, 520], "edamame": [520, 506], "kimchi": [494, 520], "crackers": [493, 520], "misoSoup": [496, 520], "cola": [517, 520], "colazero": [520, 520], "sprite": [520, 508], "water": [494, 520], "oj": [520, 504], "greentea": [520, 506], "mochi": [509, 520], "matcha": [500, 520], "mangoR": [502, 520], "banana": [494, 520], "logoImg": [1024, 489], "lycheePromo": [2160, 1220], "platterPromo": [2160, 1220], "xSalmon": [473, 520], "xAvocado": [480, 520], "xMayo": [479, 520], "gyozaCut": [489, 520], "edamameCut": [464, 520], "springRCut": [520, 510], "menuCombo": [517, 520], "pokeSalCut": [499, 520], "riceSide": [520, 474], "steakPlate": [513, 520], "sushiplatter": [520, 407], "ddbowlImg": [520, 478]};
const assetW=src=>{ for(const k in ASSETS) if(ASSETS[k]===src) return ASSET_PX[k][0]; for(const k in ASSETS2) if(ASSETS2[k]===src) return ASSET_PX[k][0]; return 9999; };
const CATS=[
  {id:'popular',   icon:'star'},
  {id:'pokewan',   icon:'bowl'},
  {id:'stoneplate',icon:'plate'},
  {id:'stonebowl', icon:'stone'},
  {id:'sushi',     icon:'sushi', filters:['maki','nigiri','special']},
  {id:'ramen',     icon:'ramen', two:true},
  {id:'curry',     icon:'curry'},
  {id:'sides',     icon:'skewer'},
  {id:'drinks',    icon:'cup'},
  {id:'desserts',  icon:'cake'},
];

const U=(id,w=900)=>`https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;
const SITE='https://dadawan.nl/wp-content/uploads/';

const PRODUCTS=[
/* ── POKÉ WAN ────────────────────────────────────────────────── */
{id:'salmonpoke',cat:'pokewan',name:'Poké Wan Salmon',price:12.50,
   servings:[{short:{en:'Small',nl:'Small',mk:'Мало'},sub:'± 350 g',price:10.50},{short:{en:'Regular',nl:'Regular',mk:'Средно'},sub:'± 450 g',price:12.50,love:true},{short:{en:'Large',nl:'Large',mk:'Големо'},sub:'± 600 g',price:15.50}],kcal:640,tags:[],badges:['pop'],
 img:ASSETS.pokeSal,em:'🥗',tint:'#DCE4D2',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['fish','soy','sesame'],
 desc:{en:'Sushi rice, fresh salmon, edamame, mango and our DADAWAN sauce.',
       nl:'Sushirijst, verse zalm, edamame, mango en onze DADAWAN-saus.',
       mk:'Суши ориз, свеж лосос, едамаме, манго и нашиот DADAWAN сос.'}},
{id:'chickenpoke',cat:'pokewan',name:'Poké Wan Chicken',price:11.90,kcal:610,tags:[],badges:['hal'],
 img:ASSETS2.pokeChick,em:'🍗',tint:'#EBDCC2',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame'],
 desc:{en:'Teriyaki chicken, crunchy veggies, pickled ginger and sesame.',
       nl:'Teriyakikip, knapperige groenten, ingelegde gember en sesam.',
       mk:'Теријаки пилешко, крцкав зеленчук, кисел ѓумбир и сусам.'}},
{id:'tofupoke',cat:'pokewan',name:'Poké Wan Veggie',price:10.90,kcal:540,tags:[],badges:['veg'],
 img:ASSETS2.pokeVeg,em:'🥗',tint:'#D9E4CE',tint2:'#C4D6B4',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame'],
 desc:{en:'Crispy tofu, avocado, edamame, radish and wakame.',
       nl:'Krokante tofu, avocado, edamame, radijs en wakame.',
       mk:'Крцкаво тофу, авокадо, едамаме, ротквица и вакаме.'}},
{id:'shrimppoke',cat:'pokewan',name:'Poké Wan Shrimp',price:13.50,kcal:590,tags:[],badges:[],
 img:ASSETS2.pokeShr,em:'🍤',tint:'#F1DECB',tint2:'#E4C9A9',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['shell','soy','sesame'],
 desc:{en:'Crispy shrimp, sriracha mayo, cucumber and crispy onions.',
       nl:'Krokante garnalen, sriracha mayo, komkommer en krokante uitjes.',
       mk:'Крцкави ракчиња, срирача мајонез, краставица и крцкав кромид.'}},

/* ── STONE PLATE ─────────────────────────────────────────────── */
{id:'teribeef',cat:'stoneplate',name:'Stone Plate Teriyaki',price:14.50,kcal:780,tags:[],badges:['pop','hal'],
 img:ASSETS.plateTer,em:'🍱',tint:'#E8D6BC',canMenu:true,
 choice:['protein','spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame'],
 desc:{en:'Sizzling stone plate with jasmine rice, wok veggies and teriyaki glaze.',
       nl:'Sissende stone plate met jasmijnrijst, wokgroenten en teriyakiglaze.',
       mk:'Врела камена плоча со јасмин ориз, вок зеленчук и теријаки глазура.'}},
{id:'peppersteak',cat:'stoneplate',name:'Stone Plate Black Pepper Beef',price:15.50,kcal:820,tags:[],badges:[],
 img:ASSETS2.plateBeef,z:'zA',em:'🥩',tint:'#E3CDB4',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['soy','celery'],
 desc:{en:'Flame-seared beef in black pepper sauce, still sizzling at your table.',
       nl:'Geschroeide runderreepjes in zwarte-pepersaus, sissend geserveerd.',
       mk:'Запечено говедско во сос од црн пипер, сè уште цврчи на маса.'}},
{id:'steakMenu',cat:'stoneplate',name:'Biefstukmenu',price:24.50,kcal:890,tags:[],badges:[],
 img:ASSETS2.steakPlate,em:'🥩',tint:'#F8F5EE',canMenu:false,
 experience:{ flowType:'modification' },
 choice:['doneness','garnish','steakSauce'],allergens:['celery'],
 desc:{en:'Tender grilled steak, served on a hot stone with fresh vegetables.',
       nl:'Malse biefstuk van de grill, geserveerd op een hete steen met verse groenten.',
       mk:'Мек стек од скара, послужен на врел камен со свеж зеленчук.'}},
{id:'salmongrill',cat:'stoneplate',name:'Stone Plate Salmon',price:15.90,kcal:740,tags:[],badges:['new'],
 img:ASSETS.plateSal,em:'🐟',tint:'#E9D8C6',tint2:'#DBC2A6',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['fish','soy','sesame'],
 desc:{en:'Glazed salmon fillet on hot stone with yuzu butter and greens.',
       nl:'Geglazuurde zalmfilet op hete steen met yuzuboter en groenten.',
       mk:'Глазиран лосос на врела плоча со јузу путер и зеленчук.'}},

/* ── STONE BOWL ──────────────────────────────────────────────── */
{id:'ddbowl',cat:'stonebowl',name:'The DADAWAN Bowl',price:14.90,kcal:860,tags:[],badges:['pop'],
 img:ASSETS2.ddbowlImg,em:'🍚',tint:'#F8F5EE',canMenu:true,
 choice:['protein','spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame','egg'],
 desc:{en:'Our signature hot stone bowl — East meets West in one big, big bowl.',
       nl:'Onze signature hot stone bowl — Oost ontmoet West in één grote kom.',
       mk:'Нашата препознатлива врела камена чинија — Исток и Запад во една голема чинија.'}},
{id:'bibimbap',cat:'stonebowl',name:'Stone Bowl Bibimbap',price:13.50,kcal:790,tags:[],badges:['hal'],
 img:ASSETS2.bibim,em:'🍳',tint:'#EBD9BE',tint2:'#DEC49D',canMenu:true,
 choice:['protein','spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame','egg'],
 desc:{en:'Korean classic with crispy rice crust, veggies and a fried egg.',
       nl:'Koreaanse klassieker met krokante rijstkorst, groenten en spiegelei.',
       mk:'Корејски класик со крцкава кора од ориз, зеленчук и пржено јајце.'}},
{id:'bulgogi',cat:'stonebowl',name:'Stone Bowl Bulgogi',price:14.50,kcal:840,tags:[],badges:['spc'],
 img:ASSETS2.bulgogi,em:'🔥',tint:'#E7CDB4',tint2:'#D9B48E',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame'],
 desc:{en:'Sweet-savoury beef bulgogi with gochujang kick and spring onion.',
       nl:'Zoet-hartige bulgogi van rund met gochujang en bosui.',
       mk:'Слатко-солен булгоги од говедско со гочуџанг и млад кромид.'}},
{id:'tofudolsot',cat:'stonebowl',name:'Stone Bowl Garden',price:12.50,kcal:640,tags:[],badges:['veg'],
 img:ASSETS2.sbVeg,em:'🥬',tint:'#DCE6D0',tint2:'#C7D8B6',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['soy','sesame'],
 desc:{en:'Shiitake, pak choi, tofu and sesame on crackling jasmine rice.',
       nl:'Shiitake, paksoi, tofu en sesam op knisperende jasmijnrijst.',
       mk:'Шитаке, пак чој, тофу и сусам врз крцкав јасмин ориз.'}},

/* ── SUSHI ───────────────────────────────────────────────────── */
{id:'sushiplatter',cat:'sushi',name:'DADAWAN Platter (16 pcs)',price:18.90,kcal:920,tags:['special'],badges:['pop'],
 img:ASSETS.platter,em:'🍣',tint:'#E8D9C8',canMenu:false,
 mods:['sushiX','sushiR'],allergens:['fish','soy','sesame','gluten'],
 desc:{en:'Chef’s choice of our favourite maki and nigiri, made to share.',
       nl:'Keuze van de chef uit onze favoriete maki en nigiri, om te delen.',
       mk:'Избор на шефот од нашите омилени маки и нигири, за споделување.'}},
{id:'salmonroll',cat:'sushi',name:'Salmon Avocado Roll (8 pcs)',price:8.50,kcal:420,tags:['maki'],badges:[],
 img:ASSETS2.salRoll,em:'🍣',tint:'#E9D5C6',tint2:'#DDBFA6',canMenu:false,
 mods:['sushiX','sushiR'],allergens:['fish','soy','sesame'],
 desc:{en:'Eight pieces with fresh salmon, avocado and sesame.',
       nl:'Acht stuks met verse zalm, avocado en sesam.',
       mk:'Осум парчиња со свеж лосос, авокадо и сусам.'}},
{id:'chickenroll',cat:'sushi',name:'Crispy Chicken Roll (8 pcs)',price:8.90,kcal:510,tags:['maki'],badges:['hal'],
 img:ASSETS2.craRoll,em:'🍥',tint:'#EFDDC2',tint2:'#E2C89F',canMenu:false,
 mods:['sushiX','sushiR'],allergens:['gluten','soy','sesame','egg'],
 desc:{en:'Crunchy chicken, cucumber and spicy mayo — our East-West roll.',
       nl:'Krokante kip, komkommer en spicy mayo — onze Oost-West-rol.',
       mk:'Крцкаво пилешко, краставица и спајси мајонез — нашиот Исток-Запад рол.'}},
{id:'veggieroll',cat:'sushi',name:'Garden Roll (8 pcs)',price:6.90,kcal:340,tags:['maki'],badges:['veg'],
 img:ASSETS2.vegRoll,em:'🥒',tint:'#DBE6D2',tint2:'#C6D8B8',canMenu:false,
 mods:['sushiX','sushiR'],allergens:['soy','sesame'],
 desc:{en:'Avocado, cucumber, carrot and pickled radish.',
       nl:'Avocado, komkommer, wortel en ingelegde rammenas.',
       mk:'Авокадо, краставица, морков и кисела ротква.'}},
{id:'sakenigiri',cat:'sushi',name:'Nigiri Salmon (4 pcs)',price:7.50,kcal:260,tags:['nigiri'],badges:[],
 img:ASSETS2.nigSal,em:'🍣',tint:'#EAD2BE',tint2:'#DEBB9C',canMenu:false,
 mods:['sushiR'],allergens:['fish','soy'],
 desc:{en:'Hand-pressed rice topped with thick-cut salmon.',
       nl:'Handgevormde rijst met dikgesneden zalm.',
       mk:'Рачно обликуван ориз со дебело сечен лосос.'}},
{id:'unaginigiri',cat:'sushi',name:'Nigiri Unagi (4 pcs)',price:8.90,kcal:300,tags:['nigiri'],badges:['new'],
 img:ASSETS.nigUna,em:'🍢',tint:'#E4CBB0',tint2:'#D6B189',canMenu:false,
 mods:['sushiR'],allergens:['fish','soy','gluten','sesame'],
 desc:{en:'Grilled eel with sweet unagi glaze and sesame.',
       nl:'Gegrilde paling met zoete unagi-glaze en sesam.',
       mk:'Јагула на скара со слатка унаги глазура и сусам.'}},

/* ── JAPANESE RAMEN ──────────────────────────────────────────── */
{id:'tonkotsu',cat:'ramen',name:'Tonkotsu Ramen',price:13.90,
   servings:[{short:{en:'Regular',nl:'Regular',mk:'Средно'},sub:'± 450 g',price:13.90,love:true},{short:{en:'Large',nl:'Large',mk:'Големо'},sub:'± 600 g',price:16.50,compareAt:17.00}],kcal:720,tags:[],badges:['pop'],
 img:ASSETS2.tonkotsu,em:'🍜',tint:'#E7D4BC',canMenu:true,
 choice:['spice'],mods:['ramenX','ramenR'],allergens:['gluten','soy','egg','sesame'],
 desc:{en:'Rich 12-hour broth, chashu, ajitama egg, nori and spring onion.',
       nl:'Rijke 12-uursbouillon, chashu, ajitama-ei, nori en bosui.',
       mk:'Богат бульон од 12 часа, чашу, ајитама јајце, нори и млад кромид.'}},
{id:'misoRam',cat:'ramen',name:'Spicy Miso Ramen',price:13.50,kcal:690,tags:[],badges:['spc'],
 img:ASSETS2.misoRam,em:'🍜',tint:'#E9CDB2',tint2:'#DDB48D',canMenu:true,
 choice:['spice'],mods:['ramenX','ramenR'],allergens:['gluten','soy','egg','sesame'],
 desc:{en:'Miso broth with chili oil, corn, minced chicken and egg.',
       nl:'Misobouillon met chili-olie, maïs, kipgehakt en ei.',
       mk:'Мисо бульон со чили масло, пченка, мелено пилешко и јајце.'}},
{id:'shiitakeramen',cat:'ramen',name:'Shiitake Ramen',price:12.50,kcal:590,tags:[],badges:['veg'],
 img:ASSETS2.vegRam,em:'🍄',tint:'#DFE3CF',tint2:'#CBD3B3',canMenu:true,
 choice:['spice'],mods:['ramenX','ramenR'],allergens:['gluten','soy','sesame'],
 desc:{en:'Shoyu-mushroom broth, shiitake, pak choi and crispy tofu.',
       nl:'Shoyu-paddenstoelenbouillon, shiitake, paksoi en krokante tofu.',
       mk:'Шоју бульон од печурки, шитаке, пак чој и крцкаво тофу.'}},

/* ── CURRY ───────────────────────────────────────────────────── */
{id:'greenCur',cat:'curry',name:'Thai Green Curry',price:12.90,kcal:680,tags:[],badges:['pop','spc'],
 img:ASSETS2.greenCur,em:'🍛',tint:'#DEE4CC',canMenu:true,
 choice:['protein','spice'],mods:['bowlX','bowlR'],allergens:['shell','soy'],
 desc:{en:'Fragrant green curry with coconut, Thai basil and jasmine rice.',
       nl:'Geurige groene curry met kokos, Thaise basilicum en jasmijnrijst.',
       mk:'Мирислив зелен кари со кокос, тајландски босилек и јасмин ориз.'}},
{id:'katsu',cat:'curry',name:'Chicken Katsu Curry',price:12.50,kcal:760,tags:[],badges:['hal'],
 img:ASSETS2.katsu,em:'🍛',tint:'#EBD8B8',tint2:'#DFC493',canMenu:true,
 choice:['spice'],mods:['bowlR'],allergens:['gluten','soy','egg','mustard'],
 desc:{en:'Panko-crusted chicken, silky Japanese curry and sticky rice.',
       nl:'Kip in pankokorst, zijdezachte Japanse curry en kleefrijst.',
       mk:'Пилешко во панко кора, кадифен јапонски кари и леплив ориз.'}},
{id:'redCur',cat:'curry',name:'Red Coconut Curry',price:11.90,kcal:640,tags:[],badges:['veg'],
 img:ASSETS2.redCur,em:'🥥',tint:'#EDD3C2',tint2:'#E0BCA4',canMenu:true,
 choice:['spice'],mods:['bowlX','bowlR'],allergens:['soy'],
 desc:{en:'Red curry with sweet potato, tofu, snow peas and lime.',
       nl:'Rode curry met zoete aardappel, tofu, peultjes en limoen.',
       mk:'Црвен кари со сладок компир, тофу, грашок и лајм.'}},

/* ── SIDE DISHES ─────────────────────────────────────────────── */
{id:'gyoza',cat:'sides',name:'Gyoza',price:5.50,kcal:310,tags:[],badges:['pop'],
 img:ASSETS2.gyoza,em:'🥟',tint:'#EADCC4',canMenu:false,
 choice:['gyozaN'],mods:['dips'],allergens:['gluten','soy','sesame'],
 desc:{en:'Pan-fried chicken dumplings with soy-vinegar dip.',
       nl:'Gebakken kip-dumplings met soja-azijndip.',
       mk:'Пржени пилешки кнедли со соја-оцет прелив.'}},
{id:'springR',cat:'sides',name:'Vegetable Spring Rolls',price:4.50,kcal:280,tags:[],badges:['veg'],
 img:ASSETS2.springR,em:'🌯',tint:'#E6DCC2',tint2:'#D7C79E',canMenu:false,
 mods:['dips'],allergens:['gluten','soy','celery'],
 desc:{en:'Crispy rolls filled with glass noodles and vegetables.',
       nl:'Krokante loempia’s gevuld met glasnoedels en groenten.',
       mk:'Крцкави ролнички полнети со стаклени нудли и зеленчук.'}},
{id:'edamame',cat:'sides',name:'Edamame Sea Salt',price:4.20,kcal:180,tags:[],badges:['veg'],
 img:ASSETS2.edamame,em:'🌱',tint:'#D8E4CC',tint2:'#C2D6AE',canMenu:false,
 mods:['dips'],allergens:['soy'],
 desc:{en:'Steamed soybeans with flaky sea salt.',
       nl:'Gestoomde sojaboontjes met zeezoutvlokken.',
       mk:'Соја на пареа со морска сол.'}},
{id:'kimchi',cat:'sides',name:'Kimchi',price:3.90,kcal:90,tags:[],badges:['spc'],
 img:ASSETS2.kimchi,em:'🥬',tint:'#EBD2C2',tint2:'#DFB9A2',canMenu:false,
 allergens:['fish','celery'],
 desc:{en:'House-fermented spicy cabbage, tangy and fiery.',
       nl:'Huisgefermenteerde pittige kool, fris en vurig.',
       mk:'Домашно ферментирана лута зелка, кисела и огнена.'}},
{id:'crackers',cat:'sides',name:'Prawn Crackers',price:3.50,kcal:220,tags:[],badges:[],
 img:ASSETS2.crackers,em:'🍤',tint:'#F1E2CC',tint2:'#E5CFA9',canMenu:false,
 mods:['dips'],allergens:['shell'],
 desc:{en:'Light and crunchy, made for dipping.',
       nl:'Licht en knapperig, gemaakt om te dippen.',
       mk:'Лесни и крцкави, создадени за потопување.'}},
{id:'misoSoup',cat:'sides',name:'Miso Soup',price:3.50,kcal:90,tags:[],badges:[],
 img:ASSETS2.misoSoup,em:'🍲',tint:'#E4D2BC',tint2:'#D3BB9C',canMenu:false,
 allergens:['soy'],
 desc:{en:'Comforting miso broth with tofu, wakame and spring onion.',
       nl:'Troostrijke misobouillon met tofu, wakame en bosui.',
       mk:'Утешен мисо бульон со тофу, вакаме и млад кромид.'}},
{id:'swFries',cat:'sides',name:'Sweet Potato Fries',price:4.90,kcal:390,tags:[],badges:['new'],
 img:ASSETS.fries,em:'🍟',tint:'#EFD8B8',tint2:'#E3C392',canMenu:false,
 mods:['dips'],allergens:[],
 desc:{en:'Crispy sweet potato fries with togarashi salt.',
       nl:'Krokante zoete-aardappelfriet met togarashi-zout.',
       mk:'Крцкав помфрит од сладок компир со тогараши сол.'}},

/* ── DRINKS (systematic flavour tiles, by design) ────────────── */
{id:'cola',cat:'drinks',name:'Coca-Cola',price:2.90,kcal:170,tags:[],badges:[],
 img:ASSETS2.cola,em:'🥤',tint:'#E4D2C0',tint2:'#D4BAA0',canMenu:false,choice:['drinkSize'],allergens:[],
 desc:{en:'Ice-cold classic Coca-Cola.',nl:'IJskoude klassieke Coca-Cola.',mk:'Ледена класична Кока-Кола.'}},
{id:'colazero',cat:'drinks',name:'Coca-Cola Zero',price:2.90,kcal:1,tags:[],badges:['pop'],
 img:ASSETS2.colazero,em:'🥤',tint:'#DCD9D2',tint2:'#C5C1B8',canMenu:false,choice:['drinkSize'],allergens:[],
 desc:{en:'All the taste, zero sugar.',nl:'Alle smaak, nul suiker.',mk:'Целиот вкус, нула шеќер.'}},
{id:'sprite',cat:'drinks',name:'Sprite',price:2.90,kcal:130,tags:[],badges:[],
 img:ASSETS2.sprite,em:'🍋',tint:'#E0EBD6',tint2:'#CBDfBE',canMenu:false,choice:['drinkSize'],allergens:[],
 desc:{en:'Crisp lemon-lime sparkle.',nl:'Frisse citroen-limoen bubbels.',mk:'Свежи меурчиња од лимон и лимета.'}},
{id:'water',cat:'drinks',name:'Still Water',price:2.50,kcal:0,tags:[],badges:[],
 img:ASSETS2.water,em:'💧',tint:'#DAE7EE',tint2:'#C2D8E5',canMenu:false,choice:['drinkSize'],allergens:[],
 desc:{en:'Pure still spring water.',nl:'Puur plat bronwater.',mk:'Чиста негазирана изворска вода.'}},
{id:'oj',cat:'drinks',name:'Fresh Orange Juice',price:3.90,kcal:180,tags:[],badges:[],
 img:ASSETS2.oj,em:'🧃',tint:'#F5E0B4',tint2:'#EBCB8A',canMenu:false,allergens:[],
 desc:{en:'Squeezed to order, 100% orange.',nl:'Vers geperst, 100% sinaasappel.',mk:'Свежо исцеден, 100% портокал.'}},
{id:'greentea',cat:'drinks',name:'Iced Green Tea',price:2.90,kcal:60,tags:[],badges:[],
 img:ASSETS2.greentea,em:'🍵',tint:'#DCE6CE',tint2:'#C6D8B2',canMenu:false,choice:['drinkSize'],allergens:[],
 desc:{en:'Cold-brewed jasmine green tea, lightly sweetened.',
       nl:'Koudgezette jasmijn-groene thee, licht gezoet.',
       mk:'Ладно варен јасмин зелен чај, малку засладен.'}},
{id:'lychee',cat:'drinks',name:'Lychee Lemonade',price:3.50,kcal:120,tags:[],badges:['new'],
 img:ASSETS.lychee,em:'🍈',tint:'#F2DDD6',tint2:'#E8C6BC',canMenu:false,choice:['drinkSize'],allergens:[],
 desc:{en:'Sparkling lemonade with lychee and lime.',
       nl:'Bruisende limonade met lychee en limoen.',
       mk:'Газирана лимонада со личи и лајм.'}},

/* ── DESSERTS ────────────────────────────────────────────────── */
{id:'mochi',cat:'desserts',name:'Mochi Trio',price:4.90,kcal:280,tags:[],badges:['pop'],
 img:ASSETS2.mochi,em:'🍡',tint:'#EBDCE0',tint2:'#DEC5CC',canMenu:false,
 choice:['mochiFl'],allergens:['soy','milk'],
 desc:{en:'Three soft rice-dough bites with ice cream hearts.',
       nl:'Drie zachte rijstdeeg-bites met een hart van ijs.',
       mk:'Три меки залачиња од оризово тесто со срце од сладолед.'}},
{id:'matcha',cat:'desserts',name:'Matcha Cheesecake',price:5.50,kcal:410,tags:[],badges:['new'],
 img:ASSETS2.matcha,em:'🍵',tint:'#DCE6CC',tint2:'#C7D9AE',canMenu:false,
 allergens:['gluten','milk','egg'],
 desc:{en:'Silky baked cheesecake with ceremonial matcha.',
       nl:'Zijdezachte cheesecake met ceremoniële matcha.',
       mk:'Кадифен чизкејк со церемонијална матча.'}},
{id:'mangoR',cat:'desserts',name:'Mango Sticky Rice',price:5.90,kcal:430,tags:[],badges:[],
 img:ASSETS2.mangoR,em:'🥭',tint:'#F4E0B6',tint2:'#EACB8C',canMenu:false,
 allergens:['soy'],
 desc:{en:'Warm coconut sticky rice with fresh mango and sesame.',
       nl:'Warme kokoskleefrijst met verse mango en sesam.',
       mk:'Топол кокосов леплив ориз со свежо манго и сусам.'}},
{id:'banana',cat:'desserts',name:'Banana Fritters',price:4.50,kcal:390,tags:[],badges:[],
 img:ASSETS2.banana,em:'🍌',tint:'#F1E0BC',tint2:'#E6CC96',canMenu:false,
 allergens:['gluten','egg'],
 desc:{en:'Golden-fried banana with palm sugar caramel.',
       nl:'Goudgebakken banaan met palmsuikerkaramel.',
       mk:'Златно пржена банана со карамел од палмин шеќер.'}},
];

/* combo upgrade for mains: + 2 gyoza + drink */
const MENU_DEAL={ price:4.50, side:'gyoza',
  sideLabel:{en:'2 gyoza',nl:'2 gyoza',mk:'2 гиоза'},
  drinks:['cola','colazero','sprite','water','greentea'] };

/* ── COMMERCIAL CMS MODEL (engine-generic; portable to React / Compose) ──
   Every option carries a ROLE. The role decides which renderer draws it:
     menu-upgrade          → the dominant full-width menu card (Flow A only)
     product-enhancement   → "make your bowl even better" photo cards
     cross-sell            → "extra tasty on the side" photo cards
     premium-drink-upgrade → paid drink cards inside the menu drink picker
   A sauce can be a required-modification on the steak (MODS group, req:true)
   and a product-enhancement on the Poké Bowl — same ingredient, different role.
   targetOrderValue is an analytics / merchandising objective only: it never
   preselects, never auto-adds and never charges anything.                       */
/* ══════════════════════════════════════════════════════════════
   GUESTIT_CMS — the shared contract with the eMenu (copied verbatim).
   Same object, same field names in both apps; inline for now, later one
   JSON/endpoint. Product ids are unified with the eMenu catalog, so the
   upsell blocks below are literally interchangeable between the apps.
   ══════════════════════════════════════════════════════════════ */
const GUESTIT_CMS={
  version:1,
  brand:{
    money:{symbol:'',decimals:','},
    controls:{shape:'square',radius:12}
  },
  badges:{pop:{label:'Populair'},new:{label:'Nieuw'},halal:{label:'Halal'},veg:{label:'Vega',icon:'check'},share:{label:'Om te delen'},feat:{label:'Uitgelicht',color:'#ff2d8f'},spicy:{label:'Pittig',icon:'chili'}},
  categories:{
    sushi:{presentation:{card:'compact',columns:{kiosk:3,tablet:2,tabletWide:3}}}
  },
  upsell:{
    blocks:[
      {id:'finishMains',role:'category-finish',enabled:true,priority:10,target:{cats:['menu','popular','sushi']},
       title:'Maak het helemaal af',subtitle:'Lekker erbij',display:{mode:'compact-horizontal',maxVisible:4},
       items:[{pid:'edamame'},{pid:'gyoza'},{pid:'kimchi'},{pid:'misoSoup'}]},
      {id:'finishDrinks',role:'category-finish',enabled:true,priority:10,target:{cats:['beers','wines','cocktails']},
       title:'Maak het helemaal af',subtitle:'Borrelhapjes erbij',display:{mode:'compact-horizontal',maxVisible:4},
       items:[{pid:'springR'},{pid:'edamame'},{pid:'gyoza'}]},
      {id:'finishSofts',role:'category-finish',enabled:true,priority:10,target:{cats:['softs']},
       title:'Maak het helemaal af',subtitle:'Iets zoets erbij',display:{mode:'compact-horizontal',maxVisible:4},
       items:[{pid:'mochi'},{pid:'matcha'},{pid:'mangoR'}]},
      {id:'cartInspire',role:'cart-inspire',enabled:true,priority:10,
       title:{nl:'Nog iets erbij?',en:'Anything else?',mk:'Уште нешто?'},subtitle:{nl:'Vaak samen besteld',en:'Often ordered together',mk:'Често нарачано заедно'},
       items:[{pid:'mochi'},{pid:'matcha'}],link:{cat:'desserts',label:'Bekijk alle desserts'}}
    ]
  }
};
/* kiosk category ids that the shared blocks target under their eMenu names */
const CMS_CAT_ALIAS={ menu:['pokewan','stoneplate','stonebowl','ramen','curry'], popular:['popular'], sushi:['sushi'],
  softs:['drinks'], beers:[], wines:[], cocktails:[], desserts:['desserts'], sides:['sides'] };
const cmsCatsFor=t=>(t&&t.cats||[]).flatMap(c=>CMS_CAT_ALIAS[c]||[c]);
const cmsBlocks=role=>((GUESTIT_CMS.upsell||{}).blocks||[]).filter(b=>b.enabled&&b.role===role).sort((a,b)=>(a.priority||0)-(b.priority||0));
const cmsBadge=id=>(GUESTIT_CMS.badges||{})[BADGE_ALIAS[id]||id]||null;
const BADGE_ALIAS={spc:'spicy',hal:'halal',dea:'feat'};
const UPSELL_CMS={
  upsellSettings:{
    enabled:true, showMenuUpgrade:true,
    maxProductEnhancementsVisible:3, maxCrossSellsVisible:3,
    showAllEnhancementsAction:true, showAllCrossSellsAction:false,
    showPriceSummary:true,
    crossSellDisplay:{ mode:'compact-horizontal', maxVisible:3 },   /* 'compact-horizontal' | 'collapsed' | 'grid' */
    targetOrderValue:{ minimum:16.00, maximum:20.00 },
  },
  sections:{
    enhancements:{
      default:{ title:{en:'Make your dish complete',nl:'Maak je gerecht compleet',mk:'Заокружи го јадењето'} } },
    crossSells:{
      default:{ title:{en:'Nice with it',nl:'Lekker erbij',mk:'Убаво покрај'} } },
  },
  menuUpgrade:{ id:'vuMenu', role:'menu-upgrade', enabled:true, priority:0, target:{canMenu:true},
    title:{en:'Make it a menu',nl:'Maak er een menu van',mk:'Направи го мени'},
    incl:{en:'Gyoza + a drink of your choice',nl:'Gyoza + drankje naar keuze',mk:'Гиоза + пијалок по избор'},
    badge:{en:'Most chosen',nl:'Meest gekozen',mk:'Најизбирано'},
    includedProducts:[ { pid:'gyoza', qty:1, displayQuantity:{en:'2 pieces',nl:'2 stuks',mk:'2 парчиња'} },
                       { role:'included-drink', qty:1 } ],
    conflictsWithCrossSells:['xsGyoza'],
    conflictMode:'extra-portion' },          /* 'extra-portion' (relabel) | 'hide' */
  productEnhancements:[
    { id:'vuSalmon', role:'product-enhancement', enabled:true, recommended:true, priority:10, target:{cats:['pokewan']},
      price:3.50, img:ASSETS2.xSalmon, cut:true, tint:'#F7F3EA', shadows:[], badge:null, minSelections:0, maxSelections:1, maxQuantity:5,
      title:{en:'Extra salmon',nl:'Extra zalm',mk:'Екстра лосос'}, qtyLabel:{en:'80 g',nl:'80 g',mk:'80 г'},
      description:{en:'A generous extra portion',nl:'Een royale extra portie',mk:'Дарежлива дополнителна порција'} },
    { id:'vuAvo', role:'product-enhancement', enabled:true, recommended:true, priority:20, target:{cats:['pokewan']},
      price:1.50, img:ASSETS2.xAvocado, cut:true, tint:'#F2F6EC', shadows:[['bowlX','avo']], badge:null, minSelections:0, maxSelections:1, maxQuantity:5,
      title:{en:'Extra avocado',nl:'Extra avocado',mk:'Екстра авокадо'}, qtyLabel:{en:'½ avocado',nl:'½ avocado',mk:'½ авокадо'},
      description:{en:'Creamy and fresh',nl:'Romig en vers',mk:'Кремасто и свежо'} },
    { id:'vuSpMayo', role:'product-enhancement', enabled:true, recommended:true, priority:30, target:{cats:['pokewan']},
      price:0.80, img:ASSETS2.xMayo, cut:true, em:'🌶', tint:'#F7F3EA', shadows:[], badge:null, minSelections:0, maxSelections:1, maxQuantity:5,
      title:{en:'Spicy mayo',nl:'Spicy mayo',mk:'Спајси мајонез'}, qtyLabel:{en:'30 ml',nl:'30 ml',mk:'30 мл'},
      description:{en:'Creamy with a spicy kick',nl:'Romig met een pittige kick',mk:'Кремасто со лут вкус'} },
    { id:'vuVeg', role:'product-enhancement', enabled:true, recommended:false, priority:40, target:{cats:['pokewan']},
      price:1.80, img:ASSETS2.edamame, tint:'#D9E4CE', shadows:[['bowlX','edam']], badge:null, minSelections:0, maxSelections:1,
      title:{en:'Extra veggies',nl:'Extra groenten',mk:'Екстра зеленчук'},
      description:{en:'Edamame, cucumber and seaweed',nl:'Edamame, komkommer en zeewier',mk:'Едамаме, краставица и алги'} },
    { id:'vuCrunch', role:'product-enhancement', enabled:true, recommended:false, priority:50, target:{cats:['pokewan']},
      price:0.90, img:ASSETS.fries, tint:'#EBD9BE', shadows:[['bowlX','crisp']], badge:null, minSelections:0, maxSelections:1,
      title:{en:'Extra crunch',nl:'Extra crunch',mk:'Екстра крцкаво'},
      description:{en:'Crispy onions and sesame',nl:'Krokante uitjes en sesam',mk:'Крцкав кромид и сусам'} },
  ],
  crossSells:[
    { id:'xsGyoza', role:'cross-sell', enabled:true, recommended:true, priority:10, pid:'gyoza',
      target:{cats:['pokewan','stonebowl','stoneplate','curry','ramen','sushi']},
      priceVariantId:'gyoza-cross-sell', img:ASSETS2.gyozaCut, cut:true, tint:'#F7F3EA', badge:null, minSelections:0, maxSelections:1,
      title:{en:'Gyoza',nl:'Gyoza',mk:'Гиоза'}, qtyLabel:{en:'2 gyoza',nl:'2 gyoza',mk:'2 гиоза'} },
    { id:'xsSpring', role:'cross-sell', enabled:true, recommended:true, priority:20, pid:'springR',
      target:{cats:['pokewan','stonebowl','stoneplate','curry','ramen','sushi']},
      priceVariantId:'springR-cross-sell', img:ASSETS2.springRCut, cut:true, tint:'#F7F3EA', badge:null, minSelections:0, maxSelections:1,
      title:{en:'Mini spring rolls',nl:'Mini-loempia’s',mk:'Мини пролетни ролнички'}, qtyLabel:{en:'6 mini spring rolls',nl:'6 mini-loempia’s',mk:'6 мини ролнички'} },
    { id:'xsEdam', role:'cross-sell', enabled:true, recommended:true, priority:30, pid:'edamame',
      target:{cats:['pokewan','stonebowl','stoneplate','curry','ramen','sushi']},
      priceVariantId:'edamame-cross-sell', img:ASSETS2.edamameCut, cut:true, tint:'#F2F6EC', badge:null, minSelections:0, maxSelections:1,
      title:{en:'Edamame',nl:'Edamame',mk:'Едамаме'}, qtyLabel:{en:'Edamame · 150 g',nl:'Edamame · 150 g',mk:'Едамаме · 150 г'} },
  ],
  premiumDrinks:[
    { id:'vuLychee', role:'premium-drink-upgrade', enabled:true, priority:10, pid:'lychee', priceVariantId:'lychee-menu-upgrade', target:{canMenu:true},
      description:{en:'Sparkling, floral, ice-cold',nl:'Bruisend, bloemig, ijskoud',mk:'Газирана, цветна, ледена'} },
    { id:'vuOj', role:'premium-drink-upgrade', enabled:true, priority:20, pid:'oj', priceVariantId:'oj-menu-upgrade', target:{canMenu:true},
      description:{en:'Freshly squeezed',nl:'Vers geperst',mk:'Свежо исцеден'} },
  ],
};
/* ── PRICING ENGINE ─────────────────────────────────────────────
   Catalog (PRODUCTS / MODS / MENU_DEAL) = authoritative current price.
   PRICE_VARIANTS = named promotional variants of a catalog product.
   Merchandising CMS references `pid` + optional `priceVariantId`; it never
   carries a price of its own. Cart lines keep a validated price snapshot.
   All amounts are INTEGER MINOR UNITS (cents) after normalizeMoney().     */
const PRICE_VARIANTS={
  'gyoza-cross-sell':   { pid:'gyoza',   price:350 },
  'springR-cross-sell': { pid:'springR', price:290 },
  'edamame-cross-sell': { pid:'edamame', price:250 },
  'lychee-menu-upgrade':{ pid:'lychee',  price:150 },
  'oj-menu-upgrade':    { pid:'oj',      price:120 },
};
const toMinorUnits=x=>Math.round(x*100);
const sumMoney=(...xs)=>xs.reduce((a,b)=>a+(b|0),0);
function resolvePrice(v){                       /* CMS item → validated price from the catalog */
  if(v.priceVariantId){ const pv=PRICE_VARIANTS[v.priceVariantId];
    if(!pv||pv.pid!==v.pid) throw new Error('invalid price variant '+v.priceVariantId+' for '+v.pid);
    return pv.price; }
  if(v.pid) return byId(v.pid).price;
  if(typeof v.price==='number') return v.price;  /* modifier catalog items (product enhancements) */
  throw new Error('no price source for '+v.id);
}
const priceOf=v=>resolvePrice(v);
/* role → extras group in the draft: pricing, cfgKey, cart summary and
   edit-restore reuse the ordinary modifier engine through these groups   */
const ROLE_GROUP={ 'product-enhancement':'premX' };   /* cross-sells live in d.xsell → independent lines */
MODS.premX={ label:{en:'Premium extras',nl:'Premium extra’s',mk:'Премиум додатоци'}, type:'extra',
  items:UPSELL_CMS.productEnhancements.map(v=>{ const it={id:v.id, name:v.title}; Object.defineProperty(it,'price',{get:()=>v.price,enumerable:true}); return it; }) };
const cmsTargets=(v,p)=>{ const g=v.target||{};
  if(g.products&&!g.products.includes(p.id)) return false;
  if(g.cats&&!g.cats.includes(p.cat)) return false;
  if(g.canMenu&&!p.canMenu) return false;
  return !!(g.products||g.cats||g.canMenu); };
const cmsList=(arr,p)=>(arr||[]).filter(v=>v.enabled!==false&&cmsTargets(v,p)&&!(v.pid&&alHidden(byId(v.pid))))
  .sort((a,b)=>(a.priority??99)-(b.priority??99));
const cmsById=id=>[...UPSELL_CMS.productEnhancements,...UPSELL_CMS.crossSells,...UPSELL_CMS.premiumDrinks]
  .find(v=>v.id===id);
/* v31: a menu drink is valid when it is an included drink OR a paid upgrade drink offered for this product */
const menuDrinkOk=l=>MENU_DEAL.drinks.includes(l.drink)||cmsList(UPSELL_CMS.premiumDrinks,byId(l.pid)).some(v=>v.pid===l.drink);
const drinkUp=id=>{ const v=UPSELL_CMS.premiumDrinks.find(x=>x.pid===id); return v?priceOf(v):0; };
/* the ONLY place product-specific decisions are made: returns a normalised
   productExperience the renderers consume without further conditions       */
function experienceFor(p){
  const st=UPSELL_CMS.upsellSettings, on=st.enabled!==false&&BRAND.features.visualUpsells!==false;
  const groups=(p.choice||[]).map(g=>({ id:g, label:MODS[g].label, required:!!MODS[g].req, options:MODS[g].items }));
  const allEnh=on?cmsList(UPSELL_CMS.productEnhancements,p):[];
  const ownGroup=(S.editing&&S.cart.find(l=>l.lid===S.editing))||null, ordered=new Set(S.cart.filter(l=>!l.reward&&(!ownGroup||l.groupId!==ownGroup.groupId)).map(l=>l.pid));
  const allXs =on?cmsList(UPSELL_CMS.crossSells,p).filter(v=>!ordered.has(v.pid)||(S.draft&&xsSel(S.draft,v.id))):[];   /* no re-push of ordered products */
  const drinks=on?cmsList(UPSELL_CMS.premiumDrinks,p):[];
  const mu=UPSELL_CMS.menuUpgrade;
  const menuUpgrade=(on&&st.showMenuUpgrade&&mu&&mu.enabled!==false&&p.canMenu&&cmsTargets(mu,p)&&!alHidden(byId(MENU_DEAL.side)))?mu:null;
  const explicit=p.experience&&p.experience.flowType;
  /* the flow is decided ONLY by whether upsells exist; required choices are rendered inside either flow (P0 fix) */
  const flowType=explicit||((menuUpgrade||allEnh.length||allXs.length)?'visual-upsell':'modification');
  return { flowType, modificationGroups:groups, menuUpgrade, allEnhancements:allEnh, allCrossSells:allXs,
    productEnhancements:allEnh.slice(0,st.maxProductEnhancementsVisible||allEnh.length),
    crossSells:allXs.slice(0,st.maxCrossSellsVisible||allXs.length),
    premiumDrinks:drinks, upsellSettings:st,
    sectionEnh:UPSELL_CMS.sections.enhancements[p.cat]||UPSELL_CMS.sections.enhancements.default,
    sectionXs:UPSELL_CMS.sections.crossSells[p.cat]||UPSELL_CMS.sections.crossSells.default };
}
/* ── conflict engine: menu included-products vs cross-sells (CMS-driven) ── */
const xsConflicts=(v,d)=>!!(d.menu&&UPSELL_CMS.menuUpgrade&&(UPSELL_CMS.menuUpgrade.conflictsWithCrossSells||[]).includes(v.id));
/* draft.crossSells = [{ id, quantity, extraPortion }] — unique ids, explicit quantity */
const xsSel=(d,id)=>(d.crossSells||[]).find(x=>x.id===id);
const xsSelected=(d,id)=>!!xsSel(d,id);
const xsPortion=(d,id)=>!!(xsSel(d,id)||{}).extraPortion;
function xsSet(d,id,patch){ d.crossSells=d.crossSells||[]; let e=xsSel(d,id);
  if(!e){ e={id,quantity:1,extraPortion:false}; d.crossSells.push(e); }
  Object.assign(e,patch||{}); e.quantity=Math.max(1,e.quantity|0); return e; }
const xsRemove=(d,id)=>{ d.crossSells=(d.crossSells||[]).filter(x=>x.id!==id); };
const xsIds=d=>(d.crossSells||[]).map(x=>x.id);
const xsKey=d=>(d.crossSells||[]).map(x=>x.id+':'+x.quantity+(x.extraPortion?'p':'')).sort().join(',');
const xsVisible=(v,d)=>!(xsConflicts(v,d)&&UPSELL_CMS.menuUpgrade.conflictMode==='hide'&&!xsSelected(d,v.id));
const xsTitle=(v,d,portion)=>(portion||(xsConflicts(v,d)&&xsSelected(d,v.id)&&xsPortion(d,v.id)))
  ? `${t('extraPortion')} ${L(v.title).toLowerCase()}` : L(v.title);
const xsSum=d=>(d.crossSells||[]).reduce((a,x)=>{ const v=cmsById(x.id); return a+(v?priceOf(v)*x.quantity:0); },0);
/* one combined amount for the CTA: main line total + independent cross-sell lines */
/* enhancements may be taken more than once (CMS `maxQuantity`, default 1) */
/* ══════════════════════════════════════════════════════════════
   PERFORMANCE MODE — the weakest supported device sets the budget.
   'normal' | 'low' | 'auto'.  Override: ?perf=low|normal, or BRAND.performance.mode.
   LOW keeps the full UX but drops decorative cost: blurred backdrops,
   drop-shadow filters, looping animations, the shared-element flight,
   staggered reveals and the receding shell. Everything reads PERF.low.
   ══════════════════════════════════════════════════════════════ */
const PERF=(()=>{
  const q=(location.search.match(/[?&]perf=(low|normal)\b/)||[])[1];
  const cfg=((typeof BRAND!=='undefined'&&BRAND.performance)||{}).mode||'auto';
  const ua=navigator.userAgent||'', android=/Android/i.test(ua), webview=/; wv\)|Version\/\d+\.\d+ Chrome/.test(ua)&&android;
  const chrome=+((ua.match(/Chrome\/(\d+)/)||[])[1]||0), andVer=+((ua.match(/Android (\d+)/)||[])[1]||0);
  const mem=navigator.deviceMemory||0, cores=navigator.hardwareConcurrency||0;
  let mode=q||cfg, reason=q?'url':cfg!=='auto'?'config':'';
  if(mode==='auto'){
    /* "when in doubt → low": Android/WebView must PROVE it is strong; unknown signals count as weak */
    const strongAndroid=mem>=8&&cores>=8&&chrome>=110&&andVer>=11&&!webview;
    if(android) { mode=strongAndroid?'normal':'low'; reason=strongAndroid?'android-strong':'android-default'; }
    else if((mem&&mem<=4)||(cores&&cores<=4)) { mode='low'; reason='weak-cpu-or-memory'; }
    else if(chrome&&chrome<100) { mode='low'; reason='old-chromium'; }
    else { mode='normal'; reason='desktop-class'; }
  }
  const P={ mode, low:mode==='low', reason, auto:!q&&cfg==='auto', info:{ android, webview, chrome, androidVersion:andVer, deviceMemory:mem||null, hardwareConcurrency:cores||null, userAgent:ua } };
  document.documentElement.classList.toggle('perf-low',P.low);
  /* runtime probe (auto only): 45 frames after start; a median frame > 22 ms or a dropped-frame ratio > 25 % demotes to LOW for the session */
  if(P.auto&&!P.low&&typeof requestAnimationFrame!=='undefined'&&typeof performance!=='undefined'){
    const fr=[]; let last=0;
    const tick=t=>{ if(last) fr.push(t-last); last=t; if(fr.length<45) requestAnimationFrame(tick); else {
      const sorted=fr.slice().sort((a,b)=>a-b), med=sorted[fr.length>>1], drop=fr.filter(x=>x>25).length/fr.length;
      P.probe={ medianFrameMs:Math.round(med*10)/10, droppedRatio:Math.round(drop*100)/100 };
      if(med>22||drop>0.25){ P.mode='low'; P.low=true; P.reason='runtime-frame-probe'; document.documentElement.classList.add('perf-low'); } } };
    setTimeout(()=>requestAnimationFrame(tick),1200); }
  return P;
})();
/* action → first paint → settled paint, long tasks, FPS sample; read with gtPerf() or the 7-tap overlay */
const PERF_LOG={ actions:[], long:[], max:0 };
try{ new PerformanceObserver(l=>l.getEntries().forEach(e=>{ PERF_LOG.long.push(Math.round(e.duration)); if(PERF_LOG.long.length>200) PERF_LOG.long.shift();
  PERF_LOG.max=Math.max(PERF_LOG.max,Math.round(e.duration)); })).observe({entryTypes:['longtask']}); }catch(e){}
const PERF_NAMES={cat:'goCategory',prod:'openProduct',promo:'openProduct',backProduct:'closeProduct',quickAdd:'quickAdd',addOrder:'addToCart',
  viewOrder:'openCart',cartQty:'changeQuantity',cardInc:'changeQuantity',cardDec:'changeQuantity',draftQty:'changeQuantity',toPay:'startPayment'};
function perfMark(a){ const name=PERF_NAMES[a]; if(!name||typeof requestAnimationFrame==='undefined'||typeof performance==='undefined') return;
  const t0=performance.now();
  requestAnimationFrame(()=>{ const t1=performance.now(); requestAnimationFrame(()=>{ const t2=performance.now();
    PERF_LOG.actions.push({name,feedback:Math.round(t1-t0),paint:Math.round(t2-t0),at:Date.now()}); if(PERF_LOG.actions.length>100) PERF_LOG.actions.shift(); }); }); }
/* frame sampler: cheap rAF counter that only runs while someone is measuring (never in production idle) */
const FPS_S={ on:false, samples:[] };
function fpsStart(){ if(FPS_S.on||typeof requestAnimationFrame==='undefined') return; FPS_S.on=true; let n=0, t0=performance.now();
  const f=t=>{ n++; if(t-t0>=1000){ FPS_S.samples.push(Math.round(n*1000/(t-t0))); if(FPS_S.samples.length>120) FPS_S.samples.shift(); n=0; t0=t; }
    if(FPS_S.on) requestAnimationFrame(f); }; requestAnimationFrame(f); }
const pct=(arr,p)=>{ if(!arr.length) return null; const a=arr.slice().sort((x,y)=>x-y); return a[Math.min(a.length-1,Math.floor(p*a.length))]; };
const PERF_START=(typeof performance!=='undefined'&&performance.now)?performance.now():0;
/* development/test API — in production mode only with ?debug (never any visible UI) */
const GUESTIT_PERF_API={
  start(){ fpsStart(); return 'sampling FPS'; },
  stop(){ FPS_S.on=false; return 'stopped'; },
  report(){
    const lat=PERF_LOG.actions.map(a=>a.paint), by=n=>PERF_LOG.actions.filter(a=>a.name===n).map(a=>a.paint);
    const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;
    const nav=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||null;
    return {
      mode:PERF.mode, modeReason:PERF.reason, probe:PERF.probe||null,
      fps:{ average:avg(FPS_S.samples), lowest:FPS_S.samples.length?Math.min(...FPS_S.samples):null, samples:FPS_S.samples.length, sampling:FPS_S.on },
      longTasks:{ count:PERF_LOG.long.length, longestMs:PERF_LOG.max, over50:PERF_LOG.long.filter(x=>x>50).length, over100:PERF_LOG.long.filter(x=>x>100).length },
      interactionLatencyMs:{ average:avg(lat), p95:pct(lat,.95), samples:lat.length },
      startup:{ domInteractiveMs:nav?Math.round(nav.domInteractive):null, loadMs:nav?Math.round(nav.loadEventEnd):null, appReadyMs:APP_READY_MS },
      flows:{ productOpenMs:{avg:avg(by('openProduct')),p95:pct(by('openProduct'),.95)}, categorySwitchMs:{avg:avg(by('goCategory')),p95:pct(by('goCategory'),.95)},
              basketOpenMs:{avg:avg(by('openCart')),p95:pct(by('openCart'),.95)}, checkoutTransitionMs:{avg:avg(by('startPayment')),p95:pct(by('startPayment'),.95)},
              quantityChangeMs:{avg:avg(by('changeQuantity')),p95:pct(by('changeQuantity'),.95)} },
      dom:{ nodes:document.getElementsByTagName('*').length, images:document.images.length },
      device:PERF.info };
  } };
let APP_READY_MS=null;
window.gtPerf=function(ms){ ms=ms||1500; return new Promise(res=>{ let n=0; const t0=performance.now();
  const f=()=>{ n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else {
    const by={}; PERF_LOG.actions.forEach(a=>{ (by[a.name]=by[a.name]||[]).push(a.paint); });
    const summ=Object.fromEntries(Object.entries(by).map(([k,v])=>[k,{n:v.length,median:v.slice().sort((a,b)=>a-b)[v.length>>1],max:Math.max(...v)}]));
    res({ mode:PERF.mode, fps:Math.round(n/((performance.now()-t0)/1000)), longTasks:PERF_LOG.long.length, maxLongTask:PERF_LOG.max,
      domNodes:document.getElementsByTagName('*').length, images:document.images.length, actions:summ }); } };
  requestAnimationFrame(f); }); };
const MAX_LINE_QTY=20;                       /* one limit for the editor, the cart and merging */
const clampQty=n=>Math.max(1,Math.min(MAX_LINE_QTY,n|0));
const exKey=(g,id)=>g+':'+id;
const exQty=(d,g,id)=>(d.extras||[]).some(([gg,ii])=>gg===g&&ii===id)?Math.max(1,((d.extraQty||{})[exKey(g,id)]|0)||1):0;
const exMax=id=>{ const v=cmsById(id); return Math.max(1,(v&&v.maxQuantity)||1); };
function exSet(d,g,id,n){
  d.extraQty=d.extraQty||{}; n=Math.max(0,Math.min(exMax(id),n|0));
  const i=(d.extras||[]).findIndex(([gg,ii])=>gg===g&&ii===id);
  if(n<=0){ if(i>=0) d.extras.splice(i,1); delete d.extraQty[exKey(g,id)]; return 0; }
  if(i<0) d.extras.push([g,id]);
  d.extraQty[exKey(g,id)]=n; return n;
}
const draftCombined=d=>unitPrice(d)*d.qty+xsSum(d);
/* ── SHARED VALIDATION (draft + cart, used by add / edit / review / pay) ──
   issues: [{code, lid?, group?, pid?}] — codes: required-choice, qty, unavailable, unavailable-included, price-changed */
const includedPids=d=>[d.pid, ...(d.menu?[MENU_DEAL.side, d.drink].filter(Boolean):[]), ...((d.crossSells||[]).map(x=>(cmsById(x.id)||{}).pid).filter(Boolean))];
/* which part of the composition is unavailable, and what the guest can do about it */
function unavailParts(d){
  const na=new Set(availabilityService.checkProducts(includedPids(d)));
  const out=[];
  if(na.has(d.pid)) out.push({pid:d.pid, role:'main', name:byId(d.pid).name});
  if(d.menu&&na.has(MENU_DEAL.side)) out.push({pid:MENU_DEAL.side, role:'menu-side', name:byId(MENU_DEAL.side).name, fix:'menu'});
  if(d.menu&&d.drink&&na.has(d.drink)) out.push({pid:d.drink, role:'menu-drink', name:byId(d.drink).name, fix:'drink'});
  (d.crossSells||[]).forEach(x=>{ const v=cmsById(x.id); const pid=v&&v.pid;
    if(pid&&na.has(pid)) out.push({pid, role:'cross-sell', id:x.id, name:byId(pid).name, fix:'xs'}); });
  return out;
}
function validateDraft(d,{availability=true}={}){
  const p=byId(d.pid), issues=[]; if(!p||p.disabled) return [{code:'product-missing',pid:d.pid}];
  issues.push(...validateLineStructure(d));
  (p.choice||[]).forEach(g=>{ if(MODS[g].req&&!d.choices[g]) issues.push({code:'required-choice',group:g}); });
  if(d.menu&&!d.drink) issues.push({code:'menu-drink'});                 /* R44: a menu needs its drink */
  if(!(Number.isInteger(d.qty)&&d.qty>=1&&d.qty<=MAX_LINE_QTY)) issues.push({code:'qty'});
  (d.crossSells||[]).forEach(x=>{ if(!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>MAX_LINE_QTY) issues.push({code:'qty',xs:x.id}); });
  if(availability){ const na=availabilityService.checkProducts(includedPids(d)); na.forEach(pid=>issues.push({code:pid===d.pid?'unavailable':'unavailable-included',pid})); }
  return issues;
}
function validateCart(){
  const issues=[];
  S.cart.forEach(l=>{ if(l.lineType==='cross-sell') { if(!(Number.isInteger(l.qty)&&l.qty>=1&&l.qty<=MAX_LINE_QTY)) issues.push({code:'qty',lid:l.lid}); if(availabilityService.checkProducts([l.pid]).length) issues.push({code:'unavailable',lid:l.lid,pid:l.pid}); return; }
    validateDraft(l).forEach(i=>issues.push({...i,lid:l.lid})); });
  revalidatePrices().forEach(c=>issues.push({code:'price-changed',lid:c.lid}));
  ltyCartIssues().forEach(i=>issues.push(i));            /* v28 loyalty: reserved points covered, redeemed with an order */
  return issues;
}
const lineNeedsChoice=l=>!l.reward&&l.lineType!=='cross-sell'&&validateDraft(l,{availability:false}).some(i=>i.code==='required-choice');
const draftValid=d=>validateDraft(d).length===0;
/* a blocked confirm always states WHY */
function blockReason(d){
  const iss=validateDraft(d);
  if(iss.some(i=>i.code.startsWith('unavailable'))) return tf('blockedUnavail',{list:unavailParts(d).map(x=>x.name).join(', ')});
  if(iss.some(i=>i.code==='required-choice')){ const g=firstIncomplete(d); return g?tf('r44Need',{group:L(MODS[g].label)}):t('blockedChoice'); }
  if(iss.some(i=>i.code==='menu-drink')) return t('r44NeedDrink');
  if(iss.some(i=>i.code==='qty')) return t('blockedQty');
  return iss.length?t('reqHint'):'';
}
const firstIncomplete=d=>{ const p=byId(d.pid);
  return (p.choice||[]).find(g=>MODS[g].req&&!d.choices[g])||null; };

/* landing-page campaigns — per-customer merchandising slots (CMS-driven) */
BRAND.promos=[
  { pid:'ddbowl', menu:true, img:ASSETS.hero,
    em:'🍚', tint:'#2A2620', tint2:'#171512',
    flag:{en:'Combo deal',nl:'Combo-deal',mk:'Комбо акција'},
    title:{en:'The DADAWAN Bowl, made a combo',nl:'The DADAWAN Bowl als combo',mk:'The DADAWAN Bowl како комбо'},
    sub:{en:'2 gyoza + a drink of your choice',nl:'2 gyoza + een drankje naar keuze',mk:'2 гиоза + пијалок по избор'} },
  { pid:'lychee', img:ASSETS.lychee, cut:true, em:'🍈', tint:'#F7EDEA', tint2:'#FFFFFF',   /* free-standing glass on a soft blush surface */
    flag:{en:'New',nl:'Nieuw',mk:'Ново'},
    title:{en:'Lychee Lemonade',nl:'Lychee Lemonade',mk:'Личи лимонада'},
    sub:{en:'Sparkling, floral, ice-cold',nl:'Bruisend, bloemig, ijskoud',mk:'Газирана, цветна, ледена'} },
  { pid:'sushiplatter', img:ASSETS2.ddPlatter, cut:true, em:'🍣', tint:'#F8F5EE', tint2:'#FFFFFF',   /* free-standing platter, same treatment as the product cards */
    flag:{en:'To share',nl:'Om te delen',mk:'За споделување'},
    title:{en:'DADAWAN Platter',nl:'DADAWAN Platter',mk:'DADAWAN плата'},
    sub:{en:'16 pieces of our chef favourites',nl:'16 stuks favorieten van de chef',mk:'16 парчиња омилени на шефот'} },
];

/* per-category header subtext (short, convincing) */
const CATSUB={
  popular:{en:'Guest favourites, ready in a tap',nl:'Favorieten van onze gasten',mk:'Омилени на гостите'},
  pokewan:{en:'Fresh. Colourful. Yours.',nl:'Vers. Kleurrijk. Van jou.',mk:'Свежо. Шарено. Твое.'},
  stoneplate:{en:'Sizzling from the kitchen',nl:'Sissend uit de keuken',mk:'Цврчи од кујната'},
  stonebowl:{en:'Hot stone, big flavour',nl:'Hete steen, groot van smaak',mk:'Врел камен, голем вкус'},
  sushi:{en:'Fresh. Authentic. Always special.',nl:'Vers. Authentiek. Altijd speciaal.',mk:'Свежо. Автентично. Секогаш посебно.'},
  ramen:{en:'12 hours of broth, one bowl',nl:'12 uur bouillon, één kom',mk:'12 часа бульон, една чинија'},
  curry:{en:'Fragrant, creamy, comforting',nl:'Geurig, romig, troostrijk',mk:'Мирисно, кремасто, утешно'},
  sides:{en:'Little dishes, big joy',nl:'Kleine gerechten, groot plezier',mk:'Мали јадења, голема радост'},
  drinks:{en:'Ice-cold and refreshing',nl:'IJskoud en verfrissend',mk:'Ледено и освежително'},
  desserts:{en:'Sweet endings, DADAWAN style',nl:'Zoet einde, DADAWAN-stijl',mk:'Сладок крај, во DADAWAN стил'},
  new:{en:'Our newest flavours',nl:'Onze nieuwste smaken',mk:'Нашите најнови вкусови'},
};
/* "complete your meal" suggestions per category (engine filters out in-cart items) */
const COMP={
  default:['edamame','gyoza','cola','misoSoup'],
  sushi:['edamame','gyoza','misoSoup','cola'],
  sides:['greentea','cola','lychee','mochi'],
  drinks:['gyoza','edamame','mochi','banana'],
  desserts:['greentea','oj','lychee','cola'],
};
const COMP_ALL={ default:'sides', sides:'drinks', drinks:'sides', desserts:'drinks' };
/* product-screen "make it even better" chips — per category (upsell rules) */

/* allergen policy (CMS-configurable copy) + normalised per-product model
   product.allergens = { contains:[], traces:[], removable:[] } — "removable" never
   turns into an allergen-free claim; the disclaimer is shown wherever allergens appear */
const ALLERGEN_POLICY={
  disclaimer:{ nl:'Heb je een ernstige allergie? Overleg altijd met een medewerker. Aanpassingen aan een gerecht garanderen niet dat het gerecht volledig vrij is van het betreffende allergeen.',
               en:'Do you have a serious allergy? Always check with a staff member. Changes to a dish do not guarantee it is completely free of that allergen.',
               mk:'Имаш сериозна алергија? Секогаш разговарај со вработен. Промените на јадењето не гарантираат дека е целосно без тој алерген.' },
  verifiedFree:['water','cola','colazero','sprite'],        /* products the restaurant verified as allergen-free; everything else without data is UNKNOWN */
  traces:{ pokewan:['sesame','nuts'], sushi:['shell','gluten'], ramen:['shell'], stonebowl:['nuts'], stoneplate:['nuts'], curry:['nuts','shell'], sides:['sesame'], desserts:['nuts','gluten'] },
  removable:{ pokewan:['sesame'], sushi:['sesame'], ramen:['egg'], stonebowl:['egg','sesame'], stoneplate:[], curry:[], sides:['sesame'], desserts:[] },
};
function normalizeAllergens(){
  PRODUCTS.forEach(p=>{ if(Array.isArray(p.allergens)){ const c=p.allergens;
    p.allergens={ contains:c, traces:(ALLERGEN_POLICY.traces[p.cat]||[]).filter(a=>!c.includes(a)), removable:(ALLERGEN_POLICY.removable[p.cat]||[]).filter(a=>c.includes(a)), unknown:!c.length&&!(ALLERGEN_POLICY.traces[p.cat]||[]).length&&!(ALLERGEN_POLICY.verifiedFree||[]).includes(p.id) }; } });
}
const alContains=p=>(p.allergens&&p.allergens.contains)||[];
const alHidden=p=>!!p&&[...(S.allergenFilter||[])].some(a=>alContains(p).includes(a));   /* filter = aid, hides "contains" only */
const visible=list=>list.filter(p=>!p.disabled&&!AVAIL.disabled.has(p.id)&&!alHidden(p));   /* ONE filter for every product list (invalid/disabled products never show) */
const alUnknown=p=>!p.allergens||(!p.allergens.contains.length&&!p.allergens.traces.length&&p.allergens.unknown!==false);
/* allergen picture of a real composition: main + extras + included side/drink; modifiers without data are UNKNOWN, never "free" */
function composedAllergens(d){
  const p=byId(d.pid), c=new Set(alContains(p)), tr=new Set((p.allergens&&p.allergens.traces)||[]), unknown=[];
  const add=q=>{ if(!q) return; if(alUnknown(q)) unknown.push(q.name); alContains(q).forEach(a=>c.add(a)); ((q.allergens&&q.allergens.traces)||[]).forEach(a=>tr.add(a)); };
  if(d.menu){ add(byId(MENU_DEAL.side)); add(byId(d.drink)); }
  (d.crossSells||[]).forEach(x=>add(byId((cmsById(x.id)||{}).pid)));
  (d.extras||[]).forEach(([g,id])=>{ const it=modItem(g,id); if(it.allergens){ (it.allergens.contains||[]).forEach(a=>c.add(a)); (it.allergens.traces||[]).forEach(a=>tr.add(a)); } else unknown.push(L(it.name)); });
  return { contains:[...c], traces:[...tr].filter(a=>!c.has(a)), removable:(p.allergens&&p.allergens.removable)||[], unknown };
}
const cartClashes=()=>{ const F=S.allergenFilter||new Set(); if(!F.size) return []; return S.cart.filter(l=>!l.reward&&[...F].some(a=>composedAllergens(l).contains.includes(a))).map(l=>byId(l.pid).name); };
const byId     = id => PRODUCTS.find(p=>p.id===id);
const prodsIn  = cat => (cat==='popular'
  ? PRODUCTS.filter(p=>p.badges.includes('pop')||p.badges.includes('dea'))
  : cat==='new'
  ? PRODUCTS.filter(p=>p.badges.includes('new'))
  : PRODUCTS.filter(p=>p.cat===cat)).filter(p=>!p.disabled&&!AVAIL.disabled.has(p.id)&&!alHidden(p));
const prodsInCards = cat => (cat==='popular'
  ? PRODUCTS.filter(p=>p.badges.includes('pop')||p.badges.includes('dea'))
  : cat==='new'
  ? PRODUCTS.filter(p=>p.badges.includes('new'))
  : PRODUCTS.filter(p=>p.cat===cat)).filter(p=>!p.disabled&&!AVAIL.disabled.has(p.id));   /* R44: filter-blocked cards stay visible, not orderable */
const catOf    = id => CATS.find(c=>c.id===id);

/* convert every catalog euro literal to integer minor units — exactly once, at load */
function normalizeMoney(){
  if(normalizeMoney.done) return; normalizeMoney.done=true;
  PRODUCTS.forEach(p=>{ p.price=toMinorUnits(p.price); (p.servings||[]).forEach(x=>{ x.price=toMinorUnits(x.price); if(typeof x.compareAt==='number') x.compareAt=toMinorUnits(x.compareAt); }); });
  normalizeServings();   /* the product price is derived from the default serving, never stored twice */
  Object.entries(MODS).forEach(([k,g])=>{ if(k==='premX') return; g.items.forEach(it=>{ it.price=toMinorUnits(it.price); }); });   /* premX reads the CMS values below */
  MENU_DEAL.price=toMinorUnits(MENU_DEAL.price);
  UPSELL_CMS.productEnhancements.forEach(v=>{ if(typeof v.price==='number') v.price=toMinorUnits(v.price); });
  if(BRAND.reward) BRAND.reward.threshold=toMinorUnits(BRAND.reward.threshold);
  const tv=UPSELL_CMS.upsellSettings.targetOrderValue; if(tv){ tv.minimum=toMinorUnits(tv.minimum); tv.maximum=toMinorUnits(tv.maximum); }
}
/* CMS/catalog strings are rendered through template literals into innerHTML: escape < > " once at load
   so restaurant-entered text can never inject markup (ids, urls and colours contain none of these) */
const escText=v=>typeof v==='string'?v.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):v;
function escapeDeep(o,seen=new Set()){ if(!o||typeof o!=='object'||seen.has(o)) return o; seen.add(o);
  for(const k of Object.keys(o)){ const v=o[k]; if(typeof v==='string'){ if(!/^data:/.test(v)) o[k]=escText(v); } else if(v&&typeof v==='object') escapeDeep(v,seen); } return o; }
[PRODUCTS,MODS,UPSELL_CMS,ALG,ALLERGEN_POLICY,CATS,BRAND.copy,BRAND.promos,COMP,MENU_DEAL,I18N].forEach(o=>escapeDeep(o)); BRAND.name=escText(BRAND.name);
/* cut-out product photography: free-standing on a neutral light surface, never cropped */
const CUTOUT_PRODUCTS=['salmonpoke','chickenpoke','tofupoke','shrimppoke','teribeef','peppersteak','salmongrill','steakMenu',
  'bibimbap','bulgogi','tofudolsot','sushiplatter','salmonroll','chickenroll','veggieroll','sakenigiri','unaginigiri','tonkotsu','shiitakeramen',
  'misoRam','greenCur','katsu','redCur','gyoza','springR','edamame','kimchi','crackers','misoSoup','swFries',
  'ddbowl','matcha','mochi','mangoR','banana','cola','colazero','sprite','water','oj','greentea','lychee'];
CUTOUT_PRODUCTS.forEach(id=>{ const p=byId(id); if(p){ p.cut=true; p.tint='#F8F5EE'; p.tint2='#FFFFFF'; delete p.z; } });
normalizeMoney(); normalizeAllergens();
/* ── CATALOG VALIDATION (before anything becomes active) ─────────
   invalid products / options are DISABLED (hidden), never silently priced
   at zero or given a random default; errors are reported and shown to staff */
const CATALOG_ERRORS=[];
function validateCatalog(){
  const err=(m,ctx)=>CATALOG_ERRORS.push({message:m,...ctx});
  const cents=(v,max=100000)=>Number.isInteger(v)&&v>=0&&v<=max;
  const ids=new Set(); PRODUCTS.forEach(p=>{ if(ids.has(p.id)) err('duplicate product id',{pid:p.id}); ids.add(p.id); });
  Object.entries(MODS).forEach(([g,grp])=>{ if(!Array.isArray(grp.items)||!grp.items.length) err('modifier group without items',{group:g});
    const seen=new Set(); (grp.items||[]).forEach(it=>{ if(seen.has(it.id)) err('duplicate option id',{group:g,id:it.id}); seen.add(it.id);
      if(g!=='premX'&&!(Number.isInteger(it.price)&&it.price>=-100000&&it.price<=100000)) err('option price not integer cents',{group:g,id:it.id}); });   /* options may discount (negative) within bounds */
    if(grp.def&&!(grp.items||[]).some(it=>it.id===grp.def)) err('default option does not exist',{group:g,id:grp.def}); });
  PRODUCTS.forEach(p=>{ const bad=[];
    if(!cents(p.price)) bad.push('price');
    (p.choice||[]).forEach(g=>{ if(!MODS[g]) bad.push('choice:'+g); });
    (p.mods||[]).forEach(g=>{ if(!MODS[g]) bad.push('mods:'+g); });
    if(p.allowedOptions) Object.entries(p.allowedOptions).forEach(([g,list])=>{ if(!MODS[g]) bad.push('allowed:'+g); else list.forEach(id=>{ if(!MODS[g].items.some(it=>it.id===id)) bad.push('allowed-option:'+g+':'+id); }); });
    if(!p.allergens||typeof p.allergens!=='object') bad.push('allergens');
    else ['contains','traces','removable'].forEach(k=>(p.allergens[k]||[]).forEach(a=>{ if(!ALG[a]) err('unknown allergen code',{pid:p.id,id:a}); }));   /* logged for the restaurant; rendered as its raw code, never dropped */
    (p.choice||[]).forEach(g=>{ if(MODS[g]&&MODS[g].req&&!(MODS[g].items||[]).length) bad.push('required-group-empty:'+g); });   /* P1: required group without options can never be completed */
    if(bad.length){ p.disabled=true; err('product disabled: '+bad.join(', '),{pid:p.id}); } });
  if(!byId(MENU_DEAL.side)) err('menu side product missing',{pid:MENU_DEAL.side});
  MENU_DEAL.drinks=MENU_DEAL.drinks.filter(d=>{ const ok=!!byId(d); if(!ok) err('menu drink missing',{pid:d}); return ok; });
  if(!cents(MENU_DEAL.price)) err('menu price invalid',{});
  [...UPSELL_CMS.crossSells,...UPSELL_CMS.premiumDrinks].forEach(v=>{ let bad=null;
    if(!byId(v.pid)) bad='product missing'; else if(v.priceVariantId&&(!PRICE_VARIANTS[v.priceVariantId]||PRICE_VARIANTS[v.priceVariantId].pid!==v.pid)) bad='price variant invalid';
    else if(v.priceVariantId&&!cents(PRICE_VARIANTS[v.priceVariantId].price)) bad='variant price';
    if(bad){ v.enabled=false; err('cms item disabled: '+bad,{id:v.id}); } });
  UPSELL_CMS.productEnhancements.forEach(v=>{ if(!cents(v.price)){ v.enabled=false; err('enhancement price invalid',{id:v.id}); } });
  if(BRAND.reward&&(!byId(BRAND.reward.pid)||!cents(BRAND.reward.threshold))){ err('reward invalid',{pid:BRAND.reward&&BRAND.reward.pid}); BRAND.reward=null; }
  BRAND.promos=BRAND.promos.filter(pr=>{ const ok=!!byId(pr.pid)&&!byId(pr.pid).disabled; if(!ok) err('promo product missing/disabled',{pid:pr.pid}); return ok; });
  return CATALOG_ERRORS;
}
validateCatalog();
/* option/choice references are validated structurally — an unknown option id is an error, never a €0 default */
const optionAllowed=(p,g,id)=>{ const grp=MODS[g]; if(!grp||!grp.items.some(it=>it.id===id)) return false; return !(p.allowedOptions&&p.allowedOptions[g]&&!p.allowedOptions[g].includes(id)); };
function validateLineStructure(l){
  const p=byId(l.pid), issues=[]; if(!p||p.disabled) return [{code:'product-missing',pid:l.pid}];
  if(l.lineType==='cross-sell') return [];
  Object.entries(l.choices||{}).forEach(([g,cid])=>{ if(cid&&!optionAllowed(p,g,cid)) issues.push({code:'invalid-choice',group:g,id:cid}); });
  (l.extras||[]).forEach(([g,id])=>{ if(!MODS[g]||!MODS[g].items.some(it=>it.id===id)) issues.push({code:'invalid-extra',group:g,id}); });
  (l.removes||[]).forEach(([g,id])=>{ if(!MODS[g]||!MODS[g].items.some(it=>it.id===id)) issues.push({code:'invalid-remove',group:g,id}); });
  if(l.menu&&(!byId(MENU_DEAL.side)||(l.drink&&!menuDrinkOk(l)))) issues.push({code:'invalid-menu'});
  return issues;
}

/* ══════════════════════════════════════════════════════════════
   5 · STATE + ORDER ENGINE (brand-agnostic)
   ══════════════════════════════════════════════════════════════ */
let S={
  lang:BRAND.defaultLanguage, screen:'attract',
  cat:'popular', filter:'all',
  pid:null, from:'menu', draft:null, editing:null,
  cart:[], service:null,
  pay:'terminal', orderNo:null, doneCount:0, doneTotal:0,
  tag:null, tagDraft:'', tagFor:null, tagKb:'lat',            /* v35 order tag (table sign / pager / name) */
  confirm:null, sheet:null,
  heroIdx:0, lastAdd:null, _homeScroll:0, _scroll:null, _last:null,
};
let uid=1;
let payTimer=null, countTimer=null, noteTimer=null, attractTimer=null;
const QLOCK={};            /* per-control quick-add input lock */
let ORDER_SESSION=0;       /* invalidates delayed callbacks from a previous order */
let NAVDIR='fwd';        /* screen-transition direction */
let RAILSPIN=false;      /* one-shot category spin — only when entering from attract */
let STAGGER=false;       /* v34: no staggered reveals — cards are usable at once ('screen' | 'grid' | false) */
let NEXTANIM='screen';   /* entrance mode requested by the triggering action */
let BARNEW=false;        /* basket appeared with this action → fade it in */
const raf=f=>typeof requestAnimationFrame!=='undefined'?requestAnimationFrame(f):f();

const defChoice=g=>{ const grp=MODS[g];
  if(grp.req) return null;                       /* required → guest must choose */
  if(grp.def) return grp.def;
  const z=grp.items.find(i=>i.price===0); return (z||grp.items[0]).id; };

function newDraft(p,{menu=false}={}){
  const choices={}; (p.choice||[]).forEach(g=>choices[g]=defChoice(g));
  return { pid:p.id, qty:1, menu:menu&&!!p.canMenu, drink:'cola',
    choices, extras:[], removes:[], extraQty:{}, crossSells:[] };
}
const modItem=(g,id)=>{ const it=MODS[g]&&MODS[g].items.find(i=>i.id===id); if(!it) throw new Error('unknown option '+g+':'+id); return it; };   /* never silently free */

function unitPrice(d){
  if(d.reward) return 0;
  const p=byId(d.pid); const sv=servingOf(p,d); let n=sv?sv.price:p.price;
  for(const [g,cid] of Object.entries(d.choices||{})) if(cid&&MODS[g]&&MODS[g].items.some(i=>i.id===cid)) n+=modItem(g,cid).price;   /* unknown ids are rejected by validation, never priced */
  (d.extras||[]).forEach(([g,id])=>n+=modItem(g,id).price*exQty(d,g,id));
  if(d.menu) n+=MENU_DEAL.price+drinkUp(d.drink);
  return n;
}
const cfgKey=d=>JSON.stringify([d.pid,servingsOf(byId(d.pid))?servingIx(byId(d.pid),d):-1,d.menu,d.menu?d.drink:'',
  Object.entries(d.choices||{}).sort(), (d.extras||[]).slice().sort(), Object.entries(d.extraQty||{}).sort(),
  (d.removes||[]).slice().sort()]);

/* ── PRODUCT GROUPS ─────────────────────────────────────────────
   A confirmed draft becomes a product group: one main line + zero or more
   linked cross-sell lines, all sharing `groupId`. Only a plain quick-add
   (no menu, no extras, no removals, no non-default choices, no cross-sells)
   may merge into an existing plain line; every configured group stays
   distinct even when its configuration key is identical.                 */
let gid=1;
const hasMeaningfulChoices=d=>Object.entries(d.choices||{}).some(([g,cid])=>cid&&cid!==defChoice(g)&&MODS[g].items.length>1);
const canMergeCartLine=d=>!d.menu&&!(d.crossSells&&d.crossSells.length)&&!(d.extras&&d.extras.length)&&!(d.removes&&d.removes.length)&&!hasMeaningfulChoices(d);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&S.cart.length&&CONN.state==='offline') persistSession('offline'); });
function addToCart(d){
  const {crossSells,_more,_xsAsk,...main}=d;          /* cross-sells never ride on the main line */
  const k=cfgKey(main);
  if(canMergeCartLine(d)){ const ex=S.cart.find(l=>l.key===k&&l.lineType==='product'&&l.mergeable&&l.qty<MAX_LINE_QTY);
    if(ex){ ex.qty=clampQty(ex.qty+main.qty); return ex; } }   /* merging can never exceed the limit */
  const l={...main, key:k, lid:'L'+(uid++), groupId:'G'+(gid++), lineType:'product', mergeable:canMergeCartLine(d),
    unitPrice:unitPrice(main), priceCheckedAt:Date.now() };
  S.cart.push(l); return l;
}
/* independent cross-sell line, linked to its originating product line */
function addCrossSellLine(v,src,sel){
  const l={ lid:'L'+(uid++), groupId:src.groupId, pid:v.pid, qty:Math.max(1,(sel&&sel.quantity)|0||1), lineType:'cross-sell', xsId:v.id,
    unitPrice:priceOf(v), priceVariantId:v.priceVariantId||null, priceCheckedAt:Date.now(),
    sourceLineId:src.lid, sourceProductId:src.pid, extraPortion:!!(sel&&sel.extraPortion),
    key:'xs:'+v.id+':'+src.lid, choices:{}, extras:[], removes:[], menu:false, drink:null,
    /* operational metadata travels with the line (KDS routing, tax, timing, availability) */
    station:byId(v.pid).station||'kitchen', taxGroup:byId(v.pid).taxGroup||'food-low', prepMin:byId(v.pid).prepMin||4 };
  S.cart.push(l); return l;
}
const xsLinesOf=lid=>S.cart.filter(l=>l.lineType==='cross-sell'&&l.sourceLineId===lid);
/* reconcile the draft's cross-sell selection with the existing lines of one source line (edit) */
function syncCrossSells(d,src){
  const have=xsLinesOf(src.lid);
  have.forEach(l=>{ const sel=xsSel(d,l.xsId); if(!sel) S.cart=S.cart.filter(x=>x!==l); else { l.extraPortion=sel.extraPortion; l.qty=Math.max(1,sel.quantity|0); } });
  (d.crossSells||[]).forEach(sel=>{ if(!have.some(l=>l.xsId===sel.id)){ const v=cmsById(sel.id); if(v) addCrossSellLine(v,src,sel); } });
}
/* ── LINKED-LINE REMOVAL POLICY (point 1) ────────────────────────
   product without linked lines → remove · cross-sell → remove only itself ·
   product with linked lines → ask: everything | main only (sides stay as
   independent lines, links cleared) | cancel                            */
function removeLine(lid,{withLinked=false,unlink=false}={}){
  const l=line(lid); if(!l) return;
  if(l.lineType==='product'){
    const linked=xsLinesOf(lid);
    if(withLinked) S.cart=S.cart.filter(x=>x!==l&&!linked.includes(x));
    else { linked.forEach(x=>{ if(unlink){ x.sourceLineId=null; x.sourceProductId=null; x.groupId='G'+(gid++); x.key='xs:'+x.xsId+':'+x.lid; } });
      S.cart=S.cart.filter(x=>x!==l); }
  } else S.cart=S.cart.filter(x=>x!==l);
}
const hasLinked=lid=>xsLinesOf(lid).length>0;
const line      = lid => S.cart.find(l=>l.lid===lid);
const lineUnit  = l  => l.reward?0:(typeof l.unitPrice==='number'?l.unitPrice:unitPrice(l));   /* validated snapshot; revalidated before payment */
const currentPriceOf=l=>l.reward?0:(l.loyalty?ltyPrice(l):(l.lineType==='cross-sell'?priceOf(cmsById(l.xsId)||{pid:l.pid}):unitPrice(l)));
/* the confirmation is bound to EXACTLY the prices shown; if they move again, we ask again */
const priceStamp=ch=>JSON.stringify(ch.map(c=>[c.lid,c.now]).sort());
/* before payment: compare every snapshot with the authoritative catalog — a changed price is never charged silently */
function revalidatePrices(){
  return S.cart.filter(l=>!l.reward).map(l=>({lid:l.lid,name:byId(l.pid).name,old:lineUnit(l),now:currentPriceOf(l)})).filter(c=>c.old!==c.now);
}
function applyRevalidatedPrices(){ S.cart.forEach(l=>{ if(!l.reward){ l.unitPrice=currentPriceOf(l); l.priceCheckedAt=Date.now(); } }); syncReward(); }
const cartCount = () => S.cart.reduce((a,l)=>a+l.qty,0);
/* v29: loyalty benefits (Como getBenefits) — discounts count only when fresh for exactly this cart */
const CMB={ key:null, state:'idle', discounts:[], earn:0, notRedeemable:{}, applied:new Set(), useWallet:false, memberId:null, timer:null, gen:0, failAt:0 };
const cartGross = () => S.cart.reduce((a,l)=>a+lineUnit(l)*l.qty,0);
const cartTotal = () => Math.max(0, cartGross() - cmDiscountTotal());
const hasCat    = c  => S.cart.some(l=>byId(l.pid).cat===c);
const baseTotal = () => S.cart.reduce((a,l)=>a+(l.reward?0:lineUnit(l)*l.qty),0);
const rewardOn  = () => !!BRAND.reward;
const rewardClaimed = () => S.cart.some(l=>l.reward);
const rewardLeft    = () => Math.max(0, BRAND.reward.threshold - baseTotal());
/* reward lifecycle: earned → added once automatically; below threshold → removed again; guest may delete it
   (then it is not re-added in this order). Threshold and product come from BRAND.reward (CMS).            */
/* the gift is a PRE-CONFIGURED variant: no choices to make, no editing, no quantity —
   it can only be removed, it always sits at the top of the order and it never blocks payment.
   Entitlement is recalculated after every change: product edits, quantities and price revalidation. */
function giftLine(p){
  const d=newDraft(p);
  Object.assign(d.choices, (BRAND.reward&&BRAND.reward.variant&&BRAND.reward.variant.choices)||{});
  (p.choice||[]).forEach(g=>{ if(!d.choices[g]) d.choices[g]=defChoice(g)||((MODS[g].items[0]||{}).id); });   /* never leave a required choice open */
  return {...d, qty:1, extras:[], removes:[], crossSells:[], key:'RW', lid:'L'+(uid++), lineType:'product',
    reward:true, fixed:true, unitPrice:0, mergeable:false, groupId:'G'+(gid++), priceCheckedAt:Date.now()};
}
function syncReward(){
  const p=rewardOn()?byId(BRAND.reward.pid):null;
  const has=S.cart.find(l=>l.reward);
  const earned=!!p&&baseTotal()>=BRAND.reward.threshold&&S.cart.some(l=>!l.reward)&&!alHidden(p)&&!availabilityService.checkProducts([p.id]).length;
  if(earned&&!has&&!S.rewardDismissed){ S.cart.unshift(giftLine(p)); return {added:true,name:p.name}; }
  if(!earned&&has){ S.cart=S.cart.filter(l=>!l.reward); return {removed:true,name:(p||byId(has.pid)).name}; }
  if(has&&S.cart[0]!==has){ S.cart=[has,...S.cart.filter(l=>l!==has)]; }    /* the gift always stays visible at the top */
  return null;
}

/* NOTE: product names (p.name, drink names) are brand-invariant strings by design —
   identical in every language; all translatable strings use L()/t(). */
function lineSummary(l){
  { const p=byId(l.pid), sv=servingOf(p,l); if(sv){ const rest=lineSummaryBody(l); return rest?L(sv.short)+' · '+rest:L(sv.short); } }
  return lineSummaryBody(l);
}
function lineSummaryBody(l){
  const p=byId(l.pid), bits=[];
  if(l.lineType==='cross-sell'){ const v=cmsById(l.xsId)||{};
    if(l.extraPortion) bits.push(`${t('extraPortion')} · ${v.qtyLabel?L(v.qtyLabel):''}`.replace(/ · $/,''));
    else if(v.qtyLabel) bits.push(L(v.qtyLabel));
    const src=l.sourceLineId?line(l.sourceLineId):null; bits.push(src?`${t('xsWith')} ${byId(src.pid).name}`:t('xsLoose'));
    return bits.join(' · '); }
  if(l.reward) bits.push('🎁 '+t('rw_gift'));
  if(l.menu) bits.push(`${t('summaryCombo')} · ${L(MENU_DEAL.sideLabel)} + ${byId(l.drink).name}`);
  for(const [g,cid] of Object.entries(l.choices||{})){
    const grp=MODS[g], it=cid?modItem(g,cid):null;
    if(it&&grp.items.length>1) bits.push(grp.req?L(it.name):`${L(grp.label)}: ${L(it.name)}`);   /* v34: optional choices named with their group ("Pittigheid: Medium") */
  }
  (l.extras||[]).forEach(([g,id])=>{ const q=exQty(l,g,id); bits.push('+ '+(q>1?q+'× ':'')+L(modItem(g,id).name)); });
  (l.removes||[]).forEach(([g,id])=>bits.push(L(modItem(g,id).name)));
  return bits.join(' · ');
}

/* ── calm add pipeline: never re-render, update only what changed ──
   All delayed work is ORDER_SESSION-guarded (see spec §4.8).           */
function xfadeVal(id,txt){                 /* 160 ms value crossfade */
  const el=document.getElementById(id); if(!el) return;
  const cur=el.querySelector('.bkv-c');
  if(!cur){ el.innerHTML=`<span class="bkv-c">${txt}</span>`; return; }
  if(cur.textContent===txt) return;
  const sess=ORDER_SESSION;
  cur.classList.remove('bkv-c'); cur.classList.add('bkv-o');
  cur.setAttribute('aria-hidden','true');
  const nu=document.createElement('span');
  nu.className='bkv-c bkv-n'; nu.textContent=txt; el.appendChild(nu);
  raf(()=>{ nu.classList.remove('bkv-n'); cur.classList.add('bkv-x'); });
  setTimeout(()=>{ if(sess===ORDER_SESSION) cur.remove(); },BRAND.motion.fieldXfade);
}
function showAddNote(txt){                    /* "Toegevoegd" ≤ 900 ms, aria-live */
  const el=document.getElementById('bkNote'); if(!el) return;
  clearTimeout(noteTimer);
  el.textContent=typeof txt==='string'?txt:t('vuAdded'); raf(()=>el.classList.add('on'));
  const sess=ORDER_SESSION;
  noteTimer=setTimeout(()=>{ if(sess!==ORDER_SESSION) return;
    const e=document.getElementById('bkNote'); if(e) e.classList.remove('on');
  },Math.max(0,BRAND.motion.addNote-BRAND.motion.fieldXfade));
}
const noteText=n=>typeof n==='object'&&n?(n.added?tf('rw_added',{name:n.name}):tf('rw_gone',{name:n.name,amt:fmt(BRAND.reward.threshold)})):undefined;
function basketSync({note=false}={}){
  cmTick(); const rwc=syncReward(); if(rwc) note=rwc;
  syncCardCtls();      /* surgical basket update */
  if(S.screen!=='home'&&S.screen!=='menu') return;
  const root=document.querySelector('#app .screen-root'); if(!root) return;
  const n=cartCount(), wrap=document.getElementById('bkWrap');
  if(n===0){                               /* last item gone → 160 ms, 8 px down */
    if(!wrap||wrap.classList.contains('bar-out')) return;
    wrap.classList.remove('bar-in'); wrap.classList.add('bar-out');
    const sess=ORDER_SESSION;
    setTimeout(()=>{ if(sess!==ORDER_SESSION) return;
      const e=document.getElementById('bkWrap');
      if(e&&e.classList.contains('bar-out')) e.remove();
    },BRAND.motion.basketExit);
    return;
  }
  if(!wrap){                               /* empty → non-empty: 240 ms, 12 px up */
    BARNEW=true; root.insertAdjacentHTML('beforeend',bottomBar()); BARNEW=false;
    if(note) showAddNote(noteText(note)); return;
  }
  wrap.classList.remove('bar-out');        /* later adds: bar itself stays still */
  xfadeVal('bkQty',`${n} ${n===1?t('item'):t('items')}`);
  xfadeVal('bkTot',fmt(cartTotal()));
  const rw=document.getElementById('bkRw'); if(rw) rw.innerHTML=rewardPill();
  if(note) showAddNote(noteText(note));
}
function confirmQuickAdd(btn){
  { const sess=ORDER_SESSION; setTimeout(()=>{ if(sess===ORDER_SESSION) syncCardCtls(); },BRAND.motion.quickAddLock+380); }             /* plus → check, 400 ms, colours only */
  if(!btn||!btn.classList) return;
  btn.classList.add('qa-ok');
  const sess=ORDER_SESSION;
  setTimeout(()=>{ if(sess!==ORDER_SESSION) return;
    if(btn.isConnected) btn.classList.remove('qa-ok');
  },BRAND.motion.addConfirm);
}
function saveMenuScroll(){
  if(S.screen!=='menu') return;
  const sc=document.querySelector('#mainCol .scroller');
  if(sc) S._scroll={cat:S.cat, top:sc.scrollTop};
}
function updTotals(){                        /* header · CTA · summaries — 160 ms crossfades */
  const d=S.draft; if(!d) return; const p=byId(d.pid);
  const tot=fmt(pdpTotal(d));
  xfadeVal('cfgTot',tot); xfadeVal('pdpTot',tot); xfadeVal('sumTot',tot);
  xfadeVal('sumMain',fmt(unitPrice(d)*d.qty)); xfadeVal('sumX',fmt(xsSum(d)));
  const rows=document.getElementById('priceRows'); if(rows) rows.innerHTML=priceRows(p,d);
  updCta(); r44Sync();
}
const updCfgTotal=updTotals;
/* update the enhancement cards in place: selected state + stepper value, no rebuild of the section */
/* ── shared CMS roles: category-finish (bottom of a category grid) and cart-inspire (in the cart) ──
   Placement is never hardcoded per screen: it follows the block's role and target. */
const cmsFinishBlock=cat=>cmsBlocks('category-finish').find(b=>cmsCatsFor(b.target).includes(cat));
const cmsAddable=p=>!!p&&!p.disabled&&!alHidden(p)&&!(p.choice||[]).some(g=>MODS[g]&&MODS[g].req)
  &&!availabilityService.checkProducts([p.id]).length;
function finishItemHTML(p){
  return `<div class="cfin-item" data-pid="${p.id}">
    <button type="button" data-a="prod" data-pid="${p.id}" data-from="menu" class="press cfin-img">${foodImg(p,'h-full','40px')}</button>
    <div class="flex-1 min-w-0">
      <button type="button" data-a="prod" data-pid="${p.id}" data-from="menu" class="press block text-left w-full">
        <span class="hd block text-[20px] leading-[22px] tracking-[.03em]">${p.name}</span></button>
      <div class="num text-[19px] font-extrabold mt-0.5">+ ${fmt(p.price)}</div>
    </div>
    <span class="card-ctl flex-none" data-ctl-for="${p.id}" data-ctl-size="56">${cardCtl(p,56)}</span>
  </div>`;
}
function categoryFinishHTML(cat){
  const B=cmsFinishBlock(cat); if(!B) return '';
  const max=(B.display&&B.display.maxVisible)||4;
  const inOrder=new Set(S.cart.filter(l=>!l.reward).map(l=>l.pid));
  const items=(B.items||[]).map(i=>byId(i.pid)).filter(p=>p&&p.cat!==cat&&cmsAddable(p)&&!inOrder.has(p.id)).slice(0,max);   /* no re-push */
  if(!items.length) return '';
  return `<section class="cfin mt-8" data-cms-block="${B.id}">
    <div class="flex items-baseline gap-3 mb-3"><span class="hd text-[27px] tracking-[.04em]">${L(B.title)}</span>
      ${B.subtitle?`<span class="text-[19px] text-mute font-semibold">${L(B.subtitle)}</span>`:''}</div>
    <div class="cfin-row">${items.map(finishItemHTML).join('')}</div></section>`;
}
function cartInspireHTML(){
  const B=cmsBlocks('cart-inspire')[0]; if(!B) return '';
  const inCart=new Set(S.cart.filter(l=>!l.reward).map(l=>l.pid));
  const link=(B.link&&B.link.cat)?B.link:null;
  const p=(B.items||[]).map(i=>byId(i.pid)).filter(p=>p&&!inCart.has(p.id)&&cmsAddable(p))[0];
  if(!p&&!link) return '';
  if(link&&S.cart.some(l=>{const lp=byId(l.pid); return !l.reward&&lp&&lp.cat===link.cat;})) return '';   /* already ordered from that menu (a free gift does not count) */
  return `<section class="cinsp mt-6" data-cms-block="${B.id}">
    <div class="flex items-baseline gap-3 mb-3"><span class="hd text-[27px] tracking-[.04em]">${L(B.title)}</span>
      ${B.subtitle?`<span class="text-[19px] text-mute font-semibold">${L(B.subtitle)}</span>`:''}</div>
    ${p?`<div class="cinsp-c">
      <button type="button" data-a="prod" data-pid="${p.id}" data-from="cart" class="press cinsp-img">${foodImg(p,'h-full','44px')}</button>
      <div class="flex-1 min-w-0">
        <div class="hd text-[23px] leading-[25px] tracking-[.03em]">${p.name}</div>
        <div class="p-desc text-[18px] text-mute font-medium leading-[23px] clamp2">${L(p.desc)}</div>
        <div class="num text-[21px] font-extrabold mt-1">+ ${fmt(p.price)}</div>
      </div>
      <span class="card-ctl flex-none" data-ctl-for="${p.id}" data-ctl-size="56">${cardCtl(p,56)}</span></div>`:''}
    ${link?`<button type="button" data-a="cat" data-cat="${link.cat}" data-from="cart" class="press cinsp-link mt-3">${L(link.label)}</button>`:''}
  </section>`;
}
function refreshEnh(){ const sec=document.getElementById('vuX'); if(!sec||!S.draft) return;
  const p=byId(S.pid), xp=experienceFor(p), d=S.draft;
  if(sec.classList.contains('r44-exs')){ sec.outerHTML=r44EnhSection(p,xp,d); return; }   /* R44 extras: tiles have a fixed size → no shift */
  sec.querySelectorAll('[data-a="vux"]').forEach(card=>{ const v=cmsById(card.dataset.id); if(!v||v.role==='cross-sell') return;
    const g=ROLE_GROUP[v.role], q=exQty(d,g,v.id), on=q>0;
    card.classList.toggle('vu-on',on); card.setAttribute('aria-pressed',String(on));
    const holder=card.querySelector('.vu-step, .vu-cta');
    const tmp=document.createElement('div'); tmp.innerHTML=vuCard(v,d);
    const fresh=tmp.querySelector('.vu-step, .vu-cta');
    if(holder&&fresh&&(holder.className!==fresh.className||holder.innerHTML!==fresh.innerHTML)) holder.replaceWith(fresh);
  });
}
/* re-render only the cross-sell section (conflict labels, keep/remove prompt) — scroll untouched */
function refreshXs(){ const sec=document.getElementById('xsX'); const p=byId(S.pid);
  if(sec) sec.outerHTML=xsSection(S.draft,experienceFor(p)); }
function updCta(){
  const btn=document.getElementById('cfgCta'); if(!btn) return;
  const ok=draftValid(S.draft); btn.disabled=!ok; btn.setAttribute('aria-disabled',String(!ok));
  const veil=document.getElementById('ctaVeil');
  if(ok&&veil) veil.remove(); else if(!ok&&!veil) btn.insertAdjacentHTML('afterend',ctaVeil());
}
function updChoiceUI(g){                     /* one group, in place */
  const d=S.draft;
  document.querySelectorAll(`#pdp [data-a="choice"][data-g="${g}"]`).forEach(b=>{
    const on=b.dataset.id===d.choices[g];
    b.setAttribute('aria-pressed',on);
    if(!b.classList.contains('optBtn')){          /* compact pill variant */
      b.classList.toggle('bg-jade',on); b.classList.toggle('border-jade',on); b.classList.toggle('text-white',on);
      b.classList.toggle('bg-card',!on); b.classList.toggle('border-line',!on); b.classList.toggle('text-ink/85',!on); }
  });
  const grp=document.getElementById('grp-'+g); if(grp) grp.classList.remove('grp-need');
  const h=document.getElementById('hint-'+g); if(h) h.textContent='';
}
function nudgeRequired(){
  { const r=S.draft?blockReason(S.draft):''; const el=document.getElementById('ctaReason'); if(el) el.textContent=r; }                    /* calm: smooth scroll + brief highlight + helper text */
  if(S.draft&&S.draft.menu&&!S.draft.drink&&!firstIncomplete(S.draft)){ const w=document.getElementById('vuDrinks')||document.getElementById('vuMenuWrap');   /* R44: menu without drink */
    if(w&&w.scrollIntoView) w.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'center'}); return; }
  const g=firstIncomplete(S.draft); if(!g) return;
  const grp=document.getElementById('grp-'+g); if(!grp) return;
  if(grp.scrollIntoView) grp.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'center'});   /* R44: to the centre of the screen */   /* .grp has scroll-margin; scroller has scroll-padding-bottom → fully above the dock */
  grp.classList.add('grp-need');
  const h=document.getElementById('hint-'+g); if(h) h.textContent=tf('r44Need',{group:L(MODS[g].label)});
  const sess=ORDER_SESSION;
  setTimeout(()=>{ if(sess!==ORDER_SESSION) return;
    const e=document.getElementById('grp-'+g); if(e) e.classList.remove('grp-need'); },BRAND.motion.reqHighlight);
}

/* calm selection: nothing re-renders, nothing moves — only the selected state, the summary
   line and the totals change, each with the standard 160 ms crossfade/colour transition. */
function refreshDrinks(){
  const wrap=document.getElementById('vuDrinks'); if(!wrap||!S.draft) return;
  const d=S.draft;
  wrap.querySelectorAll('[data-a="pickDrink"]').forEach(b=>{ const on=b.dataset.id===d.drink;
    b.setAttribute('aria-pressed',String(on));
    if(b.classList.contains('drink-up')) b.classList.toggle('vu-on',on); else b.classList.toggle('on',on); });
  const picked=byId(d.drink), extra=drinkUp(d.drink);
  const nameEl=document.getElementById('drinkPickedName'), tagEl=document.getElementById('drinkPickedTag');
  if(nameEl) nameEl.textContent=tf('drinkPickedT',{name:picked?picked.name:'—'});
  if(tagEl) xfadeVal('drinkPickedTag',extra?`+ ${fmt(extra)}`:t('inclLabel'));
}
function updDrinkUI(){                     /* surgical drink picker state — every drink control on the product screen */
  const d=S.draft;
  /* modification-flow drink row (.optBtn): the selected style follows aria-pressed */
  document.querySelectorAll('#pdp .optBtn[data-a="pickDrink"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===d.drink)));
  document.querySelectorAll('#vuDrinks [data-a="pickDrink"]').forEach(b=>{
    const on=b.dataset.id===d.drink;
    b.setAttribute('aria-pressed',on);
    if(b.classList.contains('vu-card')){ b.classList.toggle('vu-on',on); return; }
    b.classList.toggle('bg-jade',on); b.classList.toggle('border-jade',on);
    b.classList.toggle('text-white',on);
    b.classList.toggle('bg-card',!on); b.classList.toggle('border-line',!on);
    b.classList.toggle('text-ink/85',!on);
  });
}

/* ── simulated payment hardware ─────────────────────────────── */
let termMode='ready';
function setTerm(mode){ termMode=mode;
  const el=document.getElementById('tmsg'); if(!el) return;
  document.getElementById('stage').classList.remove('paying','paid');
  if(mode==='paying'){ document.getElementById('stage').classList.add('paying');
    el.textContent=t('tapTerm'); }
  else if(mode==='paid'){ document.getElementById('stage').classList.add('paid');
    el.textContent=t('okTerm'); }
  else el.textContent=t('readyTerm');
}
/* ══════════════════════════════════════════════════════════════
   PAYMENT STATE MACHINE (explicit states, no booleans)
   idle → connecting → waiting-for-card → processing → approved
                    ↘ terminal-offline          ↘ declined | cancelled
          waiting-for-card ─timeout→ timeout → (lookup) → approved | idle
   approved → submitting → done | order-submit-failed → recovery-required → submitting…
   Every delayed step is guarded by the order session AND the attempt id,
   so a stale timer can never mutate a newer attempt or a newer order.     */
const PAY_STATES=['no-charge','idle','connecting','waiting-for-card','processing','approved','declined','cancelled','timeout',
  'terminal-offline','order-submit-failed','recovery-required','submitting','lookup','done','assistance','status-check','cancel-requested'];
const PAY_T={ idle:['connecting','no-charge'], 'no-charge':['submitting'],
  'waiting-for-card':['processing','cancelled','timeout','cancel-requested'], connecting:['waiting-for-card','terminal-offline','cancelled','cancel-requested'],
  'cancel-requested':['cancelled','approved','timeout','processing'], processing:['approved','declined','timeout','cancelled'],
  approved:['submitting'], submitting:['done','order-submit-failed'], 'order-submit-failed':['recovery-required'],
  'recovery-required':['submitting'], declined:['idle','connecting'], cancelled:['idle'], timeout:['lookup','idle'],
  lookup:['approved','idle','timeout'], 'terminal-offline':['connecting','idle'], done:['idle'],
  'status-check':['approved','idle','assistance','recovery-required'], assistance:['submitting','lookup'] };
const PAY_ACTIVE=new Set(['no-charge','connecting','waiting-for-card','processing','approved','submitting','lookup']);
/* uncertain = the card MAY have been charged: no cancel, no reset, no new attempt — only status lookup or staff recovery */
const PAY_UNCERTAIN=new Set(['no-charge','processing','approved','submitting','order-submit-failed','recovery-required','lookup','timeout','assistance','status-check','cancel-requested']);
const FINALIZED=new Set();   /* attemptIds whose outcome has been applied exactly once (late/duplicate callbacks are no-ops) */
const canRetryPayment=()=>['idle','declined','cancelled','terminal-offline'].includes(PAY.state)&&!PAY.snapshot;
const PAY={ state:'idle', attempt:0, attemptId:null, orderId:null, txRef:null, snapshot:null, recoveryRef:null, submitKey:null, submittedKeys:{}, lastError:null,
  accepted:false, receipt:'none' /* none|printing|printed|failed */ };
const SIM={ paymentResult:null, unavailable:new Set(), printer:null, hang:null };  /* demo-only test controls (hang: 'status'|'cancel'|'submit'|'availability') */
/* ── MODE & ADAPTERS ──────────────────────────────────────────────
   demo       : built-in simulations (clearly badged), URL test parameters allowed
   production : every integration must be injected on window.GuestitAdapters
                before this script runs; missing adapters BLOCK the kiosk
                (no automatic simulation of success, no URL test parameters).
   Adapter contract (all return Promises):
     payment.start({attemptId,orderId,amountMinor,currency}) → {result:'approved'|'declined'|'cancelled'|'timeout'|'terminal-offline', txRef}
     payment.status({attemptId})                              → {result:'approved'|'not-charged'|'unknown', txRef}
     pos.submit({idempotencyKey,orderId,attemptId,txRef,snapshot}) → {orderNo, duplicate}   (server stores the key durably)
     pos.health()                                             → boolean
     printer.print({orderNo,snapshot})                        → {printed:true}
     availability.check(productIds)                           → unavailableIds[]
     auth.verify({pin})                                       → boolean
     analytics.send(events[])                                 → void                                                        */
const Q=new URLSearchParams(location.search);
const APP_MODE=(Q.get('mode')==='production'||(window.GuestitConfig&&window.GuestitConfig.mode==='production'))?'production':'demo';
if(APP_MODE!=='production'||Q.has('debug')) window.__GUESTIT_PERF__=GUESTIT_PERF_API;
const IS_DEMO=APP_MODE==='demo';
const REQUIRED_ADAPTERS=['payment','pos','printer','availability','auth'];
const ADAPTERS=Object.assign({},window.GuestitAdapters||{});
const missingAdapters=()=>IS_DEMO?[]:REQUIRED_ADAPTERS.filter(k=>!ADAPTERS[k]);
/* stable identifiers that survive restarts and never collide across devices */
const DEVICE_ID=(()=>{ try{ let d=localStorage.getItem('guestit.deviceId'); if(!d){ d='K'+Math.random().toString(36).slice(2,8).toUpperCase()+Date.now().toString(36).toUpperCase().slice(-4); localStorage.setItem('guestit.deviceId',d); } return d; }catch(e){ return 'K'+Math.random().toString(36).slice(2,10).toUpperCase(); } })();
const uuid=()=>(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c==='x'?r:(r&3|8)).toString(16);});
const newOrderId=()=>DEVICE_ID+'-'+Date.now().toString(36).toUpperCase()+'-'+uuid().slice(0,8).toUpperCase();
/* demo adapters — simulations, badged in the UI; never used in production */
const DEMO_ADAPTERS={
  payment:{
    start({attemptId,amountMinor}){ const M=BRAND.paymentSettings, r=simResult(); const sess=ORDER_SESSION;
      return new Promise(res=>{ setTimeout(()=>{ if(sess!==ORDER_SESSION) return;
        const map={ 'terminal-offline':'terminal-offline', declined:'declined', cancelled:'cancelled', timeout:'timeout', 'timeout-charged':'timeout' };
        res({ result:map[r]||'approved', txRef:'TX-'+uuid().slice(0,8).toUpperCase(), attemptId }); }, r==='terminal-offline'?M.connectMs:(r==='cancel-late-approve'?M.connectMs+M.cardWaitMs+M.processingMs+M.lookupMs*3:M.connectMs+M.cardWaitMs+M.processingMs)); }); },
    status({attemptId}){ if(SIM.hang==='status') return new Promise(()=>{}); return new Promise(res=>setTimeout(()=>res({ result:(SIM.paymentResult==='timeout-charged'||SIM.paymentResult==='restart-charged'||SIM.paymentResult==='cancel-late-approve')?'approved':'not-charged', txRef:'TX-'+attemptId.slice(-6), attemptId }),BRAND.paymentSettings.lookupMs)); },
    cancel({attemptId}){ if(SIM.hang==='cancel') return new Promise(()=>{}); return new Promise(res=>setTimeout(()=>res({ result:SIM.paymentResult==='cancel-late-approve'?'unknown':'cancelled', attemptId }),BRAND.paymentSettings.lookupMs)); },
  },
  catalog:{ current(){ return Promise.resolve({ prices:Object.fromEntries(PRODUCTS.map(p=>[p.id,p.price])), variants:Object.fromEntries(Object.entries(PRICE_VARIANTS).map(([k,v])=>[k,v.price])), disabled:[] }); } },
  pos:{ submit(req){ if(SIM.hang==='submit') return new Promise(()=>{}); return posAdapter.submit(req); }, health(){ return Promise.resolve(SIM.server!=='offline'&&navigator.onLine!==false); } },
  printer:{ print(){ return new Promise((res,rej)=>setTimeout(()=>SIM.printer==='fail'?rej(new Error('printer-offline')):res({printed:true}),300)); } },
  availability:{ check(ids){ if(SIM.hang==='availability') return new Promise(()=>{}); return Promise.resolve([...new Set(ids)].filter(id=>SIM.unavailable.has(id))); } },
  auth:{ verify({pin}){ return Promise.resolve(String(pin)===String(BRAND.adminPin||'2580')); } },
  analytics:{ send(){ return Promise.resolve(); } },
};
const adapter=k=>ADAPTERS[k]||(IS_DEMO?DEMO_ADAPTERS[k]:null);
/* every external call is bounded: a timeout means "outcome UNKNOWN", never "failed" */
const ADAPTER_TIMEOUT_MS={ paymentStart:90000, paymentStatus:12000, paymentCancel:12000, posSubmit:15000, print:10000, availability:8000, health:5000 };
class AdapterTimeout extends Error{ constructor(k){ super('adapter-timeout:'+k); this.timeout=true; } }
const withTimeout=(p,ms,k)=>new Promise((res,rej)=>{ let done=false; const to=setTimeout(()=>{ if(!done){ done=true; rej(new AdapterTimeout(k)); } },ms);
  Promise.resolve(p).then(v=>{ if(!done){ done=true; clearTimeout(to); res(v); } },e=>{ if(!done){ done=true; clearTimeout(to); rej(e); } }); });

/* ══════════════════════════════════════════════════════════════
   LOYALTY (v28) — QR login · points balance · "Beloningen" category
   Optional adapter window.GuestitAdapters.loyalty (all Promises, every response validated):
     loyalty.getProgram()                  → {rewards:[{id, pid, cost, pct?=100, maxPerOrder?=1, variant?:{choices}}]}
     loyalty.createLogin({deviceId,lang})  → {token, url(https), expiresInS}
     loyalty.pollLogin({token})            → {status:'pending'|'linked'|'expired', member?:{id, firstName, points}}
     loyalty.commit({idempotencyKey,memberId,orderId,orderNo,orderTotalMinor,redeemed:[{rewardId,cost,qty}],pointsSpent})
                                           → {balance, pointsEarned, pointsSpent}
   The BACKEND owns the program: which rewards, their cost/discount/limit, and the earning rule
   (the kiosk never calculates earned points — it shows what the backend returns).
   Points are only spent after the POS accepted the order (payDone) — the cart only RESERVES them.
   A reward line is a fixed, pre-configured variant (no edit), removable at any time.
   Invalid / late / unknown responses never log anyone in. The member is cleared on every new order
   and automatically after a short time on the start screen (shared kiosk).
   ══════════════════════════════════════════════════════════════ */
BRAND.features.loyalty = BRAND.features.loyalty!==false;
BRAND.loyalty = Object.assign({ loginTtlS:120, pollMs:1500, attractLogoutMs:90000, programRefreshMs:300000 }, BRAND.loyalty||{});   /* kiosk behaviour only */
ADAPTER_TIMEOUT_MS.loyalty=8000;
/* ── demo backend (simulation; production gets all of this from the loyalty service) ── */
const LTY_DEMO_PROGRAM={ earnPerEuro:1, rewards:[
  {id:'r-lychee',  pid:'lychee',       cost:250,  pct:100, maxPerOrder:2},
  {id:'r-edamame', pid:'edamame',      cost:300,  pct:100, maxPerOrder:2},
  {id:'r-salroll', pid:'salmonroll',   cost:350,  pct:50,  maxPerOrder:1},
  {id:'r-gyoza',   pid:'gyoza',        cost:400,  pct:100, maxPerOrder:3},
  {id:'r-mochi',   pid:'mochi',        cost:450,  pct:100, maxPerOrder:1, variant:{choices:{mochiFl:'mMat'}}},
  {id:'r-matcha',  pid:'matcha',       cost:550,  pct:100, maxPerOrder:1},
  {id:'r-poke',    pid:'chickenpoke',  cost:900,  pct:100, maxPerOrder:1},
  {id:'r-katsu',   pid:'katsu',        cost:1000, pct:100, maxPerOrder:1},
  {id:'r-platter', pid:'sushiplatter', cost:1500, pct:100, maxPerOrder:1},
]};
const LTY_DEMO_MEMBERS={
  xander:{ id:'M-10427', firstName:'Xander', points:620, credit:350,
    assets:[ {key:'A-GYOZA', name:'Gyoza met 50% korting', description:'Speciaal voor jou', kind:'item', pids:['gyoza'], pct:50, offer:true, validUntil:'31-10-2026'},
             {key:'A-DRINK', name:'Gratis drankje', description:'Welkomstcadeau', kind:'item', cats:['drinks'], pct:100, validUntil:'31-10-2026'},
             {key:'A-DESSERT', name:'20% korting op desserts', kind:'percent', cats:['desserts'], pct:20},
             {key:'A-2OFF', name:'€2 korting vanaf €15', kind:'amount', amountMinor:200, minSpendMinor:1500} ],
    deals:[ {id:'D-POKE', name:'10% op Poké Wan', cats:['pokewan'], pct:10} ],
    punchCards:[ {id:'PC-POKE', name:'Poké-stempelkaart', stamps:4, total:6, rewardName:'Gratis Poké Wan'} ] },
  maria:{ id:'M-20981', firstName:'Maria', points:1850, credit:0,
    assets:[ {key:'B-BDAY', name:'Verjaardag: gratis dessert', description:'Gefeliciteerd, Maria!', kind:'item', cats:['desserts'], pct:100} ],
    deals:[], punchCards:[ {id:'PC-RAMEN', name:'Ramen-stempelkaart', stamps:5, total:6, rewardName:'Gratis ramen'} ] } };
const LTY_DEMO={ scans:{}, balances:{}, commits:{}, credit:{}, used:{}, stamps:{}, ended:[], sessions:{} };
const ltyDemoBal=m=>(LTY_DEMO.balances[m.id]!=null?LTY_DEMO.balances[m.id]:m.points);
DEMO_ADAPTERS.loyalty={                        /* a phone "scan" = tapping the QR or a demo name */
  getProgram(){ return new Promise(res=>setTimeout(()=>res(JSON.parse(JSON.stringify({rewards:LTY_DEMO_PROGRAM.rewards}))),150)); },
  createLogin({deviceId}){ const token='LT-'+uuid().replace(/-/g,'').slice(0,14).toUpperCase();
    return new Promise(res=>setTimeout(()=>res({ token, url:'https://dadawan.nl/app/login?k='+encodeURIComponent(deviceId)+'&t='+token, expiresInS:BRAND.loyalty.loginTtlS }),250)); },
  pollLogin({token}){ const who=LTY_DEMO.scans[token]; if(!who) return Promise.resolve({status:'pending'});
    const m=LTY_DEMO_MEMBERS[who], sid=LTY_DEMO.sessions[token]||(LTY_DEMO.sessions[token]='CS-'+uuid().replace(/-/g,'').slice(0,16).toUpperCase());
    const member={ id:m.id, firstName:m.firstName, points:ltyDemoBal(m), credit:LTY_DEMO.credit[m.id]!=null?LTY_DEMO.credit[m.id]:m.credit,
      assets:m.assets.filter(a=>!(LTY_DEMO.used[m.id]||[]).includes(a.key)),
      punchCards:m.punchCards.map(pc=>({...pc,stamps:Math.min(pc.total,pc.stamps+((LTY_DEMO.stamps[m.id]||{})[pc.id]||0))})) };
    return new Promise(res=>setTimeout(()=>res({status:'linked',sessionId:sid,member}),200)); },
  cancelLogin({token}){ delete LTY_DEMO.scans[token]; return Promise.resolve({ok:true}); },
  getBenefits({memberId,lines,grossMinor,redeemAssets,useWallet}){            /* simulated Como getBenefits */
    const m=Object.values(LTY_DEMO_MEMBERS).find(x=>x.id===memberId); if(!m) return Promise.reject(new Error('unknown member'));
    const paid=lines.filter(l=>l.kind==='product'), sub=paid.reduce((a,l)=>a+l.unitMinor*l.qty,0), out=[], nr=[];
    const elig=x=>paid.filter(l=>(x.pids&&x.pids.includes(l.pid))||(x.cats&&x.cats.includes(l.cat)));
    m.deals.forEach(d=>{ const amt=Math.round(elig(d).reduce((a,l)=>a+l.unitMinor*l.qty,0)*d.pct/100); if(amt>0) out.push({id:d.id,source:'deal',name:d.name,amountMinor:amt}); });
    redeemAssets.forEach(k=>{ const a=m.assets.find(x=>x.key===k&&!(LTY_DEMO.used[m.id]||[]).includes(x.key)); if(!a){ nr.push({key:k,reason:'unknown'}); return; }
      const el=(a.pids||a.cats)?elig(a):paid; if(!el.length||(a.minSpendMinor&&sub<a.minSpendMinor)){ nr.push({key:k,reason:'conditions'}); return; }
      const amt=a.kind==='amount'?a.amountMinor:a.kind==='item'?Math.round(Math.min(...el.map(l=>l.unitMinor))*a.pct/100):Math.round(el.reduce((s,l)=>s+l.unitMinor*l.qty,0)*a.pct/100);
      out.push({id:'X-'+k,source:'asset',assetKey:k,name:a.name,amountMinor:amt}); });
    let left=grossMinor; out.forEach(d=>{ d.amountMinor=Math.min(d.amountMinor,left); left-=d.amountMinor; });
    const credit=LTY_DEMO.credit[m.id]!=null?LTY_DEMO.credit[m.id]:m.credit;
    if(useWallet&&credit>0&&left>0){ const w=Math.min(credit,left); out.push({id:'W',source:'wallet',name:'Tegoed',amountMinor:w}); left-=w; }
    const earned=Math.floor(left/100*LTY_DEMO_PROGRAM.earnPerEuro);
    return new Promise(res=>setTimeout(()=>res({discounts:out,earnPoints:earned,notRedeemable:nr}),120)); },
  endSession({sessionId,reason}){ LTY_DEMO.ended.push({sessionId,reason,at:Date.now()}); return new Promise(res=>setTimeout(()=>res({ok:true}),60)); },
  commit({idempotencyKey,memberId,orderTotalMinor,redeemed,redeemAssets,walletMinor,lines}){
    if(LTY_DEMO.commits[idempotencyKey]) return Promise.resolve(LTY_DEMO.commits[idempotencyKey]);   /* idempotent, like the real service must be */
    const m=Object.values(LTY_DEMO_MEMBERS).find(x=>x.id===memberId);
    const spent=(redeemed||[]).reduce((a,x)=>{ const r=LTY_DEMO_PROGRAM.rewards.find(y=>y.id===x.rewardId); return a+(r?r.cost:0)*x.qty; },0);   /* server-side price */
    const earned=Math.floor(orderTotalMinor/100*LTY_DEMO_PROGRAM.earnPerEuro);                           /* server-side rule */
    const bal=Math.max(0,(m?ltyDemoBal(m):0)-spent+earned); LTY_DEMO.balances[memberId]=bal;
    if(m){ LTY_DEMO.used[memberId]=[...(LTY_DEMO.used[memberId]||[]),...(redeemAssets||[])];                           /* gifts are consumed */
      if(walletMinor) LTY_DEMO.credit[memberId]=Math.max(0,(LTY_DEMO.credit[memberId]!=null?LTY_DEMO.credit[memberId]:m.credit)-walletMinor);
      m.punchCards.forEach(pc=>{ if(pc.id==='PC-POKE'&&(lines||[]).some(l=>(byId(l.pid)||{}).cat==='pokewan'&&!l.loyalty)){ const st=LTY_DEMO.stamps[memberId]||(LTY_DEMO.stamps[memberId]={}); st[pc.id]=(st[pc.id]||0)+1; } }); }
    const out={balance:bal,pointsEarned:earned,pointsSpent:spent}; LTY_DEMO.commits[idempotencyKey]=out;
    return new Promise(res=>setTimeout(()=>res(out),300)); },
};
const LOY={ state:'idle', member:null, token:null, url:null, expiresAt:0, gen:0, pollT:null, logoutT:null, last:null, err:null, qrCache:{},
  program:null, progState:'none' /* none|loading|ready|error */, progAt:0, progFailAt:0, sessionId:null, tab:'gifts', commitP:null };
const ltyOn=()=>!!(BRAND.features.loyalty&&adapter('loyalty'));
const ltyCfg=()=>BRAND.loyalty;
const ltyAllRewards=()=>LOY.program?LOY.program.rewards:[];
const ltyRewardById=id=>ltyAllRewards().find(r=>r.id===id);
const ltyLines=()=>S.cart.filter(l=>l.loyalty);
const ltySpent=()=>ltyLines().reduce((a,l)=>a+l.loyalty.cost*l.qty,0);
const ltyAvail=()=>LOY.member?Math.max(0,LOY.member.points-ltySpent()):0;
const ltyClaimedLine=rid=>S.cart.find(l=>l.loyalty&&l.loyalty.rid===rid);
const ltyNum=n=>{ try{ return new Intl.NumberFormat(S.lang==='en'?'en-GB':(S.lang==='mk'?'mk-MK':'nl-NL')).format(n); }catch(e){ return String(n); } };
function ltyRewards(){ return ltyAllRewards().filter(r=>{ const p=byId(r.pid); return p&&!p.disabled&&!alHidden(p); }).slice().sort((a,b)=>a.cost-b.cost); }
function ltyValidMember(m){ return !!m&&typeof m.id==='string'&&m.id.length>0&&m.id.length<=64&&typeof m.firstName==='string'
  &&m.firstName.trim().length>0&&m.firstName.length<=40&&Number.isInteger(m.points)&&m.points>=0&&m.points<=10000000; }
/* one reward from the backend → a safe, normalised reward, or null (then it is left out) */
function ltyValidReward(r){
  if(!r||typeof r!=='object'||typeof r.id!=='string'||!/^[A-Za-z0-9_.:-]{1,64}$/.test(r.id)||typeof r.pid!=='string') return null;
  const p=byId(r.pid); if(!p) return null;
  if(!Number.isInteger(r.cost)||r.cost<1||r.cost>10000000) return null;
  const pct=r.pct==null?100:r.pct, max=r.maxPerOrder==null?1:r.maxPerOrder;
  if(!Number.isInteger(pct)||pct<1||pct>100||!Number.isInteger(max)||max<1) return null;
  const ch=(r.variant&&r.variant.choices)||{}; if(typeof ch!=='object'||Array.isArray(ch)) return null;
  for(const [g,cid] of Object.entries(ch)){ if(typeof cid!=='string'||!optionAllowed(p,g,cid)) return null; }
  return { id:r.id, pid:r.pid, cost:r.cost, pct, maxPerOrder:Math.min(max,MAX_LINE_QTY), variant:{choices:{...ch}} };
}
function ltyLoadProgram(){
  const a=adapter('loyalty'); if(!a||LOY.progState==='loading') return;
  const hadProgram=!!LOY.program; LOY.progState='loading';
  withTimeout(a.getProgram(),ADAPTER_TIMEOUT_MS.loyalty,'loyalty').then(r=>{
    const list=r&&Array.isArray(r.rewards)?r.rewards.slice(0,200):null; if(!list) throw new Error('invalid-program');
    const seen=new Set(), out=[]; let dropped=0;
    list.forEach(x=>{ const v=ltyValidReward(x); if(v&&!seen.has(v.id)){ seen.add(v.id); out.push(v); } else dropped++; });
    if(dropped) reportClientError({type:'loyalty-program',message:dropped+' reward(s) rejected by validation'});
    LOY.program={rewards:out}; LOY.progState='ready'; LOY.progAt=Date.now();
    ltyAfterProgram();
  }).catch(e=>{ LOY.progFailAt=Date.now(); LOY.progState=hadProgram?'ready':'error'; reportClientError(e); ltyAfterProgram(); });
}
function ltyAfterProgram(){ if(S.screen==='menu'&&S.cat==='rewards'&&!S.sheet) ltyRefresh(false); else if(S.screen==='cart') render({keep:true}); }
function ltyProgramTick(){ if(!ltyOn()||LOY.progState==='loading') return; const now=Date.now();
  if(!LOY.program&&now-LOY.progFailAt<15000&&LOY.progState==='error') return;
  if(!LOY.program||now-LOY.progAt>ltyCfg().programRefreshMs) ltyLoadProgram(); }
function ltyPrice(l){ return Math.max(0,Math.round(unitPrice(l)*(100-l.loyalty.pct)/100)); }
function ltyLine(r){ const p=byId(r.pid), d=newDraft(p);
  Object.assign(d.choices,(r.variant&&r.variant.choices)||{});
  (p.choice||[]).forEach(g=>{ if(!d.choices[g]) d.choices[g]=defChoice(g)||((MODS[g].items[0]||{}).id); });   /* never leave a choice open */
  const l={...d, qty:1, extras:[], removes:[], crossSells:[], key:'LTY:'+r.id, lid:'L'+(uid++), lineType:'loyalty',
    loyalty:{rid:r.id, cost:r.cost, pct:r.pct, memberId:LOY.member?LOY.member.id:null},   /* travels with the POS order, also after a restart */ fixed:true, mergeable:false, groupId:'G'+(gid++), priceCheckedAt:Date.now()};
  l.unitPrice=ltyPrice(l); return l; }
/* cart rules: reserved points must be covered by the logged-in member; every reward line must still be in the program */
function ltyCartIssues(){ const ls=ltyLines(), cm=cmCartIssues(); if(!ls.length) return cm;
  if(!LOY.member||ltySpent()>LOY.member.points) return [{code:'loyalty-points'}];
  if(LOY.program&&ls.some(l=>{ const r=ltyRewardById(l.loyalty.rid); return !r||l.qty>r.maxPerOrder||r.cost!==l.loyalty.cost; })) return [{code:'loyalty-reward'}];
  return cm; }

/* ── login lifecycle ── */
function ltyStopPoll(){ clearTimeout(LOY.pollT); LOY.pollT=null; }
function ltySheetSync(){ if(S.sheet==='loyalty') syncOverlay(); }
function ltyStartLogin(){
  const a=adapter('loyalty'); if(!a) return;
  ltyStopPoll(); const gen=++LOY.gen; Object.assign(LOY,{state:'qr',token:null,url:null,err:null}); ltySheetSync();
  withTimeout(a.createLogin({deviceId:DEVICE_ID,lang:S.lang}),ADAPTER_TIMEOUT_MS.loyalty,'loyalty').then(r=>{
    if(gen!==LOY.gen) return;
    if(!r||typeof r.token!=='string'||!r.token||r.token.length>128||typeof r.url!=='string'||!/^https:\/\//.test(r.url)||r.url.length>512){ ltyFail('invalid-login'); return; }
    const ttl=Number.isFinite(r.expiresInS)?Math.max(20,Math.min(600,r.expiresInS)):ltyCfg().loginTtlS;
    Object.assign(LOY,{token:r.token,url:r.url,expiresAt:Date.now()+ttl*1000}); ltySheetSync(); ltyPoll(gen);
  }).catch(e=>{ if(gen===LOY.gen) ltyFail(e&&e.timeout?'timeout':'error'); });
}
function ltyPoll(gen){
  ltyStopPoll();
  LOY.pollT=setTimeout(()=>{
    if(gen!==LOY.gen||S.sheet!=='loyalty'||LOY.state!=='qr') return;
    if(Date.now()>=LOY.expiresAt){ LOY.state='expired'; ltySheetSync(); return; }
    withTimeout(adapter('loyalty').pollLogin({token:LOY.token}),ADAPTER_TIMEOUT_MS.loyalty,'loyalty').then(r=>{
      if(gen!==LOY.gen||LOY.state!=='qr') return;
      if(r&&r.status==='linked'){ if(ltyValidMember(r.member)&&typeof r.sessionId==='string'&&r.sessionId.length>0&&r.sessionId.length<=128) ltyLogin(r.member,r.sessionId); else ltyFail('invalid-member'); return; }
      if(r&&r.status==='expired'){ LOY.state='expired'; ltySheetSync(); return; }
      ltyPoll(gen);                                           /* pending or unknown → keep waiting */
    }).catch(()=>{ if(gen===LOY.gen&&LOY.state==='qr') ltyPoll(gen); });   /* a failed poll never logs anyone in */
  },ltyCfg().pollMs);
}
function ltyFail(reason){ ltyStopPoll(); LOY.state='error'; LOY.err=reason; track('loyalty_login_failed',{reason}); ltySheetSync(); }
function ltyLogin(m,sid){
  ltyStopPoll(); LOY.gen++; clearTimeout(LOY.logoutT);
  if(LOY.sessionId&&LOY.sessionId!==sid) cmEndSession('replaced');                    /* never two open Como sessions */
  LOY.member={ id:m.id, firstName:escText(m.firstName.trim()), points:m.points, ...cmMemberExtras(m) }; LOY.state='welcome'; LOY.token=null; LOY.url=null;
  LOY.sessionId=sid; cmStoreAdd(sid); cmResetBenefits(); CMB.memberId=m.id; LOY.tab=LOY.member.assets.length?'gifts':'shop';
  track('loyalty_login',{loyaltySession:sid});
  if(!LOY.program) ltyLoadProgram();
  if(S.screen==='attract'){ const sess=ORDER_SESSION;                 /* nobody starts an order → log out again */
    LOY.logoutT=setTimeout(()=>{ if(sess===ORDER_SESSION&&S.screen==='attract'&&LOY.member) ltyDoLogout(); },ltyCfg().attractLogoutMs); }
  ltySheetSync();
}
function ltyDoLogout(){
  ltyStopPoll(); clearTimeout(LOY.logoutT); LOY.gen++;
  S.cart=S.cart.filter(l=>!l.loyalty);                               /* reserved rewards go with the member */
  cmEndSession('logout'); cmResetBenefits();
  Object.assign(LOY,{state:'idle',member:null,token:null,url:null,err:null});
  if(S.sheet==='loyalty') S.sheet=null;
  track('loyalty_logout',{}); render({keep:true});
}
function ltyReset(){ ltyStopPoll(); clearTimeout(LOY.logoutT); LOY.gen++;
  ltyCancelLogin(); cmEndSession(LOY.last?'order-complete':'session-ended'); cmResetBenefits();
  Object.assign(LOY,{state:'idle',member:null,token:null,url:null,err:null,last:null});
  cmEndOrphans('cleanup'); }
function ltyCancelLogin(){ const a=adapter('loyalty'); if(LOY.token&&a&&typeof a.cancelLogin==='function'){ a.cancelLogin({token:LOY.token}).catch(()=>{}); } }

/* ── claim / more / less (one tap each, no confirmation: fully reversible) ── */
function ltyAdd(rid){
  const r=ltyRewardById(rid); if(!r) return;
  if(!LOY.member){ ACT.ltyOpen(); return; }
  const p=byId(r.pid), ex=ltyClaimedLine(rid);
  if(!p||availabilityService.checkProducts([p.id]).length||ltyAvail()<r.cost) return;
  if(ex){ if(ex.qty>=r.maxPerOrder) return; ex.qty=clampQty(ex.qty+1); } else S.cart.push(ltyLine(r));
  track('loyalty_claim',{reward:rid,cost:r.cost}); ltyRefresh(true);
}
function ltyRemove(rid){ const ex=ltyClaimedLine(rid); if(!ex) return;
  if(ex.qty>1) ex.qty--; else S.cart=S.cart.filter(l=>l!==ex);
  track('loyalty_unclaim',{reward:rid}); ltyRefresh(false); }
function ltyRefresh(added){
  const w=document.getElementById('ltyWrap');
  if(w&&S.screen==='menu'&&S.cat==='rewards'){ w.innerHTML=ltyBody(); ltyRailSync(); basketSync(); if(added) showAddNote(); }
  else render({keep:true});
}
function ltyRailSync(){ const b=document.querySelector('#railNav [data-lty]'); if(!b) return;
  if(LOY.member) b.setAttribute('data-pts',ltyNum(ltyAvail())); else b.removeAttribute('data-pts'); }

/* ── commit after the POS accepted the order (never blocks or changes payment / order) ── */
function ltyCommit(orderNo){
  const snap=PAY.snapshot, a=adapter('loyalty'), L=snap&&snap.loyalty;
  if(!a||!L||!LOY.member||LOY.member.id!==L.memberId) return;
  const lines=snap.lines.filter(l=>l.loyalty), sess=ORDER_SESSION;
  const spent=lines.reduce((s,l)=>s+l.loyalty.cost*l.qty,0);
  LOY.last={state:'pending',savedMinor:(L.discounts||[]).reduce((x,d)=>x+d.amountMinor,0)};
  const saved=LOY.last.savedMinor;
  LOY.commitP=withTimeout(a.commit({ idempotencyKey:'LTY-'+snap.orderId, sessionId:L.sessionId, memberId:L.memberId, orderId:snap.orderId, orderNo, orderTotalMinor:snap.total, grossMinor:L.grossMinor,
      redeemed:lines.map(l=>({rewardId:l.loyalty.rid,cost:l.loyalty.cost,qty:l.qty})), pointsSpent:spent, redeemAssets:L.redeemAssets||[], discounts:L.discounts||[], walletMinor:L.walletMinor||0,
      lines:snap.lines.map(l=>({pid:l.pid,qty:l.qty,loyalty:!!l.loyalty})) }),ADAPTER_TIMEOUT_MS.loyalty,'loyalty')
    .then(r=>{ if(sess!==ORDER_SESSION) return;
      const okN=v=>Number.isInteger(v)&&v>=0&&v<=10000000;
      if(r&&okN(r.balance)&&okN(r.pointsEarned)&&okN(r.pointsSpent)){ LOY.last={state:'done',spent:r.pointsSpent,earned:r.pointsEarned,balance:r.balance,savedMinor:saved}; if(LOY.member) LOY.member.points=r.balance; }
      else LOY.last={state:'later',savedMinor:saved};
      if(S.screen==='pay') render({keep:true}); })
    .catch(()=>{ if(sess!==ORDER_SESSION) return; LOY.last={state:'later',savedMinor:saved}; if(S.screen==='pay') render({keep:true}); });
}

/* ── €0 order (only free rewards): nothing to charge. The order is locked, persisted and sent to the
   POS exactly like a paid order — same idempotency key, same recovery path — via state 'no-charge'.
   The payment terminal is never touched. ── */
function payNoCharge(){
  if(PAY_ACTIVE.has(PAY.state)||PAY_UNCERTAIN.has(PAY.state)) return;
  if(!canRetryPayment()&&PAY.state!=='idle') return;
  if(!catalogService.fresh()){ if(S.screen!=='cart'){ S.screen='cart'; } render({keep:true}); return; }
  const issues=validateCart(); if(issues.length||cartTotal()!==0){ if(S.screen!=='cart'){ S.screen='cart'; } render({keep:true}); return; }
  PAY.orderId=PAY.orderId||newOrderId();
  PAY.attempt++; PAY.attemptId=PAY.orderId+'-N'+PAY.attempt+'-'+uuid().slice(0,6).toUpperCase(); PAY.lastError=null; PAY.txRef='NO-CHARGE';
  const now=Date.now();
  PAY.snapshot=Object.freeze({ lines:JSON.parse(JSON.stringify(S.cart)), total:0, count:cartCount(), service:S.service, lang:S.lang, loyalty:LOY.member?cmSnap():null, tag:tagSnap(),
    orderId:PAY.orderId, attemptId:PAY.attemptId, txRef:'NO-CHARGE', noCharge:true, paidAt:now, startedAt:now });
  PAY.submitKey='IDEMP-'+PAY.orderId;
  if(!persistPaid('approved')){ PAY.snapshot=null; PAY.txRef=null; PAY.lastError='storage-failed'; render({keep:true}); track('payment_blocked',{reason:'storage'}); return; }   /* a restart resends with the same key */
  FINALIZED.add(PAY.attemptId);
  track('checkout_started',{attemptId:PAY.attemptId,amount:0,noCharge:true});
  payGo('no-charge'); submitOrder();
}
const payOrSubmit=()=>cartTotal()===0&&S.cart.length>0&&(ltyLines().length>0||cmDiscountTotal()>0)?payNoCharge():payStart();

/* ── views ── */
function ltyQrSvg(text){ if(LOY.qrCache[text]) return LOY.qrCache[text];
  try{ const q=qrcode(0,'M'); q.addData(text); q.make(); const n=q.getModuleCount(); let d='';
    for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) d+=`M${c} ${r}h1v1h-1z`;
    return (LOY.qrCache[text]=`<svg viewBox="-2 -2 ${n+4} ${n+4}" width="100%" height="100%" shape-rendering="crispEdges" aria-hidden="true"><rect x="-2" y="-2" width="${n+4}" height="${n+4}" fill="#fff"/><path d="${d}" fill="#1A1915"/></svg>`); }
  catch(e){ reportClientError({type:'qr',message:String(e)}); return ''; } }
function ltyName(r){ const p=byId(r.pid); return r.pct>=100?tf('lty_freeN',{name:p.name}):tf('lty_offN',{p:r.pct,name:p.name}); }
function ltyAttractBtn(){ const m=LOY.member;
  return `<div class="flex justify-center lty-att">
    <button type="button" data-a="ltyOpen" class="press lty-pill${m?' on':''}">
      <span class="lty-ic">${m?ic('check','',2.8):icQR}</span>
      <span class="lty-lbl">${m?tf('lty_welcome',{name:m.firstName})+' · '+tf('lty_points',{n:ltyNum(m.points)}):t('lty_btn')}</span>
      <span class="lty-chev">${ic('chevR','',2.6)}</span></button></div>`; }
function ltyMain(){
  return `
    <div class="flex items-center justify-between px-5 pt-7 flex-none topbar">
      <div class="text-[16px] font-semibold leading-[22px] tracking-[4px] uppercase text-mute">${BRAND.copy.tagline}</div>
      <div class="flex items-center gap-3">${alFilterBtn()}${langPills(false)}</div>
    </div>
    <h1 class="hd text-[72px] leading-[72px] tracking-[1px] px-5 mt-4 flex-none">${t('lty_nav')}</h1>
    <div class="text-[24px] text-mute font-semibold px-5 mt-2 flex-none">${t('lty_sub')}</div>
    <div class="scroller flex-1 px-5 pt-7 pb-[220px]"><div id="ltyWrap">${ltyBody()}</div></div>`;
}
function ltyBody(){
  const m=LOY.member, cols=presentationFor('rewards').columns;
  const panel=m?`<div class="lty-member">
      <div class="lty-avatar" aria-hidden="true">${m.firstName.charAt(0).toUpperCase()}</div>
      <div class="lty-mid">
        <div class="lty-hi">${tf('lty_hi',{name:m.firstName})}</div>
        <div class="lty-bal"><span class="lty-pts">${ltyNum(ltyAvail())}</span><span class="lty-unit">${t('lty_ptsAvail')}</span></div>
        ${ltySpent()?`<div class="lty-used">${tf('lty_used',{n:ltyNum(ltySpent())})}</div>`:''}${m.credit?`<div class="lty-used">${tf('cm_credit',{amount:fmt(m.credit)})}</div>`:''}
      </div>
      <button type="button" data-a="ltyLogout" class="press lty-out">${t('lty_logout')}</button></div>`
   :`<div class="lty-member">
      <div class="lty-avatar lty-qric" aria-hidden="true">${icQR}</div>
      <div class="lty-mid"><div class="lty-hi">${t('lty_loginT')}</div><div class="lty-used">${t('lty_loginS')}</div></div>
      <button type="button" data-a="ltyOpen" class="press lty-in">${t('lty_loginBtn')}</button></div>`;
  if(m&&(LOY.tab||'gifts')==='gifts') return panel+cmTabsHTML()+cmGiftsHTML(cols);
  const tabs=m?cmTabsHTML():'';
  if(!LOY.program) return panel+tabs+(LOY.progState==='error'
    ? `<div class="lty-empty" role="status">${t('lty_progErr')}<div><button type="button" data-a="ltyReloadProg" class="press lty-in">${t('lty_retry')}</button></div></div>`
    : `<div class="lty-empty" role="status"><div class="lty-spin lty-spin-s"></div>${t('lty_progLoading')}</div>`);
  const list=ltyRewards();
  if(!list.length) return panel+tabs+`<div class="lty-empty" role="status">${t('lty_progEmpty')}</div>`;
  return panel+tabs+`<div class="lty-grid" style="grid-template-columns:repeat(${cols},1fr)">${list.map(ltyCard).join('')}</div>`;
}
function ltyCard(r){
  const p=byId(r.pid), m=LOY.member, ex=ltyClaimedLine(r.id), n=ex?ex.qty:0, na=availabilityService.checkProducts([p.id]).length>0;
  const afford=!!m&&ltyAvail()>=r.cost, can=!!m&&!na&&(n>0||afford), name=ltyName(r);
  const more=n<r.maxPerOrder&&afford;
  const cta = na ? `<button type="button" class="lty-cta need" disabled aria-disabled="true">${t('unavailT')}</button>`
    : !m ? `<button type="button" data-a="ltyOpen" class="press lty-cta login">${t('lty_login')}</button>`
    : n&&r.maxPerOrder===1 ? `<button type="button" data-a="ltyClaim" data-id="${r.id}" aria-pressed="true" aria-label="${tf('lty_undoA',{name})}" class="press lty-cta done"><span class="lty-ck">${ic('check','',3)}</span>${t('lty_inOrder')}</button>`
    : n ? `<div class="lty-stp" role="group" aria-label="${name}">
        <button type="button" data-a="ltyDec" data-id="${r.id}" class="press" aria-label="${tf('lty_lessA',{name})}"><span class="lty-ck">${ic('minus','',3)}</span></button>
        <span class="lty-n" aria-live="polite" aria-label="${tf('lty_nIn',{n})}">${n}×</span>
        <button type="button" ${more?`data-a="ltyInc" data-id="${r.id}"`:'disabled aria-disabled="true"'} class="press" aria-label="${tf('lty_moreA',{name})}"><span class="lty-ck">${ic('plus','',3)}</span></button></div>`
    : afford ? `<button type="button" data-a="ltyClaim" data-id="${r.id}" aria-pressed="false" class="press lty-cta go">${t('lty_redeem')}</button>`
    : `<button type="button" class="lty-cta need" disabled aria-disabled="true">${tf('lty_short',{n:ltyNum(r.cost-ltyAvail())})}</button>`;
  return `<article class="lty-card shadow-soft${can?'':' lty-off'}${n?' claimed':''}">
    <div class="lty-img">${foodImg(p,'','64px')}
      <span class="lty-badge" aria-hidden="true">${r.pct>=100?t('lty_free'):`${r.pct}%<small>${t('lty_offShort')}</small>`}</span></div>
    <div class="lty-body">
      <div class="lty-name">${name}</div>
      <div class="lty-meta">
        <div class="lty-cost"><i aria-hidden="true">${ic('coin','',2)}</i><span class="num">${ltyNum(r.cost)}</span><span class="lty-cu">${t('lty_ptsShort')}</span></div>
        ${r.maxPerOrder>1?`<div class="lty-max">${tf('lty_max',{n:r.maxPerOrder})}</div>`:''}
      </div>
      ${cta}
    </div></article>`;
}
function ltyCartLine(l,p,sum){ const r=ltyRewardById(l.loyalty.rid), name=(l.qty>1?l.qty+'× ':'')+(r?ltyName(r):p.name);
  return `<div class="flex gap-6 p-5 rounded-[26px] mb-4 line-gift">
      <div class="w-[132px] h-[132px] rounded-[20px] overflow-hidden flex-none">${foodImg(p,'h-full','58px')}</div>
      <div class="flex-1 min-w-0 py-1">
        <div class="flex items-center gap-3"><div class="hd text-[25px] tracking-[.03em]">${name}</div><span class="badge b-dea">★ ${t('lty_line')}</span></div>
        <div class="text-[19px] text-mute font-semibold mt-1">${tf('lty_lineS',{n:ltyNum(l.loyalty.cost*l.qty)})}${sum?' · '+sum:''}</div>
        <button type="button" data-a="delLine" data-lid="${l.lid}" class="press mt-3 h-[56px] px-5 rounded-full bg-card shadow-soft text-[19px] font-bold text-ink/70">${tf('removeA',{name:p.name})}</button>
      </div>
      <div class="flex flex-col items-end justify-between py-1"><div class="num text-[27px] font-extrabold" id="lp-${l.lid}">${fmt(lineUnit(l)*l.qty)}</div></div>
    </div>`; }
function ltyDoneLine(){ const r=LOY.last; if(!r) return '';
  const txt=r.state==='done'?(r.spent?tf('lty_doneS',{spent:ltyNum(r.spent),earned:ltyNum(r.earned),bal:ltyNum(r.balance)}):tf('lty_doneE',{earned:ltyNum(r.earned),bal:ltyNum(r.balance)}))
    :(r.state==='later'?t('lty_later'):t('lty_saving'));
  return `<div><div class="lty-done" role="status"><i aria-hidden="true">${ic('coin','',2)}</i>${r.savedMinor?tf('cm_saved',{amount:fmt(r.savedMinor)})+' · ':''}${txt}</div></div>`; }
function ltySheetHTML(){
  const st=LOY.state, m=LOY.member, att=S.screen==='attract';
  let body;
  if(st==='welcome'&&m){
    body=`<div class="lty-hello">
      <div class="lty-okc pop">${ic('check','',2.8)}</div>
      <div class="hd lty-wt">${tf('lty_welcome',{name:m.firstName})}</div>
      <p class="lty-wb">${t('lty_welcomeB')}</p>
      <div class="lty-balcard"><span class="lty-pts">${ltyNum(ltyAvail())}</span><span class="lty-unit">${t('lty_ptsAvail')}</span></div>
      ${m.assets.length?`<div class="cm-wg"><span>${ic('gift','',2)}</span>${tf('cm_giftsReady',{n:m.assets.length})}</div>`:''}
      ${att?`<div class="hd lty-how">${t('howOrder')}</div>
      <div class="lty-go2">
        <button type="button" data-a="ltyStart" data-s="eatin" class="press lty-big"><span class="lty-bi">${ic('dish','',2.2)}</span>${t('eatIn')}</button>
        <button type="button" data-a="ltyStart" data-s="takeaway" class="press lty-big"><span class="lty-bi">${ic('bag','',2.2)}</span>${t('takeAway')}</button></div>`
      :`<button type="button" data-a="ltyGo" class="press lty-big lty-wide">${t('lty_toRewards')}<span class="lty-bi">${ic('arrR','',2.4)}</span></button>`}
      <div><button type="button" data-a="ltyLogout" class="press lty-textbtn">${t('lty_logout')}</button></div>
    </div>`;
  } else if(st==='error'){
    body=`<div class="lty-hello"><div class="lty-err">${ic('info','',2)}</div>
      <div class="hd lty-wt">${t('lty_errT')}</div><p class="lty-wb">${t('lty_err')}</p>
      <button type="button" data-a="ltyRetry" class="press lty-big lty-wide">${t('lty_retry')}</button></div>`;
  } else {
    const exp=st==='expired', qr=LOY.url?ltyQrSvg(LOY.url):'';
    body=`<div class="hd lty-wt">${t('lty_scanT')}</div>
      <p class="lty-wb">${t('lty_scanS')}</p>
      <div class="lty-qr${exp?' exp':''}">${qr?(IS_DEMO&&!exp?`<button type="button" data-a="ltyDemoScan" data-id="xander" class="lty-qrb" aria-label="${t('lty_demo')} Xander">${qr}</button>`:qr)
          :`<div class="lty-spin" role="status" aria-label="${t('lty_wait')}"></div>`}
        ${exp?`<div class="lty-expv"><button type="button" data-a="ltyRetry" class="press lty-in">${t('lty_newCode')}</button></div>`:''}</div>
      <div class="lty-wait" role="status">${exp?t('lty_expired'):(qr?`<span class="lty-dot"></span>${t('lty_wait')}`:'')}</div>
      ${IS_DEMO&&qr&&!exp?`<div class="lty-demo"><span>${t('lty_demo')}</span>${Object.entries(LTY_DEMO_MEMBERS).map(([k,v])=>
        `<button type="button" data-a="ltyDemoScan" data-id="${k}" class="press lty-chip">${v.firstName} · ${ltyNum(ltyDemoBal(v))}</button>`).join('')}</div>`:''}`;
  }
  return `<div class="absolute inset-0 z-40" style="background:rgb(var(--c-ink)/.55)" data-a="ltyClose">
    <div class="absolute left-0 right-0 bottom-0 bg-paper rounded-t-[36px] p-12 sheetup lty-sheet" data-stop="1" role="dialog" aria-modal="true" aria-label="${t('lty_btn')}">
      <div class="w-[72px] h-[6px] rounded-full bg-ink/15 mx-auto mb-9"></div>
      ${body}
      ${st==='welcome'&&m?'':`<button type="button" data-a="ltyClose" class="press lty-close w-full h-[96px] mt-10 rounded-full bg-ink text-cream hd text-[24px] tracking-[.1em]">${t('close')}</button>`}
    </div></div>`;
}

/* ══════════════════════════════════════════════════════════════
   COMO LAYER (v29) — member session · gifts (assets) · benefits · wallet · punch cards · personal offers
   Identification stays OUR QR activation (that is what makes a guest recognisable for personal offers).
   Como concepts mapped onto the loyalty adapter:
     pollLogin(linked)  → { sessionId, member:{ id, firstName, points, credit?, assets?[], punchCards?[] } }   ≈ getMemberDetails
     getBenefits(req)   → { discounts:[{id, source:'deal'|'asset'|'wallet', name, amountMinor, assetKey?}], earnPoints, notRedeemable?[] }
     commit(…)          ≈ submitPurchase (only after POS acceptance)
     endSession({sessionId, reason}) — ALWAYS called when the kiosk session ends (logout, order done, timeout,
                          cancel, auto-logout on the start screen) and, after a crash/reload, at the next start.
   The backend computes every discount and every point. The kiosk only shows, reserves and passes them on.
   ══════════════════════════════════════════════════════════════ */
const CM_SESS_KEY='guestit.loyalty.sessions.v1';
function cmStoreGet(){ try{ const v=JSON.parse(localStorage.getItem(CM_SESS_KEY)||'[]'); return Array.isArray(v)?v.filter(x=>typeof x==='string'&&x.length<=128):[]; }catch(e){ return []; } }
function cmStoreSet(list){ try{ if(list.length) localStorage.setItem(CM_SESS_KEY,JSON.stringify(list.slice(-20))); else localStorage.removeItem(CM_SESS_KEY); }catch(e){} }
const cmStoreAdd=sid=>{ const l=cmStoreGet(); if(!l.includes(sid)){ l.push(sid); cmStoreSet(l); } };
const cmStoreDel=sid=>cmStoreSet(cmStoreGet().filter(x=>x!==sid));
/* end one Como session; waits for a running commit (submitPurchase) first; the id stays stored until the backend confirms */
const CM_ENDING=new Set();            /* exactly one end call in flight per session */
function cmEndSessionId(sid,reason){
  const a=adapter('loyalty'); if(!sid||CM_ENDING.has(sid)) return;
  if(!a||typeof a.endSession!=='function'){ cmStoreDel(sid); return; }
  CM_ENDING.add(sid);
  const commit=LOY.commitP||Promise.resolve();
  commit.catch(()=>{}).then(()=>withTimeout(a.endSession({sessionId:sid,reason}),ADAPTER_TIMEOUT_MS.loyalty,'loyalty'))
    .then(()=>{ cmStoreDel(sid); track('loyalty_session_end',{reason,loyaltySession:sid}); })
    .catch(e=>{ reportClientError({type:'loyalty-end-session',message:String(e&&e.message||e)}); })   /* stays stored → retried at the next reset / start */
    .then(()=>CM_ENDING.delete(sid));
}
function cmEndSession(reason){ const sid=LOY.sessionId; LOY.sessionId=null; if(sid) cmEndSessionId(sid,reason); }
/* sessions left behind (crash, reload, failed end call) — never one that a paid, not-yet-accepted order still refers to */
function cmEndOrphans(reason){
  let held=null; try{ const r=JSON.parse(localStorage.getItem(PAID_KEY)||'null'); if(r&&!r.accepted&&r.submissionState!=='accepted') held=r.loyalty&&r.loyalty.sessionId; }catch(e){}   /* accepted orders no longer hold their session */
  if(PAY.snapshot&&PAY.snapshot.loyalty&&!PAY.accepted) held=held||PAY.snapshot.loyalty.sessionId;
  cmStoreGet().forEach(sid=>{ if(sid!==LOY.sessionId&&sid!==held) cmEndSessionId(sid,reason); });
}
setTimeout(()=>{ try{ cmEndOrphans('restart'); }catch(e){ reportClientError(e); } },400);

/* ── validation of what the backend sends about the member ── */
function cmValidAsset(a){
  if(!a||typeof a!=='object'||typeof a.key!=='string'||!/^[A-Za-z0-9_.:-]{1,64}$/.test(a.key)) return null;
  if(typeof a.name!=='string'||!a.name.trim()||a.name.length>80||!['item','percent','amount'].includes(a.kind)) return null;
  const pids=Array.isArray(a.pids)?a.pids.filter(x=>typeof x==='string'&&byId(x)):[], cats=Array.isArray(a.cats)?a.cats.filter(x=>typeof x==='string'&&CATS.some(c=>c.id===x)):[];
  if((Array.isArray(a.pids)&&a.pids.length&&!pids.length)||(Array.isArray(a.cats)&&a.cats.length&&!cats.length)) return null;   /* a condition we cannot show is not shown at all */
  const pct=a.pct==null?100:a.pct; if(a.kind!=='amount'&&(!Number.isInteger(pct)||pct<1||pct>100)) return null;
  if(a.kind==='amount'&&(!Number.isInteger(a.amountMinor)||a.amountMinor<1||a.amountMinor>100000)) return null;
  if(a.minSpendMinor!=null&&(!Number.isInteger(a.minSpendMinor)||a.minSpendMinor<0)) return null;
  const s=(v,n)=>typeof v==='string'&&v.length<=n?escText(v):null;
  return { key:a.key, name:escText(a.name.trim()), kind:a.kind, pids, cats, pct, amountMinor:a.amountMinor||0, minSpendMinor:a.minSpendMinor||0,
    description:s(a.description,140), validUntil:s(a.validUntil,20), offer:a.offer===true };
}
function cmValidPunch(p){ if(!p||typeof p.id!=='string'||typeof p.name!=='string'||p.name.length>60||!Number.isInteger(p.total)||p.total<2||p.total>20
  ||!Number.isInteger(p.stamps)||p.stamps<0||p.stamps>p.total) return null;
  return { id:p.id, name:escText(p.name), stamps:p.stamps, total:p.total, rewardName:typeof p.rewardName==='string'&&p.rewardName.length<=60?escText(p.rewardName):'' }; }
function cmMemberExtras(m){
  const assets=(Array.isArray(m.assets)?m.assets.slice(0,50):[]).map(cmValidAsset).filter(Boolean);
  const punch=(Array.isArray(m.punchCards)?m.punchCards.slice(0,5):[]).map(cmValidPunch).filter(Boolean);
  const credit=Number.isInteger(m.credit)&&m.credit>=0&&m.credit<=10000000?m.credit:0;
  return { assets, punch, credit };
}

/* ── benefits (Como getBenefits): recomputed for every cart change; payment waits for a fresh answer ── */
function cmKey(){ return JSON.stringify([CMB.memberId, S.cart.map(l=>[l.lid,l.pid,l.qty,lineUnit(l),l.loyalty?1:0,l.reward?1:0]), [...CMB.applied].sort(), CMB.useWallet]); }
const cmValid=()=>!!CMB.memberId&&CMB.state==='ready'&&CMB.key===cmKey();
function cmDiscountTotal(){ return cmValid()?CMB.discounts.reduce((a,d)=>a+d.amountMinor,0):0; }
function cmShown(){ return CMB.memberId&&(CMB.state==='ready'||CMB.state==='pending')?CMB.discounts:[]; }      /* display only (may be one tick old) */
const cmShownTotal=()=>cmShown().reduce((a,d)=>a+d.amountMinor,0);
const cmDisplayTotal=()=>Math.max(0,cartGross()-cmShownTotal());
const cmPaidLines=()=>S.cart.filter(l=>!l.loyalty&&!l.reward);
function cmResetBenefits(){ clearTimeout(CMB.timer); CMB.gen++; Object.assign(CMB,{key:null,state:'idle',discounts:[],earn:0,notRedeemable:{},memberId:null,failAt:0,useWallet:false}); CMB.applied=new Set(); }
function cmTick(){
  const a=adapter('loyalty'); if(!LOY.member||!a||typeof a.getBenefits!=='function') return;
  const k=cmKey();
  if(CMB.key===k&&(CMB.state==='ready'||CMB.state==='pending')) return;
  if(CMB.key===k&&CMB.state==='error'&&Date.now()-CMB.failAt<10000) return;
  if(!S.cart.length){ Object.assign(CMB,{key:k,state:'ready',discounts:[],earn:0,notRedeemable:{}}); return; }
  CMB.key=k; CMB.state='pending'; const gen=++CMB.gen; clearTimeout(CMB.timer);
  CMB.timer=setTimeout(()=>{ if(gen!==CMB.gen) return;
    const req={ sessionId:LOY.sessionId, memberId:LOY.member.id, grossMinor:cartGross(), useWallet:CMB.useWallet, redeemAssets:[...CMB.applied],
      lines:S.cart.map(l=>({ lineId:l.lid, pid:l.pid, cat:(byId(l.pid)||{}).cat||null, qty:l.qty, unitMinor:lineUnit(l), kind:l.loyalty?'points-reward':(l.reward?'gift':'product') })) };
    withTimeout(a.getBenefits(req),ADAPTER_TIMEOUT_MS.loyalty,'loyalty').then(r=>{
      if(gen!==CMB.gen) return; const v=cmValidBenefits(r,req); if(!v) throw new Error('invalid-benefits');
      Object.assign(CMB,{state:'ready',discounts:v.discounts,earn:v.earn,notRedeemable:v.nr}); cmAfter();
    }).catch(e=>{ if(gen!==CMB.gen) return;
      Object.assign(CMB,{state:'error',discounts:[],earn:0,notRedeemable:{},failAt:Date.now()}); reportClientError(e); cmAfter(); });   /* no discount, never blocked */
  },120);
}
function cmValidBenefits(r,req){
  if(!r||!Array.isArray(r.discounts)||r.discounts.length>20) return null;
  const out=[]; let sum=0;
  for(const d of r.discounts){
    if(!d||typeof d.id!=='string'||d.id.length>64||!['deal','asset','wallet'].includes(d.source)||typeof d.name!=='string'||!d.name.trim()||d.name.length>80
      ||!Number.isInteger(d.amountMinor)||d.amountMinor<0) return null;
    if(d.source==='asset'&&(typeof d.assetKey!=='string'||!req.redeemAssets.includes(d.assetKey))) return null;     /* never a gift the guest did not choose */
    if(d.source==='wallet'&&(!req.useWallet||d.amountMinor>((LOY.member&&LOY.member.credit)||0))) return null;
    if(!d.amountMinor) continue;
    sum+=d.amountMinor; out.push({ id:d.id, source:d.source, name:escText(d.name.trim()), amountMinor:d.amountMinor, assetKey:d.assetKey||null });
  }
  if(sum>req.grossMinor) return null;
  const nr={}; (Array.isArray(r.notRedeemable)?r.notRedeemable:[]).forEach(x=>{ if(x&&typeof x.key==='string') nr[x.key]=true; });
  return { discounts:out, earn:Number.isInteger(r.earnPoints)&&r.earnPoints>=0?r.earnPoints:0, nr };
}
function cmAfter(){
  if(S.screen==='cart'||S.screen==='pay'&&PAY.state==='idle'){ render({keep:true}); return; }
  if(S.screen==='menu'&&S.cat==='rewards'){ const w=document.getElementById('ltyWrap'); if(w&&!S.sheet){ w.innerHTML=ltyBody(); } }
  basketSync();
}
function cmCartIssues(){ const a=adapter('loyalty');
  if(!LOY.member||!S.cart.length||!a||typeof a.getBenefits!=='function') return [];
  return CMB.state==='error'||cmValid()?[]:[{code:'loyalty-benefits'}]; }
/* everything the POS and the backend need, frozen into the order */
function cmSnap(){ const ds=cmValid()?CMB.discounts:[];
  return { memberId:LOY.member.id, sessionId:LOY.sessionId, discounts:ds.map(d=>({...d})), redeemAssets:ds.filter(d=>d.source==='asset').map(d=>d.assetKey),
    walletMinor:ds.filter(d=>d.source==='wallet').reduce((a,d)=>a+d.amountMinor,0), grossMinor:cartGross(), earnPreview:cmValid()?CMB.earn:null }; }

/* ── gift conditions (UI guidance only — the backend decides) ── */
function cmCond(a){ const pl=cmPaidLines();
  if(a.pids.length&&!pl.some(l=>a.pids.includes(l.pid))) return {met:false,need:'item'};
  if(a.cats.length&&!pl.some(l=>a.cats.includes((byId(l.pid)||{}).cat))) return {met:false,need:'cat'};
  const sub=pl.reduce((s,l)=>s+lineUnit(l)*l.qty,0);
  if(a.minSpendMinor&&sub<a.minSpendMinor) return {met:false,need:'spend',short:a.minSpendMinor-sub};
  return {met:true}; }
const cmAssetById=k=>((LOY.member&&LOY.member.assets)||[]).find(a=>a.key===k);
function cmNeedText(a,c){ return c.need==='item'?tf('cm_needItem',{name:byId(a.pids[0]).name}):c.need==='cat'?tf('cm_needCat',{name:t('cat_'+a.cats[0])}):tf('cm_needSpend',{amount:fmt(c.short)}); }
function cmBadge(a){ return a.kind==='amount'?fmt(a.amountMinor):(a.pct>=100&&a.kind==='item'?t('lty_free'):`${a.pct}%<small>${t('lty_offShort')}</small>`); }
function cmGiftImg(a){ const p=a.pids.length?byId(a.pids[0]):(a.cats.length?PRODUCTS.find(x=>x.cat===a.cats[0]&&!x.disabled):null);
  return p?foodImg(p,'','64px'):`<div class="cm-gic">${ic('gift','',1.6)}</div>`; }
function cmGiftCard(a){
  const c=cmCond(a), on=CMB.applied.has(a.key), notNow=on&&(!c.met||CMB.notRedeemable[a.key]);
  let cta;
  if(on) cta=`<button type="button" data-a="cmApply" data-id="${a.key}" aria-pressed="true" aria-label="${tf('cm_removeA',{name:a.name})}" class="press lty-cta done"><span class="lty-ck">${ic('check','',3)}</span>${t('cm_applied')}</button>`;
  else if(c.met) cta=`<button type="button" data-a="cmApply" data-id="${a.key}" aria-pressed="false" class="press lty-cta go">${t('cm_apply')}</button>`;
  else if(c.need==='item') cta=`<button type="button" data-a="cmFix" data-id="${a.key}" class="press lty-cta login">${tf('cm_addX',{name:byId(a.pids[0]).name})}</button>`;
  else if(c.need==='cat') cta=`<button type="button" data-a="cmFix" data-id="${a.key}" class="press lty-cta login">${tf('cm_goCat',{name:t('cat_'+a.cats[0])})}</button>`;
  else cta=`<button type="button" class="lty-cta need" disabled aria-disabled="true">${tf('cm_short',{amount:fmt(c.short)})}</button>`;
  return `<article class="lty-card shadow-soft${on||c.met?'':' lty-off'}${on?' claimed':''}">
    <div class="lty-img">${cmGiftImg(a)}<span class="lty-badge" aria-hidden="true">${cmBadge(a)}</span></div>
    <div class="lty-body">
      <div class="lty-name">${a.name}</div>
      <div class="lty-meta">
        ${!c.met||notNow?`<div class="cm-need${on?' warn':''}">${cmNeedText(a,c.met?{need:'item'}:c)}</div>`
          :`<div class="lty-max">${a.description||''}${a.validUntil?(a.description?' · ':'')+tf('cm_validUntil',{d:a.validUntil}):''}</div>`}
      </div>
      ${cta}
    </div></article>`;
}
function cmPunchHTML(m){ if(!m.punch.length) return '';
  return m.punch.map(p=>`<div class="cm-punch" role="img" aria-label="${p.name}: ${p.stamps}/${p.total}">
    <div class="cm-pt"><b>${p.name}</b><span>${p.rewardName?tf('cm_punchLeft',{n:p.total-p.stamps,reward:p.rewardName}):p.stamps+'/'+p.total}</span></div>
    <div class="cm-dots">${Array.from({length:p.total},(_,i)=>`<i class="${i<p.stamps?'on':''}${i===p.total-1?' last':''}">${i===p.total-1?ic('gift','',2):(i<p.stamps?ic('check','',3):'')}</i>`).join('')}</div></div>`).join(''); }
function cmGiftsHTML(cols){ const m=LOY.member, list=m.assets;
  return cmPunchHTML(m)+(list.length?`<div class="lty-grid" style="grid-template-columns:repeat(${cols},1fr)">${list.map(cmGiftCard).join('')}</div>`
    :`<div class="lty-empty" role="status">${t('cm_noGifts')}<div><button type="button" data-a="cmTab" data-t="shop" class="press lty-in">${t('cm_toShop')}</button></div></div>`); }
function cmTabsHTML(){ const n=LOY.member.assets.length, tab=LOY.tab||'gifts';
  const b=(id,label)=>`<button type="button" role="tab" data-a="cmTab" data-t="${id}" aria-selected="${tab===id}" class="press cm-tab${tab===id?' on':''}">${label}</button>`;
  return `<div class="cm-tabs" role="tablist">${b('gifts',t('cm_tabGifts')+(n?` <span class="cm-cnt">${n}</span>`:''))}${b('shop',t('cm_tabShop'))}</div>`; }
/* personal offer (Como "upsell with gifts"): one tap to accept, zero taps to decline */
function cmOfferBanner(){ const m=LOY.member; if(!m||!ltyOn()) return '';
  const a=m.assets.find(x=>x.offer&&x.pids.length&&!CMB.applied.has(x.key)&&!cmPaidLines().some(l=>x.pids.includes(l.pid))); if(!a) return '';
  const p=byId(a.pids[0]); if(!p||availabilityService.checkProducts([p.id]).length) return '';
  return `<div class="cm-offer" role="note"><div class="cm-oimg">${foodImg(p,'','40px')}</div>
    <div class="cm-otx"><div class="cm-ok">★ ${tf('cm_forYou',{name:m.firstName})}</div><div class="cm-ot">${a.name}</div></div>
    <button type="button" data-a="cmFix" data-id="${a.key}" class="press cm-ob">${t('cm_add')}</button></div>`; }
/* cart: loyalty box (Como "My cart" with rewards, credit and earn preview) */
function cmCartHTML(){
  if(!ltyOn()) return '';
  const m=LOY.member;
  if(!m) return `<div class="cm-box cm-join"><div class="cm-jic">${icQR}</div><div class="cm-jtx"><b>${t('cm_join')}</b><span>${t('cm_joinS')}</span></div>
    <button type="button" data-a="ltyOpen" class="press lty-in">${t('lty_loginBtn')}</button></div>`;
  const ds=cmShown(), pend=CMB.state==='pending', err=CMB.state==='error';
  const rows=ds.map(d=>`<div class="cm-drow${pend?' stale':''}"><span class="cm-dsrc">${t('cm_src_'+d.source)}</span><span class="cm-dn">${d.name}</span>
      <span class="cm-da num">−${fmt(d.amountMinor)}</span>${d.source==='deal'?'<span class="cm-dx"></span>'
      :`<button type="button" data-a="${d.source==='wallet'?'cmWallet':'cmApply'}" data-id="${d.assetKey||''}" class="press cm-dx" aria-label="${tf('cm_removeA',{name:d.name})}">${ic('x','',2.6)}</button>`}</div>`).join('');
  const waiting=[...CMB.applied].map(cmAssetById).filter(a=>a&&!ds.some(d=>d.assetKey===a.key)).map(a=>{ const c=cmCond(a);
    return `<div class="cm-drow"><span class="cm-dsrc">${t('cm_src_asset')}</span><span class="cm-dn">${a.name}<em class="cm-need warn">${c.met?(pend?t('cm_calc'):t('cm_notNow')):cmNeedText(a,c)}</em></span>
      <span class="cm-da"></span><button type="button" data-a="cmApply" data-id="${a.key}" class="press cm-dx" aria-label="${tf('cm_removeA',{name:a.name})}">${ic('x','',2.6)}</button></div>`; }).join('');
  const sugg=m.assets.filter(a=>!CMB.applied.has(a.key)&&cmCond(a).met).slice(0,3).map(a=>`<button type="button" data-a="cmApply" data-id="${a.key}" class="press cm-chip"><span class="cm-ci">${ic('gift','',2)}</span>${a.name}<b>${t('cm_apply')}</b></button>`).join('');
  return `<section class="cm-box" aria-label="${t('lty_nav')}">
    <div class="cm-who"><span class="lty-avatar cm-av" aria-hidden="true">${m.firstName.charAt(0).toUpperCase()}</span>
      <div class="cm-wtx"><b>${m.firstName}</b> · ${tf('lty_points',{n:ltyNum(ltyAvail())})}${m.credit?` · ${tf('cm_credit',{amount:fmt(m.credit)})}`:''}</div>
      <button type="button" data-a="ltyGo" class="press cm-link">${t('lty_nav')} ${ic('chevR','',2.6)}</button></div>
    ${rows||waiting?`<div class="cm-dl">${rows}${waiting}</div>`:''}
    ${sugg?`<div class="cm-sugg"><div class="cm-sl">${t('cm_suggest')}</div>${sugg}</div>`:''}
    ${m.credit?`<button type="button" role="switch" aria-checked="${CMB.useWallet}" data-a="cmWallet" class="press cm-wallet${CMB.useWallet?' on':''}">
      <span class="cm-wtx2"><b>${t('cm_wallet')}</b><span>${tf('cm_walletS',{amount:fmt(m.credit)})}</span></span><span class="cm-sw"><i></i></span></button>`:''}
    <div class="cm-earn" role="status">${err?t('cm_err'):pend?t('cm_calc'):(CMB.state==='ready'&&CMB.earn?`<span class="cm-ei">${ic('coin','',2)}</span>${tf('cm_earn',{n:ltyNum(CMB.earn)})}`:'')}</div>
  </section>`;
}
function cmTotalsHTML(){ const d=cmShownTotal(); if(!d) return '';
  return `<div class="cm-tot"><span>${t('cm_subtotal')}</span><span class="num">${fmt(cartGross())}</span></div>
    <div class="cm-tot cm-disc"><span>${t('cm_discount')}</span><span class="num">−${fmt(d)}</span></div>`; }
/* availability is a service boundary: the prototype adapter reads the simulator set; production asks the POS/stock service */
/* ── AVAILABILITY & CATALOG (adapter contract) ─────────────────────
   availability.check(productIds) → unavailableIds[]          (required)
   catalog.current()              → {prices:{pid:cents}, variants:{variantId:cents}, disabled:[pid]}   (optional)
   The kiosk keeps a CACHE (AVAIL) filled by catalogService.refresh(); sync
   validation reads the cache. refresh() runs after (re)connect, when a
   product opens (single id) and BEFORE every payment start. State:
   fresh | checking | failed | stale — payment is blocked unless fresh.      */
const AVAIL={ unavailable:new Set(), disabled:new Set(), state:'stale', checkedAt:0, error:null, seq:0 };
const AVAIL_FRESH_MS=30000;
const availabilityService={
  checkProducts(ids){ return [...new Set(ids)].filter(id=>AVAIL.unavailable.has(id)||AVAIL.disabled.has(id)); },   /* cache-based, sync */
  checkCart(){ return this.checkProducts(cartProductIds()); },
};
const cartProductIds=()=>[...new Set(S.cart.flatMap(l=>l.lineType==='cross-sell'?[l.pid]:includedPids(l)))];
const catalogService={
  async refresh(ids){                             /* → true when the cache is fresh and trustworthy */
    const av=adapter('availability'); if(!av){ AVAIL.state='failed'; AVAIL.error='no-availability-adapter'; return false; }
    AVAIL.state='checking'; const sess=ORDER_SESSION, seq=++AVAIL.seq;   /* sequence: an older response can never overwrite a newer one */
    try{
      const full=!ids, want=ids||PRODUCTS.map(p=>p.id);                          /* full sync = whole catalog, so stale entries can never linger */
      const na=await withTimeout(av.check(want),ADAPTER_TIMEOUT_MS.availability,'availability');
      if(sess!==ORDER_SESSION||seq!==AVAIL.seq) return false;
      if(!Array.isArray(na)) throw new Error('availability: invalid response');
      if(full) AVAIL.unavailable=new Set(na); else { want.forEach(id=>AVAIL.unavailable.delete(id)); na.forEach(id=>AVAIL.unavailable.add(id)); }
      const cat=adapter('catalog');
      if(cat&&cat.current){ const c=await withTimeout(cat.current(),ADAPTER_TIMEOUT_MS.availability,'catalog'); if(sess!==ORDER_SESSION||seq!==AVAIL.seq) return false; applyCatalogUpdate(c); }
      AVAIL.state='fresh'; AVAIL.checkedAt=Date.now(); AVAIL.error=null; return true;
    }catch(e){ if(seq!==AVAIL.seq) return false; AVAIL.state='failed'; AVAIL.error=String(e&&e.message||e); reportClientError({type:'availability-check',message:AVAIL.error}); return false; }
  },
  fresh(){ return AVAIL.state==='fresh'&&Date.now()-AVAIL.checkedAt<AVAIL_FRESH_MS; },
};
/* catalog updates only touch the live catalog (prices/disabled) — NEVER a started or paid snapshot (frozen) */
function applyCatalogUpdate(c){ if(!c) return; escapeDeep(c);   /* any text arriving from the catalog service is escaped like load-time CMS data */
  if(c.prices) Object.entries(c.prices).forEach(([pid,cents])=>{ const p=byId(pid); if(p&&Number.isInteger(cents)&&cents>=0) p.price=cents; });
  if(c.variants) Object.entries(c.variants).forEach(([id,cents])=>{ if(PRICE_VARIANTS[id]&&Number.isInteger(cents)&&cents>=0) PRICE_VARIANTS[id].price=cents; });
  AVAIL.disabled=new Set(Array.isArray(c.disabled)?c.disabled:[]);
  S.cart.forEach(l=>{ l.invalid=validateLineStructure(l).length>0; });          /* existing carts re-validated after a catalog change */
}
let PAY_TIMER=null;
function payGo(next){
  if(!PAY_T[PAY.state]||!PAY_T[PAY.state].includes(next)) { console.warn('pay: illegal',PAY.state,'→',next); return false; }
  PAY.state=next; track('payment_state',{state:next,attemptId:PAY.attemptId}); if(S.screen==='pay') render({keep:true}); return true;
}
const payLater=(ms,fn)=>{ clearTimeout(PAY_TIMER); const sess=ORDER_SESSION, att=PAY.attemptId;
  PAY_TIMER=setTimeout(()=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId) return; fn(); },ms); };
const simResult=()=>SIM.paymentResult||'success';
function payStart(){                       /* one attempt = one globally unique attemptId; a second tap is ignored */
  if(PAY_ACTIVE.has(PAY.state)||PAY_UNCERTAIN.has(PAY.state)) return;
  if(!canRetryPayment()&&PAY.state!=='idle') return;
  const pay=adapter('payment'); if(!pay){ PAY.lastError='no-payment-adapter'; render({keep:true}); return; }
  if(!catalogService.fresh()){ if(S.screen!=='cart'){ S.screen='cart'; } render({keep:true}); return; }   /* no fresh adapter check → no payment */
  const issues=validateCart(); if(issues.length) { if(S.screen!=='cart'){ S.screen='cart'; } render({keep:true}); return; }
  PAY.orderId=PAY.orderId||newOrderId();
  PAY.attempt++; PAY.attemptId=PAY.orderId+'-A'+PAY.attempt+'-'+uuid().slice(0,6).toUpperCase(); PAY.lastError=null;
  /* lock the order BEFORE the terminal is touched, and persist it durably — if that fails, do not start */
  PAY.snapshot=Object.freeze({ lines:JSON.parse(JSON.stringify(S.cart)), total:cartTotal(), count:cartCount(), service:S.service, lang:S.lang, loyalty:LOY.member?cmSnap():null, tag:tagSnap(),
    orderId:PAY.orderId, attemptId:PAY.attemptId, txRef:null, paidAt:null, startedAt:Date.now() });
  PAY.submitKey='IDEMP-'+PAY.orderId;      /* one idempotency key per order — every resend of this paid order reuses it */
  if(!persistPaid('starting')){ PAY.snapshot=null; PAY.lastError='storage-failed'; PAY.state='idle'; render({keep:true}); track('payment_blocked',{reason:'storage'}); return; }
  PAY.state='idle'; payGo('connecting'); setTerm('paying'); track('checkout_started',{attemptId:PAY.attemptId,amount:PAY.snapshot.total});
  const att=PAY.attemptId, sess=ORDER_SESSION;
  const M=BRAND.paymentSettings;
  const payAfter=(ms,fn)=>setTimeout(()=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId) return; fn(); },ms);   /* independent, attempt-guarded timers */
  payAfter(M.connectMs,()=>{ if(PAY.state==='connecting') payGo('waiting-for-card'); });
  payAfter(M.connectMs+M.cardWaitMs,()=>{ if(PAY.state==='waiting-for-card') payGo('processing'); });
  const guard=setTimeout(()=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId) return; if(PAY_ACTIVE.has(PAY.state)&&PAY.state!=='approved'&&PAY.state!=='submitting'){ PAY.timeoutAt=Date.now(); PAY.state='timeout'; persistPaid('timeout'); render({keep:true}); setTerm('ready'); } },M.terminalTimeoutMs+M.connectMs+M.cardWaitMs);
  pay.start({attemptId:att,orderId:PAY.orderId,amountMinor:PAY.snapshot.total,currency:'EUR'}).then(r=>{
    clearTimeout(guard);
    if(sess!==ORDER_SESSION||att!==PAY.attemptId) return;                                        /* stale: another session / attempt is current */
    if(r&&r.attemptId&&r.attemptId!==att) return;                                                  /* explicitly belongs to another attempt → ignored */
    const result=r&&typeof r==='object'?r.result:undefined;
    if(result==='approved'){ payApproveOnce(att,r.txRef); return; }                              /* honoured even after a cancel request or a timeout — exactly once */
    if(FINALIZED.has(att)) return;                                                                 /* already approved: nothing below may roll it back */
    if(PAY.state==='timeout'||PAY.state==='cancelled') return;                                     /* already settled through another path */
    switch(result){
      case 'cancelled':        payCancelFinal(att); return;                                        /* provider-FINAL: valid from connecting, waiting-for-card, processing, cancel-requested */
      case 'declined':         if(PAY.state==='cancel-requested') return;                           /* the cancel path settles its own outcome */
                               if(PAY.state!=='processing') PAY.state='processing'; payGo('declined'); PAY.snapshot=null; persistClear(); setTerm('ready'); track('payment_state',{state:'declined',attemptId:att}); return;
      case 'terminal-offline': if(PAY.state==='cancel-requested') return;
                               PAY.state='connecting'; payGo('terminal-offline'); PAY.snapshot=null; persistClear(); setTerm('ready'); return;
      case 'timeout':          payUncertain(att,'terminal-timeout'); return;
      default:                 payUncertain(att,'unknown-result');                                  /* unknown / missing / invalid answer = outcome UNKNOWN, everything kept */
    }
  }).catch(e=>{ clearTimeout(guard); if(sess!==ORDER_SESSION||att!==PAY.attemptId) return; PAY.timeoutAt=Date.now(); PAY.state='waiting-for-card'; payGo('timeout'); persistPaid('timeout'); setTerm('ready'); reportClientError(e); });
}
function payApprove(txRef){                /* payment approved (by the payment service, never by a timer) */
  PAY.txRef=txRef||PAY.txRef||('TX-'+uuid().slice(0,8).toUpperCase());
  PAY.snapshot=Object.freeze({ ...(PAY.snapshot||{lines:JSON.parse(JSON.stringify(S.cart)),total:cartTotal(),count:cartCount(),service:S.service,lang:S.lang,tag:tagSnap(),orderId:PAY.orderId,attemptId:PAY.attemptId}), txRef:PAY.txRef, paidAt:Date.now() });
  PAY.submitKey=PAY.submitKey||('IDEMP-'+PAY.orderId);
  persistPaid('approved'); track('payment_state',{state:'approved',attemptId:PAY.attemptId});
  if(PAY.state!=='approved') payGo('approved'); else render({keep:true});
  setTerm('paid'); submitOrder();
}
/* ── paid-order persistence (survives refresh / PWA restart) ── */
const PAID_KEY='guestit.paidOrder.v3', PAID_SCHEMA=3;
function persistPaid(submissionState){        /* returns false when durable storage is not available */
  if(!PAY.snapshot) return false;
  const rec={ schemaVersion:PAID_SCHEMA, deviceId:DEVICE_ID, orderId:PAY.orderId, orderSessionId:ORDER_SESSION, paymentAttemptId:PAY.attemptId, transactionReference:PAY.txRef,
    idempotencyKey:PAY.submitKey, startedAt:PAY.snapshot.startedAt||null, paidAt:PAY.snapshot.paidAt||null, cart:PAY.snapshot.lines, total:PAY.snapshot.total, count:PAY.snapshot.count,
    service:PAY.snapshot.service, lang:PAY.snapshot.lang, loyalty:PAY.snapshot.loyalty||null, tag:PAY.snapshot.tag||null, recoveryReference:PAY.recoveryRef, submissionState, accepted:!!PAY.accepted, orderNo:S.orderNo||null, savedAt:Date.now() };
  try{ localStorage.setItem(PAID_KEY,JSON.stringify(rec)); const back=localStorage.getItem(PAID_KEY); if(!back) throw new Error('write-verify'); return true; }
  catch(e){ reportClientError({type:'persist-failed',message:String(e)}); return false; }
}
const persistClear=()=>{ try{ localStorage.removeItem(PAID_KEY); }catch(e){} };
function validatePaidRecord(r){
  const ok=r&&r.schemaVersion===PAID_SCHEMA&&typeof r.paymentAttemptId==='string'&&typeof r.idempotencyKey==='string'&&typeof r.orderId==='string'
    &&Array.isArray(r.cart)&&r.cart.every(l=>l&&typeof l.pid==='string'&&Number.isInteger(l.qty))
    &&Number.isInteger(r.total)&&(r.paidAt===null||Number.isInteger(r.paidAt))&&typeof r.service==='string'&&typeof r.submissionState==='string';
  return !!ok;
}
/* POS/KDS submission contract. PROTOTYPE SIMULATION: `submittedKeys` lives in memory and does NOT provide
   production idempotency — the server/POS adapter must store the idempotency key durably and return the
   previously created order for a repeated key. The client never mints a new key for the same paid snapshot. */
const posAdapter={
  submit({idempotencyKey,paymentAttemptId,transactionReference,paidOrderSnapshot}){
    return new Promise((res,rej)=>{ const sess=ORDER_SESSION;
      setTimeout(()=>{ if(sess!==ORDER_SESSION) return;
        if(PAY.submittedKeys[idempotencyKey]) return res({orderNo:PAY.submittedKeys[idempotencyKey],duplicate:true});   /* simulated durable key store */
        if(simResult()==='submit-failed-after-payment'&&!PAY.recoveryRef) return rej(new Error('pos-unreachable'));
        const orderNo=Math.floor(30+Math.random()*70); PAY.submittedKeys[idempotencyKey]=orderNo; res({orderNo,duplicate:false});
      },BRAND.paymentSettings.submitMs); });
  }
};
function submitOrder(){                    /* POS/KDS submission — same idempotency key on every retry */
  if(!PAY.snapshot||!['approved','recovery-required','no-charge'].includes(PAY.state)) return;   /* done/other → nothing to (re)send */
  payGo('submitting'); persistPaid('submitting');
  const att=PAY.attemptId, sess=ORDER_SESSION;
  const pos=adapter('pos'); if(!pos){ PAY.recoveryRef=PAY.recoveryRef||('GUE-'+(10000+Math.floor(Math.random()*89999))); payGo('order-submit-failed'); payGo('recovery-required'); persistPaid('order-submit-failed'); return; }
  withTimeout(pos.submit({ idempotencyKey:PAY.submitKey, orderId:PAY.orderId, attemptId:PAY.attemptId, txRef:PAY.txRef, snapshot:PAY.snapshot }),ADAPTER_TIMEOUT_MS.posSubmit,'posSubmit')
    .then(r=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId||PAY.state!=='submitting') return;
      if(!r||!(Number.isInteger(r.orderNo)||(typeof r.orderNo==='string'&&r.orderNo.length))){        /* success only after a valid acceptance */
        PAY.recoveryRef=PAY.recoveryRef||('GUE-'+(10000+Math.floor(Math.random()*89999))); PAY.lastError='pos-invalid-response';
        payGo('order-submit-failed'); payGo('recovery-required'); persistPaid('order-submit-failed');
        reportClientError({type:'pos-invalid-response',message:JSON.stringify(r||null).slice(0,120)}); return; }
      PAY.accepted=true; track('order_accepted',{orderId:PAY.orderId,orderNo:r.orderNo,duplicate:!!r.duplicate}); payDone(r.orderNo); })
    .catch(e=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId) return;
      PAY.recoveryRef=PAY.recoveryRef||('GUE-'+(10000+Math.floor(Math.random()*89999))); PAY.lastError=String(e&&e.message||e);
      payGo('order-submit-failed'); payGo('recovery-required'); persistPaid('order-submit-failed');
      reportClientError({type:'order-submit-failed',message:PAY.lastError}); });
}
function payDone(orderNo){
  S.orderNo=orderNo; S.doneCount=PAY.snapshot.count; S.doneTotal=PAY.snapshot.total;
  S.cart=[]; S.pay='done'; payGo('done');           /* order ACCEPTED by the POS — only now is the cart cleared */
  persistPaid('accepted'); ltyCommit(orderNo); render(); startCountdown();
  try{ sessionStorage.removeItem('guestit.session'); }catch(e){}
  /* receipt: a separate, non-blocking step — "printed" only after the printer confirms; failure never touches payment or order */
  PAY.receipt='printing'; const pr=adapter('printer'), sess=ORDER_SESSION;
  const done=()=>{ if(sess!==ORDER_SESSION) return; persistClear(); render({keep:true}); };
  if(!pr){ PAY.receipt='failed'; done(); return; }
  withTimeout(pr.print({orderNo,snapshot:PAY.snapshot}),ADAPTER_TIMEOUT_MS.print,'print').then(r=>{ PAY.receipt=r&&r.printed?'printed':'failed'; done(); }).catch(()=>{ PAY.receipt='failed'; done(); });
}
/* a cancel is a REQUEST: the attempt and its snapshot stay until the provider confirms nothing was charged */
function payCancel(){
  if(!['connecting','waiting-for-card'].includes(PAY.state)) return;
  clearTimeout(PAY_TIMER); payGo('cancel-requested'); persistPaid('cancel-requested');
  const pay=adapter('payment'), att=PAY.attemptId, sess=ORDER_SESSION;
  const settle=r=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId||PAY.state!=='cancel-requested') return;
    if(r&&r.result==='approved'){ payApproveOnce(att,r.txRef); return; }                  /* it went through anyway → paid order, handled once */
    if(r&&(r.result==='cancelled'||r.result==='not-charged')){ payCancelFinal(att); return; }
    PAY.timeoutAt=Date.now(); payGo('timeout'); persistPaid('timeout'); setTerm('ready'); };    /* unknown → uncertain: lookup / staff only */
  const call=pay&&pay.cancel?withTimeout(pay.cancel({attemptId:att,orderId:PAY.orderId}),ADAPTER_TIMEOUT_MS.paymentCancel,'paymentCancel')
           :(pay&&pay.status?withTimeout(pay.status({attemptId:att,orderId:PAY.orderId}),ADAPTER_TIMEOUT_MS.paymentStatus,'paymentStatus'):Promise.reject(new Error('no-cancel')));
  call.then(settle).catch(()=>settle({result:'unknown'}));
}
/* provider-FINAL cancellation of the current attempt: nothing was charged → release; never after approval */
function payCancelFinal(att){
  if(att!==PAY.attemptId||FINALIZED.has(att)) return;
  if(!['connecting','waiting-for-card','processing','cancel-requested'].includes(PAY.state)) return;
  clearTimeout(PAY_TIMER); payGo('cancelled'); PAY.snapshot=null; persistClear(); setTerm('ready'); render({keep:true});
}
/* outcome unknown for the current attempt: keep snapshot, attemptId, orderId, idempotency key and record → protected lookup/recovery */
function payUncertain(att,reason){
  if(att!==PAY.attemptId||FINALIZED.has(att)) return;
  if(!['connecting','waiting-for-card','processing','cancel-requested'].includes(PAY.state)) return;
  clearTimeout(PAY_TIMER); PAY.timeoutAt=Date.now(); PAY.lastError=reason||'unknown';
  payGo('timeout'); persistPaid('timeout'); setTerm('ready'); render({keep:true});
}
/* single entry point for "this attempt was approved" — idempotent per attemptId */
function payApproveOnce(att,txRef){ if(FINALIZED.has(att)||att!==PAY.attemptId) return; FINALIZED.add(att); if(PAY.state!=='approved'){ PAY.state='processing'; } payApprove(txRef); }
function payLookup(){                      /* uncertain result: ask the AUTHORITATIVE payment service whether the card was charged */
  if(!payGo('lookup')) return;
  const pay=adapter('payment'), att=PAY.attemptId, sess=ORDER_SESSION;
  if(!pay){ PAY.assistSince=PAY.assistSince||Date.now(); PAY.state='timeout'; render({keep:true}); return; }
  withTimeout(pay.status({attemptId:att,orderId:PAY.orderId}),ADAPTER_TIMEOUT_MS.paymentStatus,'paymentStatus').then(r=>{
    if(sess!==ORDER_SESSION||att!==PAY.attemptId) return;
    if(r.result==='approved'){ payApproveOnce(att,r.txRef); return; }               /* charged → complete this order, never re-charge */
    if(FINALIZED.has(att)||PAY.accepted||['approved','submitting','done','recovery-required','order-submit-failed'].includes(PAY.state)) return;   /* an approval is never rolled back by a late answer */
    if(r.result==='not-charged'){ PAY.lastError='not-charged'; PAY.snapshot=null; PAY.assistSince=null; persistClear(); payGo('idle'); if(IS_DEMO&&SIM.paymentResult==='timeout') SIM.paymentResult=null; render({keep:true}); return; }   /* definitive: the protected panel is released too */
    PAY.state='timeout'; PAY.assistSince=PAY.assistSince||Date.now(); render({keep:true});   /* still unknown → protected assistance, lookup stays available */
  }).catch(e=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId) return; PAY.state='timeout'; PAY.assistSince=PAY.assistSince||Date.now(); reportClientError(e); render({keep:true}); });   /* no answer = outcome unknown → protected, lookup stays available */
}
function payReset(){ clearTimeout(PAY_TIMER); Object.assign(PAY,{ state:'idle', attempt:0, attemptId:null, orderId:null, txRef:null, snapshot:null, recoveryRef:null, submitKey:null, lastError:null, assistSince:null, rawRecovery:null, accepted:false, receipt:'none' }); }
/* survive a refresh / PWA restart while a paid order was not yet accepted by the POS */
/* crash / restart policy: before payment a public kiosk session starts fresh (no unpaid cart is restored);
   during uncertain or approved payment the order is ALWAYS restored and reconciled.                        */
function restorePaidSnapshot(){
  let raw=null; try{ raw=localStorage.getItem(PAID_KEY)||localStorage.getItem('guestit.paidSnapshot'); }catch(e){}
  if(!raw) return false;
  let rec=null; try{ rec=JSON.parse(raw); }catch(e){ rec=null; }
  if(!validatePaidRecord(rec)){                              /* possibly paid but unreadable → protected assistance, raw record kept */
    PAY.rawRecovery=raw; PAY.state='assistance'; PAY.recoveryRef=(rec&&rec.recoveryReference)||'GUE-?????';
    S.cart=[]; S.screen='pay'; S.pay='terminal';
    reportClientError({type:'recovery-record-invalid',message:'paid record failed schema validation'}); return true; }
  PAY.snapshot=Object.freeze({ lines:rec.cart, total:rec.total, count:rec.count, service:rec.service, lang:rec.lang, loyalty:rec.loyalty||null, tag:tagRestore(rec.tag), noCharge:rec.transactionReference==='NO-CHARGE', txRef:rec.transactionReference, attemptId:rec.paymentAttemptId, orderId:rec.orderId, paidAt:rec.paidAt, startedAt:rec.startedAt });
  PAY.submitKey=rec.idempotencyKey; PAY.orderId=rec.orderId; PAY.recoveryRef=rec.recoveryReference||('GUE-'+(10000+Math.floor(Math.random()*89999)));
  PAY.txRef=rec.transactionReference; PAY.attemptId=rec.paymentAttemptId; PAY.attempt=1; PAY.accepted=!!rec.accepted;
  S.cart=[]; S.screen='pay'; S.pay='terminal';
  if(rec.submissionState==='accepted'){ S.orderNo=rec.orderNo; PAY.state='done'; S.pay='done'; persistClear(); return true; }   /* accepted before the restart → just finish */
  if(rec.submissionState==='cancel-requested'){ PAY.state='status-check'; }                    /* cancel never confirmed → ask the provider like any uncertain record */
  if(['approved','submitting','order-submit-failed'].includes(rec.submissionState)){ PAY.state='recovery-required'; return true; } /* paid, not accepted → resend with the same key */
  PAY.state='status-check';                                                              /* starting/timeout: payment uncertain → ask the payment service first */
  const att=PAY.attemptId, sess=ORDER_SESSION; const pay=adapter('payment');
  setTimeout(()=>{ if(!pay){ PAY.state='assistance'; render(); return; }
    withTimeout(pay.status({attemptId:att,orderId:PAY.orderId}),ADAPTER_TIMEOUT_MS.paymentStatus,'paymentStatus').then(r=>{ if(sess!==ORDER_SESSION||att!==PAY.attemptId) return;
      if(r.result==='approved'){ payApproveOnce(att,r.txRef); return; }
      if(r.result==='not-charged'){ PAY.snapshot=null; persistClear(); payReset(); newOrderReset(); return; }   /* definitely not charged → fresh start */
      PAY.state='assistance'; render(); }).catch(()=>{ PAY.state='assistance'; render(); }); },50);
  return true;
}

/* ══════════════════════════════════════════════════════════════
   INACTIVITY LIFECYCLE (timestamp based — survives suspension)
   activity → lastActivity=now · tick 1 s: elapsed ≥ timeout → warning
   warning: countdown from timestamps, only #idleCd is updated
   continue → warning closed, state/scroll untouched · clear/zero → newOrderReset
   paused on attract, completed-order screen and while a payment is active   */
const IDLE={ last:Date.now(), warnAt:null, timer:null };
const idleCfg=()=>BRAND.sessionSettings||{inactivityTimeoutMs:75000,inactivityWarningMs:15000};
const PAY_PROTECTED=new Set(['no-charge','processing','approved','submitting','order-submit-failed','recovery-required','lookup','timeout','done','assistance']);
const paymentMayHaveSucceeded=()=>!!PAY.snapshot||PAY_PROTECTED.has(PAY.state);
const idleExempt=()=>S.screen==='attract'||paymentMayHaveSucceeded()||PAY_ACTIVE.has(PAY.state);
function idleTouch(){ if(!IDLE.warnAt) IDLE.last=Date.now(); }          /* activity never dismisses the warning itself */
function idleTick(){
  const now=Date.now(), c=idleCfg();
  if(idleExempt()){ IDLE.last=now; if(IDLE.warnAt){ IDLE.warnAt=null; S.confirm=null; syncOverlay(); }
    if(PAY.state==='timeout'&&!PAY.assistSince&&now-(PAY.timeoutAt||now)>=(BRAND.paymentSettings.uncertainMs||600000)){ PAY.assistSince=now; render({keep:true}); }
    return; }
  if(IDLE.warnAt){
    const left=Math.max(0,Math.ceil((c.inactivityWarningMs-(now-IDLE.warnAt))/1000));
    const el=document.getElementById('idleCd'); if(el&&el.textContent!==String(left)) el.textContent=left;
    if(left<=0){ IDLE.warnAt=null; if(!paymentMayHaveSucceeded()){ track('order_abandoned',{reason:'idle-timeout',items:cartCount()}); newOrderReset(); } }
    return; }
  if(now-IDLE.last>=c.inactivityTimeoutMs){ IDLE.warnAt=now; S.confirm='idle'; syncOverlay();
    const b=document.getElementById('idleGo'); if(b&&b.focus) b.focus({preventScroll:true}); }
}
function idleContinue(){ IDLE.warnAt=null; IDLE.last=Date.now(); S.confirm=null; syncOverlay(); }
function idleStart(){ clearInterval(IDLE.timer); IDLE.last=Date.now(); IDLE.warnAt=null; IDLE.timer=setInterval(idleTick,1000); }
let cd=15;
function startCountdown(secs){ const total=secs||BRAND.paymentSettings.doneCountdownS||15; cd=total; clearInterval(countTimer);
  const sess=ORDER_SESSION, t0=Date.now();
  countTimer=setInterval(()=>{ if(sess!==ORDER_SESSION){ clearInterval(countTimer); return; }
    cd=Math.max(0,total-Math.floor((Date.now()-t0)/1000));
    const el=document.getElementById('cd'); if(el) el.textContent=cd;
    if(cd<=0) newOrderReset();
  },1000);
}
function newOrderReset(){
  /* a paid or possibly paid order is never wiped by an ordinary reset — only the recovery path or an employee ends it */
  if(paymentMayHaveSucceeded()&&PAY.state!=='done'){ if(!PAY.assistSince) track('staff_assist',{attemptId:PAY.attemptId}); PAY.assistSince=PAY.assistSince||Date.now(); if(S.screen!=='pay'){ S.screen='pay'; render(); } return; }
  ORDER_SESSION++; ltyReset(); LAST_ACT.k=''; LAST_ACT.t=0;       /* a new guest never inherits a tap guard */                                       /* feedback state never leaks into the next guest */
  clearInterval(countTimer); clearTimeout(payTimer); clearTimeout(noteTimer); clearTimeout(PAY_TIMER);
  payReset(); IDLE.warnAt=null; IDLE.last=Date.now();
  BARNEW=false; PDP_OPENER=null; S.rewardDismissed=false; S.allergenFilter=new Set();
  try{ sessionStorage.removeItem('guestit.session'); }catch(e){}
  S={...S, screen:'attract', cat:'popular', filter:'all', pid:null, draft:null,
    editing:null, cart:[], service:null, pay:'terminal',
    orderNo:null, confirm:null, sheet:null, heroIdx:0, lastAdd:null, _scroll:null, tag:null, tagDraft:'', tagFor:null, tagKb:'lat' };
  setTerm('ready'); render();
}

/* ══════════════════════════════════════════════════════════════
   6 · SHARED COMPONENTS
   ══════════════════════════════════════════════════════════════ */
/* small-slot images: in the deploy build every photo > 360 px also exists as a 320 px WebP (window.__GT_THUMBS,
   written by build-external.py). srcset + sizes let a 1× kiosk load the 320 px file for cards, chips, cart lines and
   upsell tiles, while a 2× tablet still gets the sharp original. The single-file demo has no map → plain src. */
function thumbSet(src,slotPx){ const T=window.__GT_THUMBS; const th=T&&T[src]; if(!th) return '';
  const W=(ASSET_PX[Object.keys(ASSETS).find(k=>ASSETS[k]===src)||Object.keys(ASSETS2).find(k=>ASSETS2[k]===src)]||[520])[0];
  return ` srcset="${th} 320w, ${src} ${W}w" sizes="${slotPx}px"`; }
const slotFor=em=>{ const n=parseInt(em,10)||110; return n<=60?150:n<=120?270:520; };   /* emoji size ↔ slot size used by every caller */
function foodImg(p,cls='',em='110px',extra=''){
  const z=p.z?` class="${p.z}"`:'';
  const pos=p._pos?`style="object-position:${p._pos}"`:'';
  const img=p.img?`<img src="${p.img}"${thumbSet(p.img,slotFor(em))} alt=""${z} ${pos} loading="${p._eager?'eager':'lazy'}"${p._eager?' fetchpriority="high"':''} decoding="async" width="${(ASSET_PX[Object.keys(ASSETS).find(k=>ASSETS[k]===p.img)||Object.keys(ASSETS2).find(k=>ASSETS2[k]===p.img)]||[4,3])[0]}" height="${(ASSET_PX[Object.keys(ASSETS).find(k=>ASSETS[k]===p.img)||Object.keys(ASSETS2).find(k=>ASSETS2[k]===p.img)]||[4,3])[1]}"
    onerror="this.remove()">`:'';
  return `<div class="fimg ${p.cut?'fimg-cut ':''}${cls}" style="--tint:${p.tint||'#EFE7D4'};--tint2:${p.tint2||p.tint||'#E0D4BC'};--em:${em}${extra?';'+extra:''}">
    <div class="femoji">${p.em||'🍽'}</div>${img}</div>`;
}
/* hero slot: sources narrower than the slot get a blurred backdrop + contained
   image (max 1.6× magnification) instead of a soft 3× stretch                 */
/* product shot on the detail page: free-standing on the cream page background,
   centred in a 350–400 px tall area (at 1080×1920), object-fit:contain with room
   around it and a soft shadow — the whole dish including the plate stays visible. */
function heroShot(p,em='170px'){
  return `<div class="hero-shot" style="--tint:${p.tint||'#F8F5EE'};--em:${em}">
    ${p.img?`<img src="${p.img}" alt="" class="hero-img" loading="eager" fetchpriority="high" decoding="async" onerror="this.remove()">`
      :`<span class="hero-emoji">${p.em||'🍽'}</span>`}
  </div>`;
}
function heroImg(p,cls='',em='170px',slotW=1080){
  const w=p.img?assetW(p.img):0;
  if(!p.img||w*1.6>=slotW) return foodImg({...p,_eager:true},cls,em);
  return `<div class="fimg fimg-frame ${cls}" style="--tint:${p.tint||'#EFE7D4'};--tint2:${p.tint2||p.tint||'#E0D4BC'};--em:${em}">
    <img src="${p.img}" alt="" class="fimg-bg" aria-hidden="true" decoding="async">
    <img src="${p.img}" alt="" class="fimg-fit" style="width:${Math.round(w*1.6)}px" loading="eager" fetchpriority="high" decoding="async" onerror="this.remove()"></div>`;
}
/* badge labels come from GUESTIT_CMS.badges; the kiosk keeps its own colour classes and i18n copy */
const badgeLabel=(id)=>{ const k=BADGE_ALIAS[id]||id, cms=(GUESTIT_CMS.badges||{})[k];
  const own=(BRAND.copy&&BRAND.copy['b_'+id]); return own?L(own):(cms?cms.label:id); };
const BDG={pop:['b-pop','b_pop'],new:['b-new','b_new'],veg:['b-veg','b_veg'],
  spc:['b-spc','b_spc'],dea:['b-dea','b_dea'],hal:['b-hal','b_hal']};
const badges=(p,cls='top-4 left-4',sm=false)=>!p.badges?.length?'' :
  `<div class="absolute ${cls} flex gap-2.5 z-10">${p.badges.map(b=>
    `<span class="badge ${sm?'badge-sm':''} ${BDG[b][0]}">${t(BDG[b][1])}</span>`).join('')}</div>`;

function langPills(dark=false){
  return `<div class="flex gap-2.5 p-2 rounded-full ${dark?'bg-ink/60':'bg-shade'}">
    ${BRAND.languages.map(id=>{
      const on=S.lang===id;
      return `<button type="button" data-a="lang" data-lang="${id}" aria-pressed="${on}"
        class="press h-[60px] px-5 rounded-full flex items-center gap-2
          text-[18px] font-semibold leading-[24px]
          ${on ? (dark?'bg-cream text-ink':'bg-ink text-cream')
               : (dark?'text-white/85':'text-ink/70')}">
        <span class="text-[24px]">${FLAGS[id]}</span>${id.toUpperCase()}</button>`;
    }).join('')}</div>`;
}

/* one quantity control everywhere (eMenu CSS §17): square corners from GUESTIT_CMS.brand.controls,
   brand fill, [ − n + ] — − at 1 removes (bin icon), + stops at MAX_LINE_QTY */
const stepper=(qty,act,extra='',h=72,opt={})=>{ const atMax=qty>=MAX_LINE_QTY, atMin=qty<=1;
  const minIcon=(atMin&&!opt.keepMin)?'trash':'minus';
  return `<span class="gt-stp" style="--stp-h:${h}px;--stp-r:${CTL_R()}px" role="group" aria-label="${t('qty')}: ${qty}">
    <button type="button" data-a="${act}" data-d="-1" ${extra} class="press gt-stp-b ${atMin&&opt.keepMin?'off':''}" aria-label="${atMin&&!opt.keepMin?(opt.name?tf('removeA',{name:opt.name}):t('removeItem')):t('qtyDown')}" ${atMin&&opt.keepMin?'aria-disabled="true"':''}>
      <span class="w-7 h-7">${ic(minIcon,'',2.8)}</span></button>
    <span class="gt-stp-q num"${opt.qid?` id="${opt.qid}"`:''}>${opt.qid?`<span class="bkv-c">${qty}</span>`:qty}</span>
    <button type="button" data-a="${act}" data-d="1" ${extra} class="press gt-stp-b ${atMax?'off':''}" aria-label="${t('qtyUp')}" ${atMax?'aria-disabled="true"':''}>
      <span class="w-7 h-7">${ic('plus','',2.8)}</span></button></span>`; };

function alFilterBtn(){
  const n=(S.allergenFilter||new Set()).size;
  return `<button type="button" data-a="openAlFilter" aria-pressed="${n>0}" aria-label="${t('alFilterBtn')}${n?' · '+tf('alActive',{n}):''}"
    class="press h-[56px] px-5 rounded-full flex items-center gap-2.5 text-[18px] font-bold whitespace-nowrap flex-none ${n?'bg-ember text-white':'bg-card shadow-soft text-ink/80'}">
    <span class="w-6 h-6 flex-none">${ic('info','',2.2)}</span><span>${t('alFilterBtn')}</span>${n?`<span class="ml-1 min-w-[28px] h-[28px] px-2 rounded-full bg-white text-ember num text-[16px] font-extrabold grid place-items-center" aria-hidden="true">${n}</span>`:''}</button>`;
}
function rewardPill(){
  const n=cartCount();
  if(!rewardOn()||n===0||rewardClaimed()||S.rewardDismissed) return '';
  return `<div class="flex justify-center mb-3"><div class="pointer-events-auto h-[52px] px-6 rounded-full bg-card shadow-soft
         flex items-center gap-4">
        <span class="text-[19px] font-bold text-ink/80">${tf('rw_prog',{amt:fmt(rewardLeft()),name:byId(BRAND.reward.pid).name})}</span>
        <span class="w-[150px] h-[8px] rounded-full bg-line overflow-hidden"><span class="block h-full bg-gold"
          style="width:${Math.min(100,baseTotal()/BRAND.reward.threshold*100)}%"></span></span></div></div>`;
}
function bottomBar(){
  const n=cartCount();
  const LY=BRAND.layout;
  return `<div id="bkWrap" class="absolute z-[100] pointer-events-none ${BARNEW?'bar-in':''}"
    style="left:${LY.sidebarWidth-LY.basketOverlap}px;right:32px;bottom:${LY.basketBottom}px">
    <div id="bkRw">${rewardPill()}</div>
    <button type="button" data-a="viewOrder" id="bar"
      class="pointer-events-auto press relative w-full rounded-full bg-jade text-white
        flex items-center justify-center gap-4"
      style="height:${LY.basketHeight}px;box-shadow:0 22px 52px -14px rgb(var(--c-primary) / .55)">
      <span class="w-9 h-9">${ic('bag','',2)}</span>
      <span class="text-[23px] font-bold leading-[30px]">${t('viewOrder')}</span>
      <span class="text-white/45 text-[23px] font-bold">·</span>
      <span id="bkQty" class="bkv text-[21px] font-medium leading-[30px]"><span class="bkv-c">${n} ${n===1?t('item'):t('items')}</span></span>
      <span class="text-white/45 text-[23px] font-bold">·</span>
      <span id="bkTot" class="bkv num text-[21px] font-medium leading-[30px]"><span class="bkv-c">${fmt(cartTotal())}</span></span>
      <span class="w-7 h-7 ml-1">${ic('chevR','',2.8)}</span>
      <span id="bkNote" role="status" aria-live="polite" class="text-[19px] font-bold"></span>
    </button>
  </div>`;
}

function rail(){
  const row=(a,extra,on,icn,label,i,two=false)=>`
    <button type="button" data-a="${a}" ${extra} aria-label="${label}" ${on?'aria-current="true"':''} ${RAILSPIN?`style="animation-delay:${90+i*26}ms"`:''}
      class="press relative z-10 w-full h-[84px] pl-[22px] pr-[56px] flex items-center gap-4 text-left
        text-cream/[.78] ${RAILSPIN?'wheel-in':''} ${on?'rowOn':''} ${two?'nav-two':''}">
      <span class="nav-ico flex-none">${ic(icn,'',1.9)}</span>
      <span class="nav-lbl hd ${RAIL_FIT[railFitKey(String(label).trim())]||''}">${label}</span>
      <span class="nav-chk" aria-hidden="true">${ic('check','',3)}</span>
    </button>`;
  return `<nav id="railSide" class="flex-none relative z-20 flex flex-col text-cream overflow-hidden"
    style="width:${BRAND.layout.sidebarWidth}px;box-shadow:16px 0 40px -18px rgba(20,17,12,.38)">
    <div class="absolute inset-0" style="background:${BRAND.sidebar.backgroundType==='color'
        ? BRAND.sidebar.backgroundColor
        : 'radial-gradient(120% 90% at 50% 0%, #26211A 0%, #191713 72%)'}">
      ${BRAND.sidebar.backgroundType==='image'?`<img src="${assetStore.url(BRAND.sidebar.backgroundImage,'sidebar')}" alt=""
        class="absolute inset-0 w-full h-full object-cover"
        style="object-position:${BRAND.sidebar.focalPoint
          ? BRAND.sidebar.focalPoint.x+'% '+BRAND.sidebar.focalPoint.y+'%'
          : (BRAND.sidebar.backgroundPosition||'center')}" onerror="this.remove()">`:''}
      ${BRAND.sidebar.overlayOpacity>0?`<div class="absolute inset-0"
        style="background:${BRAND.sidebar.overlayColor};opacity:${BRAND.sidebar.overlayOpacity}"></div>`:''}
    </div>
    <div class="relative z-10 flex flex-col h-full">
      <button type="button" data-a="attract" aria-label="${BRAND.name}"
      class="press pt-8 pb-4 px-4 grid place-items-center flex-none">
        <img src="${BRAND.logoImg}" alt="${BRAND.name}"
          style="height:52px;object-fit:contain;filter:${BRAND.logoFilter||'invert(1) brightness(1.7)'}">
        <span class="hd text-[11px] tracking-[.4em] text-cream/80 mt-2">– ${BRAND.copy.logoTagline} –</span>
      </button>
      <div id="railNav" class="relative flex-none">
        <div id="railInd"></div>
        ${row('home','',S.screen==='home'||(S.screen==='menu'&&S.cat==='new'),'home',t('navHome'),0)}
        ${ltyOn()?row('cat',`data-cat="rewards" data-lty="1"${LOY.member?` data-pts="${ltyNum(ltyAvail())}"`:''}`,S.cat==='rewards'&&S.screen==='menu','gift',t('lty_nav'),1):''}
        <div class="text-[14px] font-bold leading-[20px] tracking-[3px] uppercase pl-[22px] pt-4 pb-2 flex-none"
          style="color:rgb(var(--c-cream) / .58)">${t('menuLbl')}</div>
        ${CATS.map((c,i)=>row('cat',`data-cat="${c.id}"`,S.cat===c.id&&S.screen==='menu',c.icon,t('cat_'+c.id),i+1,!!c.two)).join('')}
      </div>
      <div class="flex-1"></div>
      <div class="flex-none text-center pb-7" data-gt-decor="rotated tagline"
        style="font-family:var(--f-accent);font-size:30px;line-height:1.1;color:rgb(var(--c-cream));
          transform:rotate(-4deg);text-shadow:0 2px 12px rgba(0,0,0,.5)">
        ${brandCopy('sub').split('\n').join('<br>')} ${BRAND.copy.subIcon!=null?BRAND.copy.subIcon:'🌿'}</div>
    </div>
  </nav>`;
}

/* card control: + (direct add) · "Kies →" (required choices) · quantity indicator once the product is in the order
   (tapping the indicator opens the order — same behaviour on every card). Same 56 px footprint, no layout shift. */
const cardQty=pid=>{ const p=byId(pid); return p?obQty(p,false):0; };   /* v31: a card counts ALL lines of the product; wide cards count per size (obQty) */
/* which size the guest has selected on the card/grid right now (per product, not persisted in the order) */
const SERVING_SEL={};
const cardServing=pid=>{const p=byId(pid); const sv=servingsOf(p); if(!sv) return -1;
  return Number.isInteger(SERVING_SEL[pid])?Math.max(0,Math.min(sv.length-1,SERVING_SEL[pid])):defServingIx(p); };
/* eMenu control line (shared with the tablet): square + when the product is not in the
   order, and in the SAME spot an inline stepper [ − n + ] once it is. − at 1 removes the
   line. A product with a required choice shows the "Kies →" pill that opens the PDP. */
/* ── servings (shared with the eMenu): 1 to 3 sizes per product, love:true is the default.
   The product price is DERIVED from the default serving — never stored twice. ── */
function servingsOf(p){ return Array.isArray(p&&p.servings)&&p.servings.length?p.servings:null; }
function defServingIx(p){ const sv=servingsOf(p); if(!sv) return -1; const i=sv.findIndex(x=>x.love); return i>=0?i:0; }
const servingIx=(p,d)=>{ const sv=servingsOf(p); if(!sv) return -1;
  const i=(d&&Number.isInteger(d.serving))?d.serving:defServingIx(p); return Math.max(0,Math.min(sv.length-1,i)); };
const servingOf=(p,d)=>{ const sv=servingsOf(p); return sv?sv[servingIx(p,d)]:null; };
function normalizeServings(){ PRODUCTS.forEach(p=>{ const sv=servingsOf(p); if(!sv) return; p.price=sv[defServingIx(p)].price; }); }
/* segmented size picker — equal segments, selected segment tinted, short label + price */
function servingPicker(p,sel,ctx){
  const sv=servingsOf(p); if(!sv||sv.length<2) return '';
  return `<span class="fpick" role="group" aria-label="${t('sizeT')}" style="border-radius:${CTL_R()}px">${sv.map((x,i)=>
    `<button type="button" data-a="pickServing" data-pid="${p.id}" data-ix="${i}" data-ctx="${ctx||'card'}"
       aria-pressed="${i===sel}" aria-label="${tf('sizeA',{name:p.name,size:L(x.short)})}"
       class="press fopt${i===sel?' on':''}"><span class="fol">${L(x.short)}</span><span class="fop num">${fmt(x.price)}</span></button>`).join('')}</span>`;
}
const CTL_R=()=>((GUESTIT_CMS.brand||{}).controls||{radius:12}).radius;
/* ══════════════════════════════════════════════════════════════
   R44 ORDER BUTTON + WIDE VARIANT CARD (v31)
   · one round button at the right of the bottom row, next to the price — three faces:
       [+] add directly · [›] product with choices (required choice OR sizes) · [n] count
   · one circle size everywhere (48 px canvas, same as the green promo buttons), no heavy shadow,
     invisible touch zone of 78 physical px
   · after an add, or a tap on the count: a stepper [− n +] slides OVER the row; closes 2.2 s after the LAST tap
   · sizes (2–3) are shown ON a card only in the WIDE card (full width of the grid); a category shows wide cards
     either only at the top of the list, or for the whole list (CMS: presentation.variantCards 'top' | 'all' | 'off')
   ══════════════════════════════════════════════════════════════ */
const GTC={ key:null, timer:null, ms:2200, anim:null, closing:new Set() };
const obHasReq=p=>(p.choice||[]).some(g=>MODS[g]&&MODS[g].req);
const obSizes=p=>{ const sv=servingsOf(p); return sv&&sv.length>1?sv:null; };
const obVarCard=p=>{ const sv=obSizes(p); return !!sv&&sv.length<=3&&!obHasReq(p); };     /* may show its sizes in a WIDE card */
/* "›": a required choice or a size to pick — on a normal card that always happens in the detail */
const obNeedsDetail=p=>obHasReq(p)||!!obSizes(p);
const gtcNeedsDetail=obNeedsDetail;
const gtcSoldOut=p=>availabilityService.checkProducts([p.id]).length>0;
const obBlocked=p=>alHidden(p)?'filter':(gtcSoldOut(p)?'na':null);
const obLocked=()=>(!!PAY.snapshot&&!PAY.accepted)||PAY_ACTIVE.has(PAY.state)||(PAY_UNCERTAIN.has(PAY.state)&&!PAY.accepted);
let obToastT=null;
function obToast(txt){ if(document.getElementById('bkNote')&&(S.screen==='home'||S.screen==='menu')){ showAddNote(txt); return; }
  const scr=document.getElementById('screen'); if(!scr) return;
  let el=document.getElementById('obToast');
  if(!el){ el=document.createElement('div'); el.id='obToast'; el.className='ob-toast'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); scr.appendChild(el); }
  el.textContent=txt; raf(()=>el.classList.add('on')); clearTimeout(obToastT);
  obToastT=setTimeout(()=>{ const e=document.getElementById('obToast'); if(e) e.classList.remove('on'); },1600); }
function obLockNote(){ obToast(t('obLocked')); }
const obLines=p=>S.cart.filter(l=>l.pid===p.id&&l.lineType==='product'&&!l.reward);
const obSizeQty=(p,i)=>obLines(p).filter(l=>servingIx(p,l)===i).reduce((a,l)=>a+l.qty,0);
/* count on a card: normal card = ALL lines of the product; wide card = the size whose stepper is open */
const obQty=(p,wide)=>wide&&obVarCard(p)?obSizeQty(p,cardServing(p.id)):obLines(p).reduce((a,l)=>a+l.qty,0);
/* the line "+" / "−" act on: wide → last line of the open size; otherwise the LAST line (repeat last configuration) */
function obLine(p,wide){ const ls=obLines(p); const f=wide&&obVarCard(p)?ls.filter(l=>servingIx(p,l)===cardServing(p.id)):ls; return f[f.length-1]; }
function gtcArm(pid){ clearTimeout(GTC.timer); const sess=ORDER_SESSION;
  GTC.timer=setTimeout(()=>{ if(sess===ORDER_SESSION&&GTC.key===pid) gtcCollapse(); },GTC.ms); }
function gtcCollapse(render=true){ clearTimeout(GTC.timer); GTC.timer=null;
  const was=GTC.key; GTC.key=null; if(!was) return;
  if(!render){ gtcPaint(was); return; }
  const st=[...document.querySelectorAll(`.card-ctl[data-ctl-for="${CSS.escape(was)}"] .ob-stp`)];
  if(!st.length||PERF.low||REDUCED_MOTION()){ gtcPaint(was); return; }
  GTC.closing.add(was); st.forEach(s=>{ s.classList.remove('in'); s.classList.add('out'); });
  const sess=ORDER_SESSION;
  setTimeout(()=>{ GTC.closing.delete(was); if(sess===ORDER_SESSION&&GTC.key!==was) gtcPaint(was); },190);
}
function gtcExpand(pid){ if(GTC.key&&GTC.key!==pid) gtcCollapse(); GTC.closing.delete(pid);
  GTC.key=pid; GTC.anim=pid; gtcArm(pid); gtcPaint(pid); GTC.anim=null; }
function gtcPaint(pid){ const p=byId(pid); if(!p) return;
  document.querySelectorAll(`.card-ctl[data-ctl-for="${CSS.escape(pid)}"]`).forEach(el=>{ const w=el.dataset.ctlWide==='1';
    el.innerHTML=cardCtl(p,+el.dataset.ctlSize||undefined,w); el.classList.toggle('open',GTC.key===pid&&obQty(p,w)>0); });
  obwSync(pid); }
const REDUCED_MOTION=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
const obConfigs=p=>new Set(obLines(p).map(l=>l.key)).size;
function obStepper(p,n,row,wide){
  const one=n===1, atMax=n>=MAX_LINE_QTY, w=wide?' data-w="1"':'';
  const l=obLine(p,wide), multi=!wide&&obConfigs(p)>1, lab=multi&&l?lineSummary(l):'';   /* several configurations → say which one +/− changes */
  return `<span class="ob-stp${row?' row':''}${multi?' multi':''}${GTC.anim===p.id&&!PERF.low?' in':''}" role="group" aria-label="${multi&&l?tf('obMultiA',{q:n,cfg:lab}):tf('obCountA',{q:n})}">
    <button type="button" data-a="cardDec" data-pid="${p.id}"${w} class="press ob-m" aria-label="${one?t('obRemove'):t('obLess')}">${one?`<span class="ob-tr">${ic('trash','',2.3)}</span>`:'<span class="ob-bar"></span>'}</button>
    <span class="ob-sq num${multi?' multi':''}" aria-live="polite">${n}${multi?`<span class="ob-sqc">${lab}</span>`:''}</span>
    <button type="button" data-a="cardInc" data-pid="${p.id}"${w} class="press ob-p${atMax?' off':''}" aria-label="${t('obMore')}"${atMax?' aria-disabled="true"':''}><span class="ob-i">${ic('plus','',2.6)}</span></button></span>`;
}
function cardCtl(p,size,wide){
  const row=size===56, bl=obBlocked(p), n=obQty(p,wide);
  if(wide&&obVarCard(p)) return (n>0&&GTC.key===p.id&&!bl)?obStepper(p,n,false,true):'';      /* sizes are the buttons; the stepper still opens */
  if(bl) return `<button type="button" class="ob ob-off" disabled aria-disabled="true" aria-label="${bl==='filter'?tf('obFilterA',{name:p.name}):tf('soldOutA',{name:p.name})}">
      <span class="ob-i">${ic(bl==='filter'?'info':'x','',2.4)}</span></button>`;
  if(n>0&&GTC.key===p.id) return obStepper(p,n,row,false);
  if(n>0) return `<button type="button" data-a="gtcOpen" data-pid="${p.id}" class="press ob ob-n" aria-label="${tf('obCountA',{q:n})}">
      <span class="ob-q num" aria-live="polite">${n}</span></button>`;
  if(obNeedsDetail(p)) return `<button type="button" data-a="prod" data-pid="${p.id}" data-from="menu" class="press ob" aria-label="${tf('obChooseA',{name:p.name})}">
      <span class="ob-i">${ic('chevR','',2.6)}</span></button>`;
  return `<button type="button" data-a="quickAdd" data-pid="${p.id}" class="press ob" aria-label="${tf('obAddA',{name:p.name})}">
      <span class="ob-i">${ic('plus','',2.6)}</span></button>`;
}
/* bottom row, left: the price (10% larger) or "niet bij je filter" */
function obMoney(p,from,px){
  if(alHidden(p)) return `<span class="card-money"><span class="ob-flt-t">${t('obNoFilter')}</span></span>`;
  return `<span class="card-money"><button type="button" data-a="prod" data-pid="${p.id}" data-from="${from}"
      class="press num ob-price text-left w-full" style="font-size:${px}px">${obSizes(p)&&!obHasReq(p)?`<span class="ob-from">${t('obFrom')}</span> `:''}${fmt(obSizes(p)?Math.min(...obSizes(p).map(x=>x.price)):cardPrice(p))}</button></span>`;
}
const obProdAttr=p=>alHidden(p)?' disabled aria-disabled="true" tabindex="-1"':'';
function syncCardCtls(){ document.querySelectorAll('.card-ctl[data-ctl-for]').forEach(el=>{ const p=byId(el.dataset.ctlFor); if(!p) return;
  if(GTC.closing.has(p.id)) return;
  const w=el.dataset.ctlWide==='1', n=obQty(p,w), cur=el.querySelector('.ob-sq')||el.querySelector('.ob-q');
  if(cur&&+cur.textContent===n&&(GTC.key===p.id)===el.classList.contains('open')) return;
  if(!n&&!cur&&!el.querySelector('.ob-stp')) return;
  if(!n&&GTC.key===p.id){ GTC.key=null; clearTimeout(GTC.timer); }
  el.innerHTML=cardCtl(p,+el.dataset.ctlSize||undefined,w); el.classList.toggle('open',GTC.key===p.id&&n>0); });
  obwSync(); }

/* ── WIDE CARD (Hertog Jan model): photo left · name · sub · tags · sizes ── */
const OBW_INFO={                                                 /* demo of the CMS fields "sub" and "flavour" */
  salmonpoke:{ sub:{nl:'Poké bowl · rauwe zalm · 3 maten',en:'Poké bowl · raw salmon · 3 sizes',mk:'Поке бол · свеж лосос · 3 големини'},
               flavour:[{nl:'Fris',en:'Fresh',mk:'Свежо'},{nl:'Romig',en:'Creamy',mk:'Кремасто'},{nl:'Licht pittig',en:'Mildly spicy',mk:'Благо лутo'}] },
  tonkotsu:{ sub:{nl:'Ramen · varkensbouillon · 12 uur getrokken',en:'Ramen · pork broth · simmered 12 hours',mk:'Рамен · свинска супа · 12 часа'},
             flavour:[{nl:'Rijk',en:'Rich',mk:'Богато'},{nl:'Umami',en:'Umami',mk:'Умами'},{nl:'Hartig',en:'Savoury',mk:'Солено'}] } };
const OBW_DEFAULT={ pokewan:'top', ramen:'all' };             /* demo; CMS: categories[cat].presentation.variantCards */
function obwMode(cat){ const p=((GUESTIT_CMS.categories||{})[cat]||{}).presentation||{};
  const m=p.variantCards||OBW_DEFAULT[cat]||'off'; return ['top','all','off'].includes(m)?m:'off'; }
/* consistency rule: wide cards only at the TOP of a list, or the WHOLE list — never mixed in between */
function obwSplit(list,cat){ const m=obwMode(cat);
  if(m==='all') return { wide:list, rest:[] };
  if(m==='top'){ const wide=list.filter(p=>obVarCard(p)&&!alHidden(p)); return { wide, rest:list.filter(p=>!wide.includes(p)) }; }
  return { wide:[], rest:list }; }
function obwSizesHTML(p){ const sv=obSizes(p), dis=!!obBlocked(p), open=GTC.key===p.id;
  return sv.map((x,i)=>{ const q=obSizeQty(p,i), save=Number.isInteger(x.compareAt)&&x.compareAt>x.price?x.compareAt-x.price:0;   /* minor units */
    return `<button type="button" ${dis?'disabled aria-disabled="true"':`data-a="obVar" data-pid="${p.id}" data-ix="${i}"`} class="press obw-sz${q?' has':''}"
      aria-label="${tf(q?'obVarAq':'obVarA',{name:p.name,size:L(x.short),price:fmt(x.price),q})}">
      <span class="obw-szt"><span class="obw-szl">${L(x.label||x.short)}</span>${x.sub?`<span class="obw-szs2">${x.sub}</span>`:''}${save?`<span class="obw-save">${tf('obSave',{amount:fmt(save)})}</span>`:''}</span>
      <span class="obw-szp">${save?`<s class="obw-was num">${fmt(x.compareAt)}</s>`:''}<span class="num">${fmt(x.price)}</span>${dis?'':`<span class="obw-szadd" aria-hidden="true">${ic('plus','',3)}</span>`}</span>
      ${q?`<span class="ob-vc num">${q}</span>`:(x.love?`<span class="ob-vh" aria-hidden="true">${ic('heart','',0)}</span>`:'')}</button>`; }).join(''); }
function obwSync(pid){ document.querySelectorAll(pid?`[data-obw="${CSS.escape(pid)}"]`:'[data-obw]').forEach(el=>{ const p=byId(el.dataset.obw); if(p) el.innerHTML=obwSizesHTML(p); }); }
function productWide(p,from='menu',i=0){
  const anim=(STAGGER&&!PERF.low)?' card-in card-fast':'', dly=STAGGER?` style="animation-delay:${i*26}ms"`:'';
  const info=OBW_INFO[p.id]||{}, sizes=obVarCard(p)&&!alHidden(p), sub=p.sub||info.sub?L(p.sub||info.sub):'', tags=(p.flavour||info.flavour||[]).slice(0,3);
  return `<article${dly} class="obw ob-card relative bg-card rounded-[22px] overflow-hidden shadow-soft${anim}${alHidden(p)?' ob-flt':''}">
    <button type="button" data-a="prod" data-pid="${p.id}" data-from="${from}"${obProdAttr(p)} class="press obw-img" aria-label="${p.name}">
      ${foodImg(p,'w-full h-full','80px')}</button>
    ${badges(p,'top-3 left-3',true)}
    <div class="obw-body">
      <button type="button" data-a="prod" data-pid="${p.id}" data-from="${from}"${obProdAttr(p)} class="press block w-full text-left">
        <div class="hd obw-name">${p.name}</div>
        ${sub?`<div class="obw-sub">${sub}</div>`:''}
        <div class="obw-desc">${L(p.desc)}</div>
      </button>
      ${tags.length?`<div class="obw-tags">${tags.map(x=>`<span>${L(x)}</span>`).join('')}</div>`:''}
      <div class="obw-row${sizes?' sz':''}">
        ${sizes?`<div class="obw-szs" data-obw="${p.id}" role="group" aria-label="${t('sizeT')}">${obwSizesHTML(p)}</div>`
          :`<div class="obw-money">${obMoney(p,from,26)}</div>`}
        <span class="card-ctl" data-ctl-for="${p.id}" data-ctl-size="72" data-ctl-wide="1">${cardCtl(p,72,true)}</span>
      </div>
    </div>
  </article>`;
}
function productCard(p,from='menu',i=0){
  const anim = (STAGGER&&!PERF.low) ? ` ${STAGGER==='grid'?'card-in card-fast':'card-in'}` : '';
  const dly  = '';                                             /* v34: cards appear at once (short fade only) */
  return `<article${dly}
    class="ob-card relative bg-card rounded-[16px] overflow-hidden shadow-soft flex flex-col${anim}${alHidden(p)?' ob-flt':''}">
    ${badges(p,'top-3 left-3',true)}
    <button type="button" data-a="prod" data-pid="${p.id}" data-from="${from}"${obProdAttr(p)}
      class="press block w-full text-left">
      ${foodImg(p,'w-full flex-none','80px',`height:${BRAND.layout.productImageHeight}px`)}
      <div class="px-[16px] pt-2">
        <div class="hd text-[25px] leading-[27px] tracking-[.3px] clamp2 h-[54px]">${p.name}</div>
        <div class="p-desc text-[16px] text-mute font-normal leading-[21px] clamp2 h-[42px] mt-1">${L(p.desc)}</div>
      </div>
    </button>
    <div class="card-row px-[16px] pb-2.5 pt-1.5 mt-auto">
      ${obMoney(p,from,23)}
    </div>
    <span class="card-ctl" data-ctl-for="${p.id}" data-ctl-size="72">${cardCtl(p,72)}</span>
  </article>`;
}

/* ══════════════════════════════════════════════════════════════
   7 · SCREENS
   ══════════════════════════════════════════════════════════════ */
const SCR={};

/* ── ATTRACT / WELCOME ───────────────────────────────────────── */
SCR.attract=()=>{
  const H=BRAND.hero;
  const media = H.mode==='video' && H.video
    ? `<video class="heroimg on" src="${H.video}" autoplay muted loop playsinline></video>`
    : (H.mode==='slider' ? H.images : [H.images[0]]).map(u=>assetStore.url(u,'hero')).filter((u,i,a)=>a.indexOf(u)===i).map((u,i)=>
        `<img class="heroimg${i===S.heroIdx?' on':''}" src="${u}" alt="" width="2160" height="3840" ${i===S.heroIdx?'fetchpriority="high"':'loading="lazy"'} decoding="async" onerror="this.remove()">`).join('');
  /* two equal primary start actions: the choice of order type IS the start (nothing preselected) */
  const startBtn=id=>`<button type="button" data-a="startWith" data-s="${id}"
      class="press ctapulse h-[132px] rounded-full bg-cream text-ink flex items-center justify-center gap-5">
      <span class="w-10 h-10">${ic(id==='eatin'?'dish':'bag','',2.2)}</span>
      <span class="hd text-[30px] tracking-[.16em]">${t(id==='eatin'?'eatIn':'takeAway')}</span></button>`;
  return `
  <div class="heromedia">${media}</div>
  <div class="absolute inset-0 pointer-events-none" style="background:
    linear-gradient(180deg, rgba(10,9,7,.66) 0%, rgba(10,9,7,.20) 24%, rgba(10,9,7,0) 40%),
    linear-gradient(180deg, rgba(10,9,7,0) 44%, rgba(10,9,7,.58) 72%, rgba(10,9,7,.88) 100%),
    linear-gradient(100deg, rgba(10,9,7,.46) 0%, rgba(10,9,7,0) 55%)"></div>

  <div class="absolute inset-0">
    <!-- brand lockup · safe-top 40px, centered -->
    <div class="absolute top-[40px] left-1/2 -translate-x-1/2 text-center">
      <img src="${BRAND.logoImg}" alt="${BRAND.name}" class="mx-auto"
        style="height:96px;object-fit:contain;filter:${BRAND.logoFilter||'invert(1) brightness(1.6)'}
          drop-shadow(0 6px 24px rgba(0,0,0,.5))">
      <div class="hd text-[17px] tracking-[.42em] text-cream/90 mt-2.5">– ${BRAND.copy.logoTagline} –</div>
    </div>
    <!-- language · top 40px / right 24px, one-tap switch -->
    <div class="absolute top-[40px] right-[24px]">${langPills(true)}</div>

    <!-- campaign headline · aligned to the 105px content column -->
    <div class="absolute left-[105px] top-[268px] text-cream">
      <h1 class="hd text-[78px] leading-[1.1] tracking-[.03em]"
        style="text-shadow:0 4px 30px rgba(0,0,0,.55)">${brandCopy('headline').split('\n').join('<br>')}</h1>
      <div class="w-[56px] h-[3px] bg-cream/85 mt-8 mb-7"></div>
      <p class="text-[24px] font-semibold tracking-[.3em] leading-[1.7]">${brandCopy('sub').split('\n').join('<br>')}</p>
    </div>

    <!-- action stack · CTA 870×120 @105 · toggles 88px, 24px gaps · footer 40px margins, 60px base -->
    <div class="absolute inset-x-0 bottom-0">
      <div class="px-[105px]">
        ${ltyOn()?ltyAttractBtn():''}
        <div class="hd text-[28px] tracking-[.14em] text-cream text-center mb-[22px]" style="text-shadow:0 3px 20px rgba(0,0,0,.6)">${t('howOrder')}</div>
        <div class="grid grid-cols-2 gap-[24px]">
          ${startBtn('eatin')}${startBtn('takeaway')}
        </div>
      </div>
      <div class="mx-[40px] mt-[40px] pt-[26px] pb-[60px] flex items-center justify-center text-cream"
        style="border-top:1.5px solid rgba(255,255,255,.28)">
        ${BRAND.features.voucher&&(IS_DEMO||ADAPTERS.voucher)?`
        <button type="button" data-a="voucher" class="press h-[64px] px-6 rounded-full flex items-center gap-5">
          <span class="w-[46px] h-[46px] opacity-95">${icQR}</span>
          <span class="text-left leading-tight">
            <span class="hd block text-[20px] tracking-[.12em]">${t('voucherT')}</span>
            <span class="block text-[15px] font-semibold text-white/55 tracking-[.2em] uppercase mt-1">${t('voucherS')}</span>
          </span></button>`:''}
      </div>
    </div>
  </div>`;
};

/* ── LANDING / FEATURED ──────────────────────────────────────── */
function homeMain(){
  const [P0,...rest]=BRAND.promos.filter(pr=>!alHidden(byId(pr.pid))&&!(pr.menu&&alHidden(byId(MENU_DEAL.side))));
  const chip=pr=>pr.menu?`${tf('menuPriceA',{price:fmt(byId(pr.pid).price+MENU_DEAL.price)})} · ${tf('menuBaseA',{price:fmt(byId(pr.pid).price)})}`:fmt(byId(pr.pid).price);
  const promoBtn=(pr,big)=>{
    if(big) return `<button type="button" data-a="promo" data-pid="${pr.pid}" ${pr.menu?'data-menu="1"':''}
      class="press relative w-full rounded-[30px] overflow-hidden text-left"
      style="height:${BRAND.layout.promoHeight||BRAND.hero.height||BRAND.layout.heroHeight}px">
      ${foodImg({...pr,_pos:`${BRAND.hero.contentFocalPoint.x}% ${BRAND.hero.contentFocalPoint.y}%`,_eager:true},'absolute inset-0','150px')}
      <div class="absolute inset-0" style="background:
        linear-gradient(84deg, rgba(10,9,7,.60) 0%, rgba(10,9,7,.22) 46%, rgba(10,9,7,0) 66%)"></div>
      <div class="absolute inset-0 p-9 flex flex-col text-cream"
        style="max-width:${BRAND.hero.textSafeWidth}%">
        <span class="badge ${pr.menu?'b-dea':'b-new'} self-start">${L(pr.flag)}</span>
        <div class="flex-1"></div>
        <div class="heroTitle hd text-[52px] leading-[53px] tracking-[.5px] clamp2">${L(pr.title)}</div>
        <div class="text-[20px] leading-[28px] font-normal opacity-90 mt-2">${L(pr.sub)}</div>
        <div class="num text-[28px] leading-[34px] tracking-[-0.3px] font-extrabold mt-2">${chip(pr)}</div>
        <span class="mt-6 self-start h-[76px] px-10 rounded-full bg-cream text-ink flex items-center gap-3">
          <span class="text-[22px] font-bold leading-[26px]">${t('promoView')}</span>
          <span class="w-6 h-6">${ic('arrR','',2.6)}</span></span>
      </div>
    </button>`;
    return `<button type="button" data-a="promo" data-pid="${pr.pid}" ${pr.menu?'data-menu="1"':''}
      class="press bg-card rounded-[26px] overflow-hidden text-left shadow-soft">
      <div class="relative">
        <span class="absolute top-4 left-4 z-10 badge badge-sm ${pr.menu?'b-dea':'b-new'}">${L(pr.flag)}</span>
        ${foodImg({...pr,_eager:true},'h-[210px] w-full','96px')}
      </div>
      <div class="px-6 pt-4 pb-5">
        <div class="hd text-[34px] leading-[37px] tracking-[.4px] clamp2">${L(pr.title)}</div>
        <div class="text-[18px] leading-[25px] font-normal text-mute mt-1.5">${L(pr.sub)}</div>
        <div class="flex items-center justify-between mt-2.5">
          <span class="num text-[25px] leading-[30px] tracking-[-0.2px] font-extrabold">${chip(pr)}</span>
          <span class="w-[48px] h-[48px] rounded-full bg-jade text-white grid place-items-center">
            <span class="w-5 h-5">${ic('chevR','',2.8)}</span></span>
        </div>
      </div>
    </button>`;
  };
  const news=visible(PRODUCTS.filter(p=>p.badges.includes('new'))).slice(0,3);
  const pops=visible(PRODUCTS.filter(p=>p.badges.includes('pop'))).slice(0,3);
  const h2=(txt,seeAllCat)=>`<div class="flex items-baseline justify-between mt-10 mb-5">
    <h2 class="hd text-[46px] leading-[50px] tracking-[.7px]">${txt}</h2>
    ${seeAllCat?`<button type="button" data-a="cat" data-cat="${seeAllCat}"
      class="press h-[56px] px-6 -mr-2 rounded-full flex items-center gap-2 text-[17px] font-semibold leading-[24px] text-mute">
      ${t('seeAll')}<span class="w-5 h-5">${ic('chevR','',2.4)}</span></button>`:''}
  </div>`;
  return `
      <div class="flex items-center justify-between px-5 pt-7 flex-none topbar">
        <div class="text-[16px] font-semibold leading-[22px] tracking-[4px] uppercase text-mute">${BRAND.copy.tagline}</div>
        <div class="flex items-center gap-3">${alFilterBtn()}${langPills(false)}</div>
      </div>
      <h1 class="hd text-[72px] leading-[72px] tracking-[1px] px-5 mt-4 flex-none">${t('homeT')}</h1>
      <div class="scroller flex-1 px-5 pt-7 pb-[220px]">
        ${cmOfferBanner()}
        ${P0?promoBtn(P0,true):''}
        ${h2(t('cat_popular'),'popular')}
        <div class="grid" style="grid-template-columns:repeat(${BRAND.layout.gridColumns},1fr);gap:${BRAND.layout.gridGap}px">${pops.map((p,i)=>productCard(p,'home',i)).join('')}</div>
        <div class="grid grid-cols-2 gap-5 mt-10">${rest.map(pr=>promoBtn(pr,false)).join('')}</div>
        ${h2(t('newIn'),'new')}
        <div class="grid" style="grid-template-columns:repeat(${BRAND.layout.gridColumns},1fr);gap:${BRAND.layout.gridGap}px">${news.map((p,i)=>productCard(p,'home',i)).join('')}</div>
      </div>`;
};

/* ── MENU / BROWSE ───────────────────────────────────────────── */
function compStrip(){
  const picks=visible((COMP[S.cat]||COMP.default).map(byId).filter(Boolean))
    .filter(p=>!S.cart.some(l=>l.pid===p.id)).slice(0,4);
  if(picks.length<2) return '';
  const allCat=COMP_ALL[S.cat]||COMP_ALL.default;
  return `<div class="mt-10">
    <div class="flex items-baseline justify-between mb-4">
      <div class="flex items-baseline gap-4">
        <h3 class="hd text-[36px] leading-[40px] tracking-[.5px]">${t('finishT')}</h3>
        <span class="text-[17px] text-mute font-semibold leading-[24px]">${t('finishS')}</span>
      </div>
      <button type="button" data-a="cat" data-cat="${allCat}"
        class="press h-[56px] px-4 -mr-2 rounded-full flex items-center gap-2 text-[17px] font-semibold leading-[24px] text-ink/70">
        ${t('seeAll')}<span class="w-5 h-5">${ic('arrR','',2.6)}</span></button>
    </div>
    <div class="grid grid-cols-4 gap-4">
      ${picks.map(p=>`<div class="bg-card rounded-2xl p-3.5 shadow-soft flex flex-col">
        <button type="button" data-a="prod" data-pid="${p.id}" data-from="menu" class="press block w-full text-left">
          <div class="rounded-xl overflow-hidden">${foodImg(p,'h-[104px] w-full','48px')}</div>
          <div class="hd text-[20px] leading-[22px] tracking-[.3px] truncate mt-2.5">${p.name}</div>
        </button>
        <div class="flex items-center justify-between gap-2 mt-2">
          <span class="num text-[19px] font-extrabold tracking-[-0.2px] text-ink/85 truncate">+ ${fmt(p.price)}</span>
          <button type="button" data-a="quickAdd" data-pid="${p.id}"
            aria-label="${tf('addA',{name:p.name})}"
            class="press qadd w-[56px] h-[56px] rounded-full bg-jade text-white grid place-items-center flex-none">
            <span class="qic w-6 h-6 pointer-events-none"><span class="qic-p">${ic('plus','',2.8)}</span><span class="qic-c">${ic('check','',3)}</span></span></button>
        </div>
      </div>`).join('')}
    </div></div>`;
}
/* GUESTIT_CMS.categories[cat].presentation — which card type and how many columns per device.
   Unknown categories fall back to the kiosk default (visual card, BRAND.layout.gridColumns). */
function presentationFor(cat){
  const p=((GUESTIT_CMS.categories||{})[cat]||{}).presentation||{};
  const cols=(p.columns||{});
  const dev=document.body.classList.contains('tablet')
    ? (document.body.classList.contains('land')?'tabletWide':'tablet') : 'kiosk';
  return { card:p.card||'visual', columns:cols[dev]||cols.kiosk||BRAND.layout.gridColumns };
}
/* compact card (eMenu compactRow): photo band, name, 2-line description, price + square control */
/* the card shows the price of the size the guest has selected there */
const cardPrice=p=>{ const sv=servingsOf(p); return sv?sv[cardServing(p.id)].price:p.price; };
function compactCard(p,from='menu',i=0){
  const anim = (STAGGER&&!PERF.low) ? ` ${STAGGER==='grid'?'card-in card-fast':'card-in'}` : '';
  const dly  = '';                                             /* v34: cards appear at once (short fade only) */
  return `<article${dly} class="cp ob-card relative bg-card rounded-[16px] overflow-hidden shadow-soft flex flex-col${anim}${alHidden(p)?' ob-flt':''}">
    ${badges(p,'top-3 left-3',true)}
    <button type="button" data-a="prod" data-pid="${p.id}" data-from="${from}"${obProdAttr(p)} class="press block w-full text-left">
      ${foodImg(p,'cp-img w-full flex-none','60px')}
      <div class="px-[14px] pt-2">
        <div class="hd cp-n text-[23px] leading-[25px] tracking-[.3px] clamp2">${p.name}</div>
        <div class="p-desc text-[15px] text-mute font-normal leading-[20px] clamp2 mt-1 h-[40px]">${L(p.desc)}</div>
      </div></button>
    <div class="card-row px-[14px] pb-2.5 pt-2 mt-auto">
      ${obMoney(p,from,22)}
    </div>
    <span class="card-ctl" data-ctl-for="${p.id}" data-ctl-size="72">${cardCtl(p,72)}</span></article>`;
}
function menuGrid(){
  const c=catOf(S.cat)||{};
  const list=prodsInCards(S.cat).filter(p=>S.filter==='all'||!c.filters?true:(p.tags||[]).includes(S.filter));
  if(!list.length) return `<div class="rounded-[26px] bg-card shadow-soft p-12 text-center mt-4">
    <div class="hd text-[34px] tracking-[.03em]">${t('alEmpty')}</div>
    <button type="button" data-a="openAlFilter" class="press mt-6 h-[72px] px-8 rounded-full bg-jade text-white text-[21px] font-bold">${t('alChange')}</button></div>`;
  const PP=presentationFor(S.cat), render=PP.card==='compact'?compactCard:productCard;
  const sp=obwSplit(list,S.cat);                        /* v31: wide cards only at the top, or the whole list */
  return `<div class="grid" data-card="${PP.card}" data-wide="${obwMode(S.cat)}" style="grid-template-columns:repeat(${PP.columns},1fr);gap:${BRAND.layout.gridGap}px">
    ${sp.wide.map((p,i)=>productWide(p,'menu',i)).join('')}${sp.rest.map((p,i)=>render(p,'menu',i+sp.wide.length)).join('')}</div>`;
}
function menuMain(){
  if(S.cat==='rewards') return ltyMain();
  const c=catOf(S.cat)||{};
  const chips=c.filters?`<div class="px-5 mt-6 flex-none"><div id="filtWrap" class="relative inline-flex gap-3.5">
    <div id="filtInd"></div>
    ${['all',...c.filters].map(f=>`<button type="button" data-a="filter" data-f="${f}" aria-pressed="${S.filter===f}"
      class="press relative z-10 h-[64px] px-8 rounded-full hd text-[22px] tracking-[.08em] ${S.filter===f?'text-white':'bg-card text-ink/75 shadow-soft'}">${t('f_'+f)}</button>`).join('')}
  </div></div>`:'';
  return `
    <div class="flex items-center justify-between px-5 pt-7 flex-none topbar">
      <div class="text-[16px] font-semibold leading-[22px] tracking-[4px] uppercase text-mute">${BRAND.copy.tagline}</div>
      <div class="flex items-center gap-3">${alFilterBtn()}${langPills(false)}</div>
    </div>
    <div class="absolute right-5 top-[168px] text-right hd text-[15px] tracking-[.34em] text-mute/70"
      style="line-height:2.1">${brandCopy('sideNote').split('\n').join('<br>')}</div>
    <h1 class="hd text-[72px] leading-[72px] tracking-[1px] px-5 mt-4 flex-none">${S.cat==='new'?t('newIn'):t('cat_'+S.cat)}</h1>
    <div class="cat-sub text-[24px] text-mute font-semibold px-5 mt-2 flex-none">${L(CATSUB[S.cat]||CATSUB.popular)}</div>
    ${chips}
    <div class="scroller flex-1 px-5 pt-7 pb-[220px]">
      ${cmOfferBanner()}
      <div id="gridWrap">${menuGrid()}</div>
      ${cmsFinishBlock(S.cat)?categoryFinishHTML(S.cat):compStrip()}   <!-- shared CMS block: role category-finish -->
    </div>`;
}
SCR.home=()=>`
  <div class="flex-1 min-h-0 flex">
    ${rail()}
    <main id="mainCol" class="relative flex-1 min-w-0 flex flex-col enter">${homeMain()}</main>
  </div>
  ${cartCount()>0?bottomBar():''}`;

SCR.menu=()=>`
  <div class="flex-1 min-h-0 flex">
    ${rail()}
    <main id="mainCol" class="relative flex-1 min-w-0 flex flex-col enter">${menuMain()}</main>
  </div>
  ${cartCount()>0?bottomBar():''}`;

/* ── PRODUCT DETAIL ──────────────────────────────────────────── */
function choiceGroup(g,d,act='choice'){
  const grp=MODS[g];
  return `<div class="mt-9">
    <div class="hd text-[26px] tracking-[.06em] mb-4">${L(grp.label)} <span class="text-[17px] tracking-[.1em] ${grp.req?'text-ember':'text-mute'}">· ${t(grp.req?'reqLabel':'optLabel')}</span></div>
    <div class="flex flex-wrap gap-3.5">
      ${grp.items.map(it=>{
        const on=d.choices[g]===it.id;
        const pr=it.price>0?` <span class="num font-bold ${on?'':'text-mute'}">+${fmt(it.price)}</span>`
               : it.price<0?` <span class="num font-bold ${on?'':'text-mute'}">${fmt(it.price)}</span>`:'';
        return `<button type="button" data-a="${act}" data-g="${g}" data-id="${it.id}" aria-pressed="${on}"
          class="press h-[76px] px-7 rounded-full border-[2.5px] flex items-center gap-2 text-[23px] font-semibold
            ${on?'bg-jade border-jade text-white':'bg-card border-line text-ink/85'}">
          ${L(it.name)}${pr}</button>`;}).join('')}
    </div></div>`;
}

/* ══════════════════════════════════════════════════════════════
   FULLSCREEN PRODUCT SCREEN (#pdp)
   Two genuinely different renderers share pricing, draft state,
   quantity, validation, cart integration and i18n — never a layout.
     renderVisualUpsellFlow(p,d,xp)  Flow A · commercial, photo-led
     renderModificationFlow(p,d,xp)  Flow B · functional, no upsell
   The screen is an overlay above the category shell: the category
   DOM (and its scroll position) is never rebuilt while a product
   is open, so closing restores it exactly without a rerender.
   ══════════════════════════════════════════════════════════════ */
const pdpTotal=d=>d.reward?0:draftCombined(d);      /* header/CTA = combined amount added to the order */

function pdpBar(p,d,dark){
  const naP=unavailParts(d);
  return `${naP.length?`<div class="flex-none bg-ember text-white px-8 py-4" role="status">
      <div class="text-[22px] font-bold">${naP.map(x=>tf('unavailPart',{name:x.name})).join(' · ')}</div>
      ${naP.some(x=>x.role!=='main')?`<div class="text-[18px] font-semibold opacity-90 mt-0.5">${tf('unavailPartsB',{list:naP.filter(x=>x.role!=='main').map(x=>x.name).join(', ')})}</div>`:''}
      <div class="flex flex-wrap gap-3 mt-3">${naP.filter(x=>x.fix).map(x=>x.fix==='drink'
        ?`<button type="button" data-a="fixDrink" class="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold">${t('changeDrink')}</button>`
        :x.fix==='xs'?`<button type="button" data-a="fixXs" data-id="${x.id}" class="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold">${tf('removePart',{name:x.name})}</button>`
        :`<button type="button" data-a="fixMenu" class="press h-[60px] px-5 rounded-full bg-white text-ember text-[19px] font-bold">${tf('removePart',{name:L(UPSELL_CMS.menuUpgrade.title)})}</button>`).join('')}</div>
    </div>`:''}<div class="pdpBar flex-none h-[104px] px-5 flex items-center gap-4 text-white ${dark?'bg-ink':'bg-jade'}">
    <button type="button" data-a="backProduct" id="pdpBack" aria-label="${t('back')}"
      class="press h-[76px] min-w-[76px] pl-3 pr-6 rounded-full flex items-center gap-3 hd text-[26px] tracking-[.1em]">
      <span class="w-10 h-10">${ic('arrL','',2.6)}</span>${t('back')}</button>
    <div class="flex-1 min-w-0 text-center hd text-[40px] tracking-[.04em] truncate px-3">${p.name}</div>
    <div class="min-w-[190px] text-right" aria-live="polite">
      <span id="pdpTot" class="bkv num text-[34px] font-extrabold ${dark?'text-pbright':''}"><span class="bkv-c">${fmt(pdpTotal(d))}</span></span>
    </div>
  </div>`;
}

/* ── shared building blocks (state, not layout) ─────────────── */
function qtyBox(d){
  return `<div class="mt-10" id="qtyWrap">
    <div class="hd text-[28px] tracking-[.08em]">${t('qty')}</div>
    <div class="mt-4 pdp-stp">${stepper(d.qty,'draftQty','',88,{keepMin:true,qid:'cfgQty'})}</div></div>`;
}
const servingSection=(p,d)=>{ const sv=servingsOf(p); if(!sv||sv.length<2) return '';
  return `<section class="grp mt-7" id="grp-serving">
    <div class="hd text-[27px] tracking-[.04em]">${t('sizeT')}</div>
    <div class="mt-3">${servingPicker(p,servingIx(p,d),'pdp')}</div></section>`;
};
function customizeRow(p,d){
  if(!(p.mods||[]).length) return '';
  const nMods=(d.extras||[]).filter(([g])=>g!=='premX').length+(d.removes?.length||0);
  return `<button type="button" data-a="openCustomize" class="press w-full mt-8 rounded-[24px] bg-card shadow-soft p-6 flex items-center gap-6 text-left">
    <div class="flex-1">
      <div class="hd text-[26px] tracking-[.04em]">${t('customize')}</div>
      <div class="text-[20px] text-mute font-medium mt-1">${t('yourWay')}</div>
    </div>
    ${nMods?`<span class="min-w-[44px] h-[44px] px-3 rounded-full bg-jade text-white num text-[22px] font-extrabold grid place-items-center">${nMods}</span>`:''}
    <span class="w-9 h-9 text-mute">${ic('pencil')}</span></button>`;
}
const allergenRow=p=>`
  <button type="button" data-a="openSheet" class="press mt-6 flex items-center gap-3 text-mute font-semibold text-[21px]">
    <span class="w-7 h-7">${ic('info')}</span>${t('allergens')}</button>`;

/* selected paid additions, itemised (base → each addition → total) */
function priceLines(p,d){
  const rows=[[p.name,p.price,false]];
  if(d.menu){ rows.push([L(UPSELL_CMS.menuUpgrade.title),MENU_DEAL.price,true]);
    const up=drinkUp(d.drink); if(up) rows.push([byId(d.drink).name,up,true]); }
  for(const [g,cid] of Object.entries(d.choices||{})){ if(!cid) continue;
    const it=modItem(g,cid); if(it.price) rows.push([L(it.name),it.price,true]); }
  (d.extras||[]).forEach(([g,id])=>{ const it=modItem(g,id); const q=exQty(d,g,id); rows.push([q>1?`${q}× ${L(it.name)}`:L(it.name),it.price*q,true]); });
  return rows;
}
function priceRows(p,d){                    /* full itemised calculation — shown once, in the price sheet */
  const rows=priceLines(p,d);
  const xs=(d.crossSells||[]).map(x=>({sel:x,v:cmsById(x.id)})).filter(x=>x.v);
  return `${rows.map(([n,v,plus])=>`<div class="flex justify-between gap-6 py-1.5 text-[22px] ${plus?'text-ink/80':'font-semibold'}">
      <span class="truncate">${n}</span><span class="num flex-none">${plus?'+ ':''}${fmt(v)}</span></div>`).join('')}
    ${d.qty>1?`<div class="flex justify-between gap-6 py-1.5 text-[22px] text-ink/80"><span>${t('qty')}</span><span class="num">× ${d.qty} = ${fmt(unitPrice(d)*d.qty)}</span></div>`:''}
    ${xs.length?`<div class="hair mt-3 pt-3 text-[18px] hd tracking-[.1em] text-mute">${t('priceSide')}</div>
      ${xs.map(({sel,v})=>`<div class="flex justify-between gap-6 py-1.5 text-[22px] text-ink/80"><span class="truncate">${xsTitle(v,d)} × ${sel.quantity}${v.qtyLabel?` · ${L(v.qtyLabel)}`:''}</span><span class="num flex-none">+ ${fmt(priceOf(v)*sel.quantity)}</span></div>`).join('')}`:''}
    <div class="hair mt-3 pt-3 flex justify-between hd text-[30px] tracking-[.04em]"><span>${t('total')}</span><span class="num">${fmt(draftCombined(d))}</span></div>`;
}
const extrasSum=(p,d)=>unitPrice(d)-p.price;
/* one fixed white action dock: muted price line + dominant full-width CTA.
   The submission control keeps a REAL disabled state; while the draft is
   incomplete a separate transparent button (the veil) sits on top of it and
   carries the required-choice feedback — disabled-button events are not
   propagated consistently across engines, a real button always is.       */
function ctaBtn(d,label,action='addOrder'){
  const ok=draftValid(d);
  return `<div class="relative" id="ctaWrap">
    <button type="button" data-a="${action}" id="cfgCta" ${ok?'':'disabled'} aria-disabled="${!ok}"
      class="press cta w-full h-[104px] rounded-[22px] bg-jade text-white flex items-center pl-8 pr-6">
      <span class="hd text-[25px] tracking-[.1em] flex-1 text-left whitespace-nowrap truncate">${label}</span>
      <span class="cta-div w-px h-11 mx-6" aria-hidden="true"></span>
      <span id="cfgTot" class="bkv num text-[36px] font-extrabold"><span class="bkv-c">${fmt(pdpTotal(d))}</span></span>
      <span class="w-9 h-9 ml-6 flex-none">${ic('arrR','',2.6)}</span>
    </button>
    ${ok?'':ctaVeil()}</div>`;
}
const ctaVeil=()=>`<button type="button" data-a="cfgIncomplete" id="ctaVeil" class="cta-veil absolute inset-0 rounded-[22px]" aria-label="${(S.draft&&blockReason(S.draft))||t('reqHint')}"></button>`;
/* ── customize step: independent baseline snapshot of the choices when the step opened.
   The button state follows the DIFFERENCE with that baseline (stable ids, sorted), never
   "something is selected". Editing the draft can never mutate the baseline (deep copy).   */
const stepKey=d=>JSON.stringify({
  x:(d.extras||[]).map(([g,i])=>g+':'+i).sort(),
  r:(d.removes||[]).map(([g,i])=>g+':'+i).sort(),
  c:Object.entries(d.choices||{}).filter(([,v])=>v).map(([g,v])=>g+':'+v).sort(),
  q:d.qty });
const stepDirty=()=>!!(S._custom0&&S.draft&&stepKey(S.draft)!==S._custom0);
/* compact summary of what the guest changed in this step (added extras / removed ingredients) */
function stepSummary(d){
  let base={x:[],r:[]}; try{ base=JSON.parse(S._custom0||'{}'); }catch(e){}
  const was=new Set([...(base.x||[]),...(base.r||[])]);
  const now=[...(d.extras||[]).map(([g,i])=>[g,i,'x']),...(d.removes||[]).map(([g,i])=>[g,i,'r'])];
  const added=now.filter(([g,i,k])=>!was.has(g+':'+i)).map(([g,i])=>{ try{ return L(modItem(g,i).name); }catch(e){ return null; } }).filter(Boolean);
  const gone=(base.x||[]).concat(base.r||[]).filter(k=>!now.some(([g,i])=>g+':'+i===k))
    .map(k=>{ const [g,i]=k.split(':'); try{ return L(modItem(g,i).name); }catch(e){ return null; } }).filter(Boolean);
  return [...added,...gone.map(n=>'− '+n)].join(' · ');
}
/* the step dock: one button in one position — back-to-product (light, outlined) or confirm (solid jade) */
/* step dock: swap only the parts that changed (summary line + button), keeping the dock's
   fixed height so nothing jumps while the guest is ticking options */
function refreshStepDock(){
  const info=document.getElementById('stepInfo'), wrap=document.getElementById('ctaWrap'); if(!info||!wrap||!S.draft) return;
  const p=byId(S.pid), d=S.draft, dirty=stepDirty();
  const tmp=document.createElement('div'); tmp.innerHTML=stepDock(p,d);
  const nInfo=tmp.querySelector('#stepInfo'), nWrap=tmp.querySelector('#ctaWrap'), nHint=tmp.querySelector('.pdp-bottom > div:last-child');
  info.innerHTML=nInfo.innerHTML;
  if((wrap.querySelector('#cfgCta')||{}).dataset?.a!==(nWrap.querySelector('#cfgCta')||{}).dataset?.a||wrap.querySelector('#cfgCta').className!==nWrap.querySelector('#cfgCta').className) wrap.innerHTML=nWrap.innerHTML;
  const hint=document.querySelector('#pdp .pdp-bottom > div:last-child'); if(hint&&nHint) hint.textContent=nHint.textContent;
}
function stepDock(p,d){
  const dirty=stepDirty();
  return `<div class="flex-none bg-card shadow-lift px-8 pt-3 pdp-bottom" style="padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))">
    <div id="stepInfo" class="flex items-end justify-between gap-6">
      <div class="min-w-0">
        ${dirty?`<div class="text-[21px] font-semibold truncate">${stepSummary(d)||'\u00a0'}</div>
          <div class="text-[18px] text-mute font-semibold truncate">${t('priceBase')} ${fmt(p.price)} · ${t('priceExtras')} +${fmt(extrasSum(p,d))}</div>`
        :`<div class="text-[20px] text-mute font-semibold">${t('noChanges')}</div>`}
      </div>
      <div class="flex items-center gap-4 flex-none">
        <span id="cfgTot" class="bkv num text-[34px] font-extrabold"><span class="bkv-c">${fmt(pdpTotal(d))}</span></span>
        <button type="button" data-a="openPrice" class="press h-[40px] text-[17px] font-bold text-jade underline underline-offset-4 flex-none">${t('priceBreakdown')}</button>
      </div>
    </div>
    <div class="relative mt-3" id="ctaWrap">
      ${dirty
        ? `<button type="button" data-a="confirmCustomize" id="cfgCta"
             class="press cta w-full h-[104px] rounded-[22px] bg-jade text-white flex items-center justify-center gap-6">
             <span class="hd text-[27px] tracking-[.12em]">${t('confirmChoices')}</span>
             <span class="w-9 h-9 flex-none">${ic('check','',3)}</span></button>`
        : `<button type="button" data-a="confirmCustomize" id="cfgCta"
             class="press cta step-back w-full h-[104px] rounded-[22px] bg-paper text-jade flex items-center justify-center gap-6">
             <span class="w-9 h-9 flex-none">${ic('arrL','',2.6)}</span>
             <span class="hd text-[27px] tracking-[.12em]">${t('backToProduct')}</span></button>`}
    </div>
    <div class="text-center text-[17px] text-mute font-semibold mt-2 min-h-[24px]">${dirty?t('backAfterConfirm'):'\u00a0'}</div>
  </div>`;
}
function actionDock(d,label,line,action){
  /* order: the decision first (CTA), the price build-up underneath as supporting information */
  return `<div class="flex-none bg-card shadow-lift px-8 pt-3 pdp-bottom" style="padding-bottom:calc(12px + env(safe-area-inset-bottom,0px))">
    ${ctaBtn(d,label,action)}
    <div id="ctaReason" class="text-[19px] font-bold text-ember text-center min-h-[26px]" role="status" aria-live="polite">${draftValid(d)?'':blockReason(d)}</div>
    <div class="flex items-center justify-between h-[44px] text-[19px] text-mute font-semibold mt-1.5">
      <span class="truncate">${line}</span>
      <button type="button" data-a="openPrice" class="press h-[44px] pl-4 text-[17px] font-bold text-jade underline underline-offset-4 flex-none">${t('priceBreakdown')}</button>
    </div>
  </div>`;
}
const dockLineA=(p,d)=>`${t('priceProduct')} <span id="sumMain" class="bkv num text-ink"><span class="bkv-c">${fmt(unitPrice(d)*d.qty)}</span></span> · ${t('priceSide')} <span id="sumX" class="bkv num text-ink"><span class="bkv-c">${fmt(xsSum(d))}</span></span>`;
const dockLineB=(p,d)=>`${t('priceBase')} <span class="num text-ink">${fmt(p.price)}</span> · ${t('priceExtras')} <span id="sumX" class="bkv num text-ink"><span class="bkv-c">+${fmt(extrasSum(p,d))}</span></span>`;

/* ── FLOW A · commercial components/* ── FLOW A · commercial components (role-driven) ───────────── */
/* drink selector inside the menu upgrade:
   1 · paid upgrades on top — large photo with object-fit:contain so the glass stays fully visible,
       CMS surcharge (price variant), explicit choose button;
   2 · included drinks below as compact chips with a small contained photo;
   exactly one drink is selected at any time; picking another replaces it and updates the total. */
function drinkUpCard(v,d){ const dr=byId(v.pid), on=d.drink===v.pid;
  return `<button type="button" data-a="pickDrink" data-id="${v.pid}" aria-pressed="${on}"
    class="press vu-card drink-up flex flex-col overflow-hidden rounded-[22px] text-left ${on?'vu-on':''}">
    <span class="vu-ring" aria-hidden="true"></span>
    <div class="relative flex-none w-full h-[300px] drink-shot">
      ${dr.img?`<img src="${dr.img}" alt="" class="drink-img" loading="lazy" decoding="async" onerror="this.remove()">`:`<span class="grid place-items-center h-full text-[80px]">${dr.em}</span>`}
      <span class="vu-check" aria-hidden="true">${ic('check','',3)}</span></div>
    <div class="p-5 pt-4 flex-1 flex flex-col w-full">
      <div class="hd text-[26px] leading-[28px] tracking-[.03em]">${dr.name}</div>
      ${v.description?`<div class="text-[18px] text-mute font-medium leading-[23px] clamp2 mt-1">${L(v.description)}</div>`:''}
      <div class="num text-[26px] font-extrabold mt-2">+ ${fmt(priceOf(v))}</div>
      <span class="vu-cta vu-ctaS h-[68px] rounded-full grid text-[19px] font-bold mt-3">
        <span class="vu-c0">${t('vuChoose')}</span>
        <span class="vu-c1"><span class="w-5 h-5">${ic('check','',3)}</span>${t('vuChosen')}</span>
      </span>
    </div></button>`;
}
function drinkInclChip(id,d){ const dr=byId(id), on=d.drink===id;
  return `<button type="button" data-a="pickDrink" data-id="${id}" aria-pressed="${on}"
    class="press drink-chip flex items-center gap-4 rounded-[18px] text-left ${on?'on':''}">
    <span class="drink-chip-img flex-none">${dr.img?`<img src="${dr.img}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:`<span class="text-[30px]">${dr.em}</span>`}</span>
    <span class="flex-1 min-w-0 text-[21px] font-semibold leading-[25px]">${dr.name}</span>
    <span class="drink-ck flex-none w-9 h-9 rounded-full grid place-items-center" aria-hidden="true"><span class="w-5 h-5">${ic('check','',3.2)}</span></span>
  </button>`;
}
function vuDrinksBlock(p,d,vDrinks){
  const ups=vDrinks.map(v=>drinkUpCard(v,d)).join('');
  const chips=MENU_DEAL.drinks.map(id=>drinkInclChip(id,d)).join('');
  const picked=byId(d.drink), extra=drinkUp(d.drink);
  return `<div id="vuDrinks" class="mt-7">
    <div class="hd text-[34px] leading-[38px] tracking-[.03em]">${t('menuDrink')}</div>
    <div class="text-[20px] text-mute font-medium mt-1">${t('menuDrinkS')}</div>
    ${ups?`<div class="mt-7">
      <div class="hd text-[30px] leading-[34px] tracking-[.03em]">${t('drinkUpgradeT')}</div>
      <div class="text-[19px] text-mute font-medium mt-1">${t('drinkUpgradeS')}</div>
      <div class="grid grid-cols-2 gap-5 mt-4">${ups}</div>
    </div>`:''}
    <div class="mt-7">
      <div class="hd text-[30px] leading-[34px] tracking-[.03em]">${t('drinkInclT')}</div>
      <div class="text-[19px] text-mute font-medium mt-1">${t('drinkInclS')}</div>
      <div class="grid grid-cols-3 gap-4 mt-4">${chips}</div>
    </div>
    <div id="drinkPicked" class="mt-6 rounded-[20px] bg-card shadow-soft px-6 py-5 flex items-center gap-5" role="status" aria-live="polite">
      <div class="flex-1 min-w-0">
        <div id="drinkPickedName" class="text-[22px] font-bold truncate">${tf('drinkPickedT',{name:picked?picked.name:'—'})}</div>
        <div class="text-[18px] text-mute font-medium mt-0.5">${t('drinkPickedS')}</div>
      </div>
      <span id="drinkPickedTag" class="bkv flex-none h-[56px] px-6 rounded-full bg-jade/10 text-jade text-[19px] font-bold grid place-items-center"><span class="bkv-c">${extra?`+ ${fmt(extra)}`:t('inclLabel')}</span></span>
    </div>
  </div>`;
}
/* menu offer: appetising green panel with the combo photo and one floating call-to-action */
/* one pricing rule for the combo everywhere: show the MENU TOTAL (dish in its chosen size + menu deal), never "+X" to add up */
const menuTotalOf=(p,d)=>{ const sv=servingOf(p,d); return (sv?sv.price:p.price)+MENU_DEAL.price; };
function menuOfferPanel(p,d,v){
  return `<button type="button" data-a="vuMenu" id="vuMenuCard" aria-pressed="false"
    class="press vu-offer relative w-full rounded-[26px] overflow-hidden text-left text-white">
    <img src="${ASSETS2.menuCombo}" alt="" class="vu-offer-img" loading="eager" decoding="async" onerror="this.remove()">
    <div class="relative z-10 p-8 pr-[300px]">
      ${v.badge?`<span class="badge b-dea">${L(v.badge)}</span>`:''}
      <div class="hd text-[46px] leading-[48px] tracking-[.03em] mt-3">${L(v.title)}</div>
      <div class="text-[22px] font-medium opacity-90 mt-1.5">${L(v.incl)}</div>
      <span class="vu-offer-cta mt-6 h-[84px] px-8 rounded-full bg-paper text-ink inline-flex items-center gap-4 text-[23px] font-bold">
        ${tf('menuPriceA',{price:`<span class="num">${fmt(menuTotalOf(p,d))}</span>`})}
      </span>
    </div></button>`;
}
function vuMenuBlock(p,d,v,vDrinks){
  const on=!!d.menu;
  /* once the menu is part of the order the big banner collapses into a compact summary,
     so the drink choice gets the attention instead of the offer */
  if(on) return `<div class="mt-6" id="vuMenuWrap">
    <div id="vuMenuCard" class="vu-menu-sum rounded-[24px] px-6 py-5 flex items-center gap-5 text-white" aria-pressed="true" data-a="vuMenu" role="button" tabindex="0">
      <span class="flex-none w-[56px] h-[56px] rounded-full bg-white/20 grid place-items-center"><span class="w-7 h-7">${ic('check','',3.2)}</span></span>
      <span class="flex-1 min-w-0">
        <span class="hd block text-[30px] leading-[32px] tracking-[.04em]">${t('vuMenuAdded')}</span>
        <span class="block text-[19px] font-medium opacity-90 mt-0.5 truncate">${L(v.incl)}</span>
      </span>
      <span class="flex-none text-right">
        <span class="num block text-[28px] font-extrabold">${tf('menuPriceA',{price:fmt(menuTotalOf(p,d))})}</span>
        <span class="block text-[17px] font-bold underline underline-offset-4 opacity-90">${t('menuRemove')}</span>
      </span>
    </div>
    ${vuDrinksBlock(p,d,vDrinks)}
  </div>`;
  return `<div class="mt-6" id="vuMenuWrap">${menuOfferPanel(p,d,v)}</div>`;
}
/* one photo card for product-enhancement AND cross-sell roles */
/* photo card — product-enhancement (modifier) or cross-sell (independent line) */
function vuCard(v,d){
  const xs=v.role==='cross-sell', g=ROLE_GROUP[v.role];
  const q=xs?0:exQty(d,g,v.id), on=xs?xsSelected(d,v.id):q>0;
  const title=xs?xsTitle(v,d):L(v.title);
  const max=xs?1:exMax(v.id);
  return `<button type="button" data-a="vux" data-id="${v.id}" data-role="${v.role}" aria-pressed="${on}"
    class="press vu-card vu-cardV flex flex-col overflow-hidden rounded-[22px] text-left ${on?'vu-on':''}">
    <span class="vu-ring" aria-hidden="true"></span>
    <div class="relative flex-none w-full h-[180px]">
      ${foodImg({img:v.img,em:v.em||'🥢',tint:v.tint,tint2:v.tint2,cut:v.cut},'absolute inset-0','70px')}
      ${v.badge?`<span class="badge badge-sm b-dea absolute top-3 left-3 z-10">${L(v.badge)}</span>`:''}
      <span class="vu-check" aria-hidden="true">${ic('check','',3)}</span>
    </div>
    <div class="p-4 pt-3 flex-1 flex flex-col w-full items-center text-center">
      <div class="hd text-[24px] leading-[26px] tracking-[.04em]">${title}</div>
      ${v.qtyLabel?`<div class="text-[17px] text-mute font-semibold mt-0.5">${L(v.qtyLabel)}</div>`:''}
      ${v.description?`<div class="text-[16px] text-mute font-medium leading-[20px] clamp2 mt-0.5">${L(v.description)}</div>`:''}
      <div class="num text-[24px] font-extrabold mt-1">+ ${fmt(priceOf(v))}</div>
      ${(!xs&&on)?`<span class="vu-step mt-2.5 h-[60px] w-full rounded-[14px] flex items-stretch overflow-hidden" role="group" aria-label="${tf('qtyOfA',{name:L(v.title),n:q})}">
        <span class="vu-step-b" data-a="exQty" data-id="${v.id}" data-d="-1" role="button" tabindex="0" aria-label="−"><span class="w-6 h-6">${ic('minus','',3)}</span></span>
        <span class="vu-step-n num" aria-live="polite">${q}</span>
        <span class="vu-step-b ${q>=max?'off':''}" data-a="exQty" data-id="${v.id}" data-d="1" role="button" tabindex="0" aria-label="+"><span class="w-6 h-6">${ic('plus','',3)}</span></span>
      </span>`:`<span class="vu-cta vu-ctaS h-[60px] w-full rounded-[14px] grid text-[19px] font-bold mt-2.5">
        <span class="vu-c0"><span class="w-5 h-5">${ic('plus','',2.8)}</span>${t('addBtn')}</span>
        <span class="vu-c1"><span class="w-5 h-5">${ic('check','',3)}</span>${t('vuAdded')}</span>
      </span>`}
    </div></button>`;
}
/* compact cross-sell chip: photo · title · quantity · price · check — secondary to the menu card */
function xsChip(v,d){
  const on=xsSelected(d,v.id);
  return `<button type="button" data-a="vux" data-id="${v.id}" data-role="cross-sell" aria-pressed="${on}"
    class="press vu-card xs-chip flex items-center gap-4 rounded-[20px] text-left min-h-[112px] pr-4 ${on?'vu-on':''}">
    <span class="xs-ring" aria-hidden="true"></span>
    <div class="relative flex-none w-[112px] self-stretch rounded-l-[20px] overflow-hidden">
      ${foodImg({img:v.img,em:v.em||'🥢',tint:v.tint,tint2:v.tint2,cut:v.cut},'absolute inset-0','44px')}</div>
    <div class="flex-1 min-w-0 py-3">
      <div class="hd text-[22px] leading-[24px] tracking-[.03em]">${xsTitle(v,d)}</div>
      ${v.qtyLabel?`<div class="text-[15px] leading-[18px] text-mute font-semibold">${L(v.qtyLabel)}</div>`:''}
      <div class="num text-[21px] font-extrabold mt-0.5">+ ${fmt(priceOf(v))}</div>
    </div>
    <span class="xs-ck flex-none w-[48px] h-[48px] grid place-items-center" style="border-radius:${CTL_R()}px" aria-hidden="true">
      <span class="xs-ck0 w-6 h-6">${ic('plus','',2.8)}</span><span class="xs-ck1 w-6 h-6">${ic('check','',3)}</span></span>
  </button>`;
}
/* cross-sell section — layout from CMS: compact-horizontal (default) | collapsed | grid */
function xsSection(d,xp){
  const st=xp.upsellSettings, disp=st.crossSellDisplay||{mode:'compact-horizontal',maxVisible:3};
  const all=xp.allCrossSells.filter(v=>xsVisible(v,d)); if(!all.length) return '';
  const expanded=!!(d._more&&d._more.xs), title=L(xp.sectionXs.title);
  const conflict=xp.menuUpgrade&&d.menu&&all.find(v=>xsConflicts(v,d)&&xsSelected(d,v.id)&&!xsPortion(d,v.id)&&d._xsAsk===v.id);
  const ask=conflict?`<div id="xsConflict" class="mt-4 rounded-[20px] bg-card shadow-soft p-5 flex flex-wrap items-center gap-4" role="group">
      <div class="flex-1 min-w-[260px] text-[21px] font-semibold">${tf('xsConflictT',{name:L(conflict.title).toLowerCase()})}</div>
      <button type="button" data-a="xsKeep" data-id="${conflict.id}" class="press h-[64px] px-6 rounded-full bg-jade text-white text-[19px] font-bold">${t('xsKeep')}</button>
      <button type="button" data-a="xsDrop" data-id="${conflict.id}" class="press h-[64px] px-6 rounded-full text-[19px] font-bold text-ember" style="box-shadow:inset 0 0 0 2.5px rgb(var(--c-ember) / .5)">${t('xsDrop')}</button>
    </div>`:'';
  const head=`<div class="flex items-baseline justify-between"><div class="hd text-[30px] leading-[34px] tracking-[.04em]">${title}</div>
      ${disp.mode==='collapsed'&&!expanded&&all.length>1?`<button type="button" data-a="vuMore" data-sec="xs" class="press h-[52px] px-5 rounded-full bg-card shadow-soft text-[18px] font-bold">${t('showAll')} (${all.length})</button>`:''}</div>`;
  if(disp.mode==='grid'){
    const list=expanded?all:all.slice(0,disp.maxVisible||3);
    return `<section id="xsX" class="mt-8" aria-label="${title}">${head}
      <div class="grid grid-cols-3 gap-4 mt-4">${list.map(v=>vuCard(v,d)).join('')}</div>${ask}
      ${!expanded&&all.length>list.length?`<button type="button" data-a="vuMore" data-sec="xs" class="press mt-4 h-[56px] px-6 rounded-full bg-card shadow-soft text-[19px] font-bold">${t('showAll')} (${all.length})</button>`:''}</section>`;
  }
  const list=(disp.mode==='collapsed'&&!expanded)?all.slice(0,1):all;
  return `<section id="xsX" class="mt-8" aria-label="${title}">${head}
    <div class="xs-row ${list.length<=3?'xs-fit':''} flex gap-4 mt-4 overflow-x-auto pb-2">${list.map(v=>xsChip(v,d)).join('')}</div>${ask}</section>`;
}
function vuSection(id,title,items,all,d,showAllOn,moreKey){
  const expanded=!!(d._more&&d._more[moreKey]);
  const list=expanded?all:items, hidden=all.length-items.length;
  return `<section id="${id}" class="mt-8" aria-label="${title}">
    <div class="hd text-[36px] leading-[40px] tracking-[.03em]">${title}</div>
    <div class="vu-grid grid grid-cols-3 gap-4 mt-4">${list.map(v=>vuCard(v,d)).join('')}</div>
    ${showAllOn&&hidden>0?`<button type="button" data-a="vuMore" data-sec="${moreKey}"
      class="press mt-4 h-[56px] px-6 rounded-full bg-card shadow-soft text-[19px] font-bold">${expanded?t('showLess'):t('showAllX')} (${all.length})</button>`:''}
  </section>`;
}

/* ── FLOW A · visual upsell (complete product, orderable at base price) ── */
function renderVisualUpsellFlow(p,d,xp){
  const st=xp.upsellSettings;
  const optGroups=xp.modificationGroups.filter(g=>!g.required).map(g=>choiceGroup(g.id,d)).join('');
  /* required choices first, numbered and marked exactly as in the modification flow; the CTA stays blocked until they are made */
  const reqGroups=xp.modificationGroups.filter(g=>g.required).map((g,i)=>modGroup(g.id,d,i+1)).join('');
  return `${pdpBar(p,d,false)}
  <div class="pdp-sheet">
  <div class="scroller flex-1 px-8 pb-[140px]">
    <div class="vu-colA">
    <div class="flex gap-6 pt-5 items-center">
      <div id="pdpHero" class="pdp-hero pdp-hero-sm w-[300px] flex-none">${heroShot(p,'110px')}</div>
      <div class="flex-1 min-w-0">
        <h1 class="hd text-[46px] leading-[1.02] tracking-[.02em]">${p.name}</h1>
        <p class="text-[20px] text-mute font-medium leading-snug clamp2 mt-2">${L(p.desc)}</p>
        <div class="flex items-baseline gap-3 mt-3"><span class="hd text-[17px] tracking-[.14em] text-mute">${t('basePrice')}</span>
          <span class="num text-[36px] font-extrabold leading-none">${fmt(p.price)}</span></div>
      </div>
    </div>
    ${reqGroups?`<div class="vu-req mt-2">${reqGroups}</div>`:''}
    ${xp.menuUpgrade?vuMenuBlock(p,d,xp.menuUpgrade,xp.premiumDrinks):''}
    </div>
    <div class="vu-colB">
    ${xp.productEnhancements.length?vuSection('vuX',L(xp.sectionEnh.title),xp.productEnhancements,xp.allEnhancements,d,st.showAllEnhancementsAction,'enh'):''}
    ${xsSection(d,xp)}
    ${optGroups}
    ${servingSection(p,d)}
    ${customizeRow(p,d)}
    ${allergenRow(p)}
    ${qtyBox(d)}
    </div>
  </div>
  ${actionDock(d,S.editing?t('updateOrder'):t('addToOrder'),dockLineA(p,d))}</div>`;
}

/* ── FLOW B · modification only (functional preparation choices) ── */
function modGroup(g,d,idx){
  const grp=MODS[g], req=!!grp.req;
  return `<section id="grp-${g}" role="group" aria-labelledby="grpl-${g}" class="grp mt-6">
    <div class="flex items-center gap-5">
      <span class="w-[60px] h-[60px] rounded-full bg-shade grid place-items-center num text-[28px] font-bold flex-none" aria-hidden="true">${idx}</span>
      <div id="grpl-${g}" class="hd text-[30px] tracking-[.06em]">${L(grp.label)}${req?` <span aria-label="${t('reqMark')}">*</span>`:''} <span class="text-[17px] tracking-[.1em] ${req?'text-ember':'text-mute'}">· ${t(req?'reqLabel':'optLabel')}</span></div>
    </div>
    <div id="hint-${g}" class="reqHint text-[20px] font-semibold text-ember" role="status" aria-live="polite"></div>
    <div class="grid grid-cols-3 gap-5 mt-2">
      ${grp.items.map(it=>{ const on=d.choices[g]===it.id;
        const pr=it.price?`<span class="num text-[19px] font-bold">${it.price>0?'+':''}${fmt(it.price)}</span>`:'';
        return `<button type="button" data-a="choice" data-g="${g}" data-id="${it.id}" aria-pressed="${on}"
          class="press optBtn relative h-[112px] rounded-[16px] bg-card grid place-items-center px-3 hd text-[26px] tracking-[.06em] text-center">
          <span class="optCk" aria-hidden="true"><span class="w-6 h-6">${ic('check','',3.4)}</span></span>
          <span class="flex flex-col items-center leading-[28px]">${L(it.name)}${pr}</span></button>`;}).join('')}
    </div></section>`;
}
function menuDrinkGroup(d){                  /* functional: a menu draft needs a drink choice */
  if(!d.menu) return '';
  return `<section class="grp pt-8 mt-8 hair" role="group" aria-label="${t('menuDrink')}">
    <div class="hd text-[30px] tracking-[.06em]">${t('menuDrink')}</div>
    <div class="flex flex-wrap gap-3 mt-5">${MENU_DEAL.drinks.map(id=>{const dr=byId(id),on=d.drink===id;
      return `<button type="button" data-a="pickDrink" data-id="${id}" aria-pressed="${on}"
        class="press optBtn h-[72px] px-6 rounded-[14px] bg-card flex items-center gap-2.5 text-[21px] font-semibold">
        <span class="text-[24px]">${dr.em}</span>${dr.name}</button>`;}).join('')}</div></section>`;
}
function renderModificationFlow(p,d,xp){
  return `${pdpBar(p,d,true)}
  <div class="pdp-sheet">
  <div class="scroller flex-1 pb-[140px]">
    <div id="pdpHero" class="pdp-hero w-full">${heroShot(p)}</div>
    <div class="px-9">
      <h1 class="hd text-[64px] leading-[1.02] tracking-[.02em] mt-7">${p.name}</h1>
      <p class="text-[24px] text-mute font-medium leading-relaxed mt-2">${L(p.desc)}</p>
      <div class="num text-[44px] font-extrabold text-jade leading-none mt-4">${fmt(p.price)}</div>
      ${xp.modificationGroups.map((g,i)=>modGroup(g.id,d,i+1)).join('')}
      ${menuDrinkGroup(d)}
      ${servingSection(p,d)}
    ${customizeRow(p,d)}
      ${allergenRow(p)}
      ${qtyBox(d)}
    </div>
  </div>
  ${actionDock(d,S.editing?t('updateOrder'):t('addBtnOrder'),dockLineB(p,d))}</div>`;
}


/* ══════════════════════════════════════════════════════════════
   R44 PRODUCT DETAIL PAGE (v32) — one page for eMenu and kiosk (renderDetail · numHead · sizePillsHTML · modGroupHTML ·
   chcHTML · enhHTML · add/validate). Order (R-PDP-01): intro → size → required groups → menu offer + extras → optional
   groups → info rows → fixed bottom bar. Steps are numbered by a CSS counter, so hiding a group renumbers without gaps.
   Existing actions drive every state change (choice, pickServing, exQty, vux, draftQty, addOrder): pricing, validation,
   edit mode, cart and payment are untouched — the kiosk only differs in what happens AFTER adding.
   ══════════════════════════════════════════════════════════════ */
const r44Grams=x=>{ const m=String(x&&x.sub||'').match(/(\d+)\s*g\b/i); return m?+m[1]:null; };
const r44OptBlocked=it=>[...(S.allergenFilter||[])].some(a=>((it.allergens&&it.allergens.contains)||[]).includes(a));
function r44Bowl(frac){ const f=Math.max(.18,Math.min(1,frac)), h=Math.round(22*f*10)/10;     /* filled AREA scales with the amount */
  return `<svg viewBox="0 0 64 44" aria-hidden="true" class="r44-bowl"><defs><clipPath id="r44c"><path d="M6 14h52c0 14-11 24-26 24S6 28 6 14Z"/></clipPath></defs>
    <path d="M6 14h52c0 14-11 24-26 24S6 28 6 14Z" fill="none" stroke="currentColor" stroke-width="2.6"/>
    <rect x="4" y="${(38-h).toFixed(1)}" width="56" height="${h}" fill="currentColor" clip-path="url(#r44c)" opacity=".9"/>
    <path d="M22 41h20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M10 10c6-6 38-6 44 0" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round"/></svg>`; }
const r44Head=(title,note)=>`<div class="r44-step${note==='opt'?' r44-optional':''}">${note==='opt'?'':'<span class="r44-num" aria-hidden="true"></span>'}
    <span class="r44-tt">${title}</span>${note?`<span class="r44-note${note==='req'?' req':''}"${note==='req'?` aria-label="${t('reqMark')}"`:''}>· ${t(note==='req'?'r44Req':'r44Opt')}</span>`:''}</div>`;
function r44SizeSection(p,d){ const sv=servingsOf(p); if(!sv||sv.length<2) return '';
  const sel=servingIx(p,d), base=sv[0], gs=sv.map(r44Grams), gmax=Math.max(...gs.filter(Boolean),1);
  return `<section class="grp r44-grp" id="grp-serving" role="radiogroup" aria-label="${t('r44Size')}">
    ${r44Head(t('r44Size'),null)}
    <div class="r44-sizes" style="grid-template-columns:repeat(${Math.min(sv.length,3)},minmax(0,1fr))">${sv.map((x,i)=>{ const on=i===sel, g=gs[i], dg=g&&gs[0]?g-gs[0]:0, dp=x.price-base.price;
      const diff=i===0?t('r44Base'):(dg>0?tf('r44DiffG',{g:dg,price:fmt(dp)}):`+ ${fmt(dp)}`);
      return `<button type="button" role="radio" data-a="pickServing" data-ctx="pdp" data-pid="${p.id}" data-ix="${i}" aria-pressed="${on}" aria-checked="${on}" class="press r44-size${on?' on':''}">
        <span class="r44-sz-ic">${r44Bowl(g?g/gmax:(i+1)/sv.length)}</span>
        <span class="r44-sz-mid"><span class="r44-sz-nm"><span class="hd">${L(x.short)}</span>${x.love?`<span class="r44-rec">${t('r44Rec')}</span>`:''}</span>
          ${x.sub?`<span class="r44-sz-g">${x.sub}</span>`:''}<span class="r44-sz-d">${diff}</span></span>
        <span class="r44-sz-pr hd num">${fmt(x.price)}</span>
        <span class="r44-ck" aria-hidden="true">${ic('check','',3)}</span></button>`; }).join('')}</div></section>`; }
function r44Cols(items){ const n=items.length, long=Math.max(...items.map(it=>String(L(it.name)).length+(it.price?6:0)))>12;   /* label + price difference */
  return n<=2?n:(n===3?3:(long?2:4)); }
function r44Group(g,d){ const grp=MODS[g], req=!!grp.req;
  return `<section class="grp r44-grp" id="grp-${g}" role="group" aria-labelledby="grpl-${g}">
    ${r44Head(`<span id="grpl-${g}">${L(grp.label)}</span>`,req?'req':'opt')}
    <div id="hint-${g}" class="reqHint r44-hint" role="status" aria-live="polite"></div>
    <div class="r44-opts" style="grid-template-columns:repeat(${r44Cols(grp.items)},minmax(0,1fr))">${grp.items.map(it=>{ const on=d.choices[g]===it.id, bl=r44OptBlocked(it);
      return `<button type="button" data-a="${bl?'r44Blocked':'choice'}" data-g="${g}" data-id="${it.id}" aria-pressed="${on&&!bl}"${bl?' aria-disabled="true"':''}
        class="press optBtn r44-opt${bl?' blk':''}"><span class="r44-ol"><span class="r44-on">${L(it.name)}</span>${it.sub?`<span class="r44-os">${L(it.sub)}</span>`:''}</span>
        ${it.price?`<span class="r44-op hd num">${it.price>0?'+':''}${fmt(it.price)}</span>`:''}<span class="r44-ck" aria-hidden="true">${ic('check','',3)}</span></button>`; }).join('')}</div></section>`; }
function r44EnhTile(v,d){ const g=ROLE_GROUP[v.role], q=exQty(d,g,v.id), max=exMax(v.id), name=L(v.title);
  const sub=[v.qtyLabel?L(v.qtyLabel):'',v.description?L(v.description):''].filter(Boolean).join(' · ');
  const ctl=q>0?`<span class="ob-stp r44-exstp" role="group" aria-label="${tf('qtyOfA',{name,n:q})}">
      <button type="button" data-a="exQty" data-id="${v.id}" data-d="-1" class="press ob-m" aria-label="${q===1?t('obRemove'):t('obLess')}">${q===1?`<span class="ob-tr">${ic('trash','',2.3)}</span>`:'<span class="ob-bar"></span>'}</button>
      <span class="ob-sq num" aria-live="polite">${q}</span>
      <button type="button" data-a="exQty" data-id="${v.id}" data-d="1" class="press ob-p${q>=max?' off':''}" aria-label="${t('obMore')}"${q>=max?' aria-disabled="true"':''}><span class="ob-i">${ic('plus','',2.6)}</span></button></span>`
    :`<button type="button" data-a="exQty" data-id="${v.id}" data-d="1" class="press ob" aria-label="${tf('obAddA',{name})}"><span class="ob-i">${ic('plus','',2.6)}</span></button>`;
  return `<div class="r44-ex${q?' on':''}" data-ex="${v.id}">
    <div class="r44-ex-img">${foodImg({img:v.img,em:v.em||'🥢',tint:v.tint,tint2:v.tint2,cut:v.cut},'absolute inset-0','64px')}</div>
    <div class="r44-ex-b"><div class="hd r44-ex-n">${name}</div><div class="r44-ex-s">${sub}</div>
      <div class="r44-ex-row"><span class="r44-ex-p hd num">+ ${fmt(priceOf(v))}</span>${ctl}</div></div></div>`; }
function r44EnhSection(p,xp,d){ if(!xp.allEnhancements.length) return '';
  const open=!!(d._more&&d._more.enhOpen), expanded=!!(d._more&&d._more.enh), all=xp.allEnhancements.length;
  const list=expanded?xp.allEnhancements:xp.productEnhancements.slice(0,3);
  const sel=xp.allEnhancements.map(v=>({v,q:exQty(d,ROLE_GROUP[v.role],v.id)})).filter(x=>x.q>0);
  const sum=sel.length?sel.map(x=>(x.q>1?x.q+'× ':'')+L(x.v.title)).join(' · '):t('r44NoneSel');
  const extra=sel.reduce((a,x)=>a+priceOf(x.v)*x.q,0);
  return `<section class="grp r44-grp r44-exs${open?' open':''}" id="vuX" aria-label="${L(xp.sectionEnh.title)}">
    <button type="button" data-a="r44ExToggle" class="press r44-exh" aria-expanded="${open}" aria-controls="vuXBody">
      <span class="r44-exh-t"><span class="hd">${L(xp.sectionEnh.title)}</span><span class="r44-note">· ${t('r44Opt')}</span></span>
      <span class="r44-exh-s${sel.length?' has':''}">${sum}${extra?` <b class="num">+ ${fmt(extra)}</b>`:''}</span>
      <span class="r44-exh-i">${ic('chevR','',2.6)}</span></button>
    <div id="vuXBody" class="r44-exbody"${open?'':' hidden'}>
      <div class="r44-exg">${list.map(v=>r44EnhTile(v,d)).join('')}</div>
      ${all>3?`<button type="button" data-a="vuMore" data-sec="enh" class="press r44-more">${expanded?t('showLess'):tf('r44AllEx',{n:all})}</button>`:''}</div></section>`; }
/* compact menu offer: contents · surcharge · resulting total · one "+" (replaces the banner) */
function r44MenuOffer(p,d,v){ const tot=menuTotalOf(p,d);
  return `<div class="r44-grp r44-offer-wrap" id="vuMenuWrap"><button type="button" id="vuMenuCard" data-a="vuMenu" class="press r44-offer" aria-pressed="false">
    <span class="r44-of-ic">${ic('gift','',2)}</span>
    <span class="r44-of-tx"><span class="hd r44-of-t">${L(v.title)}</span><span class="r44-of-s">${L(v.incl)}</span></span>
    <span class="r44-of-pr"><span class="r44-of-plus num">+ ${fmt(MENU_DEAL.price)}</span><span class="r44-of-tot hd num">${fmt(tot)}</span></span>
    <span class="ob" aria-hidden="true"><span class="ob-i">${ic('plus','',2.6)}</span></span></button></div>`; }
function r44MenuWrap(p,d,xp){ return d.menu?vuMenuBlock(p,d,xp.menuUpgrade,xp.premiumDrinks):r44MenuOffer(p,d,xp.menuUpgrade); }
function r44Info(p,d,xp,vu){
  const rows=[];
  if((p.mods||[]).length){ const n=(d.extras||[]).filter(([g])=>g!=='premX').length+(d.removes?.length||0);
    rows.push(`<button type="button" data-a="openCustomize" class="press r44-row"><span class="r44-row-t hd">${t('customize')}</span>
      <span class="r44-row-s">${t('yourWay')}</span>${n?`<span class="r44-row-n num">${n}</span>`:''}<span class="r44-row-i">${ic('chevR','',2.4)}</span></button>`); }
  rows.push(`<button type="button" data-a="openSheet" class="press r44-row"><span class="r44-row-t hd">${t('r44Allerg')}</span>
    <span class="r44-row-s">${t('r44AllergS')}</span><span class="r44-row-i">${ic('chevR','',2.4)}</span></button>`);
  const xs=vu?xsSection(d,xp):'';
  if(xs) rows.push(`<div class="r44-row r44-row-x"><div class="r44-row-t hd">${t('r44Pair')}</div>${xs}</div>`);
  return `<div class="r44-info">${rows.join('')}</div>`; }
function r44Bar(p,d){ const ok=draftValid(d), label=S.editing?t('r44Save'):(S.intent==='direct'?t('r44Direct'):t('r44Add'));
  return `<div class="flex-none pdp-bottom r44-bar">
    <div id="ctaReason" class="r44-reason" role="status" aria-live="polite">${ok?'':blockReason(d)}</div>
    <div class="r44-barrow">
      <div class="pdp-stp r44-qty">${stepper(d.qty,'draftQty','',64,{keepMin:true,qid:'cfgQty'})}</div>
      <div class="relative flex-1" id="ctaWrap">
        <button type="button" data-a="addOrder" id="cfgCta" ${ok?'':'disabled'} aria-disabled="${!ok}" class="press cta r44-cta">
          <span class="hd r44-cta-l">${label}</span><span class="r44-dot" aria-hidden="true">·</span>
          <span id="cfgTot" class="bkv hd num r44-cta-t"><span class="bkv-c">${fmt(pdpTotal(d))}</span></span></button>
        ${ok?'':ctaVeil()}</div></div></div>`; }
function renderR44(p,d,xp){
  const vu=xp.flowType==='visual-upsell';                  /* modification-only products stay free of upsell (v26 rule) */
  const sv=servingsOf(p), sizes=sv&&sv.length>1, req=xp.modificationGroups.filter(g=>g.required), opt=xp.modificationGroups.filter(g=>!g.required);
  const naP=unavailParts(d);
  return `${naP.length?pdpBar(p,d,false).split('<div class="pdpBar')[0]:''}
  <div class="pdp-sheet r44">
  <div class="r44-top"><button type="button" data-a="backProduct" id="pdpBack" class="press r44-round" aria-label="${t('back')}"><span>${ic('chevL','',2.6)}</span></button>
    <button type="button" data-a="openSheet" class="press r44-round" aria-label="${t('r44Allerg')}"><span>${ic('info','',2.2)}</span></button></div>
  <div class="scroller flex-1 r44-scroll">
    <div class="r44-intro">
      <div id="pdpHero" class="pdp-hero r44-hero">${heroShot(p,'120px')}</div>
      <div class="r44-intro-t">
        <h1 class="hd r44-name">${p.name}</h1>
        <p class="r44-desc">${L(p.desc)}</p>
        <div class="hd r44-lbl" id="r44SizeLbl">${sizes?tf('r44SelSize',{size:L(sv[servingIx(p,d)].short)}):t('r44Price')}</div>
        <button type="button" data-a="openPrice" class="press hd num r44-price" aria-label="${t('priceBreakdown')}"><span id="r44Price" aria-live="polite">${fmt(unitPrice(d))}</span></button>
      </div>
    </div>
    ${r44SizeSection(p,d)}
    ${req.map(g=>r44Group(g.id,d)).join('')}
    ${opt.map(g=>r44Group(g.id,d)).join('')}
    ${vu?r44EnhSection(p,xp,d):''}
    ${vu&&xp.menuUpgrade?`<div class="r44-menu">${r44MenuWrap(p,d,xp)}</div>`:''}
    ${r44Info(p,d,xp,vu)}
  </div>
  ${r44Bar(p,d)}</div>`;
}
/* live parts that are not covered by updTotals: header label + unit price */
function r44Sync(){ const d=S.draft; if(!d||!document.querySelector('#pdp .r44')) return; const p=byId(d.pid), sv=servingsOf(p);
  const lbl=document.getElementById('r44SizeLbl'); if(lbl) lbl.textContent=sv&&sv.length>1?tf('r44SelSize',{size:L(sv[servingIx(p,d)].short)}):t('r44Price');
  const pr=document.getElementById('r44Price'); if(pr) pr.textContent=fmt(unitPrice(d));
  const mw=document.getElementById('vuMenuWrap'), xp=experienceFor(p);
  if(mw&&xp.menuUpgrade&&!mw.textContent.includes(fmt(menuTotalOf(p,d)))) mw.outerHTML=r44MenuWrap(p,d,xp);   /* offer advertises the price of the CURRENT size */
  const xh=document.querySelector('#vuX .r44-exh'); if(xh){ const tmp=document.createElement('div'); tmp.innerHTML=r44EnhSection(p,xp,d); const fresh=tmp.querySelector('.r44-exh'); if(fresh&&fresh.innerHTML!==xh.innerHTML) xh.innerHTML=fresh.innerHTML; }
  const rs=document.getElementById('ctaReason'); if(rs&&!rs.classList.contains('flash')) rs.textContent=draftValid(d)?'':blockReason(d);   /* message follows the state */
  document.querySelectorAll('#grp-serving .r44-size').forEach(b=>{ const on=b.getAttribute('aria-pressed')==='true'; b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on)); }); }

SCR.product=()=>{
  const p=byId(S.pid), d=S.draft, xp=experienceFor(p);
  const vu=xp.flowType==='visual-upsell';
  if(BRAND.pdpR44!==false) return `<div id="pdp" class="pdp pdp-r44 ${vu?'pdp-vu':'pdp-mod'}" role="dialog" aria-modal="true" aria-label="${p.name}">
    <div class="pdp-scrim" aria-hidden="true"></div>${renderR44(p,d,xp)}</div>`;
  return `<div id="pdp" class="pdp ${vu?'pdp-vu':'pdp-mod'}" role="dialog" aria-modal="true" aria-label="${p.name}">
    <div class="pdp-scrim" aria-hidden="true"></div>
    ${vu?renderVisualUpsellFlow(p,d,xp):renderModificationFlow(p,d,xp)}</div>`;
};

/* ── CUSTOMIZE (functional extras / removals sheet, inside #pdp) ── */
SCR.customize=()=>{
  const p=byId(S.pid), d=S.draft;
  const shadow=new Set(experienceFor(p).allEnhancements.flatMap(v=>v.shadows||[]).map(([g,i2])=>g+':'+i2));
  const row=(g,it,kind)=>{
    const on=kind==='extra'?d.extras.some(([gg,ii])=>gg===g&&ii===it.id)
                           :d.removes.some(([gg,ii])=>gg===g&&ii===it.id);
    return `<button type="button" data-a="mod" data-k="${kind}" data-g="${g}" data-id="${it.id}" aria-pressed="${on}"
      class="press w-full flex items-center gap-6 p-5 rounded-[22px] mb-3 bg-card shadow-soft ${on?'row-on':''}">
      <span class="ck"></span>
      ${it.em?`<span class="text-[36px]">${it.em}</span>`:''}
      <span class="flex-1 text-left text-[25px] font-semibold">${L(it.name)}</span>
      ${kind==='extra'
        ? `<span class="num text-[23px] font-bold ${on?'text-jade':'text-mute'}">+ ${fmt(it.price)}</span>`
        : `<span class="text-[21px] font-bold text-jade">${t('free')}</span>`}
    </button>`;
  };
  return `<div id="pdp" class="pdp pdp-mod" role="dialog" aria-modal="true" aria-label="${t('customize')}">
  ${pdpBar(p,d,true)}
  <div class="pdp-sheet">
  <div class="px-10 pt-6 pb-3 flex-none">
    <h1 class="hd text-[56px] tracking-[.02em]">${t('customize')}</h1>
    <div class="text-[22px] text-mute font-medium mt-1">${p.name}</div>
  </div>
  <div class="scroller flex-1 px-10 pt-4 pb-[200px]">
    ${(p.mods||[]).map(g=>{const grp=MODS[g];
      const its=grp.items.filter(it=>!shadow.has(g+':'+it.id));
      if(!its.length) return '';
      return `<div class="mb-8">
        <div class="flex items-baseline gap-4 mb-4">
          <div class="hd text-[26px] tracking-[.06em]">${L(grp.label)}</div>
          <div class="text-[19px] text-mute font-semibold">${t('optional')}</div>
        </div>
        ${its.map(it=>row(g,it,grp.type)).join('')}
      </div>`;}).join('')}
  </div>
  ${stepDock(p,d)}</div></div>`;
};

/* ── CART / ORDER REVIEW ─────────────────────────────────────── */
SCR.cart=()=>{
  const upsell = !hasCat('desserts')
    ? {p:byId('mochi'), tt:'sweetT', ss:'sweetS', bb:'viewDess', cat:'desserts'}
    : (!hasCat('drinks') ? {p:byId('greentea'), tt:'drinkT', ss:'drinkS', bb:'viewDrinks', cat:'drinks'} : null);
  const otype=id=>{
    const on=S.service===id, icn=id==='eatin'?'dish':'bag';
    return `<button type="button" data-a="otype" data-s="${id}" aria-pressed="${on}"
      class="press h-[72px] px-7 rounded-full border-[2.5px] flex items-center gap-3
        text-[22px] font-bold ${on?'bg-jade border-jade text-white':'bg-card border-line text-ink/75'}">
      <span class="w-7 h-7">${ic(icn,'',2)}</span>${t(id==='eatin'?'eatIn':'takeAway')}
      ${on?`<span class="w-6 h-6">${ic('check','',3)}</span>`:''}</button>`;
  };
  const cartIssues=validateCart().filter(i=>i.code!=='price-changed'), clashes=cartClashes(), checking=!!S.checking;
  const blocked=cartIssues.length>0||CONN.state!=='online'||CONN.resyncing||checking;
  const lines=S.cart.map(l=>{
    const p=byId(l.pid), na=availabilityService.checkProducts([l.pid]).length>0; let sum=''; try{ sum=lineSummary(l); }catch(e){ sum=''; }
    if(l.reward) return `<div class="flex gap-6 p-5 rounded-[26px] mb-4 line-gift">
      <div class="w-[132px] h-[132px] rounded-[20px] overflow-hidden flex-none">${foodImg(p,'h-full','58px')}</div>
      <div class="flex-1 min-w-0 py-1">
        <div class="flex items-center gap-3"><div class="hd text-[25px] tracking-[.03em]">${p.name}</div><span class="badge b-dea">🎁 ${t('giftLabel')}</span></div>
        <div class="text-[19px] text-mute font-semibold mt-1">${t('giftFixed')}</div>
        <div class="num text-[24px] font-extrabold mt-1">${fmt(0)}</div>
        <button type="button" data-a="delLine" data-lid="${l.lid}" class="press mt-3 h-[56px] px-5 rounded-full bg-card shadow-soft text-[19px] font-bold text-ink/70">${tf('removeA',{name:p.name})}</button>
      </div></div>`;
    if(l.invalid||validateLineStructure(l).length) return `<div class="flex gap-6 p-5 rounded-[26px] mb-4 line-na" role="group" aria-label="${t('lineInvalid')}">
      <div class="flex-1 min-w-0 py-1"><div class="hd text-[25px] tracking-[.03em] line-through text-ink/60">${p?p.name:l.pid}</div>
        <div class="text-[19px] text-ink/80 font-medium mt-1">${t('lineInvalid')}</div>
        <button type="button" data-a="delLine" data-lid="${l.lid}" class="press mt-3 h-[64px] px-6 rounded-full bg-ember text-white text-[20px] font-bold">${t('unavailRemove')}</button></div></div>`;
    if(!na&&lineNeedsChoice(l)) return `<div class="flex gap-6 p-5 rounded-[26px] mb-4 line-need" role="group">
      <div class="w-[132px] h-[132px] rounded-[20px] overflow-hidden flex-none">${foodImg(p,'h-full','58px')}</div>
      <div class="flex-1 min-w-0 py-1"><div class="hd text-[25px] tracking-[.03em]">${p.name}</div>
        <button type="button" data-a="editLine" data-lid="${l.lid}" class="press mt-2 h-[64px] px-6 rounded-full bg-ember text-white text-[20px] font-bold">${tf('needChoice',{label:L(MODS[(p.choice||[]).find(g=>MODS[g].req&&!l.choices[g])].label).toLowerCase()})}</button>
      </div></div>`;
    if(na) return `<div class="flex gap-6 p-5 rounded-[26px] mb-4 line-na" role="group" aria-label="${t('unavailT')}">
      <div class="w-[132px] h-[132px] rounded-[20px] overflow-hidden flex-none opacity-50">${foodImg(p,'h-full','58px')}</div>
      <div class="flex-1 min-w-0 py-1">
        <div class="hd text-[25px] tracking-[.03em] line-through text-ink/60">${p.name}</div>
        <div class="hd text-[20px] tracking-[.06em] text-ember mt-1">${t('unavailT')}</div>
        <div class="text-[19px] text-ink/80 font-medium mt-1">${t('unavailB')}</div>
        <button type="button" data-a="delLine" data-lid="${l.lid}" class="press mt-3 h-[64px] px-6 rounded-full bg-ember text-white text-[20px] font-bold">${t('unavailRemove')}</button>
      </div></div>`;
    if(l.loyalty) return ltyCartLine(l,p,sum);
    return `<div class="flex gap-6 p-5 bg-card rounded-[26px] mb-4 shadow-soft">
      <div class="w-[132px] h-[132px] rounded-[20px] overflow-hidden flex-none">${foodImg(p,'h-full','58px')}</div>
      <div class="flex-1 min-w-0 py-1">
        <div class="hd text-[25px] tracking-[.03em]">${p.name}</div>
        ${sum?`<div class="text-[19px] text-mute font-medium leading-snug clamp2 mt-1">${sum}</div>`:''}
        <div class="flex items-center gap-8 mt-3">
          ${l.lineType==='cross-sell'?`<span class="text-[17px] hd tracking-[.1em] text-mute">${t('priceSide')}</span>`:`<button type="button" data-a="editLine" data-lid="${l.lid}" class="press flex items-center gap-2 text-[20px] font-bold text-ink/70">
            <span class="w-6 h-6">${ic('pencil')}</span>${t('edit')}</button>`}
        </div>
      </div>
      <div class="flex flex-col items-end justify-between py-1">
        <div class="num text-[27px] font-extrabold" id="lp-${l.lid}">${fmt(lineUnit(l)*l.qty)}</div>
        <span id="ls-${l.lid}">${stepper(l.qty,'cartQty',`data-lid="${l.lid}"`,72,{name:p.name})}</span>
      </div>
    </div>`;}).join('');
  return `
  <div class="flex-none flex items-center justify-between px-9 pt-7 pb-4">
    <button type="button" data-a="backMenu" class="press h-[76px] pl-5 pr-8 rounded-full bg-card shadow-soft
      flex items-center gap-2 text-[24px] font-bold"><span class="w-8 h-8">${ic('chevL','',2.4)}</span>${t('menuLbl')}</button>
    <button type="button" data-a="askCancel" class="press h-[76px] px-6 rounded-full text-[20px] font-bold text-mute">${t('cancelOrder')}</button>
  </div>
  <div class="px-10 flex-none">
    <h1 class="hd text-[72px] tracking-[.02em]">${t('yourOrder')}</h1>
    <div class="flex items-center justify-between mt-4">
      <div class="text-[22px] text-mute font-semibold">${cartCount()} ${cartCount()===1?t('item'):t('items')}</div>
      <button type="button" data-a="otype" data-s="${S.service==='eatin'?'takeaway':'eatin'}" class="press h-[64px] px-6 rounded-full bg-card shadow-soft flex items-center gap-3 text-[20px] font-bold" aria-label="${t('svcChangeA')}">
        <span class="w-6 h-6">${ic(S.service==='eatin'?'dish':'bag','',2)}</span>${t(S.service==='eatin'?'eatIn':'takeAway')}<span class="text-mute font-semibold">· ${t('svcChange')}</span></button>
    </div>
  </div>
  <div class="scroller flex-1 px-10 pt-6 pb-8 enter">
    ${S.cart.length?lines:`
      <div class="grid place-items-center text-center pt-24">
        <div class="text-[120px]">🥢</div>
        <div class="hd text-[40px] mt-6">${t('emptyT')}</div>
        <div class="text-[23px] text-mute font-medium mt-2">${t('emptyS')}</div>
        <button type="button" data-a="backMenu" class="press mt-9 h-[92px] px-12 rounded-full bg-jade text-white hd text-[24px] tracking-[.1em]">${t('browse')}</button>
      </div>`}
    ${S.cart.length?`
    <button type="button" data-a="backMenu" class="press w-full h-[96px] rounded-[24px] border-[3px] border-dashed border-ink/25
      flex items-center justify-center gap-3 text-[24px] font-bold text-ink/60 mb-5">
      <span class="w-7 h-7">${ic('plus','',2.6)}</span>${t('addMore')}</button>`:''}
    ${S.cart.length?cmCartHTML():''}
    ${S.cart.length?cartInspireHTML():''}                      <!-- shared CMS block: role cart-inspire -->
  </div>
  ${S.cart.length?`
  <div class="flex-none bg-card shadow-lift px-10 py-7">
    ${cmTotalsHTML()}
    <div class="flex items-baseline justify-between">
      <div class="hd text-[30px] tracking-[.05em]">${t('total')}</div>
      <div class="num text-[46px] font-extrabold" id="cartTot">${fmt(cmDisplayTotal())}</div>
    </div>
    <div class="text-[19px] text-mute font-semibold text-right mt-0.5">${t('inclVat')}</div>
    ${clashes.length?`<div class="rounded-[20px] bg-ember/15 text-ember text-[20px] font-bold p-4 mb-3" role="status">⚠️ ${tf('alCartClash',{names:clashes.join(', ')})}</div>`:''}
    ${blocked?`<div class="text-[20px] ${checking?'text-mute':'text-ember'} font-bold text-right mt-2" role="status">${checking?t('availCheckT')
      :(CONN.state!=='online'||CONN.resyncing?t('blockedConn')
      :(cartIssues.some(i=>i.code.startsWith('unavailable'))?tf('blockedUnavail',{list:[...new Set(S.cart.flatMap(l=>unavailParts(l).map(x=>x.name)))].join(', ')})
      :(cartIssues.some(i=>i.code==='required-choice')?t('blockedChoice')
      :(cartIssues.some(i=>i.code==='loyalty-benefits')?t('cm_calc'):(cartIssues.some(i=>i.code==='loyalty-points')?t('lty_noPts'):(cartIssues.some(i=>i.code==='loyalty-reward')?t('lty_rewardGone'):(cartIssues.some(i=>i.code==='qty')?t('blockedQty'):t('unavailBlock'))))))))}</div>`:''}
    <button type="button" data-a="toPay" ${blocked?'disabled aria-disabled="true"':''} class="press cta w-full h-[112px] mt-5 rounded-full bg-jade text-white
      flex items-center justify-center gap-6">
      <span class="hd text-[28px] tracking-[.12em]">${cmDisplayTotal()===0&&(ltyLines().length||cmShownTotal()>0)?t('lty_placeOrder'):t('goPay')} · <span class="num">${fmt(cmDisplayTotal())}</span></span>
      <span class="w-9 h-9">${ic('arrR','',2.4)}</span>
    </button>
  </div>`:''}`;
};


/* ══════════════════════════════════════════════════════════════
   ORDER TAG (v35) — how the order finds the guest: a table-sign number, a pager number or a name.
   One backend setting: BRAND.orderTag.mode = 'none' | 'pager' | 'table' | 'name'
   (production: window.GuestitConfig.orderTag from the Guestit backend; demo also ?tag=…).
   Asked after "Pay" and before the terminal, so the value is part of the locked, persisted order
   snapshot and reaches the POS / KDS / receipt as snapshot.tag = { type, value }.
   Table signs make no sense for takeaway: there the kiosk falls back to 'none' unless takeawayMode is set.
   ══════════════════════════════════════════════════════════════ */
const TAG_MODES=['none','pager','table','name'];
BRAND.orderTag=Object.assign({ mode:'none', takeawayMode:null, required:true, min:1, max:99, table:null, pager:null, nameMin:2, nameMax:16, nameBlocklist:[] }, BRAND.orderTag||{});
const TAG_DEMO_KEY='guestit.demo.orderTag';
(function(){
  const o=BRAND.orderTag, c=window.GuestitConfig&&window.GuestitConfig.orderTag;
  if(c&&typeof c==='object'&&!Array.isArray(c)) ['mode','takeawayMode','required','min','max','table','pager','nameMin','nameMax','nameBlocklist'].forEach(k=>{ if(Object.prototype.hasOwnProperty.call(c,k)) o[k]=c[k]; });
  if(IS_DEMO&&!Q.get('tag')){ try{ const m=localStorage.getItem(TAG_DEMO_KEY); if(m) o.mode=m; }catch(e){} }   /* demo: choice made in the staff menu (this device) */
  if(IS_DEMO){ if(Q.get('tag')) o.mode=Q.get('tag'); if(Q.has('tagTakeaway')) o.takeawayMode=Q.get('tagTakeaway')||null; if(Q.get('tagOptional')==='1') o.required=false; }
  const int=(v,lo,hi,d)=>{ const n=Number(v); return Number.isInteger(n)&&n>=lo&&n<=hi?n:d; };
  if(!TAG_MODES.includes(o.mode)){ const bad=String(o.mode).slice(0,24); setTimeout(()=>reportClientError({type:'config-order-tag',message:'unknown orderTag.mode: '+bad}),0); o.mode='none'; }   /* reported after boot: the error log is not initialised yet */
  if(o.takeawayMode!=null&&!TAG_MODES.includes(o.takeawayMode)) o.takeawayMode=null;
  o.min=int(o.min,0,9999,1); o.max=int(o.max,1,9999,99); if(o.max<o.min) o.max=o.min;
  o.nameMin=int(o.nameMin,1,10,2); o.nameMax=int(o.nameMax,4,30,16); o.required=o.required!==false;
  const rng=(r,dmin,dmax)=>{ const min=int(r&&r.min!=null?r.min:dmin,0,9999,dmin), max=int(r&&r.max!=null?r.max:dmax,1,9999,dmax); return {min,max:Math.max(min,max)}; };
  o.table=rng(o.table,o.min,o.max); o.pager=rng(o.pager,o.min,o.max);          /* own range per type; top-level min/max = default for both */
  o.nameBlocklist=Array.isArray(o.nameBlocklist)?o.nameBlocklist.filter(w=>typeof w==='string'&&w.trim()&&w.length<=40).slice(0,1000):[];
})();
function tagMode(service){ const o=BRAND.orderTag; service=service||S.service;
  if(service==='takeaway') return o.takeawayMode||(o.mode==='table'?'none':o.mode);
  return o.mode; }
function tagNeeded(){ return tagMode()!=='none'; }
function tagRange(type){ const o=BRAND.orderTag; return o[type]&&Number.isInteger(o[type].max)?o[type]:{min:o.min,max:o.max}; }
/* name filter: built-in list (NL/EN/MK, Latin + Cyrillic) + backend list (orderTag.nameBlocklist).
   Whole words only (no "Scunthorpe" false positives), case/accents/stretched letters ignored ("FUUUCK"). */
const TAG_NAME_BLOCK=['kut','kanker','kankerlijer','tering','tyfus','hoer','hoeren','lul','eikel','klootzak','mongool','neuk','neuken','slet','teef','flikker','kech','pik','pijpen','godverdomme',
  'fuck','fucker','fucking','motherfucker','shit','bitch','cunt','dick','dickhead','cock','pussy','whore','slut','bastard','asshole','arsehole','twat','wanker','retard','faggot','nigger','nigga','penis','vagina','porn','nazi','hitler',
  'пичка','пичко','пизда','курац','курот','курва','педер','шупак','ебам','еби','ебиго','кучка','кретен','мајкоебец',
  'picka','pizda','kurac','kurva','peder','supak','jebem','jebi','kucka','kreten'];
let TAG_BLOCK_SET=null;
function tagNorm(s){ return String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/(\p{L})\1+/gu,'$1'); }
function tagBlocked(v){ if(!TAG_BLOCK_SET) TAG_BLOCK_SET=new Set([...TAG_NAME_BLOCK,...BRAND.orderTag.nameBlocklist].map(tagNorm));
  const parts=String(v||'').split(/[ \-']+/).filter(Boolean).map(tagNorm);
  return parts.some(p=>TAG_BLOCK_SET.has(p))||(parts.length>1&&TAG_BLOCK_SET.has(parts.join(''))); }
function tagEsc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function tagClean(type,v){ v=String(v==null?'':v);
  if(type==='name') return v.replace(/[^\p{L}\p{M} '\-]/gu,'').replace(/\s+/g,' ').replace(/^[ '\-]+/,'').slice(0,BRAND.orderTag.nameMax);
  return v.replace(/\D/g,'').replace(/^0+/,'').slice(0,String(tagRange(type).max).length); }
function tagValid(type,v){ v=String(v||'');
  if(type==='name') return v.replace(/[ '\-]/g,'').length>=BRAND.orderTag.nameMin&&!tagBlocked(v);
  const n=Number(v), r=tagRange(type); return /^\d+$/.test(v)&&n>=r.min&&n<=r.max; }
/* the confirmed tag that travels with the order (null when not asked or skipped) */
function tagSnap(){ const m=tagMode(); return m!=='none'&&S.tag&&S.tag.type===m&&tagValid(m,S.tag.value)?{type:S.tag.type,value:S.tag.value}:null; }
function tagRestore(t){ return t&&['table','pager','name'].includes(t.type)&&typeof t.value==='string'&&t.value.length&&t.value.length<=32?{type:t.type,value:t.value}:null; }
function tagState(){ const o=BRAND.orderTag, type=tagMode()==='none'?'table':tagMode(), v=S.tagDraft||'', ok=tagValid(type,v);
  let hint='', err=false;
  if(type==='name'){ if(!v) hint=t('tag_nameNeed'); else if(tagBlocked(v)){ hint=t('tag_nameBad'); err=true; } else if(!ok){ hint=tf('tag_nameMin',{n:o.nameMin}); err=true; } }
  else { const r=tagRange(type); hint=tf('tag_range',{min:r.min,max:r.max}); const n=Number(v); err=!!v&&!ok&&(n>r.max||v.length>=String(r.max).length); }
  return {type,v,ok,hint,err}; }
function tagValHTML(st){ return st.v?tagEsc(st.v):`<span class="tag-ph">${st.type==='name'?t('tag_namePh'):'—'}</span>`; }
function tagSync(){ const st=tagState(), $=id=>document.getElementById(id);
  const val=$('tagVal'); if(!val) return;
  val.innerHTML=tagValHTML(st); val.classList.toggle('empty',!st.v);
  const f=$('tagField'); if(f) f.classList.toggle('has',!!st.v);
  const h=$('tagHint'); if(h){ h.textContent=st.hint; h.classList.toggle('err',st.err); }
  const go=$('tagGo'); if(go){ const dis=!st.ok||!!S.checking; go.disabled=dis; if(dis) go.setAttribute('aria-disabled','true'); else go.removeAttribute('aria-disabled'); }
  const clr=$('tagClr'); if(clr) clr.hidden=!st.v; }
function tagOpen(){ const type=tagMode();
  S.tagDraft=(S.tag&&S.tag.type===type)?S.tag.value                                  /* confirmed earlier → shown again */
    :(S.tagFor===type&&S.tagDraft)?S.tagDraft                                           /* typed, went back to the cart → kept */
    :((type==='name'&&LOY.member&&LOY.member.firstName)?tagClean('name',LOY.member.firstName):'');   /* smart default: the loyalty member's first name */
  S.tagFor=type;
  S.tagKb=S.lang==='mk'?'cyr':'lat'; NAVDIR='fwd'; S.screen='tag'; render(); track('order_tag_open',{type}); }
const TAG_ILL={
  table:`<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M14 104h92"/><path d="M28 104 52 20h30l20 84"/><path d="M52 20 38 104" opacity=".35"/><text x="68" y="78" text-anchor="middle" class="tag-ill-n" stroke="none">12</text></svg>`,
  pager:`<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><circle cx="56" cy="64" r="40"/><circle cx="56" cy="64" r="22" opacity=".35"/><text x="56" y="74" text-anchor="middle" class="tag-ill-n" stroke="none" style="font-size:28px">7</text><path d="M94 16c7 6 11 13 11 22M84 24c4 4 7 8 7 14" class="tag-ill-a"/></svg>`,
  name:`<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M18 26h84a8 8 0 0 1 8 8v42a8 8 0 0 1-8 8H54l-22 18V84H18a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z"/><text x="60" y="68" text-anchor="middle" class="tag-ill-n" stroke="none" style="font-size:30px">Aa</text></svg>`,
};
const TAG_BKSP=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m11 9 6 6M17 9l-6 6"/></svg>`;
const TAG_KB={ lat:['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'], cyr:['ЉЊЕРТЅУИОПШЃ','АСДФГХЈКЛЧЌЖ','ЗЏЦВБНМ'] };
function tagKeysHTML(type){
  const k=(key,label,cls='',aria='')=>`<button type="button" data-a="tagKey" data-k="${key}" class="press tag-k ${cls}"${aria?` aria-label="${aria}"`:''}>${label}</button>`;
  if(type!=='name') return `<div class="tag-pad" role="group" aria-label="${t('tag_padA')}">${'123456789'.split('').map(d=>k(d,d,'num')).join('')}
    <span aria-hidden="true"></span>${k('0','0','num')}${k('del',TAG_BKSP,'tag-kdel',t('tag_del'))}</div>`;
  const rows=TAG_KB[S.tagKb==='cyr'?'cyr':'lat'];
  return `<div class="tag-kb" role="group" aria-label="${t('tag_kbA')}">
    ${rows.map((r,i)=>`<div class="tag-row">${r.split('').map(ch=>k(ch,ch)).join('')}${i===2?k('del',TAG_BKSP,'tag-kdel w',t('tag_del')):''}</div>`).join('')}
    <div class="tag-row">${k('kb',S.tagKb==='cyr'?'ABC':'АБВ','w',t('tag_kbSwitch'))}${k('-','-')}${k('sp',t('tag_space'),'sp')}</div></div>`; }
SCR.tag=()=>{
  const st=tagState(), o=BRAND.orderTag, total=cmDisplayTotal(), free=total===0&&(ltyLines().length||cmShownTotal()>0);
  const T={table:['tag_tableT','tag_tableS','tag_tableL'],pager:['tag_pagerT','tag_pagerS','tag_pagerL'],name:['tag_nameT','tag_nameS','tag_nameL']}[st.type];
  const dis=!st.ok||!!S.checking;
  return `
  <div class="flex-none flex items-center justify-between px-9 pt-7 pb-4">
    <button type="button" data-a="tagBack" class="press h-[76px] pl-5 pr-8 rounded-full bg-card shadow-soft
      flex items-center gap-2 text-[24px] font-bold"><span class="w-8 h-8">${ic('chevL','',2.4)}</span>${t('yourOrder')}</button>
    <div class="text-[22px] text-mute font-semibold">${cartCount()} ${cartCount()===1?t('item'):t('items')} · <span class="num">${fmt(total)}</span></div>
  </div>
  <div class="scroller flex-1 px-10 tag-wrap">
    <div class="tag-head">
      <div class="tag-ill" aria-hidden="true">${TAG_ILL[st.type]}</div>
      <div class="tag-hx"><h1 class="hd tag-t">${t(T[0])}</h1><p class="tag-s">${t(T[1])}</p></div>
    </div>
    <div id="tagField" class="tag-field${st.v?' has':''}">
      <span class="tag-lbl" id="tagLbl">${t(T[2])}</span>
      <output id="tagVal" class="tag-val ${st.type==='name'?'name':'num'}${st.v?'':' empty'}" aria-labelledby="tagLbl" aria-live="polite">${tagValHTML(st)}</output>
      <button type="button" id="tagClr" data-a="tagKey" data-k="clr" class="press tag-clr" aria-label="${t('tag_clear')}"${st.v?'':' hidden'}>${ic('x','',2.6)}</button>
    </div>
    <div id="tagHint" class="tag-hint${st.err?' err':''}" role="status">${st.hint}</div>
    ${tagKeysHTML(st.type)}
  </div>
  <div class="flex-none bg-card shadow-lift px-10 py-7">
    ${o.required?'':`<button type="button" data-a="tagSkip" class="press tag-skip">${t('tag_skip')}</button>`}
    <button type="button" id="tagGo" data-a="tagGo" ${dis?'disabled aria-disabled="true"':''} class="press cta w-full h-[112px] rounded-full bg-jade text-white
      flex items-center justify-center gap-6">
      <span class="hd text-[28px] tracking-[.12em]">${S.checking?t('availCheckT'):(free?t('lty_placeOrder'):t('tag_go'))} · <span class="num">${fmt(total)}</span></span>
      <span class="w-9 h-9">${ic('arrR','',2.4)}</span></button>
  </div>`;
};
function tagDoneChip(){ const tg=PAY.snapshot&&PAY.snapshot.tag; if(!tg) return '';
  const lbl={table:'tag_tableL',pager:'tag_pagerL',name:'tag_nameL'}[tg.type];
  return `<div class="tagdone tagdone-${tg.type}"><span class="tagdone-i" aria-hidden="true">${TAG_ILL[tg.type]}</span>
    <span class="tagdone-x"><span class="l">${t(lbl)}</span><span class="v">${tagEsc(tg.value)}</span></span></div>`; }
function tagDoneText(){ const tg=PAY.snapshot&&PAY.snapshot.tag; if(!tg) return '';
  return tf({table:'tag_doneTable',pager:'tag_donePager',name:'tag_doneName'}[tg.type],{v:tagEsc(tg.value)}); }

/* ── PAYMENT + SUCCESS ───────────────────────────────────────── */
SCR.pay=()=>{
  if(S.pay==='done') return `
  <div class="flex-1 relative grid place-items-center enter overflow-hidden">
    <img src="${assetStore.url(BRAND.brandGraphic,'brand')}" alt="" class="absolute pointer-events-none"
      style="right:-60px;bottom:-40px;height:620px;opacity:.12;filter:invert(1)" onerror="this.remove()">
    <div class="text-center px-16 relative">
      <div class="w-[190px] h-[190px] rounded-full bg-jade text-white grid place-items-center mx-auto pop">
        <svg viewBox="0 0 24 24" class="w-[96px] h-[96px]" fill="none" stroke="currentColor" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"><path class="checkdraw" d="m5 13 4.5 4.5L19 7.5"/></svg>
      </div>
      <div class="hd text-[58px] tracking-[.02em] mt-9">${t('thanks')}</div>
      ${tagDoneChip()}
      <div class="text-[24px] text-mute font-semibold mt-8">${t('orderNo')}</div>
      <div class="hd text-[170px] leading-none tracking-[.04em] num mt-2">${S.orderNo}</div>
      <p class="text-[26px] font-medium text-ink/80 max-w-[680px] mx-auto mt-9 leading-relaxed">
        ${tagDoneText()||serviceDoneText()}</p>
      <div class="flex justify-center gap-6 flex-wrap mt-6 text-[20px] font-semibold">
        <span class="text-jade">✓ ${PAY.snapshot&&PAY.snapshot.noCharge?t('lty_noCharge'):t('payApproved')}</span>
        <span class="${PAY.accepted?'text-jade':'text-mute'}">${PAY.accepted?'✓ '+t('orderAccepted'):t('orderPending')}</span>
        <span class="${PAY.receipt==='printed'?'text-jade':PAY.receipt==='failed'?'text-ember':'text-mute'}" role="status">${PAY.receipt==='printed'?'✓ '+t('receiptPrinted'):PAY.receipt==='failed'?'⚠ '+t('receiptFailed'):t('receiptPrinting')}</span>
      </div>
      ${ltyDoneLine()}
      <div class="text-[19px] text-mute font-semibold mt-4">${t('refT')}: ${PAY.orderId||'—'}${PAY.txRef?' · '+PAY.txRef:''}</div>
      <button type="button" data-a="newOrder" class="press h-[104px] px-14 mt-12 rounded-full bg-jade text-white hd text-[26px] tracking-[.12em]">${t('newOrder')}</button>
      <div class="text-[20px] text-mute font-semibold mt-6">${t('autoRestart')} <span id="cd" class="num font-extrabold">15</span> s</div>
    </div>
  </div>`;
  const st=PAY.state, amount=PAY.snapshot?PAY.snapshot.total:cartTotal();
  const btn=(a,label,primary=true,extra='')=>`<button type="button" data-a="${a}" ${extra}
      class="press h-[88px] px-10 rounded-full ${primary?'bg-jade text-white hd text-[24px] tracking-[.1em]':'bg-card shadow-soft text-[23px] font-bold'}">${label}</button>`;
  const panel=(icon,title,body,actions,tone='')=>`
  <div class="flex-1 grid place-items-center enter">
    <div class="text-center px-16 max-w-[900px]">
      <div class="w-[150px] h-[150px] rounded-full grid place-items-center mx-auto ${tone||'bg-shade'}"><span class="w-[72px] h-[72px]">${icon}</span></div>
      <div class="hd text-[54px] leading-[1.05] tracking-[.02em] mt-9">${title}</div>
      ${body?`<p class="text-[26px] font-medium text-ink/80 mt-6 leading-relaxed">${body}</p>`:''}
      ${PAY.txRef&&st!=='idle'?`<div class="text-[20px] text-mute font-semibold mt-4">${t('payAttempt')} ${PAY.attempt} · ${PAY.txRef}</div>`:''}
      <div class="flex flex-wrap justify-center gap-4 mt-12">${actions}</div>
    </div></div>`;
  if(st==='status-check') return panel(ic('info','',2),t('statusCheckT'),t('statusCheckB'),'','bg-gold/30');
  if(st==='cancel-requested') return panel(ic('info','',2),t('cancelReqT'),t('cancelReqB'),'','bg-gold/30');
  if(st==='assistance'||PAY.assistSince) return panel(ic('info','',2),t('assistT'),`${t('assistB')}${st==='assistance'?'<br>'+t('assistData'):''}<br><span class="num font-extrabold">${t('payRef')}: ${PAY.recoveryRef||'—'}${PAY.txRef?' · '+PAY.txRef:''}</span>`,
    st==='recovery-required'?btn('paySubmitRetry',t('payRetrySubmit')):(st==='timeout'?btn('payLookup',t('payCheck')):''),'bg-gold/30');
  if(st==='declined') return panel(ic('x','',2.4),t('payDeclinedT'),t('payDeclinedB'),
    btn('payRetry',t('payRetry'))+btn('cancelPay',t('payBack'),false),'bg-ember/15 text-ember');
  if(st==='terminal-offline') return panel(ic('card','',1.8),t('payOfflineT'),t('payOfflineB'),
    btn('payRetry',t('payReconnect'))+btn('cancelPay',t('payBack'),false),'bg-ember/15 text-ember');
  if(st==='timeout') return panel(ic('info','',2),t('payTimeoutT'),t('payTimeoutB'),
    btn('payLookup',t('payCheck')),'bg-gold/30');           /* uncertain: no "back", no retry — status lookup or staff recovery only */
  if(st==='lookup') return panel(ic('info','',2),t('payChecking'),'','','bg-gold/30');
  if(st==='cancelled') return panel(ic('x','',2.4),t('payCancelledT'),t('payDeclinedB'),btn('payRetry',t('payRetry'))+btn('cancelPay',t('payBack'),false));   /* nothing charged: pay again or back to the order */
  if(st==='recovery-required'||st==='order-submit-failed'||(st==='submitting'&&PAY.recoveryRef))
    return panel(ic('check','',2.6),t('payRecoverT'),`${t('payRecoverB')}<br><span class="num font-extrabold">${t('payRef')}: ${PAY.recoveryRef||'—'}</span>`,
      st==='submitting'?'':btn('paySubmitRetry',t('payRetrySubmit')),'bg-jade text-white');
  if(st==='approved'||st==='submitting'||st==='no-charge') return panel(ic('check','',2.6),(PAY.snapshot&&PAY.snapshot.noCharge)?t('lty_sendingT'):t('payApproved'),'','','bg-jade text-white');
  const idleNote=PAY.lastError==='not-charged'?`<p class="text-[22px] font-semibold text-jade mt-6">${t('payNotCharged')}</p>`:'';
  const status=st==='connecting'?t('payConnecting'):st==='processing'?t('payProcessing'):t('followReader');
  return `
  <div class="flex-1 grid place-items-center enter">
    <div class="text-center px-16">
      <div class="hd text-[64px] tracking-[.02em]">${t('payTitle')}</div>
      <div class="num text-[100px] font-extrabold mt-3">${fmt(amount)}</div>
      <div class="ringwrap mx-auto mt-14 ${st==='connecting'?'opacity-50':''}">
        <div class="ring"></div><div class="ring"></div><div class="ring"></div>
        <div class="absolute inset-0 grid place-items-center">
          <div class="w-[120px] h-[120px] rounded-[24px] bg-ink text-cream grid place-items-center cardtap">
            <span class="w-14 h-14">${ic('card','',1.8)}</span></div>
        </div>
      </div>
      <p class="text-[27px] font-medium text-ink/80 max-w-[640px] mx-auto mt-14 leading-relaxed" id="payStatus" aria-live="polite">${status}</p>
      ${idleNote}
      ${st==='idle'?btn('payRetry',t('payRetry'))+' ':''}
      <button type="button" data-a="cancelPay" class="press h-[88px] px-12 mt-12 rounded-full bg-card shadow-soft
        text-[24px] font-bold">${t('cancel')}</button>
    </div>
  </div>`;
};

/* ── OVERLAYS/* ── OVERLAYS (allergen sheet · voucher sheet · confirm) ─────── */
function overlays(){
  let html='';
  if(S.sheet==='voucher'){
    html+=`<div class="absolute inset-0 z-40" style="background:rgb(var(--c-ink)/.45)" data-a="closeSheet">
      <div class="absolute left-0 right-0 bottom-0 bg-paper rounded-t-[36px] p-12 sheetup" data-stop="1" role="dialog" aria-modal="true">
        <div class="w-[72px] h-[6px] rounded-full bg-ink/15 mx-auto mb-9"></div>
        <div class="w-[120px] h-[120px] mx-auto text-ink">${icQR}</div>
        <div class="hd text-[46px] tracking-[.02em] text-center mt-7">${t('voucherT')}</div>
        <p class="text-[24px] text-mute font-medium text-center max-w-[640px] mx-auto mt-4 leading-relaxed">${t('voucherBody')}</p>
        ${IS_DEMO?`<div class="text-center text-[18px] font-bold text-ember mt-3">${t('voucherDemo')}</div>`:''}
        <div class="text-[64px] text-center mt-6 opacity-50">↓</div>
        <button type="button" data-a="closeSheet" class="press w-full h-[96px] mt-6 rounded-full bg-ink text-cream hd text-[24px] tracking-[.1em]">${t('close')}</button>
      </div></div>`;
  } else if(S.sheet==='loyalty'){ html+=ltySheetHTML();
  } else if(S.sheet&&S.sheet!=='price'&&S.sheet!=='alfilter'){
    const p=byId(S.sheet);
    html+=`<div class="absolute inset-0 z-40" style="background:rgb(var(--c-ink)/.45)" data-a="closeSheet">
      <div class="absolute left-0 right-0 bottom-0 bg-paper rounded-t-[36px] p-12 sheetup" data-stop="1" role="dialog" aria-modal="true">
        <div class="w-[72px] h-[6px] rounded-full bg-ink/15 mx-auto mb-9"></div>
        <div class="hd text-[46px] tracking-[.02em]">${t('allergens')}</div>
        <div class="text-[23px] text-mute font-semibold mt-1.5">${p.name} · ${p.kcal} ${t('kcal')} ${t('perServing')}</div>
        ${(()=>{ const A=(S.draft&&S.draft.pid===p.id)?composedAllergens(S.draft):(p.allergens||{contains:[],traces:[],removable:[],unknown:[]});
          const unk=A.unknown||[];
          const chips=(ids,tone)=>ids.length?ids.map(a=>`<span class="h-[64px] px-6 rounded-full ${tone} flex items-center gap-3 text-[21px] font-bold"><span>${ALG_ICON[a]||'•'}</span>${ALG[a]?L(ALG[a]):escText(String(a))}</span>`).join(''):`<span class="text-[20px] text-mute font-semibold">—</span>`;
          const sec=(title,ids,tone,note)=>`<div class="mt-7"><div class="hd text-[24px] tracking-[.08em] mb-3">${title}</div><div class="flex flex-wrap gap-3">${chips(ids,tone)}</div>${note?`<div class="text-[18px] text-mute font-medium mt-2">${note}</div>`:''}</div>`;
          const body=(A.contains.length||A.traces.length)?
            sec(t('alContains'),A.contains,'bg-ember/15 text-ember')+sec(t('alTraces'),A.traces,'bg-gold/25 text-ink')+
            (A.removable.length?sec(t('alRemovable'),A.removable,'bg-card shadow-soft',t('alRemovableNote')):'')
          : `<div class="mt-7 text-[22px] font-semibold text-mute">${alUnknown(p)?t('alUnknown'):t('alNone')}</div>`;
          return `<div class="text-[18px] text-mute font-semibold mt-2">${t('alForOrder')}</div>`+body+(unk.length?`<div class="mt-4 text-[18px] text-ember font-semibold">⚠️ ${t('alUnknown')}: ${unk.join(', ')}</div>`:''); })()}
        <div class="mt-8 rounded-[20px] bg-card shadow-soft p-6 text-[20px] font-medium leading-relaxed text-ink/85">⚠️ ${L(ALLERGEN_POLICY.disclaimer)}</div>
        <button type="button" data-a="closeSheet" class="press w-full h-[96px] mt-10 rounded-full bg-ink text-cream hd text-[24px] tracking-[.1em]">${t('close')}</button>
      </div></div>`;
  }
  if(S.sheet==='alfilter'){ const F=S.allergenFilter||new Set();
    html+=`<div class="absolute inset-0 z-40" style="background:rgb(var(--c-ink)/.45)" data-a="closeSheet">
      <div class="absolute left-0 right-0 bottom-0 bg-paper rounded-t-[36px] p-12 sheetup" data-stop="1" role="dialog" aria-modal="true" aria-label="${t('alFilterT')}">
        <div class="hd text-[46px] tracking-[.02em]">${t('alFilterT')}</div>
        <div class="text-[22px] text-mute font-semibold mt-1.5">${t('alFilterS')}</div>
        <div class="al-grid mt-7">
          ${Object.keys(ALG).map(a=>`<button type="button" data-a="alToggle" data-id="${a}" aria-pressed="${F.has(a)}" class="press optBtn al-chip rounded-[16px] bg-card flex items-center gap-3 text-[21px] font-bold text-left">
            <span class="text-[26px] flex-none" aria-hidden="true">${ALG_ICON[a]||'•'}</span><span class="al-lbl">${L(ALG[a])}</span>
            <span class="al-ck flex-none w-8 h-8 rounded-full grid place-items-center" aria-hidden="true"><span class="w-5 h-5">${ic('check','',3.2)}</span></span></button>`).join('')}
        </div>
        <div class="mt-5 text-[19px] font-semibold text-ink/80">${t('alFilterHint')}</div>
        <div class="mt-4 rounded-[20px] bg-card shadow-soft p-5 text-[19px] font-medium text-ink/85">⚠️ ${t('alFilterNote')}</div>
        <div class="flex flex-wrap gap-4 mt-8">
          <button type="button" data-a="alClear" class="press h-[88px] px-8 rounded-full bg-card shadow-soft text-[22px] font-bold whitespace-nowrap flex-none">${t('alReset')}</button>
          <button type="button" data-a="closeSheet" class="press h-[88px] px-8 rounded-full bg-jade text-white hd text-[24px] tracking-[.1em] whitespace-nowrap flex-1 min-w-[260px]">${t('close')}</button>
        </div>
      </div></div>`; }
  if(S.sheet==='price'&&S.draft){ const p=byId(S.draft.pid);
    html+=`<div class="absolute inset-0 z-40" style="background:rgb(var(--c-ink)/.45)" data-a="closeSheet"></div>
      <div class="absolute left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[40px] px-10 pt-8 sheetup" role="dialog" aria-modal="true" aria-label="${t('priceBreakdown')}"
        style="padding-bottom:calc(28px + env(safe-area-inset-bottom,0px))">
        <div class="flex items-center justify-between"><div class="hd text-[40px] tracking-[.02em]">${t('priceBreakdown')}</div>
          <button type="button" data-a="closeSheet" aria-label="${t('close')}" class="press w-[64px] h-[64px] rounded-full bg-card shadow-soft grid place-items-center"><span class="w-7 h-7">${ic('x','',2.6)}</span></button></div>
        <div id="priceRows" class="mt-4">${priceRows(p,S.draft)}</div>
      </div>`; }
  if(S.confirm==='idle'){ const left=Math.max(0,Math.ceil((idleCfg().inactivityWarningMs-(Date.now()-(IDLE.warnAt||Date.now())))/1000));
    html+=`<div class="absolute inset-0 z-50 grid place-items-center idle-scrim" style="background:rgb(var(--c-ink)/.62)">
      <div class="bg-paper rounded-[36px] p-12 w-[800px] text-center" role="alertdialog" aria-modal="true" aria-labelledby="idleT">
        <div id="idleT" class="hd text-[54px] leading-[1.05] tracking-[.02em]">${t('idleT')}</div>
        <p class="text-[26px] text-ink/80 font-medium mt-5">${tf('idleB',{n:`<span id="idleCd" class="num font-extrabold">${left}</span>`})}</p>
        <div class="grid grid-cols-1 gap-4 mt-10">
          <button type="button" id="idleGo" data-a="idleGo" class="press h-[104px] rounded-full bg-jade text-white hd text-[26px] tracking-[.1em]">${t('idleGo')}</button>
          <button type="button" data-a="idleClear" class="press h-[88px] rounded-full text-[23px] font-bold text-ember"
            style="box-shadow:inset 0 0 0 3px rgb(var(--c-ember)/.55)">${t('idleClear')}</button>
        </div>
      </div></div>`;
  }
  if(S.confirm==='availFail'){
    html+=`<div class="absolute inset-0 z-50 grid place-items-center" style="background:rgb(var(--c-ink)/.5)">
      <div class="bg-paper rounded-[32px] p-12 w-[760px] text-center pop" role="alertdialog" aria-modal="true" aria-labelledby="availFailT">
        <div id="availFailT" class="hd text-[44px] leading-[1.05] tracking-[.02em]">${t('availFailT')}</div>
        <p class="text-[23px] text-mute font-medium mt-3">${t('availFailB')}</p>
        <div class="grid gap-4 mt-10">
          <button type="button" data-a="availRetry" class="press h-[92px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]">${t('connRetry')}</button>
          <button type="button" data-a="availBack" class="press h-[80px] rounded-full text-[22px] font-bold text-ink/70">${t('payBack')}</button>
        </div></div></div>`;
  }
  if(S.confirm==='crash'){
    html+=`<div class="absolute inset-0 z-50 grid place-items-center" style="background:rgb(var(--c-ink)/.6)">
      <div class="bg-paper rounded-[32px] p-12 w-[760px] text-center" role="alertdialog" aria-modal="true" aria-labelledby="crashT">
        <div id="crashT" class="hd text-[48px] tracking-[.02em]">${t('crashT')}</div>
        <p class="text-[24px] text-mute font-medium mt-3">${t('crashB')}</p>
        <button type="button" data-a="crashRestart" class="press mt-10 h-[100px] w-full rounded-full bg-jade text-white hd text-[24px] tracking-[.1em]">${t('crashRestart')}</button>
      </div></div>`;
  }
  if(S.confirm&&S.confirm.type==='priceChanged'){ const ch=S.confirm.changes;
    html+=`<div class="absolute inset-0 z-50 grid place-items-center" style="background:rgb(var(--c-ink)/.5)">
      <div class="bg-paper rounded-[32px] p-12 w-[820px] text-center pop" role="alertdialog" aria-modal="true" aria-labelledby="priceChT">
        <div id="priceChT" class="hd text-[46px] leading-[1.05] tracking-[.02em]">${S.confirm.again?t('priceChangedAgain'):t('priceChangedT')}</div>
        <div class="text-[23px] text-ink/80 font-medium mt-4 text-left">${ch.map(c=>`<p class="py-1">${tf('priceChangedB',{name:c.name,price:fmt(c.now),old:fmt(c.old)})}</p>`).join('')}</div>
        <div class="grid gap-4 mt-10">
          <button type="button" data-a="priceConfirm" class="press h-[92px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]">${t('priceConfirm')} · ${fmt(S.cart.reduce((a,l)=>a+currentPriceOf(l)*l.qty,0))}</button>
          <button type="button" data-a="priceBack" class="press h-[80px] rounded-full text-[22px] font-bold text-ink/70">${t('payBack')}</button>
        </div>
      </div></div>`;
  }
  if(S.confirm&&S.confirm.type==='delLinked'){ const l=line(S.confirm.lid), n=l?xsLinesOf(l.lid).length:0, name=l?byId(l.pid).name:'';
    html+=`<div class="absolute inset-0 z-50 grid place-items-center" style="background:rgb(var(--c-ink)/.5)">
      <div class="bg-paper rounded-[32px] p-12 w-[820px] text-center pop" role="alertdialog" aria-modal="true" aria-labelledby="delLinkedT">
        <div id="delLinkedT" class="hd text-[46px] leading-[1.05] tracking-[.02em]">${t('delLinkedT')}</div>
        <p class="text-[24px] text-mute font-medium mt-3">${tf(n===1?'delLinkedB1':'delLinkedB',{name,n})}</p>
        <div class="grid gap-4 mt-10">
          <button type="button" data-a="delAll" class="press h-[92px] rounded-full bg-ember text-white hd text-[23px] tracking-[.08em]">${t('delAll')}</button>
          <button type="button" data-a="delMainOnly" class="press h-[92px] rounded-full bg-card shadow-soft text-[22px] font-bold">${t('delMainOnly')} · ${t('delKeepSides')}</button>
          <button type="button" data-a="delCancel" class="press h-[80px] rounded-full text-[22px] font-bold text-ink/70">${t('cancel')}</button>
        </div>
      </div></div>`;
  }
  if(S.confirm==='discard'||S.confirm==='discardStep'){ const discardAct=S.confirm==='discardStep'?'discardStep':'discardEdit';
    html+=`<div class="absolute inset-0 z-50 grid place-items-center" style="background:rgb(var(--c-ink)/.5)">
      <div class="bg-paper rounded-[32px] p-12 w-[760px] text-center pop" role="alertdialog" aria-labelledby="discardT">
        <div id="discardT" class="hd text-[48px] tracking-[.02em]">${t('discardT')}</div>
        <p class="text-[24px] text-mute font-medium mt-3">${t('discardB')}</p>
        <div class="grid grid-cols-2 gap-5 mt-10">
          <button type="button" data-a="keepEdit" class="press h-[100px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]">${t('discardKeep')}</button>
          <button type="button" data-a="${discardAct}" class="press h-[100px] rounded-full text-[23px] font-bold text-ember"
            style="box-shadow:inset 0 0 0 3px rgb(var(--c-ember)/.55)">${t('discardYes')}</button>
        </div>
      </div></div>`;
  }
  if(S.confirm==='cancel'){
    html+=`<div class="absolute inset-0 z-50 grid place-items-center" style="background:rgb(var(--c-ink)/.5)">
      <div class="bg-paper rounded-[32px] p-12 w-[760px] text-center pop" role="alertdialog" aria-modal="true">
        <div class="text-[84px]">🥺</div>
        <div class="hd text-[48px] tracking-[.02em] mt-4">${t('cancelQ')}</div>
        <p class="text-[24px] text-mute font-medium mt-3">${t('cancelB')}</p>
        <div class="grid grid-cols-2 gap-5 mt-10">
          <button type="button" data-a="keepOrder" class="press h-[100px] rounded-full bg-jade text-white hd text-[23px] tracking-[.08em]">${t('keepOrder')}</button>
          <button type="button" data-a="confirmCancel" class="press h-[100px] rounded-full text-[23px] font-bold text-ember"
            style="box-shadow:inset 0 0 0 3px rgb(var(--c-ember)/.55)">${t('yesCancel')}</button>
        </div>
      </div></div>`;
  }
  return html;
}

/* ══════════════════════════════════════════════════════════════
   8 · RENDER + ACTIONS
   ══════════════════════════════════════════════════════════════ */
function render({keep=false}={}){
  const app=document.getElementById('app'), ov=document.getElementById('overlay');
  if((S.screen==='product'||S.screen==='customize')&&shellUp()){ pdpRender({keep}); return; }
  const sc={}; app.querySelectorAll('.scroller').forEach((el,i)=>sc[i]=el.scrollTop);
  STAGGER=false; NEXTANIM=false;                               /* v34: no screen cascade */
  const same=S._last===S.screen;
  const dir=(keep||STAGGER==='grid'||same&&S.screen==='menu')?'':' enter-'+NAVDIR;
  app.innerHTML=`<div class="screen-root${dir}">${SCR[S.screen]()}</div>`;
  syncOverlay();
  app.querySelectorAll('.scroller').forEach((el,i)=>{
    if(keep){ if(sc[i]!=null) el.scrollTop=sc[i]; }
    else if(same && i===0 && sc[i]!=null) el.scrollTop=sc[i]; /* keep rail position */ });
  if(S.screen==='home'&&!keep){
    const hsc=app.querySelector('#mainCol .scroller');
    if(hsc) hsc.scrollTop=S._homeScroll;
  }
  NAVDIR='fwd'; BARNEW=false; RAILSPIN=false; S._last=S.screen;
  afterRender();
}
/* ── #pdp overlay engine ──────────────────────────────────────────
   The category shell (#mainCol + rail + basket) stays in the DOM,
   made inert, while #pdp covers it. Closing removes #pdp: no rerender,
   no entrance replay, exact scroll position, basket synced in place. */
let PDP_OPENER=null;
let OVERLAY_OPENER=null;   /* control that opened the current overlay — focus returns here on close */
let LAST_TAP=null;         /* last activated control (set before its action runs) */
const shellUp=()=>!!document.querySelector('#app .screen-root #mainCol');
/* every modal overlay: aria-modal, underlying app inert + scroll-locked, focus on the
   first logical action, focus trapped (Tab cycle), focus restored to the opener on close */
function syncOverlay(){
  const ov=document.getElementById('overlay'), app=document.getElementById('app');
  const hadModal=!!ov.querySelector('[aria-modal="true"]');
  if(!hadModal&&!OVERLAY_OPENER){ const ae=document.activeElement;
    OVERLAY_OPENER=(LAST_TAP&&LAST_TAP.isConnected)?LAST_TAP:((ae&&ae!==document.body&&!ov.contains(ae))?ae:null); }
  ov.innerHTML=overlays();
  const modal=ov.querySelector('[aria-modal="true"]');
  if(modal){ app.setAttribute('inert',''); app.setAttribute('aria-hidden','true');
    const first=modal.querySelector('#idleGo,[data-a="delCancel"],[data-a="keepEdit"],[data-a="keepOrder"],[data-a="paySubmitRetry"],[data-a="payLookup"],button[data-a]:not([data-a="closeSheet"]),button')||modal;
    raf(()=>{ try{ first.focus({preventScroll:true}); }catch(e){} });
  } else { app.removeAttribute('inert'); app.removeAttribute('aria-hidden');
    const o=OVERLAY_OPENER; OVERLAY_OPENER=null; if(!o||!hadModal) return;   /* restore focus only after a modal really closed */
    /* the opener may have been re-rendered: fall back to the same control by data-a / data-lid */
    const same=o.isConnected?o:(o.dataset&&o.dataset.a?document.querySelector(`[data-a="${o.dataset.a}"]${o.dataset.lid?`[data-lid="${o.dataset.lid}"]`:''}`):null);
    if(same&&same.focus){ try{ same.focus({preventScroll:true}); }catch(e){} } }
}
/* Tab never leaves an open modal */
document.addEventListener('keydown',e=>{
  if(e.key!=='Tab') return; const modal=document.querySelector('#overlay [aria-modal="true"]'); if(!modal) return;
  const f=[...modal.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]; if(!f.length) return;
  const i=f.indexOf(document.activeElement);
  if(e.shiftKey&&(i<=0)){ e.preventDefault(); f[f.length-1].focus(); }
  else if(!e.shiftKey&&(i===f.length-1||i<0)){ e.preventDefault(); f[0].focus(); }
});
function shellInert(on){
  const root=document.querySelector('#app .screen-root'); if(!root) return;
  if(on){ root.setAttribute('inert',''); root.setAttribute('aria-hidden','true'); }
  else { root.removeAttribute('inert'); root.removeAttribute('aria-hidden'); }
}
function pdpRender({keep=false,enter=false}={}){
  const app=document.getElementById('app'), old=document.getElementById('pdp');
  const top=keep&&old?(old.querySelector('.scroller')||{}).scrollTop||0:(S._pdpTop||0);
  const html=SCR[S.screen]();
  if(old) old.outerHTML=html; else app.insertAdjacentHTML('beforeend',html);
  const pdp=document.getElementById('pdp'); shellInert(true);
  if(enter) containerOpen(pdp);
  const sc=pdp.querySelector('.scroller'); if(sc&&(keep||S._pdpTop)) sc.scrollTop=top;
  S._pdpTop=0;
  syncOverlay(); afterRender();
}
function openProduct(p,{menu=false,editing=null,draft=null,from=null,opener=null}={}){
  saveHomeScroll(); saveMenuScroll();
  S.pid=p.id; S.from=from||(S.screen==='home'?'home':S.screen==='cart'?'cart':'menu');
  S.draft=draft||newDraft(p,{menu}); S.editing=editing; S.sheet=null; S.confirm=null;
  S.draft._unavailable=availabilityService.checkProducts([p.id]).length>0;      /* cache now, adapter refresh right after */
  S.draft._naParts=unavailParts(S.draft);
  { const sess=ORDER_SESSION, pid=p.id; catalogService.refresh(includedPids(S.draft)).then(()=>{ if(sess!==ORDER_SESSION||!S.draft||S.draft.pid!==pid) return;
      const na=availabilityService.checkProducts([pid]).length>0; const parts=unavailParts(S.draft);
      if(na!==S.draft._unavailable||JSON.stringify(parts)!==JSON.stringify(S.draft._naParts||[])){ S.draft._unavailable=na; S.draft._naParts=parts; if(document.getElementById('pdp')) render({keep:true}); } }); }
  { const xp=experienceFor(p); if(xp.flowType==='visual-upsell') track('upsell_offered',{pid:p.id,menu:!!xp.menuUpgrade,enh:xp.productEnhancements.length,xs:xp.crossSells.length}); }
  S._draft0=cfgKey(S.draft)+'|'+S.draft.qty+'|'+xsKey(S.draft); PDP_OPENER=opener||null;
  const overlay=shellUp();
  S.screen='product';
  if(overlay){ pdpRender({enter:true}); }
  else render();
  { const sess=ORDER_SESSION, focusBack=()=>{ if(sess!==ORDER_SESSION) return; const b=document.getElementById('pdpBack'); if(b&&b.focus) b.focus({preventScroll:true}); };
    if(typeof requestAnimationFrame!=='undefined') requestAnimationFrame(()=>setTimeout(focusBack,0)); else focusBack(); }   /* after the first paint */
}
/* ── card → hero choreography (shared element + staged reveal) ────
   One expressive sequence, compositor-only (transform/opacity):
     0 ms  scrim in · category shell recedes (scale .96, dims)
     0 ms  ghost photo flies card-box → hero-box (expo-out, subtle zoom-out)
    40 ms  panel rises as a rounded bottom sheet
    80 ms  top bar drops in
   200 ms+ content lands line by line (28 px up, 45 ms stagger)
   380 ms  CTA zone settles last
   Close mirrors it faster (380 ms): content dissolves, sheet drops,
   photo flies home, shell comes back.
   WebKit keeps snapping (see IS_WEBKIT); any error degrades to snap.  */
const EXPO='cubic-bezier(.16,1,.3,1)', EXPO_IN='cubic-bezier(.7,0,.84,0)', STD='cubic-bezier(.4,0,.2,1)';
const CT_PARAM=new URLSearchParams(location.search).get('ct');
const IS_WEBKIT=(()=>{ const ua=navigator.userAgent||'';
  const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const safari=/AppleWebKit/.test(ua)&&!/Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser|jsdom/.test(ua);
  return ios||safari; })();
const CT_ON=CT_PARAM==='1'?true:CT_PARAM==='0'?false:!IS_WEBKIT;
const reduceMotion=()=>!CT_ON||BRAND.motion.containerTransform===0
  ||!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const openerImg=(o=PDP_OPENER)=>{ if(!o||!o.isConnected) return null;
  const art=o.closest&&o.closest('article');
  return (art&&art.querySelector('.fimg'))||(o.querySelector&&o.querySelector('.fimg'))||null; };
function appBox(el){                       /* element box in #app (unscaled) coordinates */
  const app=document.getElementById('app'), ar=app.getBoundingClientRect();
  if(!ar.width||!app.offsetWidth) return null;
  const k=ar.width/app.offsetWidth, r=el.getBoundingClientRect();
  if(!r.width||!r.height) return null;
  let rad='0px'; try{ rad=getComputedStyle(el).borderRadius||'0px'; }catch(e){}
  return { x:(r.left-ar.left)/k, y:(r.top-ar.top)/k, w:r.width/k, h:r.height/k, rad };
}
let CT_FROM=null;                          /* card box cached at open (shell is scaled while dimmed) */
function ghostFrom(src,box){
  let fx=document.getElementById('fx');
  if(!fx){ fx=document.createElement('div'); fx.id='fx'; document.getElementById('app').appendChild(fx); }
  const g=src.cloneNode(true); g.classList.add('ghost'); g.removeAttribute('id');
  g.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  g.style.cssText+=`;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;border-radius:${box.rad}`;
  fx.appendChild(g); return g;
}
const setBox=(g,b)=>{ g.style.left=b.x+'px'; g.style.top=b.y+'px'; g.style.width=b.w+'px'; g.style.height=b.h+'px'; g.style.borderRadius=b.rad; };
const imgSrc=el=>{ const i=el&&el.querySelector&&el.querySelector('img'); return i?i.getAttribute('src'):''; };
const sameImg=(a,b)=>imgSrc(a)===imgSrc(b);
const anim=(el,kf,o)=>{ try{ return el&&el.animate?el.animate(kf,o):null; }catch(e){ return null; } };
/* fly a ghost of `src` from box A to box B */
function flyGhost(src,A,B,done,{fade=false,dur=BRAND.motion.containerTransform,ease=EXPO,zoom=1.06}={}){
  const g=ghostFrom(src,B);                 /* laid out at the destination box */
  const inner=g.querySelector('img')||g.querySelector('.femoji');
  const sx=A.w/B.w, sy=A.h/B.h, u0=Math.max(sx,sy)*zoom;   /* cover-correct start, slight zoom-out */
  if(g.animate&&!reduceMotion()){
    g.style.transformOrigin='0 0';
    const kf=[{transform:`translate(${A.x-B.x}px,${A.y-B.y}px) scale(${sx},${sy})`, borderRadius:A.rad},
              {transform:'none', borderRadius:B.rad}];
    if(fade){ kf[0].opacity=1; kf.splice(1,0,{opacity:1,offset:.6}); kf[2].opacity=0; }
    const wrap=g.animate(kf,{duration:dur,easing:ease,fill:'both'});
    if(inner){ inner.style.transformOrigin='0 0';
      const lx=(A.w-u0*B.w)/(2*sx), ly=(A.h-u0*B.h)/(2*sy);
      inner.animate([{transform:`translate(${lx}px,${ly}px) scale(${u0/sx},${u0/sy})`},{transform:'none'}],
        {duration:dur,easing:ease,fill:'both'}); }
    let ended=false; const end=()=>{ if(ended) return; ended=true; g.remove();
      const fx=document.getElementById('fx'); if(fx&&!fx.children.length) fx.remove(); done&&done(); };
    wrap.onfinish=end; wrap.oncancel=end; setTimeout(end,dur+80);
  } else {
    setBox(g,A); g.getBoundingClientRect();
    raf(()=>setBox(g,B));
    setTimeout(()=>{ g.remove(); done&&done(); },reduceMotion()?0:dur);
  }
  return g;
}
const shellRoot=()=>document.querySelector('#app .screen-root');
/* table delivery is only promised when the configuration can actually link the order to the guest */
const serviceDoneText=()=>{ const m=(BRAND.serviceModes||{})[S.service]||{}; return (S.service==='eatin'&&['table-tracker','table-number','staff-procedure'].includes(m.delivery))?t('bringTable'):(S.service==='eatin'?t('pickupCounter'):t('callNo')); };
function revealItems(pdp){                 /* what lands line by line */
  const sc=pdp.querySelector('.scroller'), hero=pdp.querySelector('#pdpHero'); if(!sc) return [];
  const flat=[...sc.children].flatMap(c=>c.classList.contains('vu-colA')||c.classList.contains('vu-colB')?[...c.children]:[c]);
  return flat.flatMap(c=>(hero&&c.contains(hero)&&c!==hero)?[...c.children].filter(x=>!x.contains(hero)):[c]).slice(0,9);
}
function containerOpen(pdp){
  if(reduceMotion()||!pdp.animate) return;      /* snap: no start state, no layers (no WAAPI → snap) */
  if(PERF.low){                                 /* LOW: one compositor-only slide, no layout reads, no ghost, no stagger */
    const sheet=pdp.querySelector('.pdp-sheet'), scrim=pdp.querySelector('.pdp-scrim');
    try{ anim(scrim,[{opacity:0},{opacity:1}],{duration:120,easing:STD,fill:'backwards'});
         anim(sheet,[{transform:'translateY(4%)'},{transform:'none'}],{duration:160,easing:EXPO,fill:'backwards'}); }catch(e){}
    return; }
  try{
    const M=BRAND.motion, D=M.containerTransform, ST=M.contentStagger;
    pdp.classList.add('pdp-enter');
    const hero=pdp.querySelector('#pdpHero'), src=openerImg(), shell=shellRoot();
    const from=src&&appBox(src), to=hero&&appBox(hero);
    CT_FROM=from||null;
    if(pdp.getBoundingClientRect) pdp.getBoundingClientRect();   /* commit start state */
    const sheet=pdp.querySelector('.pdp-sheet'), bar=pdp.querySelector('.pdpBar'), scrim=pdp.querySelector('.pdp-scrim');
    const bottom=sheet&&sheet.lastElementChild, items=revealItems(pdp);
    const sess=ORDER_SESSION;
    raf(()=>{
      pdp.classList.remove('pdp-enter');
      anim(scrim,[{opacity:0},{opacity:1}],{duration:D*.75,easing:STD,fill:'backwards'});
      if(shell){ shell.style.transformOrigin='50% 40%';
        anim(shell,[{transform:'none',opacity:1},{transform:'scale(.96)',opacity:.55}],{duration:D,easing:EXPO,fill:'forwards'}); }
      anim(sheet,[{transform:'translateY(100%)'},{transform:'none'}],{duration:D+40,delay:40,easing:EXPO,fill:'backwards'});
      anim(bar,[{transform:'translateY(-100%)',opacity:0},{transform:'none',opacity:1}],{duration:D*.8,delay:80,easing:EXPO,fill:'backwards'});
      items.forEach((el,i)=>anim(el,[{transform:'translateY(28px)',opacity:0},{transform:'none',opacity:1}],
        {duration:380,delay:200+i*ST,easing:EXPO,fill:'backwards'}));
      anim(bottom,[{transform:'translateY(28px)',opacity:0},{transform:'none',opacity:1}],{duration:360,delay:380,easing:EXPO,fill:'backwards'});
      if(from&&to){
        const same=sameImg(src,hero); if(same) hero.classList.add('pdp-hero-hide');
        flyGhost(src,from,to,()=>hero.classList.remove('pdp-hero-hide'),{fade:!same,dur:D,ease:EXPO});
        setTimeout(()=>{ if(sess===ORDER_SESSION) hero.classList.remove('pdp-hero-hide'); },D+120);
      }
    });
  }catch(e){ recoverTransform(pdp); }
}
function containerClose(pdp,opener,done,hero){
  if(PERF.low&&pdp&&pdp.animate){                /* LOW: fast mirror of the open slide */
    const sheet=pdp.querySelector('.pdp-sheet'); let fin=false; const end=()=>{ if(fin) return; fin=true; done(); };
    try{ const a=sheet&&sheet.animate([{transform:'none',opacity:1},{transform:'translateY(4%)',opacity:0}],{duration:120,easing:STD,fill:'forwards'});
         if(a) a.onfinish=end; else end(); setTimeout(end,200); }catch(e){ end(); }
    return; }
  try{
    const M=BRAND.motion, D=M.containerClose||380;
    hero=hero||pdp.querySelector('#pdpHero');
    const dst=openerImg(opener), shell=shellRoot();
    const from=hero&&appBox(hero), to=CT_FROM||(dst&&appBox(dst)); CT_FROM=null;
    if(reduceMotion()||!pdp.animate){ if(shell){shell.style.transform='';shell.style.opacity='';} done(); return; }
    pdp.classList.add('pdp-closing');
    let fin=false; const finish=()=>{ if(fin) return; fin=true;
      if(shell){ shell.getAnimations&&shell.getAnimations().forEach(a=>a.cancel()); shell.style.transform=''; shell.style.opacity=''; }
      done(); };
    const sheet=pdp.querySelector('.pdp-sheet'), bar=pdp.querySelector('.pdpBar'), scrim=pdp.querySelector('.pdp-scrim');
    if(shell) anim(shell,[{transform:'scale(.96)',opacity:.55},{transform:'none',opacity:1}],{duration:D,easing:EXPO,fill:'forwards'});
    anim(pdp.querySelector('.scroller'),[{opacity:1},{opacity:0}],{duration:D*.4,easing:STD,fill:'forwards'});
    anim(sheet,[{transform:'none'},{transform:'translateY(100%)'}],{duration:D,easing:EXPO_IN,fill:'forwards'});
    anim(bar,[{transform:'none',opacity:1},{transform:'translateY(-100%)',opacity:0}],{duration:D*.7,easing:STD,fill:'forwards'});
    anim(scrim,[{opacity:1},{opacity:0}],{duration:D,delay:D*.2,easing:STD,fill:'forwards'});
    if(from&&to&&dst){ hero.classList.add('pdp-hero-hide');
      flyGhost(hero.querySelector('.fimg')||hero,from,to,finish,{fade:!sameImg(hero,dst),dur:D,ease:EXPO,zoom:1}); }
    setTimeout(finish,D+120);
  }catch(e){ recoverTransform(pdp); done(); }
}
function recoverTransform(pdp){          /* leave the screen in a correct resting state */
  try{
    document.querySelectorAll('#fx .ghost').forEach(g=>g.remove());
    document.querySelectorAll('.pdp-hero-hide').forEach(h=>h.classList.remove('pdp-hero-hide'));
    if(pdp&&pdp.classList) pdp.classList.remove('pdp-enter');
    const sh=shellRoot(); if(sh){ sh.getAnimations&&sh.getAnimations().forEach(a=>a.cancel()); sh.style.transform=''; sh.style.opacity=''; }
  }catch(e){}
}
function closeProduct(){                     /* returns true when closed surgically */
  const pdp=document.getElementById('pdp');
  S.draft=null; S.editing=null; S.sheet=null; S.confirm=null; S._draft0=null; S._pdpTop=0;
  if(pdp&&shellUp()){
    const opener=PDP_OPENER; PDP_OPENER=null;
    shellInert(false);
    S.screen=S.from==='home'?'home':'menu';
    syncOverlay();
    const heroEl=pdp.querySelector('#pdpHero');
    pdp.removeAttribute('id');                       /* a new product may open meanwhile: */
    pdp.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));   /* …so release every id */
    containerClose(pdp,opener,()=>{ pdp.remove();
      if(opener&&opener.isConnected&&opener.focus) opener.focus({preventScroll:true}); },heroEl);
    return true;
  }
  PDP_OPENER=null;
  NAVDIR='back'; S.screen=S.from==='cart'?'cart':(S.from==='home'?'home':'menu'); render();
  return false;
}
const draftDirty=()=>!!(S.draft&&S._draft0&&(cfgKey(S.draft)+'|'+S.draft.qty+'|'+xsKey(S.draft))!==S._draft0);
function saveHomeScroll(){
  if(S.screen!=='home') return;
  const sc=document.querySelector('#mainCol .scroller');
  if(sc) S._homeScroll=sc.scrollTop;
}
function inShell(){ return (S.screen==='menu'||S.screen==='home')
  && !!document.getElementById('mainCol'); }
function syncRail(){
  const homeish=S.screen==='home'||(S.screen==='menu'&&S.cat==='new');
  const hb=document.querySelector('#railNav [data-a="home"]');
  if(hb){ hb.classList.toggle('rowOn',homeish);
    if(homeish) hb.setAttribute('aria-current','true'); else hb.removeAttribute('aria-current'); }
  document.querySelectorAll('#railNav [data-a="cat"]').forEach(b=>{
    const on=S.screen==='menu'&&S.cat!=='new'&&b.dataset.cat===S.cat;
    b.classList.toggle('rowOn',on);
    if(on) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
  });
  positionRailInd(false);
  /* physical carousel tick on the newly active row */
  const act=S.screen==='home'
    ? hb : document.querySelector('#railNav [data-a="cat"][data-cat="'+S.cat+'"]');
  if(act&&!PERF.low){ act.classList.remove('wheel-in'); act.style.animationDelay='0ms';
    if(typeof requestAnimationFrame!=='undefined') requestAnimationFrame(()=>act.classList.add('wheel-in')); else act.classList.add('wheel-in'); }
}
function positionFiltInd(instant){
  const ind=document.getElementById('filtInd'); if(!ind) return;
  const btn=document.querySelector('#filtWrap [data-a="filter"][data-f="'+S.filter+'"]');
  if(instant){ ind.style.transition='none';
    if(typeof requestAnimationFrame!=='undefined') requestAnimationFrame(()=>{ ind.style.transition=''; });
    else ind.style.transition=''; }
  if(btn){ ind.style.opacity='1';
    ind.style.left=btn.offsetLeft+'px'; ind.style.width=btn.offsetWidth+'px'; }
  else ind.style.opacity='0';
}
function positionRailInd(instant){
  const ind=document.getElementById('railInd'); if(!ind) return;
  const btn=(S.screen==='home'||(S.screen==='menu'&&S.cat==='new'))
    ? document.querySelector('#railNav [data-a="home"]')
    : document.querySelector('#railNav [data-a="cat"][data-cat="'+S.cat+'"]');
  if(instant){ ind.style.transition='none';
    if(typeof requestAnimationFrame!=='undefined') requestAnimationFrame(()=>{ ind.style.transition=''; });
    else ind.style.transition=''; }
  if((S.screen==='menu'||S.screen==='home')&&btn){ ind.style.opacity='1';
    /* geometry is read in the next frame, so the click handler never forces a synchronous layout */
    const place=()=>{ ind.style.transform='translateY('+btn.offsetTop+'px)'; ind.style.top='0px'; ind.style.height=btn.offsetHeight+'px'; };
    if(typeof requestAnimationFrame!=='undefined'&&!instant) requestAnimationFrame(place); else place(); }
  else ind.style.opacity='0';
}
function heroFit(){
  const el=document.querySelector('.heroTitle'); if(!el) return;
  el.classList.remove('heroTight');
  if(el.scrollHeight>el.clientHeight+2) el.classList.add('heroTight');
}
/* rail labels: words never break mid-word; a label whose longest word does not fit (e.g. Macedonian "Популарно")
   is tightened once, in the frame after render (no layout read inside a tap) */
const RAIL_FIT={};                                  /* label text + layout mode → '', 'nav-tight' or 'nav-tighter' (measured once) */
const railFitKey=txt=>txt+'|'+(document.body.className.match(/\b(tablet|fluid|kiosk)\b/g)||[]).join('')+'|'+innerWidth;
function fitRailLabels(){ const run=()=>document.querySelectorAll('#railSide .nav-lbl').forEach(l=>{ const k=railFitKey(l.textContent.trim());
    if(k in RAIL_FIT){ l.classList.toggle('nav-tight',RAIL_FIT[k]==='nav-tight'); l.classList.toggle('nav-tighter',RAIL_FIT[k]==='nav-tighter'); return; }
    l.classList.remove('nav-tight','nav-tighter'); let c='';
    if(l.scrollWidth>l.clientWidth+1){ l.classList.add('nav-tight'); c='nav-tight'; if(l.scrollWidth>l.clientWidth+1){ l.classList.replace('nav-tight','nav-tighter'); c='nav-tighter'; } }
    RAIL_FIT[k]=c; });
  run(); }                                            /* ≤12 labels, only on full renders (never on category switches or taps) */
function afterRender(){
  fitRailLabels(); ltyProgramTick(); cmTick();
  if(APP_READY_MS===null&&typeof performance!=='undefined') APP_READY_MS=Math.round(performance.now()-PERF_START+ (PERF_START||0));
  const lg=document.querySelector('.screen-root img[alt="'+BRAND.name+'"]'); if(lg&&!lg.dataset.admin){ lg.dataset.admin='1'; adminTapWire(lg); }
  positionRailInd(true); positionFiltInd(true); heroFit();
  clearInterval(attractTimer); attractTimer=null;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(S.screen==='attract' && BRAND.hero.mode==='slider' && BRAND.hero.images.length>1 && !reduce){
    attractTimer=setInterval(()=>{
      S.heroIdx=(S.heroIdx+1)%Math.max(1,document.querySelectorAll('.heroimg').length);
      document.querySelectorAll('.heroimg').forEach((el,i)=>el.classList.toggle('on',i===S.heroIdx));
    }, BRAND.motion.heroInterval||BRAND.hero.interval||7000);
  }
}

const ACT={
  lang(d){ S.lang=d.lang; setTerm(termMode);
    if(document.getElementById('pdp')&&shellUp()){ const scr=S.screen, sc=document.querySelector('#pdp .scroller'), top=sc?sc.scrollTop:0;
      S.screen=S.from==='home'?'home':'menu'; render(); S.screen=scr; S._pdpTop=top; pdpRender({}); return; }   /* shell + open product both re-rendered in the new language */
    render({keep:true}); },
  startWith(d){ if(!['eatin','takeaway'].includes(d.s)) return; S.service=d.s; RAILSPIN=true; S._homeScroll=0; S.screen='home'; render(); track('order_started',{service:d.s}); },
  home(){
    if(inShell()){
      S.screen='home'; S._last='home';
      STAGGER='grid';
      document.getElementById('mainCol').innerHTML=homeMain();
      STAGGER=false; syncRail();
      const sc=document.querySelector('#mainCol .scroller');
      if(sc) sc.scrollTop=S._homeScroll;
      return;
    }
    S.screen='home'; render(); },
  promo(d,btn){ openProduct(byId(d.pid),{menu:!!d.menu,from:'home',opener:btn}); },
  attract(){ NAVDIR='back'; S.screen='attract'; S.heroIdx=0; render(); },
  otype(d){ S.service=d.s; render({keep:true}); },
  voucher(){ if(!IS_DEMO&&!ADAPTERS.voucher) return; S.sheet='voucher'; render({keep:true}); },
  cat(d){
    saveHomeScroll();
    if(inShell()){
      S.screen='menu'; S._last='menu'; S.cat=d.cat; S.filter='all';
      STAGGER='grid';
      document.getElementById('mainCol').innerHTML=menuMain();
      STAGGER=false; syncRail(); return;
    }
    S.screen='menu'; S.cat=d.cat; S.filter='all'; render(); },
  filter(d){
    S.filter=d.f;
    const gw=document.getElementById('gridWrap');
    if(gw){
      STAGGER='grid'; gw.innerHTML=menuGrid(); STAGGER=false;
      document.querySelectorAll('#filtWrap [data-a="filter"]').forEach(b=>{
        const on=b.dataset.f===S.filter;
        b.setAttribute('aria-pressed',on);
        b.classList.toggle('text-white',on);
        b.classList.toggle('bg-card',!on); b.classList.toggle('text-ink/75',!on);
        b.classList.toggle('shadow-soft',!on);
      });
      positionFiltInd(false);
      return;
    }
    render(); },
  gtcOpen(d,btn){ const p=byId(d.pid); if(!p) return; if(obLocked()){ obLockNote(); return; } gtcExpand(p.id); },
  /* stepper "+": wide → +1 of the open size; otherwise +1 of the LAST line (repeat last configuration, incLast) */
  cardInc(d,btn){ const p=byId(d.pid); if(!p) return; if(obLocked()){ obLockNote(); return; } if(obBlocked(p)) return; gtcArm(p.id);
    const wide=d.w==='1', l=obLine(p,wide);
    if(l){ if(l.qty>=MAX_LINE_QTY) return; l.qty=clampQty(l.qty+1); syncReward(); basketSync();
      if(!wide&&obNeedsDetail(p)){ const s=lineSummary(l); obToast(s?tf('obPlus1',{name:p.name,opts:s}):tf('obPlus1n',{name:p.name})); }
      return; }
    if(wide&&obVarCard(p)){ ACT.obVar({pid:p.id,ix:String(cardServing(p.id))},btn); return; }
    if(obNeedsDetail(p)){ GTC.key=null; clearTimeout(GTC.timer); openProduct(p,{opener:btn}); return; }
    ACT.quickAdd(d,btn); },
  /* stepper "−": lowers the same line; at 1 it is the trash can and removes the line */
  cardDec(d,btn){ const p=byId(d.pid); if(!p) return; if(obLocked()){ obLockNote(); return; } gtcArm(p.id);
    const wide=d.w==='1', l=obLine(p,wide); if(!l) return;
    if(l.qty>1){ l.qty--; syncReward(); basketSync(); return; }
    if(obQty(p,wide)<=l.qty){ GTC.key=null; clearTimeout(GTC.timer); }
    ACT.delLine({lid:l.lid},btn); },
  /* wide card: a tap on a size ADDS that size (+1), then the stepper for that size opens over the row */
  obVar(d,btn){ const p=byId(d.pid); if(!p) return; if(obLocked()){ obLockNote(); return; } if(obBlocked(p)||!obVarCard(p)) return;
    const sv=obSizes(p), ix=+d.ix; if(!(ix>=0&&ix<sv.length)) return;
    const k=p.id+':'+ix, now=Date.now(); if(QLOCK[k]&&now-QLOCK[k]<BRAND.motion.quickAddLock) return; QLOCK[k]=now;
    if(GTC.key===p.id&&cardServing(p.id)!==ix){ GTC.key=null; clearTimeout(GTC.timer); }
    SERVING_SEL[p.id]=ix;
    { const dr=newDraft(p); dr.serving=ix; addToCart(dr); } S.lastAdd=p.id;
    const msg=tf('obAdded',{name:`${p.name} (${L(sv[ix].short)})`});
    if(S.screen==='cart') render({keep:true}); else basketSync();
    gtcExpand(p.id); obToast(msg); track('variant_add',{pid:p.id,serving:ix}); },
  pickServing(d,btn){ const p=byId(d.pid); if(!servingsOf(p)) return;
    const ix=+d.ix;
    if(d.ctx==='pdp'&&S.draft&&S.draft.pid===p.id){ S.draft.serving=ix;
      const g=document.getElementById('grp-serving');
      if(g){ g.querySelectorAll('[data-a="pickServing"]').forEach(b=>{ const on=+b.dataset.ix===ix; b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); });
        updTotals(); return; }
      render({keep:true}); return; }
    SERVING_SEL[p.id]=ix; if(GTC.key===p.id){ GTC.key=null; clearTimeout(GTC.timer); }   /* switching variant closes its stepper */
    const wrap=btn&&btn.closest('article'); if(wrap){                  /* in place: segments + control, no rerender */
      wrap.querySelectorAll('[data-a="pickServing"]').forEach(b=>{ const on=+b.dataset.ix===ix;
        b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); });
      const ctl=wrap.querySelector('.card-ctl'); if(ctl){ ctl.innerHTML=cardCtl(p,+ctl.dataset.ctlSize||undefined); ctl.classList.remove('open'); }
      const pr=wrap.querySelector('.num.text-\\[21px\\], .num.text-\\[20px\\]'); if(pr) pr.textContent=fmt(cardPrice(p));
      return; }
    render({keep:true}); },
  quickAdd(d,btn){ const p=byId(d.pid); if(!p) return;
    if(obLocked()){ obLockNote(); return; }                                    /* a checkout in progress locks the cart */
    if(obBlocked(p)) return;                                                   /* unavailable / not in the guest's filter */
    const now=Date.now();
    if(QLOCK[p.id] && now-QLOCK[p.id]<BRAND.motion.quickAddLock) return;  /* double-tap lock */
    QLOCK[p.id]=now;
    if(obNeedsDetail(p)){ openProduct(p,{opener:btn}); return; }               /* safety rule: needs a choice → detail, never a silent add */
    { const dr=newDraft(p); if(servingsOf(p)) dr.serving=cardServing(p.id); addToCart(dr); } S.lastAdd=p.id;
    const msg=tf('obAdded',{name:p.name});
    if(S.screen==='cart'){ render({keep:true}); gtcExpand(p.id); obToast(msg); return; }
    basketSync(); gtcExpand(p.id); obToast(msg); },                         /* R44: add 1, then the stepper opens */
  prod(d,btn){ openProduct(byId(d.pid),{from:d.from,opener:btn}); },
  mealTile(d,btn){ openProduct(byId('ddbowl'),{menu:true,opener:btn}); },
  pickDrink(d){ S.draft.drink=d.id; if(document.getElementById('vuDrinks')){ refreshDrinks(); updTotals(); return; }
    if(document.getElementById('pdp')){ updDrinkUI(); updTotals(); return; }
    render({keep:true}); },
  vuMenu(){ const d=S.draft; d.menu=!d.menu;
    const wrap=document.getElementById('vuMenuWrap'); const p=byId(S.pid), xp=experienceFor(p);
    if(!wrap||!xp.menuUpgrade){ render({keep:true}); return; }
    wrap.outerHTML=BRAND.pdpR44!==false?r44MenuWrap(p,d,xp):vuMenuBlock(p,d,xp.menuUpgrade,xp.premiumDrinks);   /* banner ↔ compact summary + drink selector */
    /* conflict rule: a previously selected cross-sell that the menu already includes → ask, never drop silently */
    d._xsAsk=null; if(!d.menu) (d.crossSells||[]).forEach(x=>x.extraPortion=false);   /* portions only exist relative to a menu */
    if(d.menu){ const c=(UPSELL_CMS.menuUpgrade.conflictsWithCrossSells||[]).find(id=>xsSelected(d,id)&&!xsPortion(d,id)); if(c) d._xsAsk=c; }
    refreshXs(); updTotals(); },
  xsKeep(d){ const dr=S.draft; xsSet(dr,d.id,{extraPortion:true}); dr._xsAsk=null; refreshXs(); updTotals(); },
  xsDrop(d){ const dr=S.draft; xsRemove(dr,d.id); dr._xsAsk=null; refreshXs(); updTotals(); },
  openPrice(){ S.sheet='price'; syncOverlay(); },
  fixDrink(){ const el=document.getElementById('vuDrinks'); if(el&&el.scrollIntoView) el.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'center'}); },
  fixXs(d){ const dr=S.draft; xsRemove(dr,d.id); dr._naParts=unavailParts(dr); dr._unavailable=availabilityService.checkProducts([dr.pid]).length>0; render({keep:true}); },
  fixMenu(){ const dr=S.draft; dr.menu=false; dr._naParts=unavailParts(dr); render({keep:true}); },
  openAlFilter(){ S.sheet='alfilter'; syncOverlay(); },
  alToggle(d,btn){ S.allergenFilter=S.allergenFilter||new Set(); if(S.allergenFilter.has(d.id)) S.allergenFilter.delete(d.id); else S.allergenFilter.add(d.id);
    if(btn){ btn.setAttribute('aria-pressed',S.allergenFilter.has(d.id)); btn.classList.toggle('on',S.allergenFilter.has(d.id)); } },
  alClear(){ S.allergenFilter=new Set(); syncOverlay(); const b=document.querySelector('[data-a="openAlFilter"]'); if(b) b.outerHTML=alFilterBtn(); },
  exQty(d,btn,ev){ const dr=S.draft, v=cmsById(d.id); if(!v) return; const g=ROLE_GROUP[v.role]; if(!g) return;
    exSet(dr,g,v.id,exQty(dr,g,v.id)+ +d.d);
    refreshEnh(); updTotals(); },
  vux(d,btn){ const dr=S.draft, v=cmsById(d.id); if(!v) return;
    let on;
    if(v.role==='cross-sell'){ const was=xsSelected(dr,d.id);
      if(was) xsRemove(dr,d.id); else xsSet(dr,d.id,{quantity:1,extraPortion:xsConflicts(v,dr)});   /* unique id, explicit quantity; added while the menu is on → extra portion */
      on=!was;
      if(btn&&btn.classList){ btn.classList.toggle('vu-on',on); btn.setAttribute('aria-pressed',on); }
      if(xsConflicts(v,dr)) refreshXs();                        /* label may change (extra portion) */
      updTotals(); return; }
    const g=ROLE_GROUP[v.role]; if(!g) return;
    exSet(dr,g,d.id,exQty(dr,g,d.id)>0?0:1);
    refreshEnh(); updTotals(); },
  r44ExToggle(){ const d=S.draft; if(!d) return; d._more=d._more||{}; d._more.enhOpen=!d._more.enhOpen;
    const sec=document.getElementById('vuX'); if(!sec){ render({keep:true}); return; }
    sec.classList.toggle('open',d._more.enhOpen); const body=document.getElementById('vuXBody'); if(body) body.hidden=!d._more.enhOpen;
    const h=sec.querySelector('.r44-exh'); if(h) h.setAttribute('aria-expanded',String(d._more.enhOpen)); },
  vuMore(d){ S.draft._more=S.draft._more||{}; S.draft._more[d.sec]=!S.draft._more[d.sec];
    const p=byId(S.pid), xp=experienceFor(p), dr=S.draft;
    const sec=document.getElementById(d.sec==='enh'?'vuX':'xsX'); if(!sec){ render({keep:true}); return; }
    sec.outerHTML=(d.sec==='enh'&&sec.classList.contains('r44-exs'))?r44EnhSection(p,xp,dr):d.sec==='enh'
      ? vuSection('vuX',L(xp.sectionEnh.title),xp.productEnhancements,xp.allEnhancements,dr,xp.upsellSettings.showAllEnhancementsAction,'enh')
      : xsSection(dr,xp); },
  choice(d){ S.draft.choices[d.g]=d.id;
    if(document.getElementById('pdp')){ updChoiceUI(d.g); updTotals(); return; }
    render({keep:true}); },
  cfgIncomplete(){ if(S.draft&&!draftValid(S.draft)) nudgeRequired(); },
  mod(d,btn){ const arr=d.k==='extra'?S.draft.extras:S.draft.removes;
    const i=arr.findIndex(([g,id])=>g===d.g&&id===d.id);
    if(i>=0) arr.splice(i,1); else arr.push([d.g,d.id]);
    if(btn&&S.screen==='customize'){                       /* in-place: row + dock, no rerender, no scroll jump */
      btn.classList.toggle('row-on',i<0); btn.setAttribute('aria-pressed',String(i<0));
      const pr=btn.querySelector('.num'); if(pr){ pr.classList.toggle('text-jade',i<0); pr.classList.toggle('text-mute',!(i<0)); }
      refreshStepDock(); return; }
    render({keep:true}); },
  draftQty(d){ S.draft.qty=clampQty(S.draft.qty+ +d.d);
    if(document.getElementById('cfgQty')){ xfadeVal('cfgQty',String(S.draft.qty)); updTotals();
      const w=document.querySelector('.pdp-stp'); if(w){ const [mn,pl]=w.querySelectorAll('.gt-stp-b');   /* limits stay visible in place */
        mn.classList.toggle('off',S.draft.qty<=1); pl.classList.toggle('off',S.draft.qty>=MAX_LINE_QTY);
        mn.toggleAttribute('aria-disabled',S.draft.qty<=1); pl.toggleAttribute('aria-disabled',S.draft.qty>=MAX_LINE_QTY); }
      return; }
    render({keep:true}); },
  openCustomize(){ S._stepBusy=false; const sc=document.querySelector('#pdp .scroller'); S._pdpTop=sc?sc.scrollTop:0;
    S._pdpProdTop=S._pdpTop; S._pdpTop=0;
    S._custom0=stepKey(S.draft);                                                    /* independent baseline of the choices */
    S._customRestore=JSON.parse(JSON.stringify([S.draft.extras,S.draft.removes]));   /* deep copy: editing can never mutate it */
    S.screen='customize'; render(); },
  confirmCustomize(){ if(S.screen!=='customize'||S._stepBusy) return;
    S._stepBusy=true;   /* the step keeps its own choices; required product choices are enforced on the product screen */                                                                /* rapid repeated taps cannot run this twice */
    S._custom0=null; S._customRestore=null; S._pdpTop=S._pdpProdTop||0; S.screen='product'; render();
    setTimeout(()=>{ S._stepBusy=false; },BRAND.motion.quickAddLock); },
  backProduct(){
    if(S.screen==='customize'){
      if(stepDirty()){ S.confirm='discardStep'; syncOverlay(); return; }             /* back never saves */
      S._custom0=null; S._customRestore=null; S._pdpTop=S._pdpProdTop||0; S.screen='product'; render(); return; }
    if(draftDirty()){ S.confirm='discard'; syncOverlay(); return; }
    closeProduct(); },
  keepEdit(){ S.confirm=null; syncOverlay(); },
  discardStep(){ const [e,r]=S._customRestore||[[],[]];                             /* restore exactly the state the step opened with */
    S.draft.extras=JSON.parse(JSON.stringify(e)); S.draft.removes=JSON.parse(JSON.stringify(r));
    S._custom0=null; S._customRestore=null; S.confirm=null; syncOverlay(); S._pdpTop=S._pdpProdTop||0; S.screen='product'; render(); },
  discardEdit(){ S.confirm=null; closeProduct(); },
  openSheet(){ S.sheet=S.pid; if(document.getElementById('pdp')) syncOverlay(); else render({keep:true}); },
  closeSheet(){ const wasFilter=S.sheet==='alfilter'; S.sheet=null; if(document.getElementById('pdp')&&!wasFilter) syncOverlay(); else render({keep:true}); },
  addOrder(){
    const p=byId(S.pid), d=S.draft; if(!d) return;
    if(!draftValid(d)){ nudgeRequired(); return; }
    if(validateDraft(d).some(i=>i.code.startsWith('unavailable'))){ d._unavailable=true; render({keep:true}); return; }   /* main, included side/drink and cross-sells checked at confirmation */
    delete d._more; delete d._xsAsk;
    if(S.editing){ const l=line(S.editing);
      const {crossSells,...main}=d;
      Object.assign(l,{...main, key:l.reward?'RW':cfgKey(main), unitPrice:l.reward?0:unitPrice(main), mergeable:false});   /* an edited group is configured by definition */
      syncReward();                                                    /* entitlement is recalculated after every product change */
      syncCrossSells(d,l);                                   /* add new / drop deselected — never touches untouched lines */
      S.editing=null; S.draft=null; S._draft0=null; S.from='cart'; closeProduct(); return; }
    const src=addToCart(d); S.lastAdd=p.id; track(S.editing?'product_changed':'product_added',{pid:p.id,lid:src.lid,menu:!!d.menu,xs:(d.crossSells||[]).length});
    if(d.menu) track('upsell_accepted',{role:'menu-upgrade',pid:p.id,lid:src.lid}); (d.crossSells||[]).forEach(x=>track('upsell_accepted',{role:'cross-sell',id:x.id,lid:src.lid}));
    (d.crossSells||[]).forEach(sel=>{ const v=cmsById(sel.id); if(v) addCrossSellLine(v,src,sel); });
    if(closeProduct()){ basketSync({note:true}); return; }   /* shell untouched, basket synced (reward evaluated inside) */
    syncReward();
    /* fallback (no shell beneath): rebuild the category calmly */
    BARNEW=S.cart.length===1; S.screen='menu'; S.cat=p.cat;
    NAVDIR='back'; NEXTANIM=false; render();
    if(S._scroll&&S._scroll.cat===S.cat){ const sc=document.querySelector('#mainCol .scroller'); if(sc) sc.scrollTop=S._scroll.top; }
    showAddNote();
  },
  viewOrder(){ S.screen='cart'; render(); },
  backMenu(){ NAVDIR='back'; S.screen='menu'; render(); },
  cartQty(d,btn){ const l=line(d.lid); if(!l||l.reward||l.loyalty) return;      /* the gift has no stepper */
    const next=l.qty+ +d.d;
    if(next<=0){ ACT.delLine(d,btn); return; }                        /* quantity → 0 follows the linked-line policy */
    if(next>MAX_LINE_QTY) return;                                     /* never let the guest pick an invalid quantity */
    l.qty=clampQty(next);
    const hadGift=S.cart.some(x=>x.reward); syncReward(); const hasGift=S.cart.some(x=>x.reward);
    const lp=document.getElementById('lp-'+l.lid), ls=document.getElementById('ls-'+l.lid), tot=document.getElementById('cartTot');
    if(hadGift===hasGift&&lp&&ls&&tot&&!validateCart().length){            /* surgical: price, stepper, total — no screen rebuild */
      lp.textContent=fmt(lineUnit(l)*l.qty); ls.innerHTML=stepper(l.qty,'cartQty',`data-lid="${l.lid}"`,72,{name:(byId(l.pid)||{}).name});
      tot.textContent=fmt(cmDisplayTotal()); return; }
    render({keep:true}); },
  delLine(d,btn){ const l=line(d.lid); if(!l) return;
    if(l.reward){ S.cart=S.cart.filter(x=>x!==l); S.rewardDismissed=true; render({keep:true}); return; }   /* guest removes the gift → not re-added this order */
    if(l.lineType==='product'&&hasLinked(l.lid)){ S.confirm={type:'delLinked',lid:l.lid}; OVERLAY_OPENER=btn||null; syncOverlay(); return; }
    removeLine(l.lid); syncReward(); render({keep:true}); },
  delAll(d){ const lid=S.confirm&&S.confirm.lid; S.confirm=null; if(lid) removeLine(lid,{withLinked:true}); syncReward(); render({keep:true}); },
  delMainOnly(d){ const lid=S.confirm&&S.confirm.lid; S.confirm=null; if(lid) removeLine(lid,{unlink:true}); syncReward(); render({keep:true}); },
  delCancel(){ S.confirm=null; syncOverlay(); },
  editLine(d,btn){ const l=line(d.lid); if(!l||l.reward||l.loyalty) return;   /* the gift is fixed */
    openProduct(byId(l.pid),{editing:l.lid,from:'cart',opener:btn,
      draft:{pid:l.pid, qty:l.qty, menu:l.menu, drink:l.drink, reward:!!l.reward, serving:l.serving,   /* v34 defect A: the editor opens with the line's own size */
        choices:{...l.choices}, extras:l.extras.map(x=>[...x]), removes:l.removes.map(x=>[...x]), extraQty:{...(l.extraQty||{})},
        crossSells:xsLinesOf(l.lid).map(x=>({id:x.xsId,quantity:x.qty,extraPortion:!!x.extraPortion}))}}); },
  askCancel(){ S.confirm='cancel'; syncOverlay(); },
  keepOrder(){ S.confirm=null; syncOverlay(); },
  confirmCancel(){ S.confirm=null; track('order_abandoned',{reason:'cancel',items:cartCount()}); newOrderReset(); },
  async toPay(d,btn){ clearTimeout(noteTimer);
    if(CONN.state!=='online'||CONN.resyncing){ connBanner(); render({keep:true}); return; }   /* registration cannot be verified → no payment */
    if(PAY_ACTIVE.has(PAY.state)||PAY_UNCERTAIN.has(PAY.state)||S._paying) return;
    if(validateCart().some(i=>i.code!=='price-changed')){ render({keep:true}); return; }   /* blocked cart → no async start at all */
    if(S.screen==='cart'&&tagNeeded()){ tagOpen(); return; }                       /* v35: table sign / pager / name before the terminal */
    S._paying=true; const sess=ORDER_SESSION, sig=JSON.stringify(S.cart.map(l=>[l.lid,l.qty,l.unitPrice]));
    try{
      S.checking=true; render({keep:true});
      const ok=await catalogService.refresh();                                       /* REAL adapter check before every payment start */
      if(sess!==ORDER_SESSION) return;
      S.checking=false;
      if(sig!==JSON.stringify(S.cart.map(l=>[l.lid,l.qty,l.unitPrice]))){ render({keep:true}); return; }   /* cart changed while checking → the guest must tap again */
      if(!ok){ S.confirm='availFail'; syncOverlay(); return; }
      if(validateCart().some(i=>i.code!=='price-changed')){ render({keep:true}); return; }
      const changes=revalidatePrices();
      if(changes.length){ S.confirm={type:'priceChanged',changes,shown:priceStamp(changes)}; OVERLAY_OPENER=btn||null; render({keep:true}); return; }
      S.screen='pay'; S.pay='terminal'; render(); payOrSubmit();
    } finally { S._paying=false; S.checking=false; }
  },
  availRetry(){ S.confirm=null; syncOverlay(); ACT.toPay(); },
  availBack(){ S.confirm=null; syncOverlay(); },
  priceConfirm(){
    const conf=S.confirm; if(!conf||conf.type!=='priceChanged') return;
    const now=revalidatePrices();
    if(priceStamp(now)!==conf.shown){                                  /* prices moved between showing and confirming */
      S.confirm=now.length?{type:'priceChanged',changes:now,shown:priceStamp(now),again:true}:null;
      syncOverlay(); if(!S.confirm) ACT.toPay(); return; }
    applyRevalidatedPrices(); S.confirm=null; syncOverlay(); S.screen='pay'; S.pay='terminal'; render(); payOrSubmit(); },
  priceBack(){ S.confirm=null; syncOverlay(); },
  payRetry(){ if(canRetryPayment()){ PAY.state='idle'; payStart(); } },
  payLookup(){ payLookup(); },
  paySubmitRetry(){ if(PAY.state==='recovery-required') submitOrder(); },
  cancelPay(){ if(PAY_UNCERTAIN.has(PAY.state)) return;                  /* the card may have been charged: only status lookup or staff recovery */
    if(['connecting','waiting-for-card'].includes(PAY.state)){ payCancel(); return; }   /* → cancel-requested: stays on the pay screen until the provider confirms */
    if(['declined','cancelled','terminal-offline','idle'].includes(PAY.state)){ PAY.state='idle'; PAY.snapshot=null; persistClear(); NAVDIR='back'; S.screen='cart'; render(); } },
  idleGo(){ idleContinue(); },
  crashRestart(){ S.confirm=null; newOrderReset(); },
  idleClear(){ IDLE.warnAt=null; S.confirm=null; track('order_abandoned',{reason:'idle-clear',items:cartCount()}); newOrderReset(); },
  newOrder(){ if(PAY.state==='done'||PAY.state==='idle') newOrderReset(); },
};

/* ── central error reporting boundary ──────────────────────────
   reportClientError(ctx) is the adapter the Kotlin shell / monitoring will
   implement; the prototype keeps a ring buffer and logs to the console.
   Fatal (uncaught) errors: before payment → safe restart offer; during an
   uncertain or approved payment → protected recovery; after approval the
   snapshot and recovery reference are always preserved.                 */
const APP_VERSION='kiosk-html-2026.09.16'; const ERROR_LOG=[];
/* identifies THIS running page; a crash or reload produces a new one, so an unpaid cart is not inherited */
const TAB_ID=(()=>{ try{ let t=sessionStorage.getItem('guestit.tabId'); if(!t){ t='T'+Math.random().toString(36).slice(2,10); sessionStorage.setItem('guestit.tabId',t); } return t; }catch(e){ return 'T0'; } })();
/* ── measurement events: local buffer only; NOT a working analytics backend unless an adapter is injected.
   No card data, no personal data. Retries are deduplicated by (event, key).                             */
const ANALYTICS={ buffer:[], seen:new Set() };
function track(event,props={}){
  if(!(BRAND.analytics&&BRAND.analytics.enabled)) return;
  const key=event+'|'+(props.attemptId||props.orderId||props.lid||props.id||'')+'|'+(props.state||'');
  if(props.attemptId||props.orderId||props.state){ if(ANALYTICS.seen.has(key)) return; ANALYTICS.seen.add(key); }
  const e={ event, at:Date.now(), session:ORDER_SESSION, device:DEVICE_ID, mode:APP_MODE, lang:S.lang, service:S.service, ...props };
  try{ if(LOY.sessionId&&!e.loyaltySession) e.loyaltySession=LOY.sessionId; }catch(_){}   /* pseudonymous: lets the backend link behaviour to the member session */
  ANALYTICS.buffer.push(e); if(ANALYTICS.buffer.length>200) ANALYTICS.buffer.shift();
  const a=ADAPTERS.analytics; if(a&&a.send){ try{ Promise.resolve(a.send([e])).catch(()=>{}); }catch(err){} }
}
function errorContext(err){
  return { timestamp:new Date().toISOString(), appVersion:APP_VERSION, orderSessionId:ORDER_SESSION, screen:S.screen, productId:S.pid,
    cartLineIds:S.cart.map(l=>l.lid), paymentState:PAY.state, paymentAttemptId:PAY.attemptId, transactionReference:PAY.txRef,
    recoveryReference:PAY.recoveryRef, errorType:(err&&err.type)||(err&&err.name)||'Error', message:String(err&&err.message||err),
    stack:err&&err.stack?String(err.stack).slice(0,1200):null, online:navigator.onLine!==false, layoutMode:MODE, lang:S.lang };
}
function reportClientError(err){ const ctx=errorContext(err||{}); ERROR_LOG.push(ctx); if(ERROR_LOG.length>50) ERROR_LOG.shift();
  try{ console.error('[kiosk-error]',ctx); }catch(e){} return ctx; }
function onFatal(err){
  reportClientError(err); try{ recoverTransform(document.getElementById('pdp')); }catch(e){}
  if(paymentMayHaveSucceeded()){ if(PAY.snapshot) persistPaid(PAY.state); if(S.screen!=='pay'){ S.screen='pay'; try{ render(); }catch(e){} } return; }
  if(S.screen!=='attract'&&S.confirm!=='crash'){ S.confirm='crash'; try{ syncOverlay(); }catch(e){} }
}
window.addEventListener('error',e=>onFatal(e.error||{message:e.message,type:'error'}));
window.addEventListener('unhandledrejection',e=>onFatal(e.reason||{message:'unhandled rejection',type:'unhandledrejection'}));
['pointerdown','keydown','wheel','touchstart'].forEach(ev=>document.addEventListener(ev,idleTouch,{passive:true,capture:true}));
document.addEventListener('scroll',idleTouch,{passive:true,capture:true});
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') idleTick(); });   /* elapsed time from timestamps, not from paused intervals */
/* ── ONE payment guard for every route out of an uncertain payment ──
   While the card may have been charged, navigation, cancel, reset, retry and
   new orders are refused centrally — whichever way they are triggered.      */
/* ── loyalty actions (v28) ── */
Object.assign(ACT,{
  ltyOpen(){ if(!ltyOn()) return; S.sheet='loyalty'; ltyProgramTick();
    if(LOY.member){ LOY.state='welcome'; syncOverlay(); } else { syncOverlay(); ltyStartLogin(); } },
  ltyClose(){ ltyStopPoll(); if(!LOY.member) ltyCancelLogin(); LOY.gen++; if(!LOY.member) LOY.state='idle'; S.sheet=null; render({keep:true}); },
  ltyRetry(){ if(S.sheet==='loyalty') ltyStartLogin(); },
  ltyDemoScan(d){ if(!IS_DEMO||!LOY.token||LOY.state!=='qr'||!LTY_DEMO_MEMBERS[d.id]) return; LTY_DEMO.scans[LOY.token]=d.id; },   /* picked up by the next poll, exactly like a phone scan */
  ltyStart(d){ if(!['eatin','takeaway'].includes(d.s)) return; clearTimeout(LOY.logoutT);
    S.sheet=null; S.service=d.s; RAILSPIN=true; S._homeScroll=0; S.screen='menu'; S.cat='rewards'; S.filter='all'; render();
    track('order_started',{service:d.s,loyalty:true}); },
  ltyGo(){ S.sheet=null; S.screen='menu'; S.cat='rewards'; S.filter='all'; render(); },
  ltyLogout(){ ltyDoLogout(); },
  ltyClaim(d){ const r=ltyRewardById(d.id), ex=ltyClaimedLine(d.id); if(ex&&r&&r.maxPerOrder===1) ltyRemove(d.id); else ltyAdd(d.id); },
  ltyInc(d){ ltyAdd(d.id); },
  ltyDec(d){ ltyRemove(d.id); },
  cmTab(d){ if(!['gifts','shop'].includes(d.t)) return; LOY.tab=d.t; ltyRefresh(false); },
  cmApply(d){ const a=cmAssetById(d.id); if(!a) return; if(CMB.applied.has(a.key)) CMB.applied.delete(a.key); else CMB.applied.add(a.key);
    track('loyalty_gift_'+(CMB.applied.has(a.key)?'apply':'remove'),{gift:a.key}); cmTick(); if(S.screen==='cart') render({keep:true}); else ltyRefresh(false); },
  cmFix(d){ const a=cmAssetById(d.id); if(!a) return; CMB.applied.add(a.key); track('loyalty_offer_accept',{gift:a.key});   /* one tap: choose the gift AND fix its condition */
    if(a.pids.length){ ACT.quickAdd({pid:a.pids[0]},null); if(S.screen==='menu'||S.screen==='home') render({keep:true}); }
    else if(a.cats.length){ S.screen='menu'; S.cat=a.cats[0]; S.filter='all'; render(); } },
  cmWallet(){ if(!LOY.member||!LOY.member.credit) return; CMB.useWallet=!CMB.useWallet; cmTick(); render({keep:true}); },
  ltyReloadProg(){ LOY.progFailAt=0; LOY.progState='none'; ltyLoadProgram(); ltyRefresh(false); },
});
Object.assign(ACT,{
  r44Blocked(d,btn){ const el=document.getElementById('ctaReason'); if(el){ el.textContent=t('r44Blocked'); el.classList.add('flash');
      const s=ORDER_SESSION; setTimeout(()=>{ if(s!==ORDER_SESSION) return; const e=document.getElementById('ctaReason'); if(e){ e.classList.remove('flash'); e.textContent=S.draft&&!draftValid(S.draft)?blockReason(S.draft):''; } },2200); } },
});
/* v35 order tag actions */
Object.assign(ACT,{
  tagKey(d){ if(S.screen!=='tag') return; const type=tagState().type, k=d.k; let v=S.tagDraft||'';
    if(k==='kb'){ S.tagKb=S.tagKb==='cyr'?'lat':'cyr'; render({keep:true}); return; }
    if(k==='del') v=v.slice(0,-1);
    else if(k==='clr') v='';
    else if(type==='name'){ const ch=k==='sp'?' ':String(k).slice(0,1); const up=!v||/[ \-']$/.test(v); v=tagClean('name',v+(up?ch.toUpperCase():ch.toLowerCase())); }
    else v=tagClean(type,v+String(k).slice(0,1));
    S.tagDraft=v; tagSync(); },
  tagGo(d,btn){ if(S.screen!=='tag') return; const st=tagState(); if(!st.ok){ tagSync(); return; }
    if(validateCart().some(i=>i.code!=='price-changed')){ NAVDIR='back'; S.screen='cart'; render(); return; }
    S.tag={type:st.type, value:st.type==='name'?st.v.trim():String(Number(st.v))}; track('order_tag_set',{type:st.type});   /* never the value itself: a name is personal data */
    ACT.toPay(d,btn); },
  tagSkip(d,btn){ if(S.screen!=='tag'||BRAND.orderTag.required) return; S.tag=null; S.tagDraft=''; track('order_tag_skip',{type:tagMode()}); ACT.toPay(d,btn); },
  tagBack(){ if(S.screen!=='tag') return; NAVDIR='back'; S.screen='cart'; render(); },
});
/* physical keyboard (staff testing, accessibility): digits / letters / Backspace / Enter / Escape */
document.addEventListener('keydown',e=>{
  if(S.screen!=='tag'||S.confirm||S.sheet||document.querySelector('#overlay [aria-modal="true"]')) return;
  if(e.ctrlKey||e.metaKey||e.altKey) return;
  const type=tagState().type, k=e.key;
  if(k==='Enter'){ e.preventDefault(); ACT.tagGo({},document.getElementById('tagGo')); return; }
  if(k==='Escape'){ e.preventDefault(); ACT.tagBack(); return; }
  if(k==='Backspace'){ e.preventDefault(); ACT.tagKey({k:'del'}); return; }
  if(type==='name'?(k.length===1&&/[\p{L} \-']/u.test(k)):/^\d$/.test(k)){ e.preventDefault(); ACT.tagKey({k:k===' '?'sp':k}); }
});
const PAY_LOCKED_ACTIONS=['backMenu','home','cat','attract','startWith','ltyStart','ltyGo','ltyClaim','ltyLogout','viewOrder','prod','promo','quickAdd','toPay','payRetry','cancelPay','newOrder','idleClear','confirmCancel','crashRestart','askCancel','editLine','delLine','cartQty','otype','mealTile'];
PAY_LOCKED_ACTIONS.forEach(k=>{ const f=ACT[k]; if(typeof f!=='function') return;
  ACT[k]=function(...args){ if(S.screen==='pay'&&PAY_UNCERTAIN.has(PAY.state)) return; return f.apply(this,args); }; });
/* navigation / overlay / commit actions that must never run twice from one physical tap (UI latency, double tap).
   Steppers and toggles are NOT guarded — tapping + three times quickly is intentional. */
const TAP_GUARD=new Set(['tagGo','tagBack','tagSkip','prod','promo','cat','home','viewOrder','backProduct','backMenu','openCustomize','confirmCustomize',
  'addOrder','saveEdit','toPay','startWith','ltyOpen','ltyStart','ltyGo','openSheet','openPrice','openAlFilter','newOrder','editLine','priceConfirm']);
const LAST_ACT={k:'',t:0};
document.getElementById('screen').addEventListener('click',e=>{
  const btn=e.target.closest('[data-a]');
  if(!btn) return;
  if(S.confirm==='idle'&&!['idleGo','idleClear'].includes(btn.dataset.a)) return;   /* warning pauses every other interaction */
  if(!document.querySelector('#overlay [aria-modal="true"]')) LAST_TAP=btn;
  const panel=e.target.closest('[data-stop]');
  if(panel && !panel.contains(btn)) return; /* click in sheet body, not a button */
  const a=btn.dataset.a;
  { const k=a+'|'+(btn.dataset.pid||btn.dataset.cat||btn.dataset.lid||btn.dataset.id||''), now=Date.now();
    /* only an IDENTICAL guarded tap directly after itself is swallowed; any other action in between resets it */
    if(TAP_GUARD.has(a)&&LAST_ACT.k===k&&now-LAST_ACT.t<350) return; LAST_ACT.k=k; LAST_ACT.t=now; }
  perfMark(a);
  if(ACT[a]) ACT[a](btn.dataset,btn);
  if(e.detail>0&&btn.isConnected&&btn.blur) btn.blur();   /* pointer/touch: no lingering focus ring */
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){                                        /* Escape only when cancelling is safe */
    if(S.confirm==='idle') return;                              /* the inactivity warning decides itself */
    if(S.screen==='pay'&&PAY.state!=='idle'&&PAY.state!=='done') return;   /* never leave a payment state via Escape */
    if(S.confirm){ S.confirm=null; syncOverlay(); }
    else if(S.sheet){ S.sheet=null; syncOverlay(); } }
  if((e.key==='f'||e.key==='F')&&!document.body.classList.contains('kiosk')){
    document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
  }
});

/* ── stage fit + boot ────────────────────────────────────────── */
/* ── KIOSK MODE ──────────────────────────────────────────────────
   ?kiosk=1 (or ?bare=1), or auto when the browser itself runs fullscreen
   (chrome --kiosk, PWA "fullscreen" display-mode). The design canvas stays
   1080×1920 and is scaled uniformly (contain) to the physical display, so
   FHD, 4K and other portrait panels all render pixel-perfect; other aspect
   ratios letterbox on the brand background. Every measurement in the engine
   (appBox, FLIP) is scale-aware, so motion is unaffected.                   */
/* Q is defined near the top of the engine */
/* Layout modes (viewport geometry + pointer type, never the user agent):
     portrait-kiosk  aspect ≤ 0.66 (9:16 panels, e.g. 1080×1920): fixed 1080×1920 canvas, scaled to fit
     tablet          coarse pointer & 0.66 < aspect < 1.75 (iPad Air portrait 0.69 / landscape 1.44):
                     responsive reflow in the real viewport — no letterbox, no transform scale
     sim             desktop: kiosk-hardware simulator
   Overrides: ?kiosk=1 ?tablet=1 ?sim=1                                                      */
const coarse=()=>!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches)||(navigator.maxTouchPoints||0)>1;
const standalone=()=>!!(window.matchMedia&&matchMedia('(display-mode: fullscreen)').matches)||!!(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
function layoutMode(){
  const a=innerWidth/Math.max(1,innerHeight);
  if(Q.has('tablet')) return 'tablet';
  if(Q.has('kiosk')||Q.has('bare')) return 'kiosk';
  if(Q.has('sim')) return 'sim';
  if(a<=0.66) return 'kiosk';
  if((coarse()||standalone())&&a<1.75) return 'tablet';
  return 'sim';
}
let MODE=layoutMode();
const KIOSK=MODE!=='sim';                  /* device behaviours (fullscreen on tap, wake lock, no cursor) for kiosk AND tablet */
const BARE=KIOSK;
if(KIOSK){
  document.body.classList.add('kiosk','bare');
  if(Q.has('cursor')) document.body.classList.add('cursor');
  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('gesturestart',e=>e.preventDefault());        /* iOS pinch */
  document.addEventListener('dblclick',e=>e.preventDefault());
  /* fullscreen + wake lock need a user gesture: the first tap does it */
  /* one automatic fullscreen attempt after the first valid gesture; never retried on every tap.
     Wake lock: once after a gesture, once more after returning to the foreground. Failure is silent. */
  const FS={ attempted:false, unavailable:false };
  const wakeOnce=()=>{ if(!navigator.wakeLock||window.__wl) return;
    navigator.wakeLock.request('screen').then(l=>{ window.__wl=l; l.addEventListener('release',()=>{ window.__wl=null; }); }).catch(()=>{}); };
  const goFs=(explicit=false)=>{ const el=document.documentElement;
    const isFs=!!(document.fullscreenElement||document.webkitFullscreenElement);
    if(isFs||(FS.unavailable&&!explicit)) return;
    if(FS.attempted&&!explicit) return;
    FS.attempted=true;
    const req=el.requestFullscreen?el.requestFullscreen({navigationUI:'hide'}):(el.webkitRequestFullscreen?Promise.resolve(el.webkitRequestFullscreen()):Promise.reject());
    Promise.resolve(req).catch(()=>{ FS.unavailable=true; }).finally(fsState);
  };
  const fsState=()=>{ const fs=!!(document.fullscreenElement||document.webkitFullscreenElement)
      ||(window.matchMedia&&matchMedia('(display-mode: fullscreen)').matches)||navigator.standalone===true;
    document.body.classList.toggle('nofs',!fs&&FS.attempted&&!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen)); };
  const firstGesture=()=>{ goFs(false); wakeOnce(); document.removeEventListener('pointerup',firstGesture); document.removeEventListener('click',firstGesture); };
  document.addEventListener('pointerup',firstGesture,{passive:true}); document.addEventListener('click',firstGesture,{passive:true});
  document.addEventListener('fullscreenchange',fsState); document.addEventListener('webkitfullscreenchange',fsState);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&window.__wl===null) wakeOnce(); });
  const fsBtn=document.createElement('button'); fsBtn.id='kioskFs'; fsBtn.type='button'; fsBtn.setAttribute('aria-label','Fullscreen');
  fsBtn.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
  fsBtn.addEventListener('click',()=>goFs(true)); document.body.appendChild(fsBtn); fsState();
}
function fit(){
  if(Q.has('debug')) setTimeout(debugHud,0);
  const vw=(window.visualViewport&&window.visualViewport.width)||innerWidth,
        vh=(window.visualViewport&&window.visualViewport.height)||innerHeight;
  const m=layoutMode(); if(m!==MODE&&(m==='sim')===(MODE==='sim')) MODE=m;   /* kiosk↔tablet may flip on rotation; sim never flips at runtime */
  if(MODE==='kiosk'&&(vw<vh?vw/1080<0.9:true)) MODE='tablet';              /* dense or landscape panels use tablet density */
  const scr=document.getElementById('screen'), B=document.body.classList;
  B.toggle('tablet',MODE==='tablet'); B.toggle('land',MODE==='tablet'&&vw>vh); B.toggle('port',MODE==='tablet'&&vw<=vh);
  if(MODE==='tablet') B.remove('fluid');
  if(document.documentElement.classList.contains('pre-fit')&&typeof requestAnimationFrame!=='undefined') requestAnimationFrame(()=>document.documentElement.classList.remove('pre-fit'));
  else document.documentElement.classList.remove('pre-fit');
  if(MODE==='tablet'){
    /* density: the 1080-wide design reflows in a canvas of vw/z × vh/z design px (z ≈ .76 on iPad) */
    const z=Math.min(Math.max(vw/1080,0.62),0.82);
    scr.style.setProperty('--z',z); scr.style.setProperty('--k','1');
    scr.style.setProperty('--cw',Math.round(vw/z)+'px'); scr.style.setProperty('--ch',Math.round(vh/z)+'px');
    document.documentElement.style.setProperty('--vvh',vh+'px');
    if(Q.has('debug')) debugHud();
    return; }
  if(KIOSK){
    const z=Math.min(Math.max(vw/1080,0.62),1.25);
    B.add('fluid'); scr.style.setProperty('--z',z); scr.style.setProperty('--k','1');
    scr.style.setProperty('--cw','1080px'); scr.style.setProperty('--ch',Math.round(vh/z)+'px');
    document.documentElement.style.setProperty('--vvh',vh+'px');
    return; }
  const pad=40, hw=270;
  const s=Math.min((innerWidth-pad)/1120, (innerHeight-pad)/(1960+hw+26));
  document.getElementById('device').style.setProperty('--s',Math.min(1,s));
  document.getElementById('hint').textContent=
    `${BRAND.name} kiosk · white-label engine by Guestit · 1080×1920 · ${Math.round(Math.min(1,s)*100)}% · F = fullscreen · staand scherm = automatisch kioskmodus (?sim=1 forceert deze simulator)`;
}
addEventListener('resize',fit); addEventListener('orientationchange',fit);
if(window.visualViewport) visualViewport.addEventListener('resize',fit);
/* ?debug=1 → small on-screen HUD (mode · zoom · canvas · viewport · UA · last JS error) for device photos */
function debugHud(){ let h=document.getElementById('dbgHud'); if(!h){ h=document.createElement('div'); h.id='dbgHud'; document.body.appendChild(h);
    window.addEventListener('error',e=>{ h.dataset.err=(e.message||'error').slice(0,120); debugHud(); }); }
  const scr=document.getElementById('screen'), r=scr.getBoundingClientRect();
  h.textContent=`${MODE} · z=${(+scr.style.getPropertyValue('--z')||1).toFixed(3)} · canvas ${scr.offsetWidth}×${scr.offsetHeight} → ${Math.round(r.width)}×${Math.round(r.height)} · vp ${innerWidth}×${innerHeight}${window.visualViewport?' vv '+Math.round(visualViewport.width)+'×'+Math.round(visualViewport.height):''} · dpr ${devicePixelRatio} · ${navigator.userAgent.match(/(CriOS|FxiOS|EdgiOS|Version)\/[\d.]+|Chrome\/[\d.]+/)?.[0]||''}${h.dataset.err?' · ERR '+h.dataset.err:''}`; }
/* ── OFFLINE-FIRST ASSET STORE ────────────────────────────────────
   Everything essential (product photos, logo, fonts, icons) is embedded and
   therefore always available. Remote CMS branding (attract slider, sidebar
   backdrop, brand graphic) is optional: it is fetched with a version tag,
   VALIDATED (decoded) before it is ever shown, and replaced by the embedded
   fallback when it fails or the network is gone. Production: the Android
   shell's cache layer performs the same prime/validate/version step.       */
const assetStore={
  ok:new Map(),                             /* url → true (validated) | false (failed) */
  fallback:{ hero:()=>ASSETS.hero, sidebar:()=>ASSETS.plateTer, brand:()=>ASSETS.hero },
  versioned(u){ return /^https?:/.test(u)?u+(u.includes('?')?'&':'?')+'v='+encodeURIComponent(BRAND.assetVersion||'1'):u; },
  prime(urls,timeoutMs=4000){                   /* pre-validate; resolves whatever the outcome */
    return Promise.all(urls.filter(Boolean).map(u=>new Promise(res=>{
      if(!/^https?:/.test(u)){ this.ok.set(u,true); return res(true); }
      if(this.ok.has(u)) return res(this.ok.get(u));
      const im=new Image(); let done=false; const fin=v=>{ if(done) return; done=true; this.ok.set(u,v); res(v); };
      im.onload=()=>fin(im.naturalWidth>0); im.onerror=()=>fin(false); setTimeout(()=>fin(false),timeoutMs); im.src=this.versioned(u);
    })));
  },
  url(u,kind){ if(!u||!/^https?:/.test(u)) return u; return this.ok.get(u)===true?this.versioned(u):this.fallback[kind](); },
};
/* ── CONNECTION SERVICE (local Guestit server / POS) ─────────────
   boot: searching → online | failed (retry button, auto-retry with backoff)
   ordering: a short drop never clears the order; payment is blocked while
   availability or order registration cannot be verified; on reconnect the
   catalog is re-synced (availability + prices) and the cart re-validated.
   Prototype adapter: simulated ping (SIM.server); production: /health of the
   local server + POS heartbeat.                                            */
const CONN={ state:'boot', attempts:0, timer:null, since:Date.now(), lastOk:null, resyncing:false };
const connCfg=()=>BRAND.connectionSettings||{ pingMs:600, bootGiveUpMs:12000, retryMs:[1000,2000,4000,8000], sessionTtlMs:180000 };
const connPing=()=>{ const pos=adapter('pos'); if(!pos||!pos.health) return Promise.resolve(false);
  return new Promise(res=>{ let done=false; const fin=v=>{ if(!done){ done=true; res(!!v); } };
    setTimeout(()=>fin(false),connCfg().pingMs+3000);
    Promise.resolve(pos.health()).then(v=>setTimeout(()=>fin(v),IS_DEMO&&SIM.server==='offline'?connCfg().pingMs:120)).catch(()=>fin(false)); }); };
function connSet(state){ if(CONN.state===state) return; const prev=CONN.state; CONN.state=state; CONN.since=Date.now();
  document.body.classList.toggle('offline',state==='offline'); document.body.classList.toggle('booting',state==='boot'||state==='bootfail');
  if(state==='online'&&(prev==='offline'||prev==='boot'||prev==='bootfail')) onReconnected(prev);
  connBanner(); if(S.screen==='cart') render({keep:true}); }
function connBanner(){ let b=document.getElementById('connBanner');
  if(CONN.state!=='offline'&&!CONN.resyncing){ if(b) b.remove(); return; }
  if(!b){ b=document.createElement('div'); b.id='connBanner'; b.setAttribute('role','status'); b.setAttribute('aria-live','polite'); document.getElementById('screen').appendChild(b); }
  b.textContent=CONN.resyncing?t('connResync'):t('connLost'); }
async function connBoot(){                      /* startup: search, auto-retry, give up → protected error screen */
  CONN.state='boot'; document.body.classList.add('booting'); bootScreen();
  const t0=Date.now(), cfg=connCfg();
  while(true){ CONN.attempts++; bootScreen();
    if(await connPing()){ CONN.lastOk=Date.now(); document.getElementById('bootScreen')?.remove(); connSet('online'); return true; }
    if(Date.now()-t0>=cfg.bootGiveUpMs){ CONN.state='bootfail'; bootScreen(); return false; }
    await new Promise(r=>setTimeout(r,cfg.retryMs[Math.min(CONN.attempts-1,cfg.retryMs.length-1)])); }
}
function bootScreen(){ let el=document.getElementById('bootScreen');
  if(!el){ el=document.createElement('div'); el.id='bootScreen'; document.getElementById('screen').appendChild(el); }
  const fail=CONN.state==='bootfail';
  el.innerHTML=`<div class="bootCard" role="${fail?'alertdialog':'status'}" aria-modal="${fail}"><img src="${BRAND.logoImg}" alt="${BRAND.name}" class="bootLogo">
    <div class="bootT">${fail?t('connFailT'):t('connBootT')}</div>
    <div class="bootS">${fail?t('connFailB'):tf('connBootS',{n:CONN.attempts})}</div>
    ${fail?`<button type="button" id="bootRetry" class="press bootBtn">${t('connRetry')}</button>`:'<div class="bootSpin" aria-hidden="true"></div>'}
    <button type="button" id="adminTap" class="bootAdmin" aria-label="${t('adminT')}"></button></div>`;
  const r=el.querySelector('#bootRetry'); if(r) r.addEventListener('click',()=>{ bootSequence(); });
  adminTapWire(el.querySelector('#adminTap'));
}
/* connection watchdog during ordering */
let CONN_WATCH=null;
function connWatch(){ clearInterval(CONN_WATCH); CONN_WATCH=setInterval(async()=>{ if(CONN.state==='boot'||CONN.state==='bootfail') return;
  const ok=await connPing(); if(ok){ CONN.lastOk=Date.now(); if(CONN.state!=='online') connSet('online'); }
  else if(CONN.state!=='offline'){ persistSession(); connSet('offline'); } },1500); }
/* short interruption: cart + screen kept locally with a TTL, restored only for the same session window */
/* an unpaid cart is only kept for a NETWORK INTERRUPTION inside the running session;
   a crash or reload always starts a fresh unpaid session (paid/uncertain orders are restored separately). */
function persistSession(reason='offline'){ try{ sessionStorage.setItem('guestit.session',JSON.stringify({at:Date.now(),reason,tab:TAB_ID,
  session:ORDER_SESSION,cart:S.cart,service:S.service,lang:S.lang,screen:S.screen==='tag'?'cart':(S.screen==='product'||S.screen==='customize'?(S.from||'menu'):S.screen),cat:S.cat,tag:S.tag})); }catch(e){} }
function restoreSession(){ try{ const raw=sessionStorage.getItem('guestit.session'); if(!raw) return false; const r=JSON.parse(raw);
  const sameTab=r&&r.tab===TAB_ID, fresh=r&&Date.now()-r.at<=connCfg().sessionTtlMs;
  if(!r||!fresh||r.reason!=='offline'||!sameTab||!Array.isArray(r.cart)||!r.cart.length){ sessionStorage.removeItem('guestit.session'); return false; }
  S.cart=r.cart; S.service=r.service; S.lang=r.lang||S.lang; S.cat=r.cat||S.cat; S.tag=tagRestore(r.tag); S.screen=['home','menu','cart'].includes(r.screen)?r.screen:'menu'; uid=Math.max(uid,...r.cart.map(l=>+String(l.lid).slice(1)+1)); gid=Math.max(gid,...r.cart.map(l=>+String(l.groupId||'G0').slice(1)+1));
  sessionStorage.removeItem('guestit.session'); return true; }catch(e){ return false; } }
async function onReconnected(prev){             /* re-sync availability + prices, then re-validate the cart */
  if(prev==='boot'||prev==='bootfail') return;
  if(paymentMayHaveSucceeded()||PAY_UNCERTAIN.has(PAY.state)){        /* never navigate away from or edit a paid/uncertain order */
    CONN.resyncing=false; connBanner(); if(PAY.state==='recovery-required') submitOrder(); return; }
  CONN.resyncing=true; connBanner(); S.checking=true;
  await catalogService.refresh();                                                   /* REAL availability + catalog prices */
  CONN.resyncing=false; S.checking=false; connBanner();
  if(paymentMayHaveSucceeded()||PAY_UNCERTAIN.has(PAY.state)) return;
  const na=availabilityService.checkCart();
  if(na.length){ if(S.screen!=='cart'){ NAVDIR='fwd'; S.screen='cart'; } render({keep:true}); }
  else if(S.screen==='cart'){ render({keep:true}); }
}
/* ── SCREEN CLEANING ─────────────────────────────────────────────
   Started by staff from the settings panel. No timer: the screen stays in
   cleaning mode until someone presses "Finished cleaning", which returns to
   the PIN screen. Everything except that button ignores touch, so wiping the
   screen cannot order anything or leave the mode by accident. The whole
   feature can be switched off in the staff settings (BRAND.cleaning.enabled).
   ───────────────────────────────────────────────────────────── */
const cleaningEnabled=()=>{ try{ const v=localStorage.getItem('guestit.cleaning.enabled');
    if(v==='0') return false; if(v==='1') return true; }catch(e){}
  return !!(BRAND.cleaning&&BRAND.cleaning.enabled); };
function setCleaningEnabled(on){ try{ localStorage.setItem('guestit.cleaning.enabled',on?'1':'0'); }catch(e){}
  BRAND.cleaning=Object.assign({},BRAND.cleaning,{enabled:!!on}); }
function cleaningActive(){ return !!document.getElementById('cleanScreen'); }
function openCleaning(){
  if(!cleaningEnabled()||cleaningActive()) return false;
  clearInterval(IDLE.timer);                             /* no idle countdown, no attract screen while cleaning */
  const el=document.createElement('div'); el.id='cleanScreen'; el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true'); el.setAttribute('aria-label',t('cleanT'));
  el.innerHTML=`<div class="clean-card">
      <span class="clean-ic" aria-hidden="true">${ic('wipe','',2.2)}</span>
      <div class="clean-t">${t('cleanT')}</div>
      <div class="clean-b">${t('cleanB')}</div>
    </div>
    <button type="button" id="cleanDone" class="press clean-done">${t('cleanDone')}</button>`;
  document.getElementById('screen').appendChild(el);
  el.querySelector('#cleanDone').addEventListener('click',closeCleaning);
  track('cleaning_started',{});
  return true;
}
function closeCleaning(){
  const el=document.getElementById('cleanScreen'); if(!el) return;
  el.remove(); track('cleaning_finished',{}); idleStart();
  adminPrompt();                                          /* back to the PIN screen */
}
/* hidden staff action: 5 taps on the boot logo / kiosk logo → PIN → technical settings */
function adminTapWire(el){ if(!el) return; let n=0,t0=0; el.addEventListener('click',()=>{ const now=Date.now(); if(now-t0>2500) n=0; t0=now; if(++n>=5){ n=0; adminPrompt(); } }); }
function adminPrompt(){ let el=document.getElementById('adminPanel'); if(el) el.remove();
  el=document.createElement('div'); el.id='adminPanel'; el.innerHTML=`<div class="bootCard" role="dialog" aria-modal="true">
    <div class="bootT">${t('adminT')}</div><div class="bootS">${t('adminPin')}</div>
    <input id="adminPinIn" type="password" inputmode="numeric" maxlength="6" autocomplete="off" class="adminIn" aria-label="${t('adminPin')}">
    <div id="adminMsg" class="bootS" aria-live="polite"></div>
    <div class="adminRow"><button type="button" id="adminOk" class="press bootBtn">OK</button><button type="button" id="adminX" class="press bootBtn bootBtn2">${t('adminClose')}</button></div>
    <div id="adminTools" hidden>
      <div class="bootS">${t('adminServer')}: <code>${(BRAND.connectionSettings&&BRAND.connectionSettings.serverUrl)||'http://guestit.local'}</code> · ${CONN.state} · ${t('payRef')}: ${PAY.recoveryRef||'—'}</div>
      ${CATALOG_ERRORS.length?`<div class="bootS" style="color:#f4c27a">${t('catalogInvalidT')}: ${CATALOG_ERRORS.slice(0,6).map(e=>e.message+(e.pid?' ('+e.pid+')':'')+(e.id?' ['+e.id+']':'')).join(' · ')}${CATALOG_ERRORS.length>6?' …':''}</div>`:''}
      <div class="adminTag"><div class="bootS">${t('tag_admin')}</div>
        <div class="adminRow adminSeg" role="group" aria-label="${t('tag_admin')}">${TAG_MODES.map(m=>`<button type="button" data-tagmode="${m}" aria-pressed="${BRAND.orderTag.mode===m}" class="press bootBtn${BRAND.orderTag.mode===m?'':' bootBtn2'}"${IS_DEMO?'':' disabled aria-disabled="true"'}>${t('tag_m_'+m)}</button>`).join('')}</div>
        <div class="bootS adminTagS">${IS_DEMO?t('tag_adminDemo'):t('tag_adminProd')} · ${t('tag_tableL')} ${BRAND.orderTag.table.min}–${BRAND.orderTag.table.max} · ${t('tag_pagerL')} ${BRAND.orderTag.pager.min}–${BRAND.orderTag.pager.max}</div></div>
      <div class="adminRow"><button type="button" id="adminRetry" class="press bootBtn">${t('connRetry')}</button><button type="button" id="adminReload" class="press bootBtn bootBtn2">Reload</button></div>
      <div class="adminRow">
        <button type="button" id="adminClean" class="press bootBtn" ${cleaningEnabled()?'':'disabled aria-disabled="true"'}>${t('cleanOpen')}</button>
        <button type="button" id="adminCleanTgl" class="press bootBtn bootBtn2" aria-pressed="${cleaningEnabled()}" aria-label="${t('cleanToggle')}">${cleaningEnabled()?t('cleanOn'):t('cleanOff')}</button>
      </div>
    </div></div>`;
  document.getElementById('screen').appendChild(el);
  const pin=el.querySelector('#adminPinIn'); pin.focus();
  el.querySelector('#adminOk').addEventListener('click',()=>{ const au=adapter('auth'); if(!au){ el.querySelector('#adminMsg').textContent=t('adminWrong'); return; }
    Promise.resolve(au.verify({pin:pin.value})).then(ok=>{ if(ok){ el.querySelector('#adminTools').hidden=false; el.querySelector('#adminMsg').textContent=''; track('staff_assist',{}); } else { el.querySelector('#adminMsg').textContent=t('adminWrong'); pin.value=''; } }); });
  el.querySelector('#adminX').addEventListener('click',()=>el.remove());
  el.querySelector('#adminRetry').addEventListener('click',()=>{ el.remove(); if(CONN.state==='bootfail'||CONN.state==='boot'||!BOOT.done) bootSequence(); else connPing().then(ok=>{ if(ok) connSet('online'); }); });   /* online only after a real check */
  el.querySelector('#adminReload').addEventListener('click',()=>location.reload());
  el.querySelectorAll('[data-tagmode]').forEach(b=>b.addEventListener('click',()=>{ if(!IS_DEMO) return; const m=b.dataset.tagmode; if(!TAG_MODES.includes(m)) return;
    BRAND.orderTag.mode=m; try{ localStorage.setItem(TAG_DEMO_KEY,m); }catch(e){} track('order_tag_mode',{mode:m});
    el.querySelectorAll('[data-tagmode]').forEach(x=>{ const on=x.dataset.tagmode===m; x.setAttribute('aria-pressed',String(on)); x.classList.toggle('bootBtn2',!on); }); }));
  el.querySelector('#adminClean').addEventListener('click',()=>{ if(!cleaningEnabled()) return; el.remove(); openCleaning(); });
  el.querySelector('#adminCleanTgl').addEventListener('click',()=>{ const on=!cleaningEnabled(); setCleaningEnabled(on);
    const b=el.querySelector('#adminCleanTgl'), o=el.querySelector('#adminClean');
    b.textContent=on?t('cleanOn'):t('cleanOff'); b.setAttribute('aria-pressed',String(on));
    o.disabled=!on; if(on) o.removeAttribute('aria-disabled'); else o.setAttribute('aria-disabled','true'); });
}
/* dev-only test controls: only in simulator mode (?sim=1) — never in kiosk mode */
if(IS_DEMO){                                  /* test parameters exist in demo mode only */
  SIM.paymentResult=Q.get('paymentResult')||null; SIM.printer=Q.get('printer')||null; SIM.hang=Q.get('hang')||null;
  (Q.get('unavailable')||'').split(',').filter(Boolean).forEach(id=>SIM.unavailable.add(id));
  (Q.get('priceChange')||'').split(',').filter(Boolean).forEach(pc=>{ const [id,c]=pc.split(':'); if(PRICE_VARIANTS[id]) PRICE_VARIANTS[id].price=+c; else if(byId(id)) byId(id).price=+c; });
  if(Q.has('idleMs')) BRAND.sessionSettings.inactivityTimeoutMs=+Q.get('idleMs');
  if(Q.has('warnMs')) BRAND.sessionSettings.inactivityWarningMs=+Q.get('warnMs');
  const badge=document.createElement('div'); badge.id='demoBadge'; badge.textContent=t('demoBadge'); document.body.appendChild(badge);
}
if(IS_DEMO&&Q.has('sim')&&!KIOSK){
  const dev=document.createElement('div'); dev.id='devPanel';
  dev.innerHTML=`<label>next payment <select id="devPay">${['success','declined','cancelled','timeout','timeout-charged','terminal-offline','submit-failed-after-payment'].map(v=>`<option ${SIM.paymentResult===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>unavailable <input id="devNa" placeholder="gyoza,pokeSal" value="${[...SIM.unavailable].join(',')}"></label>
    <button type="button" id="devIdle">trigger idle warning</button>
    <label>price change <input id="devPrice" placeholder="gyoza:600 or gyoza-cross-sell:400"></label>
    <label>hang <select id="devHang"><option value="">none</option><option>status</option><option>cancel</option><option>submit</option><option>availability</option></select></label>
    <label>server <select id="devSrv"><option value="">online</option><option value="offline" ${SIM.server==='offline'?'selected':''}>offline</option></select></label>
    <label>order tag <select id="devTag">${TAG_MODES.map(v=>`<option ${BRAND.orderTag.mode===v?'selected':''}>${v}</option>`).join('')}</select></label>`;
  document.body.appendChild(dev);
  dev.querySelector('#devPay').addEventListener('change',e=>{ SIM.paymentResult=e.target.value==='success'?null:e.target.value; });
  dev.querySelector('#devNa').addEventListener('change',e=>{ SIM.unavailable=new Set(e.target.value.split(',').map(x=>x.trim()).filter(Boolean)); if(S.screen==='cart') render({keep:true}); });
  dev.querySelector('#devIdle').addEventListener('click',()=>{ IDLE.last=Date.now()-idleCfg().inactivityTimeoutMs; idleTick(); });
  dev.querySelector('#devSrv').addEventListener('change',e=>{ SIM.server=e.target.value||null; });
  dev.querySelector('#devHang').addEventListener('change',e=>{ SIM.hang=e.target.value||null; });
  dev.querySelector('#devTag').addEventListener('change',e=>{ if(TAG_MODES.includes(e.target.value)) BRAND.orderTag.mode=e.target.value; });
  dev.querySelector('#devPrice').addEventListener('change',e=>{ const [id,c]=e.target.value.split(':'); if(!id||!c) return;
    if(PRICE_VARIANTS[id]) PRICE_VARIANTS[id].price=+c; else if(byId(id)) byId(id).price=+c; });
}
SIM.server=IS_DEMO?(Q.get('server')||null):null;
setTerm('ready'); fit();
/* ── ONE boot sequence for first start AND every retry (idempotent, no concurrent runs) ── */
const BOOT={ running:false, done:false, paidRestored:null, primed:false };
async function bootSequence(){
  if(BOOT.running) return false; BOOT.running=true;
  try{
    const miss=missingAdapters();
    if(miss.length){ CONN.state='bootfail'; let el=document.getElementById('bootScreen'); if(!el){ el=document.createElement('div'); el.id='bootScreen'; document.getElementById('screen').appendChild(el); }
      el.innerHTML=`<div class="bootCard" role="alertdialog" aria-modal="true"><div class="bootT">${t('prodBlockT')}</div><div class="bootS">${tf('prodBlockB',{list:miss.join(', ')})}</div><button type="button" id="adminTap" class="bootAdmin" aria-label="${t('adminT')}"></button></div>`;
      adminTapWire(el.querySelector('#adminTap')); return false; }
    if(!BOOT.primed){ BOOT.primed=true; assetStore.prime([...BRAND.hero.images,BRAND.sidebar.backgroundImage,BRAND.brandGraphic].filter(Boolean)).then(()=>{ if(BOOT.done&&S.screen==='attract') render(); }); }
    if(BOOT.paidRestored===null) BOOT.paidRestored=restorePaidSnapshot();      /* payment recovery survives every retry */
    CONN.attempts=0;
    const ok=await connBoot();
    if(!ok) return false;                                                       /* protected error screen with retry stays up */
    if(!BOOT.done){ if(!BOOT.paidRestored&&restoreSession()) NAVDIR='fwd'; }
    if(CATALOG_ERRORS.length){ reportClientError({type:'catalog-invalid',message:CATALOG_ERRORS.length+' catalog issues'}); }
    await catalogService.refresh();                                             /* first real availability + price sync */
    render(); idleStart(); connWatch();                                         /* both (re)start with clearInterval → no duplicate timers */
    BOOT.done=true; return true;
  } finally { BOOT.running=false; }
}
bootSequence();
adminTapWire(document.querySelector('#railSide button[data-a="attract"]'));
