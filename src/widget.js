// Good Heart Tech accessibility widget.
// Self-hosted, no dependencies, no build tooling required to read/modify.
// Adds a floating toolbar with contrast, font, readability, and text-to-speech controls.

(function () {
  "use strict";

  var STORAGE_KEY = "ghtA11y";
  var ROOT = document.documentElement;

  var TOGGLE_FEATURES = [
    { id: "contrast-dark", group: "contrast", label: "Dark high-contrast", className: "ght-a11y-contrast-dark" },
    { id: "contrast-bright", group: "contrast", label: "Bright high-contrast", className: "ght-a11y-contrast-bright" },
    { id: "contrast-mono", group: "contrast", label: "Monochrome", className: "ght-a11y-contrast-mono" },
    { id: "highlight-links", label: "Highlight links", className: "ght-a11y-highlight-links" },
    { id: "highlight-headers", label: "Highlight headers", className: "ght-a11y-highlight-headers" },
    { id: "readable-font", label: "Readable font", className: "ght-a11y-readable-font" },
    { id: "cursor-large", label: "Enlarge cursor", className: "ght-a11y-cursor-large" }
  ];

  var STEP_FEATURES = [
    { id: "font-scale", label: "Font size", cssVar: "--ght-a11y-font-scale", min: 1, max: 2, step: 0.1, base: 1 },
    { id: "line-spacing", label: "Line spacing", cssVar: "--ght-a11y-line-spacing", min: 1, max: 2.5, step: 0.1, base: 1 },
    { id: "word-spacing", label: "Word spacing", cssVar: "--ght-a11y-word-spacing", min: 0, max: 1, step: 0.1, base: 0, unit: "em" },
    { id: "letter-spacing", label: "Letter spacing", cssVar: "--ght-a11y-letter-spacing", min: 0, max: 0.3, step: 0.02, base: 0, unit: "em" }
  ];

  var state = loadState();
  var speaking = false;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* localStorage unavailable (private mode, quota) — settings just won't persist */
    }
  }

  function applyAllState() {
    TOGGLE_FEATURES.forEach(function (f) {
      ROOT.classList.toggle(f.className, !!state[f.id]);
    });
    STEP_FEATURES.forEach(function (f) {
      var value = typeof state[f.id] === "number" ? state[f.id] : f.base;
      ROOT.style.setProperty(f.cssVar, value + (f.unit || ""));
    });
  }

  function setToggle(feature, on) {
    if (feature.group) {
      TOGGLE_FEATURES.filter(function (f) { return f.group === feature.group; }).forEach(function (f) {
        state[f.id] = false;
        ROOT.classList.remove(f.className);
      });
    }
    state[feature.id] = on;
    ROOT.classList.toggle(feature.className, on);
    saveState();
  }

  function stepValue(feature, direction) {
    var current = typeof state[feature.id] === "number" ? state[feature.id] : feature.base;
    var next = Math.min(feature.max, Math.max(feature.min, +(current + direction * feature.step).toFixed(2)));
    state[feature.id] = next;
    ROOT.style.setProperty(feature.cssVar, next + (feature.unit || ""));
    saveState();
    return next;
  }

  function resetAll() {
    state = {};
    TOGGLE_FEATURES.forEach(function (f) { ROOT.classList.remove(f.className); });
    STEP_FEATURES.forEach(function (f) { ROOT.style.setProperty(f.cssVar, f.base + (f.unit || "")); });
    saveState();
    stopSpeaking();
  }

  function speakPage() {
    if (!("speechSynthesis" in window)) {
      return;
    }
    if (speaking) {
      stopSpeaking();
      return;
    }
    var text = (document.body.innerText || "").trim();
    if (!text) {
      return;
    }
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = function () { speaking = false; updateReaderButton(); };
    utterance.onerror = function () { speaking = false; updateReaderButton(); };
    window.speechSynthesis.speak(utterance);
    speaking = true;
    updateReaderButton();
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speaking = false;
    updateReaderButton();
  }

  var readerButtonEl = null;
  function updateReaderButton() {
    if (!readerButtonEl) return;
    readerButtonEl.setAttribute("aria-pressed", String(speaking));
    readerButtonEl.textContent = speaking ? "Stop reading" : "Read page aloud";
  }

  function svgIcon() {
    return (
      '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="12" r="12" fill="currentColor"/>' +
      '<circle cx="12" cy="6" r="1.6" fill="#fff"/>' +
      '<path d="M8 10.5h8v1.6h-3.2l2.6 6.4-1.6.6-2-5-2 5-1.6-.6 2.6-6.4H8z" fill="#fff"/>' +
      "</svg>"
    );
  }

  function buildPanel() {
    var panel = document.createElement("div");
    panel.className = "ght-a11y-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Accessibility options");
    panel.hidden = true;

    var heading = document.createElement("div");
    heading.className = "ght-a11y-panel-heading";
    heading.textContent = "Accessibility";
    panel.appendChild(heading);

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "ght-a11y-close";
    closeBtn.setAttribute("aria-label", "Close accessibility panel");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", closePanel);
    panel.appendChild(closeBtn);

    var grid = document.createElement("div");
    grid.className = "ght-a11y-grid";
    TOGGLE_FEATURES.forEach(function (feature) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ght-a11y-toggle";
      btn.textContent = feature.label;
      btn.setAttribute("aria-pressed", String(!!state[feature.id]));
      btn.addEventListener("click", function () {
        var next = !state[feature.id];
        setToggle(feature, next);
        if (feature.group) {
          grid.querySelectorAll("[data-group='" + feature.group + "']").forEach(function (el) {
            el.setAttribute("aria-pressed", "false");
          });
        }
        btn.setAttribute("aria-pressed", String(next));
      });
      if (feature.group) {
        btn.setAttribute("data-group", feature.group);
      }
      grid.appendChild(btn);
    });
    panel.appendChild(grid);

    STEP_FEATURES.forEach(function (feature) {
      var row = document.createElement("div");
      row.className = "ght-a11y-step-row";

      var label = document.createElement("span");
      label.className = "ght-a11y-step-label";
      label.textContent = feature.label;
      row.appendChild(label);

      var minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "ght-a11y-step-btn";
      minusBtn.setAttribute("aria-label", "Decrease " + feature.label.toLowerCase());
      minusBtn.textContent = "−";
      minusBtn.addEventListener("click", function () { stepValue(feature, -1); });
      row.appendChild(minusBtn);

      var plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "ght-a11y-step-btn";
      plusBtn.setAttribute("aria-label", "Increase " + feature.label.toLowerCase());
      plusBtn.textContent = "+";
      plusBtn.addEventListener("click", function () { stepValue(feature, 1); });
      row.appendChild(plusBtn);

      panel.appendChild(row);
    });

    var readerBtn = document.createElement("button");
    readerBtn.type = "button";
    readerBtn.className = "ght-a11y-toggle ght-a11y-full-width";
    readerBtn.setAttribute("aria-pressed", "false");
    readerBtn.textContent = "Read page aloud";
    readerBtn.addEventListener("click", speakPage);
    readerButtonEl = readerBtn;
    panel.appendChild(readerBtn);

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "ght-a11y-reset ght-a11y-full-width";
    resetBtn.textContent = "Reset all";
    resetBtn.addEventListener("click", function () {
      resetAll();
      grid.querySelectorAll("button").forEach(function (btn) { btn.setAttribute("aria-pressed", "false"); });
    });
    panel.appendChild(resetBtn);

    return panel;
  }

  var panelEl = null;
  var toggleBtn = null;

  function openPanel() {
    panelEl.hidden = false;
    toggleBtn.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", onKeyDown, true);
    var firstFocusable = panelEl.querySelector("button");
    if (firstFocusable) firstFocusable.focus();
  }

  function closePanel() {
    panelEl.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKeyDown, true);
    toggleBtn.focus();
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      closePanel();
      return;
    }
    if (event.key === "Tab") {
      var focusable = panelEl.querySelectorAll("button:not([hidden])");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function init() {
    applyAllState();

    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "ght-a11y-toggle-btn";
    toggleBtn.setAttribute("aria-label", "Accessibility options");
    toggleBtn.setAttribute("aria-haspopup", "dialog");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = svgIcon();

    panelEl = buildPanel();

    toggleBtn.addEventListener("click", function () {
      if (panelEl.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });

    var container = document.createElement("div");
    container.className = "ght-a11y-root";
    container.appendChild(toggleBtn);
    container.appendChild(panelEl);
    document.body.appendChild(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
