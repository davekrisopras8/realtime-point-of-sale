import { useState, useMemo, useEffect } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { convertIDR } from "@/lib/utils";

export default function PieChartComponent({
  data,
}: {
  data: { category: string; sales: number }[] | undefined;
}) {
  const id = "pie-interactive";

  // Generate chart config dynamically based on data
  const chartConfig: ChartConfig = useMemo(() => {
    if (!data || data.length === 0) {
      return { sales: { label: "Sales" } };
    }

    const config: ChartConfig = {
      sales: {
        label: "Sales",
      },
    };

    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    data.forEach((item, index) => {
      const key = item.category.toLowerCase().replace(/\s+/g, "-");
      config[key] = {
        label: item.category,
        color: colors[index % colors.length],
      };
    });

    return config;
  }, [data]);

  // Format data for pie chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const key = item.category.toLowerCase().replace(/\s+/g, "-");
      return {
        category: key,
        sales: item.sales,
        fill: `var(--color-${key})`,
      };
    });
  }, [data]);

  const [activeCategory, setActiveCategory] = useState("");

  // Update activeCategory when chartData changes
  useEffect(() => {
    if (chartData.length > 0 && !activeCategory) {
      setActiveCategory(chartData[0].category);
    }
  }, [chartData, activeCategory]);

  const activeIndex = useMemo(
    () => chartData.findIndex((item) => item.category === activeCategory),
    [activeCategory, chartData]
  );

  const categories = useMemo(
    () => chartData.map((item) => item.category),
    [chartData]
  );

  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  // Don't render chart until activeCategory is set
  if (!activeCategory || activeIndex === -1) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <>
      <ChartStyle id={id} config={chartConfig} />
      <div className="flex justify-between items-center mb-4">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger
            className="h-9 w-[180px] rounded-lg"
            aria-label="Select a category"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {categories.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <ChartContainer
        id={id}
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[300px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="sales"
            nameKey="category"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={activeIndex}
            activeShape={({
              outerRadius = 0,
              ...props
            }: PieSectorDataItem) => (
              <g>
                <Sector {...props} outerRadius={outerRadius + 10} />
                <Sector
                  {...props}
                  outerRadius={outerRadius + 25}
                  innerRadius={outerRadius + 12}
                />
              </g>
            )}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {convertIDR(chartData[activeIndex].sales)}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground text-sm"
                      >
                        Revenue
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </>
  );
}
