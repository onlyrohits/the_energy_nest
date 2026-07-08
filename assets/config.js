window.EnergyNestConfig = {
  "siteUrl": "https://theenergynest.com",
  "brandName": "The Energy Nest",
  "supportEmail": "hello@theenergynest.com",
  "sessionLength": "60 minutes",
  "timezoneNote": "The scheduler shows the visitor's local time zone.",
  "web3formsAccessKey": "9432171b-d458-4792-8483-b21ce812bea2",
  // Founding pricing is toggled from one place and the spots count is edited manually.
  "foundingPricing": {
    "enabled": true,
    "spotsLeft": 20
  },
  // Prices are display values only. Keep these in sync with the Stripe Dashboard links below.
  "PRICING": {
    "singleSession": {
      "label": "Single session (60 min)",
      "amount": 120,
      "slug": "single-session",
      "badge": "Standard",
      "note": "Single 60-minute session."
    },
    "foundingSingle": {
      "label": "Founding member session",
      "amount": 90,
      "slug": "founding-session",
      "badge": "Founding pricing",
      "note": "First 20 clients only.",
      "showUntilFirst20": true
    },
    "introOffer": {
      "label": "Intro offer",
      "amount": 60,
      "slug": "intro-session",
      "badge": "First session only",
      "note": "One-time only, once per client.",
      "oneTime": true
    },
    "fourPack": {
      "label": "4-session package",
      "amount": 400,
      "slug": "four-pack",
      "badge": "Most popular",
      "note": "About $100/session.",
      "featured": true
    },
    "membership": {
      "label": "Monthly membership",
      "amount": 200,
      "slug": "membership",
      "badge": "Recurring",
      "note": "2 sessions/mo + async check-in.",
      "recurring": true
    },
    "scholarship": {
      "label": "Scholarship / equity spot",
      "min": 40,
      "max": 60,
      "slug": "scholarship",
      "badge": "Limited",
      "note": "A few spots each month.",
      "equity": true
    }
  },
  "paymentLinks": {
    "supportive-guidance": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_SUPPORTIVE_GUIDANCE",
    "reiki": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_REIKI",
    "akashic-records": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_AKASHIC_RECORDS",
    "meditate-together": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_MEDITATE_TOGETHER",
    "set-good-intention": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_SET_GOOD_INTENTION",
    "single-session": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_SINGLE_SESSION",
    "founding-session": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_FOUNDING_SESSION",
    "intro-session": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_INTRO_SESSION",
    "four-pack": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_FOUR_PACK",
    "membership": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_MEMBERSHIP",
    "scholarship": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_SCHOLARSHIP"
  },
  "schedulerLinks": {
    "supportive-guidance": "https://cal.com/REPLACE_WITH_CAL_LINK_SUPPORTIVE_GUIDANCE",
    "reiki": "https://cal.com/REPLACE_WITH_CAL_LINK_REIKI",
    "akashic-records": "https://cal.com/REPLACE_WITH_CAL_LINK_AKASHIC_RECORDS",
    "meditate-together": "https://cal.com/REPLACE_WITH_CAL_LINK_MEDITATE_TOGETHER",
    "set-good-intention": "https://cal.com/REPLACE_WITH_CAL_LINK_SET_GOOD_INTENTION",
    "single-session": "https://cal.com/REPLACE_WITH_CAL_LINK_SINGLE_SESSION",
    "founding-session": "https://cal.com/REPLACE_WITH_CAL_LINK_FOUNDING_SESSION",
    "intro-session": "https://cal.com/REPLACE_WITH_CAL_LINK_INTRO_SESSION",
    "four-pack": "https://cal.com/REPLACE_WITH_CAL_LINK_FOUR_PACK",
    "membership": "https://cal.com/REPLACE_WITH_CAL_LINK_MEMBERSHIP",
    "scholarship": "https://cal.com/REPLACE_WITH_CAL_LINK_SCHOLARSHIP"
  }
};
