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

const students = [
  { id: 1, name: "Ayesha Malik", email: "ayesha@example.com", location: "Karachi", subjects: "Math, Physics", joined: "Jan 2025", status: "Active" },
  { id: 2, name: "Hassan Ahmed", email: "hassan@example.com", location: "Lahore", subjects: "English, Coding", joined: "Dec 2024", status: "Active" },
  { id: 3, name: "Fatima Khan", email: "fatima@example.com", location: "Islamabad", subjects: "Science, Chemistry", joined: "Jan 2025", status: "Active" },
  { id: 4, name: "Zainab Ali", email: "zainab@example.com", location: "Karachi", subjects: "Math, English", joined: "Nov 2024", status: "Inactive" },
  { id: 5, name: "Omar Sheikh", email: "omar@example.com", location: "Rawalpindi", subjects: "Physics, Coding", joined: "Jan 2025", status: "Active" },
];

export default function StudentsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground">View and manage all registered students.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered Students</CardTitle>
          <span className="text-sm text-muted-foreground">{students.length} students</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.location}</TableCell>
                  <TableCell>{s.subjects}</TableCell>
                  <TableCell>{s.joined}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "Active" ? "default" : "secondary"}>
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
