# Timetable & Whole-School View — Detailed Scope

This document describes the work completed (and optional follow-ups) for the school timetable: whole-school combined view, class/stream listing, performance, statistics, and related teachers/invite fixes.

---

## Phase 0 — Foundation & Context

### 0.1 Problem statement

Admins need a **single view of the entire school schedule** without picking a class first: which grades/streams are in each period, what subject is taught, and who teaches it. The existing flow was grade-first only, with inconsistent styling vs Classes/Timetable, and several bugs (teacher invite, email, stats).

### 0.2 Success criteria

- Whole-school grid shows **every class/stream** in every slot, with or without a lesson
- Filled slots show **grade + stream + subject code**; hover shows **full names**
- Double periods appear in **both** consecutive periods
- Page loads with **skeleton UI** and **faster parallel fetches**
- **Filled/total** stats reflect real capacity (not inflated counts like 18,000)
- Teachers page and invite flow work reliably
- *(Planned)* Failed fetches show recoverable error UI, not blank screens
- *(Planned)* Admins can refresh stale data and see conflicts in the combined view

### 0.3 Document status legend

| Label | Meaning |
|-------|---------|
| **Done** | Implemented in codebase |
| **Planned** | Scoped below, not yet built |
| **Backlog** | Phase 11 or lower priority |

### 0.4 Out of scope (unless added later)

- Backend API consolidation (single endpoint for timetable)
- Publishing/printing whole-school view
- Per-stream day templates with different period counts
- Mobile-optimized whole-school grid
- Automated tests for all UI states

---

## Phase 1 — Teachers Page Alignment

### Step 1.1 — Page shell

- Match Classes/Timetable aesthetic: `bg-slate-50/80`, `max-w-5xl`, compact header
- Collapsible sidebar (`w-64`), minimal chrome

### Step 1.2 — Component restyle

| Component | Changes |
|-----------|---------|
| `TeachersStats` | Summary line + compact stat chips |
| `TeachersSearchSidebar` | Minimal search + scrollable staff list |
| `TeachersTable` | Slate borders, white cards; remove heavy primary/mono styling |
| `PendingInvitations` | Same palette |
| `TeacherDetailView` | Slate cards (partial; inner tabs may remain) |
| `teachers-ui.ts` | Shared panel/table styles |

### Step 1.3 — Bug fixes

- **Double submit** on Add Teacher: `isSubmittingRef`, block form while loading
- **“Teacher not found”** on detail: resolve via `getTeachers` (match `teacher.id` OR `teacher.user.id`), not user ID alone
- **JSX fix** in `TeachersTable` empty state (missing closing `</div>`)

### Step 1.4 — Deliverables

- Restyled `/teachers` page consistent with Classes
- Reliable add → view teacher flow

---

## Phase 2 — Teacher Invite & Email UX

### Step 2.1 — Root cause

Teacher profile + invitation saved, then Resend email throws → mutation fails in UI despite success in DB.

### Step 2.2 — Backend

- Wrap email send in try/catch in `generic-inviter.provider.ts`
- Return `emailSent: false` instead of throwing
- Expose `emailSent` on `InviteTeacherResponse` + GraphQL schema

### Step 2.3 — Frontend

- `CreateTeacherDrawer`: treat email failure as **partial success** (success modal + warning toast)
- `InvitationSuccessModal`: copy for email-not-sent case
- `invite-teacher` API route: request `emailSent` in mutation
- Invalidate `getTeachers` on successful invite

### Step 2.4 — Deliverables

- Invite completes in UI even if email fails in dev
- User can **Resend** from pending invitations
- Note: actual email delivery still depends on Resend config in dev

---

## Phase 3 — Whole-School Combined Timetable (Core) **(Done)**

### Step 3.1 — Mode switch

- When **no grade selected**: show whole-school combined grid
- When **grade selected**: existing single-class grid unchanged
- Copy: “Every class and stream in each slot — filled cells show the lesson; empty cells are open. Tap to open a class.”

### Step 3.2 — Data layer

**New:** `utils/lessonShortcodes.ts`

- `getSubjectShortCode`, `getGradeShortCode`
- `formatCombinedLessonShortcode` → e.g. `MAT-G7`
- `formatCombinedGradeLabel` → e.g. `G7 · East`
- `parseLessonShortcode` (for chip UI splits)

**New/updated:** `useSchoolCombinedEntries()` in `hooks/useTimetableData.ts`

- `getCombinedEntriesFor(dayOfWeek, period)` returns entries for a cell
- Resolve period from `entry.periodNumber` or `timeSlotId`
- Respect breaks between periods for double-period span

**New:** `buildGradeStreamCatalog(grades)`

- One row per grade **or** one row per stream if streams exist
- Sort by grade level, then stream name

### Step 3.3 — Grid integration

- `AdminTimetableGrid`: `schoolCombined` prop
- `CombinedLessonCell` + `CombinedShortcodeChip` for combined cells
- `onCombinedLessonClick` → set grade + stream, switch to class view
- Time column highlights double-period rows in combined mode

### Step 3.4 — Deliverables **(Done)**

- Whole-school view accessible from timetable with no class selected
- Tap chip → opens that class (and stream if set)

---

## Phase 4 — Combined Cell UI (Visual Design) **(Done)**

### Step 4.1 — Layout

- **2-column grid** inside each cell when multiple classes
- Single class in cell can span full width
- **Dense mode** when many entries (tighter gaps, scroll `max-h-56`)
- Whole-cell empty state (no lessons in slot): dashed border + `—` only when the catalog is empty; per-class empties use muted chips (`isEmpty`) per Phase 6

### Step 4.2 — Chip content (evolution)

| Iteration | Display |
|-----------|---------|
| v1 | Subject–grade shortcode (`MAT-G7`) |
| v2 | Grade/stream first, subject code second |
| v3 | **All grades/streams** listed; empty = muted chip with `—` |

### Step 4.3 — Styling rules (final)

- No left accent rail; minimal `rounded` corners
- Light slate border; subtle subject-tint gradient when filled
- Empty: dashed border, muted grade text
- Double period: **`2×`** on first slot, **`2/2`** on continuation (dashed border)

### Step 4.4 — Hover tooltips

- Radix tooltip (multiline), not native `title`
- **Filled:** full grade name · stream, full subject name, teacher name; optional room + double-period note
- **Empty:** full grade/stream + “No lesson scheduled”
- Data: `gradeFullLabel` on combined entries

### Step 4.5 — Deliverables **(Done)**

- Readable at-a-glance chips; rich detail on hover
- Consistent with slate/Classes design language

### Step 4.6 — Accessibility basics **(Done)**

The combined grid is a complex data table. Screen reader and keyboard support are not yet specified in implementation.

**Layout note:** The combined view uses a semantic `<table>`. Prefer native table semantics (`<th>`, `<td>`, captions) plus descriptive labels on each chip. Only add `role="grid"` / nested grid roles if moving away from table layout — duplicate roles can confuse screen readers.

| Requirement | Target behavior |
|-------------|-----------------|
| Table / grid | `<table>` with `aria-label="Whole-school timetable"` (combined) or `"Timetable"` (single-class) |
| Structure | Rows via `<tr>` — native table semantics preserved |
| Keyboard | `Tab` between chips (buttons are natively focusable); `Enter` / `Space` to open class |
| Empty chips | `aria-label="G4, A, — No lesson scheduled"` via `useMemo` in `CombinedShortcodeChip` |
| Filled chips | `aria-label="G4, A, Mathematics, Teacher Name, conflict"` via `useMemo` in `CombinedShortcodeChip` |
| Empty cell (no classes) | `role="presentation"` + `aria-label="No classes configured"` + `aria-hidden` on `—` |
| Tooltips | Radix Tooltip provides `role="tooltip"` + `aria-describedby` on trigger natively |

**Deliverables**

- Keyboard-only navigation through combined grid (buttons native)
- Meaningful labels for empty vs filled vs conflict chips

---

## Phase 4b — Error States & Failure Recovery **(Done)**

The doc covers **loading** (skeleton) and **empty** (dashed border + `—`) well, but not **fetch failure**. Current flow is optimistic-only: skeleton → content or empty. Partial failures can leave a blank or misleading UI.

### Step 4b.1 — Failure scenarios

| Scenario | Suggested behavior |
|----------|-------------------|
| Sidebar grades fail to load | Inline error in sidebar + **Retry** button; do not leave sidebar blank |
| Partial grades failure (e.g. 8 of 10 loaded) | If ≥ 50% loaded: render partial combined grid + banner "N grades couldn't be loaded. [Retry]". If < 50% fail: treat as full grid failure below |
| Entries for a day/period fail | Red warning icon in affected cell (distinct from empty); tooltip: “Failed to load” |
| Entire combined grid fails | Replace skeleton with `TimetableGridError` component + **Retry** (calls `reloadTimetableData`) |
| Single-class grid fails | Same pattern: error panel in grid area, preserve toolbar |
| Refresh fails (Phase 7.7) | **Keep existing data visible.** Show inline banner "Could not refresh — showing last loaded data" + Retry. Stale data is better than no data |

**Implementation notes (current architecture)**

- **Grades load is atomic today:** `loadGrades()` is one GraphQL request — full list or fail. “8 of 10 grades loaded” does not apply until the API supports partial grade lists. For v1, treat grades fetch as all-or-nothing; use the partial-grade banner only when the **catalog is incomplete** after a successful grades response (e.g. stream metadata missing) or when merging lessons leaves some class units without data.
- **Entries load in bulk:** `getTimetableEntries` / `loadSchoolTimetable` returns all term entries at once. Per-cell red “failed to load” icons are **not** available until fetch is split by day or period. Until then, entries failure = **grid-level** `TimetableGridError` or a period-row / banner message, not individual `<td>` errors.

### Step 4b.2 — Retry strategy

1. Auto-retry **1–2 times** with exponential backoff (e.g. 1s, 3s) on network/5xx errors
2. After retries exhausted → show friendly error copy + manual **Retry**
3. Track per-resource error state in Zustand store (`useTimetableStoreNew`) alongside existing loading flags (`gradesError`, `timetableError`). Storing them centrally lets `CombinedLessonCell` / `AdminTimetableGrid` / sidebar all read error state without prop drilling

**Loading state during retry** — keep the **current UI state visible** (skeleton or error component) during auto-retry. Only show a subtle "Retrying…" spinner inside the component. Do NOT flicker skeleton → error → skeleton → content: that causes visual jank.

### Step 4b.3 — Components **(Done)**

- `TimetableGridError` — icon, message, Retry button + compact variant for sidebar
- `RetryingSpinner` — animated indicator during auto-retry
- Wired into `page.tsx` load effects: 6 per-resource error flags tracked in `useState`, retry handler calls `handleRetry` re-fetching all resources

### Step 4b.4 — Deliverables **(Done)**

- No silent blank screens on fetch failure
- Admin can recover without full page refresh

---

## Phase 5 — Double Periods in Combined View **(Done)**

### Step 5.1 — Problem

Double lessons stored as **one entry** on first period with `isDoublePeriod: true`. Combined view only showed `2×` badge; second period empty.

### Step 5.2 — Logic

For period `P`, include:

1. **Direct** entries where `resolvePeriod(entry) === P`
2. **Continuations** from period `P-1` where `isDoublePeriod && !breakAfter(P-1)`

Mark continuations: `isDoubleContinuation: true`

### Step 5.3 — UI

- First half: solid chip + `2×`
- Second half: dashed chip + `2/2`
- Tooltip: “Double period” vs “Double period (2nd half)”

### Step 5.4 — Deliverables

- Double blocks visible in both consecutive slots per class/stream

---

## Phase 6 — List All Grades/Streams (Even Empty) **(Done)**

### Step 6.1 — Requirement

Every slot lists **all** configured classes, including those with no lesson yet (e.g. G4 A, G5 B).

### Step 6.2 — Implementation

- `getCombinedEntriesFor` returns **full catalog** merged with lessons:
  - Key: `gradeId + streamId`
  - Match lessons by canonical grade ID + stream
  - Missing lesson → `isEmpty: true` placeholder entry
- Empty chips still clickable → navigate to class to add lesson

### Step 6.3 — Deliverables

- Complete school roster visible in every period cell
- Clear visual distinction: filled vs empty

---

## Phase 7 — Performance & Loading UX

### Step 7.1 — Problems

- Sequential loads: grades → subjects/teachers/breaks → time slots → timetable
- `loadSchoolTimetable` fetched timetable then entries **sequentially**
- Blank screen until everything finished
- Duplicate fetch when grade pre-selected on load

### Step 7.2 — Optimizations **(Done)**

| Change | Location |
|--------|----------|
| Grades first, then **parallel** subjects, teachers, breaks, time slots, school timetable | `page.tsx` initial `useEffect` |
| **Parallel** `getSchoolTimetable` + `getTimetableEntries` | `useTimetableStoreNew.ts` |
| Parallel reload on grade/stream change | `page.tsx` + `reloadTimetableData` |
| Skip duplicate grade-scoped reload after initial load | `initialGradeScopeKey` ref |

### Step 7.3 — Skeleton UI **(Done)**

**New:** `components/TimetableGridSkeleton.tsx`

- `TimetableGridSkeleton` — period column, day headers, rows; paired chip skeletons for combined view
- `TimetableSidebarSkeleton` — search + class list placeholders
- Show when `isPageLoading` or `isLoadingTimetable`

### Step 7.4 — Loading states **(Done)**

- `isPageLoading` = initial + terms + academic years
- `isGridLoading` = page loading OR class/stream switch
- Replace ghost grid with skeleton during load

### Step 7.5 — Deliverables **(Done)**

- Immediate skeleton on open
- Shorter time-to-interactive (parallel fetches)
- Skeleton on class/stream switch

### Step 7.6 — Future performance **(Backlog)**

- Single combined GraphQL query
- Cache grades/teachers across sessions
- Memoize `getCombinedEntriesFor` per day/period cache

### Step 7.6b — Combined view virtualization **(Done — chip-level)**

For schools with **20+ grade/stream combos**, a single period cell can overflow despite `max-h-56` scroll.

| Approach | Detail |
|----------|--------|
| Trigger | When `gradeStreamUnits > 15`, enable virtualization path |
| Layout | Fixed time column; scrollable grade columns if pivoting to grade-as-column layout |
| Cell cap | Within each period row: `max-h-56` + **"Show all N classes"** expand toggle |
| Libraries | `@tanstack/react-virtual` or `react-window` |
| Alternative | Keep day columns; virtualize **chips inside cell** only (simpler first step) |

**Recommendation:** Start with **chip-level virtualization** inside existing day-column cells. It's simpler, preserves the current layout, and solves the immediate overflow problem. Column/pivot virtualization is a larger architectural change — revisit only if chip-level proves insufficient.

### Implementation

| Change | Detail |
|--------|--------|
| Trigger | `manyEntries` when `entries.length >= 15` |
| Collapsed | `max-h-56` with `overflow-y-auto` scroll (same as before, but explicit) |
| Expanded | `overflow-y-visible` (no height cap) — shows all chips |
| Toggle | Dashed border button at bottom with `ChevronDown` icon, `aria-expanded`, text "Show all N classes" / "Show less" |

**Deliverables**

- Usable combined view for 30+ class/stream units without layout breakage
- Toggle per cell, state tracked locally with `useState`

### Step 7.7 — Data freshness **(Done)**

Data is loaded once per session/term change. If another admin edits the timetable, the current admin sees stale data with no indication.

| Feature | Behavior |
|---------|----------|
| Last updated | Show in toolbar via `TimetableLastUpdated` component (reuses `lastUpdated` from store) **(Already existed)** |
| Manual refresh | **Refresh** button in toolbar + **Refresh** menu item in both overflow dropdowns → calls `reloadTimetableData()` |
| Tab focus | *(Not implemented — optional, revisit if users report stale-data confusion)* |
| Stale banner | *(Not implemented — optional, revisit if users report stale-data confusion)* |
| Refresh failure | Falls through to Phase 4b error handling — error flags are cleared on retry |

**Note:** Polling or WebSocket push was considered but rejected for Phase 7.7 to keep complexity low. The manual refresh + tab-focus approach covers the majority of "stale data" scenarios without backend changes.

**Deliverables**

- **Refresh button** in toolbar (visible on all screen sizes via dropdown menus)
- Reuses existing `lastUpdated` display already in `TimetableStatusBar`

### Step 7.8 — Network awareness **(Done)**

| File | Purpose |
|------|---------|
| `hooks/useTimetableNetworkStatus.ts` | Tracks `navigator.onLine`, exposes `isOnline` + `reconnectedAt` for debounced auto-refresh |
| `components/TimetableOfflineBanner.tsx` | Amber warning banner: "You're offline — showing cached timetable data" |
| `page.tsx` | Wired: banner shown when `!isOnline`; `reconnectedAt` triggers `reloadTimetableData()` after debounce |

**Deliverables**

- Clear offline state with visible banner
- Automatic catch-up when back online

### Step 7.9 — Performance instrumentation **(Done — dev only)**

| Implementation | Detail |
|--------|--------|
| `routeMountMsRef` | `useRef(performance.now())` at component mount |
| TTI measurement | `useEffect` runs when grid is ready: `console.table([{ metric: "Timetable TTI", ms }])` |
| Gate | Only runs in `process.env.NODE_ENV === 'development'`; guarded by `loadMetricsLoggedRef` to fire once |

**Deliverables**

- Console.table output in dev showing TTI in ms

---

## Phase 8 — Slot Statistics Fix (18,000 Bug) **(Done)**

### Step 8.1 — Problem

**All classes** showed e.g. `8/18000 (0%)` because:

```
totalSlots = gradeCount × timeSlots.length × daysPerWeek
```

- `timeSlots.length` = all period rows for **all day templates** (not periods per day)
- Multiplying by `daysPerWeek` **double-counted** days

Example: ~40 grades × ~90 `timeSlots` rows × 5 days ≈ **18,000**.

### Step 8.2 — Correct model

**New:** `utils/timetableSlotStats.ts`

```
periodsPerDay = periodNumbers.length (e.g. 8)
slotsPerClassWeek = periodsPerDay × daysPerWeek (e.g. 40)
classUnits = sum(grades with streams → stream count, else 1)
totalSlots = classUnits × slotsPerClassWeek
filledSlots = unique (grade, stream, day, period) keys
```

### Step 8.3 — Files updated

- `hooks/useTimetableTermOverview.ts` — whole-school stats
- `useGradeStatistics` in `hooks/useTimetableData.ts` — single-class stats (same bug pattern)

### Step 8.4 — Deliverables **(Done)**

- **Filled** on status bar reflects real capacity
- Per-grade overview in term summary uses stream-aware units

---

## Phase 9 — Key Files Reference

| Area | Files |
|------|--------|
| Timetable page | `page.tsx` |
| Combined grid | `components/AdminTimetableGrid.tsx` |
| Combined data | `hooks/useTimetableData.ts` → `useSchoolCombinedEntries` |
| Shortcodes / labels | `utils/lessonShortcodes.ts` |
| Slot stats | `utils/timetableSlotStats.ts`, `hooks/useTimetableTermOverview.ts` |
| Loading skeleton | `components/TimetableGridSkeleton.tsx` |
| Error UI **(planned)** | `components/TimetableGridError.tsx`, `TimetableInlineError.tsx` |
| Store / fetch | `@/lib/stores/useTimetableStoreNew.ts` |
| Teachers | `../teachers/page.tsx`, `CreateTeacherDrawer.tsx`, `useTeacherDetailSummary.ts` |
| Invite/email | `backend/.../generic-inviter.provider.ts`, `app/api/school/invite-teacher/route.ts` |

---

## Phase 10 — Testing Checklist (Manual QA)

### Whole-school view

- [ ] No grade selected → combined grid with all classes/streams per cell
- [ ] Empty chips show grade/stream + `—`; filled show subject code
- [ ] Hover: full grade, subject, teacher
- [ ] Click empty/filled chip → correct class + stream selected
- [ ] Double period appears in two consecutive rows with `2×` / `2/2`
- [ ] Break between periods splits double block correctly

### Stats bar (All classes)

- [ ] Filled/total ≈ `(classes × periods × days)` not thousands inflated
- [ ] Lessons count matches actual entries
- [ ] Lessons per day = period count

### Loading **(Done)**

- [ ] Skeleton sidebar + grid on first open
- [ ] Skeleton on class change (brief)
- [ ] No double flash / duplicate network calls on load with pre-selected grade

### Error & recovery **(Done — Phase 4b)**

- [ ] Grades fetch fails → sidebar error + Retry
- [ ] Partial grades failure (e.g. 8 of 10 load) → partial grid + banner with Retry
- [ ] Timetable fetch fails → `TimetableGridError` + Retry
- [ ] Auto-retry 1–2 times before showing error
- [ ] Retry succeeds → grid renders normally
- [ ] During retry: previous UI stays visible (no skeleton→error→skeleton flicker)
- [ ] Partial grades + remaining fetches succeed → grid renders with available grades and no leftover error state

### Data freshness **(Done — Phase 7.7)**

- [x] "Last updated" visible in status bar (via existing `TimetableLastUpdated`)
- [x] Refresh button in toolbar (desktop) + "Refresh" menu item in both dropdowns (mobile)
- [x] Refresh calls `reloadTimetableData()` — grid updates without full page reload
- [ ] Refresh failure → falls through to Phase 4b error handling (test manually)
- [ ] Optional: refresh on tab focus (debounced) — not implemented

### Conflicts **(Done — Phase 11.7b)**

- [x] Same teacher double-booked in one period → both chips marked in combined view (red border + "clash" label)
- [x] Tooltip names the conflicting class/lesson ("⚠ Teacher: Sarah also has G7-A · Math")
- [x] Room double-booking also marked
- [x] Hover tooltip shows conflict details with red separator
- [x] Matches single-class highlight when `showConflicts` is on

### Accessibility **(Done — Phase 4.6)**

- [x] Tab through combined cells (buttons natively focusable); Enter/Space opens class
- [x] Empty chip has `aria-label` with grade/stream + "No lesson scheduled"
- [x] Filled chip has `aria-label` with grade, subject, teacher (and "conflict" if applicable)
- [x] Table has `aria-label="Whole-school timetable"` / `"Timetable"`
- [x] Radix Tooltip provides native `role="tooltip"` + `aria-describedby`

### Single-class view

- [ ] Unchanged behavior for add/edit/delete lesson
- [ ] Filled/total correct for one grade/stream

### Teachers (regression)

- [ ] Add teacher once; detail opens correctly
- [ ] Invite succeeds when email fails (warning shown)

---

## Phase 11 — Optional Next Steps (Backlog)

### Priority tier 1 — Do next

1. ~~**Error states & failure recovery** (Phase 4b)~~ — **Done**
2. ~~**Data refresh mechanism** (Phase 7.7)~~ — **Done**
3. ~~**Conflict visualization in combined view** (Phase 11.7b)~~ — **Done**

### Priority tier 2 — Solid backlog

4. ~~**Accessibility basics** (Phase 4.6)~~ — **Done**
5. ~~**Combined view virtualization** (Phase 7.6b)~~ — **Done**
6. ~~**Network awareness** (Phase 7.8)~~ — **Done**
7. ~~**Performance telemetry** (Phase 7.9)~~ — **Done**

### Other backlog items

8. ~~**Status bar for All classes** — tooltip explaining `filled/total` formula~~ — **Done**
9. **Filter/highlight** — dim grades without lessons; filter by teacher in combined view
10. ~~**Subject name on chip** — toggle shortcode vs full name~~ — **Done**
11. **Export whole-school** — CSV/PDF of combined grid
12. ~~**Backend** — one `getSchoolTimetableSummary` with slot counts precomputed~~ — **Done**
13. **TeacherDetailView** — finish slate styling on inner tabs
14. **E2E tests** — Playwright for skeleton → grid, stats bounds, error retry

### Phase 11.7 — Conflict detection (existing)

- Ensure combined view uses same clash rules as single-class view (`useConflictLessonIds`, `computeTimetableConflicts`)
- Single-class view: **Done** — red styling + "clash" label works when `showConflicts` is on
- Combined view: **Done** — see Phase 11.7b below (same `conflictLessonIds` + `conflictTooltipMap` with detailed tooltip)

### Phase 11.7b — Visual conflict markers in combined view **(Done)**

Showing conflicts **in the combined view** lets admins spot double-booked teachers/rooms without opening each class.

| Conflict type | UI |
|---------------|-----|
| Same teacher, two classes, same period | Red border + ⚠ on **both** chips |
| Same room double-booked | Similar marker (distinct color/icon optional) |
| Tooltip | “Teacher X also has G7 · A · Math in this period” |
| Policy | **Mark, do not block** — admin sees problem and fixes manually |

**Implementation notes**

- Reuse `conflictLessonIds` from store (red border + "clash" label already existed)
- **New:** `useConflictEntryMap` hook builds `Map<entryId, description>` from conflict data
- **New:** `conflictTooltipMap` prop passed through `AdminTimetableGrid` → `CombinedLessonCell` → `CombinedChipTooltipContent`
- Tooltip shows e.g. "⚠ Teacher: Sarah also has G7-A · Math" in red with separator
- Markers respect `showConflicts` toggle (same as single-class view)

**Deliverables**

- At-a-glance clash detection across all classes in one grid

---

## Implementation Order (Recommended for New Team)

### Completed work (reference)

1. Phase 3 — Combined data + grid wiring **(Done)**
2. Phase 6 — Full grade/stream catalog **(Done)**
3. Phase 5 — Double periods **(Done)**
4. Phase 4 — Chip UI + tooltips **(Done)**
5. Phase 8 — Slot stats **(Done)**
6. Phase 7.2–7.5 — Performance + skeleton **(Done)**
7. Phases 1–2 — Teachers + invite email UX **(Done)**

### Recommended next (priority)

| Phase | Depends on |
|-------|-----------|
| ~~**Phase 4b** — Error states & failure recovery~~ | **Done** |
| ~~**Phase 7.7** — Data freshness (Refresh + last updated)~~ | **Done** |
| ~~**Phase 11.7b** — Conflict visualization~~ | **Done** |
| ~~**Phase 4.6** — Accessibility basics~~ | **Done** |
| ~~**Phase 7.6b** — Virtualization for large schools~~ | **Done** |
| ~~**Phase 7.8–7.9** — Network awareness + perf telemetry~~ | **Done** |

---

## Related docs

- `TIMETABLE_UX_REVIEW.md` — UX audit and terminology
- `TIMETABLE_UI_AUDIT.md` — UI consistency notes
- `TEACHER_CONFLICT_PREVENTION.md` — clash detection
- `BREAK_EDITING_GUIDE.md` — break placement and double-period interaction
