import { InventoryType, TransactionDirection } from "@prisma/client";
import moment from "moment";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  ChartDataT,
  DashboardDataT,
  GenderSaleT,
  LowStockItemT,
  TopSellerT
} from "../../types/dashboard";
import {
  getDashboardDateRange,
  getLastSixMonthsRange,
  parseDashboardQueryParams
} from "./dashboard.helpers";
import { IDashboardService } from "./dashboard.interface";

export class DashboardService implements IDashboardService {
  async getDashboardData(
    query: any
  ): Promise<ServiceResponseT<DashboardDataT>> {
    const filter = parseDashboardQueryParams(query);
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
      this.calculateFinancials(current.startDate, current.endDate),
      this.calculateFinancials(compare.startDate, compare.endDate),
      this.calculateGenderSales(current.startDate, current.endDate),
      this.calculateTopSellers(current.startDate, current.endDate),
      this.fetchLowStockAlerts(),
      this.calculateChartData(sixMonthsRange.startDate, sixMonthsRange.endDate),
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
      success: true,
      data: {
        financialStats,
        genderSales,
        topSellers,
        lowStockItems,
        chartData,
      },
      message: null,
    };
  }

  async calculateFinancials(
    startDate: Date,
    endDate: Date
  ): Promise<{ revenue: number; expense: number; profit: number }> {
    const transactions = await prisma.transaction.groupBy({
      by: ["direction"],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      _sum: {
        amount: true,
      },
    });

    const revenue = Number(
      transactions.find((t) => t.direction === TransactionDirection.IN)?._sum.amount || 0
    );
    const expense = Number(
      transactions.find((t) => t.direction === TransactionDirection.OUT)?._sum.amount || 0
    );
    const profit = revenue - expense;

    return { revenue, expense, profit };
  }

  async calculateGenderSales(
    startDate: Date,
    endDate: Date
  ): Promise<GenderSaleT[]> {
    const inventorySales = await prisma.inventory.findMany({
      where: {
        type: InventoryType.SALE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        productVariant: {
          include: {
            product: {
              select: { gender: true },
            },
          },
        },
      },
    });

    const stats = {
      MALE: 0,
      FEMALE: 0,
      UNISEX: 0,
    };

    inventorySales.forEach((item) => {
      const gender = item.productVariant.product.gender as keyof typeof stats;
      if (stats[gender] !== undefined) {
        stats[gender] += item.quantity;
      }
    });

    return [
      { gender: "men", sales: stats.MALE },
      { gender: "women", sales: stats.FEMALE },
      { gender: "unisex", sales: stats.UNISEX },
    ];
  }

  async calculateTopSellers(
    startDate: Date,
    endDate: Date
  ): Promise<TopSellerT[]> {
    const sales = await prisma.inventory.groupBy({
      by: ["productVariantId"],
      where: {
        type: InventoryType.SALE,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        quantity: true,
        totalCost: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const sellers = await Promise.all(
      sales.map(async (sale) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: sale.productVariantId },
          include: { product: { include: { brand: true } } },
        });

        return {
          id: sale.productVariantId,
          name: variant?.product.name || "Unknown",
          brand: variant?.product.brand?.name || "Unknown",
          variant: `${variant?.size}ml`,
          sales: sale._sum.quantity || 0,
          revenue: Number(sale._sum.totalCost || 0),
        };
      })
    );

    return sellers;
  }

  async fetchLowStockAlerts(): Promise<LowStockItemT[]> {
    const variants = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        stock: {
          lte: 10,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        stock: "asc",
      },
      take: 10,
    });

    return variants.map((v) => ({
      id: v.id,
      name: v.product.name,
      variant: `${v.size}ml`,
      stock: v.stock,
      threshold: 10,
    }));
  }

  async calculateChartData(
    startDate: Date,
    endDate: Date
  ): Promise<ChartDataT[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      select: {
        amount: true,
        direction: true,
        createdAt: true,
      },
    });

    const months: Record<
      string,
      { revenue: number; expense: number; profit: number; month: string }
    > = {};

    for (let i = 5; i >= 0; i--) {
      const date = moment().subtract(i, "months");
      const monthKey = date.format("MMM");
      months[monthKey] = { month: monthKey, revenue: 0, expense: 0, profit: 0 };
    }

    transactions.forEach((t) => {
      const monthKey = moment(t.createdAt).format("MMM");
      if (months[monthKey]) {
        if (t.direction === TransactionDirection.IN) {
          months[monthKey].revenue += Number(t.amount);
        } else {
          months[monthKey].expense += Number(t.amount);
        }
      }
    });

    const chartData = Object.values(months).map((m) => ({
      ...m,
      profit: m.revenue - m.expense,
    }));

    return chartData;
  }
}
