# El Hana IPTV – Android (APK)

مشغّل IPTV (Xtream Codes + M3U) لأجهزة أندرويد – نفس تطبيق الشاشة (الإصدار 2.1.0) داخل غلاف أندرويد.

## أسهل طريقة لعمل ملف APK: GitHub (مجاني، من غير تثبيت أي برنامج)

1. ادخل على github.com واعمل **New repository** باسم `elhana-iptv-android` (اختار **Private**).
2. اضغط **uploading an existing file** وفك ضغط الملف ثم اسحب **كل محتويات** فولدر `ElHanaIPTV` جوه الصفحة (بما فيهم فولدر `.github` وملف `elhana-release.jks`) واضغط **Commit changes**.
   - لو فولدر `.github` ما اترفعش: اضغط **Add file ▸ Create new file** واكتب الاسم `.github/workflows/build-apk.yml` والصق محتوى الملف `build-apk.yml` واضغط Commit.
3. افتح تبويب **Actions** ▸ **Build APK** ▸ **Run workflow** (أو هيشتغل لوحده بعد الرفع). استنى 5–8 دقايق.
4. بعد ما يخلص: من الصفحة الرئيسية للـ repository افتح **Releases** على اليمين ونزّل **El-Hana-IPTV.apk**.
5. انقل الملف للموبايل وافتحه. لو طلب الموبايل، فعّل **Install unknown apps / تثبيت تطبيقات غير معروفة** لتطبيق المتصفح أو الملفات.

## طريقة بديلة: Android Studio
افتح الفولدر في Android Studio ▸ اختار **Build Variants ▸ release** ▸ **Build ▸ Build APK(s)**.
الملف بيطلع في `app/build/outputs/apk/release/app-release.apk`.

## معلومات مهمة
- **التوافق:** أندرويد 5.0 فأحدث (API 21+)، وبيشتغل على كل المعالجات (ARM / ARM64 / x86) لأنه مفيهوش كود native.
- **WebView:** محتاج تطبيق Android System WebView محدّث (موجود افتراضياً ويتحدث من Google Play).
- **الشاشة:** أفقي (Landscape) فقط. التحكم باللمس: اللمسة تفتح الفيلم، واللمس على القلب يضيف للمفضلة (زر الريموت الأصفر مش موجود).
- **زر الرجوع:** نفس سلوك التطبيق على الشاشة: المشغل ← القائمة ← الرئيسية ← نافذة الخروج.
- **التشغيل:** روابط HLS (m3u8) بتشتغل مباشرة من مشغل أندرويد. بث `.ts` الخام ممكن ما يشتغلش على بعض الأجهزة.
- **مفتاح التوقيع `elhana-release.jks`:** احتفظ بنسخة منه في مكان آمن، وبنفس المفتاح التحديثات بتتثبت فوق القديم من غير مسح. كلمة السر مكتوبة في `app/build.gradle`. لا ترفع المشروع على repository عام.
- **الصلاحيات:** إنترنت فقط. بيسمح بروابط http لأن أغلب سيرفرات IPTV مش HTTPS.
