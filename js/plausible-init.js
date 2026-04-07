(function () {
  var scriptSrc = "https://stats.synopse.ch/js/pa-izu_HGGO6-DSIU1cyxeTg.js";

  window.plausible = window.plausible || function () {
    (plausible.q = plausible.q || []).push(arguments);
  };
  plausible.init = plausible.init || function (options) {
    plausible.o = options || {};
  };
  plausible.init();

  if (document.querySelector('script[data-synopse-plausible="true"]')) {
    return;
  }

  var script = document.createElement("script");
  script.async = true;
  script.src = scriptSrc;
  script.setAttribute("data-synopse-plausible", "true");
  document.head.appendChild(script);
})();
