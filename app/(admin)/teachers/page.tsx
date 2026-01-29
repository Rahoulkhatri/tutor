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

const teachers = [
  { id: 1, name: "Maria Garcia", email: "maria@example.com", subjects: "Math, Physics", rate: "$45/hr", students: 24, status: "Active" },
  { id: 2, name: "John Smith", email: "john@example.com", subjects: "English, Literature", rate: "$38/hr", students: 18, status: "Active" },
  { id: 3, name: "Fatima K.", email: "fatima@example.com", subjects: "Science, Chemistry", rate: "Rs. 2,000/hr", students: 32, status: "Active" },
  { id: 4, name: "Ahmed Hassan", email: "ahmed@example.com", subjects: "Coding, CS", rate: "Rs. 2,500/hr", students: 15, status: "Active" },
  { id: 5, name: "Sana Khan", email: "sana@example.com", subjects: "English, Urdu", rate: "Rs. 1,800/hr", students: 0, status: "Inactive" },
];

export default function TeachersPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
        <p className="text-muted-foreground">View and manage all registered teachers.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered Teachers</CardTitle>
          <span className="text-sm text-muted-foreground">{teachers.length} teachers</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Active Students</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.subjects}</TableCell>
                  <TableCell>{t.rate}</TableCell>
                  <TableCell>{t.students}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === "Active" ? "default" : "secondary"}>
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
