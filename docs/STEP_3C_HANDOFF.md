# Step 3c — Handoff (remaining work)

> **READ THIS FILE FIRST, IN FULL, before doing anything.** It is the canonical,
> up-to-date plan for finishing Step 3c. The text below is also the kickoff prompt
> for the fresh session — it intentionally repeats "read this file" so it does not
> get skipped. If anything here conflicts with older notes, this file wins.

---

This is the Nenggala Academy project (Next.js 16.2.4 — a MODIFIED Next; read AGENTS.md and the
relevant guide in node_modules/next/dist/docs/ before writing Next-specific code). React 19, Tailwind
v4, lucide-react, TypeScript. Backend is backend-nenggala (Express + MySQL/mysql2), an additional
working dir. I (the user) am cleared to have you edit the backend directly this project.

This is the REMAINDER of STEP 3c. **Read `docs/STEP_3C_HANDOFF.md` (this file) FIRST**, then the
memory files — they record EXACTLY what is done: step3c-progress, step3c-part2-schedules,
step3c-recommendations, step3c-tierb-academic, step3c-certifications, and especially
step3c-master-user-writes (the most recent). Response shapes are authoritative in
backend-nenggala/DAL/*.js (MasterDAL, UserDAL, ScheduleDAL) and request/objParam handling in
Controllers/*.js — READ those, don't guess.

## ALREADY DONE — do NOT touch or redo (see memory)
- 3a (marketing/CMS), 3b (auth/session). 3c Part 1 (all 8 master + students/coaches/admins reads),
  schedules + attendance stores, #1 recommendations, #2 academic Tier-B, #3 student attendance,
  #4 certifications. scores.ts stays MOCK (that's 3d, NOT 3c).
- #5 schperiod WRITES DONE & live-tested: api/master.ts saveSchPeriod/deleteSchPeriod; the
  schedule-periods store (addSchedulePeriods/updateSchedulePeriod async + reload; toggle replaced by
  deleteSchedulePeriod = hard delete); MasterSchedulePeriodClient (Delete button + error Modal).
- BACKEND FIXES ALREADY APPLIED this project (verified live): MasterController.js imports path/fs +
  JSON.parse(req.body.objParam) on the 5 multipart saves; ContentController.saveContent objParam parse;
  MasterDAL.validateEditSchPeriod no longer references the nonexistent ScheduleHd.DojangId. (The shared
  multipart prereqs — /Uploads static, multer mkdir — were done in the certif pass.)

## REUSE the API layer
src/lib/api/{client(apiPost/apiPostForm + ApiError), token, file-url, dates, master, users, schedules,
attendance, recommendations, certifications}. Reads use apiPost(...,{auth:true}); MsgData is the row
array. MULTIPART writes mirror api/certifications.ts saveCertif / content.ts saveContent: a FormData
with objParam as a JSON-STRING field + the file field; apiPostForm. FgMode I=insert/E=edit.
The proven WRITE-STORE pattern is coach/_shared/schedules.ts: an async store fn → API call →
reload<X>(); a hard delete/disable is surfaced in the consumer via try/catch + an error Modal (see
coach/schedule/ScheduleListClient.tsx and master/schedule-period/MasterSchedulePeriodClient.tsx).

## #5 — REMAINING MASTER + USER CRUD WRITES — ✅ DONE (live-tested), paused before #6
All wired & live-tested: programs / sub-programs / dojang / product (+ Type dropdown from
get-product-type) / ebook (insert+delete only) image saves via the keep-image guard + real file inputs;
roles screen status (inact-user-data) + password (update-user-password) + role (NEW dedicated
update-user-role endpoint). Decisions + the backend bugs fixed this pass are in memory
`step3c-master-user-writes.md`. Flagged (no backend or no UI): belt master, assessment templates (3d),
product-type create/disable, full save-user-data + update-inst-assistant. The original plan text below
is kept for reference.

All these store mutators are still IN-MEMORY. Wire each to its endpoint, reload<X>() after; swap the
store BODIES (keep getters/signatures), surface hard-delete errors in the consumer. Read
MasterController/UserController for the exact objParam shape per endpoint before writing each.

**KEY DECISION (already made by the user): "real file inputs + backend guard".** The master SAVE forms
hold mock TEXT-PATH image fields (program & sub-program have NONE; dojang/product `image` and ebook
`pdfFile` are plain text Inputs), but the backend saves set the file column ONLY from req.file. So:
- (a) Convert each multipart form's image/file field to a real `<input type=file>` (mirror
  certificate/AddCertificateClient). ADD a file input to program + sub-program. Thread the File
  through onSubmit → store mutator (new File param) → apiPostForm. Show the current image on edit;
  a new file is optional on edit.
- (b) Backend GUARD so editing WITHOUT a new file keeps the existing image: in each multipart save
  controller, only unlink the old file AND only overwrite the image column when req.file is present;
  otherwise carry the existing path through (the controller already fetches the old row on edit).

**Per-entity (endpoints verified vs MasterRoutes/UserRoutes; status-toggle vs hard-delete matters):**
- **programs:** save-programms (mp ProgramMsImage) + inact-programms (toggle keeps Enable/Disable)
- **sub-programs:** save-programdt (mp ProgramDtImage) + inact-programdt (toggle)
- **dojang:** save-dojang (mp DojangImage) + inact-dojang (toggle).
  NOTE: upsertDojang's EDIT SQL does NOT update DojangImage; add DojangImage to the edit SQL (only when
  a file is present) as part of the guard, else dojang images can never change.
- **product:** save-product (mp ProductImage) + delete-product (HARD delete — the toggle becomes a
  Delete button + error Modal, like schperiod). Also **product-type:** save-product-type +
  inact-product-type (BOTH plain JSON, no file).
- **ebook:** save-ebook (mp EBookFile) + delete-ebook (HARD delete).
  NOTE: saveEBookMs is INSERT-ONLY (no FgMode branch). Either add an update path in
  MasterDAL/MasterController for FgMode "E", or make the ebook form insert+delete only (no edit) —
  confirm with the user which.
- **user-data (roles screen):** save-user-data (mp UserPhoto) / inact-user-data /
  update-user-password (route → updateUserPass) / update-inst-assistant (FgAssist toggle — the
  assistant flag the schedules coach-roles logic depends on). Read UserController for shapes.

**NO BACKEND WRITE EXISTS — leave view-only and FLAG (do NOT invent endpoints):**
- belt master (save/inact-beltmaster COMMENTED OUT in MasterRoutes)
- assessment templates (save/inact-assess-temp* COMMENTED OUT — those belong to 3d)

## #6 — ME-VIEW CAPSTONE (do after #5; pause between #5 and #6 for the user's review)
Schedule DISPLAY only; the exam "Ikut Ujian" button + scores are 3d — leave ExamRegistrationModal and
scores.ts on mock. Confirm get-student-schedule / get-instructor-schedule shapes in
ScheduleDAL/ScheduleRoutes first.
- me/schedule/ScheduleClient: class schedule → get-student-schedule; "Your Attendances" →
  get-student-atd (self, via the existing student-attendance cache).
- coach-me/schedule/CoachScheduleClient: weekly display → get-instructor-schedule; drop the
  TODO(me-view-pass) all-periods filter.
- Replace the hardcoded CURRENT_PERIOD="32" display labels in CoachScheduleClient, me/ScheduleClient,
  and CoachDashboard with a real current period derived from the schedule-periods / academic store
  (see step3c-tierb-academic).

## BACKEND RUN / TEST
WAMP MySQL (root / EMPTY password). Start backend: `DB_PASSWORD= DB_USER=root node index.js` in
backend-nenggala (dotenv won't override a pre-set env var); backgrounding it works. mysql client:
/c/wamp64/bin/mysql/mysql8.0.31/bin/mysql.exe -u root nenggala. Base http://localhost:5000/api/v1.
Login WEBin / 123 (super-admin). After each store: curl the endpoint round-trips against the live
backend and CLEAN UP any test rows/files. The user will export nenggala.sql themselves.

## RULES
- CONFIRM before backend changes that aren't the already-decided guard, and whenever a data flow is
  unclear. Pause between #5 and #6 for the user's review.
- Verify each change with `npx tsc --noEmit` + `npx eslint`. Lint baseline (NOT yours): 4 pre-existing
  react-hooks/set-state-in-effect errors (Champion/Locations/ImageCarousel/Facility) + 1 unused-import
  warning. Add NO new lint errors/warnings.
- DO NOT touch the marketing/CMS data layer (src/lib/marketing/, src/lib/cms/, src/lib/api/content.ts).
  (The ContentController backend parse fix is already done; don't redo it.)
- Start with programs (full: file input + save + inact, with the backend guard), TEST live, then
  proceed through the list. Wire BOTH reads and writes — no in-memory mutators left except belt master
  + assessment templates (flag those).
