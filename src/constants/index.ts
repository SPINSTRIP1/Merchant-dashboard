export const apps = [
  {
    name: "Wallet",
    description:
      "Handle and pay your bills instantly, divide costs with friends effortlessly, and stack up rewards as you go. SpinStrip Wallet takes care of the money stuff so you can stay in the moment.",
    tagLine: "Pay, split, and enjoy all in one tap.",
    isActive: true,
    default: true,
    route: "/apps-tools/wallet",
  },
  {
    name: "Event Planner",
    description:
      "Turn plans into experiences. From parties to hangouts, this Events Planner helps you create, organize, and share plans effortlessly, so nobody ever says “so what’s the plan?” again. ",
    tagLine: "Plan it. Live it.",
    amount: 588,
    isActive: false,
    route: "/apps-tools/event-planner",
  },
  {
    name: "Menu",
    description:
      "Browse full menus, check prices, and scope out specialties before you even leave the house. No surprises. Just confident choices and great meals.",
    tagLine: "Know before you go",
    amount: 588,
    isActive: false,
    route: "/apps-tools/menu",
  },
  {
    name: "Chat",
    description:
      "Conversations that lead to memories. Chat with friends, groups, or new people on your wavelength, right inside the app. ",
    tagLine: "Talk. Connect. Go.",
    isActive: true,
    default: true,
    route: "/apps-tools/chat",
  },
  {
    name: "Inventory",
    description:
      "Save all your favorite experiences in one place—restaurants you love, events you attended, and places you want to try next. Your city, your collection.",
    tagLine: "Your city, curated by you",
    amount: 588,
    isActive: false,
    route: "/apps-tools/inventory",
  },
  {
    name: "Groups/Community",
    description:
      "Whether you're joining a community or creating your own, this is where real connections happen. Foodies, adventurers, creatives, nightlife lovers—everyone has a home here. ",
    tagLine: "Find your tribe.",
    amount: 588,
    isActive: false,
    route: "/apps-tools/groups-community",
  },
  {
    name: "Places",
    description:
      "Discover spots that fit your vibe—lounges, cafés, hidden gems, and everywhere worth going. Real ratings, real experiences.",
    tagLine: "The city in your pocket",
    isActive: false,
    route: "/apps-tools/places",
    amount: 421,
  },
  {
    name: "Socials",
    description:
      "Share your experiences, build your presence, and let people discover the city through your lens. Creators earn as they post. ",
    tagLine: "Your life. Your city. Your spotlight",
    isActive: false,
    amount: 421,
    route: "/apps-tools/socials",
  },
  {
    name: "Reviews",
    description:
      "See what people actually think before you commit. Leave honest reviews, help others decide, and discover places through trusted voices—not ads.",
    tagLine: "Real stories. Real ratings",
    isActive: true,
    default: true,
    route: "/apps-tools/reviews",
  },
  {
    name: "Deals",
    description:
      "Enjoy the city without breaking the bank. Unlock exclusive discounts on food, drinks, events, experiences, and more. ",
    tagLine: "Good vibes, better prices",
    isActive: false,
    route: "/apps-tools/deals",
    amount: 421,
  },
  {
    name: "Customers",
    description:
      "Manage your customer relationships, track orders, and build loyalty. Keep your regulars coming back and turn first-timers into lifelong fans.",
    tagLine: "Know your people. Grow your business.",
    isActive: true,
    default: true,
    route: "/apps-tools/customers",
  },
  {
    name: "Payment Method",
    description:
      "Cards, bank transfers, digital wallets- add your preferred method and pay securely in one tap. ",
    tagLine: "Pay however you want.",
    isActive: true,
    default: true,
    route: "/apps-tools/payment-method",
  },
  {
    name: "Memberships",
    description:
      "Level up your lifestyle. Get priority reservations, premium deals, VIP event access, and perks that make every outing feel special.",
    tagLine: "Unlock the good life.",
    isActive: false,
    amount: 421,
    route: "/apps-tools/memberships",
  },
  {
    name: "Ads",
    description:
      "Put your brand in front of people looking for exactly what you offer. Smart targeting, high intent, real results.",
    tagLine: "Reach customers ready to explore.",
    isActive: false,
    route: "/apps-tools/ads",
    amount: 421,
  },
];

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const SERVER_URL = "https://spinstrip-auth.fly.dev";
export const COMPLIANCE_SERVER_URL = "https://spinstrip-compliance.fly.dev";
export const INVENTORY_SERVER_URL = "https://spinstrip-inventory.fly.dev";
export const DEALS_SERVER_URL = "https://spinstrip-deals.fly.dev";
export const MENUS_SERVER_URL = "https://spinstrip-menu.fly.dev";
