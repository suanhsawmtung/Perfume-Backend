export interface FinancialStatsT {
  revenue: number;
  expense: number;
  profit: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
}

export interface GenderSaleT {
  gender: string;
  sales: number;
}

export interface TopSellerT {
  id: number;
  name: string;
  brand: string;
  variant: string;
  sales: number;
  revenue: number;
}

export interface LowStockItemT {
  id: number;
  name: string;
  variant: string;
  stock: number;
  threshold: number;
}

export interface ChartDataT {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface DashboardDataT {
  financialStats: FinancialStatsT;
  genderSales: GenderSaleT[];
  topSellers: TopSellerT[];
  lowStockItems: LowStockItemT[];
  chartData: ChartDataT[];
}