(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var K = { acc: 'elhana.accounts', cur: 'elhana.cur', snd: 'elhana.sound', cats: 'elhana.cats', pos: 'aliiptv.pos', seen: 'elhana.seen',
    lang: 'elhana.lang', h24: 'elhana.h24', sbc: 'elhana.sbc', sbshow: 'elhana.sbshow', fav: 'elhana.fav', toff: 'elhana.toff', sbsize: 'elhana.sbsize', theme: 'elhana.theme', bg: 'elhana.bg', terms: 'elhana.terms', prog: 'elhana.prog' };
  var SCREENS = ['login', 'accounts', 'home', 'settings', 'main', 'detail'];
  var cfg = null, info = null, m3u = null, favs = [];
  var state = { type: 'live', catId: null, list: [], shown: 0, mode: 'rows', favCat: 'live' };
  var cache = { cats: {}, streams: {} };
  var PAGE = 120;
  var lastFocus = null, detFrom = null, det = null, loginType = 'xtream', setSec = 'general';
  var timeOffset = +(store(K.toff) || 0);
  function nowMs() { return Date.now() + timeOffset; }
  function nowDate() { return new Date(nowMs()); }
  var play = { live: false, list: null, index: 0, url: '', master: '', title: '', triedTs: false, triedAltVod: false, ep: null };
  var hlsInst = null;

  function store(k, v) {
    try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; }
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function busy(on) { $('loading').classList.toggle('hidden', !on); }
  function two(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- اللغة / Language ---------- */
  var T = {
    ar: {
      name_ph: 'اسم الحساب  (مثال: حساب البيت)', host_ph: 'رابط السيرفر  أو رابط get.php كامل', user_ph: 'اسم المستخدم', pass_ph: 'كلمة المرور', m3u_ph: 'رابط ملف M3U',
      addSignIn: 'إضافة ودخول',
      disc: 'El Hana IPTV مجرد مشغّل وسائط. لا يتضمن التطبيق ولا يوفّر ولا يبيع أي قنوات أو أفلام أو محتوى. لاستخدامه أدخل بيانات اشتراك Xtream Codes أو رابط M3U الخاص بك من مزوّد الخدمة.',
      need: 'اكمل رابط السيرفر واسم المستخدم وكلمة المرور', m3uNeed: 'ادخل رابط ملف M3U', verifying: 'جاري التحقق…', m3uLoading: 'جاري تحميل قائمة M3U…',
      m3uEmpty: 'لم يتم العثور على قنوات في ملف M3U', badauth: 'بيانات الدخول غير صحيحة', inactive: 'الاشتراك غير فعال: ', myacct: 'حسابي',
      badjson: 'رد غير صالح من السيرفر', srvErr: 'خطأ من السيرفر (', connErr: 'تعذر الاتصال بالسيرفر', timeout: 'انتهت مهلة الاتصال',
      back: 'رجوع', accountsT: 'الحسابات', addAcc: 'إضافة حساب جديد', noAccounts: 'لا توجد حسابات محفوظة',
      expires: 'ينتهي الاشتراك: ', live: 'البث المباشر', movies: 'الأفلام', series: 'المسلسلات', favorites: 'المفضلة', settings: 'الإعدادات', switchAcct: 'تغيير الحساب',
      home: 'الرئيسية', search_ph: 'بحث داخل القسم', hideCats: 'إخفاء الأقسام', showCats: 'إظهار الأقسام', noCats: 'لا توجد أقسام', noContent: 'لا يوجد محتوى',
      searchRes: 'نتائج البحث: ', more: 'عرض المزيد', newb: 'جديد', season: 'الموسم', episode: 'الحلقة', episodes: 'حلقات', noEps: 'لا توجد حلقات', loading: 'جاري التحميل…',
      noFav: 'لا يوجد شيء في المفضلة بعد', favAdd: 'إضافة للمفضلة', favRemove: 'إزالة من المفضلة', favHint: 'الزر الأصفر في الريموت = إضافة / إزالة من المفضلة',
      play: 'تشغيل', noPlot: 'لا توجد تفاصيل متاحة', nowLbl: 'الآن: ', nextLbl: 'التالي: ', dirLbl: 'المخرج: ', castLbl: 'الممثلون: ', minShort: 'د',
      newOnSrv: 'جديد على السيرفر: ', movie1: 'فيلم', movieN: 'فيلم', series1: 'مسلسل', seriesN: 'مسلسل', and: 'و',
      resume: 'استكمال من ', buffering: 'جاري التحميل…', cantPlay: 'تعذر تشغيل هذا المحتوى — جرب زر المشغل الخارجي', liveLbl: 'بث مباشر',
      qualOnly: 'تغيير الجودة متاح للقنوات المباشرة متعددة الجودة فقط', qualRead: 'جاري قراءة الجودات المتاحة…', qualOne: 'هذه القناة متاحة بجودة واحدة فقط',
      qualAuto: 'تلقائي (الأعلى)', qLow: '— الأقل', qHigh: '— الأعلى', qTitle: 'الجودة (من الأقل إلى الأعلى)', qDone: 'تم تغيير الجودة', qFail: 'تعذر قراءة الجودات من السيرفر',
      noAudio: 'لا توجد مسارات صوتية أخرى في هذا البث', track: 'مسار', audioDone: 'تم تغيير المسار الصوتي', audioTitle: 'المسار الصوتي / المعلق',
      btnQuality: 'الجودة', btnAudio: 'الصوت / المعلق', btnExtPlayer: 'مشغل خارجي', extOpening: 'جاري فتح المشغل الخارجي…',
      rew: 'رجوع 10 ثوان', fwd: 'تقديم 30 ثانية', stop: 'إيقاف',
      exitQ: 'هل تريد الخروج من التطبيق؟', ok: 'موافق', cancel: 'إلغاء', offline: 'لا يوجد اتصال بالإنترنت', online: 'عاد الاتصال بالإنترنت',
      secGeneral: 'عام', secTime: 'الوقت', secSpeedbar: 'شريط السرعة', secSpeedtest: 'اختبار السرعة',
      language: 'اللغة', sound: 'صوت التنقل', on: 'شغال', off: 'متوقف', clockFmt: 'صيغة الساعة', h12: '12 ساعة', h24: '24 ساعة', am: 'ص', pm: 'م', nowTime: 'الوقت الآن: ',
      sbShow: 'إظهار شريط السرعة', sbColor: 'لون شريط السرعة', cWhite: 'أبيض', cBlack: 'أسود', cYellow: 'أصفر', cCyan: 'سماوي', cGreen: 'أخضر', cRed: 'أحمر',
      stStart: 'ابدأ الاختبار', stRunning: 'جاري الاختبار…', stPing: 'زمن الاستجابة', stDown: 'التحميل', stUp: 'الرفع', stDone: 'تم الاختبار', stFail: 'فشل الاختبار، تحقق من الاتصال',
      stNote: 'الاختبار يتصل بالخادم فقط عند الضغط على "ابدأ الاختبار".', exitAppBtn: 'خروج', catsLbl: 'القائمة الجانبية', phoneAddBtn: 'إضافة من الموبايل (QR)', phoneTitle: 'إضافة حساب من الموبايل', phoneStep1: '١) افتح كاميرا الموبايل وامسح الكود', phoneStep2: '٢) اكتب بيانات Xtream أو رابط M3U في الصفحة واضغط إرسال', phoneWaiting: 'في انتظار الموبايل…', phoneGot: 'تم استلام البيانات، جاري الدخول…', phoneNoCrypto: 'الشاشة دي ما بتدعمش النقل الآمن، اكتب البيانات يدوياً', phoneErr: 'تعذر الاتصال بخدمة الاستقبال، جرّب مرة تانية', phoneSecure: 'البيانات بتتشفر على الموبايل وما بتتفكش غير على الشاشة.', bgWarn: 'تنبيه: تطبيق El Hana IPTV غير مرتبط بأي موقع صور خارجي ولا يتحمل مسؤولية محتواه. استخدم الصور على مسؤوليتك.', refreshBtn: 'تحديث الواجهة', refreshedMsg: 'تم تحديث الواجهة الرئيسية والبيانات', changeBgBtn: 'تغيير الخلفية', bgChanged: 'تم تغيير خلفية الواجهة الرئيسية', bgReset: 'تمت استعادة الخلفية الافتراضية', bgModalTitle: 'تغيير خلفية الواجهة الرئيسية', bgPhoneTitle: '1. رفع صورة من تليفونك (QR)', bgPhoneDesc: 'امسح الكود بكاميرا تليفونك لرفع الصورة على موقع استضافة مجاني ثم الصق رابط الصورة المباشر هنا، أو اختر صورة من الجهاز مباشرة:', bgDirectTitle: '2. اختيار صورة من الجهاز أو رابط مباشر', bgPickDevice: 'اختيار صورة من الجهاز / الفلاشة', bgUrlPh: 'الصق رابط الصورة المباشر (https://...)', bgApplyUrlBtn: 'تطبيق رابط الصورة', stStop: 'إنهاء الاختبار', stStopped: 'تم إيقاف الاختبار', sbSize: 'حجم خط شريط السرعة', szSmall: 'صغير', szMed: 'متوسط', szLarge: 'كبير', szXL: 'ضخم', sbPkgWarn: '⚠️ تنبيه هام: تفعيل شريط السرعة العلوي أو إجراء اختبارات السرعة المتكررة يستهلك من باقة الإنترنت (وي WE) أثناء التشغيل. إذا كنت على باقة محدودة يُنصح بإيقافه من الأعلى لتوفير الباقة.', timeSync: 'ضبط الوقت تلقائياً', timeReset: 'وقت التلفزيون', timeSyncing: 'جاري مزامنة الوقت…', timeSynced: 'تم ضبط الوقت بنجاح', timeSyncFail: 'تعذر ضبط الوقت', secThemes: 'السمات والمظهر', secSubInfo: 'بيانات الاشتراك', secDevInfo: 'بيانات الجهاز', secContact: 'تواصل بنا', secAbout: 'من نحن', secClearData: 'مسح البيانات', themeChoose: 'اختر سمة بالصور للواجهة:', bgResetBtn: 'استعادة الخلفية الافتراضية', thDefault: 'الافتراضي الملكي', thAhly: 'النادي الأهلي 🔴', thZamalek: 'نادي الزمالك ⚪', thIslamic: 'المسجد النبوي 🕌', thQuran: 'الكعبة المشرفة 🕋', thKids: 'عالم الأطفال 🧸', thAvengers: 'أفينجرز ⚡', thIronman: 'أيرون مان 🦾', thGold: 'الذهبي الفاخر ✨', thMidnight: 'ليلي هادئ 🌙', praiseTop: '⭐ عمل استثنائي بتقييم مرتفع على IMDb! يُعد من أبرز الأعمال الموصى بمشاهدتها لما يتميز به من حبكة مشوقة وإخراج متقن.', praiseGood: '🎬 عمل مميز يحظى بإشادة الجمهور على IMDb، يجمع بين الإثارة وجودة الأداء التمثيلي.', praiseAvg: '🍿 خيار ترفيهي ممتع للمشاهدة العائلية ومتابعي هذا التصنيف.', subUser: 'اسم المستخدم', subStatus: 'حالة الاشتراك', subExp: 'تاريخ الانتهاء', subMaxConn: 'أقصى عدد أجهزة', subActiveConn: 'المتصل حالياً', subServer: 'رابط السيرفر', subType: 'نوع الحساب', devPlatform: 'نظام التشغيل', devRes: 'دقة الشاشة', devLang: 'لغة الجهاز', devNet: 'حالة الاتصال', devAppVer: 'إصدار التطبيق', devStorage: 'حجم البيانات المحفوظة', contactTitle: 'يسعدنا تواصلكم معنا للدعم الفني والاستفسارات:', contactEmailLbl: 'البريد الإلكتروني', contactPhoneLbl: 'رقم الهاتف / واتساب', contactDevLbl: 'المطور', aboutText: 'تطبيق El Hana IPTV هو مشغّل وسائط ذكي متطور يوفّر تجربة مشاهدة سلسة وسريعة للقنوات المباشرة والأفلام والمسلسلات بجودة عالية مع دعم تعدد الحسابات والسمات المخصصة.\n\nتنويه قانوني: التطبيق عبارة عن مشغّل تقني فقط ولا يتضمن أو يبيع أي محتوى مرئي.', clearWarn: 'سيؤدي مسح البيانات إلى حذف جميع الحسابات المحفوظة، المفضلة، سجل المشاهدة، والسمات والعودة إلى نقطة البداية من جديد.', clearBtn: 'مسح جميع البيانات وإعادة التشغيل', clearDone: 'تم مسح البيانات بنجاح… جاري إعادة التشغيل', termsTitle: 'سياسة الخصوصية والشروط والأحكام', termsAccept: 'موافق (Accept)', termsDecline: 'رفض وخروج', termsText: 'مرحباً بك في تطبيق El Hana IPTV.\n\n1. طبيعة التطبيق: هذا التطبيق هو مشغّل وسائط تقني فقط، ولا يوفّر أو يبيع أو يستضيف أي قنوات تلفزيونية أو أفلام أو مسلسلات أو قوائم تشغيل.\n2. مسؤولية المحتوى: المستخدم هو المسؤول الوحيد عن الروابط والبيانات (Xtream Codes أو M3U) التي يقوم بإدخالها، ويجب أن يمتلك حقوق الوصول القانونية لها.\n3. الخصوصية: يتم حفظ بيانات اشتراكك ومفضلتك وسجل مشاهداتك محلياً على جهازك فقط ولا يتم مشاركتها مع أي طرف ثالث.\n\nبالضغط على «موافق»، فإنك تقر بموافقتك الكاملة على هذه الشروط وسياسة الخصوصية.',
      secUpdate: 'تحديث التطبيق', updTitle: 'مركز تحديث التطبيق', updDesc: 'يمكنك التحقق من توفر إصدارات جديدة وتحديث التطبيق مباشرة للحصول على أحدث التحسينات.', updVer: 'الإصدار الحالي', updCheck: 'تحديث التطبيق الآن', updReset: 'العودة للنسخة الأصلية', updChecking: 'جاري البحث عن تحديث للتطبيق…', updLatest: 'التطبيق محدّث إلى آخر إصدار', updDone: 'تم تنزيل التحديث بنجاح… جاري إعادة التشغيل', updReady: 'يتوفر تحديث جديد للتطبيق، أعد فتح التطبيق للتفعيل', updFail: 'تعذر التحديث، تأكد من الاتصال بالإنترنت', updResetDone: 'تم الرجوع للنسخة الأصلية… جاري إعادة التشغيل'
    },
    en: {
      name_ph: 'Account name (e.g. Home)', host_ph: 'Server URL or full get.php link', user_ph: 'Username', pass_ph: 'Password', m3u_ph: 'M3U playlist URL',
      addSignIn: 'Add & sign in',
      disc: 'El Hana IPTV is a media player only. It does not include, provide or sell any channels, movies or other content. To use it, enter your own Xtream Codes details or M3U playlist link from your service provider.',
      need: 'Please enter the server URL, username and password', m3uNeed: 'Please enter the M3U playlist URL', verifying: 'Verifying…', m3uLoading: 'Loading M3U playlist…',
      m3uEmpty: 'No entries found in the M3U playlist', badauth: 'Invalid login details', inactive: 'Subscription is not active: ', myacct: 'My account',
      badjson: 'Invalid response from the server', srvErr: 'Server error (', connErr: 'Cannot connect to the server', timeout: 'Connection timed out',
      back: 'Back', accountsT: 'Accounts', addAcc: 'Add new account', noAccounts: 'No saved accounts',
      expires: 'Expires: ', live: 'Live TV', movies: 'Movies', series: 'Series', favorites: 'Favorites', settings: 'Settings', switchAcct: 'Switch account',
      home: 'Home', search_ph: 'Search in this section', hideCats: 'Hide categories', showCats: 'Show categories', noCats: 'No categories', noContent: 'No content',
      searchRes: 'Search results: ', more: 'Show more', newb: 'NEW', season: 'Season', episode: 'Episode', episodes: 'episodes', noEps: 'No episodes', loading: 'Loading…',
      noFav: 'Nothing in favorites yet', favAdd: 'Add to favorites', favRemove: 'Remove from favorites', favHint: 'Yellow remote button = add / remove favorite',
      play: 'Play', noPlot: 'No details available', nowLbl: 'Now: ', nextLbl: 'Next: ', dirLbl: 'Director: ', castLbl: 'Cast: ', minShort: 'min',
      newOnSrv: 'New on your server: ', movie1: 'movie', movieN: 'movies', series1: 'series', seriesN: 'series', and: 'and',
      resume: 'Resuming from ', buffering: 'Loading…', cantPlay: 'Unable to play — try External Player button', liveLbl: 'LIVE',
      qualOnly: 'Quality switching is only available for live channels with several qualities', qualRead: 'Reading available qualities…', qualOne: 'This channel has only one quality',
      qualAuto: 'Auto (highest)', qLow: '— Lowest', qHigh: '— Highest', qTitle: 'Quality (lowest to highest)', qDone: 'Quality changed', qFail: 'Could not read qualities from the server',
      noAudio: 'No other audio tracks in this stream', track: 'Track', audioDone: 'Audio track changed', audioTitle: 'Audio track / commentary',
      btnQuality: 'Quality', btnAudio: 'Audio / Commentary', btnExtPlayer: 'External Player', extOpening: 'Opening external player…',
      rew: 'Back 10 seconds', fwd: 'Forward 30 seconds', stop: 'Stop',
      exitQ: 'Do you want to exit the app?', ok: 'OK', cancel: 'Cancel', offline: 'No internet connection', online: 'Internet connection restored',
      secGeneral: 'General', secTime: 'Time', secSpeedbar: 'Speed bar', secSpeedtest: 'Speed test',
      language: 'Language', sound: 'Navigation sound', on: 'On', off: 'Off', clockFmt: 'Clock format', h12: '12-hour', h24: '24-hour', am: 'AM', pm: 'PM', nowTime: 'Current time: ',
      sbShow: 'Show speed bar', sbColor: 'Speed bar color', cWhite: 'White', cBlack: 'Black', cYellow: 'Yellow', cCyan: 'Cyan', cGreen: 'Green', cRed: 'Red',
      stStart: 'Start test', stRunning: 'Testing…', stPing: 'Ping', stDown: 'Download', stUp: 'Upload', stDone: 'Test complete', stFail: 'Test failed, check your connection',
      stNote: 'The test connects only when you press "Start test".', exitAppBtn: 'Exit', catsLbl: 'Sidebar', phoneAddBtn: 'Add from phone (QR)', phoneTitle: 'Add an account from your phone', phoneStep1: '1) Scan this code with your phone camera', phoneStep2: '2) Enter your Xtream details or M3U link on the page and press Send', phoneWaiting: 'Waiting for your phone…', phoneGot: 'Details received, signing in…', phoneNoCrypto: 'This device does not support secure transfer; please type the details', phoneErr: 'Could not reach the relay service, please try again', phoneSecure: 'Details are encrypted on your phone and only decrypted here.', bgWarn: 'Notice: El Hana IPTV is not affiliated with any external image website and is not responsible for their content. Use images at your own risk.', refreshBtn: 'Refresh UI', refreshedMsg: 'Home interface & cache refreshed', changeBgBtn: 'Change Background', bgChanged: 'Home background updated', bgReset: 'Default background restored', bgModalTitle: 'Change Home Screen Background', bgPhoneTitle: '1. Upload from Phone (QR)', bgPhoneDesc: 'Scan this QR code with your phone to upload your photo and paste the direct image link, or pick directly from your device:', bgDirectTitle: '2. Device File or Direct Image URL', bgPickDevice: 'Choose Image from Device / USB', bgUrlPh: 'Paste direct image URL (https://...)', bgApplyUrlBtn: 'Apply Image URL', stStop: 'Stop test', stStopped: 'Test stopped', sbSize: 'Speed bar font size', szSmall: 'Small', szMed: 'Medium', szLarge: 'Large', szXL: 'Extra Large', sbPkgWarn: '⚠️ Data Usage Warning: Enabling the top speed bar or running repeated speed tests consumes internet quota while streaming. Turn it off above if you are on a limited data plan.', timeSync: 'Sync time automatically', timeReset: 'Use device time', timeSyncing: 'Syncing time…', timeSynced: 'Time synced successfully', timeSyncFail: 'Time sync failed', secThemes: 'Themes', secSubInfo: 'Subscription Info', secDevInfo: 'Device Info', secContact: 'Contact Us', secAbout: 'About Us', secClearData: 'Clear Data', themeChoose: 'Choose a visual theme for the interface:', bgResetBtn: 'Reset Default Background', thDefault: 'Royal Default', thAhly: 'Al Ahly SC 🔴', thZamalek: 'Zamalek SC ⚪', thIslamic: 'Prophet Mosque 🕌', thQuran: 'Holy Kaaba 🕋', thKids: 'Kids World 🧸', thAvengers: 'Avengers ⚡', thIronman: 'Iron Man 🦾', thGold: 'Luxury Gold ✨', thMidnight: 'Midnight Calm 🌙', praiseTop: '⭐ Critically acclaimed on IMDb! Highly recommended for its gripping storyline and top-tier production.', praiseGood: '🎬 Popular title praised by viewers on IMDb, featuring strong performances and engaging direction.', praiseAvg: '🍿 Entertaining pick for fans of this genre.', subUser: 'Username', subStatus: 'Status', subExp: 'Expiration Date', subMaxConn: 'Max Connections', subActiveConn: 'Active Connections', subServer: 'Server URL', subType: 'Account Type', devPlatform: 'Platform / OS', devRes: 'Screen Resolution', devLang: 'Device Language', devNet: 'Network Status', devAppVer: 'App Version', devStorage: 'Saved Storage', contactTitle: 'Reach out to us for support and inquiries:', contactEmailLbl: 'Email', contactPhoneLbl: 'Phone / WhatsApp', contactDevLbl: 'Developer', aboutText: 'El Hana IPTV is an advanced smart media player offering ultra-smooth playback for Live TV, Movies, and Series with multi-account support and rich custom themes.\n\nDisclaimer: This app is strictly a media player and does not provide or sell any media content.', clearWarn: 'Clearing data will erase all saved accounts, favorites, watch progress, and custom themes, resetting the app to a fresh start.', clearBtn: 'Clear All Data & Restart', clearDone: 'All data cleared… restarting', termsTitle: 'Privacy Policy & Terms of Service', termsAccept: 'Accept', termsDecline: 'Decline & Exit', termsText: 'Welcome to El Hana IPTV.\n\n1. Media Player Only: This application is strictly a technical media player. It does not include, sell, host, or provide any TV channels, movies, series, or playlists.\n2. User Responsibility: You are solely responsible for the Xtream Codes credentials or M3U playlist links you enter and must ensure you have legal rights to access such streams.\n3. Privacy: Your account credentials, favorites, and watch progress are stored locally on your device only and are never shared with third parties.\n\nBy clicking "Accept", you agree to these Terms of Service and Privacy Policy.',
      secUpdate: 'App Update', updTitle: 'Application Update Center', updDesc: 'Check for new releases and update the application directly to receive the latest improvements.', updVer: 'Current version', updCheck: 'Update App Now', updReset: 'Revert to original', updChecking: 'Checking for app updates…', updLatest: 'App is up to date', updDone: 'Update downloaded… restarting', updReady: 'App update ready, reopen the app', updFail: 'Update failed, check internet connection', updResetDone: 'Reverted to original… restarting'
    }
  };
  var LANG = store(K.lang) || (/^ar/i.test(navigator.language || '') ? 'ar' : 'en');
  function tr(k) { return (T[LANG] && T[LANG][k]) || T.en[k] || k; }
  function applyLang() {
    var d = document.documentElement; d.lang = LANG; d.dir = LANG === 'ar' ? 'rtl' : 'ltr';
    var n = document.querySelectorAll('[data-i18n]'), i;
    for (i = 0; i < n.length; i++) n[i].textContent = tr(n[i].getAttribute('data-i18n'));
    n = document.querySelectorAll('[data-i18n-ph]');
    for (i = 0; i < n.length; i++) n[i].placeholder = tr(n[i].getAttribute('data-i18n-ph'));
    n = document.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < n.length; i++) n[i].title = tr(n[i].getAttribute('data-i18n-title'));
    n = document.querySelectorAll('.langbtn');
    for (i = 0; i < n.length; i++) n[i].textContent = LANG === 'ar' ? 'English' : 'العربية';
    toggleCats($('main').classList.contains('nocats'));
    var s = curScreen();
    if (s === 'accounts') renderAccounts();
    if (s === 'settings') { renderSettings(setSec); }
    if (s === 'detail') updDetButtons();
    if (s === 'home') showHomeInfo();
  }

  /* ---------- شبكة ---------- */
  function xhr(url, timeout, asText) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.timeout = timeout || 45000;
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) {
          if (asText) { resolve({ text: x.responseText, url: x.responseURL || url }); return; }
          try { resolve(JSON.parse(x.responseText)); } catch (e) { reject(new Error(tr('badjson'))); }
        } else reject(new Error(tr('srvErr') + x.status + ')'));
      };
      x.onerror = function () { reject(new Error(tr('connErr'))); };
      x.ontimeout = function () { reject(new Error(tr('timeout'))); };
      x.send();
    });
  }
  function api(action, extra, timeout) {
    return xhr(cfg.host + '/player_api.php?username=' + encodeURIComponent(cfg.user) + '&password=' + encodeURIComponent(cfg.pass) +
      (action ? '&action=' + action : '') + (extra || ''), timeout);
  }

  /* ---------- صوت خفيف عند التنقل ---------- */
  var soundOn = store(K.snd) !== false, ac = null, lastTick = 0;
  function tick() {
    if (!soundOn) return;
    var now = Date.now(); if (now - lastTick < 45) return; lastTick = now;
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!ac) ac = new AC();
      var o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime;
      o.type = 'sine'; o.frequency.value = 1500;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
      o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.06);
    } catch (e) {}
  }

  /* ---------- الشاشات ---------- */
  function showScreen(id) { for (var i = 0; i < SCREENS.length; i++) $(SCREENS[i]).classList.toggle('hidden', SCREENS[i] !== id); }
  function curScreen() { for (var i = 0; i < SCREENS.length; i++) if (!$(SCREENS[i]).classList.contains('hidden')) return SCREENS[i]; return ''; }
  function setMsg(t) { $('loginMsg').textContent = t || ''; $('accMsg').textContent = t || ''; }

  /* ---------- حسابات ---------- */
  function acctKey(c) { return c.type === 'm3u' ? 'm3u|' + c.url : c.host + '|' + c.user; }
  function accounts() { var a = store(K.acc); if (!Array.isArray(a)) return []; for (var i = 0; i < a.length; i++) if (!a[i].type) a[i].type = 'xtream'; return a; }
  function shortUrl(u) { return String(u).replace(/^https?:\/\//, '').replace(/[?#].*$/, ''); }
  function parseServer(raw) {
    raw = (raw || '').trim(); if (!raw) return null;
    if (!/^https?:\/\//i.test(raw)) raw = 'http://' + raw;
    var m = raw.match(/^(https?:\/\/[^\/?#]+)/i);
    var out = { host: m ? m[1] : raw.replace(/\/+$/, '') };
    var u = raw.match(/[?&]username=([^&#]+)/i), p = raw.match(/[?&]password=([^&#]+)/i);
    if (u) out.user = decodeURIComponent(u[1]);
    if (p) out.pass = decodeURIComponent(p[1]);
    return out;
  }
  function renderAccounts() {
    var a = accounts(), h = '';
    for (var i = 0; i < a.length; i++) {
      var c = a[i];
      h += '<div class="arow"><button class="f accbtn" data-a="' + i + '"><b>' + esc(c.name) + '</b><small>' +
        (c.type === 'm3u' ? 'M3U · ' + esc(shortUrl(c.url)) : 'Xtream · ' + esc(shortUrl(c.host))) + '</small></button>' +
        '<button class="f x" data-del="' + i + '">✕</button></div>';
    }
    $('accList').innerHTML = h || '<div class="empty">' + tr('noAccounts') + '</div>';
  }
  function showAccounts() {
    setMsg(''); renderAccounts(); showScreen('accounts');
    var f = $('accList').querySelector('.f') || $('btnAddAcc'); f.focus();
  }
  function showForm() {
    if ($('btnPhoneAdd')) $('btnPhoneAdd').classList.toggle('hidden', !!window.AndroidApp);
    setMsg('');
    $('inName').value = '';
    $('inHost').value = '';
    $('inUser').value = '';
    $('inPass').value = '';
    $('inUrl').value = '';
    setLoginType('xtream');
    showScreen('login');
    $('inName').focus();
  }
  function setLoginType(t) {
    loginType = t;
    var o = document.querySelectorAll('.typesw .opt'), i;
    for (i = 0; i < o.length; i++) o[i].classList.toggle('on', o[i].getAttribute('data-ltype') === t);
    var xt = document.querySelectorAll('.xt'), m3 = document.querySelectorAll('.m3');
    for (i = 0; i < xt.length; i++) xt[i].classList.toggle('hidden', t !== 'xtream');
    for (i = 0; i < m3.length; i++) m3[i].classList.toggle('hidden', t !== 'm3u');
  }
  function doLogin() {
    var name = $('inName').value.trim();
    if (loginType === 'm3u') {
      var url = $('inUrl').value.trim();
      if (!url) { setMsg(tr('m3uNeed')); return; }
      if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
      attempt({ type: 'm3u', name: name || shortUrl(url), url: url }, true);
      return;
    }
    var s = parseServer($('inHost').value);
    var user = $('inUser').value.trim(), pass = $('inPass').value.trim();
    if (s && s.user && !user) user = s.user;
    if (s && s.pass && !pass) pass = s.pass;
    if (!s || !user || !pass) { setMsg(tr('need')); return; }
    attempt({ type: 'xtream', name: name || shortUrl(s.host), host: s.host, user: user, pass: pass }, true);
  }
  function attempt(c, remember, onFail) {
    var prev = { cfg: cfg, info: info, m3u: m3u }, p;
    setMsg(tr(c.type === 'm3u' ? 'm3uLoading' : 'verifying')); busy(true);
    if (c.type === 'm3u') {
      p = xhr(c.url, 120000, true).then(function (r) {
        var data = buildM3U(r.text);
        if (!data) throw new Error(tr('m3uEmpty'));
        return { m3u: data };
      });
    } else {
      cfg = c;
      p = api('').then(function (r) {
        var ui = r && r.user_info;
        if (!ui || String(ui.auth) !== '1') throw new Error(tr('badauth'));
        if (ui.status && ui.status !== 'Active') throw new Error(tr('inactive') + ui.status);
        return { info: ui };
      });
    }
    p.then(function (res) {
      busy(false);
      cfg = c; m3u = res.m3u || null; info = res.info || null;
      if (remember) {
        var a = accounts(), idx = -1;
        for (var i = 0; i < a.length; i++) if (acctKey(a[i]) === acctKey(c)) idx = i;
        if (idx < 0) { a.push(c); idx = a.length - 1; } else a[idx] = c;
        store(K.acc, a); store(K.cur, idx);
      }
      cache = { cats: {}, streams: {} };
      favs = store(K.fav + '.' + acctKey(c)) || [];
      state.type = 'live'; setMsg('');
      showHome(); setTimeout(checkNew, 4000);
    }).catch(function (e) {
      busy(false);
      cfg = prev.cfg; info = prev.info; m3u = prev.m3u;
      setMsg(e.message); if (onFail) onFail();
    });
  }

  /* ---------- M3U ---------- */
  var SE = /^(.*?)[\s._\-]*[Ss](\d{1,2})[\s._\-]*[Ee](\d{1,3})/;
  function classify(it) {
    var u = it.url.toLowerCase(), g = (it.group || '').toLowerCase();
    if (/\/series\//.test(u)) return 'series';
    if (/\/movie\//.test(u)) return 'movies';
    if (/(^|[^a-z])(series|seasons?|tv shows?)([^a-z]|$)|مسلسل/.test(g)) return 'series';
    if (/movie|film|vod|cinema|فيلم|أفلام|افلام/.test(g)) return 'movies';
    if (/\.(mp4|mkv|avi|mov)(\?|$)/.test(u)) return SE.test(it.name) ? 'series' : 'movies';
    return 'live';
  }
  function buildM3U(text) {
    var lines = text.split(/\r?\n/), items = [], cur = null, i, L, m;
    for (i = 0; i < lines.length; i++) {
      L = lines[i].trim(); if (!L) continue;
      if (L.indexOf('#EXTINF') === 0) {
        cur = { name: '', logo: '', group: '' };
        m = L.match(/tvg-logo="([^"]*)"/i); if (m) cur.logo = m[1];
        m = L.match(/group-title="([^"]*)"/i); if (m) cur.group = m[1];
        var c = L.lastIndexOf(','); cur.name = (c >= 0 ? L.slice(c + 1) : '').trim();
        if (!cur.name) { m = L.match(/tvg-name="([^"]*)"/i); if (m) cur.name = m[1]; }
      } else if (L.charAt(0) === '#') {
        if (L.indexOf('#EXTGRP:') === 0 && cur && !cur.group) cur.group = L.slice(8).trim();
      } else if (cur) { cur.url = L; items.push(cur); cur = null; }
    }
    if (!items.length) return null;
    function mk() { return { cats: [], by: {}, all: [], idx: {} }; }
    var data = { live: mk(), movies: mk(), series: mk(), seriesById: {} }, smap = {};
    function addTo(ty, group, o) {
      var d = data[ty], g = group || 'Other';
      if (d.idx[g] === undefined) { d.idx[g] = d.cats.length; d.cats.push({ category_id: String(d.idx[g]), category_name: g }); d.by[d.idx[g]] = []; }
      d.by[d.idx[g]].push(o); d.all.push(o);
    }
    for (i = 0; i < items.length; i++) {
      var it = items[i], ty = classify(it);
      if (ty === 'series') {
        var mm = it.name.match(SE), sname = mm ? mm[1].replace(/[\s\-_.]+$/, '') || it.name : it.name, sn = mm ? +mm[2] : 1, key = (it.group || '') + '|' + sname;
        var so = smap[key];
        if (!so) {
          so = smap[key] = { name: sname, stream_icon: it.logo, _id: 's:' + key, series_id: 's:' + key, _eps: {}, _n: 0 };
          data.seriesById[so._id] = so; addTo('series', it.group, so);
        }
        so._n++;
        (so._eps[sn] = so._eps[sn] || []).push({ id: it.url, title: it.name, ep: mm ? +mm[3] : so._n, season: sn, url: it.url });
      } else {
        addTo(ty, it.group, { name: it.name, stream_icon: it.logo, _id: it.url, _url: it.url });
      }
    }
    return data;
  }

  /* ---------- السمات بالصور الحقيقية + تغيير الخلفية من التليفون ---------- */
  var THEMES = [
    { id: 'default', name: 'thDefault', bg: '#090e1c', bg1: '#1b2a5e', bg2: '#2a1b5e', card: '#161e38', ac: '#5f8fff', ac2: '#8a6bff', img: '' },
    { id: 'ahly',    name: 'thAhly',    bg: '#140407', bg1: '#8b0016', bg2: '#3d0009', card: '#24090e', ac: '#e50914', ac2: '#b8000c', img: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1600&q=80' },
    { id: 'zamalek', name: 'thZamalek', bg: '#121318', bg1: '#3a3f4d', bg2: '#7a0c18', card: '#1e212b', ac: '#ffffff', ac2: '#d90429', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zamalek_SC_Banner,_Egyptian_Premier_League,_Borg_El_Arab_Stadium_01.jpg?width=1600' },
    { id: 'islamic', name: 'thIslamic', bg: '#071410', bg1: '#0f4c3a', bg2: '#4a3508', card: '#0e241d', ac: '#d4af37', ac2: '#1b7a5e', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Al-Masjid_an_Nabawi.jpg?width=1600' },
    { id: 'quran',   name: 'thQuran',   bg: '#04120b', bg1: '#0b5332', bg2: '#072b1b', card: '#0a2116', ac: '#10b981', ac2: '#059669', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Masjid-Al-Nabawi_Madinah.jpg?width=1600' },
    { id: 'kids',    name: 'thKids',    bg: '#100c29', bg1: '#ff6b6b', bg2: '#4ecdc4', card: '#1d1745', ac: '#ff9f1c', ac2: '#2ec4b6', img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=80' },
    { id: 'avengers',name: 'thAvengers',bg: '#0b0c1d', bg1: '#311b92', bg2: '#004d40', card: '#151733', ac: '#7c4dff', ac2: '#00bfa5', img: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1600&q=80' },
    { id: 'ironman', name: 'thIronman', bg: '#170606', bg1: '#991b1b', bg2: '#92400e', card: '#290d0d', ac: '#f59e0b', ac2: '#dc2626', img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=1600&q=80' },
    { id: 'gold',    name: 'thGold',    bg: '#110e08', bg1: '#4d3b14', bg2: '#1f190c', card: '#1f1a10', ac: '#eab308', ac2: '#ca8a04', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80' },
    { id: 'midnight',name: 'thMidnight',bg: '#05070d', bg1: '#111827', bg2: '#090d16', card: '#0f172a', ac: '#38bdf8', ac2: '#0284c7', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1600&q=80' }
  ];
  function currentThemeObj() {
    var tid = store(K.theme) || 'default';
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === tid) return THEMES[i];
    return THEMES[0];
  }
  function applyTheme(id) {
    if (id) store(K.theme, id);
    var th = currentThemeObj();
    var r = document.documentElement.style;
    r.setProperty('--bg', th.bg); r.setProperty('--bg1', th.bg1); r.setProperty('--bg2', th.bg2);
    r.setProperty('--card', th.card); r.setProperty('--ac', th.ac); r.setProperty('--ac2', th.ac2);
    applyCustomBg();
  }
  function applyCustomBg() {
    var customBg = null;
    try { customBg = localStorage.getItem(K.bg); } catch (e) {}
    var th = currentThemeObj();
    var finalImg = customBg || th.img || '';
    if (finalImg) {
      document.body.style.backgroundImage = 'linear-gradient(rgba(6,10,22,0.55), rgba(6,10,22,0.68)), url("' + finalImg + '")';
    } else {
      document.body.style.backgroundImage = '';
    }
  }
  function bgModalOpen() { return !$('bgdlg').classList.contains('hidden'); }
  function openBgModal() {
    var uploadHost = 'https://postimages.org/';
    var qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(uploadHost);
    $('bgQrWrap').innerHTML = '<img src="' + qrSrc + '" alt="QR"><div class="bg-qr-url">postimages.org</div>';
    $('inBgUrl').value = '';
    $('btnBgLocalFile').classList.toggle('hidden', !window.AndroidApp);
    $('bgdlg').classList.remove('hidden');
    (window.AndroidApp ? $('btnBgLocalFile') : $('inBgUrl')).focus();
  }
  function closeBgModal() {
    $('bgdlg').classList.add('hidden');
    if (curScreen() === 'home' && $('btnHomeBg')) $('btnHomeBg').focus();
    else if (curScreen() === 'settings') renderSettings('themes');
  }
  function screenSize() {
    var w = Math.max(window.screen.width || 0, window.innerWidth || 0) || 1920, h = Math.max(window.screen.height || 0, window.innerHeight || 0) || 1080;
    if (w < h) { var t = w; w = h; h = t; }
    var k = Math.min(1, 1920 / w);
    return { w: Math.round(w * k), h: Math.round(h * k) };
  }
  function fitBgToScreen(src, done) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        var s = screenSize(), cv = document.createElement('canvas');
        cv.width = s.w; cv.height = s.h;
        var r = Math.max(s.w / img.width, s.h / img.height), dw = img.width * r, dh = img.height * r;
        cv.getContext('2d').drawImage(img, (s.w - dw) / 2, (s.h - dh) / 2, dw, dh);
        done(cv.toDataURL('image/jpeg', 0.8));
      } catch (err) { done(null); }
    };
    img.onerror = function () { done(null); };
    img.src = src;
  }
  function saveBg(value) {
    try { localStorage.setItem(K.bg, value); } catch (e) { toast(tr('bgTooBig') || 'Image too large', 3000); return; }
    applyCustomBg(); closeBgModal(); toast(tr('bgChanged'), 3000);
  }
  function pickHomeBg() {
    var inp = $('bgFileInput');
    if (!inp) return;
    inp.value = '';
    inp.onchange = function () {
      var file = inp.files && inp.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) { fitBgToScreen(ev.target.result, function (d) { if (d) saveBg(d); }); };
      reader.readAsDataURL(file);
    };
    inp.click();
  }
  function applyBgUrl() {
    var u = $('inBgUrl').value.trim();
    if (!u) return;
    fitBgToScreen(u, function (d) { saveBg(d || u); });
  }
  function resetHomeBg() {
    try { localStorage.removeItem(K.bg); } catch (e) {}
    applyCustomBg();
    closeBgModal();
    toast(tr('bgReset'), 3000);
  }

  /* ---------- الطقس والموقع (GPS + IP تلقائي) ---------- */
  var weatherData = { temp: null, city: '', code: null, fetched: 0 };
  function weatherIcon(c) {
    if (c == null) return '⛅';
    if (c === 0) return '☀️';
    if (c <= 3) return '⛅';
    if (c <= 48) return '🌫️';
    if (c <= 67) return '🌧️';
    if (c <= 77) return '❄️';
    return '⛈️';
  }
  function fetchWeatherByCoords(lat, lon, cityLabel) {
    xhr('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true', 10000).then(function (w) {
      if (w && w.current_weather) {
        weatherData.temp = Math.round(w.current_weather.temperature);
        weatherData.code = w.current_weather.weathercode;
        if (cityLabel) weatherData.city = cityLabel;
        weatherData.fetched = Date.now();
        updHomeWidget();
      }
    }).catch(function () {});
  }
  function initWeather() {
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(function (pos) {
          fetchWeatherByCoords(pos.coords.latitude.toFixed(3), pos.coords.longitude.toFixed(3), weatherData.city || (LANG === 'ar' ? 'موقعك الحالي' : 'Local'));
        }, function () { fetchWeatherByIp(); }, { timeout: 5000 });
        return;
      } catch (e) {}
    }
    fetchWeatherByIp();
  }
  function fetchWeatherByIp() {
    xhr('https://ipapi.co/json/', 10000).then(function (loc) {
      if (loc && loc.latitude && loc.longitude) {
        fetchWeatherByCoords(loc.latitude, loc.longitude, loc.city || loc.country_name || '');
      }
    }).catch(function () {
      fetchWeatherByCoords(31.036, 30.468, LANG === 'ar' ? 'مصر' : 'Egypt');
    });
  }
  function updHomeWidget() {
    var d = nowDate();
    if ($('hwTime')) $('hwTime').textContent = fmtClockDate(d);
    if ($('hwDate')) $('hwDate').textContent = d.getFullYear() + '/' + two(d.getMonth() + 1) + '/' + two(d.getDate());
    if ($('hwLoc')) $('hwLoc').textContent = weatherData.city || (LANG === 'ar' ? 'الطقس المحلي' : 'Local Weather');
    if ($('hwWeather')) $('hwWeather').textContent = weatherData.temp != null ? (weatherIcon(weatherData.code) + ' ' + weatherData.temp + '°C') : '⛅ --°C';
  }

  /* ---------- الرئيسية ---------- */
  function showHomeInfo() {
    $('acctName').textContent = cfg ? cfg.name : '';
    if (info && info.exp_date && +info.exp_date > 0) {
      var d = new Date(+info.exp_date * 1000);
      $('expiry').textContent = tr('expires') + d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
    } else $('expiry').textContent = cfg && cfg.type === 'm3u' ? 'M3U' : '';
    updHomeWidget();
  }
  function showHome() {
    showScreen('home'); showHomeInfo();
    var tiles = document.querySelectorAll('.tile'), want = tiles[0];
    for (var i = 0; i < tiles.length; i++) if (tiles[i].getAttribute('data-type') === state.type) want = tiles[i];
    if (want && want.focus) want.focus();
  }
  function refreshHome() {
    cache = { cats: {}, streams: {} };
    if (cfg) attempt(cfg, false);
    else showHomeInfo();
    initWeather();
    toast(tr('refreshedMsg'), 2500);
  }
  function enterSection(t) { showScreen('main'); setType(t, true); }

  /* ---------- مفضلة ---------- */
  function itType() { return state.type === 'fav' ? state.favCat : state.type; }
  function itId(ty, s) { return s._id !== undefined ? s._id : (ty === 'series' ? s.series_id : s.stream_id); }
  function itIcon(s) { return s.stream_icon || s.cover || ''; }
  function favKey() { return K.fav + '.' + acctKey(cfg); }
  function isFav(ty, id) { for (var i = 0; i < favs.length; i++) if (favs[i].t === ty && favs[i].id === String(id)) return true; return false; }
  function toggleFav(ty, s) {
    var id = String(itId(ty, s)), i;
    for (i = 0; i < favs.length; i++) if (favs[i].t === ty && favs[i].id === id) { favs.splice(i, 1); store(favKey(), favs); return false; }
    favs.push({ t: ty, id: id, name: s.name, icon: itIcon(s), ext: s.container_extension || '', rating: s.rating || '', url: s._url || '' });
    store(favKey(), favs); return true;
  }
  function favToItem(f) {
    var o;
    if (cfg.type === 'm3u') {
      o = { name: f.name, stream_icon: f.icon, _id: f.id, _url: f.url, rating: f.rating };
      if (f.t === 'series' && m3u && m3u.seriesById[f.id]) { o._eps = m3u.seriesById[f.id]._eps; o.series_id = f.id; }
      return o;
    }
    o = { name: f.name, stream_icon: f.icon, rating: f.rating, container_extension: f.ext };
    if (f.t === 'series') o.series_id = f.id; else o.stream_id = f.id;
    return o;
  }
  function favItems(ty) { var out = []; for (var i = 0; i < favs.length; i++) if (favs[i].t === ty) out.push(favToItem(favs[i])); return out; }
  function updHearts() {
    var els = $('grid').querySelectorAll('.item[data-i]'), ty = itType();
    for (var i = 0; i < els.length; i++) {
      var s = state.list[+els[i].getAttribute('data-i')], h = els[i].querySelector('.heart');
      if (s && h) h.classList.toggle('on', isFav(ty, itId(ty, s)));
    }
  }

  /* ---------- التصفح ---------- */
  var ACT = {
    live: { cats: 'get_live_categories', list: 'get_live_streams' },
    movies: { cats: 'get_vod_categories', list: 'get_vod_streams' },
    series: { cats: 'get_series_categories', list: 'get_series' }
  };
  function setType(t, focus) {
    state.type = t; state.catId = null;
    $('search').value = '';
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('on', tabs[i].getAttribute('data-type') === t);
    $('grid').innerHTML = ''; $('crumb').textContent = ''; $('cats').innerHTML = '';
    $('favhint').style.visibility = 'visible';
    if (t === 'fav') {
      var types = ['live', 'movies', 'series'], h = '', first = null;
      for (i = 0; i < types.length; i++) {
        var n = 0; for (var j = 0; j < favs.length; j++) if (favs[j].t === types[i]) n++;
        if (n && !first) first = types[i];
        h += '<button class="f cat" data-id="' + types[i] + '">' + esc(tr(types[i])) + ' (' + n + ')</button>';
      }
      $('cats').innerHTML = h;
      openCat(first || 'live', focus);
      return;
    }
    loadCats(t).then(function (cats) {
      if (state.type !== t) return;
      var h2 = '';
      for (var k = 0; k < cats.length; k++)
        h2 += '<button class="f cat" data-id="' + esc(cats[k].category_id) + '">' + esc(cats[k].category_name) + '</button>';
      $('cats').innerHTML = h2 || '<div class="empty">' + tr('noCats') + '</div>';
      if (cats.length) openCat(String(cats[0].category_id), focus);
    }).catch(function (e) { busy(false); $('cats').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function loadCats(t) {
    if (m3u) return Promise.resolve(m3u[t].cats);
    if (cache.cats[t]) return Promise.resolve(cache.cats[t]);
    busy(true);
    return api(ACT[t].cats).then(function (r) { busy(false); cache.cats[t] = Array.isArray(r) ? r : []; return cache.cats[t]; });
  }
  function loadStreams(t, catId) {
    if (m3u) return Promise.resolve(catId ? (m3u[t].by[catId] || []) : m3u[t].all);
    var k = t + ':' + (catId || 'all');
    if (cache.streams[k]) return Promise.resolve(cache.streams[k]);
    busy(true);
    return api(ACT[t].list, catId ? '&category_id=' + encodeURIComponent(catId) : '').then(function (r) {
      busy(false); cache.streams[k] = Array.isArray(r) ? r : []; return cache.streams[k];
    });
  }
  function openCat(id, focus) {
    var t = state.type; state.catId = id;
    var btns = document.querySelectorAll('.cat'), name = '';
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-id') === id;
      btns[i].classList.toggle('on', on); if (on) name = btns[i].textContent;
    }
    $('crumb').textContent = name;
    if (t === 'fav') {
      state.favCat = id; showList(favItems(id));
      if (focus) { var ff = $('grid').querySelector('.f') || $('cats').querySelector('.cat.on'); if (ff) ff.focus(); }
      return;
    }
    loadStreams(t, id).then(function (list) {
      if (state.type !== t || state.catId !== id) return;
      showList(list);
      if (focus) { var f = $('grid').querySelector('.f') || $('cats').querySelector('.cat.on'); if (f) f.focus(); }
    }).catch(function (e) { busy(false); $('grid').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function showList(list) {
    state.list = list; state.shown = 0; state.mode = itType() === 'live' ? 'rows' : 'posters';
    $('grid').className = state.mode; $('grid').innerHTML = '';
    if (!list.length) { $('grid').innerHTML = '<div class="empty">' + tr(state.type === 'fav' ? 'noFav' : 'noContent') + '</div>'; return; }
    renderMore(); $('content').scrollTop = 0;
  }
  function renderMore() {
    var old = $('grid').querySelector('.more'); if (old) old.parentNode.removeChild(old);
    var end = Math.min(state.shown + PAGE, state.list.length), h = '', weekAgo = Date.now() / 1000 - 7 * 86400, ty = itType();
    for (var i = state.shown; i < end; i++) {
      var s = state.list[i], img = itIcon(s), nm = String(s.name || '');
      var letter = esc(nm.replace(/^[^A-Za-z0-9\u0600-\u06FF]+/, '').charAt(0) || '•');
      var badge = '', nw = '';
      if (ty !== 'live' && s.rating && +s.rating > 0) badge = '<span class="badge">&#9733; ' + (+s.rating).toFixed(1) + '</span>';
      if (+(s.added || s.last_modified) > weekAgo) nw = '<span class="newb">' + tr('newb') + '</span>';
      var pct = getWatchPct(ty, s);
      var progHtml = pct > 0 ? '<div class="prog-wrap"><div class="prog-track"><div class="prog-fill" style="width:' + pct + '%"></div></div><span class="prog-pct">' + pct + '%</span></div>' : '';
      h += '<button class="f item" data-i="' + i + '"><div class="img"><span class="ph">' + letter + '</span>' +
        (img ? '<img src="' + esc(img) + '" onerror="this.style.display=\'none\'">' : '') + badge + nw +
        '</div><span class="heart' + (isFav(ty, itId(ty, s)) ? ' on' : '') + '">&#9829;</span><div class="t">' + esc(nm) + '</div>' + progHtml + '</button>';
    }
    state.shown = end;
    if (end < state.list.length) h += '<button class="f btn more">' + tr('more') + ' (' + (state.list.length - end) + ')</button>';
    $('grid').insertAdjacentHTML('beforeend', h);
  }
  function doSearch() {
    var q = $('search').value.trim().toLowerCase(), t = state.type;
    if (!q) { if (state.catId) openCat(state.catId, false); return; }
    $('crumb').textContent = tr('searchRes') + q;
    function flt(all) { showList(all.filter(function (s) { return String(s.name).toLowerCase().indexOf(q) !== -1; })); }
    if (t === 'fav') { flt(favItems(state.favCat)); return; }
    loadStreams(t, null).then(function (all) { if (state.type === t) flt(all); })
      .catch(function (e) { busy(false); $('grid').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function toggleCats(force) {
    var m = $('main'), hide = force === undefined ? !m.classList.contains('nocats') : force;
    m.classList.toggle('nocats', hide); store(K.cats, hide);
    $('btnCats').classList.toggle('on', !hide);
  }

  /* ---------- روابط التشغيل ---------- */
  function liveUrl(s, ext) { return cfg.host + '/live/' + cfg.user + '/' + cfg.pass + '/' + s.stream_id + '.' + ext; }
  function liveUrlFor(s) { return s._url || liveUrl(s, 'm3u8'); }
  function movieUrl(s, ext) { return s._url || (cfg.host + '/movie/' + cfg.user + '/' + cfg.pass + '/' + s.stream_id + '.' + (ext || s.container_extension || 'mp4')); }
  function epUrl(e) { return e.url || (cfg.host + '/series/' + cfg.user + '/' + cfg.pass + '/' + e.id + '.' + (e.ext || 'mp4')); }

  /* ---------- إشعار الجديد ---------- */
  function toast(t, ms) {
    var e = $('toast'); e.textContent = t; e.classList.remove('hidden');
    clearTimeout(toast.tm); toast.tm = setTimeout(function () { e.classList.add('hidden'); }, ms || 9000);
  }
  function scanNew(list, since, out) {
    if (!Array.isArray(list)) return;
    var top = [];
    for (var i = 0; i < list.length; i++) {
      var ad = +(list[i].added || list[i].last_modified);
      if (ad > since) { out.n++; top.push({ a: ad, n: list[i].name }); }
    }
    top.sort(function (a, b) { return b.a - a.a; });
    for (var j = 0; j < top.length && out.names.length < 3; j++) out.names.push(top[j].n);
  }
  function checkNew() {
    if (!cfg || cfg.type !== 'xtream') return;
    var key = K.seen + '.' + acctKey(cfg), last = store(key), now = Math.floor(Date.now() / 1000);
    if (!last) { store(key, now); return; }
    if (now - last < 6 * 3600) return;
    var mv = { n: 0, names: [] }, sr = { n: 0, names: [] }, c = cfg;
    api('get_vod_streams', '', 120000).then(function (v) {
      scanNew(v, last, mv);
      return api('get_series', '', 120000);
    }).then(function (s) {
      scanNew(s, last, sr);
      if (cfg !== c) return;
      store(key, now);
      if (mv.n + sr.n > 0) {
        var parts = [];
        if (mv.n) parts.push(mv.n + ' ' + tr(mv.n === 1 ? 'movie1' : 'movieN'));
        if (sr.n) parts.push(sr.n + ' ' + tr(sr.n === 1 ? 'series1' : 'seriesN'));
        var nm = mv.names.concat(sr.names).slice(0, 3).join(' · ');
        toast(tr('newOnSrv') + parts.join(' ' + tr('and') + ' ') + (nm ? '  —  ' + nm : ''), 12000);
      }
    }).catch(function () {});
  }

  /* ---------- صفحة التفاصيل ---------- */
  var detGen = 0;
  function b64(s) { try { return decodeURIComponent(escape(atob(s))); } catch (e) { try { return atob(s); } catch (e2) { return s || ''; } } }
  function setPoster(url, live, nm) {
    var p = $('detPoster'); p.className = 'det-poster' + (live ? ' live' : '');
    var letter = esc(String(nm || '').replace(/^[^A-Za-z0-9\u0600-\u06FF]+/, '').charAt(0) || '•');
    p.innerHTML = '<span class="ph">' + letter + '</span>' + (url ? '<img src="' + esc(url) + '" onerror="this.style.display=\'none\'">' : '');
  }
  function metaOf(i) {
    var p = [], y = i.releasedate || i.releaseDate || i.release_date || '';
    if (y) p.push(String(y).slice(0, 4));
    if (i.genre) p.push(i.genre);
    if (+i.rating > 0) p.push('★ ' + (+i.rating).toFixed(1));
    if (i.duration) p.push(i.duration);
    return p.join(' · ');
  }
  function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function updImdbAndPraise(rt, inf) {
    var el = $('detImdb'), pr = $('detPraise');
    if (!el || !pr) return;
    var num = parseFloat(rt);
    if (!isNaN(num) && num > 0) {
      el.innerHTML = 'IMDb <b>' + num.toFixed(1) + '</b><span>/10</span>';
      el.classList.remove('hidden');
      var msg = num >= 7.5 ? tr('praiseTop') : (num >= 6.0 ? tr('praiseGood') : tr('praiseAvg'));
      var extraInfo = [];
      if (inf && inf.country) extraInfo.push(inf.country);
      if (inf && inf.tmdb_id) extraInfo.push('TMDb #' + inf.tmdb_id);
      if (inf && inf.youtube_trailer) extraInfo.push('Trailer Available');
      pr.textContent = msg + (extraInfo.length ? '  (' + extraInfo.join(' · ') + ')' : '');
      pr.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
      pr.classList.add('hidden');
    }
  }
  function fillInfo(i) {
    if (!i) return;
    var nm = i.name || i.title; if (nm) { det.name = nm; $('detTitle').textContent = nm; }
    var pic = i.movie_image || i.cover || i.cover_big || ''; if (pic) setPoster(pic, false, det.name);
    $('detMeta').textContent = metaOf(i);
    updImdbAndPraise(i.rating || (i.rating_5based ? (+i.rating_5based * 2) : 0), i);
    $('detPlot').textContent = i.plot || i.description || '';
    var ex = [];
    if (i.director) ex.push(tr('dirLbl') + clip(i.director, 80));
    if (i.cast || i.actors) ex.push(tr('castLbl') + clip(i.cast || i.actors, 150));
    $('detExtra').textContent = ex.join('   ');
  }
  function updDetButtons() {
    if (!det) return;
    $('btnPlay').innerHTML = '&#9654; ' + tr('play');
    var f = isFav(det.ty, itId(det.ty, det.s));
    $('btnFav').innerHTML = (f ? '&#9829; ' : '&#9825; ') + tr(f ? 'favRemove' : 'favAdd');
    if (det.seasons.length) { $('btnSeason').classList.remove('hidden'); $('btnSeason').textContent = tr('season') + ' ' + det.cur + '  ▾'; }
    else $('btnSeason').classList.add('hidden');
  }
  function initSeasons(eps) {
    var keys = Object.keys(eps);
    keys.sort(function (a, b) { return (+a) - (+b); });
    keys.forEach(function (k) { eps[k].sort(function (a, b) { return (a.ep || 0) - (b.ep || 0); }); });
    det.eps = eps; det.seasons = keys; det.cur = keys[0];
    renderEps(); updDetButtons();
  }
  function renderEps() {
    var list = (det.eps && det.eps[det.cur]) || [], h = '';
    det.epList = list;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      h += '<button class="f eprow" data-ep="' + i + '"><span class="en">E' + (e.ep || (i + 1)) + '</span><span class="et">' + esc(e.title) + '</span>' +
        (e.dur ? '<span class="ed">' + esc(e.dur) + '</span>' : '') + '</button>';
    }
    $('detEps').innerHTML = h || '<div class="empty">' + tr('noEps') + '</div>'; $('detEps').scrollTop = 0;
    updDetButtons();
  }
  function fmtHM(ts) { return fmtClockDate(new Date(+ts * 1000)); }
  function openDetail(ty, s, idx) {
    detFrom = document.activeElement;
    var g = ++detGen;
    det = { ty: ty, s: s, name: s.name, eps: null, seasons: [], cur: null, epList: [], ext: s.container_extension, ctx: state.list, ctxIdx: idx };
    setPoster(itIcon(s), ty === 'live', s.name);
    $('detTitle').textContent = s.name; $('detMeta').textContent = ''; $('detExtra').textContent = '';
    $('detPlot').textContent = ''; $('detEps').innerHTML = '';
    if (s.rating && +s.rating > 0 && ty !== 'live') { $('detMeta').textContent = '★ ' + (+s.rating).toFixed(1); updImdbAndPraise(s.rating, null); } else { updImdbAndPraise(0, null); }
    updDetButtons(); showScreen('detail'); $('btnPlay').focus();
    function ok() { return det && g === detGen; }
    if (ty === 'series' && s._eps) { initSeasons(s._eps); return; }
    if (cfg.type === 'm3u') return;
    var id = itId(ty, s);
    if (ty === 'movies') {
      api('get_vod_info', '&vod_id=' + encodeURIComponent(id)).then(function (r) {
        if (!ok()) return;
        if (r && r.movie_data && r.movie_data.container_extension) det.ext = r.movie_data.container_extension;
        fillInfo(r && r.info); if (!$('detPlot').textContent) $('detPlot').textContent = tr('noPlot');
      }).catch(function () { if (ok()) $('detPlot').textContent = tr('noPlot'); });
    } else if (ty === 'series') {
      api('get_series_info', '&series_id=' + encodeURIComponent(id)).then(function (r) {
        if (!ok()) return;
        fillInfo(r && r.info);
        var raw = (r && r.episodes) || {}, eps = {};
        var put = function (e, sn) {
          sn = String(sn || e.season || 1);
          (eps[sn] = eps[sn] || []).push({ id: e.id, title: e.title || '', ext: e.container_extension || 'mp4', ep: +e.episode_num || 0, season: +sn, dur: (e.info && e.info.duration) || '' });
        };
        if (Array.isArray(raw)) raw.forEach(function (grp) { if (Array.isArray(grp)) grp.forEach(function (e) { put(e, e.season); }); else put(grp, grp.season); });
        else Object.keys(raw).forEach(function (sn) { (raw[sn] || []).forEach(function (e) { put(e, sn); }); });
        initSeasons(eps);
        if (!$('detPlot').textContent) $('detPlot').textContent = tr('noPlot');
      }).catch(function () { if (ok()) $('detPlot').textContent = tr('noPlot'); });
    } else {
      api('get_short_epg', '&stream_id=' + encodeURIComponent(id) + '&limit=3').then(function (r) {
        if (!ok()) return;
        var l = (r && r.epg_listings) || [], lines = [];
        if (l[0]) lines.push(tr('nowLbl') + b64(l[0].title) + ' (' + fmtHM(l[0].start_timestamp) + ' – ' + fmtHM(l[0].stop_timestamp) + ')');
        if (l[1]) lines.push(tr('nextLbl') + b64(l[1].title) + ' (' + fmtHM(l[1].start_timestamp) + ')');
        $('detMeta').textContent = lines.join('   ');
        if (l[0] && l[0].description) $('detPlot').textContent = b64(l[0].description);
      }).catch(function () {});
    }
  }
  function closeDetail() {
    det = null; detGen++;
    showScreen('main');
    if (state.type === 'fav') {
      var pc = state.favCat; setType('fav', false); openCat(pc, false);
      var f0 = $('grid').querySelector('.f') || $('cats').querySelector('.cat.on'); if (f0) f0.focus();
      return;
    }
    updHearts();
    if (detFrom && document.body.contains(detFrom)) detFrom.focus();
    else { var f = $('grid').querySelector('.f'); if (f) f.focus(); }
  }
  function detPlay() {
    if (!det) return;
    var ty = det.ty, s = det.s, pk = progItemKey(ty, s);
    if (ty === 'live') { setWatchPct(pk, 100); startPlay(liveUrlFor(s), s.name, true, det.ctx, det.ctxIdx); play.progKey = pk; }
    else if (ty === 'movies') { startPlay(movieUrl(s, det.ext), det.name, false); play.progKey = pk; }
    else playEpisode(0);
  }
  function epTitle(name, e, i) { return name + ' · ' + tr('season') + ' ' + e.season + ' · ' + tr('episode') + ' ' + (e.ep || (i + 1)); }
  function playEpisode(i) {
    if (!det) return;
    var e = det.epList[i]; if (!e) return;
    var pk = progItemKey('series', det.s);
    startPlay(epUrl(e), epTitle(det.name, e, i), false, null, 0, { list: det.epList, index: i, name: det.name });
    play.progKey = pk;
  }
  function openSeasonMenu() {
    if (!det || !det.seasons.length) return;
    var items = [];
    det.seasons.forEach(function (sn) {
      items.push({ label: tr('season') + ' ' + sn + '   (' + det.eps[sn].length + ' ' + tr('episodes') + ')', on: sn === det.cur,
        run: function () { det.cur = sn; renderEps(); var f = $('detEps').querySelector('.f'); if (f) f.focus(); } });
    });
    openMenu(tr('season'), items, $('btnSeason'), $('ddmenu'));
  }
  function onItem(i) {
    var ty = itType(); openDetail(ty, state.list[i], i);
  }

  /* ---------- المشغل الداخلي المدمج + المشغل الخارجي ---------- */
  var ICO_PLAY = '<svg viewBox="0 0 24 24" width="46" height="46" fill="#fff"><path d="M8 5v14l11-7z"/></svg>';
  var ICO_PAUSE = '<svg viewBox="0 0 24 24" width="46" height="46" fill="#fff"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  var osdTimer = null, msgTimer = null, menu = { open: false, items: [], opener: null, el: null };

  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60; return (h ? h + ':' + two(m) : m) + ':' + two(sec); }
  function say(m) { var e = $('playerMsg'); e.textContent = m; e.classList.remove('hidden'); clearTimeout(msgTimer); msgTimer = setTimeout(function () { e.classList.add('hidden'); }, 3500); }
  function playerOpen() { return !$('player').classList.contains('hidden'); }
  function osdVisible() { return !$('osd').classList.contains('hidden'); }
  function pbFocused() { var a = document.activeElement; return !!(a && a.classList && (a.classList.contains('pb') || a.classList.contains('pm'))); }
  function updPlayBtn() { $('pbPlay').innerHTML = $('video').paused ? ICO_PLAY : ICO_PAUSE; }

  function showOsd(focusPlay) {
    $('osd').classList.remove('hidden'); updPlayBtn();
    clearTimeout(osdTimer);
    osdTimer = setTimeout(function () { if (!menu.open) hideOsd(); }, 6000);
    if (focusPlay) $('pbPlay').focus();
  }
  function hideOsd() {
    closeMenu(true); $('osd').classList.add('hidden');
    if (pbFocused()) document.activeElement.blur();
  }
  function destroyHls() {
    if (hlsInst) {
      try { hlsInst.destroy(); } catch (e) {}
      hlsInst = null;
    }
  }
  function setVideoSource(v, url) {
    destroyHls();
    var isM3u8 = /\.m3u8(\?|$)/i.test(url);
    if (isM3u8 && window.Hls && window.Hls.isSupported() && !v.canPlayType('application/vnd.apple.mpegurl')) {
      hlsInst = new window.Hls({ enableWorker: true, lowLatencyMode: false, maxBufferLength: 30 });
      hlsInst.loadSource(url);
      hlsInst.attachMedia(v);
      hlsInst.on(window.Hls.Events.MANIFEST_PARSED, function () { safePlay(v); });
      hlsInst.on(window.Hls.Events.ERROR, function (ev, data) {
        if (data && data.fatal) {
          destroyHls();
          v.src = url;
          safePlay(v);
        }
      });
    } else {
      v.src = url;
      safePlay(v);
    }
  }
  function openExternalPlayer() {
    var u = play.url || play.master;
    if (!u) return;
    say(tr('extOpening'));
    try {
      if (window.AndroidApp && typeof window.AndroidApp.openExternalPlayer === 'function') {
        window.AndroidApp.openExternalPlayer(u, play.title || 'El Hana IPTV');
        return;
      }
      if (window.Android && typeof window.Android.openExternalPlayer === 'function') {
        window.Android.openExternalPlayer(u);
        return;
      }
    } catch (e) {}
    var stripped = u.replace(/^https?:\/\//i, '');
    var scheme = /^https:/i.test(u) ? 'https' : 'http';
    var intentUrl = 'intent://' + stripped + '#Intent;type=video/*;scheme=' + scheme + ';S.title=' + encodeURIComponent(play.title || 'El Hana IPTV') + ';end';
    try {
      window.location.href = intentUrl;
    } catch (e2) {
      try { window.open(u, '_system'); } catch (e3) {}
    }
  }
  function startPlay(url, title, live, list, index, ep) {
    lastFocus = document.activeElement;
    play.live = live; play.list = list || null; play.index = index || 0; play.ep = ep || null;
    $('player').classList.remove('hidden');
    load(url, title);
  }
  function load(url, title) {
    var v = $('video');
    play.url = url; play.master = url; play.triedTs = false; play.triedAltVod = false; play.title = title;
    $('osd').classList.toggle('live', play.live);
    $('osdTitle').textContent = title; $('osdFill').style.width = '0';
    $('osdTime').textContent = play.live ? tr('liveLbl') : '';
    showOsd(false);
    setVideoSource(v, url);
  }
  function closePlayer() {
    if (!playerOpen()) return;
    var v = $('video');
    savePos(); updPosterBars(); hideOsd();
    destroyHls();
    v.pause(); v.removeAttribute('src'); v.load();
    $('player').classList.add('hidden');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function progItemKey(ty, s) {
    if (!s) return '';
    return ty + ':' + (s._url || s.series_id || s.stream_id || s.name || '');
  }
  function getWatchPct(ty, s) {
    var pr = store(K.prog) || {};
    var val = pr[progItemKey(ty, s)];
    return val ? Math.min(100, Math.max(1, Math.round(val))) : 0;
  }
  function setWatchPct(key, pct) {
    if (!key) return;
    var pr = store(K.prog) || {};
    pr[key] = Math.min(100, Math.max(1, Math.round(pct)));
    var ks = Object.keys(pr); if (ks.length > 300) delete pr[ks[0]];
    store(K.prog, pr);
  }
  function updPosterBars() {
    var els = $('grid').querySelectorAll('.item[data-i]'), ty = itType();
    for (var i = 0; i < els.length; i++) {
      var s = state.list[+els[i].getAttribute('data-i')];
      if (!s) continue;
      var pct = getWatchPct(ty, s);
      if (pct > 0) {
        var pw = els[i].querySelector('.prog-wrap');
        if (!pw) {
          els[i].insertAdjacentHTML('beforeend', '<div class="prog-wrap"><div class="prog-track"><div class="prog-fill" style="width:' + pct + '%"></div></div><span class="prog-pct">' + pct + '%</span></div>');
        } else {
          pw.querySelector('.prog-fill').style.width = pct + '%';
          pw.querySelector('.prog-pct').textContent = pct + '%';
        }
      }
    }
  }
  function savePos() {
    var v = $('video');
    if (play.live) {
      if (play.progKey) setWatchPct(play.progKey, 100);
      return;
    }
    if (v.duration && v.currentTime > 3) {
      var pct = Math.round((v.currentTime / v.duration) * 100);
      if (play.progKey) setWatchPct(play.progKey, pct);
      if (v.currentTime > 20 && v.currentTime < v.duration - 30) {
        var p = store(K.pos) || {}; p[play.url] = v.currentTime;
        var ks = Object.keys(p); if (ks.length > 200) delete p[ks[0]];
        store(K.pos, p);
      }
    }
  }
  function zap(d) {
    if (!play.live || !play.list) return;
    var n = play.index + d; if (n < 0 || n >= play.list.length) return;
    play.index = n; load(liveUrlFor(play.list[n]), play.list[n].name);
  }
  function seek(d) { var v = $('video'); if (!play.live) { v.currentTime = Math.max(0, v.currentTime + d); showOsd(false); } }
  function safePlay(v) { try { var r = v.play(); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
  function togglePlay() { var v = $('video'); if (v.paused) safePlay(v); else v.pause(); updPlayBtn(); }

  function initVideo() {
    var v = $('video');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.addEventListener('timeupdate', function () {
      if (!play.live && v.duration) {
        $('osdFill').style.width = (v.currentTime / v.duration * 100) + '%';
        $('osdTime').textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration);
      }
    });
    v.addEventListener('loadedmetadata', function () {
      if (play.live) return;
      var p = store(K.pos), tm = p && p[play.url];
      if (tm) { v.currentTime = tm; say(tr('resume') + fmt(tm)); }
    });
    v.addEventListener('play', updPlayBtn); v.addEventListener('pause', updPlayBtn);
    v.addEventListener('waiting', function () { say(tr('buffering')); });
    v.addEventListener('playing', function () { $('playerMsg').classList.add('hidden'); });
    v.addEventListener('ended', function () {
      if (play.live) return;
      if (play.ep && play.ep.index + 1 < play.ep.list.length) {
        play.ep.index++; var e = play.ep.list[play.ep.index];
        load(epUrl(e), epTitle(play.ep.name, e, play.ep.index)); return;
      }
      closePlayer();
    });
    v.addEventListener('error', function () {
      if (play.live && !play.triedTs && cfg && cfg.type === 'xtream' && /\.m3u8$/.test(play.url)) {
        play.triedTs = true; play.url = play.url.replace(/\.m3u8$/, '.ts'); play.master = play.url; setVideoSource(v, play.url); return;
      }
      if (!play.live && !play.triedAltVod && cfg && cfg.type === 'xtream') {
        play.triedAltVod = true;
        if (/\.(mkv|avi|ts)(\?|$)/i.test(play.url)) {
          play.url = play.url.replace(/\.(mkv|avi|ts)(\?|$)/i, '.mp4$2');
          setVideoSource(v, play.url);
          return;
        } else if (/\.mp4(\?|$)/i.test(play.url)) {
          play.url = play.url.replace(/\.mp4(\?|$)/i, '.m3u8$1');
          setVideoSource(v, play.url);
          return;
        }
      }
      showOsd(false);
      say(tr('cantPlay'));
    });

    /* النقر أو اللمس على شاشة الفيديو لإظهار/إخفاء عناصر التحكم */
    $('player').addEventListener('click', function (e) {
      if (e.target === $('player') || e.target === v) {
        if (menu.open) { closeMenu(false); return; }
        if (osdVisible()) hideOsd();
        else showOsd(false);
      }
    });
  }

  /* قوائم منسدلة (الجودة / الصوت / المواسم) */
  function openMenu(title, items, opener, el) {
    menu.open = true; menu.items = items; menu.opener = opener; menu.el = el || $('pmenu');
    var h = '<div class="pm-title">' + esc(title) + '</div>';
    for (var i = 0; i < items.length; i++) h += '<button class="f pm' + (items[i].on ? ' on' : '') + '" data-i="' + i + '">' + esc(items[i].label) + '</button>';
    menu.el.innerHTML = h; menu.el.classList.remove('hidden');
    clearTimeout(osdTimer);
    var f = menu.el.querySelector('.pm.on') || menu.el.querySelector('.pm'); if (f) f.focus();
  }
  function closeMenu(noFocus) {
    if (!menu.open) return;
    menu.open = false; menu.el.classList.add('hidden');
    if (!noFocus && menu.opener) menu.opener.focus();
    if (playerOpen()) showOsd(false);
  }
  function parseMaster(text, base) {
    var lines = text.split(/\r?\n/), out = [], origin = (base.match(/^https?:\/\/[^\/]+/) || [''])[0], dir = base.replace(/[?#].*$/, '').replace(/[^\/]*$/, '');
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('#EXT-X-STREAM-INF') !== 0) continue;
      var bw = (lines[i].match(/BANDWIDTH=(\d+)/) || [0, 0])[1], rs = lines[i].match(/RESOLUTION=(\d+)x(\d+)/), uri = '';
      for (var j = i + 1; j < lines.length; j++) { if (lines[j] && lines[j].charAt(0) !== '#') { uri = lines[j].trim(); break; } }
      if (!uri) continue;
      var abs = /^https?:/i.test(uri) ? uri : (uri.charAt(0) === '/' ? origin + uri : dir + uri);
      out.push({ bw: +bw, h: rs ? +rs[2] : 0, url: abs });
    }
    out.sort(function (a, b) { return a.bw - b.bw; });
    return out;
  }
  function openQuality(btn) {
    if (hlsInst && hlsInst.levels && hlsInst.levels.length > 1) {
      var itemsH = [{ label: tr('qualAuto'), on: hlsInst.currentLevel === -1, run: function () { hlsInst.currentLevel = -1; say(tr('qDone')); } }];
      for (var k = 0; k < hlsInst.levels.length; k++) (function (idx) {
        var lv = hlsInst.levels[idx];
        var lb = (lv.height ? lv.height + 'p' : Math.round(lv.bitrate / 1000) + ' kbps') + (lv.bitrate ? '  (' + (lv.bitrate / 1e6).toFixed(1) + ' Mbps)' : '');
        itemsH.push({ label: lb, on: hlsInst.currentLevel === idx, run: function () { hlsInst.currentLevel = idx; say(tr('qDone')); } });
      })(k);
      openMenu(tr('qTitle'), itemsH, btn);
      return;
    }
    if (!/\.m3u8/.test(play.master)) { say(tr('qualOnly')); return; }
    say(tr('qualRead'));
    xhr(play.master, 15000, true).then(function (r) {
      var vs = parseMaster(r.text, r.url);
      if (vs.length < 2) { say(tr('qualOne')); return; }
      var v = $('video'), items = [{ label: tr('qualAuto'), url: play.master, on: play.url === play.master }];
      for (var i = 0; i < vs.length; i++) {
        var lb = (vs[i].h ? vs[i].h + 'p' : Math.round(vs[i].bw / 1000) + ' kbps') + (vs[i].bw ? '  (' + (vs[i].bw / 1e6).toFixed(1) + ' Mbps)' : '');
        if (i === 0) lb += '  ' + tr('qLow');
        if (i === vs.length - 1) lb += '  ' + tr('qHigh');
        items.push({ label: lb, url: vs[i].url, on: play.url === vs[i].url });
      }
      items.forEach(function (it) { it.run = function () { play.url = it.url; setVideoSource(v, it.url); say(tr('qDone')); }; });
      openMenu(tr('qTitle'), items, btn);
    }).catch(function () { say(tr('qFail')); });
  }
  function openAudio(btn) {
    if (hlsInst && hlsInst.audioTracks && hlsInst.audioTracks.length > 1) {
      var itemsH = [];
      for (var k = 0; k < hlsInst.audioTracks.length; k++) (function (idx) {
        var tk = hlsInst.audioTracks[idx], lb = tk.name || tk.lang || (tr('track') + ' ' + (idx + 1));
        itemsH.push({ label: lb, on: hlsInst.audioTrack === idx, run: function () { hlsInst.audioTrack = idx; say(tr('audioDone')); } });
      })(k);
      openMenu(tr('audioTitle'), itemsH, btn);
      return;
    }
    var at = $('video').audioTracks;
    if (!at || at.length < 2) { say(tr('noAudio')); return; }
    var items = [];
    for (var i = 0; i < at.length; i++) (function (i) {
      var tk = at[i], lb = tk.label || tk.language || (tr('track') + ' ' + (i + 1));
      if (tk.label && tk.language) lb += '  (' + tk.language + ')';
      items.push({ label: lb, on: !!tk.enabled, run: function () { for (var j = 0; j < at.length; j++) at[j].enabled = (j === i); say(tr('audioDone')); } });
    })(i);
    openMenu(tr('audioTitle'), items, btn);
  }
  function pbAction(act, btn) {
    if (act === 'rew') seek(-10);
    else if (act === 'fwd') seek(30);
    else if (act === 'play') { togglePlay(); showOsd(false); }
    else if (act === 'stop' || act === 'back') closePlayer();
    else if (act === 'quality') openQuality(btn);
    else if (act === 'audio') openAudio(btn);
    else if (act === 'extplayer') openExternalPlayer();
  }
  function playerKey(k, e) {
    var v = $('video');
    if (menu.open || pbFocused()) {
      if (k === 37) { e.preventDefault(); showOsd(false); if (!menu.open) move('left'); }
      else if (k === 39) { e.preventDefault(); showOsd(false); if (!menu.open) move('right'); }
      else if (k === 38) { e.preventDefault(); move('up'); }
      else if (k === 40) { e.preventDefault(); move('down'); }
      else if (k === 415) { e.preventDefault(); safePlay(v); }
      else if (k === 19) { e.preventDefault(); v.pause(); }
      else if (k === 413) { e.preventDefault(); closePlayer(); }
      return;
    }
    e.preventDefault();
    if (k === 13) { if (osdVisible()) hideOsd(); else showOsd(true); }
    else if (k === 415 || k === 179) { togglePlay(); showOsd(false); }
    else if (k === 19) { v.pause(); showOsd(false); }
    else if (k === 413) closePlayer();
    else if (k === 39 || k === 417) seek(30);
    else if (k === 37 || k === 412) seek(-10);
    else if (k === 38 || k === 427) { if (play.live) zap(-1); else showOsd(true); }
    else if (k === 40 || k === 428) { if (play.live) zap(1); else showOsd(true); }
  }

  /* ---------- الإعدادات ---------- */
  var SBC = [['white', '#ffffff', 'cWhite'], ['black', '#000000', 'cBlack'], ['yellow', '#ffd400', 'cYellow'], ['cyan', '#00e5ff', 'cCyan'], ['green', '#3dff7a', 'cGreen'], ['red', '#ff5252', 'cRed']];
  function use24() { return store(K.h24) === true; }
  function sbColor() { return store(K.sbc) || 'white'; }
  function sbOn() { return store(K.sbshow) !== false; }
  function fmtClockDate(d) {
    var h = d.getHours(), m = two(d.getMinutes());
    if (use24()) return two(h) + ':' + m;
    return (h % 12 || 12) + ':' + m + ' ' + tr(h >= 12 ? 'pm' : 'am');
  }
  function applySpeedbar() {
    var tb = $('topbar'), c = sbColor(), hex = '#ffffff';
    for (var i = 0; i < SBC.length; i++) if (SBC[i][0] === c) hex = SBC[i][1];
    tb.style.color = hex; tb.style.opacity = '0.85';
    tb.style.textShadow = c === 'black' ? '0 0 4px rgba(255,255,255,.75)' : '0 0 4px rgba(0,0,0,.85)';
    tb.style.display = sbOn() ? 'flex' : 'none';
  }
  function optBtn(key, val, label, on, extra) {
    return '<button class="f opt' + (on ? ' on' : '') + (extra ? ' ' + extra : '') + '" data-set="' + key + '" data-val="' + val + '">' + label + '</button>';
  }
  function showSettings() { showScreen('settings'); renderSettings(setSec); var f = $('setSecs').querySelector('.sec.on') || $('btnBackSet'); f.focus(); }
  function sbSizeVal() { return store(K.sbsize) || '18px'; }
  function applySbSize() {
    document.documentElement.style.setProperty('--sb-size', sbSizeVal());
  }
  function renderSettings(sec) {
    setSec = sec;
    var secs = [['general', 'secGeneral'], ['themes', 'secThemes'], ['time', 'secTime'], ['speedbar', 'secSpeedbar'], ['speedtest', 'secSpeedtest'], ['subinfo', 'secSubInfo'], ['devinfo', 'secDevInfo'], ['contact', 'secContact'], ['about', 'secAbout'], ['update', 'secUpdate'], ['cleardata', 'secClearData']], h = '', p = '', i;
    for (i = 0; i < secs.length; i++) h += '<button class="f sec' + (secs[i][0] === sec ? ' on' : '') + '" data-sec="' + secs[i][0] + '">' + tr(secs[i][1]) + '</button>';
    $('setSecs').innerHTML = h;
    if (sec === 'general') {
      p = '<div class="setrow"><div class="setlbl">' + tr('language') + '</div><div class="opts">' + optBtn('lang', 'ar', 'العربية', LANG === 'ar') + optBtn('lang', 'en', 'English', LANG === 'en') + '</div></div>' +
        '<div class="setrow"><div class="setlbl">' + tr('sound') + '</div><div class="opts">' + optBtn('sound', '1', tr('on'), soundOn) + optBtn('sound', '0', tr('off'), !soundOn) + '</div></div>';
    } else if (sec === 'themes') {
      var curTh = store(K.theme) || 'default';
      p = '<div class="setrow"><div class="setlbl">' + tr('themeChoose') + '</div><div class="theme-grid">';
      for (i = 0; i < THEMES.length; i++) {
        var th = THEMES[i];
        var bgStyle = th.img ? ('background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.78)),url(\'' + th.img + '\');') : ('background:linear-gradient(135deg,' + th.bg1 + ',' + th.ac + ');');
        p += '<button class="f theme-btn' + (th.id === curTh ? ' on' : '') + '" data-theme="' + th.id + '" style="' + bgStyle + '">' + esc(tr(th.name)) + '</button>';
      }
      p += '</div></div><div class="setrow"><div class="opts"><button class="f btn small" id="btnSetBgPick">' + tr('changeBgBtn') + '</button><button class="f btn small" id="btnSetBgReset" style="margin:0 14px">' + tr('bgResetBtn') + '</button></div></div>';
    } else if (sec === 'time') {
      p = '<div class="setrow"><div class="setlbl">' + tr('clockFmt') + '</div><div class="opts">' + optBtn('h24', '0', tr('h12'), !use24()) + optBtn('h24', '1', tr('h24'), use24()) + '</div></div>' +
        '<div class="setrow"><div class="opts"><button class="f btn small" id="btnTimeSync">' + tr('timeSync') + '</button><button class="f btn small" id="btnTimeReset" style="margin:0 12px">' + tr('timeReset') + '</button></div></div>' +
        '<div class="setrow"><div class="setlbl" id="timeSyncMsg">' + tr('nowTime') + fmtClockDate(nowDate()) + '</div></div>';
    } else if (sec === 'speedbar') {
      var szCur = sbSizeVal();
      p = '<div class="setrow"><div class="setlbl">' + tr('sbShow') + '</div><div class="opts">' + optBtn('sbshow', '1', tr('on'), sbOn()) + optBtn('sbshow', '0', tr('off'), !sbOn()) + '</div></div>' +
        '<div class="setrow"><div class="setlbl">' + tr('sbSize') + '</div><div class="opts">' +
        optBtn('sbsize', '15px', tr('szSmall'), szCur === '15px') +
        optBtn('sbsize', '18px', tr('szMed'), szCur === '18px') +
        optBtn('sbsize', '22px', tr('szLarge'), szCur === '22px') +
        optBtn('sbsize', '26px', tr('szXL'), szCur === '26px') + '</div></div>' +
        '<div class="setrow"><div class="setlbl">' + tr('sbColor') + '</div><div class="opts">';
      for (i = 0; i < SBC.length; i++) p += optBtn('sbc', SBC[i][0], '<i style="background:' + SBC[i][1] + '"></i>' + tr(SBC[i][2]), sbColor() === SBC[i][0], 'sw');
      p += '</div><div class="warn-box">' + esc(tr('sbPkgWarn')) + '</div></div>';
    } else if (sec === 'subinfo') {
      var expStr = '—';
      if (info && info.exp_date && +info.exp_date > 0) {
        var ed = new Date(+info.exp_date * 1000);
        expStr = ed.getFullYear() + '/' + two(ed.getMonth() + 1) + '/' + two(ed.getDate());
      }
      p = '<div class="info-card">' +
        '<div><b>' + tr('subType') + ':</b> ' + esc(cfg ? (cfg.type === 'm3u' ? 'M3U Playlist' : 'Xtream Codes') : '—') + '</div>' +
        '<div><b>' + tr('subUser') + ':</b> ' + esc((info && info.username) || (cfg && cfg.user) || '—') + '</div>' +
        '<div><b>' + tr('subStatus') + ':</b> ' + esc((info && info.status) || (cfg ? 'Active' : '—')) + '</div>' +
        '<div><b>' + tr('subExp') + ':</b> ' + esc(expStr) + '</div>' +
        '<div><b>' + tr('subMaxConn') + ':</b> ' + esc((info && info.max_connections) || '—') + '</div>' +
        '<div><b>' + tr('subActiveConn') + ':</b> ' + esc((info && info.active_cons) || '—') + '</div>' +
        '<div style="direction:ltr;text-align:start"><b>' + tr('subServer') + ':</b> ' + esc((cfg && (cfg.host || cfg.url)) || '—') + '</div>' +
        '</div>';
    } else if (sec === 'devinfo') {
      var usedBytes = 0;
      try { for (var k in localStorage) if (localStorage.hasOwnProperty(k)) usedBytes += (localStorage[k] || '').length * 2; } catch (e) {}
      var usedKb = Math.max(1, Math.round(usedBytes / 1024)) + ' KB';
      p = '<div class="info-card">' +
        '<div><b>' + tr('devAppVer') + ':</b> ' + esc(window.EH_VER || '2.3.0') + '</div>' +
        '<div><b>' + tr('devPlatform') + ':</b> ' + (window.AndroidApp ? 'Android Smart Device' : 'Smart TV / Web') + '</div>' +
        '<div><b>' + tr('devRes') + ':</b> ' + window.innerWidth + ' × ' + window.innerHeight + ' (Full HD)</div>' +
        '<div><b>' + tr('devLang') + ':</b> ' + esc(navigator.language || LANG) + '</div>' +
        '<div><b>' + tr('devNet') + ':</b> ' + (navigator.onLine ? 'Online ✅' : 'Offline ❌') + '</div>' +
        '<div><b>' + tr('devStorage') + ':</b> ' + usedKb + '</div>' +
        '</div>';
    } else if (sec === 'contact') {
      p = '<div class="info-card">' +
        '<div style="margin-bottom:16px;color:#fff;font-weight:700">' + esc(tr('contactTitle')) + '</div>' +
        '<div><b>' + tr('contactDevLbl') + ':</b> El Hana IPTV</div>' +
        '<div style="direction:ltr;text-align:start"><b>' + tr('contactEmailLbl') + ':</b> alialifathy3@gmail.com</div>' +
        '<div style="direction:ltr;text-align:start"><b>' + tr('contactPhoneLbl') + ':</b> 01017989801</div>' +
        '</div>';
    } else if (sec === 'about') {
      p = '<div class="info-card" style="white-space:pre-line">' + esc(tr('aboutText')) + '</div>';
    } else if (sec === 'cleardata') {
      p = '<div class="info-card" style="margin-bottom:24px">' + esc(tr('clearWarn')) + '</div>' +
        '<button class="f btn" id="btnClearAllData" style="width:auto;display:inline-block;background:linear-gradient(135deg,#e0245e,#991b1b)">' + tr('clearBtn') + '</button>';
    } else if (sec === 'update') {
      var curV = window.EH_VER || '2.3.0';
      p = '<div class="info-card" style="margin-bottom:24px">' +
        '<div style="font-size:30px;font-weight:800;color:#fff;margin-bottom:10px">' + esc(tr('updTitle')) + '</div>' +
        '<div style="margin-bottom:14px">' + esc(tr('updDesc')) + '</div>' +
        '<div><b>' + tr('updVer') + ':</b> <span style="color:#69f0ae;font-weight:800">' + esc(curV) + '</span></div>' +
        '</div>' +
        '<div class="setrow"><div class="opts"><button class="f btn" id="btnUpdCheck" style="width:auto;display:inline-block">' + tr('updCheck') + '</button>' +
        '<button class="f btn small" id="btnUpdReset" style="margin:0 16px">' + tr('updReset') + '</button></div></div>' +
        '<div class="setrow"><div class="setlbl" id="updMsg" style="color:#9db9ff">' + esc(updStateMsg) + '</div></div>';
    } else {
      p = '<div class="setrow"><div class="opts"><button class="f btn" id="btnSpeed" style="width:auto;display:inline-block">' + tr(st.running ? 'stRunning' : 'stStart') + '</button>' +
        '<button class="f btn small" id="btnSpeedStop" style="margin:0 16px;background:rgba(255,77,109,.25);border:1px solid rgba(255,77,109,.5)">' + tr('stStop') + '</button></div></div>' +
        '<div class="stres"><div class="stbox"><span>' + tr('stPing') + '</span><b id="stPing">' + st.ping + '</b></div>' +
        '<div class="stbox"><span>' + tr('stDown') + '</span><b id="stDown">' + st.down + '</b></div>' +
        '<div class="stbox"><span>' + tr('stUp') + '</span><b id="stUp">' + st.up + '</b></div></div>' +
        '<div class="setlbl" id="stMsg">' + st.msg + '</div><div class="stnote">' + tr('stNote') + '</div>';
    }
    $('setPanel').innerHTML = p;
  }
  function applySetting(key, val) {
    if (key === 'lang') { LANG = val; store(K.lang, LANG); applyLang(); }
    else if (key === 'sound') { soundOn = val === '1'; store(K.snd, soundOn); if (soundOn) tick(); }
    else if (key === 'h24') { store(K.h24, val === '1'); updSpeed(); }
    else if (key === 'sbshow') { store(K.sbshow, val === '1'); applySpeedbar(); }
    else if (key === 'sbc') { store(K.sbc, val); applySpeedbar(); }
    else if (key === 'sbsize') { store(K.sbsize, val); applySbSize(); }
    renderSettings(setSec);
    var el = $('setPanel').querySelector('[data-set="' + key + '"][data-val="' + val + '"]'); if (el) el.focus();
  }

  /* ---------- مزامنة الوقت ---------- */
  function syncTime(manual) {
    if (manual && $('timeSyncMsg')) $('timeSyncMsg').textContent = tr('timeSyncing');
    var urls = ['https://speed.cloudflare.com/__down?bytes=0&t=' + Date.now(), 'https://api.github.com/zen?t=' + Date.now()];
    var i = 0;
    function tryNext() {
      if (i >= urls.length) {
        if (manual && $('timeSyncMsg')) $('timeSyncMsg').textContent = tr('timeSyncFail');
        return;
      }
      var u = urls[i++], x = new XMLHttpRequest(), t0 = Date.now();
      x.open('GET', u, true); x.timeout = 8000;
      x.onload = function () {
        var hdr = x.getResponseHeader('Date');
        if (hdr) {
          var srv = Date.parse(hdr);
          if (!isNaN(srv)) {
            timeOffset = (srv + Math.round((Date.now() - t0) / 2)) - Date.now();
            store(K.toff, timeOffset);
            updSpeed();
            if (manual && $('timeSyncMsg')) $('timeSyncMsg').textContent = tr('timeSynced') + ' — ' + fmtClockDate(nowDate());
            return;
          }
        }
        tryNext();
      };
      x.onerror = x.ontimeout = tryNext;
      x.send();
    }
    tryNext();
  }
  function resetTimeOffset() {
    timeOffset = 0; store(K.toff, 0); updSpeed();
    if ($('timeSyncMsg')) $('timeSyncMsg').textContent = tr('nowTime') + fmtClockDate(nowDate());
  }

  /* ---------- التحديث من بعيد (مخفي ومشفر) ---------- */
  var _U1 = atob('aHR0cHM6Ly9hbGlmYXRpcnkyLmdpdGh1Yi5pby9lbGhhbmE=');
  var _U2 = atob('aHR0cHM6Ly9hbGlmYXRoeTIuZ2l0aHViLmlvL2VsaGFuYQ==');
  var APP_VER = '2.3.0';
  var updStateMsg = '';
  function setUpdMsg(t) { updStateMsg = t || ''; var e = $('updMsg'); if (e) e.textContent = updStateMsg; }
  function cmpVer(a, b) {
    var x = String(a).split('.'), y = String(b).split('.'), n = Math.max(x.length, y.length);
    for (var i = 0; i < n; i++) { var p = +x[i] || 0, q = +y[i] || 0; if (p !== q) return p > q ? 1 : -1; }
    return 0;
  }
  function tryFetchOta(base, manual) {
    var curV = (window.EH_VER && cmpVer(window.EH_VER, APP_VER) > 0) ? window.EH_VER : APP_VER;
    var ver = null, files = {};
    return xhr(base + '/version.json?t=' + nowMs(), 15000).then(function (r) {
      ver = r && r.version;
      if (!ver) throw new Error('v');
      if (cmpVer(ver, curV) <= 0) { if (manual) setUpdMsg(tr('updLatest')); return 'latest'; }
      var names = ['index.html', 'style.css', 'app.js'], chain = Promise.resolve();
      names.forEach(function (n) {
        chain = chain.then(function () { return xhr(base + '/' + n + '?t=' + nowMs(), 60000, true).then(function (x) { files[n] = x.text; }); });
      });
      return chain.then(function () {
        if (!files['app.js'] || files['app.js'].length < 2000 || !files['style.css'] || files['style.css'].length < 500 || !/<body/i.test(files['index.html'] || '')) throw new Error('bad');
        store('elhana.ota', { version: ver, index: files['index.html'], css: files['style.css'], js: files['app.js'] });
        if (manual) { setUpdMsg(tr('updDone')); setTimeout(function () { location.reload(); }, 1200); }
        else toast(tr('updReady'), 8000);
        return 'updated';
      });
    });
  }
  function checkUpdate(manual) {
    if (manual) setUpdMsg(tr('updChecking'));
    var list = [_U1, _U2], idx = 0;
    function next() {
      if (idx >= list.length) { if (manual) setUpdMsg(tr('updFail')); return Promise.resolve(); }
      return tryFetchOta(list[idx++], manual).catch(function () { return next(); });
    }
    return next();
  }
  function resetUpdate() {
    try { localStorage.removeItem('elhana.ota'); localStorage.removeItem('elhana.otaTry'); localStorage.removeItem('elhana.otabase'); } catch (e) {}
    setUpdMsg(tr('updResetDone')); setTimeout(function () { location.reload(); }, 1200);
  }

  /* ---------- اختبار السرعة في الإعدادات (مع زر إنهاء الاختبار) ---------- */
  var st = { running: false, ping: '—', down: '—', up: '—', msg: '', xhr: null, tok: 0 };
  function stSet(id, key, val) { st[key] = val; var e = $(id); if (e) e.textContent = val; }
  function stopSpeedTest() {
    st.tok++;
    if (st.xhr) { try { st.xhr.abort(); } catch (e) {} st.xhr = null; }
    if (st.running) {
      st.running = false;
      st.msg = tr('stStopped');
      if (curScreen() === 'settings' && setSec === 'speedtest') {
        renderSettings('speedtest');
        var b = $('btnSpeed'); if (b) b.focus();
      }
    }
  }
  function stPing(tok) {
    return new Promise(function (resolve, reject) {
      var best = 1e9, n = 0;
      (function one() {
        if (tok !== st.tok) { reject(new Error('abort')); return; }
        var x = new XMLHttpRequest(), t0 = Date.now();
        st.xhr = x;
        x.open('GET', 'https://speed.cloudflare.com/__down?bytes=0&nocache=' + t0 + '_' + Math.random(), true);
        x.timeout = 8000;
        x.onload = function () {
          if (tok !== st.tok) return;
          var d = Math.max(1, Date.now() - t0);
          best = Math.min(best, d);
          stSet('stPing', 'ping', best + ' ms');
          if (++n < 3) one(); else resolve(best);
        };
        x.onerror = x.ontimeout = function () {
          if (tok !== st.tok) return;
          if (best < 1e9) resolve(best); else reject(new Error('ping'));
        };
        x.send();
      })();
    });
  }
  function stDown(tok) {
    return new Promise(function (resolve, reject) {
      if (tok !== st.tok) { reject(new Error('abort')); return; }
      var x = new XMLHttpRequest(), t0 = Date.now(), size = 25000000, lastLoaded = 0, lastTime = t0, smooth = null, finished = false;
      st.xhr = x;
      function finish(ok) {
        if (finished || tok !== st.tok) return;
        finished = true;
        if (ok && smooth != null) resolve(smooth);
        else reject(new Error('down'));
      }
      x.open('GET', 'https://speed.cloudflare.com/__down?bytes=' + size + '&nocache=' + t0 + '_' + Math.random(), true);
      x.responseType = 'arraybuffer';
      x.timeout = 15000;
      x.onprogress = function (e) {
        if (tok !== st.tok) { try { x.abort(); } catch (er) {} return; }
        var now = Date.now(), dt = (now - lastTime) / 1000;
        if (dt >= 0.25 && e.loaded > lastLoaded) {
          var inst = ((e.loaded - lastLoaded) * 8 / 1e6) / dt;
          smooth = smooth == null ? inst : (smooth * 0.55 + inst * 0.45);
          stSet('stDown', 'down', smooth.toFixed(1) + ' Mbps');
          sp.down = smooth;
          lastLoaded = e.loaded;
          lastTime = now;
        }
        if (now - t0 > 8000 && smooth != null) {
          try { x.abort(); } catch (er) {}
          finish(true);
        }
      };
      x.onload = function () {
        var totalDt = (Date.now() - t0) / 1000;
        var bytes = x.response ? x.response.byteLength : lastLoaded;
        if (totalDt > 0.1 && bytes > 0) smooth = (bytes * 8 / 1e6) / totalDt;
        finish(smooth != null);
      };
      x.onerror = x.ontimeout = function () { finish(smooth != null); };
      x.send();
    });
  }
  function stUp(tok) {
    return new Promise(function (resolve, reject) {
      if (tok !== st.tok) { reject(new Error('abort')); return; }
      var x = new XMLHttpRequest(), size = 4 * 1024 * 1024, buf = new Uint8Array(size);
      for (var i = 0; i < size; i += 4096) buf[i] = (i & 255);
      st.xhr = x;
      var t0 = Date.now(), lastLoaded = 0, lastTime = t0, smooth = null, finished = false;
      function finish(ok) {
        if (finished || tok !== st.tok) return;
        finished = true;
        if (ok && smooth != null) resolve(smooth);
        else reject(new Error('up'));
      }
      x.open('POST', 'https://speed.cloudflare.com/__up?nocache=' + t0 + '_' + Math.random(), true);
      x.timeout = 15000;
      x.setRequestHeader('Content-Type', 'application/octet-stream');
      if (x.upload) {
        x.upload.onprogress = function (e) {
          if (tok !== st.tok) { try { x.abort(); } catch (er) {} return; }
          var now = Date.now(), dt = (now - lastTime) / 1000;
          if (dt >= 0.25 && e.loaded > lastLoaded) {
            var inst = ((e.loaded - lastLoaded) * 8 / 1e6) / dt;
            smooth = smooth == null ? inst : (smooth * 0.55 + inst * 0.45);
            stSet('stUp', 'up', smooth.toFixed(1) + ' Mbps');
            sp.up = smooth;
            lastLoaded = e.loaded;
            lastTime = now;
          }
        };
      }
      x.onload = function () {
        var totalDt = (Date.now() - t0) / 1000;
        if (x.status >= 400) { finish(false); return; }
        if (totalDt > 0.05) smooth = (size * 8 / 1e6) / totalDt;
        finish(smooth != null);
      };
      x.onerror = x.ontimeout = function () { finish(false); };
      x.send(buf);
    });
  }
  function runSpeedTest() {
    if (st.running) return;
    var tok = ++st.tok;
    st.running = true;
    st.ping = '—'; st.down = '—'; st.up = '—';
    st.msg = tr('stRunning');
    renderSettings('speedtest');
    var b = $('btnSpeedStop') || $('btnSpeed'); if (b) b.focus();
    stPing(tok).then(function (ms) {
      if (tok !== st.tok) return;
      stSet('stPing', 'ping', ms + ' ms');
      return stDown(tok);
    }).then(function (mb) {
      if (tok !== st.tok) return;
      stSet('stDown', 'down', mb.toFixed(1) + ' Mbps');
      return stUp(tok);
    }).then(function (mb) {
      if (tok !== st.tok) return;
      stSet('stUp', 'up', mb.toFixed(1) + ' Mbps');
      st.msg = tr('stDone');
    }).catch(function () {
      if (tok === st.tok) st.msg = tr('stFail');
    }).then(function () {
      if (tok !== st.tok) return;
      st.running = false; st.xhr = null;
      if (curScreen() === 'settings' && setSec === 'speedtest') {
        renderSettings('speedtest');
        var b2 = $('btnSpeed'); if (b2) b2.focus();
      }
    });
  }

  /* ---------- شريط السرعة العلوي (آمن على الباقة) ---------- */
  var sp = { b: 0, t: 0, down: null, up: null, probing: false, upT: 0 };
  function updSpeed() {
    var d = nowDate();
    $('tbClock').textContent = fmtClockDate(d);
    if (curScreen() === 'home') updHomeWidget();
    if (!sbOn()) return;
    var v = $('video'), txt = '—';
    if (playerOpen() && !v.paused && !v.ended) {
      var b = (v.webkitVideoDecodedByteCount || 0) + (v.webkitAudioDecodedByteCount || 0), now = Date.now();
      if (b > 0 && sp.t && b >= sp.b) sp.down = (b - sp.b) * 8 / 1e6 / ((now - sp.t) / 1000);
      else if (b === 0 && navigator.connection && navigator.connection.downlink) sp.down = navigator.connection.downlink;
      sp.b = b; sp.t = now;
      if (sp.down != null) txt = sp.down.toFixed(1) + ' Mbps';
    } else { sp.t = 0; sp.b = 0; }
    $('spDown').innerHTML = '&#9660; ' + txt;
    $('spUp').innerHTML = '&#9650; ' + (sp.up != null ? sp.up.toFixed(1) + ' Mbps' : '—');
    if (cfg && cfg.type === 'xtream' && !sp.probing && Date.now() - sp.upT > 30000) probeUp();
  }
  function probeUp() {
    sp.probing = true; sp.upT = Date.now();
    try {
      var size = 262144, buf = new Uint8Array(size), x = new XMLHttpRequest(), t0 = Date.now();
      x.open('POST', cfg.host + '/', true); x.timeout = 15000;
      x.setRequestHeader('Content-Type', 'application/octet-stream');
      x.upload.onload = function () { var dt = (Date.now() - t0) / 1000; if (dt > 0.02) sp.up = size * 8 / 1e6 / dt; };
      x.onloadend = function () { sp.probing = false; };
      x.send(buf);
    } catch (e) { sp.probing = false; }
  }

  /* ---------- التنقل بالريموت ---------- */
  function focusables() {
    var root;
    if (termsOpen()) root = $('termsdlg');
    else if (phoneOpen()) root = $('phonedlg');
    else if (bgModalOpen()) root = $('bgdlg');
    else if (exitOpen()) root = $('exitdlg');
    else if (menu.open) root = menu.el;
    else if (playerOpen()) root = $('osd');
    else root = $(curScreen() || 'home');
    var all = root.querySelectorAll('.f'), out = [];
    for (var i = 0; i < all.length; i++) if (all[i].offsetWidth > 0) out.push(all[i]);
    return out;
  }
  function move(dir) {
    var cur = document.activeElement, list = focusables();
    if (!cur || !cur.classList || !cur.classList.contains('f') || list.indexOf(cur) < 0) { if (list[0]) { list[0].focus(); tick(); } return; }
    var r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, best = null, bs = 1e9;
    for (var i = 0; i < list.length; i++) {
      var el = list[i]; if (el === cur) continue;
      var b = el.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2, dx = x - cx, dy = y - cy, main, cross;
      if (dir === 'left') { if (dx >= -2) continue; main = -dx; cross = Math.abs(dy); }
      else if (dir === 'right') { if (dx <= 2) continue; main = dx; cross = Math.abs(dy); }
      else if (dir === 'up') { if (dy >= -2) continue; main = -dy; cross = Math.abs(dx); }
      else { if (dy <= 2) continue; main = dy; cross = Math.abs(dx); }
      var sc = main + cross * 2.5;
      if (sc < bs) { bs = sc; best = el; }
    }
    if (best) { best.focus(); if (best.scrollIntoView) best.scrollIntoView({ block: 'nearest' }); tick(); }
  }

  /* ---------- سياسة الخصوصية والشروط + نافذة الخلفية + نافذة الخروج السريعة ---------- */
  function termsOpen() { return !$('termsdlg').classList.contains('hidden'); }
  function showTerms() {
    $('termsdlg').classList.remove('hidden');
    $('btnTermsAccept').focus();
  }
  function acceptTerms() {
    store(K.terms, true);
    $('termsdlg').classList.add('hidden');
    bootAccountFlow();
  }
  var exitFocus = null;
  function exitOpen() { return !$('exitdlg').classList.contains('hidden'); }
  function showExit() {
    if (exitOpen()) return;
    exitFocus = document.activeElement;
    var d = $('exitdlg');
    d.classList.remove('closing');
    d.classList.add('show');
    d.classList.remove('hidden');
    $('btnExitNo').focus();
  }
  function hideExit() {
    var d = $('exitdlg');
    d.classList.add('hidden');
    d.classList.remove('show');
    d.classList.remove('closing');
    if (exitFocus && exitFocus.focus) exitFocus.focus();
  }
  function exitApp() {
    try { if (window.AndroidApp && typeof window.AndroidApp.exitApp === 'function') { window.AndroidApp.exitApp(); return; } } catch (e) {}
    try { if (window.AndroidApp && typeof window.AndroidApp.closeApp === 'function') { window.AndroidApp.closeApp(); return; } } catch (e) {}
    try { if (window.AndroidApp && typeof window.AndroidApp.finish === 'function') { window.AndroidApp.finish(); return; } } catch (e) {}
    try { if (window.Android && typeof window.Android.exitApp === 'function') { window.Android.exitApp(); return; } } catch (e) {}
    try { if (window.Android && typeof window.Android.closeApp === 'function') { window.Android.closeApp(); return; } } catch (e) {}
    try { if (navigator.app && typeof navigator.app.exitApp === 'function') { navigator.app.exitApp(); return; } } catch (e) {}
    try { if (window.PalmSystem && PalmSystem.platformBack) { PalmSystem.platformBack(); return; } } catch (e) {}
    try { if (window.webOS && webOS.platformBack) { webOS.platformBack(); return; } } catch (e) {}
    try { window.open('', '_self'); window.close(); } catch (e) {}
    try { history.go(-history.length); } catch (e) {}
  }

  /* ---------- إضافة حساب من الموبايل بالـ QR (مشفر من الطرف للطرف) ---------- */
  var PHONE_PAGE = 'https://alifathy2.github.io/elhana/add.html';
  var RELAY = 'https://ntfy.sh/';
  var ph = { es: null, timer: null, topic: '', key: null, busy: false, since: '' };
  function phoneOpen() { return !$('phonedlg').classList.contains('hidden'); }
  function b64u(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function rnd(n) { var u = new Uint8Array(n); (window.crypto || window.msCrypto).getRandomValues(u); return u; }
  function hex(u8) { var s = ''; for (var i = 0; i < u8.length; i++) s += (u8[i] < 16 ? '0' : '') + u8[i].toString(16); return s; }
  function setPhoneStatus(t, bad) { var e = $('phoneStatus'); e.textContent = t; e.className = 'phone-status' + (bad ? ' bad' : ''); }
  function drawQr(text) {
    var cv = $('qrCanvas'), qr = null, tn;
    for (tn = 3; tn <= 14 && !qr; tn++) { try { var q = new window.EH_QR.QRCode(tn, window.EH_QR.ECL.M); q.addData(text); q.make(); qr = q; } catch (e) { qr = null; } }
    if (!qr) return false;
    var n = qr.getModuleCount(), quiet = 2, cell = Math.floor(cv.width / (n + quiet * 2)), off = Math.floor((cv.width - cell * n) / 2), c = cv.getContext('2d');
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, cv.width, cv.height); c.fillStyle = '#000000';
    for (var r = 0; r < n; r++) for (var k2 = 0; k2 < n; k2++) if (qr.isDark(r, k2)) c.fillRect(off + k2 * cell, off + r * cell, cell, cell);
    return true;
  }
  function phoneDecrypt(b64) {
    var raw = atob(b64.replace(/-/g, '+').replace(/_/g, '/')), u = new Uint8Array(raw.length), i;
    for (i = 0; i < raw.length; i++) u[i] = raw.charCodeAt(i);
    var iv = u.slice(0, 12), ct = u.slice(12), subtle = window.crypto.subtle;
    return subtle.importKey('raw', ph.key, { name: 'AES-GCM' }, false, ['decrypt']).then(function (k) {
      return subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, ct);
    }).then(function (buf) {
      var v = new Uint8Array(buf), s = ''; for (var j = 0; j < v.length; j++) s += String.fromCharCode(v[j]);
      return JSON.parse(decodeURIComponent(escape(s)));
    });
  }
  function phoneGotMessage(data) {
    var obj; try { obj = JSON.parse(data); } catch (e) { return; }
    if (!obj || obj.event !== 'message' || !obj.message || ph.busy) return;
    ph.busy = true;
    phoneDecrypt(String(obj.message)).then(function (p) {
      var acct;
      if (p.t === 'm3u') {
        var u = String(p.url || '').trim(); if (!u) throw new Error('x');
        if (!/^https?:\/\//i.test(u)) u = 'http://' + u;
        acct = { type: 'm3u', name: String(p.name || '').trim() || shortUrl(u), url: u };
      } else {
        var s = parseServer(p.host), user = String(p.user || '').trim(), pass = String(p.pass || '').trim();
        if (s && s.user && !user) user = s.user; if (s && s.pass && !pass) pass = s.pass;
        if (!s || !user || !pass) throw new Error('x');
        acct = { type: 'xtream', name: String(p.name || '').trim() || shortUrl(s.host), host: s.host, user: user, pass: pass };
      }
      setPhoneStatus(tr('phoneGot'));
      closePhone(true);
      attempt(acct, true);
    }).catch(function () { ph.busy = false; });
  }
  function phoneSubscribe() {
    var url = RELAY + ph.topic + '/sse';
    if (window.EventSource) {
      try {
        ph.es = new EventSource(url);
        ph.es.onmessage = function (ev) { phoneGotMessage(ev.data); };
        ph.es.onerror = function () { if (ph.es && ph.es.readyState === 2) setPhoneStatus(tr('phoneErr'), true); };
        return;
      } catch (e) { ph.es = null; }
    }
    ph.timer = setInterval(function () {
      var x = new XMLHttpRequest();
      x.open('GET', RELAY + ph.topic + '/json?poll=1&since=' + (ph.since || '10m'), true); x.timeout = 8000;
      x.onload = function () {
        if (x.status !== 200) return;
        x.responseText.split('\n').forEach(function (ln) { if (ln.trim()) { try { var o = JSON.parse(ln); ph.since = o.id || ph.since; } catch (e) {} phoneGotMessage(ln); } });
      };
      x.send();
    }, 3000);
  }
  function showPhoneAdd() {
    $('phonedlg').classList.remove('hidden'); $('btnPhoneClose').focus();
    var ok = window.crypto && window.crypto.subtle && window.EH_QR && window.crypto.getRandomValues;
    if (!ok) { $('qrCanvas').style.display = 'none'; $('phoneUrl').textContent = ''; setPhoneStatus(tr('phoneNoCrypto'), true); return; }
    $('qrCanvas').style.display = '';
    ph.topic = 'eh' + hex(rnd(12)); ph.key = rnd(16); ph.busy = false; ph.since = '';
    var link = PHONE_PAGE + '?t=' + ph.topic + '#' + b64u(ph.key);
    if (!drawQr(link)) { setPhoneStatus(tr('phoneErr'), true); return; }
    $('phoneUrl').textContent = PHONE_PAGE.replace(/^https?:\/\//, '');
    setPhoneStatus(tr('phoneWaiting'));
    phoneSubscribe();
  }
  function closePhone(keepFocus) {
    if (ph.es) { try { ph.es.close(); } catch (e) {} ph.es = null; }
    if (ph.timer) { clearInterval(ph.timer); ph.timer = null; }
    ph.key = null; ph.topic = '';
    $('phonedlg').classList.add('hidden');
    if (!keepFocus && curScreen() === 'login' && $('btnPhoneAdd')) $('btnPhoneAdd').focus();
  }

  /* ---------- ترحيب ---------- */
  var splashDone = false;
  function hideSplash() {
    if (splashDone) return; splashDone = true;
    var s = $('splash'); s.classList.add('out');
    setTimeout(function () { s.style.display = 'none'; }, 300);
  }

  /* ---------- الرجوع والتوافق مع أزرار الأندرويد والسحب ---------- */
  var lastBack = 0;
  function goBack() {
    var now = Date.now();
    if (now - lastBack < 300) return;
    lastBack = now;
    if (!splashDone) { hideSplash(); return; }
    if (termsOpen()) return;
    if (phoneOpen()) { closePhone(); return; }
    if (bgModalOpen()) { closeBgModal(); return; }
    if (exitOpen()) { hideExit(); return; }
    if (menu.open) { closeMenu(false); return; }
    if (playerOpen()) {
      if (pbFocused()) hideOsd();
      else closePlayer();
      return;
    }
    var s = curScreen();
    if (s === 'detail') { closeDetail(); return; }
    if (s === 'settings' || s === 'main') { showHome(); return; }
    if (s === 'accounts') { if (cfg) showHome(); else showExit(); return; }
    if (s === 'login') {
      var ae = document.activeElement;
      if (ae && ae.tagName === 'INPUT') { ae.blur(); $('btnLogin').focus(); return; }
      if (accounts().length) showAccounts(); else showExit();
      return;
    }
    showExit();
  }
  window.EH_BACK = goBack;
  function pushNavGuard() {
    try { history.pushState({ eh: 1 }, '', '#app'); } catch (e) {}
  }
  pushNavGuard();
  window.addEventListener('popstate', function () {
    pushNavGuard();
    goBack();
  });
  document.addEventListener('backbutton', function (e) {
    if (e && e.preventDefault) e.preventDefault();
    goBack();
  }, false);

  function yellowKey() {
    var s = curScreen();
    if (s === 'detail') { toggleFav(det.ty, det.s); updDetButtons(); return; }
    var a = document.activeElement;
    if (s === 'main' && a && a.hasAttribute && a.hasAttribute('data-i') && a.classList.contains('item')) {
      var ty = itType(), it = state.list[+a.getAttribute('data-i')];
      if (it) { toggleFav(ty, it); updHearts(); }
    }
  }

  document.addEventListener('keydown', function (e) {
    var k = e.keyCode;
    if (!splashDone) { e.preventDefault(); hideSplash(); return; }
    if (termsOpen()) { if (k === 37) { e.preventDefault(); move('left'); } else if (k === 39) { e.preventDefault(); move('right'); } else if (k === 38) { e.preventDefault(); $('termsBody').scrollTop -= 80; } else if (k === 40) { e.preventDefault(); $('termsBody').scrollTop += 80; } return; }
    if (phoneOpen()) { if (k === 461 || k === 27 || k === 4) { e.preventDefault(); closePhone(); } else if (k === 37 || k === 38 || k === 39 || k === 40) e.preventDefault(); return; }
    if (bgModalOpen()) { if (k === 461 || k === 27 || k === 4) { e.preventDefault(); closeBgModal(); } else if (k === 37) { e.preventDefault(); move('left'); } else if (k === 39) { e.preventDefault(); move('right'); } else if (k === 38) { e.preventDefault(); move('up'); } else if (k === 40) { e.preventDefault(); move('down'); } return; }
    if (exitOpen()) {
      if (k === 461 || k === 27 || k === 4) { e.preventDefault(); hideExit(); }
      else if (k === 37) { e.preventDefault(); move('left'); }
      else if (k === 39) { e.preventDefault(); move('right'); }
      return;
    }
    if (k === 461 || k === 27 || k === 4) { e.preventDefault(); goBack(); return; }
    if (playerOpen()) { playerKey(k, e); return; }
    if (menu.open) {
      if (k === 38) { e.preventDefault(); move('up'); }
      else if (k === 40) { e.preventDefault(); move('down'); }
      else if (k === 37 || k === 39) e.preventDefault();
      return;
    }
    if (k === 405) { e.preventDefault(); if (cfg) yellowKey(); return; }
    if (k === 37) { e.preventDefault(); move('left'); }
    else if (k === 39) { e.preventDefault(); move('right'); }
    else if (k === 38) { e.preventDefault(); move('up'); }
    else if (k === 40) { e.preventDefault(); move('down'); }
    else if (k === 13 && document.activeElement && document.activeElement.id === 'search') doSearch();
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('heart')) {
      var par = t.parentNode, idx = par && par.getAttribute && par.getAttribute('data-i');
      if (idx !== null && idx !== undefined) { var it = state.list[+idx]; if (it) { toggleFav(itType(), it); updHearts(); } }
      return;
    }
    while (t && t !== document && !(t.classList && t.classList.contains('f'))) t = t.parentNode;
    if (!t || t === document) return;
    var c = t.classList;
    if (t.id === 'btnHome') { showHome(); return; }
    if (c.contains('pb')) pbAction(t.getAttribute('data-act'), t);
    else if (c.contains('pm')) { var mi = menu.items[+t.getAttribute('data-i')]; closeMenu(false); if (mi && mi.run) mi.run(); }
    else if (c.contains('cat')) { $('search').value = ''; openCat(t.getAttribute('data-id'), true); }
    else if (c.contains('tab') && t.hasAttribute('data-type')) setType(t.getAttribute('data-type'), false);
    else if (c.contains('tile')) enterSection(t.getAttribute('data-type'));
    else if (c.contains('more')) renderMore();
    else if (c.contains('item') && t.hasAttribute('data-i')) onItem(+t.getAttribute('data-i'));
    else if (c.contains('eprow')) playEpisode(+t.getAttribute('data-ep'));
    else if (c.contains('sec')) { renderSettings(t.getAttribute('data-sec')); var sf = $('setSecs').querySelector('.sec.on'); if (sf) sf.focus(); }
    else if (t.hasAttribute('data-ltype')) setLoginType(t.getAttribute('data-ltype'));
    else if (t.hasAttribute('data-set')) applySetting(t.getAttribute('data-set'), t.getAttribute('data-val'));
    else if (t.hasAttribute('data-a')) { var a = accounts()[+t.getAttribute('data-a')]; if (a) attempt(a, true); }
    else if (t.hasAttribute('data-del')) {
      var arr = accounts(), di = +t.getAttribute('data-del'), gone = arr[di];
      arr.splice(di, 1); store(K.acc, arr);
      if (gone && cfg && acctKey(gone) === acctKey(cfg)) { cfg = null; info = null; m3u = null; favs = []; store(K.cur, -1); }
      renderAccounts();
      var nf = $('accList').querySelector('.f') || $('btnAddAcc'); nf.focus();
    }
    else if (t.id === 'btnLogin') doLogin();
    else if (t.id === 'btnAddAcc') showForm();
    else if (t.id === 'btnBackLogin' || t.id === 'btnBackAcc' || t.id === 'btnBackSet' || t.id === 'btnBackDet') goBack();
    else if (t.id === 'btnPlay') detPlay();
    else if (t.id === 'btnFav') { toggleFav(det.ty, det.s); updDetButtons(); }
    else if (t.id === 'btnSeason') openSeasonMenu();
    else if (t.id === 'btnSpeed') runSpeedTest();
    else if (t.id === 'btnSpeedStop') stopSpeedTest();
    else if (t.id === 'btnHomeExit') showExit();
    else if (t.id === 'btnHomeRefresh') refreshHome();
    else if (t.id === 'btnHomeBg' || t.id === 'btnSetBgPick') openBgModal();
    else if (t.id === 'btnBgLocalFile') pickHomeBg();
    else if (t.id === 'btnBgApplyUrl') applyBgUrl();
    else if (t.id === 'btnBgResetModal' || t.id === 'btnSetBgReset') resetHomeBg();
    else if (t.id === 'btnBgClose') closeBgModal();
    else if (t.id === 'btnPhoneAdd') showPhoneAdd();
    else if (t.id === 'btnPhoneClose') closePhone();
    else if (t.id === 'btnTimeSync') syncTime(true);
    else if (t.id === 'btnTimeReset') resetTimeOffset();
    else if (t.id === 'btnTermsAccept') acceptTerms();
    else if (t.id === 'btnTermsDecline') exitApp();
    else if (t.hasAttribute('data-theme')) { var tid = t.getAttribute('data-theme'); try { localStorage.removeItem(K.bg); } catch (er) {} applyTheme(tid); renderSettings('themes'); var tb = $('setPanel').querySelector('[data-theme="' + tid + '"]'); if (tb) tb.focus(); }
    else if (t.id === 'btnClearAllData') { toast(tr('clearDone'), 2000); try { localStorage.clear(); } catch (e) {} setTimeout(function () { location.reload(); }, 1000); }
    else if (t.id === 'btnUpdCheck') checkUpdate(true);
    else if (t.id === 'btnUpdReset') resetUpdate();
    else if (t.id === 'btnSettings') showSettings();
    else if (t.id === 'btnLogout2') showAccounts();
    else if (t.id === 'btnCats') { toggleCats(); var g = $('grid').querySelector('.f'); if (g && $('main').classList.contains('nocats')) g.focus(); }
    else if (t.id === 'btnExitYes') exitApp();
    else if (t.id === 'btnExitNo') hideExit();
    else if (c.contains('langbtn')) { LANG = LANG === 'ar' ? 'en' : 'ar'; store(K.lang, LANG); applyLang(); }
  });

  /* Magic Remote: المؤشر يحدد العنصر تحته */
  document.addEventListener('mouseover', function (e) {
    var x = e.target;
    while (x && x !== document && !(x.classList && x.classList.contains('f'))) x = x.parentNode;
    if (x && x !== document && x.tagName !== 'INPUT' && document.activeElement !== x) x.focus();
  });
  window.addEventListener('offline', function () { toast(tr('offline'), 6000); });
  window.addEventListener('online', function () { toast(tr('online'), 4000); });

  /* ---------- بدء ---------- */
  function bootAccountFlow() {
    var old = store('aliiptv.cfg');
    if (old && old.host && !accounts().length) { store(K.acc, [{ type: 'xtream', name: tr('myacct'), host: old.host, user: old.user, pass: old.pass }]); store(K.cur, 0); }
    var a = accounts(), cur = store(K.cur);
    if (typeof cur === 'number' && cur >= 0 && a[cur]) attempt(a[cur], false, function () { showAccounts(); });
    else if (a.length) showAccounts();
    else showForm();
  }
  initVideo(); toggleCats(store(K.cats) === true); applyLang(); applyTheme(); applySpeedbar(); applySbSize(); setLoginType('xtream');
  setInterval(updSpeed, 1000); updSpeed();
  setTimeout(function () {
    hideSplash();
    if (!store(K.terms)) showTerms();
  }, 1500);
  setTimeout(function () { syncTime(false); initWeather(); }, 2000);
  setTimeout(function () { if (!playerOpen()) checkUpdate(false); }, 8000);
  try { localStorage.removeItem('elhana.otaTry'); } catch (e) {}
  window.EH_OK = true;
  if (store(K.terms)) bootAccountFlow();
})();