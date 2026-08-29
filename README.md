# pingutodoapp

A funny todo app represented by Pingu.

Cross-platform (iOS, Android, web) via Expo + React Native. Tasks live on the
device — no account, no backend, works offline.

## Run it

```bash
npm install
npm start          # then press i / a, or scan the QR with Expo Go
npm run typecheck  # tsc --noEmit
```

`npm run ios` needs macOS + Xcode; `npm run android` needs Android Studio.
Expo Go on a real phone needs neither.

## What's here

| Path | Purpose |
| --- | --- |
| `App.tsx` | Screen layout: mascot header, composer, filters, list |
| `src/useTodos.ts` | All task state — add / toggle / delete / filter, auto-persisted |
| `src/storage.ts` | `Store` interface + AsyncStorage implementation |
| `src/mood.ts` | Maps the list's state to one of Pingu's moods and a line of dialogue |
| `src/components/Pingu.tsx` | The mascot, drawn with plain Views and `Animated` |
| `src/components/TodoRow.tsx` | A single task row |
| `src/theme.ts` | Colors and spacing |

## The fun part

Pingu watches your list and reacts:

| Open tasks | Mood | Behaviour |
| --- | --- | --- |
| 0 (empty list) | `idle` | Slow bob, mildly suspicious |
| 1–4 | `happy` | Content |
| 5–9 | `worried` | Narrowed eyes, nudging you |
| 10+ | `panicking` | Fast wobble, flapping flippers |
| just completed one | `cheering` | Hops, squeezes eyes shut, hands you a 🐟 |

Completing a task also fires a success haptic. One fish per finished task —
un-completing hands the fish back, so the count never lies.

## Where this goes next

Deliberately left out so the first version stays small:

- **Due dates and reminders** — `expo-notifications`; Pingu's panic can key off
  what's overdue rather than raw count.
- **Sync across devices** — write a second `Store` (Supabase is the low-effort
  option) and swap it in `App.tsx`. Nothing in the UI needs to change.
- **Store builds** — `eas build`. The Expo config in `app.json` is already the
  source of truth for icons and names.
- **Streaks** — the data is already there (`completedAt` on every task).
