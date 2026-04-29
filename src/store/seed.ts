import type { StudioState } from "./types";

export const seedState: StudioState = {
  services: [
    {
      slug: "web-development",
      title: "Website / Web App Development",
      short: "High-performance websites and web apps engineered to convert.",
      icon: "Code2",
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
      tiers: [
        {
          id: "web-starter",
          name: "Starter",
          price: "$2,500",
          description: "Landing page or simple marketing site.",
          features: ["Up to 5 pages", "Responsive design", "Basic SEO", "1 round of revisions"],
          ctaLabel: "Book Starter",
        },
        {
          id: "web-pro",
          name: "Pro",
          price: "$6,500",
          description: "Full marketing site with CMS.",
          features: ["Up to 15 pages", "Custom design system", "CMS integration", "Analytics setup", "2 rounds of revisions"],
          highlighted: true,
          ctaLabel: "Book Pro",
        },
        {
          id: "web-premium",
          name: "Premium",
          price: "from $15k",
          description: "Web app with custom backend.",
          features: ["Custom architecture", "Authentication & DB", "Edge deployment", "Ongoing support", "Unlimited revisions"],
          ctaLabel: "Book Premium",
        },
      ],
    },
    {
      slug: "mobile-development",
      title: "Mobile App Development",
      short: "Native-feeling iOS and Android apps users actually keep open.",
      icon: "Smartphone",
      problems: ["Slow, buggy apps with poor reviews", "Inconsistent UX across platforms", "No clear retention strategy"],
      process: [
        { step: "Strategy", text: "Define MVP scope and user journey." },
        { step: "Prototype", text: "Interactive design before a line of code." },
        { step: "Build", text: "Cross-platform delivery with native polish." },
        { step: "Ship", text: "Store submission, analytics, growth loops." },
      ],
      tiers: [
        { id: "mob-mvp", name: "MVP", price: "$8,000", description: "Single-platform MVP.", features: ["iOS or Android", "Up to 8 screens", "Basic auth", "Store submission"], ctaLabel: "Book MVP" },
        { id: "mob-cross", name: "Cross-Platform", price: "$15,000", description: "iOS + Android with shared codebase.", features: ["React Native", "Push notifications", "Analytics", "Backend integration"], highlighted: true, ctaLabel: "Book Cross-Platform" },
        { id: "mob-scale", name: "Scale", price: "from $30k", description: "Production-grade app + ongoing dev.", features: ["Full feature set", "CI/CD pipeline", "Crash monitoring", "Monthly retainer"], ctaLabel: "Book Scale" },
      ],
    },
    {
      slug: "social-media",
      title: "Social Media Management",
      short: "Strategy, content, and community that builds real audience.",
      icon: "Share2",
      problems: ["Inconsistent posting and weak engagement", "No content strategy or visual identity", "Time spent without measurable growth"],
      process: [
        { step: "Audit", text: "Analyze your channels and competitors." },
        { step: "Strategy", text: "Define pillars, tone, and posting cadence." },
        { step: "Create", text: "Produce content and schedule weekly." },
        { step: "Grow", text: "Engage, report, optimize monthly." },
      ],
      tiers: [
        { id: "smm-lite", name: "Lite", price: "$800/mo", description: "1 platform, 8 posts/month.", features: ["Content calendar", "Basic graphics", "Monthly report"], ctaLabel: "Book Lite" },
        { id: "smm-grow", name: "Growth", price: "$2,000/mo", description: "3 platforms, 20 posts/month.", features: ["Full content production", "Community management", "Bi-weekly reports", "Paid ad strategy"], highlighted: true, ctaLabel: "Book Growth" },
        { id: "smm-pro", name: "Pro", price: "$4,500/mo", description: "Full-stack social team.", features: ["All platforms", "Video & motion content", "Influencer outreach", "Dedicated manager"], ctaLabel: "Book Pro" },
      ],
    },
    {
      slug: "photography-videography",
      title: "Photography & Videography",
      short: "Cinematic visuals that elevate your brand presence.",
      icon: "Camera",
      problems: ["Low-quality photos that hurt credibility", "No video content for modern channels", "Inconsistent visual style"],
      process: [
        { step: "Concept", text: "Mood, references, shot list." },
        { step: "Production", text: "On-location shoot with pro gear." },
        { step: "Editing", text: "Color grade, sound design, motion." },
        { step: "Delivery", text: "Optimized files for every platform." },
      ],
      tiers: [
        { id: "media-half", name: "Half Day", price: "$1,200", description: "4-hour shoot.", features: ["1 location", "30 edited photos", "1 short reel"], ctaLabel: "Book Half Day" },
        { id: "media-full", name: "Full Day", price: "$2,500", description: "8-hour shoot.", features: ["Multi-location", "60 edited photos", "1 hero film + 5 reels"], highlighted: true, ctaLabel: "Book Full Day" },
        { id: "media-camp", name: "Campaign", price: "from $7k", description: "Multi-day campaign production.", features: ["Pre-production", "Crew + equipment", "Hero film + cutdowns", "Color grade & sound"], ctaLabel: "Book Campaign" },
      ],
    },
    {
      slug: "branding",
      title: "Graphic Design & Branding",
      short: "Identity systems that look premium across every touchpoint.",
      icon: "Palette",
      problems: ["Forgettable visual identity", "Inconsistent design across materials", "No clear brand guidelines"],
      process: [
        { step: "Discovery", text: "Brand positioning and audience workshop." },
        { step: "Design", text: "Logo, palette, typography, identity." },
        { step: "System", text: "Full guidelines and asset library." },
        { step: "Launch", text: "Roll out across all your touchpoints." },
      ],
      tiers: [
        { id: "brand-mark", name: "Wordmark", price: "$1,500", description: "Logo + basic palette.", features: ["3 logo concepts", "Color palette", "Typography pairing"], ctaLabel: "Book Wordmark" },
        { id: "brand-id", name: "Identity", price: "$4,500", description: "Full brand identity.", features: ["Logo system", "Palette & type", "Brand guidelines", "Stationery"], highlighted: true, ctaLabel: "Book Identity" },
        { id: "brand-sys", name: "System", price: "from $10k", description: "Enterprise brand system.", features: ["Full strategy", "Visual & verbal identity", "Motion guidelines", "Asset library"], ctaLabel: "Book System" },
      ],
    },
  ],
  projects: [
    { slug: "northwind-ecommerce", title: "Northwind", category: "Web", excerpt: "A headless commerce platform redesigned for speed and conversion.", problem: "Legacy storefront with 4s load times and 1.2% conversion.", solution: "Headless rebuild with edge rendering, redesigned PDP and checkout.", tools: ["Next.js", "Shopify", "Tailwind", "Vercel"], results: [{ metric: "+148%", label: "Conversion rate" }, { metric: "0.6s", label: "Avg. page load" }, { metric: "+62%", label: "Mobile revenue" }], isFeatured: true, publishedAt: "2025-03-10" },
    { slug: "lumen-mobile", title: "Lumen Health", category: "Mobile", excerpt: "Habit-tracking app with adaptive coaching and streak mechanics.", problem: "Existing wellness app saw 80% drop-off in week one.", solution: "Redesigned onboarding, gamified streaks, AI-driven nudges.", tools: ["React Native", "Expo", "Supabase", "OpenAI"], results: [{ metric: "4.8★", label: "App Store rating" }, { metric: "+210%", label: "D7 retention" }, { metric: "92k", label: "Active users" }], isFeatured: true, publishedAt: "2025-02-20" },
    { slug: "atlas-brand", title: "Atlas Studio", category: "Branding", excerpt: "Full identity system for an architecture studio entering Europe.", problem: "Outgrowing original identity, needed gravitas for new market.", solution: "Editorial wordmark, monochrome palette, motion guidelines.", tools: ["Figma", "After Effects", "Print"], results: [{ metric: "12", label: "Touchpoints redesigned" }, { metric: "3", label: "Industry awards" }, { metric: "+40%", label: "Inbound leads" }], publishedAt: "2025-01-15" },
    { slug: "verge-campaign", title: "Verge Apparel", category: "Media", excerpt: "Launch campaign film and social cutdowns for SS25 collection.", problem: "New drop with no campaign assets two weeks from launch.", solution: "Sprint shoot, hero film, 30+ social cutdowns delivered in 8 days.", tools: ["RED Komodo", "DaVinci Resolve", "Photoshop"], results: [{ metric: "2.1M", label: "Organic views" }, { metric: "Sold out", label: "In 72 hours" }, { metric: "+18k", label: "New followers" }], publishedAt: "2024-12-05" },
    { slug: "kindred-saas", title: "Kindred", category: "Web", excerpt: "B2B SaaS marketing site with interactive product tours.", problem: "Demo requests stalling at the pricing page.", solution: "Interactive product tour, repositioned pricing, social proof.", tools: ["React", "Framer Motion", "Sanity"], results: [{ metric: "+86%", label: "Demo requests" }, { metric: "-31%", label: "Bounce rate" }, { metric: "98", label: "Lighthouse score" }], publishedAt: "2024-11-22" },
    { slug: "haven-mobile", title: "Haven Travel", category: "Mobile", excerpt: "Boutique stays discovery app with offline-first architecture.", problem: "Travelers needed inspiration without constant connectivity.", solution: "Offline-first storage, curated lists, one-tap booking.", tools: ["Swift", "Kotlin", "Firebase"], results: [{ metric: "Editor's", label: "App Store feature" }, { metric: "4.9★", label: "Rating" }, { metric: "180k", label: "Downloads" }], publishedAt: "2024-10-01" },
  ],
  posts: [
    { slug: "designing-for-conversion", title: "Designing for conversion without losing soul", excerpt: "How to build interfaces that perform without sacrificing taste.", date: "Mar 12, 2025", category: "Design", readTime: "6 min", isPublished: true, content: ["Most conversion-focused design feels cynical. It doesn't have to.", "The best-converting interfaces I've shipped were also the ones I was most proud of as a designer. Performance and craft aren't opposites — they're amplifiers.", "Start with the user's actual problem. Strip away anything that doesn't help them solve it. Then layer in personality through typography, motion, and small surprises.", "Conversion comes from clarity. Soul comes from craft. You need both."] },
    { slug: "the-modern-stack", title: "The modern web stack in 2025", excerpt: "What I'm reaching for on every new project.", date: "Feb 28, 2025", category: "Engineering", readTime: "8 min", isPublished: true, content: ["The stack has consolidated. React, TypeScript, Tailwind, and a serverless backend cover 90% of what I build.", "What changed: edge rendering is now the default, not the exception. Type safety extends from the database to the UI. AI is part of the toolchain, not a feature.", "What I left behind: heavy CSS-in-JS runtimes, monolithic CMS platforms, and hand-rolled auth."] },
    { slug: "branding-startups", title: "Branding for startups: what actually matters", excerpt: "Forget the brand book. Here's what to nail in your first 90 days.", date: "Feb 4, 2025", category: "Branding", readTime: "5 min", isPublished: true, content: ["Most startup brand work is performative. You don't need a 60-page guideline doc.", "You need a clear name, a confident wordmark, two fonts, three colors, and a tone of voice your team can actually replicate.", "Everything else can wait until you've earned it."] },
    { slug: "shipping-faster", title: "Shipping faster without burning out", excerpt: "The systems I use to ship weekly while still doing deep work.", date: "Jan 18, 2025", category: "Process", readTime: "7 min", isPublished: true, content: ["Speed isn't about working more hours — it's about removing friction.", "I batch shallow work into mornings, protect afternoons for deep work, and ship something every Friday no matter how small."] },
  ],
  hero: {
    slides: [
      { id: "s1", eyebrow: "Now booking Q3 projects", title: "We design digital experiences that perform.", subtitle: "A modern creative studio building websites, apps, and brands for ambitious teams.", ctaLabel: "Start a Project", ctaHref: "/contact" },
      { id: "s2", eyebrow: "New case study", title: "Northwind: +148% conversion in 6 weeks.", subtitle: "How we rebuilt a legacy storefront on a headless edge stack.", ctaLabel: "Read the story", ctaHref: "/projects/northwind-ecommerce" },
      { id: "s3", eyebrow: "From the journal", title: "The modern web stack in 2025.", subtitle: "What I reach for on every new project — and what I've left behind.", ctaLabel: "Read the post", ctaHref: "/blog/the-modern-stack" },
    ],
    activity: [
      { id: "a1", kind: "project", text: "Shipped Northwind v2 — +148% conversion", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      { id: "a2", kind: "blog", text: "Published “The modern web stack in 2025”", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
      { id: "a3", kind: "service", text: "Now offering tiered packages on every service", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
      { id: "a4", kind: "note", text: "Q3 calendar opening — 2 slots left", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
    ],
  },
  bookings: [
    { id: "b1", name: "Sarah Chen", email: "sarah@acme.io", serviceSlug: "web-development", tierId: "web-pro", message: "Need a redesign of our marketing site before Q4.", status: "new", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: "b2", name: "Marcus Lee", email: "m.lee@helio.app", serviceSlug: "mobile-development", tierId: "mob-cross", message: "Looking for a cross-platform app, MVP in 10 weeks.", status: "in_review", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    { id: "b3", name: "Priya Shah", email: "priya@northwind.co", serviceSlug: "branding", tierId: "brand-id", message: "Refreshing our identity for the European launch.", status: "won", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString() },
  ],
  users: [
    { id: "u1", name: "Alex Morgan", email: "alex@studio.com", role: "admin", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString() },
    { id: "u2", name: "Jamie Rivera", email: "jamie@studio.com", role: "editor", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
  ],
  settings: {
    contact: {
      email: "hello@studio.com",
      location: "Remote — working worldwide",
      socials: { twitter: "https://twitter.com/", instagram: "https://instagram.com/", linkedin: "https://linkedin.com/", github: "https://github.com/" },
    },
    developer: {
      name: "Alex Morgan",
      title: "Founder & Lead Engineer",
      bio: "Designer-engineer with 8+ years building products for ambitious teams. Obsessed with craft, performance, and clarity.",
      avatarUrl: "",
      yearsExperience: 8,
      location: "Lisbon, PT",
    },
    brand: {
      studioName: "Studio",
      tagline: "We design digital experiences that perform.",
    },
  },
};
