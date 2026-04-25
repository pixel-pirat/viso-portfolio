import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SectionHeader from "@/components/SectionHeader";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast({
        title: "Message sent",
        description: "Thanks — we'll get back within one business day.",
      });
    }, 800);
  };

  return (
    <>
      <section className="container-studio pt-20 pb-12">
        <SectionHeader
          eyebrow="Contact"
          title="Let's start a project."
          description="Tell us a little about what you're building. We'll reply within one business day."
        />
      </section>

      <section className="container-studio pb-24 grid lg:grid-cols-[1fr_360px] gap-8">
        <form onSubmit={onSubmit} className="surface-card p-8 md:p-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" required className="bg-background border-border h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required className="bg-background border-border h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project type</Label>
            <Input id="project" name="project" placeholder="Web app, mobile, branding..." className="bg-background border-border h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Tell us more</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Goals, timeline, budget range — whatever helps us understand."
              required
              rows={6}
              className="bg-background border-border resize-none"
            />
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={submitting} className="w-full md:w-auto">
            {submitting ? "Sending..." : (<>Send message <Send size={16} /></>)}
          </Button>
        </form>

        <aside className="space-y-5">
          <div className="surface-card p-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary border border-border text-primary">
              <Mail size={18} />
            </div>
            <h3 className="font-display font-semibold mt-4">Email</h3>
            <p className="text-sm text-muted-foreground mt-1">hello@studio.com</p>
          </div>
          <div className="surface-card p-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary border border-border text-primary">
              <MapPin size={18} />
            </div>
            <h3 className="font-display font-semibold mt-4">Based in</h3>
            <p className="text-sm text-muted-foreground mt-1">Remote — working worldwide</p>
          </div>
          <div className="surface-card p-6">
            <h3 className="font-display font-semibold">Follow along</h3>
            <div className="flex gap-2 mt-3">
              {["Twitter", "Instagram", "LinkedIn"].map((n) => (
                <a
                  key={n}
                  href="#"
                  className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  {n}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
};

export default Contact;
