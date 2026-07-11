(function () {
  "use strict";

  const STORAGE_KEY = "aurum_voice_notes_v1";
  const THEME_KEY = "aurum_voice_theme";
  const FONT_KEY = "aurum_voice_font_step";
  const LANG_KEY = "aurum_voice_lang";
  const fontSteps = [0.9, 1, 1.12, 1.24];

  const translations = {
    en: {
      htmlLang: "en",
      description: "Aurum Voice is a controlled voice-writing app for notes, drafts, and paste-ready text.",
      skip: "Skip to main content",
      subtitle: "Controlled voice writing",
      controlsLabel: "App controls",
      search: "Search",
      langButton: "ES",
      langLabel: "Cambiar a español",
      fontDownLabel: "Decrease text size",
      fontUpLabel: "Increase text size",
      themeLabel: "Switch theme",
      light: "Light",
      dark: "Dark",
      heroKicker: "Tap. Speak. Review. Insert.",
      heroTitle: "A floating mic that stays under your control.",
      heroSummary: "Version one is a voice notebook and paste-ready writer. The native companion can later add the true floating bubble for Windows, Mac, and Android.",
      consoleLabel: "Voice capture console",
      writingModeLabel: "Writing mode",
      modeNote: "Note",
      modeMessage: "Message",
      modeEmail: "Email",
      modeTasks: "Tasks",
      startVoice: "Start voice draft",
      stopVoice: "Stop and refine",
      idle: "Idle. Nothing is listening.",
      listening: "Listening simulation active. In V1, this area connects to live speech capture.",
      draftWorkspaceLabel: "Draft workspace",
      draftKicker: "Draft",
      rawTitle: "What you said",
      loadSample: "Load sample",
      rawPlaceholder: "Speak or type a rough thought here. The app will keep the raw note separate from the polished version.",
      outputKicker: "Output",
      outputTitle: "Paste-ready text",
      emptyOutput: "Your polished text will appear here.",
      refine: "Refine",
      copy: "Copy",
      share: "Share",
      saveNote: "Save note",
      utilityLabel: "Saved notes and shortcuts",
      libraryKicker: "Library",
      savedNotes: "Saved notes",
      clear: "Clear",
      searchNotesLabel: "Search notes",
      searchPlaceholder: "Search saved drafts",
      practicalKicker: "Practical",
      featureTitle: "V1 feature set",
      feature1: "Controlled mic state with visible idle, listening, and ready states.",
      feature2: "Copy, share, and save before anything goes outside the app.",
      feature3: "Local saved notes with search for quick reuse.",
      feature4: "Light and dark modes, readable sizing, and centered tablet layout.",
      feature5: "Designed for a later companion bubble on Windows, Mac, and Android.",
      floatingLabel: "Open voice capture",
      noNotes: "No saved notes yet.",
      nothingCopy: "Nothing to copy yet.",
      copied: "Copied. Ready to paste anywhere.",
      copyBlocked: "Copy was blocked by the browser.",
      nothingShare: "Nothing to share yet.",
      shareTitle: "Aurum Voice draft",
      shared: "Shared.",
      shareCanceled: "Share canceled.",
      nothingSave: "Nothing to save yet.",
      noteSaved: "Note saved.",
      notesCleared: "Saved notes cleared.",
      draftRefined: "Draft refined.",
      sampleLoaded: "Sample loaded.",
      textSize: "Text size updated.",
      lightOn: "Light mode on.",
      darkOn: "Dark mode on.",
      languageChanged: "Language changed to English.",
      messagePrefix: "Hi, just following up. ",
      emailGreeting: "Hi,",
      emailClosing: "Thank you.",
      correction: "Correction:",
      sampleText: "Hey, just wanted to follow up about tomorrow. I think we can meet after lunch, maybe around two, actually make that three. Also remind them to bring the notes from last week and tell them I can send the updated list tonight.",
    },
    es: {
      htmlLang: "es",
      description: "Aurum Voice es una app de escritura por voz controlada para notas, borradores y texto listo para pegar.",
      skip: "Saltar al contenido principal",
      subtitle: "Escritura por voz controlada",
      controlsLabel: "Controles de la app",
      search: "Buscar",
      langButton: "EN",
      langLabel: "Switch to English",
      fontDownLabel: "Reducir tamaño de texto",
      fontUpLabel: "Aumentar tamaño de texto",
      themeLabel: "Cambiar tema",
      light: "Claro",
      dark: "Oscuro",
      heroKicker: "Toca. Habla. Revisa. Inserta.",
      heroTitle: "Un micrófono flotante que permanece bajo tu control.",
      heroSummary: "La versión uno es una libreta de voz y un escritor de texto listo para pegar. Más adelante, el compañero nativo puede añadir la burbuja flotante real para Windows, Mac y Android.",
      consoleLabel: "Consola de captura por voz",
      writingModeLabel: "Modo de escritura",
      modeNote: "Nota",
      modeMessage: "Mensaje",
      modeEmail: "Correo",
      modeTasks: "Tareas",
      startVoice: "Iniciar borrador por voz",
      stopVoice: "Detener y pulir",
      idle: "Inactivo. Nada está escuchando.",
      listening: "Simulación de escucha activa. En V1, esta área se conecta a la captura de voz real.",
      draftWorkspaceLabel: "Área de borrador",
      draftKicker: "Borrador",
      rawTitle: "Lo que dijiste",
      loadSample: "Cargar ejemplo",
      rawPlaceholder: "Habla o escribe una idea en bruto aquí. La app mantendrá la nota original separada de la versión pulida.",
      outputKicker: "Resultado",
      outputTitle: "Texto listo para pegar",
      emptyOutput: "Tu texto pulido aparecerá aquí.",
      refine: "Pulir",
      copy: "Copiar",
      share: "Compartir",
      saveNote: "Guardar nota",
      utilityLabel: "Notas guardadas y atajos",
      libraryKicker: "Biblioteca",
      savedNotes: "Notas guardadas",
      clear: "Borrar",
      searchNotesLabel: "Buscar notas",
      searchPlaceholder: "Buscar borradores guardados",
      practicalKicker: "Práctico",
      featureTitle: "Funciones de V1",
      feature1: "Estado del micrófono controlado con estados visibles: inactivo, escuchando y listo.",
      feature2: "Copia, comparte y guarda antes de que algo salga de la app.",
      feature3: "Notas locales guardadas con búsqueda para reutilizarlas rápido.",
      feature4: "Modos claro y oscuro, tamaño legible y diseño centrado para tablet.",
      feature5: "Diseñada para una futura burbuja compañera en Windows, Mac y Android.",
      floatingLabel: "Abrir captura por voz",
      noNotes: "Todavía no hay notas guardadas.",
      nothingCopy: "Todavía no hay nada para copiar.",
      copied: "Copiado. Listo para pegar en cualquier lugar.",
      copyBlocked: "El navegador bloqueó la copia.",
      nothingShare: "Todavía no hay nada para compartir.",
      shareTitle: "Borrador de Aurum Voice",
      shared: "Compartido.",
      shareCanceled: "Compartir fue cancelado.",
      nothingSave: "Todavía no hay nada para guardar.",
      noteSaved: "Nota guardada.",
      notesCleared: "Notas guardadas borradas.",
      draftRefined: "Borrador pulido.",
      sampleLoaded: "Ejemplo cargado.",
      textSize: "Tamaño de texto actualizado.",
      lightOn: "Modo claro activado.",
      darkOn: "Modo oscuro activado.",
      languageChanged: "Idioma cambiado a español.",
      messagePrefix: "Hola, solo quería dar seguimiento. ",
      emailGreeting: "Hola,",
      emailClosing: "Gracias.",
      correction: "Corrección:",
      sampleText: "Hola, solo quería dar seguimiento sobre mañana. Creo que podemos reunirnos después del almuerzo, quizá como a las dos, mejor dicho a las tres. También recuérdales que traigan las notas de la semana pasada y diles que puedo enviar la lista actualizada esta noche.",
    },
  };

  const state = {
    mode: "note",
    listening: false,
    notes: loadNotes(),
    fontStep: Number(localStorage.getItem(FONT_KEY) || 1),
    lang: localStorage.getItem(LANG_KEY) || "en",
  };

  const els = {
    metaDescription: document.querySelector('meta[name="description"]'),
    skipLink: document.querySelector(".skip-link"),
    subtitle: document.querySelector(".brand-lockup p"),
    headerActions: document.querySelector(".header-actions"),
    searchToggle: document.getElementById("search-toggle"),
    langToggle: document.getElementById("lang-toggle"),
    fontDown: document.getElementById("font-down"),
    fontUp: document.getElementById("font-up"),
    themeToggle: document.getElementById("theme-toggle"),
    heroKicker: document.querySelector(".stage-copy .eyebrow"),
    voiceTitle: document.getElementById("voice-title"),
    heroSummary: document.querySelector(".stage-summary"),
    voiceConsole: document.querySelector(".voice-console"),
    modeRow: document.querySelector(".mode-row"),
    modeButtons: Array.from(document.querySelectorAll(".mode-pill")),
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
    searchLabel: document.querySelector("label[for='note-search']"),
    clearNotes: document.getElementById("clear-notes"),
    toast: document.getElementById("toast"),
    sections: Array.from(document.querySelectorAll("section[aria-label]")),
  };

  init();

  function init() {
    applyTheme(localStorage.getItem(THEME_KEY) || "dark");
    applyFontScale(state.fontStep);
    applyLanguage(state.lang);
    renderNotes();
    bindEvents();
    registerServiceWorker();
  }

  function bindEvents() {
    els.themeToggle.addEventListener("click", toggleTheme);
    els.langToggle.addEventListener("click", toggleLanguage);
    els.fontDown.addEventListener("click", () => setFontStep(state.fontStep - 1));
    els.fontUp.addEventListener("click", () => setFontStep(state.fontStep + 1));
    els.searchToggle.addEventListener("click", () => els.noteSearch.focus());
    els.micButton.addEventListener("click", toggleListening);
    els.floatingMic.addEventListener("click", () => {
      els.voiceTitle.scrollIntoView({ behavior: "smooth", block: "center" });
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

    els.modeButtons.forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });
  }

  function t(key) {
    return translations[state.lang][key] || translations.en[key] || key;
  }

  function toggleLanguage() {
    state.lang = state.lang === "en" ? "es" : "en";
    localStorage.setItem(LANG_KEY, state.lang);
    applyLanguage(state.lang);
    renderNotes();
    if (getOutputText()) refineDraft(false);
    showToast(t("languageChanged"));
  }

  function applyLanguage(lang) {
    document.documentElement.lang = translations[lang].htmlLang;
    if (els.metaDescription) els.metaDescription.content = t("description");
    document.title = "Aurum Voice";

    els.skipLink.textContent = t("skip");
    els.subtitle.textContent = t("subtitle");
    els.headerActions.setAttribute("aria-label", t("controlsLabel"));
    els.searchToggle.textContent = t("search");
    els.searchToggle.setAttribute("aria-label", t("searchNotesLabel"));
    els.langToggle.textContent = t("langButton");
    els.langToggle.setAttribute("aria-label", t("langLabel"));
    els.fontDown.setAttribute("aria-label", t("fontDownLabel"));
    els.fontUp.setAttribute("aria-label", t("fontUpLabel"));
    els.themeToggle.setAttribute("aria-label", t("themeLabel"));
    els.heroKicker.textContent = t("heroKicker");
    els.voiceTitle.textContent = t("heroTitle");
    els.heroSummary.textContent = t("heroSummary");
    els.voiceConsole.setAttribute("aria-label", t("consoleLabel"));
    els.modeRow.setAttribute("aria-label", t("writingModeLabel"));
    els.modeButtons.forEach((button) => {
      button.textContent = modeLabel(button.dataset.mode);
    });
    els.micLabel.textContent = state.listening ? t("stopVoice") : t("startVoice");
    els.statusLine.textContent = state.listening ? t("listening") : t("idle");
    els.sections[0].setAttribute("aria-label", t("draftWorkspaceLabel"));
    els.sections[1].setAttribute("aria-label", t("utilityLabel"));

    setPanelText(0, t("draftKicker"), t("rawTitle"));
    els.sampleBtn.textContent = t("loadSample");
    els.rawInput.placeholder = t("rawPlaceholder");
    setPanelText(1, t("outputKicker"), t("outputTitle"));
    setPanelText(2, t("libraryKicker"), t("savedNotes"));
    setPanelText(3, t("practicalKicker"), t("featureTitle"));
    els.modeChip.textContent = modeLabel(state.mode);
    if (!getOutputText()) els.polishedOutput.textContent = t("emptyOutput");
    els.refineBtn.textContent = t("refine");
    els.copyBtn.textContent = t("copy");
    els.shareBtn.textContent = t("share");
    els.saveBtn.textContent = t("saveNote");
    els.clearNotes.textContent = t("clear");
    els.searchLabel.textContent = t("searchNotesLabel");
    els.noteSearch.placeholder = t("searchPlaceholder");
    els.floatingMic.setAttribute("aria-label", t("floatingLabel"));

    const features = document.querySelectorAll(".feature-list li");
    [t("feature1"), t("feature2"), t("feature3"), t("feature4"), t("feature5")].forEach((text, index) => {
      if (features[index]) features[index].textContent = text;
    });

    applyTheme(document.documentElement.dataset.theme || "dark");
  }

  function setPanelText(index, kicker, title) {
    const panel = document.querySelectorAll(".workspace-panel")[index];
    if (!panel) return;
    const eyebrow = panel.querySelector(".eyebrow");
    const heading = panel.querySelector("h3");
    if (eyebrow) eyebrow.textContent = kicker;
    if (heading) heading.textContent = title;
  }

  function modeLabel(mode) {
    const map = {
      note: "modeNote",
      message: "modeMessage",
      email: "modeEmail",
      tasks: "modeTasks",
    };
    return t(map[mode] || "modeNote");
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    showToast(next === "light" ? t("lightOn") : t("darkOn"));
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    els.themeToggle.textContent = theme === "light" ? t("dark") : t("light");
  }

  function setFontStep(nextStep) {
    state.fontStep = Math.max(0, Math.min(fontSteps.length - 1, nextStep));
    applyFontScale(state.fontStep);
    localStorage.setItem(FONT_KEY, String(state.fontStep));
    showToast(t("textSize"));
  }

  function applyFontScale(step) {
    document.documentElement.style.setProperty("--font-scale", fontSteps[step]);
  }

  function setMode(mode) {
    state.mode = mode;
    els.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === mode);
    });
    els.modeChip.textContent = modeLabel(mode);
    refineDraft(false);
  }

  function toggleListening() {
    state.listening = !state.listening;
    els.micButton.classList.toggle("listening", state.listening);
    els.micButton.setAttribute("aria-pressed", String(state.listening));
    els.micLabel.textContent = state.listening ? t("stopVoice") : t("startVoice");
    els.statusLine.textContent = state.listening ? t("listening") : t("idle");
    if (!state.listening) refineDraft();
  }

  function loadSample() {
    els.rawInput.value = t("sampleText");
    refineDraft();
    showToast(t("sampleLoaded"));
  }

  function refineDraft(showMessage = true) {
    const raw = els.rawInput.value.trim();

    if (!raw) {
      els.polishedOutput.textContent = t("emptyOutput");
      return;
    }

    const cleaned = cleanSpeech(raw);
    const outputByMode = {
      note: cleaned,
      message: `${t("messagePrefix")}${cleaned}`,
      email: `${t("emailGreeting")}\n\n${cleaned}\n\n${t("emailClosing")}`,
      tasks: makeTasks(cleaned),
    };

    els.polishedOutput.textContent = outputByMode[state.mode] || cleaned;
    if (showMessage) showToast(t("draftRefined"));
  }

  function cleanSpeech(value) {
    let text = value
      .replace(/\b(um|uh|like|you know|este|eh|pues)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    text = text
      .replace(/\bactually make that\b/gi, t("correction"))
      .replace(/\bmejor dicho\b/gi, t("correction"));
    text = text.charAt(0).toUpperCase() + text.slice(1);

    if (!/[.!?]$/.test(text)) text += ".";
    return text;
  }

  function makeTasks(text) {
    const pieces = text
      .split(/\band\b|\by\b|\.|,/i)
      .map((part) => part.trim())
      .filter(Boolean);

    return pieces.map((part) => `- ${part.charAt(0).toUpperCase()}${part.slice(1)}`).join("\n");
  }

  async function copyOutput() {
    const text = getOutputText();
    if (!text) return showToast(t("nothingCopy"));

    try {
      await navigator.clipboard.writeText(text);
      showToast(t("copied"));
    } catch (error) {
      showToast(t("copyBlocked"));
    }
  }

  async function shareOutput() {
    const text = getOutputText();
    if (!text) return showToast(t("nothingShare"));

    if (navigator.share) {
      try {
        await navigator.share({ title: t("shareTitle"), text });
        showToast(t("shared"));
      } catch (error) {
        showToast(t("shareCanceled"));
      }
      return;
    }

    await copyOutput();
  }

  function saveNote() {
    const raw = els.rawInput.value.trim();
    const polished = getOutputText();
    if (!raw && !polished) return showToast(t("nothingSave"));

    state.notes.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      mode: state.mode,
      raw,
      polished,
      lang: state.lang,
      createdAt: new Date().toISOString(),
    });

    state.notes = state.notes.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
    renderNotes();
    showToast(t("noteSaved"));
  }

  function clearNotes() {
    state.notes = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notes));
    renderNotes();
    showToast(t("notesCleared"));
  }

  function renderNotes() {
    const query = (els.noteSearch.value || "").toLowerCase();
    const notes = state.notes.filter((note) => {
      const modeText = modeLabel(note.mode || "note");
      return `${modeText} ${note.raw} ${note.polished}`.toLowerCase().includes(query);
    });

    if (!notes.length) {
      els.noteList.innerHTML = `<p class="privacy-line">${t("noNotes")}</p>`;
      return;
    }

    els.noteList.innerHTML = notes
      .map((note) => {
        const date = new Date(note.createdAt).toLocaleString(state.lang === "es" ? "es" : "en", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        return `
          <article class="note-card">
            <strong>${escapeHtml(modeLabel(note.mode || "note"))} - ${escapeHtml(date)}</strong>
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
    return text === translations.en.emptyOutput || text === translations.es.emptyOutput ? "" : text;
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
