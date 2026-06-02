import { pool } from "./pool";
import bcrypt from "bcryptjs";

export async function runSeed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding database...");
    await client.query("BEGIN");

    // --- Admin account ---
    const hash = await bcrypt.hash("studio2026", 12);
    await client.query(
      `INSERT INTO accounts (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ["Alex Morgan", "alex@studio.com", hash]
    );

    // --- Services ---
    const services = [
      { slug: "web-development", title: "Website / Web App Development", short: "High-performance websites and web apps engineered to convert.", icon: "Code2", sort_order: 1 },
      { slug: "mobile-development", title: "Mobile App Development", short: "Native-feeling iOS and Android apps users actually keep open.", icon: "Smartphone", sort_order: 2 },
      { slug: "social-media", title: "Social Media Management", short: "Strategy, content, and community that builds real audience.", icon: "Share2", sort_order: 3 },
      { slug: "photography-videography", title: "Photography & Videography", short: "Cinematic visuals that elevate your brand presence.", icon: "Camera", sort_order: 4 },
      { slug: "branding", title: "Graphic Design & Branding", short: "Identity systems that look premium across every touchpoint.", icon: "Palette", sort_order: 5 },
    ];

    for (const s of services) {
      const res = await client.query(
        `INSERT INTO services (slug, title, short, icon, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET title=$2, short=$3, icon=$4, sort_order=$5
         RETURNING id`,
        [s.slug, s.title, s.short, s.icon, s.sort_order]
      );
      const serviceId = res.rows[0].id;
      await client.query(`DELETE FROM service_problems WHERE service_id=$1`, [serviceId]);
      await client.query(`DELETE FROM service_process_steps WHERE service_id=$1`, [serviceId]);
      await client.query(`DELETE FROM service_tiers WHERE service_id=$1`, [serviceId]);
    }

    // Service problems
    const problems: Record<string, string[]> = {
      "web-development": ["Slow, outdated sites that lose visitors", "Generic templates that don't reflect your brand", "No clear path from visitor to customer"],
      "mobile-development": ["Slow, buggy apps with poor reviews", "Inconsistent UX across platforms", "No clear retention strategy"],
      "social-media": ["Inconsistent posting and weak engagement", "No content strategy or visual identity", "Time spent without measurable growth"],
      "photography-videography": ["Low-quality photos that hurt credibility", "No video content for modern channels", "Inconsistent visual style"],
      "branding": ["Forgettable visual identity", "Inconsistent design across materials", "No clear brand guidelines"],
    };

    for (const [slug, probs] of Object.entries(problems)) {
      const { rows } = await client.query(`SELECT id FROM services WHERE slug=$1`, [slug]);
      const id = rows[0]?.id;
      if (!id) continue;
      for (let i = 0; i < probs.length; i++) {
        await client.query(
          `INSERT INTO service_problems (service_id, body, position) VALUES ($1,$2,$3)`,
          [id, probs[i], i]
        );
      }
    }

    // Service process steps
    const steps: Record<string, { step: string; body: string }[]> = {
      "web-development": [
        { step: "Discovery", body: "Understand goals, users, and constraints." },
        { step: "Design", body: "Wireframes and high-fidelity UI in your brand." },
        { step: "Development", body: "Modern stack — React, TypeScript, Tailwind." },
        { step: "Launch", body: "Deploy, monitor, and iterate based on data." },
      ],
      "mobile-development": [
        { step: "Strategy", body: "Define MVP scope and user journey." },
        { step: "Prototype", body: "Interactive design before a line of code." },
        { step: "Build", body: "Cross-platform delivery with native polish." },
        { step: "Ship", body: "Store submission, analytics, growth loops." },
      ],
      "social-media": [
        { step: "Audit", body: "Analyze your channels and competitors." },
        { step: "Strategy", body: "Define pillars, tone, and posting cadence." },
        { step: "Create", body: "Produce content and schedule weekly." },
        { step: "Grow", body: "Engage, report, optimize monthly." },
      ],
      "photography-videography": [
        { step: "Concept", body: "Mood, references, shot list." },
        { step: "Production", body: "On-location shoot with pro gear." },
        { step: "Editing", body: "Color grade, sound design, motion." },
        { step: "Delivery", body: "Optimized files for every platform." },
      ],
      "branding": [
        { step: "Discovery", body: "Brand positioning and audience workshop." },
        { step: "Design", body: "Logo, palette, typography, identity." },
        { step: "System", body: "Full guidelines and asset library." },
        { step: "Launch", body: "Roll out across all your touchpoints." },
      ],
    };

    for (const [slug, stepList] of Object.entries(steps)) {
      const { rows } = await client.query(`SELECT id FROM services WHERE slug=$1`, [slug]);
      const id = rows[0]?.id;
      if (!id) continue;
      for (let i = 0; i < stepList.length; i++) {
        await client.query(
          `INSERT INTO service_process_steps (service_id, step, body, position) VALUES ($1,$2,$3,$4)`,
          [id, stepList[i].step, stepList[i].body, i]
        );
      }
    }

    // Service tiers
    const tiers: Record<string, { tier_key: string; name: string; price: string; description: string; features: string[]; highlighted?: boolean; cta_label: string }[]> = {
      "web-development": [
        { tier_key: "web-starter", name: "Starter", price: "$2,500", description: "Landing page or simple marketing site.", features: ["Up to 5 pages", "Responsive design", "Basic SEO", "1 round of revisions"], cta_label: "Book Starter" },
        { tier_key: "web-pro", name: "Pro", price: "$6,500", description: "Full marketing site with CMS.", features: ["Up to 15 pages", "Custom design system", "CMS integration", "Analytics setup", "2 rounds of revisions"], highlighted: true, cta_label: "Book Pro" },
        { tier_key: "web-premium", name: "Premium", price: "from $15k", description: "Web app with custom backend.", features: ["Custom architecture", "Authentication & DB", "Edge deployment", "Ongoing support", "Unlimited revisions"], cta_label: "Book Premium" },
      ],
      "mobile-development": [
        { tier_key: "mob-mvp", name: "MVP", price: "$8,000", description: "Single-platform MVP.", features: ["iOS or Android", "Up to 8 screens", "Basic auth", "Store submission"], cta_label: "Book MVP" },
        { tier_key: "mob-cross", name: "Cross-Platform", price: "$15,000", description: "iOS + Android with shared codebase.", features: ["React Native", "Push notifications", "Analytics", "Backend integration"], highlighted: true, cta_label: "Book Cross-Platform" },
        { tier_key: "mob-scale", name: "Scale", price: "from $30k", description: "Production-grade app + ongoing dev.", features: ["Full feature set", "CI/CD pipeline", "Crash monitoring", "Monthly retainer"], cta_label: "Book Scale" },
      ],
      "social-media": [
        { tier_key: "smm-lite", name: "Lite", price: "$800/mo", description: "1 platform, 8 posts/month.", features: ["Content calendar", "Basic graphics", "Monthly report"], cta_label: "Book Lite" },
        { tier_key: "smm-grow", name: "Growth", price: "$2,000/mo", description: "3 platforms, 20 posts/month.", features: ["Full content production", "Community management", "Bi-weekly reports", "Paid ad strategy"], highlighted: true, cta_label: "Book Growth" },
        { tier_key: "smm-pro", name: "Pro", price: "$4,500/mo", description: "Full-stack social team.", features: ["All platforms", "Video & motion content", "Influencer outreach", "Dedicated manager"], cta_label: "Book Pro" },
      ],
      "photography-videography": [
        { tier_key: "media-half", name: "Half Day", price: "$1,200", description: "4-hour shoot.", features: ["1 location", "30 edited photos", "1 short reel"], cta_label: "Book Half Day" },
        { tier_key: "media-full", name: "Full Day", price: "$2,500", description: "8-hour shoot.", features: ["Multi-location", "60 edited photos", "1 hero film + 5 reels"], highlighted: true, cta_label: "Book Full Day" },
        { tier_key: "media-camp", name: "Campaign", price: "from $7k", description: "Multi-day campaign production.", features: ["Pre-production", "Crew + equipment", "Hero film + cutdowns", "Color grade & sound"], cta_label: "Book Campaign" },
      ],
      "branding": [
        { tier_key: "brand-mark", name: "Wordmark", price: "$1,500", description: "Logo + basic palette.", features: ["3 logo concepts", "Color palette", "Typography pairing"], cta_label: "Book Wordmark" },
        { tier_key: "brand-id", name: "Identity", price: "$4,500", description: "Full brand identity.", features: ["Logo system", "Palette & type", "Brand guidelines", "Stationery"], highlighted: true, cta_label: "Book Identity" },
        { tier_key: "brand-sys", name: "System", price: "from $10k", description: "Enterprise brand system.", features: ["Full strategy", "Visual & verbal identity", "Motion guidelines", "Asset library"], cta_label: "Book System" },
      ],
    };

    for (const [slug, tierList] of Object.entries(tiers)) {
      const { rows } = await client.query(`SELECT id FROM services WHERE slug=$1`, [slug]);
      const id = rows[0]?.id;
      if (!id) continue;
      for (let i = 0; i < tierList.length; i++) {
        const t = tierList[i];
        await client.query(
          `INSERT INTO service_tiers (service_id, tier_key, name, price, description, features, highlighted, cta_label, position)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, t.tier_key, t.name, t.price, t.description, JSON.stringify(t.features), t.highlighted ?? false, t.cta_label, i]
        );
      }
    }

    // --- Projects ---
    const projects = [
      { slug: "northwind-ecommerce", title: "Northwind", category: "Web", excerpt: "A headless commerce platform redesigned for speed and conversion.", problem: "Legacy storefront with 4s load times and 1.2% conversion.", solution: "Headless rebuild with edge rendering, redesigned PDP and checkout.", is_featured: true, published_at: "2025-03-10", tools: ["Next.js", "Shopify", "Tailwind", "Vercel"], results: [{ metric: "+148%", label: "Conversion rate" }, { metric: "0.6s", label: "Avg. page load" }, { metric: "+62%", label: "Mobile revenue" }] },
      { slug: "lumen-mobile", title: "Lumen Health", category: "Mobile", excerpt: "Habit-tracking app with adaptive coaching and streak mechanics.", problem: "Existing wellness app saw 80% drop-off in week one.", solution: "Redesigned onboarding, gamified streaks, AI-driven nudges.", is_featured: true, published_at: "2025-02-20", tools: ["React Native", "Expo", "Supabase", "OpenAI"], results: [{ metric: "4.8★", label: "App Store rating" }, { metric: "+210%", label: "D7 retention" }, { metric: "92k", label: "Active users" }] },
      { slug: "atlas-brand", title: "Atlas Studio", category: "Branding", excerpt: "Full identity system for an architecture studio entering Europe.", problem: "Outgrowing original identity, needed gravitas for new market.", solution: "Editorial wordmark, monochrome palette, motion guidelines.", is_featured: false, published_at: "2025-01-15", tools: ["Figma", "After Effects", "Print"], results: [{ metric: "12", label: "Touchpoints redesigned" }, { metric: "3", label: "Industry awards" }, { metric: "+40%", label: "Inbound leads" }] },
      { slug: "verge-campaign", title: "Verge Apparel", category: "Media", excerpt: "Launch campaign film and social cutdowns for SS25 collection.", problem: "New drop with no campaign assets two weeks from launch.", solution: "Sprint shoot, hero film, 30+ social cutdowns delivered in 8 days.", is_featured: false, published_at: "2024-12-05", tools: ["RED Komodo", "DaVinci Resolve", "Photoshop"], results: [{ metric: "2.1M", label: "Organic views" }, { metric: "Sold out", label: "In 72 hours" }, { metric: "+18k", label: "New followers" }] },
      { slug: "kindred-saas", title: "Kindred", category: "Web", excerpt: "B2B SaaS marketing site with interactive product tours.", problem: "Demo requests stalling at the pricing page.", solution: "Interactive product tour, repositioned pricing, social proof.", is_featured: false, published_at: "2024-11-22", tools: ["React", "Framer Motion", "Sanity"], results: [{ metric: "+86%", label: "Demo requests" }, { metric: "-31%", label: "Bounce rate" }, { metric: "98", label: "Lighthouse score" }] },
      { slug: "haven-mobile", title: "Haven Travel", category: "Mobile", excerpt: "Boutique stays discovery app with offline-first architecture.", problem: "Travelers needed inspiration without constant connectivity.", solution: "Offline-first storage, curated lists, one-tap booking.", is_featured: false, published_at: "2024-10-01", tools: ["Swift", "Kotlin", "Firebase"], results: [{ metric: "Editor's", label: "App Store feature" }, { metric: "4.9★", label: "Rating" }, { metric: "180k", label: "Downloads" }] },
    ];

    for (const p of projects) {
      const res = await client.query(
        `INSERT INTO projects (slug, title, category, excerpt, problem, solution, is_featured, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (slug) DO UPDATE SET title=$2, category=$3, excerpt=$4, problem=$5, solution=$6, is_featured=$7, published_at=$8
         RETURNING id`,
        [p.slug, p.title, p.category, p.excerpt, p.problem, p.solution, p.is_featured, p.published_at]
      );
      const pid = res.rows[0].id;
      await client.query(`DELETE FROM project_tools WHERE project_id=$1`, [pid]);
      await client.query(`DELETE FROM project_results WHERE project_id=$1`, [pid]);
      for (let i = 0; i < p.tools.length; i++) {
        await client.query(`INSERT INTO project_tools (project_id, name, position) VALUES ($1,$2,$3)`, [pid, p.tools[i], i]);
      }
      for (let i = 0; i < p.results.length; i++) {
        await client.query(`INSERT INTO project_results (project_id, metric, label, position) VALUES ($1,$2,$3,$4)`, [pid, p.results[i].metric, p.results[i].label, i]);
      }
    }

    // --- Blog posts ---
    const posts = [
      { slug: "designing-for-conversion", title: "Designing for conversion without losing soul", excerpt: "How to build interfaces that perform without sacrificing taste.", category: "Design", read_time: "6 min", published_at: "2025-03-12", content: ["Most conversion-focused design feels cynical. It doesn't have to.", "The best-converting interfaces I've shipped were also the ones I was most proud of as a designer. Performance and craft aren't opposites — they're amplifiers.", "Start with the user's actual problem. Strip away anything that doesn't help them solve it. Then layer in personality through typography, motion, and small surprises.", "Conversion comes from clarity. Soul comes from craft. You need both."] },
      { slug: "the-modern-stack", title: "The modern web stack in 2025", excerpt: "What I'm reaching for on every new project.", category: "Engineering", read_time: "8 min", published_at: "2025-02-28", content: ["The stack has consolidated. React, TypeScript, Tailwind, and a serverless backend cover 90% of what I build.", "What changed: edge rendering is now the default, not the exception. Type safety extends from the database to the UI. AI is part of the toolchain, not a feature.", "What I left behind: heavy CSS-in-JS runtimes, monolithic CMS platforms, and hand-rolled auth."] },
      { slug: "branding-startups", title: "Branding for startups: what actually matters", excerpt: "Forget the brand book. Here's what to nail in your first 90 days.", category: "Branding", read_time: "5 min", published_at: "2025-02-04", content: ["Most startup brand work is performative. You don't need a 60-page guideline doc.", "You need a clear name, a confident wordmark, two fonts, three colors, and a tone of voice your team can actually replicate.", "Everything else can wait until you've earned it."] },
      { slug: "shipping-faster", title: "Shipping faster without burning out", excerpt: "The systems I use to ship weekly while still doing deep work.", category: "Process", read_time: "7 min", published_at: "2025-01-18", content: ["Speed isn't about working more hours — it's about removing friction.", "I batch shallow work into mornings, protect afternoons for deep work, and ship something every Friday no matter how small."] },
    ];

    for (const p of posts) {
      await client.query(
        `INSERT INTO blog_posts (slug, title, excerpt, content, category, read_time, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (slug) DO UPDATE SET title=$2, excerpt=$3, content=$4, category=$5, read_time=$6, published_at=$7`,
        [p.slug, p.title, p.excerpt, JSON.stringify(p.content), p.category, p.read_time, p.published_at]
      );
    }

    // --- Hero slides ---
    const slideCount = await client.query(`SELECT COUNT(*) FROM hero_slides`);
    if (parseInt(slideCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO hero_slides (eyebrow, title, subtitle, cta_label, cta_href, sort_order) VALUES
        ($1,$2,$3,$4,$5,0),($6,$7,$8,$9,$10,1),($11,$12,$13,$14,$15,2)`,
        [
          "Now booking Q3 projects", "We design digital experiences that perform.", "A modern creative studio building websites, apps, and brands for ambitious teams.", "Start a Project", "/contact",
          "New case study", "Northwind: +148% conversion in 6 weeks.", "How we rebuilt a legacy storefront on a headless edge stack.", "Read the story", "/projects/northwind-ecommerce",
          "From the journal", "The modern web stack in 2025.", "What I reach for on every new project — and what I've left behind.", "Read the post", "/blog/the-modern-stack",
        ]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
