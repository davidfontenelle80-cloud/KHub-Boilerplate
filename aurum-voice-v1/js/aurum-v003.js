(() => {
  "use strict";

  const APP_ID = "aurum-voice-v1";
  const STORAGE_KEY = "aurum_voice_notes_v1";
  const THEME_KEY = "aurum_voice_theme";
  const FONT_KEY = "aurum_voice_font_step";
  const LANG_KEY = "aurum_voice_lang";
  const BACKUP_KEYS = [STORAGE_KEY, THEME_KEY, FONT_KEY, LANG_KEY];

  const copy = {
    en: {
      htmlLang: "en",
      skip: "Skip to main content",
      subtitle: "Controlled voice writing",
      controlsLabel: "App controls",
      search: "Search",
      searchNotesLabel: "Search notes",
      langButton: "ES",
      langLabel: "Cambiar a español",
      fontDownLabel: "Decrease text size",
      fontUpLabel: "Increase text size",
      themeLabel: "Switch theme",
      light: "Light",
      dark: "Dark",
      heroKicker: "Tap. Speak. Review. Insert.",
      heroTitle: "A floating mic that stays under your control.",
      heroSummary: "A voice notebook and paste-ready writer built to stay out of your way. A native companion can later add a true floating bubble for Windows, Mac, and Android.",
      consoleLabel: "Voice capture console",
      writingModeLabel: "Writing mode",
      modeNote: "Note",
      modeMessage: "Message",
      modeEmail: "Email",
      modeTasks: "Tasks",
      startVoice: "Start voice draft",
      stopVoice: "Stop listening",
      idle: "Idle. Nothing is listening.",
      listening: "Listening simulation active. This area will connect to live speech capture.",
      draftWorkspaceLabel: "Draft workspace",
      utilityLabel: "Saved notes and shortcuts",
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
      libraryKicker: "Library",
      savedNotes: "Saved notes",
      clear: "Clear",
      searchPlaceholder: "Search saved drafts",
      practicalKicker: "Practical",
      featureTitle: "Feature set",
      feature1: "Controlled mic state with visible idle, listening, and ready states.",
      feature2: "Copy, share, and save before anything goes outside the app.",
      feature3: "Local saved notes with search for quick reuse.",
      feature4: "Light and dark modes, readable sizing, and centered tablet layout.",
      feature5: "Designed for a later companion bubble on Windows, Mac, and Android.",
      floatingLabel: "Open voice capture",
      backupKicker: "Backup",
      backupTitle: "Cloud backup",
      backupReady: "Cloud backup is ready.",
      backupNotReady: "Cloud backup is not configured yet. Firebase setup is needed before online backup can run.",
      signIn: "Sign in",
      saveBackup: "Save backup",
      restoreBackup: "Restore",
      exportBackup: "Export local backup",
      localExported: "Local backup exported.",
      cloudSaved: "Cloud backup saved.",
      cloudRestored: "Cloud backup restored.",
      cloudUnavailable: "Cloud backup is not configured yet.",
    },
    es: {
      htmlLang: "es",
      skip: "Saltar al contenido principal",
      subtitle: "Escritura por voz controlada",
      controlsLabel: "Controles de la aplicación",
      search: "Buscar",
      searchNotesLabel: "Buscar notas",
      langButton: "EN",
      langLabel: "Switch to English",
      fontDownLabel: "Reducir tamaño del texto",
      fontUpLabel: "Aumentar tamaño del texto",
      themeLabel: "Cambiar tema",
      light: "Claro",
      dark: "Oscuro",
      heroKicker: "Toca. Habla. Revisa. Inserta.",
      heroTitle: "Un micrófono flotante que sigue bajo tu control.",
      heroSummary: "Una libreta de voz y redactor listo para pegar, diseñado para no estorbar. Un complemento nativo podrá añadir después una burbuja flotante real para Windows, Mac y Android.",
      consoleLabel: "Consola de captura de voz",
      writingModeLabel: "Modo de escritura",
      modeNote: "Nota",
      modeMessage: "Mensaje",
      modeEmail: "Correo",
      modeTasks: "Tareas",
      startVoice: "Iniciar borrador por voz",
      stopVoice: "Dejar de escuchar",
      idle: "Inactivo. Nada está escuchando.",
      listening: "Simulación de escucha activa. Esta zona se conectará a la captura de voz en vivo.",
      draftWorkspaceLabel: "Espacio de borrador",
      utilityLabel: "Notas guardadas y atajos",
      draftKicker: "Borrador",
      rawTitle: "Lo que dijiste",
      loadSample: "Cargar ejemplo",
      rawPlaceholder: "Habla o escribe una idea en borrador aquí. La app mantendrá la nota original separada de la versión pulida.",
      outputKicker: "Salida",
      outputTitle: "Texto listo para pegar",
      emptyOutput: "Tu texto pulido aparecerá aquí.",
      refine: "Pulir",
      copy: "Copiar",
      share: "Compartir",
      saveNote: "Guardar nota",
      libraryKicker: "Biblioteca",
      savedNotes: "Notas guardadas",
      clear: "Borrar",
      searchPlaceholder: "Buscar borradores guardados",
      practicalKicker: "Práctico",
      featureTitle: "Funciones",
      feature1: "Estado del micrófono controlado con señales visibles de inactivo, escuchando y listo.",
      feature2: "Copiar, compartir y guardar antes de que algo salga de la app.",
      feature3: "Notas locales guardadas con búsqueda para reutilizarlas rápido.",
      feature4: "Modos claro y oscuro, tamaño de lectura ajustable y diseño centrado para tablet.",
      feature5: "Diseñado para una futura burbuja complementaria en Windows, Mac y Android.",
      floatingLabel: "Abrir captura de voz",
      backupKicker: "Respaldo",
      backupTitle: "Copia en la nube",
      backupReady: "La copia en la nube está lista.",
      backupNotReady: "La copia en la nube todavía no está configurada. Hace falta configurar Firebase antes de usar respaldo en línea.",
      signIn: "Iniciar sesión",
      saveBackup: "Guardar copia",
      restoreBackup: "Restaurar",
      exportBackup: "Exportar copia local",
      localExported: "Copia local exportada.",
      cloudSaved: "Copia en la nube guardada.",
      cloudRestored: "Copia en la nube restaurada.",
      cloudUnavailable: "La copia en la nube todavía no está configurada.",
    },
  };

  const modeKey = {
    note: "modeNote",
    message: "modeMessage",
    email: "modeEmail",
    tasks: "modeTasks",
  };

  let langBeforeClick = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    applyLanguage(currentLang());
    setupLanguageRepair();
    setupMicStatusRepair();
    setupCloudBackup();
    injectLayoutFix();
  }

  function setupLanguageRepair() {
    const button = document.getElementById("lang-toggle");
    if (!button) return;

    button.addEventListener(
      "click",
      () => {
        langBeforeClick = currentLang();
      },
      true
    );

    button.addEventListener("click", () => {
      window.setTimeout(() => {
        let next = currentLang();
        if (next === langBeforeClick) {
          next = next === "en" ? "es" : "en";
          localStorage.setItem(LANG_KEY, next);
        }
        applyLanguage(next);
        showStatus(next === "es" ? "Idioma cambiado a español." : "Language switched to English.");
      }, 0);
    });
  }

  function setupCloudBackup() {
    const status = document.getElementById("cloud-status");
    const signIn = document.getElementById("cloud-signin");
    const save = document.getElementById("cloud-save");
    const restore = document.getElementById("cloud-restore");
    const localExport = document.getElementById("local-export");

    updateCloudStatus();

    signIn?.addEventListener("click", () => {
      const cloudAuth = window.KHub?.CloudAuth;
      if (cloudAuth?.openDialog) {
        cloudAuth.openDialog();
        updateCloudStatus();
        return;
      }
      showStatus(t("cloudUnavailable"));
      updateCloudStatus();
    });

    save?.addEventListener("click", async () => {
      const cloud = cloudLayer();
      if (!cloud) {
        showStatus(t("cloudUnavailable"));
        updateCloudStatus();
        return;
      }
      try {
        await cloud.save(APP_ID, BACKUP_KEYS);
        status.textContent = t("backupReady");
        showStatus(t("cloudSaved"));
      } catch (error) {
        status.textContent = friendlyCloudError(error);
      }
    });

    restore?.addEventListener("click", async () => {
      const cloud = cloudLayer();
      if (!cloud) {
        showStatus(t("cloudUnavailable"));
        updateCloudStatus();
        return;
      }
      try {
        await cloud.restore(APP_ID, BACKUP_KEYS);
        status.textContent = t("backupReady");
        showStatus(t("cloudRestored"));
        window.setTimeout(() => window.location.reload(), 600);
      } catch (error) {
        status.textContent = friendlyCloudError(error);
      }
    });

    localExport?.addEventListener("click", exportLocalBackup);
  }

  function setupMicStatusRepair() {
    const mic = document.getElementById("mic-button");
    if (!mic) return;
    mic.addEventListener("click", () => {
      window.setTimeout(() => {
        const pressed = mic.getAttribute("aria-pressed") === "true";
        setText("#mic-label", pressed ? t("stopVoice") : t("startVoice"));
        setText("#status-line", pressed ? t("listening") : t("idle"));
      }, 0);
    });
  }

  function injectLayoutFix() {
    if (document.getElementById("aurum-layout-fix-v004")) return;
    const style = document.createElement("style");
    style.id = "aurum-layout-fix-v004";
    style.textContent = `
      .voice-stage {
        grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.85fr);
      }

      .stage-copy h2 {
        max-width: 680px;
        font-size: clamp(2.4rem, 5.2vw, 4.6rem);
        line-height: 1.04;
      }

      .stage-summary {
        max-width: 620px;
        margin-top: 20px;
        font-size: 1rem;
      }

      @media (max-width: 900px) {
        .voice-stage {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyLanguage(lang) {
    const text = copy[lang] || copy.en;
    document.documentElement.lang = text.htmlLang;
    document.title = "Aurum Voice";

    setText(".skip-link", text.skip);
    setText(".brand-lockup p", text.subtitle);
    setAttr(".header-actions", "aria-label", text.controlsLabel);
    setText("#search-toggle", text.search);
    setAttr("#search-toggle", "aria-label", text.searchNotesLabel);
    setText("#lang-toggle", text.langButton);
    setAttr("#lang-toggle", "aria-label", text.langLabel);
    setAttr("#font-down", "aria-label", text.fontDownLabel);
    setAttr("#font-up", "aria-label", text.fontUpLabel);
    setAttr("#theme-toggle", "aria-label", text.themeLabel);
    setText(".stage-copy .eyebrow", text.heroKicker);
    setText("#voice-title", text.heroTitle);
    setText(".stage-summary", text.heroSummary);
    setAttr(".voice-console", "aria-label", text.consoleLabel);
    setAttr(".mode-row", "aria-label", text.writingModeLabel);
    document.querySelectorAll(".mode-pill").forEach((button) => {
      button.textContent = text[modeKey[button.dataset.mode] || "modeNote"];
    });
    const micPressed = document.getElementById("mic-button")?.getAttribute("aria-pressed") === "true";
    setText("#mic-label", micPressed ? text.stopVoice : text.startVoice);
    setText("#status-line", micPressed ? text.listening : text.idle);
    setAttr(".draft-grid", "aria-label", text.draftWorkspaceLabel);
    setAttr(".utility-grid", "aria-label", text.utilityLabel);
    setPanelText(0, text.draftKicker, text.rawTitle);
    setText("#sample-btn", text.loadSample);
    setAttr("#raw-input", "placeholder", text.rawPlaceholder);
    setPanelText(1, text.outputKicker, text.outputTitle);
    setPanelText(2, text.libraryKicker, text.savedNotes);
    setPanelText(3, text.practicalKicker, text.featureTitle);
    setText("#mode-chip", text.modeNote);
    setOutputPlaceholder(text);
    setText("#refine-btn", text.refine);
    setText("#copy-btn", text.copy);
    setText("#share-btn", text.share);
    setText("#save-btn", text.saveNote);
    setText("#clear-notes", text.clear);
    setText(".search-wrap label", text.searchNotesLabel);
    setAttr("#note-search", "placeholder", text.searchPlaceholder);
    setAttr("#floating-mic", "aria-label", text.floatingLabel);
    [text.feature1, text.feature2, text.feature3, text.feature4, text.feature5].forEach((item, index) => {
      const row = document.querySelectorAll(".feature-list li")[index];
      if (row) row.textContent = item;
    });
    setText("#cloud-kicker", text.backupKicker);
    setText("#cloud-title", text.backupTitle);
    setText("#cloud-signin", text.signIn);
    setText("#cloud-save", text.saveBackup);
    setText("#cloud-restore", text.restoreBackup);
    setText("#local-export", text.exportBackup);
    updateCloudStatus();
  }

  function currentLang() {
    return localStorage.getItem(LANG_KEY) === "es" ? "es" : "en";
  }

  function t(key) {
    return (copy[currentLang()] || copy.en)[key] || copy.en[key] || key;
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function setAttr(selector, attr, value) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute(attr, value);
  }

  function setPanelText(index, kicker, title) {
    const panel = document.querySelectorAll(".workspace-panel")[index];
    if (!panel) return;
    const eyebrow = panel.querySelector(".eyebrow");
    const heading = panel.querySelector("h3");
    if (eyebrow) eyebrow.textContent = kicker;
    if (heading) heading.textContent = title;
  }

  function setOutputPlaceholder(text) {
    const output = document.getElementById("polished-output");
    if (!output) return;
    const value = output.textContent.trim();
    if (!value || value === copy.en.emptyOutput || value === copy.es.emptyOutput) {
      output.textContent = text.emptyOutput;
    }
  }

  function cloudLayer() {
    const cloud = window.KHub?.CloudBackup;
    const firebase = window.KHub?.Firebase;
    if (!cloud?.save || !cloud?.restore || !firebase?.auth || !firebase?.db) return null;
    if (cloud.isSignedIn && !cloud.isSignedIn()) return null;
    return cloud;
  }

  function updateCloudStatus() {
    const status = document.getElementById("cloud-status");
    if (!status) return;
    status.textContent = cloudLayer() ? t("backupReady") : t("backupNotReady");
  }

  function friendlyCloudError(error) {
    const message = error?.message ? String(error.message) : t("cloudUnavailable");
    return message.length > 140 ? `${message.slice(0, 137)}...` : message;
  }

  function exportLocalBackup() {
    const data = {
      appId: APP_ID,
      exportedAt: new Date().toISOString(),
      values: BACKUP_KEYS.reduce((result, key) => {
        result[key] = localStorage.getItem(key);
        return result;
      }, {}),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aurum-voice-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStatus(t("localExported"));
  }

  function showStatus(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }
})();
