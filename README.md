# Dantá & Desrica Gym: setup guide

A home-screen workout app for two: a **Dantá** profile (amber, strength & size split) and a **Desrica** profile (violet, glutes / toning / fat-burn split). Each has their own Mon–Fri split, exercise swaps, rep pacer, rest timer, a weekly reset with full history, body stats, monthly progress photos and export. It works offline at the gym and syncs when you're back online.

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
3. Pick your side on the **Who's training?** screen (Dantá or Desrica).
4. **More** tab:
   - Paste the Project URL + key (if you didn't put them in `config.js`) → **Connect**. You only do this once per phone.
   - Enter an email + password → **Create account**. **Each person makes their own account** under their own profile: Dantá signs up on Dantá, Desrica signs up on Desrica. That keeps routines, history and photos completely separate and private.
5. The dot under the title turns green and says **Synced**. Done.
6. On your own phone, turn on **More → Skip the picker and always open as …** so it opens straight to your side. You can still switch anytime with the button at the top.

**Sharing one phone?** That works too. Both of you can stay signed in at the same time, and the picker decides whose app opens.

---

## Two profiles

| | Dantá | Desrica |
|---|---|---|
| Theme | Black & amber | Black & violet |
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

## Feature pack (v4)

**Upgrading?** Upload all the files again, then run `supabase-update-scoreboard.sql` once in Supabase → SQL Editor. Skip the SQL and everything still works, except the scoreboard only sees the other person's stats when you're both on the same phone.

| Area | What you get |
|---|---|
| **PRs** 🏆 | Confetti and a trophy when you beat your best weight or best set. History → PRs shows your best lifts and recent PRs. |
| **Auto progression** | Weights pre-fill for you: hit the top of the rep range and it adds 5 lb (2.5 kg), miss reps and it holds, miss twice and it resets about 10% lower. Turn it off in More. |
| **Warm-up** 🔥 | Ramp-up sets for your first and heaviest lifts, with plates per side. |
| **Plates** 🏋️ | Plate calculator with a picture of the loaded bar. 45/35/15 lb or 20/15/10 kg bar. |
| **Deload** 🧘 | After 6+ straight weeks the app suggests a deload week: half the sets at about 60% weight. |
| **Swap library** ↻ | 200+ exercises grouped by muscle. Every swap shows the best picks first, then every other option for that muscle, with a search bar. Typing a name in the routine editor fills in the form figure and tips too. |
| **Figures** | 56 animated form figures, so every exercise in the library has one that matches the movement (push-ups, pulldowns, skull crushers, bike, rower, sled and so on). |
| **Favorites** ⭐ | Tap ★ on any exercise to pin it to the top of its muscle group whenever you swap. Browse them all in More → Exercise library & favorites. |
| **Remembered preferences** 🧠 | Swaps stay swapped every week, the exercises you pick most show first as "Your usual swaps", and each exercise remembers your own rest time and rep pace. See or undo them in More → Remembered preferences. |
| **Appearance** ☀️🌙 | More → Settings → Appearance: Light, Dark or Auto (follows your phone). Each profile keeps its own choice. |
| **Live mode** 📡 | Run `supabase-update-live.sql` once. When one of you ticks a set, the other's app updates in about 1–2 seconds: a live card shows their day, sets done, last set and rest countdown, plus a toast for each set, PR or finished day. The 🔥 Hype / 👊 Nudge button sends a burst to the other phone. Without the SQL it still updates every 20 seconds. Turn off "Share live activity" in More to share only counts. |
| **Caffeine** ☕ | The cup at the top keeps the screen from sleeping the whole time the app is open (glows and steams when on). It uses the browser's wake lock, with a silent looping video as a backup on phones that don't support it. Remembered per phone. |
| **Session timer** ⏱ | Tap "Set a session time limit" on the Workout tab and pick 30 min to 2 hr (or custom). It counts down on both phones. Either of you can pause, add 10 min or end it, and the other phone updates live. Heads-ups at 10, 5 and 1 minute left, then an alarm when time's up, and it counts overtime in red. |
| **Notes** 📝 | A notes box on every exercise. Last session's note shows up next time. |
| **Edit routine** ✏️ | More → Edit my routine: add, remove, reorder or edit exercises, sets, reps, rest, the form figure and tips. Each profile is separate. |
| **Streaks** | Day streak (weekends never break it) and week streak (hit your days-per-week goal). |
| **Scoreboard** | History → Scoreboard: Dantá vs Desrica for days this week/month, streaks, PRs. Crowns go to whoever leads. |
| **Nudges** | "Desrica already hit Glutes & Hams today 👀 Your move." |
| **Partner mode** 👥 | More → Partner mode. Train together on one phone and switch people at the top of Workout. Each person has their own rest timer, and the other person's countdown floats at the bottom. |
| **Measurements** | Chest, arms, thighs, hips, waist and body fat, with change since your first entry and a chart for each. |
| **Photo slider** ⟷ | Compare months by dragging a line across, or side by side. |
| **Ghost camera** 👻 | Take check-in photos in the app with last month's photo faintly overlaid so you line up the same way, plus a 3 or 10 sec self-timer. |
| **Monthly recap** 📤 | A shareable image: workouts, sets, weight lifted, PRs, bodyweight change, streak and top lifts, in your theme. |
| **Fuel tab** 💧 | Calories, protein, water and steps rings with quick-add buttons, extra cardio minutes, and a weekly cardio goal that also counts treadmill/walk time from workouts. Includes a calorie & protein calculator with a safe minimum. |
| **Reminders** 📅 | More → Gym & photo reminders adds repeating events with alerts to your phone's calendar. |

**Not possible in a web app:** connecting to Apple Health or Google Fit (Google has shut down the Fit API), and sending scheduled push notifications without a paid server. The calendar reminders cover the notification part, and the CSV exports cover moving your data.

## Good to know

- **Supabase free tier pauses a project after 7 days with no activity.** If you train weekly with sync on, it stays awake. If it ever pauses (say you take 2 weeks off), the app keeps working offline. Log into supabase.com and click *Restore project*, and it syncs again. Paused projects are kept for 90 days.
- Free limits: 1 GB photo storage (about 3,000 photos at this size) and a 500 MB database, which is years of logs.
- **Changing the app later:** edit the files, bump `VERSION` in `sw.js` (e.g. `gym-v2`), and re-upload. Phones pick up the update the next time the app is opened twice.
- The LB/KG switch changes the label only. It doesn't convert numbers you've already logged.
- The rest-timer beep needs the app open on screen (phones mute web apps in the background). "Keep screen awake" (More tab) is on by default to help with this.
