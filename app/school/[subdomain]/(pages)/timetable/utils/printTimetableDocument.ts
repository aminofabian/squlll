const FONTS_SETTLE_MS = 150;
const REMOVE_FRAME_AFTER_MS = 1000;

/** Opens the browser print dialog for a standalone HTML document, leaving the page untouched. */
export function printTimetableDocument(html: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("title", "Timetable print");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);

  const win = frame.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  const removeFrame = () => setTimeout(() => frame.remove(), REMOVE_FRAME_AFTER_MS);
  win.addEventListener("afterprint", removeFrame, { once: true });
  setTimeout(() => {
    win.focus();
    win.print();
  }, FONTS_SETTLE_MS);
}
