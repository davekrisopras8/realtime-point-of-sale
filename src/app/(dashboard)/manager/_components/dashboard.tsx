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
import { createClient } from "@/lib/supabase/client";
import { convertIDR } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Dashboard() {
  const supabase = createClient();
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { data: orders } = useQuery({
    queryKey: ["orders-per-day"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at")
        .eq("status", "Settled")
        .gte("created_at", firstDayOfMonth.toISOString())
        .order("created_at");

      const counts: Record<string, number> = {};

      (data ?? []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, total]) => ({ name, total }));
    },
  });

  const thisMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const lastMonth = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const { data: revenue } = useQuery({
    queryKey: ["revenue-this-month"],
    queryFn: async () => {
      // Calculate date ranges correctly
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      // Get this month's data with settled orders only
      const { data: dataThisMonth } = await supabase
        .from("orders_menus")
        .select("quantity, menus (price), orders!inner(status, created_at)")
        .eq("orders.status", "Settled")
        .gte("orders.created_at", thisMonth.toISOString());

      // Get last month's data with settled orders only
      const { data: dataLastMonth } = await supabase
        .from("orders_menus")
        .select("quantity, menus (price), orders!inner(status, created_at)")
        .eq("orders.status", "Settled")
        .gte("orders.created_at", lastMonth.toISOString())
        .lt("orders.created_at", thisMonth.toISOString());

      // Calculate total revenue this month
      const totalRevenueThisMonth = (dataThisMonth ?? []).reduce(
        (sum, item) => {
          const price = (item.menus as unknown as { price: number }).price;
          return sum + price * item.quantity;
        },
        0
      );

      // Calculate total revenue last month
      const totalRevenueLastMonth = (dataLastMonth ?? []).reduce(
        (sum, item) => {
          const price = (item.menus as unknown as { price: number }).price;
          return sum + price * item.quantity;
        },
        0
      );

      // Calculate growth rate with safety check
      let growthRate = "0.00";
      if (totalRevenueLastMonth > 0) {
        growthRate = (
          ((totalRevenueThisMonth - totalRevenueLastMonth) /
            totalRevenueLastMonth) *
          100
        ).toFixed(2);
      } else if (totalRevenueThisMonth > 0) {
        growthRate = "100.00";
      }

      // Calculate unique days with orders this month
      const daysInData = new Set(
        (dataThisMonth ?? []).map((item) => {
          const orderData = item.orders as unknown as { created_at: string };
          return new Date(orderData.created_at).toISOString().slice(0, 10);
        })
      ).size;

      // Calculate average revenue per day
      const averageRevenueThisMonth =
        daysInData > 0 ? totalRevenueThisMonth / daysInData : 0;

      return {
        totalRevenueThisMonth,
        totalRevenueLastMonth,
        averageRevenueThisMonth,
        growthRate,
      };
    },
  });

  const { data: totalOrder } = useQuery({
    queryKey: ["total-order"],
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("status", "Settled")
        .gte("created_at", thisMonth);

      return count;
    },
  });

  const { data: salesByCategory } = useQuery({
    queryKey: ["sales-by-category"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders_menus")
        .select(
          "quantity, menus!inner (price, category), orders!inner(status, created_at)"
        )
        .eq("orders.status", "Settled")
        .gte("orders.created_at", thisMonth);

      if (error) {
        console.error("Error fetching sales by category:", error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const categorySales: Record<string, number> = {};

      data.forEach((item) => {
        const menu = item.menus as unknown as {
          price: number;
          category: string;
        };

        if (menu && menu.category) {
          const categoryName = menu.category;
          const revenue = Number(menu.price) * item.quantity;

          categorySales[categoryName] =
            (categorySales[categoryName] || 0) + revenue;
        }
      });

      return Object.entries(categorySales).map(([category, sales]) => ({
        category,
        sales,
      }));
    },
  });

  const { data: lastOrder } = useQuery({
    queryKey: ["last-order"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_id, customer_name, status, tables(name, id)")
        .eq("status", "Process")
        .limit(5)
        .order("created_at", { ascending: false });

      return data;
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {convertIDR(revenue?.totalRevenueThisMonth ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Revenue this month
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average Revenue</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {convertIDR(revenue?.averageRevenueThisMonth ?? 0)}
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
            <CardDescription>Total Order</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {totalOrder ?? 0}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Order settled this month
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Growth Rate</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {revenue?.growthRate ?? 0}%
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground text-sm">
              *Compared to last month
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Order Create Per Month</CardTitle>
            <CardDescription>
              Showing orders from {firstDayOfMonth.toLocaleDateString()} to{" "}
              {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <div className="w-full h-64 p-6">
            <BarChartComponent data={orders} />
          </div>
        </Card>
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>Active Order</CardTitle>
            <CardDescription>Showing last 5 active orders</CardDescription>
          </CardHeader>
          <div className="px-6">
            {lastOrder ? (
              lastOrder.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 justify-between mb-4"
                >
                  <div>
                    <h3 className="font-semibold">{order.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Table:{" "}
                      {(order.tables as unknown as { name: string }).name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Order ID: {order.id}
                    </p>
                  </div>
                  <Link href={`/order/${order.order_id}`}>
                    <Button className="mt-2" size="sm">
                      Detail
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p>No active orders</p>
            )}
          </div>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>Sales by Menu Category</CardTitle>
            <CardDescription>
              Revenue distribution across menu categories this month
            </CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            {salesByCategory && salesByCategory.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const totalSales = salesByCategory.reduce(
                    (sum, item) => sum + item.sales,
                    0
                  );
                  return salesByCategory.map((item, index) => {
                    const percentage = ((item.sales / totalSales) * 100).toFixed(
                      1
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full bg-cyan-500"

                          />
                          <div>
                            <p className="font-medium">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{percentage}%</p>
                          <p className="text-xs text-muted-foreground">
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
                No data available
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
            <PieChartComponent data={salesByCategory} />
          </div>
        </Card>
      </div>
    </div>
  );
}
