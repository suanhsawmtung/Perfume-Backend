import { calculateChartData, calculateFinancials, calculateGenderSales, calculateTopSellers, DashboardFilter, fetchLowStockAlerts, getDashboardDateRange, getLastSixMonthsRange } from "./dashboard.helpers";

export const getDashboardData = async (filter: DashboardFilter) => {
  const { current, compare } = getDashboardDateRange(filter);
  const sixMonthsRange = getLastSixMonthsRange();

  const [
    currentFinancials,
    compareFinancials,
    genderSales,
    topSellers,
    lowStockItems,
    chartData,
  ] = await Promise.all([
    calculateFinancials(current.startDate, current.endDate),
    calculateFinancials(compare.startDate, compare.endDate),
    calculateGenderSales(current.startDate, current.endDate),
    calculateTopSellers(current.startDate, current.endDate),
    fetchLowStockAlerts(),
    calculateChartData(sixMonthsRange.startDate, sixMonthsRange.endDate),
  ]);

  const calculateChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number(((curr - prev) / prev * 100).toFixed(1));
  };

  const financialStats = {
    ...currentFinancials,
    revenueChange: calculateChange(currentFinancials.revenue, compareFinancials.revenue),
    expenseChange: calculateChange(currentFinancials.expense, compareFinancials.expense),
    profitChange: calculateChange(currentFinancials.profit, compareFinancials.profit),
  };

  return {
    financialStats,
    genderSales,
    topSellers,
    lowStockItems,
    chartData,
  };
};
