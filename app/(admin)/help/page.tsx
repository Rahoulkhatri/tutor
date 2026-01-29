import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "How do I add a new student?", a: "Go to Students, then use the Add Student action (or bulk import when available)." },
  { q: "How are payouts processed?", a: "Payouts run on the 1st and 15th of each month. Teachers can see pending payouts under Payouts." },
  { q: "How do I resolve a dispute?", a: "Contact support with the match ID and transaction ID. We'll review within 48 hours." },
];

export default function HelpPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get help and contact support.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-medium text-foreground">{faq.q}</p>
              <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">Email: support@tutorconnect.com</p>
          <p className="text-muted-foreground">Response time: within 24 hours</p>
          <Button className="mt-4">Open support ticket</Button>
        </CardContent>
      </Card>
    </main>
  );
}
