import moment from "moment";

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
