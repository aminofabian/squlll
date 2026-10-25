import { describe, expect, it } from "vitest";
import { suggestDomainNames, tokenizeSchoolName } from "./domainSuggestions";

const labels = (name: string) => suggestDomainNames(name).map((item) => item.label);

describe("suggestDomainNames", () => {
  it("keeps the distinctive name and drops Primary/Junior/School", () => {
    expect(labels("Qarsaabula Primary and Junior School")).toEqual([
      "qarsaabula",
      "qarsaabulaschool",
      "qarsaabulaacademy",
      "qarsaabulaprimary",
      "qps",
    ]);
  });

  it("shortens two-word distinctive names", () => {
    expect(labels("Green Valley Primary School")[0]).toBe("greenvalley");
    expect(labels("Bright Future Junior and Senior School")[0]).toBe(
      "brightfuture",
    );
  });

  it("normalises apostrophes, ampersands and punctuation", () => {
    expect(labels("St. Mary's Academy")[0]).toBe("stmarys");
    expect(labels("King's & Queen's Academy")[0]).toBe("kingsqueens");
    expect(labels("St. Peter's Anglican Primary and Junior School")[0]).toBe(
      "stpeters",
    );
  });

  it("drops 'Academy of Excellence' but keeps the place name", () => {
    expect(labels("Nairobi Hills Academy of Excellence")[0]).toBe(
      "nairobihills",
    );
  });

  it("offers the core, descriptive, branding and level strategies", () => {
    const items = suggestDomainNames("Mwangaza Education Centre");
    expect(items.map((item) => item.strategy)).toEqual([
      "core",
      "descriptive",
      "branding",
    ]);
  });

  it("returns no suggestions when the name has no distinctive word", () => {
    expect(suggestDomainNames("Primary School")).toEqual([]);
    expect(suggestDomainNames("")).toEqual([]);
  });

  it("passes a complete domain straight through", () => {
    const items = suggestDomainNames("https://www.Mirema.ac.ke/");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      domain: "mirema.ac.ke",
      strategy: "exact",
    });
  });

  it("only emits valid, unique, reasonably short labels", () => {
    const items = suggestDomainNames(
      "Our Lady of Fatima Girls Primary and Junior School",
    );
    const seen = new Set<string>();
    for (const item of items) {
      expect(item.label).toMatch(/^[a-z0-9]+$/);
      expect(item.label.length).toBeLessThanOrEqual(30);
      expect(seen.has(item.label)).toBe(false);
      seen.add(item.label);
    }
    expect(items.length).toBeLessThanOrEqual(5);
  });

  it("tokenizes consistently", () => {
    expect(tokenizeSchoolName("St. Mary's  Academy")).toEqual([
      "st",
      "marys",
      "academy",
    ]);
  });
});
