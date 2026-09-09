// Good Heart Tech accessibility widget.
// Self-hosted, no dependencies, no build tooling required to read/modify.
// Adds a floating toolbar with contrast, font, readability, and text-to-speech controls.

(function () {
  "use strict";

  // Must be captured synchronously at top-level script execution — document.currentScript
  // is only valid while this script is the one actively running, not inside later callbacks.
  var SCRIPT_EL = document.currentScript;

  var STORAGE_KEY = "ghtA11y";
  var SEEN_KEY = "ghtA11ySeen";
  var ROOT = document.documentElement;
  var STYLE_ID = "ght-a11y-styles";

  // Placeholder replaced at build time (see build.js) with the minified contents of widget.css,
  // so the whole widget installs from a single <script> tag with no separate stylesheet link.
  var WIDGET_CSS = "__GHT_A11Y_CSS__";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = WIDGET_CSS;
    document.head.appendChild(style);
  }

  function applyBrandColors() {
    if (!SCRIPT_EL) return;
    var primary = SCRIPT_EL.getAttribute("data-brand-primary");
    var accent = SCRIPT_EL.getAttribute("data-brand-accent");
    if (primary) ROOT.style.setProperty("--ght-a11y-brand-primary", primary);
    if (accent) ROOT.style.setProperty("--ght-a11y-brand-accent", accent);
  }

  // Icon paths are Font Awesome Free solid icons (CC BY 4.0, https://fontawesome.com/license/free),
  // embedded inline so the widget makes zero external requests.
  var ICONS = {
    moon: { viewBox: "0 0 384 512", path: "M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" },
    sun: { viewBox: "0 0 512 512", path: "M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" },
    circleHalf: { viewBox: "0 0 512 512", path: "M448 256c0-106-86-192-192-192l0 384c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" },
    link: { viewBox: "0 0 640 512", path: "M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z" },
    heading: { viewBox: "0 0 448 512", path: "M0 64C0 46.3 14.3 32 32 32l48 0 48 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-16 0 0 112 224 0 0-112-16 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l48 0 48 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-16 0 0 144 0 176 16 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-48 0-48 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-144-224 0 0 144 16 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-48 0-48 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-176L48 96 32 96C14.3 96 0 81.7 0 64z" },
    font: { viewBox: "0 0 448 512", path: "M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416 32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-1.8 0 18-48 159.6 0 18 48-1.8 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-25.8 0L254 52.8zM279.8 304l-111.6 0L224 155.1 279.8 304z" },
    pointer: { viewBox: "0 0 320 512", path: "M0 55.2L0 426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320l118.1 0c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z" },
    volume: { viewBox: "0 0 640 512", path: "M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" },
    rotateLeft: { viewBox: "0 0 512 512", path: "M125.7 160l50.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 224c-17.7 0-32-14.3-32-32L16 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z" },
    check: { viewBox: "0 0 448 512", path: "M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" },
    xmark: { viewBox: "0 0 384 512", path: "M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" }
  };

  function iconSvg(name) {
    var icon = ICONS[name];
    return (
      '<svg viewBox="' + icon.viewBox + '" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="' + icon.path + '"/>' +
      "</svg>"
    );
  }

  var TOGGLE_FEATURES = [
    { id: "contrast-dark", group: "contrast", label: "Dark high-contrast", className: "ght-a11y-contrast-dark", icon: "moon" },
    { id: "contrast-bright", group: "contrast", label: "Bright high-contrast", className: "ght-a11y-contrast-bright", icon: "sun" },
    { id: "contrast-mono", group: "contrast", label: "Monochrome", className: "ght-a11y-contrast-mono", icon: "circleHalf" },
    { id: "highlight-links", label: "Highlight links", className: "ght-a11y-highlight-links", icon: "link" },
    { id: "highlight-headers", label: "Highlight headers", className: "ght-a11y-highlight-headers", icon: "heading" },
    { id: "readable-font", label: "Readable font", className: "ght-a11y-readable-font", icon: "font" },
    { id: "cursor-large", label: "Enlarge cursor", className: "ght-a11y-cursor-large", icon: "pointer" }
  ];

  var STEP_FEATURES = [
    { id: "font-scale", label: "Font size", cssVar: "--ght-a11y-font-scale", min: 1, max: 2, step: 0.1, base: 1, format: function (v) { return Math.round(v * 100) + "%"; } },
    { id: "line-spacing", label: "Line spacing", cssVar: "--ght-a11y-line-spacing", min: 1, max: 2.5, step: 0.1, base: 1, format: function (v) { return Math.round(v * 100) + "%"; } },
    { id: "word-spacing", label: "Word spacing", cssVar: "--ght-a11y-word-spacing", min: 0, max: 1, step: 0.1, base: 0, unit: "em", format: function (v) { return v.toFixed(1) + "em"; } },
    { id: "letter-spacing", label: "Letter spacing", cssVar: "--ght-a11y-letter-spacing", min: 0, max: 0.3, step: 0.02, base: 0, unit: "em", format: function (v) { return v.toFixed(2) + "em"; } }
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
      updateStepReadout(f, value);
    });
  }

  var stepReadoutEls = {};
  function updateStepReadout(feature, value) {
    var el = stepReadoutEls[feature.id];
    if (el) el.textContent = feature.format(value);
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
    updateStepReadout(feature, next);
    saveState();
    return next;
  }

  function resetAll() {
    state = {};
    TOGGLE_FEATURES.forEach(function (f) { ROOT.classList.remove(f.className); });
    STEP_FEATURES.forEach(function (f) {
      ROOT.style.setProperty(f.cssVar, f.base + (f.unit || ""));
      updateStepReadout(f, f.base);
    });
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
    var label = readerButtonEl.querySelector(".ght-a11y-toggle-label");
    if (label) label.textContent = speaking ? "Stop reading" : "Read page aloud";
  }

  // Glyph only, no background circle: the toggle button already provides a colored
  // circle (var(--ght-a11y-brand-primary)). Path is Font Awesome Free's "life-ring"
  // icon (CC BY 4.0, https://fontawesome.com/license/free), embedded inline so the
  // widget makes zero external requests. See assets/icon-mark.svg for the standalone
  // logo version with its own background, used as the project's favicon/badge.
  function svgIcon() {
    return (
      '<svg viewBox="0 0 512 512" width="26" height="26" aria-hidden="true" focusable="false">' +
      '<path fill="#fff" d="M367.2 412.5C335.9 434.9 297.5 448 256 448s-79.9-13.1-111.2-35.5l58-58c15.8 8.6 34 13.5 53.3 13.5s37.4-4.9 53.3-13.5l58 58zm90.7 .8c33.8-43.4 54-98 54-157.3s-20.2-113.9-54-157.3c9-12.5 7.9-30.1-3.4-41.3S425.8 45 413.3 54C369.9 20.2 315.3 0 256 0S142.1 20.2 98.7 54c-12.5-9-30.1-7.9-41.3 3.4S45 86.2 54 98.7C20.2 142.1 0 196.7 0 256s20.2 113.9 54 157.3c-9 12.5-7.9 30.1 3.4 41.3S86.2 467 98.7 458c43.4 33.8 98 54 157.3 54s113.9-20.2 157.3-54c12.5 9 30.1 7.9 41.3-3.4s12.4-28.8 3.4-41.3zm-45.5-46.1l-58-58c8.6-15.8 13.5-34 13.5-53.3s-4.9-37.4-13.5-53.3l58-58C434.9 176.1 448 214.5 448 256s-13.1 79.9-35.5 111.2zM367.2 99.5l-58 58c-15.8-8.6-34-13.5-53.3-13.5s-37.4 4.9-53.3 13.5l-58-58C176.1 77.1 214.5 64 256 64s79.9 13.1 111.2 35.5zM157.5 309.3l-58 58C77.1 335.9 64 297.5 64 256s13.1-79.9 35.5-111.2l58 58c-8.6 15.8-13.5 34-13.5 53.3s4.9 37.4 13.5 53.3zM208 256a48 48 0 1 1 96 0 48 48 0 1 1 -96 0z"/>' +
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
    closeBtn.innerHTML = iconSvg("xmark");
    closeBtn.addEventListener("click", closePanel);
    panel.appendChild(closeBtn);

    var grid = document.createElement("div");
    grid.className = "ght-a11y-grid";
    var lastGroup = null;
    TOGGLE_FEATURES.forEach(function (feature) {
      if (feature.group && feature.group !== lastGroup) {
        var groupLabel = document.createElement("div");
        groupLabel.className = "ght-a11y-group-label";
        groupLabel.textContent = "Contrast";
        grid.appendChild(groupLabel);
      }
      lastGroup = feature.group || null;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ght-a11y-toggle";
      btn.innerHTML =
        '<span class="ght-a11y-toggle-check">' + iconSvg("check") + "</span>" +
        '<span class="ght-a11y-toggle-icon">' + iconSvg(feature.icon) + "</span>" +
        '<span class="ght-a11y-toggle-label">' + feature.label + "</span>";
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

      var readout = document.createElement("span");
      readout.className = "ght-a11y-step-readout";
      readout.textContent = feature.format(typeof state[feature.id] === "number" ? state[feature.id] : feature.base);
      stepReadoutEls[feature.id] = readout;
      row.appendChild(readout);

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
    readerBtn.innerHTML = '<span class="ght-a11y-toggle-icon">' + iconSvg("volume") + "</span>" +
      '<span class="ght-a11y-toggle-label">Read page aloud</span>';
    readerBtn.addEventListener("click", speakPage);
    readerButtonEl = readerBtn;
    panel.appendChild(readerBtn);

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "ght-a11y-reset ght-a11y-full-width";
    resetBtn.innerHTML = '<span class="ght-a11y-toggle-icon">' + iconSvg("rotateLeft") + "</span>" +
      '<span class="ght-a11y-toggle-label">Reset all</span>';
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
    markSeen();
  }

  var seenMarked = false;
  function markSeen() {
    if (seenMarked) return;
    seenMarked = true;
    toggleBtn.classList.remove("ght-a11y-pulse");
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch (e) {
      /* localStorage unavailable — pulse will just show again next visit, harmless */
    }
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
    injectStyles();
    applyBrandColors();
    applyAllState();

    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "ght-a11y-toggle-btn";
    toggleBtn.setAttribute("aria-label", "Accessibility options");
    toggleBtn.setAttribute("aria-haspopup", "dialog");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = svgIcon();

    var alreadySeen = true;
    try {
      alreadySeen = !!localStorage.getItem(SEEN_KEY);
    } catch (e) {
      alreadySeen = true; /* can't persist, so don't pulse every load */
    }
    if (!alreadySeen) {
      toggleBtn.classList.add("ght-a11y-pulse");
      setTimeout(markSeen, 6000);
    }

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
