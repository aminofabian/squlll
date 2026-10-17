export const AUTO_BUILD_COPY = {
  action: "Build my timetable",
  actionShort: "Build for me",
  busy: "Building your week…",
  menu: "Let SQUL build the timetable",
  toolbarHint:
    "Let SQUL build the whole week for you — every lesson placed, doubles kept together, no teacher in two classes at once. Fine-tune by hand afterwards.",
  drawerTitle: "Let SQUL build your timetable",
  drawerDescription:
    "Tell SQUL what each class learns, add any teacher limits, and it builds the whole week for you.",
  drawerScopeAll: "SQUL builds the week for every class",
  hintsTitle: "How SQUL builds your timetable",
  hintsLabel: "Hints on how SQUL builds your timetable",
  closeLabel: "Close timetable builder",
  buildStepLabel: "Build",
  rebuild: "Rebuild",
  rebuildFillGaps: "Fill the empty periods only",
  rebuildKeepManual: "Rebuild, keep lessons I placed",
  rebuildEverything: "Start over from scratch",
  banner: {
    startEyebrow: "Save hours",
    startTitle: "Let SQUL build your timetable",
    startBody:
      "Skip the puzzle. SQUL places every lesson across the week, keeps double lessons together and never books a teacher twice. You can move anything afterwards.",
    startAction: "Build it for me",
    finishEyebrow: "Almost empty",
    finishTitle: "Let SQUL fill in the rest",
    finishBody: (filledSlots: number, totalSlots: number) =>
      `${filledSlots} of ${totalSlots} periods have lessons. SQUL can fill the empty ones without moving anything you've placed.`,
    finishAction: "Fill the rest for me",
    manualAction: "I'll do it by hand",
    dismissLabel: "Hide this suggestion",
    steps: ["Weekly lessons", "Teacher limits", "Build"],
  },
} as const;
