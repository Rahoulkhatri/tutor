import { MetricCards } from "@/components/metric-cards";
import { MatchingSuccessChart } from "@/components/matching-success-chart";
import { CommissionChart } from "@/components/commission-chart";
import { RecentMatches } from "@/components/recent-matches";
import { PendingPayments } from "@/components/pending-payments";
import { AreaInsights } from "@/components/area-insights";
import { PromoBanner } from "@/components/promo-banner";

export default function Dashboard() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
      </div>
      <MetricCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MatchingSuccessChart />
        <CommissionChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMatches />
        <PendingPayments />
      </div>
      <AreaInsights />
      <PromoBanner />
    </main>
  );
}
