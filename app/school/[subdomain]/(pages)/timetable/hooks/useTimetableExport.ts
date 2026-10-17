import { useCallback, useState } from "react";
import { downloadTimetablePdf } from "../utils/downloadTimetablePdf";
import {
  buildPrintableTimetable,
  type PrintOrientation,
  type PrintSource,
} from "../utils/printableTimetable";
import { printTimetableDocument } from "../utils/printTimetableDocument";
import { renderTimetablePrintHtml } from "../utils/renderTimetablePrintHtml";

const UNSAFE_FILE_CHARS = /[\\/:*?"<>|]+/g;

function today() {
  return new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function pdfFileName(title: string, orientation: PrintOrientation) {
  return `${title.replace(UNSAFE_FILE_CHARS, "-")} timetable (A4 ${orientation}).pdf`;
}

/** Print or download the class on screen as one A4 page; `getSource` reads the latest grid. */
export function useTimetableExport(params: {
  getSource: () => PrintSource | null;
  onError: (message: string) => void;
}) {
  const { getSource, onError } = params;
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const print = useCallback(
    (orientation: PrintOrientation) => {
      const source = getSource();
      if (!source) return;
      printTimetableDocument(renderTimetablePrintHtml(buildPrintableTimetable(source), orientation, today()));
      setOpen(false);
    },
    [getSource],
  );

  const download = useCallback(
    async (orientation: PrintOrientation) => {
      const source = getSource();
      if (!source) return;
      setDownloading(true);
      try {
        await downloadTimetablePdf({
          timetable: buildPrintableTimetable(source),
          orientation,
          generatedOn: today(),
          fileName: pdfFileName(source.title, orientation),
        });
        setOpen(false);
      } catch {
        onError("The PDF could not be created. Try Print and choose “Save as PDF” instead.");
      } finally {
        setDownloading(false);
      }
    },
    [getSource, onError],
  );

  return { open, setOpen, downloading, print, download };
}
