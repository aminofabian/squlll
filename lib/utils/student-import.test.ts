import { describe, expect, it } from "vitest";
import {
  buildCreateRequestFromRow,
  csvTemplate,
  emailFromName,
  jsonTemplate,
  parseImportFile,
  resolveImportRows,
  rowsToCsv,
  type GradeOption,
} from "./student-import";

const GRADES: GradeOption[] = [
  {
    id: "g4",
    name: "Grade 4",
    shortName: null,
    streams: [
      { id: "g4a", name: "A" },
      { id: "g4b", name: "B" },
    ],
  },
  { id: "g5", name: "Grade 5", shortName: null, streams: [] },
  { id: "g10", name: "Grade 10", shortName: null, streams: [] },
  { id: "pp1", name: "PP1", shortName: null, streams: [{ id: "pp1x", name: "Playgroup" }] },
];

describe("emailFromName", () => {
  it("builds a portal email from the name", () => {
    expect(emailFromName("Jane Wanjiku")).toBe("janewanjiku@squl.ac.ke");
  });

  it("falls back when the name has no letters", () => {
    expect(emailFromName("123")).toBe("studentname@squl.ac.ke");
  });
});

describe("resolveImportRows", () => {
  it("keeps name + class and defaults the rest", () => {
    const [row] = resolveImportRows([{ name: "Jane Wanjiku", class: "Grade 5" }], GRADES);

    expect(row.errors).toEqual([]);
    expect(row.gradeId).toBe("g5");
    expect(row.gender).toBe("male");
    expect(row.email).toBe("janewanjiku@squl.ac.ke");
    expect(row.emailGenerated).toBe(true);
    expect(row.admissionGenerated).toBe(true);
    expect(row.admissionNumber).toMatch(/^AUTO-/);
  });

  it("requires name and class", () => {
    const [row] = resolveImportRows([{ stream: "A" }], GRADES);
    expect(row.errors).toContain("Name is required.");
    expect(row.errors).toContain("Class is required.");
  });

  it("flags an unknown class", () => {
    const [row] = resolveImportRows([{ name: "X", class: "Grade 9" }], GRADES);
    expect(row.errors[0]).toMatch(/isn't set up/);
  });

  it("asks for a stream when the class has several", () => {
    const [row] = resolveImportRows([{ name: "X", class: "Grade 4" }], GRADES);
    expect(row.errors[0]).toMatch(/Choose a stream/);
  });

  it("auto-picks the only stream", () => {
    const [row] = resolveImportRows([{ name: "X", class: "PP1" }], GRADES);
    expect(row.errors).toEqual([]);
    expect(row.streamId).toBe("pp1x");
  });

  it("resolves an explicit stream", () => {
    const [row] = resolveImportRows(
      [{ name: "X", class: "Grade 4", stream: "B" }],
      GRADES,
    );
    expect(row.errors).toEqual([]);
    expect(row.streamId).toBe("g4b");
  });

  it("understands a stream glued to the class", () => {
    const [row] = resolveImportRows([{ name: "X", class: "Grade 4A" }], GRADES);
    expect(row.errors).toEqual([]);
    expect(row.gradeId).toBe("g4");
    expect(row.streamId).toBe("g4a");
  });

  it("matches the longest class name first (Grade 10 vs Grade 1)", () => {
    const [row] = resolveImportRows([{ name: "X", class: "Grade 10" }], GRADES);
    expect(row.gradeId).toBe("g10");
  });

  it("rejects a stream that isn't in the class", () => {
    const [row] = resolveImportRows(
      [{ name: "X", class: "Grade 4", stream: "Z" }],
      GRADES,
    );
    expect(row.errors[0]).toMatch(/isn't in Grade 4/);
  });

  it("parses gender and warns on nonsense", () => {
    const [girl] = resolveImportRows(
      [{ name: "X", class: "Grade 5", gender: "girl" }],
      GRADES,
    );
    expect(girl.gender).toBe("female");

    const [weird] = resolveImportRows(
      [{ name: "X", class: "Grade 5", gender: "nonsense" }],
      GRADES,
    );
    expect(weird.gender).toBe("male");
    expect(weird.warnings.join(" ")).toMatch(/Gender not recognised/);
  });

  it("keeps provided admission number and email", () => {
    const [row] = resolveImportRows(
      [
        {
          name: "X",
          class: "Grade 5",
          admission_number: "KPS/001",
          email: "X@Example.com",
        },
      ],
      GRADES,
    );
    expect(row.admissionNumber).toBe("KPS/001");
    expect(row.admissionGenerated).toBe(false);
    expect(row.email).toBe("x@example.com");
    expect(row.emailGenerated).toBe(false);
  });
});

describe("buildCreateRequestFromRow", () => {
  it("maps a resolved row to the API payload", () => {
    const [row] = resolveImportRows(
      [{ name: "Jane", class: "Grade 4", stream: "A", phone: "+254700000000" }],
      GRADES,
    );
    const request = buildCreateRequestFromRow(row);
    expect(request).toMatchObject({
      name: "Jane",
      gender: "male",
      grade: "g4",
      stream: "g4a",
      phone: "+254700000000",
      student_email: "jane@squl.ac.ke",
    });
  });

  it("falls back to N/A when no phone is given", () => {
    const [row] = resolveImportRows([{ name: "Jane", class: "Grade 5" }], GRADES);
    expect(buildCreateRequestFromRow(row).phone).toBe("N/A");
  });
});

describe("templates and CSV", () => {
  it("CSV template starts with the column headings", () => {
    const [header] = csvTemplate().split("\n");
    expect(header).toBe("name,class,stream,admission_number,gender,phone,email");
  });

  it("JSON template is a parseable array", () => {
    expect(Array.isArray(JSON.parse(jsonTemplate()))).toBe(true);
  });

  it("quotes values that need it", () => {
    const csv = rowsToCsv(["name", "reason"], [["O'Brien", 'has, a "quote"']]);
    expect(csv).toBe('name,reason\nO\'Brien,"has, a ""quote"""');
  });
});

const hasFile = typeof File !== "undefined";

describe.runIf(hasFile)("parseImportFile", () => {
  it("reads a CSV with aliased headings", async () => {
    const csv = [
      "Full Name,Grade,Section,Mobile",
      "Jane Wanjiku,Grade 4,A,+254712345678",
      "Brian Otieno,Grade 4,B,",
    ].join("\n");
    const file = new File([csv], "students.csv", { type: "text/csv" });
    const rows = await parseImportFile(file);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      name: "Jane Wanjiku",
      class: "Grade 4",
      stream: "A",
      phone: "+254712345678",
    });
    expect(rows[1].name).toBe("Brian Otieno");
  });

  it("reads a JSON array of students", async () => {
    const json = JSON.stringify([{ name: "Jane", class: "Grade 4" }]);
    const file = new File([json], "students.json", { type: "application/json" });
    const rows = await parseImportFile(file);
    expect(rows[0]).toMatchObject({ name: "Jane", class: "Grade 4" });
  });

  it("rejects an unsupported extension", async () => {
    const file = new File(["nope"], "students.pdf", { type: "application/pdf" });
    await expect(parseImportFile(file)).rejects.toThrow(/Unsupported file/);
  });
});
