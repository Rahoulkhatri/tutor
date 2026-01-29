"use client";

import { TrendingUp, TrendingDown } from 'lucide-react';

const metrics = [
  {
    label: "Total Students",
    value: "2,847",
    change: "+15%",
    icon: "👥",
    bgColor: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    label: "Total Teachers",
    value: "1,423",
    change: "+8%",
    icon: "📚",
    bgColor: "bg-purple-50",
    color: "text-purple-600",
  },
  {
    label: "Active Matches",
    value: "892",
    change: "+3%",
    icon: "⚡",
    bgColor: "bg-green-50",
    color: "text-green-600",
  },
  {
    label: "Revenue",
    value: "$48,592",
    change: "+12%",
    icon: "💰",
    bgColor: "bg-yellow-50",
    color: "text-yellow-600",
  },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
            <div className={`text-2xl ${metric.bgColor} p-3 rounded-lg`}>{metric.icon}</div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${metric.color}`} />
            <span className={`text-sm font-medium ${metric.color}`}>{metric.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
