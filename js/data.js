/*
 * ─────────────────────────────────────────────────────────────
 *  SITE DATA — the only file you need to edit for content.
 *  Everything here was taken from tejaslifespaces.com (Oct 2026).
 *  Fields marked TODO were not published on the current site.
 * ─────────────────────────────────────────────────────────────
 */

const IMG = "https://tejaslifespaces.com/wp-content/uploads/";

window.CONFIG = {
  brand: "Tejas Lifespaces",
  logo: IMG + "2023/05/Tejas-Group_New_logo-1024x362.png",

  // Primary phone numbers (from /contacts/)
  phoneDisplay: "022 2781 6666",
  phone: "+912227816666",
  mobileDisplay: "97692 88956",
  mobile: "+919769288956",

  // TODO: confirm this number is on WhatsApp (digits only, with country code)
  whatsapp: "919769288956",

  email: "sales@tejasinfratech.com",
  address:
    "Office No. 1902 & 1903, 19th Floor, The Affaires, Plot no. 09, Sector 17, Sanpada, Palm Beach Road, Navi Mumbai, Maharashtra 400705",
  officeMapQuery: "The Affaires, Sector 17, Sanpada, Navi Mumbai",

  // Headline figures. The home page says 18+ years, the About page says 12+ — TODO: confirm.
  yearsOfLegacy: 18,

  // TODO: paste real profile URLs; empty ones are hidden automatically
  social: { facebook: "", instagram: "", youtube: "" },

  // Optional: a URL that accepts POSTed JSON leads (Google Apps Script web app,
  // Formspree, your CRM webhook…). Leave empty to use WhatsApp + local storage only.
  leadEndpoint: "",
};

window.PROJECTS = [
  /* ─────────────── ONGOING ─────────────── */
  {
    id: "vaishnavi",
    name: "Tejas Vaishnavi",
    status: "ongoing",
    locality: "Pushpaknagar",
    city: "Navi Mumbai",
    rera: "P52000055176",
    tagline: "When art and innovation unite, they design the canvas of society.",
    configs: ["2 BHK", "2.5 BHK", "3 BHK", "3 BHK + T"],
    commercial: "Exclusive Shops, Offices & Showrooms",
    price: null, // TODO: starting price, e.g. "₹ 89 L onwards"
    possession: null, // TODO
    facts: [
      ["Tower", "G + 12 storeys"],
      ["Homes", "2, 2.5, 3 & 3 BHK + T"],
      ["Amenities", "On the rooftop"],
      ["Certification", "Vastu certified"],
    ],
    highlights: [
      "G + 12 storeyed magnificent tower",
      "All amenities on the rooftop for stunning views",
      "Highway touch project with excellent connectivity",
      "Vastu certified project",
      "Exclusive shops, offices & showrooms",
    ],
    banner: IMG + "2026/04/TEAJS-vaishnavi-2.jpg-1.jpeg",
    cover: IMG + "2025/09/TEAJS-vaishnavi.jpg",
    gallery: [
      IMG + "2025/09/tejas-vaishnavi-home-page-1024x768.jpg",
      IMG + "2026/04/TEAJS-vaishnavi-2.jpg-1.jpeg",
      IMG + "2025/09/infinity-swimmingpool-2-TEJAS-VAISHNAVI-1.jpg",
      IMG + "2025/09/Fitness-Area_TEJAS-VAISHNAVI-1.jpg",
      IMG + "2025/09/Children-play-area-TEJAS-VAISHNAVI-1.jpg",
      IMG + "2025/09/INDOOR-GAMES_TEJAS-VAISHNAVI-1.jpg",
      IMG + "2025/09/MEDIATION-CENTRE_TEJAS-VAISHNAVI-1.jpg",
    ],
    amenities: [
      { name: "Infinity Swimming Pool", img: IMG + "2025/09/infinity-swimmingpool-2-TEJAS-VAISHNAVI-1.jpg" },
      { name: "Fitness Area", img: IMG + "2025/09/Fitness-Area_TEJAS-VAISHNAVI-1.jpg" },
      { name: "Children's Play Area", img: IMG + "2025/09/Children-play-area-TEJAS-VAISHNAVI-1.jpg" },
      { name: "Indoor Games", img: IMG + "2025/09/INDOOR-GAMES_TEJAS-VAISHNAVI-1.jpg" },
      { name: "Meditation Centre", img: IMG + "2025/09/MEDIATION-CENTRE_TEJAS-VAISHNAVI-1.jpg" },
    ],
    connectivityNote: "All within a 1 km radius",
    connectivity: [
      { name: "Navi Mumbai International Airport", time: "Within 1 km", img: IMG + "2025/09/airport-vaishnavi.jpg", q: "Navi Mumbai International Airport" },
      { name: "Mumbai–Pune Expressway", time: "Within 1 km", img: IMG + "2025/09/mumbai-pune-express-haiway-vaishnavi.jpg", q: "Mumbai Pune Expressway Panvel" },
      { name: "Atal Setu (MTHL)", time: "Within 1 km", img: IMG + "2025/09/atal-setu-vaishnavi.jpg", q: "Atal Setu Chirle Navi Mumbai" },
      { name: "Upcoming Navi Mumbai SEZ", time: "Within 1 km", img: IMG + "2025/09/upcoming-Navi-Mumbai-SE-vaishnavi.jpg", q: "Navi Mumbai SEZ Ulwe" },
      { name: "Upcoming Metro Station", time: "Within 1 km", img: IMG + "2025/09/metro-station-vaishnavi.jpg", q: "Pendhar Metro Station Navi Mumbai" },
      { name: "Khandeshwar / Panvel Railway Station", time: "Within 1 km", img: IMG + "2025/09/panvel-station-vaishnavi.jpg", q: "Khandeshwar Railway Station" },
    ],
    mapQuery: "Pushpak Nagar, Navi Mumbai",
    mapLink: "https://share.google/g2eCq66bOneUYJBgo",
  },
  {
    id: "neelkamal",
    name: "Tejas Neelkamal",
    status: "ongoing",
    locality: "Deravali, Palaspe",
    city: "Panvel",
    rera: "P52000050567",
    tagline: "Your dream home starts here — spacious, modern, and in the heart of Panvel.",
    configs: ["1 BHK"],
    commercial: "Shops available",
    price: null, // TODO
    possession: null, // TODO
    facts: [
      ["Building", "G + 6 storeys"],
      ["Homes", "56 units · 1 BHK"],
      ["Finance", "All major banks"],
      ["Certification", "Vastu certified"],
    ],
    highlights: [
      "Thoughtfully crafted 1 BHK project with 56 units",
      "Optimum space management with no wastage in any room",
      "Vastu certified",
      "Financed by all major banks",
      "Shops available",
    ],
    banner: IMG + "2026/04/TEAJS-Neelkamal.jpg-1.jpeg",
    cover: IMG + "2025/09/TEAJS-NEELKAMAL.jpg",
    gallery: [
      IMG + "2026/04/TEAJS-Neelkamal.jpg-1.jpeg",
      IMG + "2025/09/neelkamla-600x450-1.jpg",
      IMG + "2025/09/WhatsApp-Image-2025-09-08-at-16.09.57-2.jpeg",
      IMG + "2025/09/WhatsApp-Image-2025-09-08-at-16.09.57-3.jpeg",
      IMG + "2025/09/WhatsApp-Image-2025-09-08-at-16.09.58-1.jpeg",
    ],
    amenities: [],
    connectivityNote: "Everyday essentials within minutes",
    connectivity: [
      { name: "Navi Mumbai International Airport", time: "15 min", img: IMG + "2025/09/navi-mumbai-airport-neelkamal-1.jpg", q: "Navi Mumbai International Airport" },
      { name: "Panvel Railway Station", time: "10 min", img: IMG + "2025/09/panvel-station-neelkamal-1.jpg", q: "Panvel Railway Station" },
      { name: "Mumbai–Pune Highway", time: "Close by", img: null, q: "Palaspe Phata Panvel" },
      { name: "D-Mart", time: "5 min", img: null, q: "DMart Panvel" },
      { name: "Palaspe Phata", time: "5 min", img: null, q: "Palaspe Phata" },
      { name: "Schools & Colleges", time: "5 min", img: null, q: "schools near Palaspe Panvel" },
      { name: "JNPT", time: "Nearby", img: IMG + "2025/09/JNPT-neelkamal-1.jpg", q: "JNPT Navi Mumbai" },
      { name: "Atal Setu (MTHL)", time: "Nearby", img: IMG + "2025/09/atal-setu-neelkamal-1.jpg", q: "Atal Setu Chirle Navi Mumbai" },
    ],
    mapQuery: "Derawali, Panvel",
    mapLink: "https://share.google/Rwk2SxoC8XDatNgk3",
  },

  /* ─────────────── UPCOMING ─────────────── */
  { id: "alante", name: "Tejas Alante", status: "upcoming", locality: "Karla", city: "Lonavala", cover: IMG + "2025/09/TEJAS_Alante.jpg" },
  { id: "elite", name: "Tejas Elite", status: "upcoming", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/Tejas-Elite.jpg" },

  /* ─────────────── COMPLETED · SIGNATURE ─────────────── */
  { id: "sapphire", name: "Tejas Sapphire", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/Tejas-Sapphire.jpg" },
  { id: "heritage", name: "Tejas Heritage", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/TEAJS-heritage-2.jpg" },
  { id: "ambience", name: "Tejas Ambience", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/TEAJS-Ambience.jpg.jpeg" },
  { id: "sparsh", name: "Tejas Sparsh", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/Tejas_sparsh-1.jpg" },
  { id: "mauli", name: "Tejas Mauli", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/TEAJS-mauli.jpg" },
  { id: "heights", name: "Tejas Heights", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/TEAJS-heights.jpg.jpeg" },
  { id: "symphony", name: "Tejas Symphony", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/TEAJS-Symphony.jpg.jpeg" },
  { id: "emerald", name: "Tejas Emerald", status: "completed", tier: "signature", locality: "Ulwe", city: "Navi Mumbai", cover: IMG + "2025/09/TEAJS-Emerald-1.jpg" },
  { id: "exotica", name: "Tejas Exotica", status: "completed", tier: "signature", locality: "Kalundre", city: "Panvel", cover: IMG + "2025/09/TEAJS-Exotica-1.jpg" },

  /* ─────────────── COMPLETED · HERITAGE (no photos on current site) ─────────────── */
  ...[
    ["Shree Vignaharta Apartment", "Kamothe", "Navi Mumbai"],
    ["Varadvinayak Apartment", "Kamothe", "Navi Mumbai"],
    ["Tejas Harmony", "Kharghar", "Navi Mumbai"],
    ["Tejas Residency", "Kalundre", "Panvel"],
    ["Tejas Roshan", "Kalundre", "Panvel"],
    ["Tejas Villa", "Kalundre", "Panvel"],
    ["Tejas Apartment", "Ulwe", "Navi Mumbai"],
    ["Tejas Shree Samarth", "Kalundre", "Panvel"],
    ["Tejas Ganpat Apartment", "Navade", "Navi Mumbai"],
    ["Tejas Narmada", "Ulwe", "Navi Mumbai"],
    ["Tejas Payas", "Ulwe", "Panvel"],
    ["Tejas Kritika", "Ulwe", "Navi Mumbai"],
    ["Tejas Parth", "Ulwe", "Navi Mumbai"],
    ["Tejas Komal", "Ulwe", "Panvel"],
    ["Tejas Parishma", "Ulwe", "Navi Mumbai"],
    ["Prathmesh", "Ulwe", "Navi Mumbai"],
    ["Tejas Ojas", "Dronagiri", "Navi Mumbai"],
    ["Tejas Siddharth", "Ulwe", "Navi Mumbai"],
    ["Tejas Palak", "Adai Village", "Panvel"],
    ["Tejas Omkar", "Dronagiri", "Navi Mumbai"],
    ["Acumen", "Ulwe", "Navi Mumbai"],
    ["Vitthal", "Vichumbe", "New Panvel"],
    ["Rukmini", "Vichumbe", "New Panvel"],
    ["Ankita", "Dronagiri", "Navi Mumbai"],
    ["Adarsh", "Ulwe", "Navi Mumbai"],
    ["Sai", "Ulwe", "Navi Mumbai"],
  ].map(([name, locality, city]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    status: "completed",
    tier: "heritage",
    locality,
    city,
    cover: null,
  })),
];

window.ABOUT = {
  founder: "Mr. Sangram Patil",
  photo: IMG + "2025/09/about-us-4-1.jpg",
  heading: "Shaping dreams into landmarks",
  intro:
    "At Tejas Lifespaces, led by visionary Mr. Sangram Patil, we craft spaces that turn aspirations into reality. We are known for quality, transparency, and timely delivery. From affordable to premium homes, every project reflects thoughtful planning, prime connectivity, and a commitment to building communities founded on trust, integrity, and customer satisfaction.",
  family:
    "At the heart of our journey lies family. What began as a vision has grown into a legacy carried forward across generations, built on trust, transparency, and togetherness. For us, family is not just who we are — it is who we build for.",
  pillars: [
    { key: "Vision", icon: IMG + "2025/09/Vision-icon.png", text: "We deliver well-designed, high-quality homes with comfort and connectivity, ensuring timely delivery, transparency, and lasting trust." },
    { key: "Mission", icon: IMG + "2025/09/Mission-icon.png", text: "To be Navi Mumbai's trusted real estate name, known for excellence and customer focus, creating iconic, sustainable landmarks." },
    { key: "Values", icon: IMG + "2025/09/Values-icon.png", text: "Our values are built on integrity, commitment, innovation, customer-first focus, and excellence guiding every project we deliver." },
  ],
  strengths: [
    { title: "Top quality construction", text: "Robust engineering, modern design, and a commitment to durability that ensures lasting value for generations." },
    { title: "On-time delivery", text: "Every project is meticulously planned and executed with efficiency, so possession is handed over as promised." },
    { title: "Honesty & transparency", text: "From clear communication to ethical practices, every interaction with our customers is open and transparent." },
  ],
};
