import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Match Success Rate", value: "78%", change: "+5%", desc: "Last 30 days" },
  { label: "Avg. Session Duration", value: "52 min", change: "+2 min", desc: "Per session" },
  { label: "Student Retention", value: "92%", change: "+3%", desc: "Monthly" },
  { label: "Teacher Satisfaction", value: "4.6/5", change: "+0.2", desc: "Platform rating" },
];

export default function PerformancePage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Performance</h1>
        <p className="text-muted-foreground">View platform performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-green-600 mt-1">{m.change}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Platform performance is tracked across matching success, session quality, and user retention.
            Use the dashboard and area insights for detailed analytics.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
