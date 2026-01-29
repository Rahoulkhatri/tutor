"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Platform Fee", value: 30 },
  { name: "Referral Bonus", value: 25 },
  { name: "Teacher Cut", value: 35 },
  { name: "Admin Cut", value: 10 },
];

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

export function CommissionChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Commission by Area</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
