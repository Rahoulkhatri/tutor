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

const transactions = [
  { id: "TXN-001", from: "Ayesha Malik", to: "Fatima K.", amount: "$230", date: "Jan 28, 2025", status: "Completed" },
  { id: "TXN-002", from: "Hassan Ahmed", to: "Ahmed Hassan", amount: "Rs. 15,000", date: "Jan 27, 2025", status: "Completed" },
  { id: "TXN-003", from: "Omar Sheikh", to: "John Smith", amount: "$95", date: "Jan 26, 2025", status: "Pending" },
  { id: "TXN-004", from: "Zainab Ali", to: "Maria Garcia", amount: "$180", date: "Jan 25, 2025", status: "Completed" },
  { id: "TXN-005", from: "Fatima Khan", to: "Fatima K.", amount: "Rs. 8,000", date: "Jan 24, 2025", status: "Refunded" },
];

export default function TransactionsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-muted-foreground">View all payment transactions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <span className="text-sm text-muted-foreground">{transactions.length} transactions</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>From (Student)</TableHead>
                <TableHead>To (Teacher)</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-sm">{t.id}</TableCell>
                  <TableCell>{t.from}</TableCell>
                  <TableCell>{t.to}</TableCell>
                  <TableCell className="font-medium">{t.amount}</TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "Completed"
                          ? "default"
                          : t.status === "Pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {t.status}
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
