import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
  TooltipProps
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/types";

interface CashFlowWaterfallProps {
  transactions: Transaction[];
}

interface WaterfallDataItem {
  name: string;
  amount: number;
  fill: string;
  showValue: boolean;
  start?: number;
  end?: number;
}

export const CashFlowWaterfall: React.FC<CashFlowWaterfallProps> = ({ transactions }) => {
  // Process transactions into waterfall data
  const processWaterfallData = () => {
    // Group transactions by type
    const income = transactions.filter(t => !t.isExpense).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.isExpense).reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    return [
      {
        name: 'Starting',
        amount: 0,
        fill: '#8884d8',
        showValue: true
      },
      {
        name: 'Income',
        amount: income,
        fill: '#4CAF50',
        showValue: true
      },
      {
        name: 'Expenses',
        amount: -expenses,
        fill: '#F44336',
        showValue: true
      },
      {
        name: 'Balance',
        amount: balance,
        fill: balance >= 0 ? '#2196F3' : '#FF9800',
        showValue: true
      }
    ] as WaterfallDataItem[];
  };

  // Calculate cumulative values for waterfall effect
  const calculateWaterfallData = (data: WaterfallDataItem[]): WaterfallDataItem[] => {
    let cumulative = 0;
    return data.map(item => {
      const start = cumulative;
      cumulative += item.amount;
      return {
        ...item,
        start,
        end: cumulative,
        amount: item.amount
      };
    });
  };

  const data = calculateWaterfallData(processWaterfallData());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WaterfallDataItem;
      return (
        <div className="bg-background/95 p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            {formatCurrency(data.amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {data.map((entry, index) => (
                  <LabelList
                    key={index}
                    dataKey="amount"
                    position="top"
                    formatter={(value: number) => formatCurrency(value)}
                    style={{ fill: entry.amount >= 0 ? '#4CAF50' : '#F44336' }}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 