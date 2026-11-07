# King & Qxeen Gym: setup guide

A home-screen workout app for two: a **King** profile (black & gold, strength & size split) and a **Qxeen** profile (purple, glutes / toning / fat-burn split). Each has their own Mon–Fri split, exercise swaps, rep pacer, rest timer, a weekly reset with full history, body stats, monthly progress photos and export. It works offline at the gym and syncs when you're back online.

Setup takes about 15–20 minutes and costs nothing. Part 1 is the cloud (accounts and sync), Part 2 puts the app online, and Part 3 installs it on your phone.

> You can skip Part 1 and the app still works fully, saving on your phone only. Just use **More → Full backup** now and then.

---

## Part 1: Supabase (free cloud for login, sync and photos)

1. Go to **supabase.com** → *Start your project* → sign up (GitHub or email).
2. **New project** → give it a name like `gym` → set a database password (save it somewhere) → region **East US** (closest to Jamaica) → *Create*. Wait about a minute.
3. Left menu → **SQL Editor** → *New query* → paste everything in `supabase-setup.sql` → **Run**. You should see "Success. No rows returned."
4. Left menu → **Authentication** → *Sign In / Providers* → **Email** → turn **Confirm email** OFF → Save.
   (It's just you using it, so this skips the confirmation-email step. If you'd rather keep it on, the confirmation link only works properly after Part 2.)
5. Left menu → **Project Settings** → **API Keys** (or *Data API*) → copy:
   - **Project URL**: looks like `https://abcdefgh.supabase.co`
   - **anon public** key (or **publishable** key): a long string. Do **not** use the `service_role` / secret key.

Optionally, open `config.js` and paste both values in, so every phone connects automatically. Otherwise you paste them into the app in Part 3.

---

## Part 2: Put the app online (GitHub Pages, free)

1. Go to **github.com** → sign up or log in.
2. **+** (top right) → *New repository* → name it `gym` → **Public** → *Create repository*.
3. Click **uploading an existing file** → drag in **all** the files from this folder → *Commit changes*.
   - On a phone: unzip first (Files app on iPhone, Files by Google on Android), then in the GitHub site use *Add file → Upload files* and select all the files.
4. Repo **Settings** → **Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
5. After about a minute your app is live at **`https://YOUR-USERNAME.github.io/gym/`**

*Alternative on a computer:* go to **app.netlify.com/drop** and drag this whole folder onto the page. You get a live link instantly.

---

## Part 3: Install on your phone

1. Open your link in **Safari** (iPhone) or **Chrome** (Android).
2. **iPhone:** Share button → *Add to Home Screen*. **Android:** ⋮ → *Install app*.
3. Pick your side on the **Who's training?** screen (King or Qxeen).
4. **More** tab:
   - Paste the Project URL + key (if you didn't put them in `config.js`) → **Connect**. You only do this once per phone.
   - Enter an email + password → **Create account**. **Each person makes their own account** under their own profile: King signs up on King, Qxeen signs up on Qxeen. That keeps routines, history and photos completely separate and private.
5. The dot under the title turns green and says **Synced**. Done.
6. On your own phone, turn on **More → Skip the picker and always open as …** so it opens straight to your side. You can still switch anytime with the 👑 button at the top.

**Sharing one phone?** That works too. Both of you can stay signed in at the same time, and the picker decides whose app opens.

---

## Two profiles

| | King | Qxeen |
|---|---|---|
| Theme | Black & gold | Purple |
| Goal | Strength & size | Fat loss, toning, glutes |
| Mon | Legs & Glutes | Glutes & Hams |
| Tue | Upper Body | Upper & Core |
| Wed | Chest & Legs | Cardio & Core |
| Thu | Abs / Core | Legs & Glutes |
| Fri | Back & Biceps | Full Body Burn |

Each profile has its own data, photos and login. Nothing is shared between them.

## How it works

| Feature | Details |
|---|---|
| **Weekly reset** | Weeks run Monday to Sunday. Every Monday the workout tab starts blank, and last week appears in **History** with each day's actual date, sets, volume and average bodyweight. |
| **Dates** | Every set is timestamped. If you do Monday's workout on Tuesday, History shows "done Tue". |
| **Swaps** | ↻ on any exercise. Each alternative keeps its own weight history and targets. |
| **Weight targets** | 🎯 per exercise. When you hit the top of the rep range on all sets, it tells you to add 5 lb / 2.5 kg. |
| **Rep pacer** | ▶ Pace set: count-in, beeps on each phase, animated form figure, auto-logs the set. |
| **Rest timer** | Starts when you tick a set, beeps for the last 3 seconds, ±15 s buttons. |
| **Body** | Weight, waist, body fat %, notes, with a trend chart and 30-day / all-time change. |
| **Monthly photos** | Front / side / back each month, a reminder banner when the month's check-in is due, and a side-by-side compare of any two months. Photos are shrunk to ~300 KB and stored privately: only your login can see them. |
| **Export** | More → Full backup (.json, can be re-imported), Workouts (.csv), Body log (.csv), Photos (.zip). |
| **Offline** | Works with no signal and syncs automatically when you're back online. |

## Good to know

- **Supabase free tier pauses a project after 7 days with no activity.** If you train weekly with sync on, it stays awake. If it ever pauses (say you take 2 weeks off), the app keeps working offline. Log into supabase.com and click *Restore project*, and it syncs again. Paused projects are kept for 90 days.
- Free limits: 1 GB photo storage (about 3,000 photos at this size) and a 500 MB database, which is years of logs.
- **Changing the app later:** edit the files, bump `VERSION` in `sw.js` (e.g. `gym-v2`), and re-upload. Phones pick up the update the next time the app is opened twice.
- The LB/KG switch changes the label only. It doesn't convert numbers you've already logged.
- The rest-timer beep needs the app open on screen (phones mute web apps in the background). "Keep screen awake" (More tab) is on by default to help with this.
