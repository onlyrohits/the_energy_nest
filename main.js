(function () {
  const config = window.EnergyNestConfig || {};
  const pricing = config.PRICING || {};
  const services = window.EnergyNestServices || [];
  const offers = window.EnergyNestOffers || [];
  const serviceSlugAliases = {
    'set-a-good-intention': 'set-good-intention'
  };
  const serviceBySlug = new Map(services.map((service) => [service.slug, service]));
  const offerBySlug = new Map(offers.map((offer) => [offer.slug, offer]));
  const foundingDismissKey = 'the-energy-nest-founding-banner-dismissed';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMoney(value) {
    return `$${Number(value).toLocaleString('en-US')}`;
  }

  function formatRange(min, max) {
    return `$${Number(min).toLocaleString('en-US')}–$${Number(max).toLocaleString('en-US')}`;
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

  function hydratePricing() {
    document.querySelectorAll('[data-pricing-amount]').forEach((node) => {
      const key = node.dataset.pricingAmount;
      const item = pricing[key];
      if (!item) {
        return;
      }
      if (typeof item.amount === 'number') {
        node.textContent = formatMoney(item.amount);
      } else if (typeof item.min === 'number' && typeof item.max === 'number') {
        node.textContent = formatRange(item.min, item.max);
      }
    });

    document.querySelectorAll('[data-pricing-note]').forEach((node) => {
      const key = node.dataset.pricingNote;
      const item = pricing[key];
      if (item && item.note) {
        node.textContent = item.note;
      }
    });

    document.querySelectorAll('[data-pricing-badge]').forEach((node) => {
      const key = node.dataset.pricingBadge;
      const item = pricing[key];
      if (item && item.badge) {
        node.textContent = item.badge;
      }
    });

    document.querySelectorAll('[data-pricing-label]').forEach((node) => {
      const key = node.dataset.pricingLabel;
      const item = pricing[key];
      if (item && item.label) {
        node.textContent = item.label;
      }
    });
  }

  function hydrateFoundingBanner() {
    const founding = config.foundingPricing || {};
    const enabled = Boolean(founding.enabled);
    const spots = Number.isFinite(Number(founding.spotsLeft)) ? Number(founding.spotsLeft) : 0;
    const amount = pricing.foundingSingle && typeof pricing.foundingSingle.amount === 'number'
      ? formatMoney(pricing.foundingSingle.amount)
      : '$90';

    document.querySelectorAll('[data-founding-banner]').forEach((banner) => {
      if (!enabled) {
        banner.hidden = true;
        return;
      }

      try {
        if (window.localStorage.getItem(foundingDismissKey) === '1') {
          banner.hidden = true;
          return;
        }
      } catch (error) {
        // Ignore storage failures; the banner just stays visible.
      }

      banner.hidden = false;
      const copy = banner.querySelector('[data-founding-banner-copy]');
      if (copy) {
        copy.textContent = `Founding pricing: first 20 clients pay ${amount}/session — ${spots} spots left.`;
      }
      const spotsNode = banner.querySelector('[data-founding-banner-spots]');
      if (spotsNode) {
        spotsNode.textContent = String(spots);
      }
      const amountNode = banner.querySelector('[data-founding-banner-amount]');
      if (amountNode) {
        amountNode.textContent = amount;
      }
      const closeButton = banner.querySelector('[data-founding-banner-close]');
      if (closeButton && !closeButton.dataset.bound) {
        closeButton.dataset.bound = 'true';
        closeButton.addEventListener('click', () => {
          banner.hidden = true;
          try {
            window.localStorage.setItem(foundingDismissKey, '1');
          } catch (error) {
            // Ignore storage failures.
          }
        });
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
      .map((service) => `
          <a class="button secondary" href="${prefix}services/${service.slug}/">
            <span>${escapeHtml(service.title)}</span>
            <span>View details</span>
          </a>
        `)
      .join('');
  }

  function offerSummaryMarkup(offer) {
    const item = pricing[offer.pricingKey] || {};
    const amountText = typeof item.amount === 'number'
      ? formatMoney(item.amount)
      : typeof item.min === 'number' && typeof item.max === 'number'
        ? formatRange(item.min, item.max)
        : offer.note || '';
    const bullets = [];

    switch (offer.slug) {
      case 'four-pack':
        bullets.push(`${amountText} total.`);
        bullets.push('About $100/session.');
        bullets.push('Best for steady momentum.');
        break;
      case 'single-session':
        bullets.push(`${amountText} standard list price.`);
        bullets.push('One 60-minute session.');
        bullets.push('Good if you want to start with one session.');
        break;
      case 'membership':
        bullets.push(`${amountText} recurring billing.`);
        bullets.push('2 sessions per month.');
        bullets.push('Async check-in is part of the offer.');
        break;
      case 'intro-session':
        bullets.push(`${amountText} first session only.`);
        bullets.push('One-time only, once per client.');
        bullets.push('A softer entry point.');
        break;
      case 'scholarship':
        bullets.push(`${amountText}`);
        bullets.push('A few spots each month.');
        bullets.push('Not the default menu.');
        break;
      case 'founding-session':
        bullets.push(`${amountText} session price.`);
        bullets.push(`${Number((config.foundingPricing || {}).spotsLeft || 0)} spots left.`);
        bullets.push('Founding pricing for the first 20 clients.');
        break;
      default:
        bullets.push(amountText);
        if (offer.note) {
          bullets.push(offer.note);
        }
    }

    return `
      <p><strong>${escapeHtml(offer.summary || offer.title)}</strong></p>
      <ul>
        ${bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
      </ul>
    `;
  }

  function serviceSummaryMarkup(service) {
    return `
      <p><strong>${escapeHtml(service.tagline)}</strong></p>
      <ul>
        <li>${escapeHtml(service.intro)}</li>
        <li>Choose a pricing option on the Services page.</li>
        <li>After payment, the scheduler opens here.</li>
      </ul>
    `;
  }

  function renderBookedPage() {
    const shell = document.querySelector('[data-booked-shell]');
    if (!shell) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('service');
    const normalizedSlug = slug && serviceSlugAliases[slug] ? serviceSlugAliases[slug] : slug;
    const offer = normalizedSlug ? offerBySlug.get(normalizedSlug) : null;
    const service = !offer && normalizedSlug ? serviceBySlug.get(normalizedSlug) : null;
    const titleEl = document.querySelector('[data-booked-title]');
    const descriptionEl = document.querySelector('[data-booked-description]');
    const summaryEl = document.querySelector('[data-booked-summary]');
    const schedulerEl = document.querySelector('[data-booked-scheduler]');
    const chooserEl = document.querySelector('[data-booked-chooser]');
    const prefix = document.body.dataset.prefix || '';
    const pageTitleBase = config.brandName || 'The Energy Nest';

    if (offer) {
      if (titleEl) {
        titleEl.textContent = `Thanks. ${offer.title} is ready.`;
      }
      if (descriptionEl) {
        descriptionEl.textContent = `Choose a 60-minute time for your ${offer.title.toLowerCase()} in your local time zone.`;
      }
      if (summaryEl) {
        summaryEl.innerHTML = offerSummaryMarkup(offer);
      }
      if (schedulerEl) {
        const schedulerUrl = config.schedulerLinks && config.schedulerLinks[offer.slug] || '';
        if (schedulerUrl && !schedulerUrl.includes('REPLACE_WITH')) {
          schedulerEl.innerHTML = `
            <iframe class="scheduler-frame" title="${escapeHtml(offer.title)} scheduling" loading="lazy" src="${schedulerUrl}"></iframe>
            <div class="scheduler-fallback">
              <p class="cta-note">If the embed does not load, open the scheduler in a new tab.</p>
              <a class="button secondary" href="${schedulerUrl}" target="_blank" rel="noopener">Open scheduler</a>
            </div>
          `;
        } else {
          schedulerEl.innerHTML = `
            <div class="scheduler-fallback">
              <p class="mini-label">Scheduler pending</p>
              <p class="sub">Add the Cal.com or Calendly link for <strong>${escapeHtml(offer.title)}</strong> in <code>assets/config.js</code> to show the booking widget here.</p>
              <a class="button secondary" href="${prefix}services/">Return to the pricing page</a>
            </div>
          `;
        }
      }
      if (chooserEl) {
        chooserEl.innerHTML = `<a class="button ghost" href="${prefix}services/">Back to pricing</a>`;
      }
      document.title = `${offer.title} booked · ${pageTitleBase}`;
      return;
    }

    if (service) {
      if (titleEl) {
        titleEl.textContent = `Thanks. ${service.title} is ready.`;
      }
      if (descriptionEl) {
        descriptionEl.textContent = `Choose a 60-minute time for your ${service.title.toLowerCase()} session in your local time zone.`;
      }
      if (summaryEl) {
        summaryEl.innerHTML = serviceSummaryMarkup(service);
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
              <a class="button secondary" href="${prefix}services/${service.slug}/">Return to the service page</a>
            </div>
          `;
        }
      }
      if (chooserEl) {
        chooserEl.innerHTML = `<a class="button ghost" href="${prefix}services/${service.slug}/">View the service page again</a>`;
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
  hydratePricing();
  hydrateFoundingBanner();
  hydratePaymentLinks();
  bindForms();
  renderBookedPage();
  markCurrentNav();
})();
