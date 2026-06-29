# Step 3d — Handoff (exam / "ikut ujian" flow)

> **READ THIS FILE FIRST, IN FULL, before doing anything.** It is the canonical kickoff
> prompt for the Step 3d session. If anything here conflicts with older notes, this file wins.

---

This is the Nenggala Academy project (Next.js 16.2.4 — a MODIFIED Next; read AGENTS.md first
and the relevant guide in node_modules/next/dist/docs/ before writing Next-specific code).
React 19, Tailwind v4, lucide-react, xlsx, TypeScript. Backend is backend-nenggala (Express +
MySQL/mysql2), an additional working dir I'm cleared to have you edit directly.

Read docs/API_READINESS_AUDIT.md first (source of truth, issues by number). Then the project
memory files, especially: step3c-meview.md (exam button + scores deliberately left on mock),
step3c-user-crud.md and step3c-master-user-writes.md (the proven multipart write pattern +
the per-controller objParam-parse / keep-image-guard fixes), step3c-tierb-academic.md
(MIN_ATTENDANCE = 16, enrollments derived from the schedules store).

## ALREADY DONE — do NOT touch or redo
- **STEP 3a:** marketing/public + CMS data layer (do NOT touch src/lib/marketing, src/lib/cms,
  src/lib/api/content.ts).
- **STEP 3b:** real auth/session identity (use getCurrentUsername / src/lib/api/token.ts);
  programs/sub-programs/belts/dojangs/academic unified + fetch-backed.
- **STEP 3c (COMPLETE — reads AND writes, all live-tested):** the whole master layer;
  students/coaches/admins incl. full add/edit/status CRUD (save-user-data multipart +
  inact-user-data); schedules, schedule-periods, session-attendance, recommendations,
  certifications; the me-views (student/coach schedule + coach dashboard) scoped to a real
  current period via getCurrentPeriod(schedules). REUSE the API layer at src/lib/api/
  (apiPost / apiPostForm + ApiError envelope, token.ts, file-url.ts).

## STILL ON MOCK — this is exactly what 3d replaces (do NOT assume these are wired)
- `src/app/app/(authenticated)/student/_shared/scores.ts` — INITIAL_SCORES mock array; the
  whole score store + the score "exam table" filtering live here and in ScoreClient.tsx.
- `src/app/app/(authenticated)/me/schedule/ExamRegistrationModal.tsx` — "ikut ujian" modal,
  mock submit (no API call).
- The schedule rule "tombol ikut ujian selalu ada": `me/schedule/ScheduleClient.tsx`
  currently GATES the take-exam button on attendance >= MIN_ATTENDANCE; 3d must make it
  always present.

## STEP 3d scope — DESIGN + BUILD the exam / "ikut ujian" flow deferred from step 2
- The student Exam menu ("ikut ujian") + payment-proof upload.
- The score "exam table" filtering (ScoreClient / scores.ts).
- The schedule rule above (take-exam button always shown).
- Score entry/result + xlsx import-score, and assessment-template READS.

### Relevant backend (backend-nenggala/Routes/AssessmentRoutes.js + README)
- `/assessment/get-student-to-exam`
- `/assessment/save-bulk-exam`
- `/assessment/save-exam-by-student` — **MULTIPART** (upload.single "ExamPaymentFile")
- `/assessment/get-student-assess-list`
- `/assessment/get-assess-entry`
- `/assessment/get-assess-result`
- `/assessment/save-student-assess-single`
- `/assessment/get-student-import-assess-list`
- `/assessment/save-student-assess-bulk` — xlsx import. **NOT a file upload**: the route has
  no multer, so parse the xlsx client-side with the `xlsx` lib and POST the rows as JSON.
- Templates: `master/get-assess-temphd` + `master/get-assess-tempdt` — **READS only.**

Confirm exact request/response shapes in `Controllers/AssessmentController.js` +
`DAL/AssessmentDAL.js` before writing client code — don't guess.

## BACKEND PREREQUISITES (confirm with me before changing the backend)
These are project-decided guard fixes, the same class already applied to Master/Content/User/
Certif controllers:
- `Controllers/AssessmentController.js` has **NO `objParam` JSON.parse** — save-exam-by-student
  is multipart, so objParam arrives as a STRING and will break. Add the per-controller guard
  `if (typeof objParam === "string") objParam = JSON.parse(objParam)` (mirror
  UserController.saveUserData). Check every assessment save for the same.
- The SHARED multipart prereqs are ALREADY done (don't redo): Uploads/ static serving, multer
  mkdir, and the multer switch already has a `case "ExamPaymentFile"` → Uploads/...
- If a multipart save replaces a file on edit, apply the keep-file guard + only-unlink-when-
  new-file pattern (see UserController / MasterController).
- Assessment-template WRITES have NO backend (save/inact-assess-temphd + save/delete-
  assess-tempdt are COMMENTED OUT in MasterRoutes.js) → templates are READ-ONLY; flag, do not
  invent endpoints. (Belt master + product-type create/disable are likewise intentionally
  view-only.)

## BACKEND RUN / TEST
WAMP MySQL root / EMPTY password. Start: `DB_PASSWORD= DB_USER=root node index.js` in
backend-nenggala (background it; Node has NO hot-reload — restart after every backend edit).
mysql client: `/c/wamp64/bin/mysql/mysql8.0.31/bin/mysql.exe -u root nenggala`. Base
http://localhost:5000/api/v1. Login WEBin / 123 (super-admin). After each section: curl the
endpoint round-trips against the live backend and CLEAN UP any test rows/files.

## PROCESS
DESIGN THIS WITH ME against the real API BEFORE writing any code. START by proposing, for my
sign-off: the user flows, which endpoint maps to each screen/action, the data shapes, and where
this plugs into the existing scores / schedule / attendance stores. Then PAUSE before building.
Work section by section; pause for my review. Do NOT touch the marketing/CMS data layer (3a).

## RULES / VERIFY
Verify each change with `npx tsc --noEmit` + `npx eslint`. Lint baseline (NOT yours): 4
pre-existing react-hooks/set-state-in-effect errors (Champion/Locations/ImageCarousel/Facility)
+ 1 unused-import warning. Add NO new lint errors/warnings (especially avoid setState-in-effect).
