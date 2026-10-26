'use strict';

document.body.classList.add('js-enabled');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const serviceToggle = document.querySelector('.services-toggle');
const serviceNavigation = document.querySelector('.nav-services');

function closeServices() {
  serviceNavigation.classList.remove('is-open');
  serviceToggle.setAttribute('aria-expanded', 'false');
}

function closeNavigation() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  closeServices();
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  if (!open) closeServices();
});

serviceToggle.addEventListener('click', () => {
  const open = serviceToggle.getAttribute('aria-expanded') !== 'true';
  serviceNavigation.classList.toggle('is-open', open);
  serviceToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', (event) => {
  if (!serviceNavigation.contains(event.target)) closeServices();
  if (!document.querySelector('.site-header').contains(event.target)) closeNavigation();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (serviceToggle.getAttribute('aria-expanded') === 'true') {
    closeServices();
    serviceToggle.focus();
  } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuToggle.focus();
  }
});

serviceNavigation.addEventListener('focusout', (event) => {
  if (!serviceNavigation.contains(event.relatedTarget)) closeServices();
});

const desktopQuery = matchMedia('(min-width: 761px)');
desktopQuery.addEventListener('change', closeNavigation);

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const errors = document.querySelector('#form-errors');
  const status = document.querySelector('#form-status');
  const fields = ['name', 'email', 'clinic', 'message'];
  const messages = {
    name: 'Please enter your name (at least 2 characters).',
    email: 'Please enter a valid email address, or leave it blank.',
    clinic: 'Please select your preferred clinic.',
    message: 'Please keep your message under 2000 characters.',
  };
  let hasSubmitted = false;
  contactForm.noValidate = true;
  contactForm.querySelector('[type="submit"]').disabled = false;

  function validate(fieldName) {
    const field = contactForm.elements.namedItem(fieldName);
    let valid = field.validity.valid;
    const value = field.value.trim();
    if (fieldName === 'name') valid = value.length >= 2 && value.length <= 100;
    if (fieldName === 'message') valid = value.length <= 2000;
    field.setAttribute('aria-invalid', String(!valid));
    document.querySelector(`#${fieldName}-error`).textContent = valid ? '' : messages[fieldName];
    return valid;
  }

  function renderErrors() {
    const invalid = fields.filter((field) => !validate(field));
    errors.replaceChildren();
    errors.hidden = invalid.length === 0;
    if (invalid.length) {
      const title = document.createElement('p');
      title.textContent = 'Please check the following details:';
      const list = document.createElement('ul');
      invalid.forEach((field) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${field}`;
        link.textContent = messages[field];
        link.addEventListener('click', (event) => {
          event.preventDefault();
          contactForm.elements.namedItem(field).focus();
        });
        item.append(link);
        list.append(item);
      });
      errors.append(title, list);
    }
    return invalid.length === 0;
  }

  fields.forEach((fieldName) => {
    contactForm.elements.namedItem(fieldName).addEventListener('input', () => {
      status.hidden = true;
      if (hasSubmitted) renderErrors();
    });
  });
  contactForm.querySelector('#interest').addEventListener('change', () => { status.hidden = true; });
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hasSubmitted = true;
    status.hidden = true;
    if (!renderErrors()) {
      errors.focus();
      return;
    }
    status.replaceChildren();
    const values = Object.fromEntries(
      ['name', 'email', 'clinic', 'interest', 'message']
        .map((fieldName) => [fieldName, contactForm.elements.namedItem(fieldName).value.trim()])
    );
    const lines = [
      'Hello Skin Hair & You, I would like to enquire about a consultation.',
      '',
      `Name: ${values.name}`,
      values.email ? `Email: ${values.email}` : '',
      values.clinic ? `Preferred clinic: ${values.clinic}` : '',
      values.interest ? `Interested in: ${values.interest}` : '',
      '',
      values.message ? `How can we help? ${values.message}` : '',
    ].filter((line) => line !== '');
    const whatsappUrl = `https://wa.me/919819797935?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    const heading = document.createElement('h3');
    heading.textContent = 'Continue your enquiry in WhatsApp';
    const explanation = document.createElement('p');
    explanation.textContent = 'Your message is ready in WhatsApp. Review it there and tap Send when you’re ready.';
    const fallback = document.createElement('a');
    fallback.href = whatsappUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Open WhatsApp';
    status.append(heading, explanation, fallback);
    status.hidden = false;
    status.focus();
  });
}

const gallery = document.querySelector('.gallery-dialog');
if (gallery) {
  const cards = [...document.querySelectorAll('.result-card')];
  const links = [...document.querySelectorAll('.gallery-open')];
  const image = document.querySelector('#gallery-image');
  const caption = document.querySelector('#gallery-caption');
  const counter = document.querySelector('#gallery-counter');
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  let selectedIndex = 0;
  let opener = null;

  document.querySelector('.filter-bar').hidden = false;
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((other) => {
        const selected = button === other;
        other.classList.toggle('is-active', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      cards.forEach((card) => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
      const count = cards.filter((card) => !card.hidden).length;
      document.querySelector('#filter-status').textContent = `${count} results shown.`;
    });
  });

  function showResult(index) {
    selectedIndex = index;
    const visible = cards.map((card, cardIndex) => card.hidden ? -1 : cardIndex).filter((cardIndex) => cardIndex >= 0);
    image.src = links[index].href;
    image.alt = links[index].querySelector('img').alt;
    caption.textContent = `${cards[index].querySelector('h2').textContent} · Individual results vary`;
    counter.textContent = `${visible.indexOf(index) + 1} / ${visible.length}`;
  }

  function step(direction) {
    const visible = cards.map((card, index) => card.hidden ? -1 : index).filter((index) => index >= 0);
    const position = visible.indexOf(selectedIndex);
    showResult(visible[(position + direction + visible.length) % visible.length]);
  }

  function closeGallery() {
    gallery.close();
    if (opener) opener.focus();
  }

  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (typeof gallery.showModal !== 'function') return;
      event.preventDefault();
      opener = link;
      showResult(index);
      gallery.showModal();
      document.querySelector('.gallery-close').focus();
    });
  });
  document.querySelector('.gallery-close').addEventListener('click', closeGallery);
  document.querySelector('.gallery-previous').addEventListener('click', () => step(-1));
  document.querySelector('.gallery-next').addEventListener('click', () => step(1));
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeGallery();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  gallery.addEventListener('click', (event) => {
    if (event.target !== gallery) return;
    const bounds = gallery.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeGallery();
  });
  gallery.addEventListener('close', () => { if (opener) opener.focus(); });
}
