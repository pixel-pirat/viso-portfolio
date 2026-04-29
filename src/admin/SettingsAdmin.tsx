import { useStudio } from "@/store/StudioStore";
import { PageHeader } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";

const SettingsAdmin = () => {
  const { state, setState, reset } = useStudio();
  const s = state.settings;

  const onContact = (patch: Partial<typeof s.contact>) =>
    setState((st) => ({ ...st, settings: { ...st.settings, contact: { ...st.settings.contact, ...patch } } }));

  const onSocial = (key: keyof typeof s.contact.socials, value: string) =>
    setState((st) => ({ ...st, settings: { ...st.settings, contact: { ...st.settings.contact, socials: { ...st.settings.contact.socials, [key]: value } } } }));

  const onDev = (patch: Partial<typeof s.developer>) =>
    setState((st) => ({ ...st, settings: { ...st.settings, developer: { ...st.settings.developer, ...patch } } }));

  const onBrand = (patch: Partial<typeof s.brand>) =>
    setState((st) => ({ ...st, settings: { ...st.settings, brand: { ...st.settings.brand, ...patch } } }));

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage contact details, developer profile, and brand info shown across the site."
        actions={
          <Button variant="outline" onClick={() => { if (confirm("Reset all admin data to defaults?")) { reset(); toast({ title: "Reset to defaults" }); } }}>
            <RotateCcw size={14} /> Reset all data
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="surface-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Brand</h2>
          <div><Label>Studio name</Label><Input value={s.brand.studioName} onChange={(e) => onBrand({ studioName: e.target.value })} /></div>
          <div><Label>Tagline</Label><Input value={s.brand.tagline} onChange={(e) => onBrand({ tagline: e.target.value })} /></div>
        </section>

        <section className="surface-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <div><Label>Email</Label><Input type="email" value={s.contact.email} onChange={(e) => onContact({ email: e.target.value })} /></div>
          <div><Label>Location</Label><Input value={s.contact.location} onChange={(e) => onContact({ location: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Twitter</Label><Input value={s.contact.socials.twitter} onChange={(e) => onSocial("twitter", e.target.value)} /></div>
            <div><Label>Instagram</Label><Input value={s.contact.socials.instagram} onChange={(e) => onSocial("instagram", e.target.value)} /></div>
            <div><Label>LinkedIn</Label><Input value={s.contact.socials.linkedin} onChange={(e) => onSocial("linkedin", e.target.value)} /></div>
            <div><Label>GitHub</Label><Input value={s.contact.socials.github} onChange={(e) => onSocial("github", e.target.value)} /></div>
          </div>
        </section>

        <section className="surface-card p-6 space-y-4 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Developer profile</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={s.developer.name} onChange={(e) => onDev({ name: e.target.value })} /></div>
            <div><Label>Title</Label><Input value={s.developer.title} onChange={(e) => onDev({ title: e.target.value })} /></div>
            <div><Label>Years experience</Label><Input type="number" value={s.developer.yearsExperience} onChange={(e) => onDev({ yearsExperience: parseInt(e.target.value || "0") })} /></div>
            <div><Label>Location</Label><Input value={s.developer.location} onChange={(e) => onDev({ location: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Avatar URL</Label><Input value={s.developer.avatarUrl} onChange={(e) => onDev({ avatarUrl: e.target.value })} placeholder="https://..." /></div>
            <div className="md:col-span-2"><Label>Bio</Label><Textarea rows={4} value={s.developer.bio} onChange={(e) => onDev({ bio: e.target.value })} /></div>
          </div>
          <p className="text-xs text-muted-foreground">Changes save automatically to local storage.</p>
        </section>
      </div>
    </>
  );
};

export default SettingsAdmin;
