import { useRef, useState } from "react";
import { useStudio } from "@/store/StudioStore";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { RotateCcw, Upload, Trash2, Save } from "lucide-react";
import { readImageDownscaled, AVATAR_MAX_DIM } from "@/lib/uploads";

const SettingsAdmin = () => {
  const { state, setState, reset } = useStudio();
  const { saveSettings } = useApi();
  const s = state.settings;

  // Local draft — only pushed to DB on Save
  const [draft, setDraft] = useState(s);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(s);

  const onContact = (patch: Partial<typeof s.contact>) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, ...patch } }));

  const onSocial = (key: keyof typeof s.contact.socials, value: string) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, socials: { ...d.contact.socials, [key]: value } } }));

  const onDev = (patch: Partial<typeof s.developer>) =>
    setDraft((d) => ({ ...d, developer: { ...d.developer, ...patch } }));

  const onBrand = (patch: Partial<typeof s.brand>) =>
    setDraft((d) => ({ ...d, brand: { ...d.brand, ...patch } }));

  const handleSave = async () => {
    await saveSettings(draft);
    toast({ title: "Settings saved" });
  };

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
          <div><Label>Brand name</Label><Input value={draft.brand.studioName} onChange={(e) => onBrand({ studioName: e.target.value })} /></div>
          <div><Label>Legal name (used on documents)</Label><Input value={draft.brand.legalName} onChange={(e) => onBrand({ legalName: e.target.value })} /></div>
          <div><Label>Tagline</Label><Input value={draft.brand.tagline} onChange={(e) => onBrand({ tagline: e.target.value })} /></div>
        </section>

        <section className="surface-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <div><Label>Email</Label><Input type="email" value={draft.contact.email} onChange={(e) => onContact({ email: e.target.value })} /></div>
          <div><Label>Location</Label><Input value={draft.contact.location} onChange={(e) => onContact({ location: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Twitter</Label><Input value={draft.contact.socials.twitter} onChange={(e) => onSocial("twitter", e.target.value)} /></div>
            <div><Label>Instagram</Label><Input value={draft.contact.socials.instagram} onChange={(e) => onSocial("instagram", e.target.value)} /></div>
            <div><Label>LinkedIn</Label><Input value={draft.contact.socials.linkedin} onChange={(e) => onSocial("linkedin", e.target.value)} /></div>
            <div><Label>GitHub</Label><Input value={draft.contact.socials.github} onChange={(e) => onSocial("github", e.target.value)} /></div>
          </div>
        </section>

        <section className="surface-card p-6 space-y-4 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Developer profile</h2>
          <AvatarField
            value={draft.developer.avatarUrl}
            name={draft.developer.name}
            onChange={(url) => onDev({ avatarUrl: url })}
          />
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={draft.developer.name} onChange={(e) => onDev({ name: e.target.value })} /></div>
            <div><Label>Title</Label><Input value={draft.developer.title} onChange={(e) => onDev({ title: e.target.value })} /></div>
            <div><Label>Years experience</Label><Input type="number" value={draft.developer.yearsExperience} onChange={(e) => onDev({ yearsExperience: parseInt(e.target.value || "0") })} /></div>
            <div><Label>Location</Label><Input value={draft.developer.location} onChange={(e) => onDev({ location: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Bio</Label><Textarea rows={4} value={draft.developer.bio} onChange={(e) => onDev({ bio: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="hero" onClick={handleSave} disabled={!isDirty}>
              <Save size={14} /> Save changes
            </Button>
            {isDirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          </div>
        </section>
      </div>
    </>
  );
};

const AvatarField = ({
  value, name, onChange,
}: { value: string; name: string; onChange: (v: string) => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  const initials = name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "A";

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await readImageDownscaled(file, AVATAR_MAX_DIM, 0.85);
      onChange(dataUrl);
      toast({ title: "Avatar updated" });
    } catch (e) {
      toast({ title: "Upload failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-full overflow-hidden border border-border bg-secondary grid place-items-center shrink-0">
        {value
          ? <img src={value} alt={`${name} avatar`} className="h-full w-full object-cover" />
          : <span className="font-display font-bold text-2xl text-muted-foreground">{initials}</span>}
      </div>
      <div className="flex-1 space-y-2">
        <Label>Profile photo</Label>
        <div className="flex flex-wrap gap-2">
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()}>
            <Upload size={14} /> Upload image
          </Button>
          {value && (
            <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => onChange("")}>
              <Trash2 size={14} /> Remove
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">Resized to {AVATAR_MAX_DIM}px and stored locally.</p>
      </div>
    </div>
  );
};

export default SettingsAdmin;
