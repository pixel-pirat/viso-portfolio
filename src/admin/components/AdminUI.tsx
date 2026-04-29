import { ReactNode } from "react";

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
    <div>
      <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
    </div>
    {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="surface-card p-5">
    <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display text-3xl font-bold mt-2 text-gradient-brand">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
  </div>
);

export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="surface-card p-10 text-center">
    <h3 className="font-display text-lg font-semibold">{title}</h3>
    {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
    {action && <div className="mt-5 flex justify-center">{action}</div>}
  </div>
);
