import { InventoryType, TransactionDirection } from "@prisma/client";
import moment from "moment";
import { prisma } from "../../lib/prisma";

export interface DashboardFilter {
  filter?: string;
}

export const parseDashboardQueryParams = (query: any): DashboardFilter => {
  return {
    filter: typeof query.filter === 'string' ? query.filter : undefined
  };
};

export const getDashboardDateRange = (filterObj: DashboardFilter) => {
  const filter = filterObj.filter;
  const now = moment();
  
  let currentMonth = now.month() + 1;
  let currentYear = now.year();
  let isValid = false;

  if (filter) {
    const parts = filter.split("-");
    const p1_str = parts[0];
    const p2_str = parts[1];

    if (p1_str && p2_str) {
      const p1 = parseInt(p1_str, 10);
      const p2 = parseInt(p2_str, 10);

      if (!isNaN(p1) && !isNaN(p2)) {
        // Try YYYY-MM
        if (p1 > 1000 && p2 >= 1 && p2 <= 12) {
          currentYear = p1;
          currentMonth = p2;
          isValid = true;
        } 
        // Try MM-YYYY
        else if (p2 > 1000 && p1 >= 1 && p1 <= 12) {
          currentYear = p2;
          currentMonth = p1;
          isValid = true;
        }
      }
    }

    // Check future date
    if (isValid) {
      const selected = moment().year(currentYear).month(currentMonth - 1).startOf("month");
      if (selected.isAfter(now, "month")) {
        isValid = false;
        currentYear = now.year();
        currentMonth = now.month() + 1;
      }
    }
  }

  const currentStart: Date = moment().year(currentYear).month(currentMonth - 1).startOf("month").toDate();
  const currentEnd: Date = moment(currentStart).endOf("month").toDate();

  let compareStart: Date;
  let compareEnd: Date;

  if (!filter || !isValid) {
    // Case 1: Filter not provided -> Compare with last month
    compareStart = moment(currentStart).subtract(1, "month").startOf("month").toDate();
    compareEnd = moment(compareStart).endOf("month").toDate();
  } else {
    // Case 2: Valid filter -> Compare with month before selected
    compareStart = moment().year(now.year()).month(now.month() - 1).startOf("month").toDate();
    compareEnd = moment(compareStart).endOf("month").toDate();
  }

  return {
    current: { startDate: currentStart, endDate: currentEnd },
    compare: { startDate: compareStart, endDate: compareEnd },
  };
};

export const getLastSixMonthsRange = () => {
  const now = moment();
  const startDate = now.clone().subtract(5, "months").startOf("month").toDate();
  return {
    startDate,
    endDate: now.toDate(),
  };
};

export const calculateFinancials = async (startDate: Date, endDate: Date) => {
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

  const revenue = Number(transactions.find(t => t.direction === TransactionDirection.IN)?._sum.amount || 0);
  const expense = Number(transactions.find(t => t.direction === TransactionDirection.OUT)?._sum.amount || 0);
  const profit = revenue - expense;

  return { revenue, expense, profit };
};

export const calculateGenderSales = async (startDate: Date, endDate: Date) => {
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

  inventorySales.forEach(item => {
    const gender = item.productVariant.product.gender as keyof typeof stats;
    stats[gender] += item.quantity;
  });

  return [
    { gender: "men", sales: stats.MALE },
    { gender: "women", sales: stats.FEMALE },
    { gender: "unisex", sales: stats.UNISEX },
  ];
};

export const calculateTopSellers = async (startDate: Date, endDate: Date) => {
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

  const sellers = await Promise.all(sales.map(async (sale) => {
    const variant = await prisma.productVariant.findUnique({
      where: { id: sale.productVariantId },
      include: { product: { include: { brand: true } } },
    });

    return {
      id: sale.productVariantId,
      name: variant?.product.name || "Unknown",
      brand: variant?.product.brand.name || "Unknown",
      variant: `${variant?.size}ml`,
      sales: sale._sum.quantity || 0,
      revenue: Number(sale._sum.totalCost || 0),
    };
  }));

  return sellers;
};

export const fetchLowStockAlerts = async () => {
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

  return variants.map(v => ({
    id: v.id,
    name: v.product.name,
    variant: `${v.size}ml`,
    stock: v.stock,
    threshold: 10,
  }));
};

export const calculateChartData = async (startDate: Date, endDate: Date) => {
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

  const months: Record<string, { revenue: number; expense: number; profit: number; month: string }> = {};

  for (let i = 5; i >= 0; i--) {
    const date = moment().subtract(i, "months");
    const monthKey = date.format("MMM");
    months[monthKey] = { month: monthKey, revenue: 0, expense: 0, profit: 0 };
  }

  transactions.forEach(t => {
    const monthKey = moment(t.createdAt).format("MMM");
    if (months[monthKey]) {
      if (t.direction === TransactionDirection.IN) {
        months[monthKey].revenue += Number(t.amount);
      } else {
        months[monthKey].expense += Number(t.amount);
      }
    }
  });

  const chartData = Object.values(months).map(m => ({
    ...m,
    profit: m.revenue - m.expense,
  }));

  return chartData;
};
