import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "#00bba7",
  },
} satisfies ChartConfig;

export default function BarChartComponent({
  data,
}: {
  data: { name: string; total: number }[] | undefined;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    displayName: new Date(item.name).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <BarChart accessibilityLayer data={formattedData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="displayName"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
