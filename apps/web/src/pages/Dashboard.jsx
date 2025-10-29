import {
  ActivityItem,
  QuickActionCard,
  StatCard,
  WelcomeBanner,
} from "@/components/dashboard";
import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePurchaseOrderReceipts } from "@/hooks/usePurchaseOrders";
import { useMonthlySalesReport } from "@/hooks/useReports";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.user?.name || "User";
  const userRole = currentUser?.user?.role || "staff";

  // Get current month report
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // API expects 1-12, not 0-11

  const {
    data: monthlyReport,
    isLoading: isLoadingReport,
    error: reportError,
  } = useMonthlySalesReport(currentYear, currentMonth);

  // Get Purchase Order Receipts
  const { data: purchaseOrderReceiptsData = [], isLoading: isLoadingReceipts } =
    usePurchaseOrderReceipts({ limit: 5 });

  // Sort receipts by receivedDate descending
  const purchaseOrderReceipts = useMemo(() => {
    if (!purchaseOrderReceiptsData || purchaseOrderReceiptsData.length === 0)
      return [];
    return [...purchaseOrderReceiptsData].sort(
      (a, b) => new Date(b.receivedDate) - new Date(a.receivedDate)
    );
  }, [purchaseOrderReceiptsData]);

  // Calculate stats from report
  const stats = useMemo(() => {
    if (!monthlyReport?.data?.data) {
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

    const reportData = monthlyReport.data.data || monthlyReport.data;
    const { summary, topSellingMedications } = reportData;
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
    const reportData = monthlyReport?.data?.data || monthlyReport?.data;
    if (!reportData?.topSellingMedications) return [];
    return reportData.topSellingMedications.slice(0, 5);
  }, [monthlyReport]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Quick action items with navigation
  const quickActions = [
    {
      title: "New Sale",
      description: "Create order",
      icon: ShoppingCart,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      path: "/sales",
    },
    {
      title: "Inventory",
      description: "Check stock",
      icon: Package,
      color: "bg-green-100",
      iconColor: "text-green-600",
      path: "/inventory/stock",
    },
    {
      title: "Medications",
      description: "Manage products",
      icon: Activity,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      path: "/medications",
    },
    {
      title: "Analytics",
      description: "View reports and analytics",
      icon: BarChart3,
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      path: "/reports",
    },
  ];

  // Mock recent activities - Replace with actual API data
  const recentActivities = [
    {
      id: 1,
      type: "sale",
      description: "New sale order completed",
      time: "5 minutes ago",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "inventory",
      description: "Stock updated for Paracetamol",
      time: "15 minutes ago",
      icon: Package,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "alert",
      description: "Low stock alert: Amoxicillin",
      time: "1 hour ago",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      id: 4,
      type: "user",
      description: "New user registration pending",
      time: "2 hours ago",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Welcome Section */}
        <WelcomeBanner userName={userName} greeting={getGreeting()} />

        {/* Error Display */}
        {reportError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Error Loading Dashboard Data</p>
                  <p className="text-sm">
                    {reportError.message || "Failed to fetch monthly report"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        {/* Main Content Grid - 7:3 Layout */}
        <div className="grid gap-6 lg:grid-cols-10">
          {/* Top Selling Medications - 7 columns */}
          <Card className="lg:col-span-7 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
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
                      className="group flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 font-bold text-white shadow-md">
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

          {/* Purchase Order Receipts - 3 columns */}
          <Card className="lg:col-span-3 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Recent Receipts
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  Latest 5
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReceipts ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl bg-gray-200"
                    />
                  ))}
                </div>
              ) : purchaseOrderReceipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No receipts available
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseOrderReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="group flex flex-col gap-2 rounded-xl border border-border p-3 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            #{receipt.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              receipt.receivedDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-primary truncate">
                          {receipt.supplierName || "Unknown"}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {receipt.receivedByName || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activities Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions - 2 columns */}
          <Card className="lg:col-span-2 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.path}
                    action={action}
                    onClick={() => navigate(action.path)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities - 1 column */}
          <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
