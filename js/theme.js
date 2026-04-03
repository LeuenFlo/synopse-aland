(function () {
  var STORAGE_KEY = "synopse-theme";
  var META_LIGHT = "#ffffff";
  var META_DARK = "#0f0f0f";

  function getStoredTheme() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "dark" || v === "light") return v;
    } catch (e) {}
    return null;
  }

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    var meta = document.getElementById("meta-theme-color");
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? META_DARK : META_LIGHT);
    }
    var darkOn = theme === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.setAttribute("aria-checked", darkOn ? "true" : "false");
    });
  }

  function toggleTheme() {
    var cur =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    applyTheme(cur === "dark" ? "light" : "dark");
  }

  function init() {
    var stored = getStoredTheme();
    applyTheme(stored || "light");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
