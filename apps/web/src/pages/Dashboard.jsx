import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useAuth";
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.user?.name || "User";

  const stats = [
    {
      title: "Total Products",
      value: "2,543",
      icon: Package,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Sales",
      value: "$45,231",
      icon: DollarSign,
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Active Suppliers",
      value: "127",
      icon: Users,
      trend: "+3.1%",
      trendUp: true,
    },
    {
      title: "Monthly Revenue",
      value: "$89,432",
      icon: TrendingUp,
      trend: "+15.3%",
      trendUp: true,
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground shadow-lg">
          <h2 className="text-3xl font-bold">Welcome back, {userName}! 👋</h2>
          <p className="mt-2 text-primary-foreground/90">
            Your comprehensive pharmacy management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className="rounded-2xl border-border shadow-md transition-all hover:shadow-lg"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-sm text-accent">
                    {stat.trend} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Order #{1000 + i}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Medicine {i}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Only {5 - i} units left
                      </p>
                    </div>
                    <span className="rounded-lg bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                      Reorder
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
