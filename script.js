// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

// Navbar background on scroll
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 50
      ? '0 2px 12px rgba(0,0,0,0.12)'
      : '0 2px 8px rgba(0,0,0,0.08)';
  });
}

// Gallery year tabs
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.gallery-year').forEach(y => y.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('gallery-' + tab.dataset.year);
    if (target) {
      target.classList.add('active');
      layoutGalleryGrid(target.querySelector('.gallery-grid'));
    }
  });
});

function layoutGalleryGrid(grid) {
  if (!grid) return;

  const items = grid._galleryItems || Array.from(grid.querySelectorAll(':scope > .gallery-item'));
  if (!items.length) return;

  grid._galleryItems = items;
  if (grid.clientHeight <= 0) return;
  const rowHeight = grid.clientHeight / 2;
  const photoBorder = 6;
  const rows = [
    { items: [], aspectRatio: 0 },
    { items: [], aspectRatio: 0 }
  ];

  items.forEach(item => {
    const image = item.querySelector('img');
    const aspectRatio = image?.naturalWidth && image?.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : 4 / 3;
    const targetRow = rows[0].aspectRatio <= rows[1].aspectRatio ? rows[0] : rows[1];
    targetRow.items.push({ item, aspectRatio });
    targetRow.aspectRatio += aspectRatio;
  });

  grid.replaceChildren();
  rows.forEach(row => {
    const rowElement = document.createElement('div');
    rowElement.className = 'gallery-row';
    row.items.forEach(({ item, aspectRatio }) => {
      item.style.width = `${aspectRatio * (rowHeight - photoBorder) + photoBorder}px`;
      rowElement.appendChild(item);
    });
    grid.appendChild(rowElement);
  });
}

function layoutAllGalleries() {
  document.querySelectorAll('.gallery-year.active .gallery-grid').forEach(layoutGalleryGrid);
}

layoutAllGalleries();

window.addEventListener('load', layoutAllGalleries);
let galleryResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(galleryResizeTimer);
  galleryResizeTimer = setTimeout(layoutAllGalleries, 150);
});

function showFormMessage(form, text, type = 'success') {
  const existing = form.querySelector('.form-message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = `form-message ${type === 'error' ? 'form-error-message' : 'form-success'}`;
  msg.textContent = text;
  form.appendChild(msg);

  setTimeout(() => msg.remove(), 5000);
}

async function handleFormSubmit(form, successMessage) {
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('submitted');

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.formType = form.id;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Email failed to send.');
      }

      showFormMessage(form, successMessage, 'success');
      form.reset();
      form.classList.remove('submitted');
    } catch (error) {
      console.error(error);
      showFormMessage(form, error.message || 'Něco se nepovedlo. Zkuste to prosím znovu.', 'error');
      form.classList.remove('submitted');
    }
  });

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      if (input.validity.valid) {
        input.closest('.form-group').classList.remove('has-error');
      }
    });
  });
}

handleFormSubmit(
  document.getElementById('registrationForm'),
  '✅ Přihláška byla odeslána! Brzy se vám ozveme.'
);

handleFormSubmit(
  document.getElementById('contactForm'),
  '✅ Zpráva byla odeslána! Děkujeme.'
);
