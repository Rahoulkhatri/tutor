"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const payments = [
  {
    id: 1,
    name: "Sarah Johnson",
    amount: "$230",
    date: "Due in 2 days",
    status: "Pending",
    statusColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: 2,
    name: "Alex Martinez",
    amount: "$310",
    date: "Due soon",
    status: "Due",
    statusColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: 3,
    name: "Emma Wilson",
    amount: "$580",
    date: "Ending in 5 days",
    status: "Processing",
    statusColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 4,
    name: "John Smith",
    amount: "$820",
    date: "Ending in 4 days",
    status: "Processing",
    statusColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export function PendingPayments() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Pending Payments</CardTitle>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className={`p-3 rounded-lg ${payment.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{payment.name}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${payment.statusColor}`}>{payment.amount}</p>
                  <p className={`text-xs font-medium ${payment.statusColor}`}>{payment.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
