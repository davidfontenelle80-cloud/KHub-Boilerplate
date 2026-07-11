(function () {
  "use strict";

  const STORAGE_KEY = "aurum_voice_notes_v1";
  const THEME_KEY = "aurum_voice_theme";
  const FONT_KEY = "aurum_voice_font_step";
  const fontSteps = [0.9, 1, 1.12, 1.24];

  const state = {
    mode: "Note",
    listening: false,
    notes: loadNotes(),
    fontStep: Number(localStorage.getItem(FONT_KEY) || 1),
  };

  const els = {
    themeToggle: document.getElementById("theme-toggle"),
    searchToggle: document.getElementById("search-toggle"),
    fontDown: document.getElementById("font-down"),
    fontUp: document.getElementById("font-up"),
    micButton: document.getElementById("mic-button"),
    floatingMic: document.getElementById("floating-mic"),
    micLabel: document.getElementById("mic-label"),
    statusLine: document.getElementById("status-line"),
    rawInput: document.getElementById("raw-input"),
    polishedOutput: document.getElementById("polished-output"),
    refineBtn: document.getElementById("refine-btn"),
    copyBtn: document.getElementById("copy-btn"),
    shareBtn: document.getElementById("share-btn"),
    saveBtn: document.getElementById("save-btn"),
    sampleBtn: document.getElementById("sample-btn"),
    modeChip: document.getElementById("mode-chip"),
    noteList: document.getElementById("note-list"),
    noteSearch: document.getElementById("note-search"),
    searchWrap: document.getElementById("search-wrap"),
    clearNotes: document.getElementById("clear-notes"),
    toast: document.getElementById("toast"),
  };

  init();

  function init() {
    applyTheme(localStorage.getItem(THEME_KEY) || "dark");
    applyFontScale(state.fontStep);
    renderNotes();
    bindEvents();
    registerServiceWorker();
  }

  function bindEvents() {
    els.themeToggle.addEventListener("click", toggleTheme);
    els.fontDown.addEventListener("click", () => setFontStep(state.fontStep - 1));
    els.fontUp.addEventListener("click", () => setFontStep(state.fontStep + 1));
    els.searchToggle.addEventListener("click", () => els.noteSearch.focus());
    els.micButton.addEventListener("click", toggleListening);
    els.floatingMic.addEventListener("click", () => {
      document.getElementById("voice-title").scrollIntoView({ behavior: "smooth", block: "center" });
      els.micButton.focus();
      toggleListening();
    });
    els.refineBtn.addEventListener("click", refineDraft);
    els.copyBtn.addEventListener("click", copyOutput);
    els.shareBtn.addEventListener("click", shareOutput);
    els.saveBtn.addEventListener("click", saveNote);
    els.sampleBtn.addEventListener("click", loadSample);
    els.noteSearch.addEventListener("input", renderNotes);
    els.clearNotes.addEventListener("click", clearNotes);

    document.querySelectorAll(".mode-pill").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    showToast(next === "light" ? "Light mode on." : "Dark mode on.");
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    els.themeToggle.textContent = theme === "light" ? "Dark" : "Light";
  }

  function setFontStep(nextStep) {
    state.fontStep = Math.max(0, Math.min(fontSteps.length - 1, nextStep));
    applyFontScale(state.fontStep);
    localStorage.setItem(FONT_KEY, String(state.fontStep));
    showToast("Text size updated.");
  }

  function applyFontScale(step) {
    document.documentElement.style.setProperty("--font-scale", fontSteps[step]);
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll(".mode-pill").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === mode);
    });
    els.modeChip.textContent = mode;
    refineDraft();
  }

  function toggleListening() {
    state.listening = !state.listening;
    els.micButton.classList.toggle("listening", state.listening);
    els.micButton.setAttribute("aria-pressed", String(state.listening));
    els.micLabel.textContent = state.listening ? "Stop and refine" : "Start voice draft";
    els.statusLine.textContent = state.listening
      ? "Listening simulation active. In V1, this area connects to live speech capture."
      : "Idle. Nothing is listening.";

    if (!state.listening) refineDraft();
  }

  function loadSample() {
    els.rawInput.value = "Hey, just wanted to follow up about tomorrow. I think we can meet after lunch, maybe around two, actually make that three. Also remind them to bring the notes from last week and tell them I can send the updated list tonight.";
    refineDraft();
    showToast("Sample loaded.");
  }

  function refineDraft() {
    const raw = els.rawInput.value.trim();

    if (!raw) {
      els.polishedOutput.textContent = "Your polished text will appear here.";
      return;
    }

    const cleaned = cleanSpeech(raw);
    const outputByMode = {
      Note: cleaned,
      Message: `Hi, just following up. ${cleaned}`,
      Email: `Hi,\n\n${cleaned}\n\nThank you.`,
      "Task list": makeTasks(cleaned),
    };

    els.polishedOutput.textContent = outputByMode[state.mode] || cleaned;
    showToast("Draft refined.");
  }

  function cleanSpeech(value) {
    let text = value
      .replace(/\b(um|uh|like|you know)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    text = text.replace(/\bactually make that\b/gi, "Correction:");
    text = text.charAt(0).toUpperCase() + text.slice(1);

    if (!/[.!?]$/.test(text)) text += ".";
    return text;
  }

  function makeTasks(text) {
    const pieces = text
      .split(/\band\b|\.|,/i)
      .map((part) => part.trim())
      .filter(Boolean);

    return pieces.map((part) => `- ${part.charAt(0).toUpperCase()}${part.slice(1)}`).join("\n");
  }

  async function copyOutput() {
    const text = getOutputText();
    if (!text) return showToast("Nothing to copy yet.");

    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied. Ready to paste anywhere.");
    } catch (error) {
      showToast("Copy was blocked by the browser.");
    }
  }

  async function shareOutput() {
    const text = getOutputText();
    if (!text) return showToast("Nothing to share yet.");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Aurum Voice draft", text });
        showToast("Shared.");
      } catch (error) {
        showToast("Share canceled.");
      }
      return;
    }

    await copyOutput();
  }

  function saveNote() {
    const raw = els.rawInput.value.trim();
    const polished = getOutputText();
    if (!raw && !polished) return showToast("Nothing to save yet.");

    state.notes.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      mode: state.mode,
      raw,
      polished,
      createdAt: new Date().toISOString(),
    });

    state.notes = state.notes.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
    renderNotes();
    showToast("Note saved.");
  }

  function clearNotes() {
    state.notes = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
    renderNotes();
    showToast("Saved notes cleared.");
  }

  function renderNotes() {
    const query = (els.noteSearch.value || "").toLowerCase();
    const notes = state.notes.filter((note) => {
      return `${note.mode} ${note.raw} ${note.polished}`.toLowerCase().includes(query);
    });

    if (!notes.length) {
      els.noteList.innerHTML = '<p class="privacy-line">No saved notes yet.</p>';
      return;
    }

    els.noteList.innerHTML = notes
      .map((note) => {
        const date = new Date(note.createdAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        return `
          <article class="note-card">
            <strong>${escapeHtml(note.mode)} - ${escapeHtml(date)}</strong>
            <p>${escapeHtml(note.polished || note.raw).slice(0, 220)}</p>
          </article>
        `;
      })
      .join("");
  }

  function loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function getOutputText() {
    const text = els.polishedOutput.textContent.trim();
    return text === "Your polished text will appear here." ? "" : text;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
