# PlanDeLectie — Plan de implementare și jurnal de progres

> **Scopul acestui fișier:** continuitate între sesiuni/agenți. Dacă sesiunea se întrerupe,
> agentul următor citește acest fișier și continuă de la primul checkbox nebifal.
> **Regulă:** după finalizarea fiecărui sub-task, bifează `[x]` și adaugă o intrare în Jurnal.

---

## 1. Context — ce este construit până acum (iulie 2026)

Aplicație Tauri (AppImage) + PWA, React 18 + TypeScript + Tailwind + componente shadcn-style, local-first (IndexedDB via `idb`).

**Funcționalități existente:**
- Dashboard: CRUD proiecte, duplicare, căutare/filtrare/sortare, backup JSON export/import
- Editor cu 5 etape (Date generale, Competențe, Faze, Detalii faze, Previzualizare) — **navigare liberă** între etape, fără blocaje
- Validare la export (avertisment, nu blocare): `src/lib/validation.ts`; marcaje discrete permanente pe etape/faze incomplete
- Textarea cu auto-dimensionare (fără scrollbar), activități profesor/elev full-width
- Export DOCX (`src/lib/export-docx.ts`) + PDF (`src/lib/export-pdf.ts` din PlanPreview)
- Versionare (snapshot, restore, max 20/proiect), auto-backup zilnic (ultimele 3)
- Setări: limbă RO/EN, date implicite, format export, accesibilitate (mișcare redusă, contrast ridicat), **faze personalizate editabile**, backup, ștergere date
- Temă dark (în curs de modificare → negru pur, vezi WS0), sidebar extensibil (`sidebarCollapsed` în Settings), landing page animat pentru utilizatori noi
- i18n complet RO/EN (`src/data/i18n/*.json`)

**Convenții obligatorii (păstrează-le!):**
1. **Tokeni semantici** (`bg-background`, `text-muted-foreground` etc.) — NICIODATĂ culori hardcodate în componente (excepție: `PlanPreview`/`pdf-root` rămâne alb intenționat, e sursa exportului PDF)
2. Logica de business în `src/lib/` (funcții pure), store-urile zustand sunt API-ul aplicației
3. Orice text vizibil trece prin i18n (RO + EN, ambele fișiere)
4. Modificări minime, stilul existent al codului

---

## 2. Scope-ul curent (WS0–WS5)

### WS0 — Temă negru pur + highlights colorate ✅
Utilizatorul vrea **negru adevărat** (nu albastru închis), clean, cu accente din paleta: galben, roșu, albastru, portocaliu, mov, verde.
- [x] `src/index.css`: `:root` → fundal negru pur, suprafețe gri foarte închis; primary = verde, secondary = galben, accent = roșu-portocaliu (coral); ring pe primary
- [x] Gradient hero title: ciclu animat prin verde → albastru → mov → roșu → portocaliu → galben (lent, tasteful)
- [x] `.high-contrast` rămâne funcțional
- [x] Verificare vizuală: fazele (teal/coral/violet/galben) acoperă deja paleta de highlights
- [x] Bonus: `theme_color`/`background_color` PWA → `#000000` (vite.config.ts)

### WS1 — Migrația/normalizarea planurilor ✅
Riscul #1 pre-release: planurile din IndexedDB sunt folosite brute; schimbările de schemă pot corupe date vechi.
- [x] `src/lib/migrations.ts` (NOU): `SCHEMA_VERSION = 1`, `migratePlan(raw: unknown): LessonPlan` — completează câmpuri lipsă cu default-uri, corectează tipuri, păstrează câmpuri necunoscute (spread), setează `schemaVersion`
- [x] `src/types/index.ts`: `LessonPlan` += `schemaVersion?: number`
- [x] `src/lib/storage.ts`: `dbGetAllPlans()` → `.map(migratePlan)`
- [x] `src/lib/versioning.ts`: `buildRestoredPlan` migrează snapshot-ul
- [x] `src/stores/plans.ts`: `importBackup` migrează planuri + snapshot-uri din versiuni înainte de `dbImportAll`
- [x] Build verde + smoke test

### WS2 — Erori vizibile (toast propriu, FĂRĂ dependințe noi) ✅
- [x] `src/stores/toast.ts` (NOU, zustand): `toasts: {id, kind: 'error'|'success'|'info', message}[]`, `push()`, `dismiss()`, auto-dismiss 5s; helper `toast.error/success/info` apelabil din afara React
- [x] `src/components/ui/toaster.tsx` (NOU): regiune fixă dreapta-jos, `aria-live="polite"`, animații framer-motion, montat în `App.tsx`
- [x] Conectare: `debouncedPersist` (stores/plans.ts — acum eșuează silențios), `add/remove/duplicate/save/restoreVersion`, persistarea setărilor (`persist` din stores/settings.ts), `handleSave` din EditorPage
- [x] i18n: `errors.saveFailed`, `errors.deleteFailed`, `errors.duplicateFailed`, `errors.restoreFailed` (RO+EN)
- [x] Build verde (tsc exit 0; bug reparat: paranteză lipsă la `create(...)`)

### WS3 — Logo SVG propriu + cale simplă de update ✅
- [x] `branding/logo.svg` (NOU): design simplu — carte deschisă + check, gradient verde→mov; colțuri rotunjite, funcționează la 32px
- [x] `scripts/generate-icons.mjs` (NOU) + `npm run icons`: SVG → PNG 1024 (devDep `sharp`) → `tauri icon` (regenerează `src-tauri/icons/`) + copiază PNG PWA (192/512) în `public/icons/`
- [x] `src/components/brand/Logo.tsx` (NOU): SVG inline reutilizabil → înlocuiește `BookOpenCheck` din `AppShell` (sidebar)
- [x] Favicon: `public/icon.svg` ← noul logo; `index.html` theme-color → #000000; manifest PWA cu iconițe PNG
- [x] **Documentare update viitor**: „înlocuiește `branding/logo.svg`, rulează `npm run icons`" (secțiunea 4)
- [x] Build verde (tsc exit 0) + verificare vizuală iconiță generată

### WS4 — Câmpuri românești: tipul lecției, forme de organizare, bibliografie ✅
- [x] `src/types/index.ts`: `LessonPlanMetadata` += `lessonType: string`, `organizationalForms: string[]`, `bibliography: string[]`
- [x] `migrations.ts` (WS1): default-urile celor 3 câmpuri pentru planuri vechi (`''`, `[]`, `[]`)
- [x] `src/data/defaults.ts`: `LESSON_TYPE_SUGGESTIONS`, `ORG_FORM_SUGGESTIONS`; `stores/plans.create` completează câmpurile noi
- [x] `MetadataStep.tsx`: câmpuri noi — tipul lecției (Input cu datalist sugestii), forme de organizare (TagInput + sugestii), bibliografie (TagInput); incluse în watch/onChange + schemă zod
- [x] `PlanPreview.tsx`: rânduri info (tipul lecției, forme de organizare) + secțiune bibliografie la final
- [x] `src/lib/export-docx.ts`: rânduri info + bloc bibliografie cu bullets
- [x] i18n RO+EN: `editor.metadata.lessonType`, `.orgForms`, `.bibliography` + preview
- [x] NU se adaugă la validarea de export (decizie utilizator)
- [x] Build verde (tsc exit 0)

### WS5 — Curriculum editabil (arii + discipline) + split TIC ✅
Ca la „Faze personalizate": profesorul își editează ariile și disciplinele cuprinse → aplicația e configurabilă pentru ecosisteme diferite de cel default.
- [x] `src/stores/curriculum.ts` (NOU, zustand): copie editabilă persistată în IndexedDB (cheie `curriculum-override` în storage.ts: `dbGetCurriculum`/`dbSaveCurriculum`/`dbClearCurriculum`); fallback pe `public/curriculum/ro-curriculum.json`; `resetToDefault()`; flag `customized`
- [x] Operații în store: `renameArea`, `addArea`, `removeArea`, `addSubject` (clase = toate implicit), `updateSubject` (nume RO/EN + clase), `removeSubject`; helper `parseGradesInput` („5,6,7" → [5,6,7]); discipline noi pornesc fără competențe
- [x] `src/components/settings/CurriculumEditor.tsx` (NOU) montat în `SettingsPage.tsx` — tiparul „Faze personalizate", expand per arie, AlertDialog confirmări
- [x] Avertisment la ștergerea arie/discipline referențiate de planuri (`settings.deleteReferenced` cu număr de proiecte)
- [x] Consumatori pe store: `App.tsx` (init), `DashboardPage.tsx`, `EditorPage.tsx`; `MetadataStep`/`CompetencesStep` primesc curriculum via props (neschimbate)
- [x] Split TIC în `ro-curriculum.json`: `tic-informatica` → `informatica` (Informatică, 5–12) + `tic` (TIC, 5–8), competențe duplicate (în aria `tehnologii`)
- [x] `migrations.ts`: `SUBJECT_ID_RENAMES = { 'tic-informatica': 'informatica' }` pentru planuri vechi (era deja pus din WS1)
- [x] i18n RO+EN pentru toate textele noi (`settings.curriculum*`, `settings.*Area/Subject`, `gradesLabel` etc.)
- [x] Build verde (tsc + vite build) + dev server HTTP 200

### Final de sesiune
- [x] `npm run build` verde integral
- [x] Jurnal actualizat + toate checkbox-urile bifate

### WS6 — Etichete de coloană în editorul de curriculum ✅
Din feedback vizual: matricea arii/discipline nu avea nicio etichetă — informația se pierdea.
- [x] Antet coloane pentru arii (`Arie (RO)` | `Arie (EN)`), aliniat pe gridul `grid-cols-[auto_1fr_1fr_auto]`
- [x] Antet coloane pentru discipline (`Disciplină (RO)` | `Disciplină (EN)` | `Clase`) în fiecare arie expandată, grid `grid-cols-[1fr_1fr_auto_auto]`
- [x] Limbele rămân side-by-side (cerință explicită); ușurința de editare păstrată
- [x] i18n: valorile `settings.*Name*` scurtate pentru lizibilitate de coloană

### WS7 — Culori de temă personalizabile (6 controale, varianta A) ✅
- [x] `types/index.ts`: `ThemeColors` (primary/accent/secondary/background/card/foreground, hex) + `Settings.themeColors`
- [x] `defaults.ts`: `DEFAULT_THEME_COLORS` = paleta curentă; merge-ul din settings store o aplică retroactiv
- [x] `src/lib/theme.ts` (NOU): `hexToHsl` + `applyThemeColors(colors|null)` — setează variabilele CSS pe `:root`; **derivări automate**: ring=primary, popover=card, muted/border/input din card (direcție după luminozitate), foreground pe butoane ales după contrast; `null` → reset la paleta CSS
- [x] `App.tsx`: efect applyThemeColors; **high-contrast are prioritate** și dezactivează culorile custom
- [x] `src/components/settings/ThemeColorsEditor.tsx` (NOU) montat în Setări: 6 inputuri `type="color"` + hex afișat + reset
- [x] Gradientul hero + logo rămân multicolori (identitate brand)
- [x] i18n RO+EN; build verde (tsc + vite) + dev HTTP 200

---

## 3. Decizii tehnice (de ce așa)

| Decizie | Motiv |
|---|---|
| Toast propriu, nu librărie | Zero dependințe noi; ~80 linii; consistent cu stilul existent |
| Migrație prin completare de câmpuri (nu versiuni numerotate de scheme) | O singură funcție pură acoperă toate cazurile actuale; `SCHEMA_VERSION` pregătit pentru viitor |
| Curriculum = copie editabilă completă în IndexedDB (nu layer de override/diff) | Același tipar ca `settings.phases` (dovedit în cod); JSON-ul default rămâne intact → reset trivial |
| Competențele NU se editează în Setări | Scope controlat; discipline noi → competențe adăugate manual per plan (există deja) |
| Câmpurile WS4 nu intră în validarea de export | Cerință explicită: doar avertismentele existente rămân |
| `sharp` ca devDependency pentru iconițe | Singura piesă lipsă din lanțul SVG→PNG→`tauri icon`; nu ajunge în bundle |

---

## 4. Cum schimbi logo-ul pe viitor

1. Înlocuiește `branding/logo.svg` cu fișierul tău SVG (păstrează numele).
2. Rulează `npm run icons` — regenerează automat: `src-tauri/icons/` (toate platformele), iconițele PWA din `public/`, favicon.
3. `npm run tauri:build` pentru noul AppImage.

---

## 5. NU este în scope acum (vine ulterior)

- Faza 2 (testare): Vitest + teste `lib/`, ESLint, audit a11y, PWA update prompt
- Faza 3: proiect exemplu, code-splitting, light mode, auto-updater
- Faza 4 restul: alte câmpuri oficiale (demers didactic etc.), verificare acoperire curriculum, template DOCX inspectorate
- Build Windows MSI + CI GitHub Actions, bump 1.0.0

---

## 6. Jurnal de progres

| Data | Intrare |
|---|---|
| 2026-07-25 | Fișier de plan creat. |
| 2026-07-25 | **WS0 ✅** Temă negru pur + gradient hero 6 culori; PWA theme/background `#000000`. |
| 2026-07-25 | **WS1 ✅** `src/lib/migrations.ts` + `schemaVersion`; migrare la dbGetAllPlans, buildRestoredPlan, importBackup. |
| 2026-07-25 | **WS2 ✅** Toast propriu (`stores/toast.ts` + `ui/toaster.tsx`); erori vizibile la persistare planuri/setări. |
| 2026-07-25 | **WS3 ✅** `branding/logo.svg` + `npm run icons` (sharp + tauri icon + PWA PNG); `Logo.tsx` în sidebar; favicon nou. |
| 2026-07-25 | **WS4 ✅** Metadata += tipul lecției / forme de organizare / bibliografie — form, preview, DOCX, i18n. |
| 2026-07-25 | **WS5 ✅** `stores/curriculum.ts` (override editabil în IndexedDB) + `CurriculumEditor` în Setări + split TIC în JSON. Build + dev verde. **TOATE WORKSTREAM-URILE FINALIZATE.** |
| 2026-07-25 | **WS6 ✅** Antete de coloană în editorul de curriculum (feedback screenshot utilizator). |
| 2026-07-25 | **WS7 ✅** `lib/theme.ts` + `ThemeColorsEditor`: 6 controale majore de culoare în Setări, cu derivări automate și prioritate high-contrast. Build + dev verde. |
