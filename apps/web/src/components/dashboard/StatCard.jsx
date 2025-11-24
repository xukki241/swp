import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <Card className="group relative overflow-hidden rounded-lg border-0 shadow-md transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Decorative circle */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />

      <CardHeader className="flex flex-row items-center justify-between pb-1.5 relative z-10">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 transition-all group-hover:bg-primary/20 group-hover:scale-110">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        {stat.loading ? (
          <div className="space-y-1.5">
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ) : (
          <div className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
            {stat.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
