/**
 * The Bombay Forum — Global Public Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initDateTicker();
  initReadingProgressBar();
  initNewsletterForms();
  initSpotlightForm();
  initSearchOverlay();
  initMobileMenu();
});

// Toast notification helper
function showToast(message, isError = false) {
  let toast = document.getElementById('tbf-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'tbf-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.style.borderColor = isError ? '#D9534F' : '#4A8090';
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 4500);
}

// Dynamic Date Ticker
function initDateTicker() {
  const dateEl = document.getElementById('bombay-live-date');
  if (!dateEl) return;

  function update() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
    dateEl.innerText = `${now.toLocaleDateString('en-IN', options)} · ${now.toLocaleTimeString('en-IN', timeOptions)} IST · Mumbai`;
  }

  update();
  setInterval(update, 1000);
}

// Article Reading Progress Bar
function initReadingProgressBar() {
  const progressBar = document.getElementById('reading-progress');
  const articleContent = document.querySelector('.tbf-article-content');
  if (!progressBar || !articleContent) return;

  window.addEventListener('scroll', () => {
    const totalHeight = articleContent.clientHeight;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    const articleTop = articleContent.offsetTop;

    if (scrollY < articleTop) {
      progressBar.style.width = '0%';
      return;
    }

    const progress = Math.min(100, Math.max(0, ((scrollY - articleTop) / (totalHeight - windowHeight + 300)) * 100));
    progressBar.style.width = `${progress}%`;
  });
}

// Newsletter Subscribe Forms
function initNewsletterForms() {
  const forms = document.querySelectorAll('.tbf-newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[name="email"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const email = emailInput?.value?.trim();

      if (!email) return;

      const originalBtnText = submitBtn ? submitBtn.innerText : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Subscribing...';
      }

      try {
        const res = await fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.success) {
          showToast(data.message || 'Subscribed successfully to The Saturday Communiqué.');
          form.reset();
        } else {
          showToast(data.error || 'Failed to subscribe. Please try again.', true);
        }
      } catch (err) {
        showToast('Network error. Please try again.', true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  });
}

// Spotlight Inquiry Form
function initSpotlightForm() {
  const form = document.getElementById('spotlight-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';

    const formData = {
      brandName: form.querySelector('[name="brandName"]')?.value,
      contactName: form.querySelector('[name="contactName"]')?.value,
      contactEmail: form.querySelector('[name="contactEmail"]')?.value,
      contactPhone: form.querySelector('[name="contactPhone"]')?.value,
      package: form.querySelector('[name="package"]')?.value,
      budget: form.querySelector('[name="budget"]')?.value,
      message: form.querySelector('[name="message"]')?.value
    };

    try {
      const res = await fetch('/api/spotlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Inquiry submitted. The TBF Brand team will contact you shortly.');
        form.reset();
      } else {
        showToast(data.error || 'Submission error', true);
      }
    } catch (err) {
      showToast('Network error. Please try again.', true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  });
}

// Search Overlay & Keyboard Shortcuts
function initSearchOverlay() {
  const overlay = document.getElementById('tbf-search-modal');
  const trigger = document.querySelectorAll('.tbf-search-trigger');
  const closeBtn = document.getElementById('tbf-search-close');
  const searchInput = document.getElementById('tbf-search-input');

  if (!overlay) return;

  function openSearch() {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  function closeSearch() {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }

  trigger.forEach(t => t.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Close on Escape or click background
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeSearch();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });
}

// Mobile Menu Drawer
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Share Article Helper
window.shareArticle = function(platform, url, title) {
  const encodedUrl = encodeURIComponent(url || window.location.href);
  const encodedTitle = encodeURIComponent(title || document.title);

  if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
  } else if (platform === 'linkedin') {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
  } else if (platform === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, '_blank');
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(url || window.location.href).then(() => {
      showToast('Article link copied to clipboard.');
    });
  }
};
