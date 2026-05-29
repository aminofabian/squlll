# Timetable UI audit (component-by-component)

**Page:** `/timetable` (school admin)  
**Pass 1:** May 2026 — initial audit  
**Pass 2:** May 2026 — second pass + implementations  
**Design target:** Zinc dashboard, muted accents, tight typography

---

## Pass 2 — Shipped

| Item | Change |
|------|--------|
| Class context | **`TimetableClassContextBar`** — class, fill %, lessons, periods, clashes, last saved in one strip |
| Stat cards | Removed redundant 4-up grid when class selected |
| Toolbar | **Publish** wording (not “Share with staff”); Breaks moved to **More** menu on desktop |
| Grade search | **`/`** keyboard shortcut; hint when 8+ classes |
| Conflicts | Collapsible **zinc** panel, less red chrome |
| Subject insights | Collapsed by default when 3+ items |
| Completion banner | **Publish for teachers** CTA |
| Lesson drawer | Zinc header; title shows **day · period**; debug logs removed; move copy fixed |
| Onboarding / schedule summary / sheets | Zinc tokens (pass 1) |

---

## Page shell (`page.tsx`)

| Area | Status | Remaining |
|------|--------|-----------|
| Layout / zinc canvas | ✅ | — |
| Header actions | ⚠️ | Optional: group Setup / Publish / More danger |
| Class chips + search | ✅ | — |
| Stream chips | ✅ | Only when class selected |
| Live banner | ✅ | — |
| Content stack order | ✅ | Context → fill bar → completion → insights → conflicts → grid |

---

## Wired components

| Component | Status | Remaining improvements |
|-----------|--------|------------------------|
| **AdminTimetableGrid** | ✅ | Subject color legend; density toggle |
| **GradeClassSearch + Sidebar** | ✅ | — |
| **TimetableClassContextBar** | ✅ New | — |
| **TimetableProgressStrip** | ✅ | Hide when onboarding done + has lessons |
| **TimetableOnboarding** | ✅ | Collapse when only “add lessons” step left |
| **TimetableScheduleSummary** | ✅ | — |
| **TimetableFillProgress** | ✅ | Hidden at 100% |
| **TimetableCompletionBanner** | ✅ | — |
| **TimetableSubjectInsights** | ✅ | “Fix” → jump to grid slot |
| **TimetableConflictsPanel** | ✅ | — |
| **TimetableShareDrawer** | ⚠️ | Publish loading spinner; full zinc pass on checklist |
| **TimetableSetupWizard** | ⚠️ | Grade search on step 4 if many classes |
| **LessonEditDialog** | ⚠️ | Form body still slate; section labels |
| **TimeslotEditDialog** | ⚠️ | Zinc + “affects all days” warning |
| **BreakEditDialog** | ⚠️ | Stone palette vs orange |
| **BulkLessonEntryDrawer** | ⚠️ | `useTimetableWeekDays`; stepper UI |
| **BulkScheduleDrawer** | ⚠️ | Zinc forms |
| **BulkBreaksDrawer** | ⚠️ | Week days from config |
| **Periods / Breaks sheets** | ✅ | Extract to components optional |

---

## Not wired (legacy)

`TimetableHeader`, `TimetableGrid`, `ConflictsPanel`, `WeekTemplateManager`, `TimeSlotManager`, `TeacherWorkload`, etc. — safe to delete or archive.

---

## Still open (P2–P3)

1. Subject **legend** under grid  
2. Bulk drawers respect **configured week days** only  
3. **TimeslotEditDialog** / **BreakEditDialog** visual parity  
4. Mobile **FAB** “Add lesson”  
5. Print stylesheet verification  

---

## Target hierarchy (current)

```
[ Timetable · Term · Classes | Add lessons | Publish | More ]
[ Search · Grade chips · Sections ]
[ Progress strip OR onboarding ]
[ Class context bar — when class selected ]
[ Fill progress · Completion · Insights · Conflicts ]
[ Weekly schedule + grid ]
```

---

*Update when components change.*
