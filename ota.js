(function () {
  try {
    var raw = localStorage.getItem('elhana.ota');
    if (raw) {
      var ota = JSON.parse(raw);
      if (ota && ota.version && ota.js && ota.css && ota.index) {
        window.EH_VER = ota.version;
        window.EH_OTA = true;
        var st = document.querySelector('link[href="style.css"]');
        if (st) st.remove();
        var sTag = document.createElement('style');
        sTag.textContent = ota.css;
        document.head.appendChild(sTag);
        var m = ota.index.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (m) document.body.innerHTML = m[1];
        var sc = document.createElement('script');
        sc.textContent = ota.js;
        document.body.appendChild(sc);
        return;
      }
    }
  } catch (e) {}
  var def = document.createElement('script');
  def.src = 'app.js';
  document.body.appendChild(def);
})();
