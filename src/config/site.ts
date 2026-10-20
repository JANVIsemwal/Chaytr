/**
 * All website copy lives here.
 *
 * The company name is not final yet — change COMPANY_NAME below and it updates
 * across every page, the navbar, the footer and the SEO tags.
 * Anything still in [brackets] is a placeholder waiting on the team.
 */

export const COMPANY_NAME = 'Chaytr';

export const TAGLINE = 'Technology that solves real problems.';

// ---------------------------------------------------------------------------
// Contact details
// ---------------------------------------------------------------------------

export const contact = {
  email: 'vertex.nexpay@gmail.com',
  phone: '01376-236816, 236633',
  /** Number dialled when someone taps the phone number. */
  phoneTel: '+911376236816',
  location: 'Bhagirathipuram, Tehri Garhwal, Uttarakhand 249124, India',
  mapUrl: 'https://goo.gl/maps/WZhGUDrENb6ue9HRA',
  /**
   * Optional form service that delivers Contact Us messages to the inbox (e.g. Formspree:
   * set EXPO_PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/yourid in Vercel).
   * Without it, the form opens the visitor's email app with the message ready to send.
   */
  formEndpoint: process.env.EXPO_PUBLIC_CONTACT_FORM_ENDPOINT ?? '',
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
] as const;

// ---------------------------------------------------------------------------
// Focus areas
// ---------------------------------------------------------------------------

export type DomainKey = 'ai-ml' | 'embedded' | 'robotics' | 'fintech';

export const domains: { key: DomainKey; name: string; tab: string; text: string }[] = [
  {
    key: 'ai-ml',
    name: 'AI / ML',
    tab: 'AI / ML',
    text: 'Models that learn from real-world data to detect, predict and decide, built into products people use.',
  },
  {
    key: 'embedded',
    name: 'Embedded Systems',
    tab: 'Embedded Systems',
    text: 'Reliable hardware and firmware that connect the physical world to software.',
  },
  {
    key: 'robotics',
    name: 'Robotics',
    tab: 'Robotics',
    text: 'Machines that sense, move and act in the physical world, from first prototype to field-ready system.',
  },
  {
    key: 'fintech',
    name: 'Fintech',
    tab: 'Fintech',
    text: 'Simple, secure financial products that make money move across borders, starting with NexPay.',
  },
];

export const domainName = (key: DomainKey) => domains.find((d) => d.key === key)?.tab ?? key;

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

export const home = {
  seoTitle: `${COMPANY_NAME} | AI/ML, Embedded Systems, Robotics and Fintech`,
  seoDescription: `${COMPANY_NAME} builds technology across AI/ML, embedded systems, robotics and fintech, including NexPay, a UPI wallet for visitors to India, and Bhedak, a handheld radar that helps soldiers detect hidden threats.`,
  hero: {
    headline: 'We build intelligent technology that solves real problems.',
    // Alternatives from the brief:
    // 'Building the technology that powers tomorrow.'
    subtext: `${COMPANY_NAME} is a technology company working across AI/ML, embedded systems, robotics and fintech. Every project starts with a real problem and ends with a product people can use.`,
    primaryCta: 'Explore Our Projects',
    secondaryCta: 'Contact Us',
  },
  featured: {
    label: 'Featured projects',
    heading: 'Two problems. Two products.',
    link: 'See all projects',
  },
  why: [
    { title: 'One team', text: 'One team across hardware, AI and software.' },
    { title: 'Problem first', text: 'We build only what people need.' },
    { title: 'Trust built in', text: 'Honest claims, secure by default.' },
  ],
  closing: {
    headline: 'Have a problem worth solving?',
    text: "Let's build the solution together.",
    cta: 'Contact Us',
  },
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectsPage = {
  heading: 'Our projects',
  subtext: 'Real products and prototypes across AI, devices, robotics and finance.',
};

/**
 * NexPay page. Kept short on purpose: what it is, why it matters, how it works, the key facts,
 * and everything else as questions people can open. Source: the Team Vertex NexPay deck.
 */
export const nexpay = {
  label: 'Fintech',
  name: 'NexPay',
  headline: "India's UPI, now open to everyone.",
  intro: 'A temporary UPI wallet for visitors to India. No Indian bank account needed.',
  cta: 'Join the NexPay Waitlist',
  statement: {
    kicker: 'THE PROBLEM',
    big: 'India pays with a QR code. Visitors can’t.',
    text: '95% of small shops rely on UPI, and UPI needs an Indian bank account. So 10 million visitors a year are left hunting for cash, refused cards and bad exchange rates.',
  },
  steps: [
    { title: 'Land and sign up', text: 'Your passport and visa are all it takes. You are ready before you leave the airport.', icon: 'plane' },
    { title: 'Load money', text: 'Top up with an international card, cash or FX, at a fair and transparent rate.', icon: 'wallet' },
    { title: 'Pay anywhere', text: 'Your temporary UPI ID works at any UPI QR in India, from chai stalls to hotels. Earn rewards as you go.', icon: 'qr' },
    { title: 'Cash out', text: 'Fly home with your money, not leftover rupees. Withdraw what is left at a kiosk.', icon: 'cashout' },
  ] as { title: string; text: string; icon: 'plane' | 'wallet' | 'qr' | 'cashout' }[],
  params: [
    { label: 'Sign up with', value: 'Passport + visa' },
    { label: 'Pay at', value: 'Any UPI QR' },
    { label: 'Exchange margin', value: '~0.5%' },
    { label: 'Leftover balance', value: 'Cashed out' },
  ],
  compare: {
    columns: ['Cash', 'Forex card', 'Int’l card', 'NexPay'],
    rows: [
      { label: 'Works at UPI-only shops', values: ['yes', 'no', 'no', 'yes'] },
      { label: 'Fair exchange rate', values: ['no', 'partial', 'no', 'yes'] },
      { label: 'Leftover balance refunded', values: ['no', 'partial', 'na', 'yes'] },
      { label: 'Rewards on spending', values: ['no', 'no', 'partial', 'yes'] },
    ] as { label: string; values: ('yes' | 'no' | 'partial' | 'na')[] }[],
  },
  faqs: [
    {
      q: 'Is NexPay safe and legal?',
      a: 'NexPay runs as a wallet platform with RBI-licensed banks and payment service providers, with passport and visa based KYC, FEMA-compliant top-ups and enterprise-grade fraud monitoring. We are building for the RBI prepaid-instrument and NPCI third-party app approvals.',
    },
    {
      q: 'Who can use it?',
      a: 'Tourists, business travellers and NRIs visiting India, and the Indian merchants who serve them, using the UPI QR they already have.',
    },
    {
      q: 'Where will I get NexPay?',
      a: 'In the app, and at airport kiosks, partner hotels, travel agencies and airline tie-ups, so visitors can start paying from the moment they arrive.',
    },
    {
      q: 'How does NexPay make money?',
      a: 'A small margin on currency exchange, UPI transaction fees shared with banking partners, an optional kiosk cash-out fee, and partnerships with hotels, airports and travel companies.',
    },
    {
      q: 'How big is the opportunity?',
      a: 'Foreign tourists spend about ₹28,600 Cr a year in India, and over 90% of it can move to UPI. Our first-year target is 5,000 users, growing to 50,000 at 0.5% adoption.',
    },
    {
      q: 'Who is building it?',
      a: 'Team Vertex, a multidisciplinary student team. NexPay placed 3rd at our college Ideathon and was awarded a dedicated cubicle to pilot the solution. The prototype runs on React, Firebase and Node.js.',
    },
  ],
  ctaTitle: 'Be first to use NexPay.',
  ctaText: 'Join the waitlist and we will let you know as soon as NexPay is ready.',
};

/**
 * Bhedak page. Source: the Bhedak venture-journey deck and bootcamp notes.
 */
export const bhedak = {
  label: 'Defence and public safety',
  name: 'Bhedak',
  device: 'Sentinel Pathfinder',
  headline: 'See the threat before it sees you.',
  intro: 'A handheld radar that finds a hidden, armed person through dense forest, and warns the soldier with a silent vibration.',
  cta: 'Request a Briefing',
  statement: {
    kicker: 'WHY IT MATTERS',
    big: '~1,600 soldiers are lost every year.',
    text: 'In thick forest, eyes stop at a few metres. A hidden attacker is often seen only when it is already too late.',
    note: 'Figure cited in our study: Press Information Bureau, Ministry of Defence (Rajya Sabha reply, 2018).',
  },
  beats: [
    { title: 'Sweep', text: 'Point it at the tree line and sweep, like a torch.', icon: 'sweep' },
    { title: 'Sense', text: 'Radar looks through leaves for the glint of metal and the rhythm of breathing, together.', icon: 'sense' },
    { title: 'Alert', text: 'The grip vibrates. No sound, no light, no position given away.', icon: 'alert' },
  ] as { title: string; text: string; icon: 'sweep' | 'sense' | 'alert' }[],
  params: [
    { label: 'Detection range', value: '30–50 m' },
    { label: 'Signatures checked', value: 'Metal + breath' },
    { label: 'Field of view', value: '60°' },
    { label: 'Battery life', value: '8+ hrs' },
  ],
  tests: ['IP54 dust and water', 'Overturn detection', 'Drives upside down'],
  scenario: [
    '03:00. A dense border forest. Visibility under five metres.',
    'The lead soldier sweeps Bhedak slowly across the tree line.',
    'A steady pulse in the grip: metal and a vital sign, 38 metres ahead.',
  ],
  scenarioLine: 'An ambush becomes an observation.',
  faqs: [
    {
      q: 'How is it different from drones or night vision?',
      a: 'Drones are noisy and blocked by canopy, and night vision still needs a clear line of sight. Bhedak’s radar looks through foliage, makes no sound, and only alerts when it finds both metal and breathing, so a tin can or an animal does not set it off.',
    },
    {
      q: 'Who is it for?',
      a: 'Infantry and patrol units, paramilitary and border forces, and forest rangers working in dense, low-visibility terrain, and the defence procurement teams who equip them.',
    },
    { q: 'What is inside?', a: 'components' },
    { q: 'Where is the project now?', a: 'roadmap' },
    {
      q: 'Why did you build it?',
      a: 'An army veteran shared real incidents of ambushes in dense forest. Our team, engineering students at THDC IHET, Tehri, set out to give soldiers the one thing they need most in that moment: time.',
    },
    {
      q: 'How will Bhedak be offered?',
      a: 'Mainly by licensing the design and technology to defence manufacturers, with a subscription for software updates, support and maintenance of deployed units.',
    },
  ],
  components: [
    { part: 'Acconeer A111', role: '60 GHz pulsed radar that senses micro-motion like breathing' },
    { part: 'Vivaldi antenna', role: 'High-gain, directional beam' },
    { part: 'Teensy 4.1', role: 'Real-time signal processing on the device' },
    { part: 'LRA haptic motor', role: 'Silent vibration alerts' },
    { part: 'MLX90640 thermal', role: 'Close-range heat check' },
    { part: '18650 Li-ion cells', role: '8+ hours of field power' },
  ],
  roadmap: [
    { title: 'Problem study with a veteran', state: 'done' },
    { title: 'Concept and system design', state: 'done' },
    { title: 'Prototype blueprint and test plan', state: 'current' },
    { title: 'Working prototype', state: 'next' },
    { title: 'Field trials and defence pilots', state: 'later' },
  ] as { title: string; state: 'done' | 'current' | 'next' | 'later' }[],
  ctaTitle: 'Work with us on Bhedak.',
  ctaText: 'We are looking for defence partners, field-trial opportunities and advisors.',
};

export type ProjectStatus = 'Coming soon' | 'In development' | 'Prototype' | 'Live';

/** Flagship products. Each has its own page at /projects/<slug>. */
export type Flagship = {
  slug: 'nexpay' | 'bhedak';
  name: string;
  industry: string;
  domains: DomainKey[];
  status: ProjectStatus;
  headline: string;
  summary: string;
  tags: string[];
};

export const flagships: Flagship[] = [
  {
    slug: 'nexpay',
    name: 'NexPay',
    industry: 'Fintech',
    domains: ['fintech'],
    status: 'Coming soon',
    headline: "India's UPI, now open to everyone.",
    summary:
      'A UPI-enabled wallet that lets tourists, foreigners and NRIs convert currency at fairer rates and pay anywhere in India.',
    tags: ['UPI wallet', 'For visitors and NRIs'],
  },
  {
    slug: 'bhedak',
    name: 'Bhedak',
    industry: 'Defence and public safety',
    domains: ['embedded', 'ai-ml'],
    status: 'In development',
    headline: 'See the threat before it sees you.',
    summary:
      'A handheld radar scanner that helps soldiers detect hidden, armed threats through dense foliage, from a safe distance and with silent alerts.',
    tags: ['Handheld radar', 'Silent haptic alerts'],
  },
];

export type Project = {
  name: string;
  domain: DomainKey;
  status: ProjectStatus;
  summary: string;
  /** Optional link for "Learn more". Defaults to the contact page. */
  href?: string;
};

/**
 * Smaller project cards shown under the flagships. Add an entry per project:
 * { name: 'Project name', domain: 'robotics', status: 'Prototype', summary: 'What it does and the problem it solves' }
 */
export const projects: Project[] = [];

export const emptyState = {
  title: 'More on the way',
  text: 'Our pipeline is growing. Have an idea or want to collaborate? Talk to us.',
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const about = {
  headline: 'Built by people who believe technology should feel simple.',
  story: `${COMPANY_NAME} is a team of builders who kept seeing the same thing: powerful technology that ordinary people find hard to use. So we build the products we wished existed, from the device to the app.`,
  storyExtra: '[Add the founding year and one line on how the team came together.]',
  mission:
    'To build simple, trustworthy technology that solves everyday problems and connects people across borders.',
  vision: 'To grow into a family of products that people around the world rely on every day.',
  workOn: ['AI and machine learning', 'Embedded systems', 'Robotics', 'Fintech and digital products'],
  different: [
    { title: 'One team, many disciplines', text: 'Hardware, AI and software under one roof.' },
    { title: 'Problem first', text: 'We build only what people actually need.' },
    { title: 'Trust built in', text: 'Clear pricing, honest claims and security by default.' },
  ],
  values: [
    { title: 'Solve real problems', text: "If it doesn't help someone, we don't build it." },
    { title: 'Earn trust every day', text: 'We say what we do and do what we say.' },
    { title: 'Keep it simple', text: 'The best products feel effortless.' },
    { title: 'Ship, learn, improve', text: 'We move fast, listen closely and keep getting better.' },
  ],
  process: [
    { title: 'Discover', text: 'Talk to users and study the problem.' },
    { title: 'Design', text: 'Shape a simple solution before building.' },
    { title: 'Build', text: 'Develop quickly and test often.' },
    { title: 'Launch and learn', text: 'Release, listen and improve.' },
  ],
};

/** Optional. The team section only appears once at least one person is added. */
export const team: { name: string; role: string; bio: string; photo?: string }[] = [];

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contactPage = {
  headline: "Let's build something together.",
  subtext: `Whether you want to partner with us, collaborate on a project, try NexPay early, partner on Bhedak, invest, or join the team, we would love to hear from you.`,
  success: "Thank you! We've received your message and will be in touch soon.",
  /** Shown when the message was handed to the visitor's email app instead. */
  successEmailApp: 'Your email app should now be open with your message. Just press Send and it will reach us.',
};

export const interests = [
  { key: 'partnership', label: 'Partnership' },
  { key: 'collaboration', label: 'Project collaboration' },
  { key: 'nexpay', label: 'NexPay early access' },
  { key: 'bhedak', label: 'Bhedak: defence partnership' },
  { key: 'careers', label: 'Careers and internships' },
  { key: 'investment', label: 'Investment' },
  { key: 'other', label: 'Other' },
] as const;

export type InterestKey = (typeof interests)[number]['key'];
