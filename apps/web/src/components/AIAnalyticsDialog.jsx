import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  Brain,
  Calendar,
  DollarSign,
  Loader2,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { aiAnalysisService } from "@/services/aiAnalysisService";

// Format large numbers with K, M, B suffixes
const formatCompactNumber = (num) => {
  if (!num) return "0";
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return num.toString();
};

export default function AIAnalyticsDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [quickInsights, setQuickInsights] = useState(null);
  const [daysBack, setDaysBack] = useState(90);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, daysBack]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both recommendations and quick insights in parallel
      const [recData, insightsData] = await Promise.all([
        aiAnalysisService.getPurchaseRecommendations(daysBack),
        aiAnalysisService.getQuickInsights(daysBack), // Use same daysBack parameter
      ]);

      setRecommendations(recData);
      console.log(recData);
      setQuickInsights(insightsData.data);
      console.log(insightsData?.data?.summary);
    } catch (error) {
      console.error("Error loading AI analysis:", error);
      toast.error("Failed to load AI analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "INCREASING":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "DECREASING":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowUp className="w-4 h-4 text-gray-600" />;
    }
  };

  const getWarningIcon = (type) => {
    switch (type) {
      case "EXPIRING":
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case "LOW_STOCK":
        return <Package className="w-5 h-5 text-red-600" />;
      case "SLOW_MOVING":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-[90vw] max-h-[90vh] overflow-y-auto"
        style={{ minWidth: "1600px" }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <DialogTitle className="text-xl">
                AI-Powered Purchase Analytics
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={daysBack}
                onChange={(e) => setDaysBack(Number(e.target.value))}
                className="text-sm border rounded px-3 py-1.5"
              >
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
          <DialogDescription>
            AI-powered insights and recommendations based on your sales and
            inventory data
          </DialogDescription>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">ℹ️ Lưu ý:</span> Phân tích AI chỉ
              là tham khảo và không thay thế được quyết định kinh doanh thực tế.
              Vui lòng kết hợp với kinh nghiệm và kiến thức chuyên ngành của
              bạn.
            </p>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-sm text-gray-600">
                AI is analyzing your data...
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="warnings">Warnings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {recommendations?.data && (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                          Total Revenue
                        </p>
                        <DollarSign className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-2xl font-bold text-blue-900">
                            {formatCompactNumber(
                              quickInsights?.summary.totalRevenue
                            )}
                          </p>
                          <span className="text-sm text-blue-700 font-medium">
                            đ
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200/50">
                        <p className="text-[10px] text-blue-600 leading-tight">
                          {quickInsights?.summary.totalRevenue?.toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VND
                        </p>
                        <p className="text-[10px] text-blue-500 mt-0.5">
                          {quickInsights?.summary.totalOrders || 0} orders
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                          Products Sold
                        </p>
                        <Package className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-2xl font-bold text-green-900">
                            {formatCompactNumber(
                              quickInsights?.summary.totalQuantitySold
                            )}
                          </p>
                          <span className="text-sm text-green-700 font-medium">
                            units
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-green-200/50">
                        <p className="text-[10px] text-green-600 leading-tight">
                          {quickInsights?.summary.totalQuantitySold?.toLocaleString()}{" "}
                          total
                        </p>
                        <p className="text-[10px] text-green-500 mt-0.5">
                          {quickInsights?.summary.totalProducts || 0} variants
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">
                          Avg Order Value
                        </p>
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-2xl font-bold text-orange-900">
                            {formatCompactNumber(
                              quickInsights?.summary.averageOrderValue
                            )}
                          </p>
                          <span className="text-sm text-orange-700 font-medium">
                            đ
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-orange-200/50">
                        <p className="text-[10px] text-orange-600 leading-tight">
                          {quickInsights?.summary.averageOrderValue?.toLocaleString(
                            "vi-VN",
                            { maximumFractionDigits: 0 }
                          )}{" "}
                          VND
                        </p>
                        <p className="text-[10px] text-orange-500 mt-0.5">
                          per transaction
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">
                          Investment Needed
                        </p>
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1.5">
                          <p className="text-2xl font-bold text-purple-900">
                            {formatCompactNumber(
                              recommendations.data.financialProjection
                                ?.estimatedTotalInvestment
                            )}
                          </p>
                          <span className="text-sm text-purple-700 font-medium">
                            đ
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-purple-200/50">
                        <p className="text-[10px] text-purple-600 leading-tight">
                          {recommendations.data.financialProjection?.estimatedTotalInvestment?.toLocaleString(
                            "vi-VN"
                          ) || "N/A"}{" "}
                          VND
                        </p>
                        <p className="text-[10px] text-purple-500 mt-0.5">
                          {recommendations.data.priorityRecommendations
                            ?.length || 0}{" "}
                          items
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Forecasting Methodology */}
                  {recommendations.data.forecastingMethodology && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        Phương Pháp Dự Báo
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Phương pháp:
                          </p>
                          <p className="text-gray-700">
                            {recommendations.data.forecastingMethodology.method}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Công thức tính toán:
                          </p>
                          <p className="text-gray-700 font-mono text-sm bg-white p-2 rounded border">
                            {
                              recommendations.data.forecastingMethodology
                                .calculation
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Nguyên tắc áp dụng:
                          </p>
                          <ul className="space-y-1">
                            {recommendations.data.forecastingMethodology.principles?.map(
                              (principle, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="text-blue-600">•</span>
                                  <span className="text-gray-700">
                                    {principle}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Tiêu chuẩn:
                          </p>
                          <ul className="space-y-1">
                            {recommendations.data.forecastingMethodology.standards?.map(
                              (standard, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="text-blue-600">•</span>
                                  <span className="text-gray-700">
                                    {standard}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-1">
                            Lý do chọn phương pháp:
                          </p>
                          <p className="text-gray-700 text-sm">
                            {
                              recommendations.data.forecastingMethodology
                                .rationale
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overall Assessment */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Assessment
                    </h3>
                    <p className="text-gray-700">
                      {recommendations.data.summary?.overallAssessment}
                    </p>
                  </div>

                  {/* Key Insights */}
                  <div className="p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
                    <ul className="space-y-2">
                      {recommendations.data.summary?.keyInsights?.map(
                        (insight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2" />
                            <span className="text-gray-700">{insight}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-3">
              {recommendations?.data?.priorityRecommendations?.map(
                (rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm px-2 py-0.5 rounded bg-white">
                            {rec.priority}
                          </span>
                          <h4 className="font-bold">{rec.productName}</h4>
                        </div>
                        <div className="text-sm space-y-1 mt-2">
                          <p>
                            <strong>Current Stock:</strong> {rec.currentStock}{" "}
                            units
                          </p>
                          <p>
                            <strong>Recommended Quantity:</strong>{" "}
                            <span className="font-bold text-lg">
                              {rec.recommendedQuantity}
                            </span>{" "}
                            units
                          </p>
                          <p>
                            <strong>Estimated Cost:</strong>{" "}
                            {rec.estimatedCost?.toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <p className="text-sm">
                        <strong>Reasoning:</strong> {rec.reasoning}
                      </p>
                      <p className="text-sm">
                        <strong>Expected Benefit:</strong> {rec.expectedBenefit}
                      </p>
                    </div>
                  </div>
                )
              )}
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-3">
              {recommendations?.data?.categoryInsights?.map((category, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTrendIcon(category.trend)}
                        <h4 className="font-bold">{category.category}</h4>
                      </div>
                      <p className="text-sm text-gray-700">
                        {category.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Financial Projection */}
              {recommendations?.data?.financialProjection && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Financial Projection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Investment</p>
                      <p className="text-xl font-bold text-gray-900">
                        {recommendations.data.financialProjection.estimatedTotalInvestment?.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Expected ROI</p>
                      <p className="text-xl font-bold text-green-600">
                        {recommendations.data.financialProjection.expectedROI}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payback Period</p>
                      <p className="text-xl font-bold text-blue-600">
                        {recommendations.data.financialProjection.paybackPeriod}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Warnings Tab */}
            <TabsContent value="warnings" className="space-y-3">
              {recommendations?.data?.warnings?.map((warning, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-start gap-3">
                    {getWarningIcon(warning.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-200 text-orange-800">
                          {warning.type}
                        </span>
                        <h4 className="font-bold">{warning.productName}</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {warning.message}
                      </p>
                      <p className="text-sm font-medium text-orange-800">
                        → {warning.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {quickInsights?.criticalActions?.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-lg mb-3 text-red-900">
                    Critical Actions Required
                  </h3>
                  <div className="space-y-2">
                    {quickInsights.criticalActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded border border-red-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
                            {action.type}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{action.product}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {action.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
