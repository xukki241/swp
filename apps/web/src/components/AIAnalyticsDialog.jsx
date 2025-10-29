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
        aiAnalysisService.getQuickInsights(30), // Last 30 days for quick insights
      ]);

      setRecommendations(recData);
      setQuickInsights(insightsData.data);
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <DialogTitle>AI-Powered Purchase Analytics</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={daysBack}
                onChange={(e) => setDaysBack(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">
                            Total Revenue
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {quickInsights?.summary.totalRevenue?.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            đ
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">
                            Products Sold
                          </p>
                          <p className="text-2xl font-bold text-green-900">
                            {quickInsights?.summary.totalQuantitySold?.toLocaleString()}
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">
                            Investment Needed
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            {recommendations.data.financialProjection?.estimatedTotalInvestment?.toLocaleString(
                              "vi-VN"
                            ) || "N/A"}{" "}
                            đ
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

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
