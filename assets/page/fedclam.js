/* FedCLAM page: the hero window's loop, the results explorer (Tables 1 and 2 of the paper) and the BibTeX copy.
   Every number is the paper's: test Dice per client, the average across clients and the standard deviation
   between clients (the paper's fairness measure), MICCAI 2025, Tables 1 and 2. */
(function () {
  "use strict";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PHONE = window.matchMedia("(max-width: 639px)").matches;
  var NF = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var SF = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always" });

  var M = [
    { id: "fedavg", name: "FedAvg" }, { id: "fedavgm", name: "FedAvgM" }, { id: "fedevi", name: "FedEvi" },
    { id: "fedfa", name: "FedFA" }, { id: "fedprox", name: "FedProx" }, { id: "fedsam", name: "FedSAM" },
    { id: "feddyn", name: "FedDyn" }, { id: "harmofl", name: "HarmoFL" }
  ];
  var D = {
    fundus: {
      name: "fundus", long: "Fundus", lo: 70, hi: 95, step: 5,
      r: {
        fedavg: [[74.53, 90.83, 90.80, 82.71], 84.72, 7.79],
        fedavgm: [[81.58, 90.52, 90.55, 80.81], 85.86, 5.40],
        fedevi: [[85.48, 91.07, 92.20, 82.97], 87.93, 4.42],
        fedfa: [[79.56, 91.77, 91.69, 82.10], 86.28, 6.37],
        fedprox: [[84.24, 91.62, 92.21, 82.71], 87.69, 4.91],
        fedsam: [[81.44, 91.42, 90.69, 80.64], 86.05, 5.80],
        feddyn: [[85.78, 90.28, 90.87, 83.05], 87.49, 3.73],
        harmofl: [[80.55, 91.52, 91.13, 80.82], 86.00, 6.14],
        fedclam: [[88.14, 90.30, 91.66, 85.17], 88.82, 2.83]
      }
    },
    prostate: {
      name: "prostate MRI", long: "Prostate MRI", lo: 88, hi: 97, step: 2,
      r: {
        fedavg: [[91.46, 93.06, 92.61, 95.40, 93.84, 90.24], 92.77, 1.80],
        fedavgm: [[89.08, 93.46, 94.31, 96.00, 94.18, 89.44], 92.74, 2.82],
        fedevi: [[92.02, 93.36, 93.45, 95.71, 93.60, 90.66], 93.13, 1.69],
        fedfa: [[91.42, 93.29, 93.26, 95.28, 93.87, 90.74], 92.98, 1.65],
        fedprox: [[91.35, 93.57, 92.07, 95.36, 93.70, 90.20], 92.71, 1.86],
        fedsam: [[92.44, 93.23, 93.02, 95.57, 94.30, 90.41], 93.16, 1.74],
        feddyn: [[91.90, 93.44, 92.98, 95.69, 93.82, 89.97], 92.97, 1.92],
        harmofl: [[92.61, 93.87, 94.60, 95.96, 94.23, 90.40], 93.61, 1.91],
        fedclam: [[92.85, 94.61, 94.77, 95.71, 94.27, 90.21], 93.74, 1.96]
      }
    }
  };
  function nameOf(id) { for (var i = 0; i < M.length; i++) if (M[i].id === id) return M[i].name; return "FedCLAM"; }

  /* ---- the hero window: FedAvg, then FedCLAM, two rounds, then it rests on FedCLAM ---- */
  var win = document.getElementById("hero-win");
  if (win) {
    var F = D.fundus, rows = win.querySelectorAll(".cl-row"), segs = win.querySelectorAll(".cl-seg span");
    var pct = function (v) { return ((v - F.lo) / (F.hi - F.lo) * 100).toFixed(2) + "%"; };
    var show = function (m) {
      var cur = F.r[m][0], other = F.r[m === "fedclam" ? "fedavg" : "fedclam"][0];
      win.setAttribute("data-m", m);
      segs.forEach(function (s) { s.classList.toggle("is-on", s.getAttribute("data-m") === m); });
      rows.forEach(function (r, k) {
        r.querySelector("i").style.setProperty("--v", pct(cur[k]));
        r.querySelector("b").style.setProperty("--g", pct(other[k]));
        r.querySelector(".cl-row__v").textContent = NF.format(cur[k]);
      });
      var dd = win.querySelectorAll(".cl-sum dd");
      if (dd.length === 2) { dd[0].textContent = NF.format(F.r[m][1]); dd[1].textContent = NF.format(F.r[m][2]); }
    };
    if (!REDUCED && !PHONE) {
      var rounds = 0, timer = 0, stopped = false;
      var stop = function () { stopped = true; clearTimeout(timer); show("fedclam"); };
      var round = function () {
        if (stopped) return;
        show("fedavg");
        timer = setTimeout(function () {
          if (stopped) return;
          show("fedclam");
          if (++rounds < 2) timer = setTimeout(round, 2600);
        }, 1800);
      };
      timer = setTimeout(round, 900);
      var media = win.closest(".hero__media");
      if (media) media.addEventListener("click", function (e) { if (e.target.closest(".loop-pause")) stop(); });
      document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); });
    }
  }

  /* ---- the results explorer ---- */
  var list = document.getElementById("cl-list"), open = document.getElementById("cl-open");
  var status = document.getElementById("cl-status");
  function say(t) { if (status) { status.textContent = ""; setTimeout(function () { status.textContent = t; }, 60); } }
  function setParams(o) { try { var u = new URL(location.href); for (var k in o) u.searchParams.set(k, o[k]); history.replaceState(null, "", u); } catch (e) {} }
  function svgEl(tag, a, p) { var n = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; }

  if (list && open) {
    var q = new URLSearchParams(location.search);
    var state = { set: D[q.get("data")] ? q.get("data") : "fundus", vs: "fedevi" };
    if (q.get("vs")) M.forEach(function (m) { if (m.id === q.get("vs")) state.vs = m.id; });
    var title = document.getElementById("cl-title"), meta = document.getElementById("cl-meta"), legend = document.getElementById("cl-legend");
    var setBtns = document.querySelectorAll(".cl-data button");
    var pane = open.closest(".ui-panel");

    var css = function (n, d) { var v = getComputedStyle(pane).getPropertyValue(n).trim(); return v || d; };

    var buildList = function () {
      var T = D[state.set].r, ours = T.fedclam[1];
      list.innerHTML = "";
      M.forEach(function (m) {
        var li = document.createElement("li"), b = document.createElement("button");
        b.type = "button"; b.className = "cl-item"; b.setAttribute("data-id", m.id);
        b.setAttribute("aria-pressed", m.id === state.vs ? "true" : "false");
        var d = ours - T[m.id][1];
        b.innerHTML = '<span translate="no">' + m.name + "</span><span>" + NF.format(T[m.id][1]) + "</span><span>" + NF.format(T[m.id][2]) + '</span><span class="cl-d">' + SF.format(d) + "</span>";
        b.setAttribute("aria-label", m.name + ": average Dice " + NF.format(T[m.id][1]) + ", spread " + NF.format(T[m.id][2]) + ". FedCLAM is " + NF.format(Math.abs(d)) + (d >= 0 ? " higher" : " lower") + " on average.");
        b.addEventListener("click", function () { state.vs = m.id; sync(true); });
        li.appendChild(b); list.appendChild(li);
      });
    };

    var draw = function () {
      var S = D[state.set], base = S.r[state.vs], ours = S.r.fedclam;
      var w = Math.max(280, Math.round(open.clientWidth || 600));
      var narrow = w < 460;
      var tall = (window.innerWidth || 0) >= 1280;
      var labW = narrow ? 52 : 84, valW = narrow ? 104 : 150, padT = narrow ? 26 : 30, rowH = narrow ? 40 : (tall ? 56 : 46);
      var n = base[0].length, rowsN = n + 1, h = padT + rowsN * rowH + 10;
      var x0 = labW, x1 = w - valW - 12;
      var X = function (v) { return x0 + (v - S.lo) / (S.hi - S.lo) * (x1 - x0); };
      var ink = css("--u-ink", "#1f3038"), mut = css("--u-text-2", "#3d4b52"), line = css("--u-line", "rgba(31,48,56,.12)");
      var cBase = getComputedStyle(document.documentElement).getPropertyValue("--p-muted").trim() || "#5d6b72";
      var cOurs = getComputedStyle(document.documentElement).getPropertyValue("--p-accent").trim() || "#0d7480";
      var svg = svgEl("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": "Test Dice per client on " + S.name + ", " + nameOf(state.vs) + " against FedCLAM" });
      for (var t = S.lo; t <= S.hi + 0.001; t += S.step) {
        svgEl("line", { x1: X(t), x2: X(t), y1: padT - 8, y2: h - 6, stroke: line, "stroke-width": 1 }, svg);
        svgEl("text", { x: X(t), y: 14, fill: mut, "font-size": 12, "text-anchor": "middle" }, svg).textContent = t;
      }
      for (var i = 0; i < rowsN; i++) {
        var avg = i === n, y = padT + i * rowH + rowH / 2;
        var a = avg ? base[1] : base[0][i], b = avg ? ours[1] : ours[0][i];
        if (avg) svgEl("line", { x1: 0, x2: w, y1: y - rowH / 2, y2: y - rowH / 2, stroke: line, "stroke-width": 1 }, svg);
        svgEl("text", { x: 0, y: y + 4.5, fill: avg ? ink : mut, "font-size": narrow ? 12.5 : 13, "font-weight": avg ? 500 : 400 }, svg).textContent = avg ? "Average" : (narrow ? "C" : "Client ") + (i + 1);
        svgEl("line", { x1: X(Math.min(a, b)), x2: X(Math.max(a, b)), y1: y, y2: y, stroke: b >= a ? cOurs : cBase, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.45 }, svg);
        svgEl("circle", { cx: X(a), cy: y, r: 6.5, fill: "#ffffff", stroke: cBase, "stroke-width": 2.5 }, svg);
        svgEl("circle", { cx: X(b), cy: y, r: 6.5, fill: cOurs }, svg);
        var tx = svgEl("text", { x: w, y: y + 4.5, "font-size": narrow ? 12 : 13, "text-anchor": "end", "font-family": "IBM Plex Mono, ui-monospace, monospace" }, svg);
        var t1 = svgEl("tspan", { fill: mut }, tx); t1.textContent = NF.format(a);
        var t2 = svgEl("tspan", { fill: mut }, tx); t2.textContent = "  →  ";
        var t3 = svgEl("tspan", { fill: cOurs, "font-weight": 500 }, tx); t3.textContent = NF.format(b);
      }
      open.innerHTML = "";
      open.appendChild(svg);
      var dl = document.createElement("dl"); dl.className = "cl-sum cl-sum--open";
      dl.innerHTML = "<div><dt>Spread across clients, " + nameOf(state.vs) + "</dt><dd>" + NF.format(base[2]) + "</dd></div><div><dt>Spread across clients, FedCLAM</dt><dd>" + NF.format(ours[2]) + "</dd></div>";
      open.appendChild(dl);
      legend.innerHTML = '<span style="--c:' + cBase + '"><i style="background:#fff;box-shadow:inset 0 0 0 2.5px ' + cBase + '"></i><span translate="no">' + nameOf(state.vs) + '</span></span><span style="--c:' + cOurs + '"><i></i><span translate="no">FedCLAM</span></span>';
    };

    var sync = function (announce) {
      var S = D[state.set];
      setBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-set") === state.set ? "true" : "false"); });
      buildList(); draw();
      title.textContent = "FedCLAM and " + nameOf(state.vs) + " on " + S.name;
      meta.textContent = "test Dice per client, " + S.r.fedclam[0].length + " clients";
      setParams({ data: state.set, vs: state.vs });
      if (announce) {
        var a = S.r[state.vs][1], b = S.r.fedclam[1];
        say(nameOf(state.vs) + " on " + S.name + ": average Dice " + NF.format(a) + " against " + NF.format(b) + " for FedCLAM.");
      }
    };
    setBtns.forEach(function (b) { b.addEventListener("click", function () { state.set = b.getAttribute("data-set"); sync(true); }); });
    sync(false);
    if ("ResizeObserver" in window) { var lastW = 0; new ResizeObserver(function () { var cw = Math.round(open.clientWidth); if (cw && Math.abs(cw - lastW) > 2) { lastW = cw; draw(); } }).observe(open); }
  }

  /* ---- copy the BibTeX ---- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = document.getElementById(btn.getAttribute("data-copy"));
      if (!src || !navigator.clipboard) return;
      navigator.clipboard.writeText(src.textContent).then(function () {
        var was = btn.textContent; btn.textContent = "Copied"; say("BibTeX copied to the clipboard.");
        setTimeout(function () { btn.textContent = was; }, 1600);
      });
    });
  });
})();
