import AIAnalyticsDialog from "@/components/AIAnalyticsDialog";
import {
  ActivityItem,
  QuickActionCard,
  StatCard,
  WelcomeBanner,
} from "@/components/dashboard";
import { AppLayout } from "@/components/layouts/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useAuth";
import { usePurchaseOrderReceipts } from "@/hooks/usePurchaseOrders";
import { useMonthlySalesReport } from "@/hooks/useReports";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function DashboardPage() {
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.user?.name || "User";

  // AI Analytics Dialog state
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  // Get current month report with month/year selector
  // Default to October 2025 (month with seeded data)
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(10); // October has data

  const {
    data: monthlyReport,
    isLoading: isLoadingReport,
    error: reportError,
  } = useMonthlySalesReport(selectedYear, selectedMonth);

  // Debug logging
  console.log("Dashboard Debug:", {
    selectedYear,
    selectedMonth,
    monthlyReport,
    isLoadingReport,
    reportError,
  });

  // Month navigation helpers
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const years = [2023, 2024, 2025, 2026];

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

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
          title: "Tổng đơn hàng",
          value: "0",
          icon: ShoppingCart,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
        {
          title: "Tổng doanh thu",
          value: "₫0",
          icon: DollarSign,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
        {
          title: "Đơn hàng TB",
          value: "₫0",
          icon: TrendingUp,
          trend: "0%",
          trendUp: true,
          loading: isLoadingReport,
        },
        {
          title: "Sản phẩm bán chạy",
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
        title: "Tổng đơn hàng",
        value: totalOrders.toLocaleString(),
        icon: ShoppingCart,
        trend: "+12.5%",
        trendUp: true,
        loading: false,
      },
      {
        title: "Tổng doanh thu",
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
        title: "Đơn hàng TB",
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
        title: "Sản phẩm bán chạy",
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
      title: "Bán hàng",
      description: "Tạo đơn hàng mới",
      icon: ShoppingCart,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      path: "/sales",
    },
    {
      title: "Kho hàng",
      description: "Kiểm tra tồn kho",
      icon: Package,
      color: "bg-green-100",
      iconColor: "text-green-600",
      path: "/inventory/stock",
    },
    {
      title: "Thuốc",
      description: "Quản lý sản phẩm",
      icon: Activity,
      color: "bg-purple-100",
      iconColor: "text-purple-600",
      path: "/medications",
    },
    {
      title: "Báo cáo",
      description: "Xem báo cáo & phân tích",
      icon: BarChart3,
      color: "bg-gradient-to-br from-orange-100 to-pink-100",
      iconColor: "text-orange-600",
      onClick: () => setIsAIDialogOpen(true), // Open AI dialog instead of navigation
    },
  ];

  // Mock recent activities - Replace with actual API data
  const recentActivities = [
    {
      id: 1,
      type: "sale",
      description: "Đơn bán hàng mới hoàn thành",
      time: "5 phút trước",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "inventory",
      description: "Cập nhật tồn kho Paracetamol",
      time: "15 phút trước",
      icon: Package,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "alert",
      description: "Cảnh báo tồn kho thấp: Amoxicillin",
      time: "1 giờ trước",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      id: 4,
      type: "user",
      description: "Đăng ký người dùng mới đang chờ",
      time: "2 giờ trước",
      icon: Users,
      color: "text-purple-600",
    },
  ];

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <AppLayout title="Tổng quan">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Welcome Section */}
        <WelcomeBanner userName={userName} greeting={getGreeting()} />

        {/* Month/Year Selector */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">
                  Báo cáo tháng:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value.toString()}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={goToCurrentMonth}
                  className="ml-2"
                >
                  Tháng hiện tại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {reportError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Lỗi tải dữ liệu Dashboard</p>
                  <p className="text-sm">
                    {reportError.message || "Không thể tải báo cáo tháng"}
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
                  Thuốc bán chạy nhất
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  Tháng {selectedMonth}/{selectedYear}
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
                    Chưa có dữ liệu bán hàng
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
                          {Number(med.totalQuantity).toLocaleString()} đơn vị
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
                  Phiếu nhập gần đây
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  5 mới nhất
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
                    Chưa có phiếu nhập
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
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {quickActions.map((action, index) => (
                  <QuickActionCard
                    key={action.path || index}
                    action={action}
                    onClick={
                      action.onClick
                        ? action.onClick
                        : () => navigate(action.path)
                    }
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
                Hoạt động gần đây
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

      {/* AI Analytics Dialog */}
      <AIAnalyticsDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
      />
    </AppLayout>
  );
}
