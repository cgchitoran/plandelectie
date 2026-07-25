Platformă locală pentru crearea și gestionarea proiectelor didactice (Romanian Lesson Planner)
1. Viziune și obiective

Construiește o platformă web local-first, interactivă și animată, destinată profesorilor din România pentru a crea, edita, versiona și exporta proiecte didactice detaliate conform modelului Gagne adaptat (11 faze).

Platforma trebuie să:

    Automatizeze și simplifice cât mai mult procesul de creare a proiectelor didactice.
    Permite selectarea flexibilă a fazelor din modelul Gagne.
    Încorporeze curriculumul oficial românesc (clase, arii curriculare, discipline, competențe).
    Oferire export în DOCX și PDF cu layout apropiat de modelul oficial al Ministerului Educației.
    Funcționeze local, fără server, cu experiență simplă pentru utilizatori non-tehnici.
    Fie bilingvă (română/engleză) și pregătită pentru extensie cu alte limbi.
    Aibă arhitectură pregătită pentru integrare AI în viitor, fără a depinde de aceasta în prezent.

2. Public țintă și domeniu
2.1 Utilizatori

    Profesori din învățământul preuniversitar românesc:
        Ciclul primar: pregătitoare, I, II, III, IV
        Ciclul gimnazial: V, VI, VII, VIII
        Ciclul liceal/profesional: IX, X, XI, XII (XIII acolo unde este cazul)

2.2 Discipline

    Toate disciplinele din curriculumul românesc, grupate pe arii curriculare.

2.3 Arii curriculare oficiale

    Limbă și comunicare — Limba și literatura română, Limba maternă, Limbi moderne
    Matematică și științe ale naturii — Matematică, Fizică, Chimie, Biologie, Geografie (parțial)
    Om și societate — Istorie, Geografie, Educație civică / discipline socio-umane
    Educație fizică, sport și sănătate
    Arte — Muzică, Arte vizuale
    Tehnologii — Educație tehnologică, TIC, etc.
    Consiliere și orientare — Dezvoltare personală

3. Cele 11 faze ale modelului Gagne adaptat

Fiecare proiect didactic poate include orice subset de faze, în ordinea dorită de profesor. Fazele implicite propuse (de confirmat/ajustat în planning):
# 	Denumire română 	Denumire engleză
1 	Captarea și orientarea atenției 	Gaining attention and focus
2 	Informarea despre obiective 	Stating objectives
3 	Stimularea amintirii învățării anterioare 	Stimulating recall of prior learning
4 	Prezentarea conținutului 	Presenting new content
5 	Dirijarea învățării 	Guiding learning
6 	Obținerea performanței / exersarea 	Eliciting performance and practice
7 	Asigurarea feedbackului 	Providing feedback
8 	Evaluarea performanței 	Assessing performance
9 	Asigurarea retenției și transferului 	Enhancing retention and transfer
10 	Temă pentru acasă / activitate extinsă 	Homework / extended activity
11 	Concluzii și reflecție 	Closure and reflection

Pentru fiecare fază selectată, profesorul completează:

    Durată (minute)
    Obiective / competențe vizate
    Metode de predare (ex: conversația, demonstrația, problematizarea, lucrul în grup, jocul didactic)
    Materiale / resurse (ex: manual, fișă de lucru, proiector, experiment)
    Tehnici de observare / evaluare (ex: observare sistematică, întrebări orale, fișă de evaluare, portofoliu)
    Activitatea profesorului (text liber)
    Activitatea elevului (text liber)

4. Model de date
Typescript

type LessonPlan = {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number; // pentru versionare internă
  metadata: {
    title: string;
    grade: string; // "Clasa a III-a", "Clasa a VII-a", etc.
    area: string; // aria curriculară
    subject: string; // disciplina
    date: string; // ISO date
    durationMinutes: number;
    teacherName?: string;
    schoolName?: string;
  };
  competences: Competence[];
  phases: LessonPhase[];
};

type Competence = {
  id: string;
  code?: string; // cod oficial, dacă există
  description: string;
  category: "general" | "specific";
};

type LessonPhase = {
  id: string;
  order: number;
  phaseKey: string; // ex: "captare-atentie"
  titleRo: string;
  titleEn: string;
  durationMinutes: number;
  objectives: string[];
  methods: string[];
  materials: string[];
  observationTechniques: string[];
  teacherActivity: string;
  studentActivity: string;
};

type PlanVersion = {
  id: string;
  planId: string;
  versionNumber: number;
  createdAt: string;
  label?: string; // ex: "Variantă pentru inspecție"
  snapshot: LessonPlan;
};

5. Cerințe funcționale
5.1 Dashboard

    Listă cu toate proiectele didactice salvate.
    Căutare și filtrare după: titlu, clasă, disciplină, dată.
    Acțiuni: creare nou, editare, duplicare, ștergere, restaurare versiune.
    Stare goală animată cu ilustrație.
    Backup / restore JSON pentru date locale.

5.2 Editor de proiect didactic

    Wizard cu pași clari:
        Metadata (titlu, clasă, arie, disciplină, dată, durată, profesor, școală).
        Competențe — selectate din curriculumul încorporat sau adăugate manual.
        Faze — selectare din cele 11 faze Gagne.
        Detalii per fază — completare câmpuri specifice.
        Previzualizare — aspect final înainte de export.
    Reordonare fazelor prin drag-and-drop animat.
    Validare inline cu mesaje clare.
    Auto-save în IndexedDB la fiecare modificare.
    Posibilitate de a edita oricând un proiect salvat.

5.3 Versionare

    Salvare automată de snapshot-uri la salvarea explicită.
    Posibilitatea de a eticheta o versiune.
    Restaurare rapidă la o versiune anterioară.
    Comparare simplă între versiuni (opțional în MVP, obligatoriu în etapa de polish).

5.4 Export

    DOCX: document Word structurat, cu antet, tabel de faze, competențe, metode, materiale, evaluare — conform modelului oficial românesc.
    PDF: generat din preview-ul DOM, print-ready.
    Opțiuni de export: include/exclude note profesor, include/exclude listă materiale.
    Generare 100% client-side, fără backend.

5.5 Setări

    Limbă implicită (ro/en).
    Nume profesor și școală implicite.
    Format preferat de export.
    Toggle reduced motion.
    Toggle high contrast (opțional).
    Backup manual și auto-backup periodic.

6. Cerințe non-funcționale
Cerință 	Detalii
Local-first 	Toate datele în browser (IndexedDB). Fără backend obligatoriu.
Ușor de rulat 	PWA care rulează în browser. Arhitectură pregătită pentru Tauri/Electron dacă e nevoie de desktop app ulterior.
Responsive 	Laptop și tabletă.
Accesibil 	Navigare tastatură, ARIA labels, reduced motion, contrast bun.
Design 	Profesional, colorat, prietenos: paletă cu teal, coral, galben soft, violet.
Animații 	Funcționale (drag-and-drop, tranziții wizard, micro-interacțiuni) și decorative.
Extensibil 	Arhitectură modulară pentru AI, noi limbi, noi discipline.
7. Stack tehnic recomandat
Strat 	Tehnologie 	Motiv
Framework 	React 18+ + TypeScript 	Tipizare, ecosistem, componente
Build 	Vite 	Rapid, simplu
Styling 	Tailwind CSS 	Stilizare rapidă și consistentă
UI components 	shadcn/ui sau Radix UI 	Accesibile, customizabile
Animații 	Framer Motion 	Declarative, performante
Stare 	Zustand 	Simplu și scalabil
Stocare 	IndexedDB via idb sau localforage 	Durabilă local
Formulare 	React Hook Form + Zod 	Validare tipizată
i18n 	i18next + react-i18next 	Bilingv + extensibil
Routing 	React Router sau TanStack Router 	Navigare
DOCX 	docx (npm) 	Generare client-side
PDF 	html2pdf.js sau jspdf + html2canvas 	Generare din preview DOM
Icons 	Lucide React 	Moderne, curate
8. Structură de fișiere propusă
Plaintext

/lesson-planner
├── public/
│   └── curriculum/
│       └── ro-curriculum.json
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   └── editor/
│   ├── data/
│   │   ├── phases.ts
│   │   ├── curriculum.ts
│   │   ├── defaults.ts
│   │   └── i18n/
│   │       ├── ro.json
│   │       ├── en.json
│   │       └── config.ts
│   ├── hooks/
│   ├── lib/
│   │   ├── export-docx.ts
│   │   ├── export-pdf.ts
│   │   ├── storage.ts
│   │   └── versioning.ts
│   ├── stores/
│   ├── types/
│   ├── pages/
│   └── App.tsx
├── .opencode/
│   └── plans/
│       └── lesson-planner.md
├── package.json
└── vite.config.ts

9. Flux UI/UX

    Dashboard — lista proiectelor + acțiuni rapide.
    Wizard editor — pași clari cu progress bar animat.
    Phase builder — carduri colorate per fază, drag-and-drop, expand/collapse.
    Preview live — aspectul final al proiectului.
    Export panel — butoane DOCX / PDF cu opțiuni.
    Settings — limbă, date implicite, accesibilitate, backup.

10. Specificații export
DOCX

    Antet cu titlu, clasă, disciplină, data, profesor, școală.
    Secțiune competențe vizate.
    Tabel cu faze: ordine, fază, durată, obiective, metode, materiale, tehnici de observare, activitate profesor, activitate elev.
    Stiluri profesionale, fonturi compatibile (Calibri/Times New Roman), margini standard.

PDF

    Generat din preview DOM, păstrând layout-ul DOCX.
    Pagină A4, antet/repetare pe pagini (dacă biblioteca permite).

11. Roadmap de implementare
Fază 	Conținut
1. Setup 	Proiect Vite + React + TS + Tailwind + i18n + stocare
2. Curriculum 	Încărcare date curriculum românesc, model date, selectori
3. Editor MVP 	Metadata, selecție faze, formular per fază, salvare IndexedDB
4. Dashboard & versionare 	Listare, duplicare, ștergere, snapshot-uri, restaurare
5. Export 	DOCX și PDF client-side, layout oficial
6. Polish 	Animații, accesibilitate, responsive, backup/restore, testare
12. Întrebări pentru OpenCode în planning mode

OpenCode trebuie să clarifice în output:

    Lista finală și ordinea exactă a celor 11 faze Gagne.
    Formatul și structura fișierului de curriculum încorporat.
    Layout-ul exact al exportului DOCX/PDF (poate genera un mock/template).
    Strategia de versionare: auto-snapshot la salvare sau manual.
    Biblioteca PDF preferată (html2pdf.js vs jspdf).
    Componentele UI de bază: shadcn/ui sau custom.
    Schema de culori finală.
    Modul de gestionare al curriculumului actualizat (import JSON).
    Pregătirea arhitecturii pentru AI: locul unde se va injecta ulterior.
    Plan de testare și validare a exportului.

13. Livrabile așteptate de la OpenCode

    Diagramă de arhitectură (text/Mermaid).
    Inventar de componente cu responsabilități.
    Model de date complet (TypeScript).
    Fluxul editorului (wireframe textual).
    Specificație export DOCX/PDF.
    Roadmap detaliat pe pași.
    Lista de dependențe npm cu versiuni.
    Note de risc (PDF rendering, date curriculum, stocare locală).

14. Note finale

    Prioritatea este simplitatea pentru utilizatorii non-tehnici: deschizi browserul, încarci aplicația, funcționează.
    Arhitectura trebuie să fie modulară pentru a permite ulterior: desktop app (Tauri), AI assistant, noi limbi.
    Designul trebuie să fie profesional dar cald, să nu arate infantil.
    Exportul este critic: trebuie să semene cu documentele oficiale folosite în școli.

