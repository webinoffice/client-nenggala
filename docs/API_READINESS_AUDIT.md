# API Readiness Audit — Step 2 → Step 3 Checklist

Status of the data layer ahead of the full API integration (step 3). Every feature
currently uses an in-memory mock store. The goal of this document is so step 3 knows
**exactly** what is already API-swap-ready and what still needs work, and in what order.

The target store shape (the "canonical pattern") is:

```
INITIAL_*  seed
let _state
const listeners = new Set<() => void>()
notify()
getX() / subscribeX() / mutators (add/update/toggle/remove)
+ optional useX() hook (useSyncExternalStore)
```

Swapping to a real API then means: replace the **bodies** of the mutators/getters with
`fetch`, add a one-time hydration loader that calls `notify()`, and keep
`subscribe`/`getSnapshot` synchronous. Consumers do not change.

---

## ✅ Done in the Step 2 session (code already changed)

- **CMS built + marketing wired** to new stores: `src/lib/events.ts` (canonical events
  store, replaced the dead duplicate), `src/lib/cms/{gallery,homepage,about}.ts`,
  `/app/content/{events,homepage,about}` pages. Marketing sections Hero, Mindset,
  ImageCarousel, EventBanner, EventList, OurProfile, Facility now read from stores.
- **Tier C — master sections extracted into shared stores** (this session): see the
  per-section status below. Each master CRUD page now reads from a `_shared` store using
  the canonical pattern, so its store body can be swapped for `fetch` with no component
  changes.

---

## Tier A — Already API-ready ✅

Canonical pattern in place. Swap = replace bodies + add hydration. Consumers unchanged.

| Store | Notes |
| --- | --- |
| `src/lib/events.ts` | New this session. |
| `src/lib/cms/gallery.ts` `homepage.ts` `about.ts` | New this session. Images use object URLs in mock; real upload returns a URL — `ImageUploadField` contract stays. |
| `student/_shared/students.ts` | Full CRUD + status toggle. |
| `coach/_shared/coaches.ts` | Full CRUD + status toggle. |
| `coach/_shared/schedules.ts` | Full CRUD + status toggle. |
| `coach/_shared/recommendations.ts` | add/remove. |
| `coach/_shared/session-attendance.ts` | Append-only (submit). Confirm API allows edit/delete. |
| `student/_shared/scores.ts` | Append-only (submit). `total`/`result` are **computed client-side AND stored** — decide server authority (issue #6). |
| `lib/certifications.ts` | add-only; `getNextCertId` uses `Date.now()`. |
| `dashboard/_shared/admin-metrics.ts` | Pure/stateless — takes stores as args. Ideal. |

## Tier B — NOT stores: plain arrays + synchronous helpers ⚠️ (STEP 3)

These export module arrays + **synchronous** helper functions that are called **inline
during render at ~27 call sites** (academic alone). No `subscribe`, not reactive. If a
helper becomes `async fetch`, **every call site breaks**. This is the biggest interface
risk.

- `student/_shared/academic.ts` — `PERIODS`, `PROGRAMS`, `SUB_PROGRAMS`, `ENROLLMENTS` +
  `getProgramById`, `getSubProgramById`, `getPeriodById`, `getDojangsForPeriod`,
  `getProgramsForSelection`, `getSubProgramsForSelection`, `getEnrolledUsernames…`
- `student/_shared/attendance.ts` — `ATTENDANCE` + `getAttendance`
- `coach/_shared/coach-attendance.ts` — `COACH_ATTENDANCE` + `aggregateAttendance`
- `lib/contacts.ts` — `DOJANG_CONTACTS`

**Action (step 3):** convert each to the canonical store + `use*()` hook; migrate the sync
call sites to the hook / async-aware reads.

## Tier C — Master data extraction (mostly DONE this session)

Previously each master client held `useState(INITIAL_*)` and mutated local state, which
**blocked** a store-body swap and made master data invisible to other pages. **All eight
were converted to shared stores this session** — each client now reads via
`useSyncExternalStore` and mutates through store functions, so swapping in `fetch` is a
store-body change with no component edits. Form modals were repointed to import their types
from `_shared`.

- [x] `master/program` → `master/_shared/programs.ts`        (add/update/toggle)
- [x] `master/sub-program` → `master/_shared/sub-programs.ts` (add/update/toggle)
- [x] `master/dojang` → `master/_shared/dojangs.ts`          (add/update/toggle)
- [x] `master/grading-belt` → `master/_shared/belts.ts`      (get/subscribe only — view-only UI; add mutators when belt CRUD is built)
- [x] `master/product` → `master/_shared/products.ts`        (add/update/remove)
- [x] `master/schedule-period` → `master/_shared/schedule-periods.ts` (addMany/update/toggle)
- [x] `master/ebook` → `master/_shared/ebooks.ts`            (add/update/toggle)
- [x] `master/roles` → `master/_shared/app-users.ts`         (update/toggle — no add in current UI)

**Remaining cleanup for these (step 3):**
- The master clients still set `updatedBy` from a hardcoded `currentUserName = "Carolina"`
  (issue #5).
- `MasterSubProgramClient` + `SubProgramFormModal` still read the program list from
  `INITIAL_PROGRAMS` (static) rather than the new `getPrograms()` store; `MasterSchedulePeriodClient`
  reads `DOJANG_OPTIONS` (static) rather than the new `getDojangs()` store. Wire these to the
  live stores when unifying program/dojang data (issues #1, #2).

---

## Cross-cutting issues — STEP 3 (need the API / are too invasive for step 2)

1. **🔴 Program data is fragmented into 3 divergent sources.**
   `academic.ts PROGRAMS = TKD/NCK/GYM/BLT` (used by ALL operational screens) vs
   `master/_shared/programs.ts = TKD/TGD/HKD/KRT/DMO` (master CRUD) vs marketing
   `Champion`/`OurProgram` own lists. They don't share IDs/values — editing a master
   program has zero effect on operations. Same split for sub-programs.
   **Action:** unify onto one programs/sub-programs store. Touches ~27 files — do with the
   API so relationships are validated server-side.

2. **🟠 Duplicated reference dropdowns.** `DOJANG_OPTIONS`, `SABUK_OPTIONS`, `SABUK_RANK`,
   `WARGA_NEGARA_OPTIONS`, `GOL_DARAH_OPTIONS` are hardcoded in BOTH `admins.ts` and
   `students.ts`. Belts/dojang should derive from the master grading-belt + dojang stores.
   `SABUK_RANK` + pass thresholds (`scores.ts`) are belt business-logic that belongs with
   the belt master.

3. **🟠 Two coach-attendance models.** `coach-attendance.ts` (flat log + `aggregate`) vs
   `session-attendance.ts` (the actual submission store). The report count should *derive*
   from submissions. Reconcile to one source.

4. **🔴 Auth/identity is a stub.** `app/login/LoginForm.tsx` only `console.log`s — no token,
   no redirect, no role set. The de-facto "auth" is the `lib/role-context.tsx` localStorage
   switcher; `lib/current-user.ts` maps role→a representative username. Real login must
   authenticate, store a session, and `getCurrentUsername` must return the **authenticated**
   No.Reg. Sidebar "Log Out" link only navigates to `/` without clearing state.

5. **🟡 `updatedBy` / `updateDate` hygiene.** Master clients set `updatedBy` from a hardcoded
   name (e.g. `"Carolina"`) instead of the session user. `updateDate` format is inconsistent
   — some ISO-with-`Z`, some naive local. Standardize on server time + authenticated user.

6. **🟡 Score `total`/`result` computed AND stored.** `scores.ts calculateTotal/determineResult`
   run client-side and the values are also persisted. Decide server authority to avoid drift.

7. **🟠 Marketing still hardcoded where the brief assumed stores.** `Champion` (programs),
   `Locations` (dojang), `OurProgram`, about-page `CoachList` arrays are still local hardcoded
   arrays — NOT wired, because their master stores weren't reactive at step 2. Now that the
   master stores exist (Tier C), wire these in step 3:
   - `Champion` → programs store, `Locations` → dojang store, `OurProgram` → programs/sub-programs,
     `CoachList` → coaches store.
   - `OurMoment` (videos) + `Partner` (logos) have no store/CMS at all — future CMS candidates.

8. **🟡 Append-only stores.** `scores`, `session-attendance`, `certifications` have no
   update/remove. Confirm this matches the real API's capabilities.

9. **🟡 Pre-existing typecheck errors** in `components/sections/Champion.tsx` and
   `Locations.tsx` (implicit `any` / `offsetWidth` on `never`). Unrelated to data layer;
   fix when those components are wired to stores (#7).

---

## Recommended order for the API (step 3)

1. **Auth first** (#4) + replace `current-user` with session identity; standardize
   `updatedBy`/timestamps (#5).
2. **Unify program/sub-program data** (#1) and **dedup reference dropdowns** (#2) against the
   master stores — this is the riskiest, highest-leverage change.
3. **Tier B → stores + hooks** (academic, attendance, coach-attendance, contacts); migrate
   the sync call sites.
4. **Tier A + Tier C**: add async hydration to each store; settle append-only vs update (#6,
   #8) and coach-attendance reconciliation (#3).
5. **Wire remaining marketing** (#7) once their stores are reactive.
