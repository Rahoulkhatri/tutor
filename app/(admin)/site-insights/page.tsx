import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const insights = [
  { title: "Peak Usage", value: "3:00 PM – 7:00 PM", desc: "Most sessions booked in this window" },
  { title: "Top Subject", value: "Mathematics", desc: "Most requested subject this month" },
  { title: "New Signups", value: "156", desc: "Students + teachers in Jan 2025" },
  { title: "Page Views", value: "12,450", desc: "Landing & search pages (30 days)" },
];

export default function SiteInsightsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Site Insights</h1>
        <p className="text-muted-foreground">Analytics and insights for the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((i) => (
          <Card key={i.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{i.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-foreground">{i.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{i.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic & Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use the main dashboard charts for matching success and commission by area.
            Integrate with Google Analytics or similar for deeper traffic insights.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
