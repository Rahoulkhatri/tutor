"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

const areas = [
  { location: "Manhattan, NY", teachers: 312, students: 387, matchRate: "85%", commission: "$12,450", status: "High Demand", statusColor: "text-green-600" },
  { location: "Brooklyn, NY", teachers: 289, students: 456, matchRate: "79%", commission: "$9,230", status: "High Demand", statusColor: "text-green-600" },
  { location: "Queens, NY", teachers: 156, students: 312, matchRate: "65%", commission: "$3,120", status: "Warning", statusColor: "text-yellow-600" },
  { location: "Bronx, NY", teachers: 54, students: 223, matchRate: "48%", commission: "$4,560", status: "Low Demand", statusColor: "text-red-600" },
];

export function AreaInsights() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Area-Based Insights</CardTitle>
        <div className="flex gap-2">
          <button className="text-sm text-blue-600 hover:underline">Export</button>
          <button className="text-sm text-blue-600 hover:underline">Configure</button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Area</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Teachers</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Students</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Match Rate</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Commission</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area, index) => (
                <tr key={index} className="border-b border-border hover:bg-secondary transition-colors">
                  <td className="py-3 px-4 text-foreground flex items-center gap-2">
                    <span>📍</span>
                    {area.location}
                  </td>
                  <td className="py-3 px-4 text-foreground">{area.teachers}</td>
                  <td className="py-3 px-4 text-foreground">{area.students}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: area.matchRate }}
                        ></div>
                      </div>
                      {area.matchRate}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">{area.commission}</td>
                  <td className={`py-3 px-4 font-medium ${area.statusColor}`}>{area.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
