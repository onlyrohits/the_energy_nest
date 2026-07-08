// Service types describe the work.
// Purchase options describe how people buy the work.
window.EnergyNestOffers = [
  {
    "slug": "four-pack",
    "pricingKey": "fourPack",
    "title": "4-session package",
    "badge": "Most popular",
    "summary": "Best for steady momentum and the offer to steer toward.",
    "note": "About $100/session.",
    "ctaLabel": "Choose package",
    "directoryOrder": 1
  },
  {
    "slug": "single-session",
    "pricingKey": "singleSession",
    "title": "Single session (60 min)",
    "badge": "Standard",
    "summary": "The standard list price for one focused hour.",
    "note": "A single 60-minute session.",
    "ctaLabel": "Choose single session",
    "directoryOrder": 2
  },
  {
    "slug": "membership",
    "pricingKey": "membership",
    "title": "Monthly membership",
    "badge": "Recurring",
    "summary": "2 sessions/mo + async check-in.",
    "note": "Recurring billing.",
    "ctaLabel": "Choose membership",
    "directoryOrder": 3
  },
  {
    "slug": "intro-session",
    "pricingKey": "introOffer",
    "title": "Intro offer",
    "badge": "First session only",
    "summary": "A softer first session for people who want to try the work.",
    "note": "One-time only, once per client.",
    "ctaLabel": "Choose intro offer",
    "directoryOrder": 4
  },
  {
    "slug": "scholarship",
    "pricingKey": "scholarship",
    "title": "Scholarship / equity spot",
    "badge": "Limited",
    "summary": "A few spots each month, not the default menu.",
    "note": "$40-$60 range.",
    "ctaLabel": "Ask about scholarship",
    "directoryOrder": 5
  },
  {
    "slug": "founding-session",
    "pricingKey": "foundingSingle",
    "title": "Founding member session",
    "badge": "Founding pricing",
    "summary": "First 20 clients only.",
    "note": "$90/session.",
    "ctaLabel": "Use founding pricing",
    "directoryOrder": 0,
    "promoOnly": true
  }
];

window.EnergyNestServices = [
  {
    "slug": "supportive-guidance",
    "title": "Supportive Guidance",
    "tagline": "A space to talk it through.",
    "blurb": "Compassionate listening and reflective guidance for the mental load that builds around deadlines, releases, and life outside work.",
    "intro": "A calm conversation space to make sense of pressure, decision fatigue, and the feeling that you are always one tab away from collapse.",
    "cardTags": [
      "Burnout",
      "Clarity",
      "Perspective"
    ],
    "badge": "Grounding support",
    "paymentKey": "supportive-guidance",
    "schedulerKey": "supportive-guidance",
    "purchaseOptions": [
      "four-pack",
      "single-session",
      "membership",
      "intro-session",
      "scholarship"
    ],
    "priceNote": "Premium pricing options are listed on the Services page.",
    "whatIs": "A steady place to talk, sort, and exhale without having to perform being okay.",
    "whatHappens": [
      "Settle in and name what is taking up the most bandwidth.",
      "Look at the loop, decision, or conversation from a steadier place.",
      "Leave with one practical next step and a little more room to breathe."
    ],
    "whoFor": [
      "Burnout, overwhelm, and decision fatigue.",
      "Big changes at work or in life.",
      "People who want support that is warm, grounded, and plainspoken."
    ],
    "notFor": [
      "Emergency care or crisis support.",
      "A substitute for licensed mental health treatment.",
      "Anything that needs immediate medical attention."
    ],
    "practical": [
      "60-minute online session via video link.",
      "Sessions happen in your local time zone.",
      "Stripe handles payment before the scheduler opens."
    ],
    "notes": [
      "TODO: confirm licensure before calling this counseling or therapy.",
      "If you are in crisis in the US, call or text 988."
    ],
    "longDescription": "A calm conversation space to make sense of pressure, decision fatigue, and the feeling that you are always one tab away from collapse. Compassionate listening and reflective guidance for the mental load that builds around deadlines, releases, and life outside work.",
    "paymentLinkUrl": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_SUPPORTIVE_GUIDANCE",
    "calLink": "https://cal.com/REPLACE_WITH_CAL_LINK_SUPPORTIVE_GUIDANCE"
  },
  {
    "slug": "reiki",
    "title": "Reiki (Distance Session)",
    "tagline": "Rebalance a nervous system that has been running hot.",
    "blurb": "A restful distance session for screen fatigue, tension, and the kind of stress that does not clock out when you do.",
    "intro": "Gentle energy work designed to help you soften, settle, and receive without having to perform or explain.",
    "cardTags": [
      "Rest",
      "Release",
      "Balance"
    ],
    "badge": "Energy reset",
    "paymentKey": "reiki",
    "schedulerKey": "reiki",
    "purchaseOptions": [
      "four-pack",
      "single-session",
      "membership",
      "intro-session",
      "scholarship"
    ],
    "priceNote": "Premium pricing options are listed on the Services page.",
    "whatIs": "A quiet distance session meant to support rest, breath, and receptive attention.",
    "whatHappens": [
      "You arrive, get comfortable, and do less.",
      "The session focuses on rest, breath, and receiving.",
      "You close with a gentle landing so you can re-enter your day slowly."
    ],
    "whoFor": [
      "Nervous system overload.",
      "People who carry tension in their shoulders, jaw, or sleep.",
      "Anyone who wants a calm reset without needing to talk the whole time."
    ],
    "notFor": [
      "A medical diagnosis or cure.",
      "Emergency or crisis care.",
      "A replacement for clinical treatment."
    ],
    "practical": [
      "60-minute online session via video link.",
      "Distance work means you can stay home and rest.",
      "Stripe handles payment before the scheduler opens."
    ],
    "notes": [
      "Reiki is a complementary practice for relaxation and wellbeing."
    ],
    "longDescription": "Gentle energy work designed to help you soften, settle, and receive without having to perform or explain. A restful distance session for screen fatigue, tension, and the kind of stress that does not clock out when you do.",
    "paymentLinkUrl": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_REIKI",
    "calLink": "https://cal.com/REPLACE_WITH_CAL_LINK_REIKI"
  },
  {
    "slug": "akashic-records",
    "title": "Akashic Records Reading",
    "tagline": "Clarity when “is this the right path?” will not quiet down.",
    "blurb": "Reflective insight for direction, meaning, and the questions that stay open long after the meeting ends.",
    "intro": "A contemplative reading space for pattern spotting, meaning-making, and a steadier look at what is asking for your attention.",
    "cardTags": [
      "Direction",
      "Meaning",
      "Insight"
    ],
    "badge": "Clarity work",
    "paymentKey": "akashic-records",
    "schedulerKey": "akashic-records",
    "purchaseOptions": [
      "four-pack",
      "single-session",
      "membership",
      "intro-session",
      "scholarship"
    ],
    "priceNote": "Premium pricing options are listed on the Services page.",
    "whatIs": "A reflective reading for the questions that do not need a quick answer but do need a gentler one.",
    "whatHappens": [
      "Bring one question or theme you want to explore.",
      "Receive reflections, patterns, and language that may help you see the situation differently.",
      "Leave with time to integrate before you rush back into the noise."
    ],
    "whoFor": [
      "Career choices and life transitions.",
      "People who want insight beyond a checklist answer.",
      "Anyone who is curious about meaning, not certainty."
    ],
    "notFor": [
      "Guaranteed predictions.",
      "A replacement for practical decision-making.",
      "Emergency advice or medical care."
    ],
    "practical": [
      "60-minute online session via video link.",
      "Sessions happen in your local time zone.",
      "Stripe handles payment before the scheduler opens."
    ],
    "notes": [
      "Readings are reflective, not predictive guarantees."
    ],
    "longDescription": "A contemplative reading space for pattern spotting, meaning-making, and a steadier look at what is asking for your attention. Reflective insight for direction, meaning, and the questions that stay open long after the meeting ends.",
    "paymentLinkUrl": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_AKASHIC_RECORDS",
    "calLink": "https://cal.com/REPLACE_WITH_CAL_LINK_AKASHIC_RECORDS"
  },
  {
    "slug": "meditate-together",
    "title": "Meditate Together",
    "tagline": "Log off and land, live and guided, together.",
    "blurb": "A shared 60-minute practice for people who want company while they slow down and let their nervous system unclench.",
    "intro": "A guided meditation circle with breathing, silence, and a gentle closing that feels like a soft landing.",
    "cardTags": [
      "Breath",
      "Presence",
      "Calm"
    ],
    "badge": "Shared pause",
    "paymentKey": "meditate-together",
    "schedulerKey": "meditate-together",
    "purchaseOptions": [
      "four-pack",
      "single-session",
      "membership",
      "intro-session",
      "scholarship"
    ],
    "priceNote": "Premium pricing options are listed on the Services page.",
    "whatIs": "A grounded practice where nothing needs to be impressive and nothing needs to be forced.",
    "whatHappens": [
      "Arrive, breathe, and let the pace slow.",
      "Follow a guided practice that is simple enough to stop overthinking.",
      "Close with a brief reflection or intention."
    ],
    "whoFor": [
      "People who find it easier to rest in community.",
      "Teams or small groups wanting a shared reset.",
      "Anyone who wants less input and more space."
    ],
    "notFor": [
      "A performance of being calm.",
      "Perfect stillness or a spiritual test.",
      "Therapeutic intervention."
    ],
    "practical": [
      "60-minute online session via video link.",
      "A simple practice with no prior experience needed.",
      "Stripe handles payment before the scheduler opens."
    ],
    "notes": [
      "You do not have to do this perfectly to get something from it."
    ],
    "longDescription": "A guided meditation circle with breathing, silence, and a gentle closing that feels like a soft landing. A shared 60-minute practice for people who want company while they slow down and let their nervous system unclench.",
    "paymentLinkUrl": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_MEDITATE_TOGETHER",
    "calLink": "https://cal.com/REPLACE_WITH_CAL_LINK_MEDITATE_TOGETHER"
  },
  {
    "slug": "set-good-intention",
    "title": "Set a Good Intention",
    "tagline": "Close the laptop with intention, not just fatigue.",
    "blurb": "A weekly ritual to pause, clear the desk of the day, and choose one true direction before you move on.",
    "intro": "A focused closing practice that turns the end of the week into a gentle threshold rather than a crash landing.",
    "cardTags": [
      "Gratitude",
      "Intention",
      "Grace"
    ],
    "badge": "Closing ritual",
    "paymentKey": "set-good-intention",
    "schedulerKey": "set-good-intention",
    "purchaseOptions": [
      "four-pack",
      "single-session",
      "membership",
      "intro-session",
      "scholarship"
    ],
    "priceNote": "Premium pricing options are listed on the Services page.",
    "whatIs": "A closing ritual that helps you leave the day with intention instead of carrying it everywhere.",
    "whatHappens": [
      "Reflect on what deserves to be carried forward and what can stay at the desk.",
      "Name one intention that feels honest and actionable.",
      "Leave with a softer ending to the day or week."
    ],
    "whoFor": [
      "Sunday dread and end-of-week tension.",
      "People who want a recurring reset.",
      "Anyone who likes small rituals that actually stick."
    ],
    "notFor": [
      "A productivity hack.",
      "A replacement for rest.",
      "Emergency support or medical care."
    ],
    "practical": [
      "60-minute online session via video link.",
      "A simple way to mark transitions and clear mental residue.",
      "Stripe handles payment before the scheduler opens."
    ],
    "notes": [
      "Small rituals can change the texture of the week."
    ],
    "longDescription": "A focused closing practice that turns the end of the week into a gentle threshold rather than a crash landing. A weekly ritual to pause, clear the desk of the day, and choose one true direction before you move on.",
    "paymentLinkUrl": "https://buy.stripe.com/REPLACE_WITH_STRIPE_LINK_SET_GOOD_INTENTION",
    "calLink": "https://cal.com/REPLACE_WITH_CAL_LINK_SET_GOOD_INTENTION"
  }
];
