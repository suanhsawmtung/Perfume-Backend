import { ServiceResponseT } from "../../types/common";
import {
  ChartDataT,
  DashboardDataT,
  GenderSaleT,
  LowStockItemT,
  TopSellerT
} from "../../types/dashboard";

export interface IDashboardService {
  getDashboardData(query: any): Promise<ServiceResponseT<DashboardDataT>>;
  calculateFinancials(startDate: Date, endDate: Date): Promise<{ revenue: number; expense: number; profit: number }>;
  calculateGenderSales(startDate: Date, endDate: Date): Promise<GenderSaleT[]>;
  calculateTopSellers(startDate: Date, endDate: Date): Promise<TopSellerT[]>;
  fetchLowStockAlerts(): Promise<LowStockItemT[]>;
  calculateChartData(startDate: Date, endDate: Date): Promise<ChartDataT[]>;
}
