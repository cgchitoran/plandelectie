# plandelectie.ro

**Aplicație desktop pentru crearea planurilor de lecție, dedicată profesorilor din România.**

`plandelectie.ro` îi ajută pe profesori să elaboreze rapid și ordonat documentele de planificare didactică de care au nevoie în activitatea de zi cu zi. Aplicația ghidează completarea fiecărei secțiuni a planului de lecție — de la datele generale și competențele vizate, până la desfășurarea pe faze a activității — și produce documente finale gata de printat sau de arhivat.

## Ce poți face cu aplicația

- **Planuri de lecție structurate pe faze** — evenimentul instruirii, anunțarea temei, reactualizarea cunoștințelor, dirijarea învățării, evaluare, temă pentru acasă etc., cu activități pentru profesor și pentru elevi.
- **Curriculum național integrat** — competențele și conținuturile sunt preluate direct din programa școlară, ca să nu le cauci manual.
- **Export în DOCX și PDF** — documente finale într-un format curat, gata de predat sau printat.
- **Lucru local, fără cont** — planurile sunt salvate pe calculatorul tău; nu ai nevoie de internet și nu există abonamente.
- **Backup și versionare** — datele tale rămân în siguranță și pot fi restaurate.
- **Interfață în limba română**, cu temă luminoasă și întunecată.

## Descărcare

Executabilele pentru sistemul tău de operare se găsesc în secțiunea [Releases](https://github.com/cgchitoran/plandelectie/releases):

- **Linux** — fișier `.AppImage`: îl descarci, îl faci executabil (`chmod +x`) și îl pornești.
- **Windows** — instalator `.msi` / `.exe` (generat automat prin CI).

## Dezvoltare

Proiectul este o aplicație desktop construită cu **Tauri 2** (Rust + WebView) și **React 19 + TypeScript + Vite**, cu Tailwind CSS și componente Radix UI.

Cerințe: Node.js 22+, Rust (stable) și [dependințele de sistem Tauri](https://v2.tauri.app/start/prerequisites/).

```bash
npm install
npm run tauri:dev      # rulare în modul dezvoltare
npm run tauri:build    # build de producție (AppImage pe Linux)
npm run build          # doar build-ul web (dist/)
```

### Structura proiectului

- `src/` — interfața web (pagini, componente, store-uri Zustand, export DOCX/PDF)
- `src-tauri/` — backend-ul desktop Rust/Tauri (fișiere, dialoguri native)
- `public/curriculum/` — datele curriculumului național (`ro-curriculum.json`)

## Licență

Codul este publicat sub licența [GNU AGPL-3.0](LICENSE). Ești liber să îl folosești, studiezi și modifici; dacă distribui aplicația sau o oferi ca serviciu în rețea, trebuie să publici și codul sursă al modificărilor, tot sub AGPL-3.0.

## Credite

Proiect dezvoltat cu asistența modelului **Kimi K3**, folosit prin [opencode](https://opencode.ai).
