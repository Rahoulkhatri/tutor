import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const payouts = [
  { id: 1, teacher: "Fatima K.", amount: "Rs. 45,000", dueDate: "Feb 1, 2025", status: "Pending" },
  { id: 2, teacher: "Ahmed Hassan", amount: "$1,240", dueDate: "Jan 30, 2025", status: "Processing" },
  { id: 3, teacher: "Maria Garcia", amount: "$890", dueDate: "Jan 28, 2025", status: "Paid" },
  { id: 4, teacher: "John Smith", amount: "$620", dueDate: "Feb 5, 2025", status: "Pending" },
];

export default function PayoutsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground">Manage teacher payouts and disbursements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs. 52,750</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$2,130</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payouts.filter((p) => p.status === "Pending").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payout Queue</CardTitle>
          <span className="text-sm text-muted-foreground">{payouts.length} payouts</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.teacher}</TableCell>
                  <TableCell>{p.amount}</TableCell>
                  <TableCell>{p.dueDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "Paid" ? "default" : p.status === "Pending" ? "secondary" : "outline"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
