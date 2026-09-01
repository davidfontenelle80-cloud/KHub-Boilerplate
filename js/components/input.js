/**
 * components/input.js — KHub Boilerplate
 * Accessible labeled input factory with validation support.
 * Usage: KHub.Components.Input.create({ id, label, type, placeholder, required, hint, validate })
 */
(function () {
  'use strict';

  function create({
    id,
    label = '',
    type = 'text',
    placeholder = '',
    required = false,
    hint = '',
    validate = null,
  } = {}) {
    const group = document.createElement('div');
    group.className = 'input-group';

    // Label
    const labelEl = document.createElement('label');
    labelEl.className = 'input-label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    if (required) {
      const marker = document.createElement('span');
      marker.className = 'required';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = '*';
      labelEl.appendChild(marker);
    }
    group.appendChild(labelEl);

    // Input
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.placeholder = placeholder;
    input.required = required;
    input.className = 'input-field';
    input.setAttribute(
      'autocomplete',
      type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off'
    );
    group.appendChild(input);

    // Hint
    if (hint) {
      const hintEl = document.createElement('span');
      hintEl.className = 'input-hint';
      hintEl.id = `${id}-hint`;
      hintEl.textContent = hint;
      group.appendChild(hintEl);
    }

    // Error
    const errorEl = document.createElement('span');
    errorEl.className = 'input-error';
    errorEl.id = `${id}-error`;
    errorEl.setAttribute('role', 'alert');
    group.appendChild(errorEl);
    input.setAttribute(
      'aria-describedby',
      [hint ? `${id}-hint` : '', `${id}-error`].filter(Boolean).join(' ')
    );

    // Validation
    if (typeof validate === 'function') {
      input.addEventListener('blur', () => {
        const err = validate(input.value);
        if (err) {
          input.classList.add('invalid');
          input.setAttribute('aria-invalid', 'true');
          errorEl.textContent = err;
          errorEl.style.display = 'block';
        } else {
          input.classList.remove('invalid');
          input.removeAttribute('aria-invalid');
          errorEl.style.display = 'none';
        }
      });
    }

    group._input = input; // expose input for easy access
    return group;
  }

  window.KHub = window.KHub || {};
  window.KHub.Components = window.KHub.Components || {};
  window.KHub.Components.Input = { create };
})();
