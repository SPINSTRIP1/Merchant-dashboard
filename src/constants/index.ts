export const apps = [
  {
    name: "Wallet",
    description:
      "A secure and seamless payment tool that allows customers to pay instantly and split bills with ease. As a merchant, you receive fast, reliable payments while benefiting from SpinStrip’s reward-driven spending system that encourages customers to return.",
    isActive: true,
    default: true,
    route: "/apps-tools/wallet",
    icon: "/icons/Wallet.png",
  },
  {
    name: "Event Planner",
    description: `Create, organise, and manage your events effortlessly. From RSVPs and reminders to 
promotions and guest engagement, this Event Planner gives you everything you need to turn 
ideas into fully booked experiences. `,
    amount: 288,
    isActive: false,
    route: "/apps-tools/event-planner",
    icon: "/icons/Eventplanner.png",
  },
  {
    name: "Menu",
    description: `Showcase your full menu offerings, including pricing, photos, and specialities, so customers know 
exactly what to expect before visiting. Update items in real time to reduce confusion, set expectations, 
and highlight best-sellers or promotions. `,
    amount: 588,
    isActive: false,
    route: "/apps-tools/menu",
    icon: "/icons/Menu.png",
    integrated: true,
  },
  {
    name: "Chat",
    description: `Enable customers to communicate with your business seamlessly. Answer questions, confirm 
bookings, provide updates, and build strong customer relationships through quick and convenient 
messaging.`,
    isActive: true,
    default: true,
    route: "/apps-tools/chat",
    icon: "/icons/Chats.png",
  },
  {
    name: "Inventory",
    description: `Manage stock, menu items, and product availability in real time. Update items instantly, track what’s 
selling, and ensure your SpinStrip listing always reflects accurate information, improving customer 
trust and reducing order issues. `,
    amount: 588,
    isActive: false,
    route: "/apps-tools/inventory",
    icon: "/icons/Inventory.png",
    integrated: true,
  },
  {
    name: "Groups/Community",
    description: `Engage customers by joining or creating communities relevant to your business, such as food lovers, 
nightlife explorers, coffee enthusiasts, or creative circles. Build lasting loyalty by connecting with your audience.`,
    amount: 588,
    isActive: false,
    route: "/apps-tools/groups-community",
    icon: "/icons/Groups.png",
  },
  {
    name: "Places",
    description: `Get discovered by customers searching for restaurants, lounges, cafes, hotels, shops, or service-based 
businesses. Appear in curated lists, location searches, and personalised recommendations to reach the right 
audience. `,
    isActive: false,
    route: "/apps-tools/places",
    amount: 588,
    icon: "/icons/Places.png",
  },
  {
    name: "Socials",
    description: `Showcase your brand through photos, videos, and customer experiences shared on SpinStrip. As 
users tag, review, and post about your business, you gain visibility, social proof, and a growing digital 
presence. `,
    isActive: false,
    route: "/apps-tools/socials",
    amount: 588,
    icon: "/icons/Socials.png",
  },
  {
    name: "Reviews",
    description: `Gain insights from transparent customer feedback. Positive reviews help build credibility, while 
constructive feedback helps improve service. Reviews on SpinStrip are designed to enhance trust and 
influence decision-making. `,
    isActive: true,
    default: true,
    route: "/apps-tools/reviews",
    icon: "/icons/Reviews.png",
  },
  {
    name: "Deals",
    description: `Attract more customers by offering exclusive SpinStrip discounts or limited-time promotions. Deals 
help your business stand out, boost off-peak demand, and increase customer loyalty. `,
    isActive: false,
    route: "/apps-tools/deals",
    icon: "/icons/Deals.png",
    integrated: true,
    publisher: "John Doe",
  },
  {
    name: "Customers",
    description: `View and understand your customer base through detailed insights. Track visits, preferences, and 
feedback to better tailor your services. SpinStrip helps you turn new visitors into loyal, returning 
customers. `,
    isActive: true,
    default: true,
    route: "/apps-tools/customers",
    icon: "/icons/Customers.png",
  },
  {
    name: "Payment Method",
    description: `Offer customers flexible payment options, including cards, bank transfers, and digital wallets. All 
methods integrate seamlessly with SpinStrip, ensuring secure, fast, and reliable transactions. `,
    isActive: true,
    default: true,
    route: "/apps-tools/payment-method",
    icon: "/icons/Paymentmethod.png",
  },
  {
    name: "Memberships",
    description: `Offer premium perks through SpinStrip’s membership system. Provide special access, priority 
bookings, exclusive menus, and VIP experiences that reward loyal customers and increase repeat 
visits. `,
    isActive: false,
    route: "/apps-tools/memberships",
    icon: "/icons/Membership.png",
  },
  {
    name: "Ads",
    description: `Promote your brand directly to high-intent customers who are ready to explore, book, or spend. Run 
targeted, location-based ads that appear in searches, feeds, and recommendations. Smart targeting 
ensures real visibility, real engagement, and real results. `,
    isActive: false,
    route: "/apps-tools/ads",
    icon: "/icons/Ads.png",
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

export const SERVER_URL = "https://spinstrip-merchant-gateway.fly.dev/api/v1";
