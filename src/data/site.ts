import { Code2, Smartphone, Share2, Camera, Palette } from "lucide-react";

export const services = [
  {
    slug: "web-development",
    title: "Website / Web App Development",
    short: "High-performance websites and web apps engineered to convert.",
    icon: Code2,
    problems: [
      "Slow, outdated sites that lose visitors",
      "Generic templates that don't reflect your brand",
      "No clear path from visitor to customer",
    ],
    process: [
      { step: "Discovery", text: "Understand goals, users, and constraints." },
      { step: "Design", text: "Wireframes and high-fidelity UI in your brand." },
      { step: "Development", text: "Modern stack — React, TypeScript, Tailwind." },
      { step: "Launch", text: "Deploy, monitor, and iterate based on data." },
    ],
  },
  {
    slug: "mobile-development",
    title: "Mobile App Development",
    short: "Native-feeling iOS and Android apps users actually keep open.",
    icon: Smartphone,
    problems: [
      "Slow, buggy apps with poor reviews",
      "Inconsistent UX across platforms",
      "No clear retention or growth strategy",
    ],
    process: [
      { step: "Strategy", text: "Define MVP scope and user journey." },
      { step: "Prototype", text: "Interactive design before a line of code." },
      { step: "Build", text: "Cross-platform delivery with native polish." },
      { step: "Ship", text: "Store submission, analytics, growth loops." },
    ],
  },
  {
    slug: "social-media",
    title: "Social Media Management",
    short: "Strategy, content, and community that builds real audience.",
    icon: Share2,
    problems: [
      "Inconsistent posting and weak engagement",
      "No content strategy or visual identity",
      "Time spent without measurable growth",
    ],
    process: [
      { step: "Audit", text: "Analyze your channels and competitors." },
      { step: "Strategy", text: "Define pillars, tone, and posting cadence." },
      { step: "Create", text: "Produce content and schedule weekly." },
      { step: "Grow", text: "Engage, report, optimize monthly." },
    ],
  },
  {
    slug: "photography-videography",
    title: "Photography & Videography",
    short: "Cinematic visuals that elevate your brand presence.",
    icon: Camera,
    problems: [
      "Low-quality photos that hurt credibility",
      "No video content for modern channels",
      "Inconsistent visual style across platforms",
    ],
    process: [
      { step: "Concept", text: "Mood, references, shot list." },
      { step: "Production", text: "On-location shoot with pro gear." },
      { step: "Editing", text: "Color grade, sound design, motion." },
      { step: "Delivery", text: "Optimized files for every platform." },
    ],
  },
  {
    slug: "branding",
    title: "Graphic Design & Branding",
    short: "Identity systems that look premium across every touchpoint.",
    icon: Palette,
    problems: [
      "Forgettable visual identity",
      "Inconsistent design across materials",
      "No clear brand guidelines for the team",
    ],
    process: [
      { step: "Discovery", text: "Brand positioning and audience workshop." },
      { step: "Design", text: "Logo, palette, typography, identity." },
      { step: "System", text: "Full guidelines and asset library." },
      { step: "Launch", text: "Roll out across all your touchpoints." },
    ],
  },
];

export const projects = [
  {
    slug: "northwind-ecommerce",
    title: "Northwind",
    category: "Web",
    excerpt: "A headless commerce platform redesigned for speed and conversion.",
    problem: "Legacy storefront with 4s load times and 1.2% conversion.",
    solution: "Headless rebuild with edge rendering, redesigned PDP and checkout.",
    tools: ["Next.js", "Shopify", "Tailwind", "Vercel"],
    results: [
      { metric: "+148%", label: "Conversion rate" },
      { metric: "0.6s", label: "Avg. page load" },
      { metric: "+62%", label: "Mobile revenue" },
    ],
  },
  {
    slug: "lumen-mobile",
    title: "Lumen Health",
    category: "Mobile",
    excerpt: "Habit-tracking app with adaptive coaching and streak mechanics.",
    problem: "Existing wellness app saw 80% drop-off in week one.",
    solution: "Redesigned onboarding, gamified streaks, AI-driven nudges.",
    tools: ["React Native", "Expo", "Supabase", "OpenAI"],
    results: [
      { metric: "4.8★", label: "App Store rating" },
      { metric: "+210%", label: "D7 retention" },
      { metric: "92k", label: "Active users" },
    ],
  },
  {
    slug: "atlas-brand",
    title: "Atlas Studio",
    category: "Branding",
    excerpt: "Full identity system for an architecture studio entering Europe.",
    problem: "Outgrowing original identity, needed gravitas for new market.",
    solution: "Editorial wordmark, monochrome palette, motion guidelines.",
    tools: ["Figma", "After Effects", "Print"],
    results: [
      { metric: "12", label: "Touchpoints redesigned" },
      { metric: "3", label: "Industry awards" },
      { metric: "+40%", label: "Inbound leads" },
    ],
  },
  {
    slug: "verge-campaign",
    title: "Verge Apparel",
    category: "Media",
    excerpt: "Launch campaign film and social cutdowns for SS25 collection.",
    problem: "New drop with no campaign assets two weeks from launch.",
    solution: "Sprint shoot, hero film, 30+ social cutdowns delivered in 8 days.",
    tools: ["RED Komodo", "DaVinci Resolve", "Photoshop"],
    results: [
      { metric: "2.1M", label: "Organic views" },
      { metric: "Sold out", label: "In 72 hours" },
      { metric: "+18k", label: "New followers" },
    ],
  },
  {
    slug: "kindred-saas",
    title: "Kindred",
    category: "Web",
    excerpt: "B2B SaaS marketing site with interactive product tours.",
    problem: "Demo requests stalling at the pricing page.",
    solution: "Interactive product tour, repositioned pricing, social proof.",
    tools: ["React", "Framer Motion", "Sanity"],
    results: [
      { metric: "+86%", label: "Demo requests" },
      { metric: "-31%", label: "Bounce rate" },
      { metric: "98", label: "Lighthouse score" },
    ],
  },
  {
    slug: "haven-mobile",
    title: "Haven Travel",
    category: "Mobile",
    excerpt: "Boutique stays discovery app with offline-first architecture.",
    problem: "Travelers needed inspiration without constant connectivity.",
    solution: "Offline-first storage, curated lists, one-tap booking.",
    tools: ["Swift", "Kotlin", "Firebase"],
    results: [
      { metric: "Editor's", label: "App Store feature" },
      { metric: "4.9★", label: "Rating" },
      { metric: "180k", label: "Downloads" },
    ],
  },
];

export const posts = [
  {
    slug: "designing-for-conversion",
    title: "Designing for conversion without losing soul",
    excerpt: "How to build interfaces that perform without sacrificing taste.",
    date: "Mar 12, 2025",
    category: "Design",
    readTime: "6 min",
    content: [
      "Most conversion-focused design feels cynical. It doesn't have to.",
      "The best-converting interfaces I've shipped were also the ones I was most proud of as a designer. Performance and craft aren't opposites — they're amplifiers.",
      "Start with the user's actual problem. Strip away anything that doesn't help them solve it. Then layer in personality through typography, motion, and small surprises.",
      "Conversion comes from clarity. Soul comes from craft. You need both.",
    ],
  },
  {
    slug: "the-modern-stack",
    title: "The modern web stack in 2025",
    excerpt: "What I'm reaching for on every new project — and what I've left behind.",
    date: "Feb 28, 2025",
    category: "Engineering",
    readTime: "8 min",
    content: [
      "The stack has consolidated. React, TypeScript, Tailwind, and a serverless backend cover 90% of what I build.",
      "What changed: edge rendering is now the default, not the exception. Type safety extends from the database to the UI. AI is part of the toolchain, not a feature.",
      "What I left behind: heavy CSS-in-JS runtimes, monolithic CMS platforms, and hand-rolled auth.",
    ],
  },
  {
    slug: "branding-startups",
    title: "Branding for startups: what actually matters",
    excerpt: "Forget the brand book. Here's what to nail in your first 90 days.",
    date: "Feb 4, 2025",
    category: "Branding",
    readTime: "5 min",
    content: [
      "Most startup brand work is performative. You don't need a 60-page guideline doc.",
      "You need a clear name, a confident wordmark, two fonts, three colors, and a tone of voice your team can actually replicate.",
      "Everything else can wait until you've earned it.",
    ],
  },
  {
    slug: "shipping-faster",
    title: "Shipping faster without burning out",
    excerpt: "The systems I use to ship weekly while still doing deep work.",
    date: "Jan 18, 2025",
    category: "Process",
    readTime: "7 min",
    content: [
      "Speed isn't about working more hours — it's about removing friction.",
      "I batch shallow work into mornings, protect afternoons for deep work, and ship something every Friday no matter how small.",
    ],
  },
];

export const navItems = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/collaborations", label: "Collaborations" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];
