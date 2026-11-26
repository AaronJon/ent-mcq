# ENT 302 — MCQ Revision Bank

A single-page, static revision site: 557 multiple-choice questions generated from the six
ENT 302 lecture decks (Lectures 1–6), grouped into banks of 50, with a click-to-reveal
answer key and a one-line justification under every question.

## Files

| File | What it is |
|---|---|
| `index.html` | The page itself |
| `style.css` | All styling |
| `app.js` | Bank navigation, filtering, search, show/hide answers |
| `questions.js` | The question data (edit this to add, remove or correct questions) |

No build step, no dependencies, no frameworks. Open `index.html` directly in a browser
and it works offline.

## Hosting on GitHub Pages

1. Create a new repository on GitHub (e.g. `ent302-mcq`).
2. Upload these four files to the **root** of the repository.
3. Go to **Settings → Pages**.
4. Under *Build and deployment*, set **Source** to `Deploy from a branch`,
   **Branch** to `main` and folder to `/ (root)`. Save.
5. Wait about a minute. The site will be live at
   `https://<your-username>.github.io/<repository-name>/`

## Editing the questions

Every question in `questions.js` is one line:

```js
{"n":1,"q":"Question text?","o":["Option A","Option B","Option C","Option D"],"a":2,"e":"Why C is right.","l":5},
```

- `n` — question number shown on the card
- `o` — the four options, in display order
- `a` — index of the correct option: `0` = A, `1` = B, `2` = C, `3` = D
- `e` — the one-line justification shown with the answer
- `l` — lecture number (1–6), used by the lecture filter

To add a question, copy a line, change the fields, and give it the next `n`.

## Features

- **Banks of 50** — pill buttons across the top (1–50, 51–100 … 551–557)
- **Lecture filter** — narrow to a single lecture; banks re-paginate automatically
- **Search** — matches question text, options and the justification
- **Show all / Hide all** — reveals every answer in the current bank
- **Print** — printing the page shows all answers and hides the controls

## Caveat

Questions follow the wording of the slides. Check any item against the decks before
using it in a live examination.
