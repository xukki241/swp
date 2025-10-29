import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export function StatCard({ stat }) {
  const Icon = stat.icon;
  const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Decorative circle */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-150" />

      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <div className="rounded-xl bg-primary/10 p-3 transition-all group-hover:bg-primary/20 group-hover:scale-110">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {stat.loading ? (
          <div className="space-y-2">
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-foreground transition-colors group-hover:text-primary">
              {stat.value}
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <TrendIcon
                className={`h-4 w-4 ${
                  stat.trendUp ? "text-green-600" : "text-red-600"
                }`}
              />
              <span
                className={`font-medium ${
                  stat.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.trend}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
