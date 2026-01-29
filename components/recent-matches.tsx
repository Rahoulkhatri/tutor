"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const matches = [
  {
    id: 1,
    teacher: "Sarah Johnson",
    student: "Maria G.",
    subject: "Spanish",
    status: "Active",
    statusColor: "bg-green-100 text-green-800",
  },
  {
    id: 2,
    teacher: "Mike Peters",
    student: "John D.",
    subject: "Math",
    status: "Active",
    statusColor: "bg-green-100 text-green-800",
  },
  {
    id: 3,
    teacher: "Alex Martinez",
    student: "Emma W.",
    subject: "Physics",
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
  {
    id: 4,
    teacher: "Dr. James Brown",
    student: "Tom L.",
    subject: "Chemistry",
    status: "Pending",
    statusColor: "bg-yellow-100 text-yellow-800",
  },
];

export function RecentMatches() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Matches</CardTitle>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium text-foreground">{match.teacher}</p>
                <p className="text-sm text-muted-foreground">with {match.student}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${match.statusColor}`}>{match.status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
