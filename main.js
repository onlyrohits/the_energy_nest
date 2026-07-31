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

  function hasStructuredData(type) {
    return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((script) => {
      const text = script.textContent || '';
      if (!text) {
        return false;
      }

      try {
        const parsed = JSON.parse(text);
        const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
        while (queue.length) {
          const item = queue.shift();
          if (!item || typeof item !== 'object') {
            continue;
          }
          if (item['@type'] === type) {
            return true;
          }
          if (Array.isArray(item['@graph'])) {
            queue.push(...item['@graph']);
          }
        }
      } catch (error) {
        // Fall through to the text check below.
      }

      return text.includes(`"@type": "${type}"`);
    });
  }

  function appendStructuredData(key, data) {
    if (document.querySelector(`script[type="application/ld+json"][data-schema="${key}"]`)) {
      return;
    }
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.schema = key;
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
  }

  function injectStructuredData() {
    if (!hasStructuredData('Organization')) {
      appendStructuredData('organization', {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: config.brandName || 'The Energy Nest',
        url: config.siteUrl || 'https://theenergynest.com/',
        email: config.supportEmail || 'hello@theenergynest.com',
        description: 'The Energy Nest offers supportive guidance, reiki, meditation, and intention-setting for software professionals who spend all day in code and need a quieter place to land.'
      });
    }

    if ((document.body.dataset.page || '') === 'faq' && !hasStructuredData('FAQPage')) {
      const questions = Array.from(document.querySelectorAll('.faq-item')).map((item) => {
        const summary = item.querySelector('summary');
        const answer = item.querySelector('.faq-body, div');
        return {
          '@type': 'Question',
          name: summary ? summary.textContent.trim() : '',
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer ? answer.textContent.trim().replace(/\\s+/g, ' ') : ''
          }
        };
      }).filter((item) => item.name && item.acceptedAnswer.text);

      if (questions.length) {
        appendStructuredData('faq', {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: questions
        });
      }
    }

    const path = window.location.pathname;
    const isServiceDetail = path.startsWith('/services/') && !path.endsWith('/services/') && !path.endsWith('/services/index.html');
    if (isServiceDetail && !hasStructuredData('BreadcrumbList')) {
      const title = document.querySelector('h1');
      const currentName = title ? title.textContent.trim() : document.title.replace(/\\s*-\\s*The Energy Nest\\s*$/, '').trim();
      appendStructuredData('breadcrumbs', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${config.siteUrl || 'https://theenergynest.com'}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: `${config.siteUrl || 'https://theenergynest.com'}/services/`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: currentName,
            item: `${config.siteUrl || 'https://theenergynest.com'}${path}`
          }
        ]
      });
    }
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

  function getFormFeedback(form) {
    const success = form.querySelector('[data-form-status]') || form.parentElement && form.parentElement.querySelector('[data-form-status]');
    const error = form.querySelector('[data-form-error]') || form.parentElement && form.parentElement.querySelector('[data-form-error]');
    return { success, error };
  }

  async function sendWeb3Form(form) {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    if (typeof payload.botcheck === 'string' && payload.botcheck.trim()) {
      return { response: { ok: true, status: 200 }, data: {} };
    }

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
      const { success: successStatus, error: errorStatus } = getFormFeedback(form);
      const button = form.querySelector('button[type="submit"]');
      const successMessage = form.dataset.successMessage || 'Sent. We will reply soon.';
      const sendingMessage = form.dataset.sendingMessage || 'Sending...';
      const originalLabel = button ? button.textContent : '';

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        form.dataset.state = 'sending';
        if (successStatus) {
          successStatus.textContent = '';
        }
        if (errorStatus) {
          errorStatus.textContent = '';
        }

        if (button) {
          button.textContent = sendingMessage;
          button.disabled = true;
        }

        try {
          const { response, data } = await sendWeb3Form(form);
          if (response.ok || response.status === 200) {
            form.dataset.state = 'success';
            if (successStatus) {
              successStatus.textContent = successMessage;
            }
            if (errorStatus) {
              errorStatus.textContent = '';
            }
            form.reset();
          } else {
            form.dataset.state = 'error';
            if (errorStatus) {
              errorStatus.textContent = data.message || 'Something went wrong. Please try again.';
            }
            if (successStatus) {
              successStatus.textContent = '';
            }
          }
        } catch (error) {
          form.dataset.state = 'error';
          if (errorStatus) {
            errorStatus.textContent = 'Something went wrong. Please try again.';
          }
          if (successStatus) {
            successStatus.textContent = '';
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
        bullets.push('A simple fit if you want continuity.');
        break;
      case 'single-session':
        bullets.push(`${amountText} standard list price.`);
        bullets.push('One 60-minute session.');
        bullets.push('Good if you want to start with one session.');
        break;
      case 'membership':
        bullets.push(`${amountText} recurring billing.`);
        bullets.push('2 sessions per month.');
        bullets.push('Nothing extra is bundled.');
        break;
      case 'intro-session':
        bullets.push(`${amountText} first session only.`);
        bullets.push('One-time only, once per client.');
        bullets.push('A softer entry point.');
        break;
      case 'supported-rate':
        bullets.push(`${amountText}`);
        bullets.push('A few spots each month.');
        bullets.push('Not the default menu.');
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
        <li>Join the waitlist or open the service page to see the next steps.</li>
        <li>When booking opens, the scheduler shows up here.</li>
      </ul>
    `;
  }

  function waitlistUrl(prefix) {
    if (config.waitlistUrl) {
      return config.waitlistUrl;
    }
    if (config.siteUrl) {
      return `${config.siteUrl}/#newsletter`;
    }
    return prefix ? `${prefix}#newsletter` : '/#newsletter';
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
    const waitlistHref = waitlistUrl(prefix);

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
      if (service.bookingMode === 'waitlist') {
        if (titleEl) {
          titleEl.textContent = `Thanks. ${service.title} is on the waitlist.`;
        }
        if (descriptionEl) {
          descriptionEl.textContent = 'Leave your email and we will share details once the format, location, and pricing are decided.';
        }
        if (summaryEl) {
          summaryEl.innerHTML = `
            <p><strong>${escapeHtml(service.tagline)}</strong></p>
            <ul>
              <li>${escapeHtml(service.intro)}</li>
              <li>Format, cadence, location, and pricing are still being decided.</li>
              <li>This page routes to the waitlist until the details are set.</li>
            </ul>
          `;
        }
        if (schedulerEl) {
          schedulerEl.innerHTML = `
            <div class="scheduler-fallback">
              <p class="mini-label">Waitlist</p>
              <p class="sub">This offering does not have a booking link yet. Join the waitlist to hear when it is ready.</p>
              <a class="button secondary" href="${waitlistHref}">Join the waitlist</a>
            </div>
          `;
        }
        if (chooserEl) {
          chooserEl.innerHTML = `<a class="button ghost" href="${prefix}services/${service.slug}/">View the service page</a>`;
        }
        document.title = `${service.title} waitlist · ${pageTitleBase}`;
        return;
      }

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
      titleEl.textContent = 'You are on the scheduling page.';
    }
    if (descriptionEl) {
      descriptionEl.textContent = 'Choose the matching service below to open the scheduler, or return to the services page and join the waitlist.';
    }
    if (summaryEl) {
      summaryEl.innerHTML = `
        <p><strong>No service was passed in the URL.</strong></p>
        <p>Use the service list below, or go back to Services and choose the right session before the scheduler opens.</p>
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
  injectStructuredData();
  bindForms();
  renderBookedPage();
  markCurrentNav();
})();
