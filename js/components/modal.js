/**
 * Accessible modal. Caller-controlled title/labels/body text use textContent.
 * Pass a DOM Node as body for rich safe construction. `trustedHtml` is an
 * explicit escape hatch for developer-owned markup; it is NOT sanitized.
 */
(function () {
  'use strict';

  let backdrop = null;
  let previousFocus = null;
  const FOCUSABLE =
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function trapFocus(modal) {
    const focusable = [...modal.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();
    modal.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function open({
    title = '',
    body = '',
    trustedHtml = null,
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
  } = {}) {
    close();
    previousFocus = document.activeElement;

    backdrop = element('div', 'modal-backdrop');
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    const modal = element('div', 'modal');
    const header = element('div', 'modal-header');
    const heading = element('h2', 'modal-title', String(title));
    heading.id = `modal-title-${Date.now()}`;
    backdrop.setAttribute('aria-labelledby', heading.id);
    const closeButton = element('button', 'btn btn-icon', '✕');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close dialog');
    header.append(heading, closeButton);

    const bodyElement = element('div', 'modal-body');
    if (body && typeof body === 'object' && typeof body.nodeType === 'number') {
      bodyElement.appendChild(body);
    } else if (trustedHtml !== null) {
      bodyElement.innerHTML = String(trustedHtml); // Trusted developer markup only; not sanitized.
    } else {
      bodyElement.textContent = String(body || '');
    }

    const footer = element('div', 'modal-footer');
    const cancelButton = cancelLabel
      ? element('button', 'btn btn-secondary', String(cancelLabel))
      : null;
    const confirmButton = confirmLabel
      ? element('button', 'btn btn-primary', String(confirmLabel))
      : null;
    if (cancelButton) {
      cancelButton.type = 'button';
      footer.appendChild(cancelButton);
    }
    if (confirmButton) {
      confirmButton.type = 'button';
      footer.appendChild(confirmButton);
    }

    modal.append(header, bodyElement, footer);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    trapFocus(modal);

    const cancel = () => {
      close();
      onCancel?.();
    };
    closeButton.addEventListener('click', cancel);
    cancelButton?.addEventListener('click', cancel);
    confirmButton?.addEventListener('click', () => {
      close();
      onConfirm?.();
    });
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) cancel();
    });
    document.addEventListener('keydown', onEscape);
  }

  function onEscape(event) {
    if (event.key === 'Escape') close();
  }

  function close() {
    if (backdrop) {
      backdrop.remove();
      backdrop = null;
      document.removeEventListener('keydown', onEscape);
    }
    previousFocus?.focus();
    previousFocus = null;
  }

  window.KHub = window.KHub || {};
  window.KHub.Components = window.KHub.Components || {};
  window.KHub.Components.Modal = { open, close };
})();
