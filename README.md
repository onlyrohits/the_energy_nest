# The Energy Nest

Static marketing and booking site for a solo energy-work practice.

## Stack

- Plain HTML, CSS, and vanilla JavaScript
- GitHub Pages hosting
- Stripe Payment Links plus one recurring subscription for premium pricing
- Cal.com or Calendly for 60-minute online scheduling
- Web3Forms for contact and newsletter forms

## Setup

1. Configure GitHub Pages to deploy from the repository root.
2. Keep `CNAME` pointing at `theenergynest.com`.
3. Replace the placeholder payment and scheduler URLs in `assets/config.js`.
4. Keep `assets/services.js` in sync if you change service copy or service slugs.

## Stripe setup

Create the payment products in Stripe first, then paste the public URLs into `assets/config.js`.

- Create fixed-price Payment Links for:
  - `single-session` at $120
  - `founding-session` at $90
  - `intro-session` at $60
  - `four-pack` at $400
- Create a recurring subscription product for `membership` at $200/mo.
- Create one customer-chosen Payment Link for `scholarship` with the $40-$60 range.
- Set each link post-payment redirect to `https://theenergynest.com/booked/?service=<slug>`.
- Replace the placeholder URLs in `assets/config.js` with the live Stripe links.
- Keep the human TODO note in sync if the founding pricing toggle or spots count changes.

Membership implies recurring billing and a decision about how the async check-in is delivered. The static site does not build that channel, so the operator needs to choose a separate workflow.

## Scheduling setup

Create a 60-minute online event for each service in Cal.com or Calendly.

- Keep the links unlisted.
- Paste the booking URLs into `assets/config.js`.
- The booked page shows the scheduler after the selected service or pricing slug is resolved from the query string.
- If you change a slug, update the matching redirect and config entry in the same edit.

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
