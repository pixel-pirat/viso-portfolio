import { useState } from "react";
import { X, Play } from "lucide-react";
import type { MediaItem } from "@/store/types";
import { cn } from "@/lib/utils";

/**
 * Read-only media gallery with lightbox.
 * Used on the public ProjectDetail page when `project.gallery` is non-empty.
 */
const MediaGallery = ({ items, className }: { items: MediaItem[]; className?: string }) => {
  const [active, setActive] = useState<MediaItem | null>(null);
  if (!items.length) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-secondary"
          >
            {m.kind === "image" ? (
              <img src={m.url} alt={m.caption ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
            ) : (
              <div className="grid place-items-center h-full w-full text-muted-foreground">
                <Play size={28} />
              </div>
            )}
            {m.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs px-3 py-2 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                {m.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/85 backdrop-blur-sm p-6 animate-fade-in-slow"
          onClick={() => setActive(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setActive(null)}
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={18} />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {active.kind === "image" ? (
              <img src={active.url} alt={active.caption ?? ""} className="w-full max-h-[80vh] object-contain rounded-lg" />
            ) : (
              <div className="aspect-video grid place-items-center bg-secondary rounded-lg text-muted-foreground">
                Video preview placeholder
              </div>
            )}
            {active.caption && <div className="text-white/80 text-sm mt-3 text-center">{active.caption}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
