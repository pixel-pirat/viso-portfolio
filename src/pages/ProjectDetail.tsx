import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTASection from "@/components/CTASection";
import MediaGallery from "@/components/MediaGallery";
import { useProject } from "@/lib/useData";

const ProjectDetail = () => {
  const { slug } = useParams();
  const { data: project, isLoading } = useProject(slug ?? "");

  if (isLoading) {
    return (
      <section className="container-studio py-32 text-center">
        <h1 className="text-2xl font-display text-muted-foreground animate-pulse">Loading project...</h1>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="container-studio py-32 text-center">
        <h1 className="text-4xl font-display font-bold">Project not found</h1>
        <Button asChild variant="hero" className="mt-6"><Link to="/projects">Back to projects</Link></Button>
      </section>
    );
  }

  return (
    <>
      <section className="container-studio pt-20 pb-12">
        <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← All projects</Link>
        <div className="mt-8 max-w-3xl space-y-6">
          <span className="text-xs uppercase tracking-widest text-primary">{project.category}</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-gradient">{project.title}</h1>
          <p className="text-xl text-muted-foreground">{project.excerpt}</p>
        </div>
      </section>

      <section className="container-studio pb-16">
        <div className="aspect-[16/9] rounded-3xl bg-gradient-to-br from-primary/20 via-secondary to-accent-purple/20 border border-border grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-50" />
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="relative font-display text-8xl md:text-9xl font-bold text-gradient">{project.title.charAt(0)}</span>
          )}
        </div>
      </section>

      {project.gallery && project.gallery.length > 0 && (
        <section className="container-studio pb-8">
          <span className="text-xs uppercase tracking-widest text-primary">Gallery</span>
          <h2 className="text-3xl font-display font-bold mt-3 mb-6">Selected work</h2>
          <MediaGallery items={project.gallery} />
        </section>
      )}

      {(project.problem || project.solution) && (
        <section className="container-studio py-16 grid md:grid-cols-2 gap-6">
          {project.problem && (
            <div className="surface-card p-8">
              <span className="text-xs uppercase tracking-widest text-destructive">Problem</span>
              <p className="text-xl mt-3 leading-relaxed">{project.problem}</p>
            </div>
          )}
          {project.solution && (
            <div className="surface-card p-8">
              <span className="text-xs uppercase tracking-widest text-primary">Solution</span>
              <p className="text-xl mt-3 leading-relaxed">{project.solution}</p>
            </div>
          )}
        </section>
      )}

      {project.tools.length > 0 && (
        <section className="container-studio py-16">
          <span className="text-xs uppercase tracking-widest text-primary">Stack</span>
          <h2 className="text-3xl font-display font-bold mt-3 mb-6">Tools & technologies</h2>
          <div className="flex flex-wrap gap-2">
            {project.tools.map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-secondary border border-border text-sm">{t}</span>
            ))}
          </div>
        </section>
      )}

      {project.results.length > 0 && (
        <section className="container-studio py-16">
          <span className="text-xs uppercase tracking-widest text-primary">Results</span>
          <h2 className="text-3xl font-display font-bold mt-3 mb-8">Impact delivered</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {project.results.map((r) => (
              <div key={r.label} className="surface-card p-8 text-center">
                <div className="text-5xl font-display font-bold text-gradient-brand">{r.metric}</div>
                <div className="text-sm text-muted-foreground mt-2">{r.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <CTASection title="Want results like these?" description="Let's talk about what we can build together." />

      <section className="container-studio pb-24">
        <Button asChild variant="outline"><Link to="/projects">Browse all projects <ArrowRight /></Link></Button>
      </section>
    </>
  );
};

export default ProjectDetail;
