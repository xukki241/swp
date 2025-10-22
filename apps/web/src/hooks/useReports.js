import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reportService } from "@/services/reportService";

// Get all reports
export function useReports(params = {}) {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: () => reportService.getAll(params),
  });
}

// Get report by ID
export function useReport(id) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => reportService.getById(id),
    enabled: !!id,
  });
}

// Create report
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Delete report
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// Generate daily sales report
export function useDailySalesReport(date) {
  return useQuery({
    queryKey: ["reports", "daily", date],
    queryFn: () => reportService.generateDaily(date),
    enabled: !!date,
  });
}

// Generate weekly sales report
export function useWeeklySalesReport(weekStart) {
  return useQuery({
    queryKey: ["reports", "weekly", weekStart],
    queryFn: () => reportService.generateWeekly(weekStart),
    enabled: !!weekStart,
  });
}

// Generate monthly sales report
export function useMonthlySalesReport(year, month) {
  return useQuery({
    queryKey: ["reports", "monthly", year, month],
    queryFn: () => reportService.generateMonthly(year, month),
    enabled: year !== undefined && month !== undefined,
  });
}
