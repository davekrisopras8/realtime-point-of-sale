"use client";

import BarChartComponent from "@/components/common/bar-chart";
import PieChartComponent from "@/components/common/pie-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { convertIDR, cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface TableData {
  id: number;
  name: string;
}

interface OrderDataRaw {
  id: number;
  order_id: string;
  customer_name: string;
  status: string;
  created_at: string;
  tables: TableData | TableData[] | null;
}

interface OrderData {
  id: number;
  order_id: string;
  customer_name: string;
  status: string;
  created_at: string;
  tables: TableData | null;
}

interface MenuData {
  price: number;
  category: string;
}

// Supabase returns joined data differently
interface OrderMenuItemRaw {
  quantity: number;
  nominal: number;
  menus: MenuData | MenuData[];
}

interface OrderMenuItem {
  quantity: number;
  nominal: number;
  menus: MenuData;
}

/**
 * Normalize Supabase response - handles both array and object returns
 */
const normalizeOrderMenuItem = (item: OrderMenuItemRaw): OrderMenuItem | null => {
  // If menus is an array, take the first item
  const menu = Array.isArray(item.menus) ? item.menus[0] : item.menus;

  if (!menu) return null;

  return {
    quantity: item.quantity,
    nominal: item.nominal,
    menus: menu,
  };
};

/**
 * Normalize OrderData - handles Supabase join response for tables
 */
const normalizeOrderData = (item: OrderDataRaw): OrderData => {
  // If tables is an array, take the first item
  const table = item.tables
    ? (Array.isArray(item.tables) ? item.tables[0] : item.tables)
    : null;

  return {
    id: item.id,
    order_id: item.order_id,
    customer_name: item.customer_name,
    status: item.status,
    created_at: item.created_at,
    tables: table,
  };
};

/**
 * Calculate pricing with tax and service charge
 * This matches the usePricing hook logic
 */
const calculatePricing = (orderMenuItems: OrderMenuItem[] | null | undefined) => {
  if (!orderMenuItems || orderMenuItems.length === 0) {
    return {
      totalPrice: 0,
      tax: 0,
      service: 0,
      grandTotal: 0,
    };
  }

  // Calculate subtotal using nominal (which includes discount if any)
  const totalPrice = orderMenuItems.reduce(
    (sum, item) => sum + (item.nominal || 0),
    0
  );

  // Calculate tax (12%)
  const tax = totalPrice * 0.12;

  // Calculate service (5%)
  const service = totalPrice * 0.05;

  // Calculate grand total
  const grandTotal = totalPrice + tax + service;

  return {
    totalPrice,
    tax,
    service,
    grandTotal,
  };
};

export default function Dashboard() {
  const supabase = createClient();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const firstDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    firstDayOfMonth.setHours(0, 0, 0, 0);

    return {
      from: firstDayOfMonth,
      to: today,
    };
  });

  // Get properly formatted dates for queries
  const startDate = dateRange?.from || new Date();
  const endDate = dateRange?.to || new Date();

  const queryStartDate = new Date(startDate);
  queryStartDate.setHours(0, 0, 0, 0);

  const queryEndDate = new Date(endDate);
  queryEndDate.setHours(23, 59, 59, 999);

  const startDateISO = queryStartDate.toISOString();
  const endDateISO = queryEndDate.toISOString();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders-per-day", startDateISO, endDateISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("created_at")
        .eq("status", "Settled")
        .gte("created_at", startDateISO)
        .lte("created_at", endDateISO)
        .order("created_at");

      if (error) {
        console.error("Error fetching orders per day:", error);
        throw error;
      }

      const counts: Record<string, number> = {};

      (data ?? []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, total]) => ({ name, total }));
    },
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue", startDateISO, endDateISO],
    queryFn: async () => {
      // Calculate previous period for comparison
      const periodLengthMs = queryEndDate.getTime() - queryStartDate.getTime();
      const prevPeriodEnd = new Date(queryStartDate.getTime() - 1);
      const prevPeriodStart = new Date(prevPeriodEnd.getTime() - periodLengthMs);

      //  Get orders with their menu items for current period
      const { data: currentOrders, error: currentOrdersError } = await supabase
        .from("orders")
        .select("id, created_at, status")
        .eq("status", "Settled")
        .gte("created_at", startDateISO)
        .lte("created_at", endDateISO);

      if (currentOrdersError) {
        console.error("Error fetching current orders:", currentOrdersError);
        throw currentOrdersError;
      }

      // Get all order menu items for current period
      const currentOrderIds = (currentOrders ?? []).map(order => order.id);
      let currentPeriodData: OrderMenuItem[] = [];

      if (currentOrderIds.length > 0) {
        const { data, error } = await supabase
          .from("orders_menus")
          .select("quantity, nominal, menus!inner(price, category)")
          .in("order_id", currentOrderIds);

        if (error) {
          console.error("Error fetching current period menu items:", error);
          throw error;
        }

        // ✅ Normalize the data
        currentPeriodData = (data as OrderMenuItemRaw[])
          .map(normalizeOrderMenuItem)
          .filter((item): item is OrderMenuItem => item !== null);
      }

      // ✅ Get orders with their menu items for previous period
      const { data: prevOrders, error: prevOrdersError } = await supabase
        .from("orders")
        .select("id, created_at, status")
        .eq("status", "Settled")
        .gte("created_at", prevPeriodStart.toISOString())
        .lte("created_at", prevPeriodEnd.toISOString());

      if (prevOrdersError) {
        console.error("Error fetching previous orders:", prevOrdersError);
        throw prevOrdersError;
      }

      const prevOrderIds = (prevOrders ?? []).map(order => order.id);
      let prevPeriodData: OrderMenuItem[] = [];

      if (prevOrderIds.length > 0) {
        const { data, error } = await supabase
          .from("orders_menus")
          .select("quantity, nominal, menus!inner(price, category)")
          .in("order_id", prevOrderIds);

        if (error) {
          console.error("Error fetching previous period menu items:", error);
          throw error;
        }

        // ✅ Normalize the data
        prevPeriodData = (data as OrderMenuItemRaw[])
          .map(normalizeOrderMenuItem)
          .filter((item): item is OrderMenuItem => item !== null);
      }

      // ✅ Calculate revenue using the same logic as usePricing
      const currentPricing = calculatePricing(currentPeriodData);
      const prevPricing = calculatePricing(prevPeriodData);

      const totalRevenueCurrent = currentPricing.grandTotal;
      const totalRevenuePrev = prevPricing.grandTotal;

      // Calculate growth rate
      let growthRate = "0.00";
      if (totalRevenuePrev > 0) {
        growthRate = (
          ((totalRevenueCurrent - totalRevenuePrev) / totalRevenuePrev) *
          100
        ).toFixed(2);
      } else if (totalRevenueCurrent > 0) {
        growthRate = "100.00";
      }

      // Calculate unique days with orders
      const daysInData = new Set(
        (currentOrders ?? []).map((order) =>
          new Date(order.created_at).toISOString().slice(0, 10)
        )
      ).size;

      // Calculate average revenue per day
      const averageRevenue =
        daysInData > 0 ? totalRevenueCurrent / daysInData : 0;

      return {
        totalRevenueCurrent,
        totalRevenuePrev,
        averageRevenue,
        growthRate,
        // Return additional breakdown for debugging
        subtotal: currentPricing.totalPrice,
        tax: currentPricing.tax,
        service: currentPricing.service,
      };
    },
  });

  // ==================== QUERY: TOTAL ORDERS ====================
  const { data: totalOrder, isLoading: totalOrderLoading } = useQuery({
    queryKey: ["total-order", startDateISO, endDateISO],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "Settled")
        .gte("created_at", startDateISO)
        .lte("created_at", endDateISO);

      if (error) {
        console.error("Error fetching total orders:", error);
        throw error;
      }

      return count || 0;
    },
  });

  const { data: salesByCategory, isLoading: salesByCategoryLoading } = useQuery(
    {
      queryKey: ["sales-by-category", startDateISO, endDateISO],
      queryFn: async () => {
        // ✅ First get settled orders
        const { data: settledOrders, error: ordersError } = await supabase
          .from("orders")
          .select("id")
          .eq("status", "Settled")
          .gte("created_at", startDateISO)
          .lte("created_at", endDateISO);

        if (ordersError) {
          console.error("Error fetching settled orders:", ordersError);
          throw ordersError;
        }

        if (!settledOrders || settledOrders.length === 0) {
          return [];
        }

        const orderIds = settledOrders.map(order => order.id);

        // Then get menu items for these orders
        const { data, error } = await supabase
          .from("orders_menus")
          .select("quantity, nominal, menus!inner(price, category)")
          .in("order_id", orderIds);

        if (error) {
          console.error("Error fetching sales by category:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          return [];
        }

        //  Normalize the data
        const normalizedData = (data as OrderMenuItemRaw[])
          .map(normalizeOrderMenuItem)
          .filter((item): item is OrderMenuItem => item !== null);

        const categorySales: Record<string, number> = {};

        //  Use nominal (which includes discount) for category sales
        normalizedData.forEach((item) => {
          const menu = item.menus;

          if (menu && menu.category) {
            const categoryName = menu.category;
            // Use nominal instead of calculating from price
            const revenue = Number(item.nominal);
            categorySales[categoryName] =
              (categorySales[categoryName] || 0) + revenue;
          }
        });

        // Calculate totals for each category with tax and service
        return Object.entries(categorySales)
          .map(([category, subtotal]) => {
            // Apply tax and service to category subtotal
            const tax = subtotal * 0.12;
            const service = subtotal * 0.05;
            const sales = subtotal + tax + service;

            return { category, sales };
          })
          .sort((a, b) => b.sales - a.sales);
      },
    }
  );

  const { data: lastOrder, isLoading: lastOrderLoading } = useQuery({
    queryKey: ["last-order"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_id, customer_name, status, created_at, tables(name, id)")
        .eq("status", "Process")
        .limit(5)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching last orders:", error);
        throw error;
      }

      // Normalize the data to handle Supabase join response
      return (data as OrderDataRaw[]).map(normalizeOrderData);
    },
  });

  const setPresetRange = (preset: string) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let from: Date;
    let to = new Date(today);

    switch (preset) {
      case "today":
        from = new Date();
        from.setHours(0, 0, 0, 0);
        break;

      case "yesterday":
        from = new Date();
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to = new Date();
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;

      case "last7days":
        from = new Date();
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        break;

      case "last30days":
        from = new Date();
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        break;

      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        from.setHours(0, 0, 0, 0);
        break;

      case "lastMonth":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        from.setHours(0, 0, 0, 0);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        to.setHours(23, 59, 59, 999);
        break;

      case "thisYear":
        from = new Date(today.getFullYear(), 0, 1);
        from.setHours(0, 0, 0, 0);
        break;

      case "lastYear":
        from = new Date(today.getFullYear() - 1, 0, 1);
        from.setHours(0, 0, 0, 0);
        to = new Date(today.getFullYear() - 1, 11, 31);
        to.setHours(23, 59, 59, 999);
        break;

      case "allTime":
        // Set to a very early date or when your system started
        from = new Date(2020, 0, 1);
        from.setHours(0, 0, 0, 0);
        break;

      default:
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        from.setHours(0, 0, 0, 0);
    }

    setDateRange({ from, to });
  };

  return (
    <div className="w-full">
      {/* Header with Date Filter */}
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Date Range Filter */}
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                {/* Preset Buttons */}
                <div className="flex flex-col gap-1 p-3 border-r">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                    Quick Select
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("today")}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("yesterday")}
                  >
                    Yesterday
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("last7days")}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("last30days")}
                  >
                    Last 30 days
                  </Button>
                  <div className="h-px bg-border my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("thisMonth")}
                  >
                    This month
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("lastMonth")}
                  >
                    Last month
                  </Button>
                  <div className="h-px bg-border my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("thisYear")}
                  >
                    This year
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("lastYear")}
                  >
                    Last year
                  </Button>
                  <div className="h-px bg-border my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm"
                    onClick={() => setPresetRange("allTime")}
                  >
                    All time
                  </Button>
                </div>

                {/* Calendar */}
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {revenueLoading ? (
                <span className="text-muted-foreground animate-pulse">
                  Loading...
                </span>
              ) : (
                convertIDR(revenue?.totalRevenueCurrent ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Revenue in selected period (incl. tax & service)
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Average Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {revenueLoading ? (
                <span className="text-muted-foreground animate-pulse">
                  Loading...
                </span>
              ) : (
                convertIDR(revenue?.averageRevenue ?? 0)
              )}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Average per day
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Orders</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {totalOrderLoading ? (
                <span className="text-muted-foreground animate-pulse">...</span>
              ) : (
                totalOrder ?? 0
              )}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Settled orders in period
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Growth Rate</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {revenueLoading ? (
                <span className="text-muted-foreground animate-pulse">...</span>
              ) : (
                <span
                  className={
                    Number(revenue?.growthRate) >= 0
                      ? "text-black dark:text-white"
                      : "text-red-600 dark:text-red-500"
                  }
                >
                  {Number(revenue?.growthRate) >= 0 ? "+" : ""}
                  {revenue?.growthRate ?? 0}%
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Compared to previous period
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Orders Per Day</CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to
                ? `Showing orders from ${format(
                    dateRange.from,
                    "PPP"
                  )} to ${format(dateRange.to, "PPP")}`
                : "Select a date range"}
            </CardDescription>
          </CardHeader>
          <div className="w-full h-64 p-6">
            {ordersLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground animate-pulse">
                  Loading chart...
                </p>
              </div>
            ) : (
              <BarChartComponent data={orders} />
            )}
          </div>
        </Card>

        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Showing last 5 active orders</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-3">
            {lastOrderLoading ? (
              <p className="text-muted-foreground animate-pulse">Loading...</p>
            ) : lastOrder && lastOrder.length > 0 ? (
              lastOrder.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {order.customer_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Table: {order.tables?.name || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      ID: {order.order_id}
                    </p>
                  </div>
                  <Link href={`/order/${order.order_id}`}>
                    <Button size="sm" variant="outline">
                      Detail
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No active orders
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Sales Distribution */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>Sales by Menu Category</CardTitle>
            <CardDescription>
              Revenue distribution across menu categories
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            {salesByCategoryLoading ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p className="animate-pulse">Loading categories...</p>
              </div>
            ) : salesByCategory && salesByCategory.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const totalSales = salesByCategory.reduce(
                    (sum, item) => sum + item.sales,
                    0
                  );
                  const colors = [
                    "bg-cyan-500",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-orange-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-red-500",
                  ];

                  return salesByCategory.map((item, index) => {
                    const percentage = ((item.sales / totalSales) * 100).toFixed(
                      1
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              colors[index % colors.length]
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {item.category}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {convertIDR(item.sales)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-bold text-lg">{percentage}%</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            of Total
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No category data available
              </div>
            )}
          </div>
        </Card>

        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>
              Interactive view of sales by category
            </CardDescription>
          </CardHeader>
          <div className="w-full px-6 pb-6">
            {salesByCategoryLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground animate-pulse">
                  Loading chart...
                </p>
              </div>
            ) : (
              <PieChartComponent data={salesByCategory} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
