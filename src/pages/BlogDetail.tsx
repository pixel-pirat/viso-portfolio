import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CTASection from "@/components/CTASection";
import { posts } from "@/data/site";

const BlogDetail = () => {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <section className="container-studio py-32 text-center">
        <h1 className="text-4xl font-display font-bold">Post not found</h1>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/blog">Back to journal</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <article className="container-studio max-w-3xl pt-20 pb-16">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Journal
        </Link>

        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-primary uppercase tracking-widest">{post.category}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-gradient leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground">{post.excerpt}</p>
        </div>

        <div className="aspect-[16/9] mt-12 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary to-accent-purple/20 border border-border grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <span className="relative font-display text-7xl font-bold text-gradient">
            {post.title.charAt(0)}
          </span>
        </div>

        <div className="mt-12 space-y-6 text-lg leading-relaxed text-muted-foreground">
          {post.content.map((para, i) => (
            <p key={i} className={i === 0 ? "text-foreground text-xl" : ""}>
              {para}
            </p>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Thanks for reading.</span>
          <Button asChild variant="outline" size="sm">
            <Link to="/blog">More posts</Link>
          </Button>
        </div>
      </article>

      <CTASection />
    </>
  );
};

export default BlogDetail;
