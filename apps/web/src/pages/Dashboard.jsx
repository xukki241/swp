import { useMemo } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import { useMonthlySalesReport } from "@/hooks/useReports";

export default function DashboardPage() {
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.user?.name || "User";

  // Get current month report
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const { data: monthlyReport, isLoading: isLoadingReport } =
    useMonthlySalesReport(currentYear, currentMonth);

  // Calculate stats from report
  const stats = useMemo(() => {
    if (!monthlyReport?.data) {
      return [
        {
          title: "Total Orders",
          value: "0",
          icon: ShoppingCart,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
        {
          title: "Total Revenue",
          value: "₫0",
          icon: DollarSign,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
        {
          title: "Average Order",
          value: "₫0",
          icon: TrendingUp,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
        {
          title: "Top Products",
          value: "0",
          icon: Package,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
      ];
    }

    const { summary, topSellingMedications } = monthlyReport.data;
    const totalOrders = summary?.totalOrders || 0;
    const totalRevenue = summary?.totalRevenue || 0;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const topProducts = topSellingMedications?.length || 0;

    return [
      {
        title: "Total Orders",
        value: totalOrders.toLocaleString(),
        icon: ShoppingCart,
        trend: "+12.5%",
        trendUp: true,
        loading: false,
      },
      {
        title: "Total Revenue",
        value: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(totalRevenue),
        icon: DollarSign,
        trend: "+18.2%",
        trendUp: true,
        loading: false,
      },
      {
        title: "Average Order",
        value: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(avgOrder),
        icon: TrendingUp,
        trend: "+5.4%",
        trendUp: true,
        loading: false,
      },
      {
        title: "Top Products",
        value: topProducts.toString(),
        icon: Package,
        trend: "+3.1%",
        trendUp: true,
        loading: false,
      },
    ];
  }, [monthlyReport, isLoadingReport]);

  // Top selling medications
  const topMedications = useMemo(() => {
    if (!monthlyReport?.data?.topSellingMedications) return [];
    return monthlyReport.data.topSellingMedications.slice(0, 5);
  }, [monthlyReport]);

  // Sales by status
  const salesByStatus = useMemo(() => {
    if (!monthlyReport?.data?.salesByStatus) return [];
    return monthlyReport.data.salesByStatus;
  }, [monthlyReport]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      processing: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold">
                Welcome back, {userName}! 👋
              </h2>
              <p className="mt-2 text-lg text-primary-foreground/90">
                Here's what's happening with your pharmacy today
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {currentDate.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
            return (
              <Card
                key={stat.title}
                className="group relative overflow-hidden rounded-2xl border-0 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {stat.loading ? (
                    <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground">
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
                        <span className="text-muted-foreground">
                          from last month
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Selling Medications - Takes 2 columns */}
          <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">
                  Top Selling Medications
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  This Month
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReport ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl bg-gray-200"
                    />
                  ))}
                </div>
              ) : topMedications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No sales data available
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topMedications.map((med, index) => (
                    <div
                      key={med.medicationId}
                      className="group flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {med.medicationName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {med.variantName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {formatCurrency(med.totalRevenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Number(med.totalQuantity).toLocaleString()} units
                          sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales by Status - Takes 1 column */}
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Sales by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReport ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl bg-gray-200"
                    />
                  ))}
                </div>
              ) : salesByStatus.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No status data available
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salesByStatus.map((status) => (
                    <div
                      key={status.status}
                      className="flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:border-primary/50"
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(status.status)}
                        >
                          {status.status?.toUpperCase()}
                        </Badge>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {Number(status.count).toLocaleString()} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatCurrency(status.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <button className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary hover:bg-primary/5">
                <div className="rounded-lg bg-blue-100 p-3">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">New Sale</p>
                  <p className="text-sm text-muted-foreground">Create order</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>

              <button className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary hover:bg-primary/5">
                <div className="rounded-lg bg-green-100 p-3">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Inventory</p>
                  <p className="text-sm text-muted-foreground">Check stock</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>

              <button className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary hover:bg-primary/5">
                <div className="rounded-lg bg-purple-100 p-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Reports</p>
                  <p className="text-sm text-muted-foreground">
                    View analytics
                  </p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>

              <button className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-all hover:border-primary hover:bg-primary/5">
                <div className="rounded-lg bg-orange-100 p-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Alerts</p>
                  <p className="text-sm text-muted-foreground">View warnings</p>
                </div>
                <ArrowUpRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
