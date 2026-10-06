import { describe, expect, it } from "vitest";
import {
  buildTeacherInviteRequest,
  csvTeacherTemplate,
  jsonTeacherTemplate,
  parseTeacherFile,
  resolveTeacherRows,
  splitFullName,
} from "./teacher-import";

describe("splitFullName", () => {
  it("splits first and last name", () => {
    expect(splitFullName("Grace Wanjiru Mwangi")).toEqual({
      firstName: "Grace",
      lastName: "Wanjiru Mwangi",
      fullName: "Grace Wanjiru Mwangi",
    });
  });

  it("handles a single name", () => {
    expect(splitFullName("Grace")).toEqual({
      firstName: "Grace",
      lastName: "Grace",
      fullName: "Grace",
    });
  });
});

describe("resolveTeacherRows", () => {
  it("accepts a complete row", () => {
    const [row] = resolveTeacherRows([
      {
        name: "Grace Mwangi",
        email: "grace@example.com",
        phone: "+254712345678",
        department: "Mathematics",
        gender: "female",
      },
    ]);
    expect(row.errors).toEqual([]);
    expect(row.gender).toBe("FEMALE");
    expect(row.department).toBe("mathematics");
    expect(row.departmentDefaulted).toBe(false);
  });

  it("requires name, email and phone", () => {
    const [row] = resolveTeacherRows([{}]);
    expect(row.errors).toContain("Name is required.");
    expect(row.errors).toContain("Email is required.");
    expect(row.errors).toContain("Phone is required.");
  });

  it("flags a malformed email", () => {
    const [row] = resolveTeacherRows([
      { name: "A B", email: "not-an-email", phone: "+254712345678" },
    ]);
    expect(row.errors.join(" ")).toMatch(/doesn't look right/);
  });

  it("flags a malformed phone", () => {
    const [row] = resolveTeacherRows([
      { name: "A B", email: "a@b.com", phone: "0712345678" },
    ]);
    expect(row.errors.join(" ")).toMatch(/should be like \+254/);
  });

  it("defaults the department and warns", () => {
    const [row] = resolveTeacherRows([
      { name: "A B", email: "a@b.com", phone: "+254712345678" },
    ]);
    expect(row.department).toBe("general");
    expect(row.departmentDefaulted).toBe(true);
    expect(row.warnings.join(" ")).toMatch(/Department defaulted/);
  });

  it("defaults gender to male and warns on nonsense", () => {
    const [row] = resolveTeacherRows([
      { name: "A B", email: "a@b.com", phone: "+254712345678", gender: "??" },
    ]);
    expect(row.gender).toBe("MALE");
    expect(row.warnings.join(" ")).toMatch(/Gender not recognised/);
  });
});

describe("buildTeacherInviteRequest", () => {
  it("maps a resolved row to the invite payload", () => {
    const [row] = resolveTeacherRows([
      {
        name: "Grace Mwangi",
        email: "Grace@Example.com",
        phone: "+254712345678",
        department: "Mathematics",
        gender: "female",
      },
    ]);
    expect(buildTeacherInviteRequest(row)).toEqual({
      email: "grace@example.com",
      fullName: "Grace Mwangi",
      firstName: "Grace",
      lastName: "Mwangi",
      gender: "FEMALE",
      department: "mathematics",
      phoneNumber: "+254712345678",
    });
  });
});

describe("teacher templates", () => {
  it("CSV template starts with the column headings", () => {
    const [header] = csvTeacherTemplate().split("\n");
    expect(header).toBe("name,email,phone,department,gender");
  });

  it("JSON template is a parseable array", () => {
    expect(Array.isArray(JSON.parse(jsonTeacherTemplate()))).toBe(true);
  });
});

const hasFile = typeof File !== "undefined";

describe.runIf(hasFile)("parseTeacherFile", () => {
  it("reads a CSV with aliased headings", async () => {
    const csv = [
      "Full Name,Email,Mobile,Dept,Sex",
      "Grace Mwangi,grace@example.com,+254712345678,Mathematics,F",
      "Peter Kamau,peter@example.com,+254701234567,,M",
    ].join("\n");
    const file = new File([csv], "teachers.csv", { type: "text/csv" });
    const rows = await parseTeacherFile(file);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: "Grace Mwangi",
      email: "grace@example.com",
      phone: "+254712345678",
      department: "Mathematics",
    });
    expect(rows[1].name).toBe("Peter Kamau");
  });

  it("reads a JSON list of teachers", async () => {
    const json = JSON.stringify([
      { name: "Grace", email: "grace@example.com", phone: "+254712345678" },
    ]);
    const file = new File([json], "teachers.json", { type: "application/json" });
    const rows = await parseTeacherFile(file);
    expect(rows[0]).toMatchObject({ name: "Grace", email: "grace@example.com" });
  });
});
