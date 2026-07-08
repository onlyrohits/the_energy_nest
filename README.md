# The Energy Nest

Static marketing and booking site for a solo energy-work practice.

## Stack

- Plain HTML, CSS, and vanilla JavaScript
- GitHub Pages hosting
- Stripe Payment Links for sliding-scale payments
- Cal.com or Calendly for 60-minute online scheduling
- Web3Forms for contact and newsletter forms

## Setup

1. Configure GitHub Pages to deploy from the repository root.
2. Keep `CNAME` pointing at `theenergynest.com`.
3. Replace the placeholder payment and scheduler URLs in `assets/config.js`.
4. Keep `assets/services.js` in sync if you change service copy or service slugs.

## Stripe setup

Create one Payment Link per service in the Stripe Dashboard.

- Enable customer-chosen pricing.
- Set the contribution range to USD $5-$20.
- Set the post-payment redirect to `https://theenergynest.com/booked/?service=<slug>`.
- Use the matching slug for each service:
  - `supportive-guidance`
  - `reiki`
  - `akashic-records`
  - `meditate-together`
  - `set-good-intention`

## Scheduling setup

Create a 60-minute online event for each service in Cal.com or Calendly.

- Keep the links unlisted.
- Paste the booking URLs into `assets/config.js`.
- The booked page shows the scheduler after the selected service is resolved from the query string.

## Forms

The site uses Web3Forms for the newsletter and contact forms.

- The public access key is stored in `assets/config.js`.
- Forms still post to Web3Forms if JavaScript is disabled.

## Safety and compliance

- Supportive Guidance is intentionally phrased as supportive guidance, not therapy.
- TODO: confirm licensure before changing that language.
- The disclaimer page explains the limits of the work.
- TODO: have privacy and terms reviewed by a professional before launch.

## Files to know

- `index.html` home page
- `services/index.html` services directory
- `services/<slug>/index.html` individual service pages
- `booked/index.html` post-payment confirmation and scheduler page
- `about/index.html`, `faq/index.html`, `contact/index.html`
- `privacy/index.html`, `terms/index.html`, `disclaimer/index.html`
- `styles.css`, `main.js`, `assets/config.js`, `assets/services.js`

## Notes

- The booked page is intentionally a static post-payment destination. Without a backend, it cannot hard-enforce payment before scheduling.
- If the operator later wants a hard gate, they will need a backend or Cal.com native payment enforcement.
