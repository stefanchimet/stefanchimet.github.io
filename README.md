# stefanchimet.github.io
My personal website

## Updating the roadmap

The "Building now" section on the home page is generated from [`roadmap.json`](roadmap.json).
Edit that file by hand. You don't need to touch any HTML or JavaScript.

Preview changes with Live Server (or after pushing). Opening `index.html` directly from disk
won't load `roadmap.json`, because browsers block `fetch` on `file://` pages.

### Check off a milestone

Set `"completed"` to the date you finished it, in `YYYY-MM-DD` format:

```json
"completed": "2026-10-15",
```

That's all you need. The progress bar, the count, and the "Up next" highlight update automatically.
To un-check a milestone, set it back to `null`.

### Add a note or image

Both are optional and only show on completed milestones.

```json
"completed": "2026-10-22",
"note": "Switched to an STM32G431 for the extra timers.",
"image": "assets/roadmap/stm32-schematic.png"
```

Put images in `assets/roadmap/`. Keep them reasonably small (under ~500 KB, around 1200px wide).
They're lazy-loaded and shown at a limited size; clicking one opens the full image.
Leave `"note"` or `"image"` as `""` when you don't need them.

### Set target dates

Replace each `"[YYYY-MM-DD]"` placeholder with a real date, such as `"2026-10-20"`.
Anything that isn't a valid date shows as "target TBD". A past target date is shown as-is,
with no overdue warning.

### Start a new project

Add another object to the `"projects"` array (with a comma after the previous `}`):

```json
{
  "id": "my-new-project",
  "name": "My New Project",
  "status": "next",
  "summary": "One-line description.",
  "started": "",
  "tags": ["Tag 1", "Tag 2"],
  "milestones": [
    {
      "title": "First milestone",
      "doneWhen": "What has to be true to call it done",
      "target": "2026-11-01",
      "completed": null,
      "note": "",
      "image": ""
    }
  ]
}
```

`status` decides where a project appears:

| Status | Shows on the site as |
|---|---|
| `"building"` | the full tracker in "Building now" |
| `"next"` | its name in the "Up next" line below the tracker |
| `"done"` | nowhere in this section |

When you start working on it, change `status` to `"building"` and set `"started"` to today's date.
If no project is `"building"`, the section and its nav link are hidden.

### Finish a project

1. Change its `status` to `"done"`. It disappears from "Building now".
2. Add a regular project card for it in the Projects section of `index.html` by hand.

### Check your commas and brackets

A JSON typo makes the whole section show "The build tracker couldn't load right now."
The browser console (F12) shows the real error and usually the line number. Common mistakes:

- A missing comma between two `{ ... }` milestones or between two fields.
- A trailing comma after the last item in a list or object (`"image": "",` followed by `}`).
- Comments: JSON doesn't allow `//` or `/* */`.
- Using `'single quotes'` instead of `"double quotes"`.

If you're unsure, paste the file into a JSON validator such as https://jsonlint.com before pushing.
