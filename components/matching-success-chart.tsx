"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Jan", "Successful Matches": 65, "Total Requests": 75 },
  { month: "Feb", "Successful Matches": 72, "Total Requests": 82 },
  { month: "Mar", "Successful Matches": 68, "Total Requests": 78 },
  { month: "Apr", "Successful Matches": 80, "Total Requests": 85 },
  { month: "May", "Successful Matches": 85, "Total Requests": 90 },
  { month: "Jun", "Successful Matches": 88, "Total Requests": 92 },
  { month: "Jul", "Successful Matches": 90, "Total Requests": 95 },
];

export function MatchingSuccessChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Matching Success Rate</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Last 7 Days</p>
        </div>
        <select className="text-sm border border-border rounded-lg px-3 py-1 bg-background">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Successful Matches" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Total Requests" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
