import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserRoleCount } from "@/lib/types/user";

// TODO: Replace with legit data

type Props = {
  userRoles: UserRoleCount[];
};

type ChartData = UserRoleCount & { fill: string };

export default function Chart(props: Props): JSX.Element {
  const chartData: ChartData[] = props.userRoles.map((userRole) => {
    return {
      count: userRole.count,
      role: userRole.role,
      fill: `var(--color-${userRole.role})`,
    };
  });

  const chartConfig = {
    count: {
      label: "Users",
    },
    admin: {
      label: "Admin",
      color: "hsl(var(--chart-1))",
    },
    player: {
      label: "Player",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const totalUsers = props.userRoles.reduce(
    (acc, userRole) => userRole.count + acc,
    0,
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square min-h-48 max-h-64"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="role"
              innerRadius={60}
              strokeWidth={5}
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
                          className="fill-foreground text-3xl font-jost-semibold"
                        >
                          {totalUsers}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Users
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>

            <ChartLegend content={<ChartLegendContent nameKey="role" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
