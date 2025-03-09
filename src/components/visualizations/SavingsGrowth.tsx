import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from "@/types";
import { format, startOfMonth, eachMonthOfInterval, isWithinInterval } from "date-fns";

interface SavingsGrowthProps {
  transactions: Transaction[];
  timeframe: "30days" | "90days" | "6months" | "1year";
}

interface MonthlyData {
  date: string;
  savings: number;
  income: number;
  expenses: number;
  cumulative: number;
}

export const SavingsGrowth: React.FC<SavingsGrowthProps> = ({ transactions, timeframe }) => {
  const processMonthlyData = (): MonthlyData[] => {
    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setMonth(startDate.getMonth() - 12);
        break;
    }

    // Get all months in the range
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    // Initialize monthly data
    const monthlyData: MonthlyData[] = months.map(month => ({
      date: format(month, 'MMM yyyy'),
      savings: 0,
      income: 0,
      expenses: 0,
      cumulative: 0
    }));

    // Process transactions
    let cumulative = 0;
    monthlyData.forEach((monthData, index) => {
      const monthStart = startOfMonth(months[index]);
      const monthEnd = index === months.length - 1 
        ? endDate 
        : startOfMonth(months[index + 1]);

      const monthTransactions = transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      );

      const monthIncome = monthTransactions
        .filter(t => !t.isExpense)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.isExpense)
        .reduce((sum, t) => sum + t.amount, 0);

      monthData.income = monthIncome;
      monthData.expenses = monthExpenses;
      monthData.savings = monthIncome - monthExpenses;
      cumulative += monthData.savings;
      monthData.cumulative = cumulative;
    });

    return monthlyData;
  };

  const data = processMonthlyData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span>{entry.name}: {formatCurrency(entry.value as number)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Savings Growth</CardTitle>
        <CardDescription>Track your cumulative savings over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F44336" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F44336" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#4CAF50"
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#F44336"
                fill="url(#colorExpenses)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#2196F3"
                fill="url(#colorCumulative)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 