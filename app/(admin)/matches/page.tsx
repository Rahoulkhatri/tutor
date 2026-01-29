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

const matches = [
  { id: 1, student: "Ayesha Malik", teacher: "Fatima K.", subject: "Mathematics", started: "Jan 15, 2025", status: "Active" },
  { id: 2, student: "Hassan Ahmed", teacher: "Ahmed Hassan", subject: "Coding", started: "Jan 10, 2025", status: "Active" },
  { id: 3, student: "Zainab Ali", teacher: "Maria Garcia", subject: "Physics", started: "Dec 20, 2024", status: "Completed" },
  { id: 4, student: "Omar Sheikh", teacher: "John Smith", subject: "English", started: "Jan 18, 2025", status: "Active" },
  { id: 5, student: "Fatima Khan", teacher: "Fatima K.", subject: "Chemistry", started: "Jan 5, 2025", status: "Pending" },
];

export default function MatchesPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Matches</h1>
        <p className="text-muted-foreground">View and manage student–teacher matches.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Matches</CardTitle>
          <span className="text-sm text-muted-foreground">{matches.length} matches</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.student}</TableCell>
                  <TableCell>{m.teacher}</TableCell>
                  <TableCell>{m.subject}</TableCell>
                  <TableCell>{m.started}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        m.status === "Active"
                          ? "default"
                          : m.status === "Completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {m.status}
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
