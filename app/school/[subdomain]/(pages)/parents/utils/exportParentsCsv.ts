import type { ParentsListItem } from "./mapGraphqlParent";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportParentsToCsv(
  parents: ParentsListItem[],
  filename = "parents-export.csv",
) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Relationship",
    "Occupation",
    "Address",
    "Status",
    "Children",
    "Grades",
    "Registered",
  ];

  const rows = parents.map((parent) => [
    parent.name,
    parent.email,
    parent.phone,
    parent.relationship,
    parent.occupation,
    parent.homeAddress,
    parent.status === "active" ? "Active" : "Not activated",
    parent.students.map((s) => s.name).join("; "),
    parent.grades.join("; "),
    parent.registrationDate
      ? new Date(parent.registrationDate).toISOString().split("T")[0]
      : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
