import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ratings = [
  { id: 1, teacher: "Fatima K.", student: "Ayesha Malik", subject: "Mathematics", rating: 4.9, comment: "Very clear and patient." },
  { id: 2, teacher: "Ahmed Hassan", student: "Hassan Ahmed", subject: "Coding", rating: 4.8, comment: "Great examples and pace." },
  { id: 3, teacher: "Maria Garcia", student: "Zainab Ali", subject: "Physics", rating: 5.0, comment: "Excellent tutor." },
  { id: 4, teacher: "John Smith", student: "Omar Sheikh", subject: "English", rating: 4.7, comment: "Helpful feedback on essays." },
];

export default function RatingsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Ratings</h1>
        <p className="text-muted-foreground">View and manage tutor and session ratings.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Ratings</CardTitle>
          <span className="text-sm text-muted-foreground">{ratings.length} ratings</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.teacher}</TableCell>
                  <TableCell>{r.student}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell>
                    <span className="font-medium">⭐ {r.rating}</span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
