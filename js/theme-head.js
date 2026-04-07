(function () {
  try {
    var theme = localStorage.getItem("synopse-theme");
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
