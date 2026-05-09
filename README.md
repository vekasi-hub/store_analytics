# store-analytics
[RAM0541] Taltech Ülesanne 2 — TypeScript Store Analytics

## Kasutatud tehnoloogiad:
* TypeScript 5.7
* Node.js
* LocalStorage (Web API)
* VS Code + Live Server
* Claude AI (claude.ai)

## Projekti avamine:

### Ülesanne 1 — konsooli raport
```bash
npm install
npm run report
```
Või ilma kompileerimiseta:
```bash
npx tsx src/report.ts
```

### Ülesanne 2 — veebirakendus
1. Kompileeri TypeScript:
```bash
npm run build
```
2. Ava `index.html` VS Code Live Serveri kaudu (paremklikk → *Open with Live Server*)

## Projekti struktuur:
```
src/
  report.ts     — Ülesanne 1: konsooli raport
  app.ts        — Ülesanne 2: veebirakendus
dist/           — kompileeritud JavaScript (tsc väljund)
index.html      — Ülesanne 2 leht
tsconfig.json
package.json
```

## AI ankeet

### Üldinfo

* **Nimi:** Maksim Lupanov
* **Meeskond / projekt:** individuaalne töö — Store Analytics
* **Ülesanne / projekti osa:** Ülesanne 1 + Ülesanne 2 (TypeScript)

---

### AI ja abivahendite kasutamine

**1. Milliseid tööriistu kasutasid?**

Claude AI (claude.ai)

---

**2. Too 2–3 näidet AI-prompt'idest, mida kasutasid:**
```
typescript ругается Duplicate identifier 'getAvailable' но у меня эта функция
только в одном файле, в другом её нет. в чём дело
```
```
JSON.parse возвращает any, как проверить что это массив и не пустой
перед тем как кастануть к Product[]
```
```
usb hub не получает скидку хотя у него category Accessories и правило есть
без minRating. почему
```

---

**3. Millised koodiosad olid täielikult sinu enda kirjutatud?**

Tooteandmed (`getDefaultProducts`), CSS-stiilid `index.html`-is ja sisendi valideerimise loogika (`validateInput`).

---

**4. Milliseid AI poolt genereeritud lahendusi pidid parandama või ümber kirjutama?**

Allahindluse loogika — AI ei arvestanud algul, et `minRating` kontrollis tuleb `"no reviews"` stringi eraldi käsitleda enne `parseFloat` kutsumist. Parandasin ise.

---

**5. Millise probleemi lahendamisel aitas AI kõige rohkem?**

TypeScripti moodulite skoop — selgitas, miks `export {}` on vajalik, et kaks faili ei jagaks globaalset nimeruumi.

---

**6. Mida õppisid selle ülesande / projekti käigus tehniliselt?**

Kuidas TypeScripti moodulisüsteem töötab ja miks ilma `export {}`-ta tekivad "Duplicate identifier" vead mitme faili korral.

---

### Enesehinnang

**Mixed**

AI aitas mustrite ja boilerplate'iga, kuid allahindluse tingimused ja TS-mooduli vea põhjus tuli ise välja mõelda ja parandada.
