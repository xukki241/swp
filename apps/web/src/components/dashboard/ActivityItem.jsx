export function ActivityItem({ activity }) {
  const Icon = activity.icon;

  return (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0 hover:bg-muted/50 -mx-3 px-3 py-2 rounded-lg transition-all hover:scale-[1.01] cursor-pointer">
      <div className="mt-0.5">
        <div
          className={`rounded-full p-2 bg-${activity.color.replace("text-", "")}/10`}
        >
          <Icon className={`h-4 w-4 ${activity.color}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
          {activity.time}
        </p>
      </div>
    </div>
  );
}
