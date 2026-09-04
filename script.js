// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 50
    ? '0 2px 12px rgba(0,0,0,0.12)'
    : '0 2px 8px rgba(0,0,0,0.08)';
});

// Gallery year tabs
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.gallery-year').forEach(y => y.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('gallery-' + tab.dataset.year).classList.add('active');
  });
});

// Form submission handler with validation
function handleFormSubmit(form, successMessage) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.classList.add('submitted');

    if (!form.checkValidity()) {
      // Scroll to the first invalid field
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Collect form data
    const data = Object.fromEntries(new FormData(form));
    console.log('Form submitted:', data);

    // Show success message
    const existing = form.querySelector('.form-success');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-success';
    msg.textContent = successMessage;
    form.appendChild(msg);

    form.reset();
    form.classList.remove('submitted');

    setTimeout(() => msg.remove(), 5000);
  });

  // Remove error styling as user fixes fields
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
