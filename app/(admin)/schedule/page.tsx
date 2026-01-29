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

const sessions = [
  { id: 1, student: "Ayesha Malik", teacher: "Fatima K.", subject: "Mathematics", date: "Today 3:00 PM", duration: "1 hr", status: "Confirmed" },
  { id: 2, student: "Hassan Ahmed", teacher: "Ahmed Hassan", subject: "Coding", date: "Tomorrow 2:00 PM", duration: "1.5 hrs", status: "Confirmed" },
  { id: 3, student: "Omar Sheikh", teacher: "John Smith", subject: "English", date: "Jan 30, 10:00 AM", duration: "1 hr", status: "Pending" },
  { id: 4, student: "Fatima Khan", teacher: "Fatima K.", subject: "Chemistry", date: "Jan 31, 4:00 PM", duration: "1 hr", status: "Confirmed" },
];

export default function SchedulePage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
        <p className="text-muted-foreground">Manage tutoring schedules and sessions.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Sessions</CardTitle>
          <span className="text-sm text-muted-foreground">{sessions.length} sessions</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student}</TableCell>
                  <TableCell>{s.teacher}</TableCell>
                  <TableCell>{s.subject}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.duration}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Confirmed" ? "default" : "secondary"}>
                      {s.status}
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
