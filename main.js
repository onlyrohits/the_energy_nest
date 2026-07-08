(function () {
  const config = window.EnergyNestConfig || {};
  const services = window.EnergyNestServices || [];
  const serviceSlugAliases = {
    'set-a-good-intention': 'set-good-intention'
  };
  const serviceBySlug = new Map(services.map((service) => [service.slug, service]));

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setCurrentYear() {
    document.querySelectorAll('[data-current-year]').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function hydratePaymentLinks() {
    document.querySelectorAll('[data-payment-key]').forEach((link) => {
      const key = link.dataset.paymentKey;
      const url = config.paymentLinks && config.paymentLinks[key];
      if (url) {
        link.href = url;
      }
    });
  }

  function getFormStatus(form) {
    return form.querySelector('[data-form-status]') || form.parentElement && form.parentElement.querySelector('[data-form-status]');
  }

  async function sendWeb3Form(form) {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (!payload.access_key) {
      payload.access_key = config.web3formsAccessKey;
    }

    if (!payload.from_name) {
      payload.from_name = config.brandName || 'The Energy Nest';
    }

    if (!payload.subject) {
      payload.subject = form.dataset.subject || 'Message from The Energy Nest';
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  function bindForms() {
    document.querySelectorAll('form[data-web3forms-form]').forEach((form) => {
      const status = getFormStatus(form);
      const button = form.querySelector('button[type="submit"]');
      const successMessage = form.dataset.successMessage || 'Sent. We will reply soon.';
      const sendingMessage = form.dataset.sendingMessage || 'Sending...';
      const originalLabel = button ? button.textContent : '';

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (status) {
          status.textContent = '';
        }

        if (button) {
          button.textContent = sendingMessage;
          button.disabled = true;
        }

        try {
          const { response, data } = await sendWeb3Form(form);
          if (response.ok || response.status === 200) {
            if (status) {
              status.textContent = successMessage;
            }
            form.reset();
          } else {
            if (status) {
              status.textContent = data.message || 'Something went wrong. Please try again.';
            }
          }
        } catch (error) {
          if (status) {
            status.textContent = 'Something went wrong. Please try again.';
          }
          console.log(error);
        } finally {
          if (button) {
            button.textContent = originalLabel;
            button.disabled = false;
          }
        }
      });
    });
  }

  function serviceChooserMarkup(currentSlug) {
    const prefix = document.body.dataset.prefix || '';
    return services
      .filter((service) => service.slug !== currentSlug)
      .map((service) => {
        const paymentUrl = config.paymentLinks && config.paymentLinks[service.slug] || '#';
        return `
          <a class="button secondary" href="${prefix}services/${service.slug}/">
            <span>${escapeHtml(service.title)}</span>
            <span>View details</span>
          </a>
        `;
      })
      .join('');
  }

  function renderBookedPage() {
    const shell = document.querySelector('[data-booked-shell]');
    if (!shell) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('service');
    const normalizedSlug = slug && serviceSlugAliases[slug] ? serviceSlugAliases[slug] : slug;
    const service = normalizedSlug ? serviceBySlug.get(normalizedSlug) : null;
    const titleEl = document.querySelector('[data-booked-title]');
    const descriptionEl = document.querySelector('[data-booked-description]');
    const summaryEl = document.querySelector('[data-booked-summary]');
    const schedulerEl = document.querySelector('[data-booked-scheduler]');
    const chooserEl = document.querySelector('[data-booked-chooser]');
    const pageTitleBase = config.brandName || 'The Energy Nest';

    if (service) {
      if (titleEl) {
        titleEl.textContent = `Thanks. ${service.title} is ready.`;
      }
      if (descriptionEl) {
        descriptionEl.textContent = `Choose a 60-minute time for your ${service.title.toLowerCase()} session in your local time zone.`;
      }
      if (summaryEl) {
        summaryEl.innerHTML = `
          <p><strong>${escapeHtml(service.tagline)}</strong></p>
          <ul>
            <li>Contribution range: $5-$20.</li>
            <li>Online via video link.</li>
            <li>Payment redirects you here after Stripe.</li>
          </ul>
        `;
      }
      if (schedulerEl) {
        const schedulerUrl = config.schedulerLinks && config.schedulerLinks[service.slug] || service.calLink || '';
        if (schedulerUrl && !schedulerUrl.includes('REPLACE_WITH')) {
          schedulerEl.innerHTML = `
            <iframe class="scheduler-frame" title="${escapeHtml(service.title)} scheduling" loading="lazy" src="${schedulerUrl}"></iframe>
            <div class="scheduler-fallback">
              <p class="cta-note">If the embed does not load, open the scheduler in a new tab.</p>
              <a class="button secondary" href="${schedulerUrl}" target="_blank" rel="noopener">Open scheduler</a>
            </div>
          `;
        } else {
          schedulerEl.innerHTML = `
            <div class="scheduler-fallback">
              <p class="mini-label">Scheduler pending</p>
              <p class="sub">Add the Cal.com or Calendly link for <strong>${escapeHtml(service.title)}</strong> in <code>assets/config.js</code> to show the booking widget here.</p>
              <a class="button secondary" href="${document.body.dataset.prefix || ''}services/${service.slug}/">Return to the service page</a>
            </div>
          `;
        }
      }
      if (chooserEl) {
        chooserEl.innerHTML = `<a class="button ghost" href="${document.body.dataset.prefix || ''}services/${service.slug}/">View the service page again</a>`;
      }
      document.title = `${service.title} booked · ${pageTitleBase}`;
      return;
    }

    if (titleEl) {
      titleEl.textContent = 'You are on the booking page.';
    }
    if (descriptionEl) {
      descriptionEl.textContent = 'If you just completed payment, choose the matching service below to open the scheduler.';
    }
    if (summaryEl) {
      summaryEl.innerHTML = `
        <p><strong>No service was passed in the URL.</strong></p>
        <p>Use the service list below, or go back to Services and choose the right session before booking.</p>
      `;
    }
    if (schedulerEl) {
      schedulerEl.innerHTML = `<div class="scheduler-fallback"><p class="sub">Select a service to reveal its scheduler.</p></div>`;
    }
    if (chooserEl) {
      chooserEl.innerHTML = serviceChooserMarkup(null);
    }
  }

  function markCurrentNav() {
    const path = window.location.pathname;
    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) {
        return;
      }
      const resolved = new URL(href, window.location.href).pathname;
      if (resolved === path || (resolved.endsWith('/index.html') && path.endsWith('/')) || (resolved.endsWith('/') && path === resolved.slice(0, -1))) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  setCurrentYear();
  hydratePaymentLinks();
  bindForms();
  renderBookedPage();
  markCurrentNav();
})();
