import { ArrowUpRight } from "lucide-react";

export function QuickActionCard({ action, onClick }) {
  const Icon = action.icon;

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-lg border border-border p-3 transition-all hover:border-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
    >
      <div
        className={`rounded-lg ${action.color} p-2.5 transition-transform group-hover:scale-110 group-hover:rotate-3`}
      >
        <Icon className={`h-4 w-4 ${action.iconColor}`} />
      </div>
      <div className="text-left flex-1">
        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
          {action.title}
        </p>
        <p className="text-xs text-muted-foreground">{action.description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
    </button>
  );
}
