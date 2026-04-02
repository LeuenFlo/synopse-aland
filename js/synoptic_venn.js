/**
 * Venn-Diagramm (venn.js + d3): nur Matthäus, Markus, Lukas.
 * Daten: data/evangelien_venn_rohdaten.json
 * Layout: inclusive Kardinalitäten; Zahlen in den Regionen: exklusive Perikopen.
 */
(function () {
  var chartEl = document.getElementById("venn-chart");
  var d3lib = typeof window !== "undefined" ? window.d3 : null;
  var vennlib = typeof window !== "undefined" ? window.venn : null;

  if (!chartEl || !d3lib || !vennlib || typeof vennlib.VennDiagram !== "function") {
    if (chartEl) {
      chartEl.innerHTML =
        '<p class="venn-fallback">Diagramm konnte nicht geladen werden (bitte <code>lib/d3.v4.min.js</code> und <code>lib/venn.min.js</code> prüfen).</p>';
    }
    return;
  }

  var MT = "Matthäus";
  var MK = "Markus";
  var LK = "Lukas";
  var PAPER = "#e4e9ee";

  var lastPayload = null;

  function sortKey(sets) {
    return []
      .concat(sets || [])
      .sort(function (a, b) {
        return a.localeCompare(b, "de");
      })
      .join(",");
  }

  function exclusiveRegionKey(mt, mk, lk) {
    if (mt && !mk && !lk) return sortKey([MT]);
    if (!mt && mk && !lk) return sortKey([MK]);
    if (!mt && !mk && lk) return sortKey([LK]);
    if (mt && mk && !lk) return sortKey([MT, MK]);
    if (mt && !mk && lk) return sortKey([MT, LK]);
    if (!mt && mk && lk) return sortKey([MK, LK]);
    if (mt && mk && lk) return sortKey([MT, MK, LK]);
    return null;
  }

  function compute(rows) {
    var exclusive = Object.create(null);
    var inc = {
      mt: 0,
      mk: 0,
      lk: 0,
      mt_mk: 0,
      mt_lk: 0,
      mk_lk: 0,
      all: 0,
    };

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var mt = !!r.in_matthew;
      var mk = !!r.in_mark;
      var lk = !!r.in_luke;

      if (mt) inc.mt++;
      if (mk) inc.mk++;
      if (lk) inc.lk++;
      if (mt && mk) inc.mt_mk++;
      if (mt && lk) inc.mt_lk++;
      if (mk && lk) inc.mk_lk++;
      if (mt && mk && lk) inc.all++;

      var ek = exclusiveRegionKey(mt, mk, lk);
      if (ek) exclusive[ek] = (exclusive[ek] || 0) + 1;
    }

    var sets = [
      { sets: [MT], size: inc.mt },
      { sets: [MK], size: inc.mk },
      { sets: [LK], size: inc.lk },
      { sets: [MT, MK], size: inc.mt_mk },
      { sets: [MT, LK], size: inc.mt_lk },
      { sets: [MK, LK], size: inc.mk_lk },
      { sets: [MT, MK, LK], size: inc.all },
    ];

    return { sets: sets, exclusive: exclusive };
  }

  function render(payload) {
    lastPayload = payload;
    var rows = payload.perikopen;
    if (!Array.isArray(rows) || !rows.length) {
      chartEl.innerHTML = '<p class="venn-fallback">Keine Perikopen in den Daten.</p>';
      return;
    }

    var out = compute(rows);
    var sets = out.sets;
    var exclusive = out.exclusive;

    var w = chartEl.clientWidth;
    if (!w || w < 200) w = chartEl.parentElement ? chartEl.parentElement.clientWidth : 320;
    if (!w || w < 200) w = 320;
    w = Math.min(w, 420);
    var h = Math.round(w * 0.78);

    chartEl.innerHTML = "";
    var div = d3lib.select(chartEl);

    var chart = vennlib.VennDiagram().width(w).height(h).duration(400).styled(false);

    div.datum(sets).call(chart);

    div.selectAll(".venn-area path")
      .style("fill", function (d) {
        if (!d || !d.sets) return "rgba(90, 98, 110, 0.3)";
        var n = d.sets.length;
        if (n === 1) {
          var s = d.sets[0];
          if (s === MT) return "rgba(107, 155, 209, 0.42)";
          if (s === MK) return "rgba(196, 163, 90, 0.42)";
          if (s === LK) return "rgba(122, 171, 142, 0.42)";
        }
        if (n === 2) return "rgba(155, 145, 175, 0.28)";
        return "rgba(130, 125, 155, 0.38)";
      })
      .style("stroke", "rgba(228, 233, 238, 0.2)")
      .style("stroke-width", 1.5);

    div.selectAll("g.venn-area").each(function (d) {
      if (!d || !d.sets || !d.sets.length) return;
      var key = sortKey(d.sets);
      var val = exclusive[key];
      if (val == null) return;
      var t = d3lib.select(this).select("text.label");
      if (t.empty()) t = d3lib.select(this).select("text");
      if (t.empty()) return;
      t.text(String(val))
        .style("fill", PAPER)
        .style("font-family", "'DM Sans', system-ui, sans-serif")
        .style("font-size", Math.max(12, Math.round(w / 26)) + "px")
        .style("font-weight", "600");
    });
  }

  function showRenderError(err) {
    var msg =
      err && err.message
        ? String(err.message)
        : "Unbekannter Fehler beim Zeichnen des Venn-Diagramms.";
    chartEl.innerHTML =
      '<p class="venn-fallback">Diagramm: ' +
      msg.replace(/</g, "&lt;") +
      '</p><p class="venn-fallback" style="margin-top:0.5rem;font-size:0.75rem">Hinweis: venn.js wird mit <strong>d3 v4</strong> geladen (<code>lib/d3.v4.min.js</code>).</p>';
  }

  function renderSafe(payload) {
    try {
      render(payload);
    } catch (err) {
      showRenderError(err);
    }
  }

  fetch("data/evangelien_venn_rohdaten.json")
    .then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then(function (payload) {
      requestAnimationFrame(function () {
        renderSafe(payload);
      });
    })
    .catch(function () {
      chartEl.innerHTML =
        '<p class="venn-fallback">Daten konnten nicht geladen werden (<code>data/evangelien_venn_rohdaten.json</code>). Seite bitte über einen lokalen Webserver öffnen (nicht <code>file://</code>).</p>';
    });

  var resizeTimer;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (lastPayload) renderSafe(lastPayload);
      }, 120);
    },
    { passive: true },
  );
})();
