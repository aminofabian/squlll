"use client";

import { useEffect, useState } from "react";
import { schoolPortalUrl } from "@/lib/auth/post-login-navigation";
import { requestReceiptShareToken } from "./requestReceiptShareToken";

export function useReceiptShareLink(
  subdomain: string,
  paymentId: string | null | undefined,
): string {
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink("");
    if (!paymentId) return;

    let cancelled = false;
    requestReceiptShareToken(paymentId)
      .then((token) => {
        if (!cancelled) setLink(schoolPortalUrl(subdomain, `/receipt/${token}`));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [subdomain, paymentId]);

  return link;
}
