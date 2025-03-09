import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  TooltipProps
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction, Category, Budget } from "@/types";

interface BudgetRadarProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

interface RadarData {
  category: string;
  spent: number;
  budget: number;
  percentage: number;
}

export const BudgetRadar: React.FC<BudgetRadarProps> = ({ transactions, categories, budgets }) => {
  const processRadarData = (): RadarData[] => {
    // Calculate spending by category
    const categorySpending = new Map<string, number>();
    transactions
      .filter(t => t.isExpense)
      .forEach(transaction => {
        const current = categorySpending.get(transaction.category) || 0;
        categorySpending.set(transaction.category, current + transaction.amount);
      });

    // Get current month's budgets
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const currentBudgets = new Map(
      budgets
        .filter(b => b.period === currentMonth)
        .map(b => [b.category, b.amount])
    );

    // Create radar data with spending vs budget
    return categories.map(category => {
      const spent = categorySpending.get(category.name) || 0;
      const budget = currentBudgets.get(category.name) || 0;
      return {
        category: category.name,
        spent,
        budget,
        percentage: budget > 0 ? (spent / budget) * 100 : 0
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage spent
  };

  const data = processRadarData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium mb-2">{data.category}</p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
              <span>Spent: {formatCurrency(data.spent)}</span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2196F3]"></span>
              <span>Budget: {formatCurrency(data.budget)}</span>
            </p>
            <p className="text-sm font-medium mt-1">
              {formatPercentage(data.percentage)} of budget
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Budget Performance</CardTitle>
        <CardDescription>Compare spending against budget across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <defs>
                <linearGradient id="gradientSpent" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#81C784" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="gradientBudget" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2196F3" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#64B5F6" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <PolarGrid gridType="circle" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 'auto']}
                tickFormatter={formatCurrency}
              />
              <Radar
                name="Budget"
                dataKey="budget"
                stroke="#2196F3"
                fill="url(#gradientBudget)"
                fillOpacity={0.6}
              />
              <Radar
                name="Spent"
                dataKey="spent"
                stroke="#4CAF50"
                fill="url(#gradientSpent)"
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 