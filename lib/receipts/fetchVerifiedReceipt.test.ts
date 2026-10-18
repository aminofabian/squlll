import { describe, expect, it, vi } from "vitest";
import { fetchVerifiedReceipt } from "./fetchVerifiedReceipt";

const VALID_TOKEN = "0123456789abcdef0123456789abcdef";

const RECEIPT = {
  schoolName: "Mirema School",
  receiptNumber: "RCPT-102",
  amount: 12500,
  receiptDate: "2026-10-18T07:30:00.000Z",
  studentName: "Amina Wanjiku",
  admissionNumber: "ADM-001",
  className: "Grade 4",
  termName: "Term 3",
  academicYearName: "2026",
  paymentMethod: "MPESA",
  transactionReference: "QK47X2",
  isVoided: false,
};

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

describe("fetchVerifiedReceipt", () => {
  it("returns the receipt the server verified", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ data: { verifiedReceipt: RECEIPT } }),
    );

    const result = await fetchVerifiedReceipt("mirema", VALID_TOKEN, fetchImpl);

    expect(result).toEqual(RECEIPT);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toEqual({
      subdomain: "mirema",
      token: VALID_TOKEN,
    });
  });

  it("never calls the server for malformed tokens", async () => {
    const fetchImpl = vi.fn();

    await expect(
      fetchVerifiedReceipt("mirema", "QK47X2?amount=999999", fetchImpl),
    ).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns null when the server does not recognise the token", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ data: { verifiedReceipt: null } }),
    );

    await expect(
      fetchVerifiedReceipt("mirema", VALID_TOKEN, fetchImpl),
    ).resolves.toBeNull();
  });

  it("returns null on network or HTTP failure", async () => {
    const failing = vi.fn(async () => {
      throw new Error("offline");
    });
    const httpError = vi.fn(async () => jsonResponse({}, false));

    await expect(
      fetchVerifiedReceipt("mirema", VALID_TOKEN, failing),
    ).resolves.toBeNull();
    await expect(
      fetchVerifiedReceipt("mirema", VALID_TOKEN, httpError),
    ).resolves.toBeNull();
  });
});
