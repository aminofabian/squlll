"use client";

import { useEffect, useState } from "react";
import {
  readFeeLetterTemplate,
  writeFeeLetterTemplate,
} from "../lib/feeLetter/storage";
import type { FeeLetterTemplateId } from "../lib/feeLetter/types";
import { DEFAULT_FEE_LETTER_TEMPLATE } from "../lib/feeLetter/templates";
import { feeLetterGradeStorageKey } from "../lib/feePlanDetailUrl";

type UseFeeLetterPreviewPrefsOptions = {
  planSlug: string;
  gradeLabels: string[];
  defaultTermIds: string[];
};

export function useFeeLetterPreviewPrefs({
  planSlug,
  gradeLabels,
  defaultTermIds,
}: UseFeeLetterPreviewPrefsOptions) {
  const templateScope = planSlug || "school";
  const [letterTemplateId, setLetterTemplateId] =
    useState<FeeLetterTemplateId>(DEFAULT_FEE_LETTER_TEMPLATE);
  const [previewGrade, setPreviewGrade] = useState("");
  const [letterTermIds, setLetterTermIds] = useState<string[]>([]);
  const [letterPreviewOpen, setLetterPreviewOpen] = useState(false);

  useEffect(() => {
    setLetterTemplateId(readFeeLetterTemplate(templateScope));
  }, [templateScope]);

  useEffect(() => {
    writeFeeLetterTemplate(templateScope, letterTemplateId);
  }, [templateScope, letterTemplateId]);

  useEffect(() => {
    if (gradeLabels.length === 0) {
      setPreviewGrade("");
      return;
    }
    const storageKey = planSlug ? feeLetterGradeStorageKey(planSlug) : null;
    const saved =
      storageKey && typeof window !== "undefined"
        ? window.localStorage.getItem(storageKey)
        : null;
    setPreviewGrade((prev) => {
      if (saved && gradeLabels.includes(saved)) return saved;
      if (prev && gradeLabels.includes(prev)) return prev;
      return gradeLabels[0];
    });
  }, [planSlug, gradeLabels]);

  useEffect(() => {
    if (!planSlug || !previewGrade) return;
    try {
      window.localStorage.setItem(
        feeLetterGradeStorageKey(planSlug),
        previewGrade,
      );
    } catch {
      /* ignore quota */
    }
  }, [planSlug, previewGrade]);

  useEffect(() => {
    if (defaultTermIds.length === 0) {
      setLetterTermIds([]);
      return;
    }
    setLetterTermIds((prev) => {
      const valid = prev.filter((id) => defaultTermIds.includes(id));
      if (valid.length > 0) return valid;
      return defaultTermIds;
    });
  }, [defaultTermIds.join(",")]);

  return {
    letterTemplateId,
    setLetterTemplateId,
    previewGrade,
    setPreviewGrade,
    letterTermIds,
    setLetterTermIds,
    letterPreviewOpen,
    setLetterPreviewOpen,
  };
}
