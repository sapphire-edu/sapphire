# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Core:** the maker and a small circle of friends at the same NSW high school. They use it day to day through the term to log marks as results come back and to see what's coming up.
- **Open audience:** any NSW high school student can use it, without the friend-only features.

## Product Purpose

Sapphire is a lightweight gradebook for NSW high school students. Students enter each assessment (mark, total, weighting, date) per subject and see their weighted average and how it is trending. They also get a calendar of upcoming assessments and a weekly timetable. It exists because schools give students no portal for their marks, and keeping a spreadsheet up to date is too much work. Success means a student always knows where they stand in each subject without having to calculate it.

## Positioning

- Weighted averages and trends update live as marks are entered, which no school system gives students.
- Far less effort than a spreadsheet: onboarding adds the core NSW subjects, and you pick your electives.
- For the friend group there is a social layer: an opt-in leaderboard with online/last-seen presence, mark sharing, and one-click import of the school's published assessment schedule.

## Operating Context

- Used in the browser, often between classes or as soon as a mark is released. Sessions are short, to log a mark or check what's next.
- NSW school structure: terms, core and elective subjects, weighted assessment tasks, and yearly exams. The friend-group schedule import reads a school schedule JSON (e.g. `publish/term4-2026.json` in Appwrite storage), and imported exams follow later date and name changes.
- Data is local-first (`localStorage`). Optional Google sign-in syncs to Appwrite (`auth.sapphire.neonxsl.dev`). Guests stay local-only.
- Live at https://sapphire.neonxsl.dev/.

## Capabilities and Constraints

- Tabs: Dashboard (subjects, Upcoming), Analytics (weighted trend, per-subject lines on canvas charts), Calendar, Timetable (grid plus Daily view), Leaderboard (friends only).
- Settings: name, theme and variant, graph smoothing, and reset (local + cloud). Share/export strings, either subjects only or everything.
- Friend-only features are gated by `isFriend` (`js/leaderboard.js`): leaderboard, schedule import, and mark sharing. Do not expose them to the open audience.
- **No build step.** The site is plain static HTML/CSS/JS served as files: `js/` per feature, `css/` for V1, `css/v2/` for V2. No framework or bundler.
- **Two UIs.** V2 is the default look. V1 stays supported and must not break until it is retired. V1 users see an interactive tour and an upgrade banner.
- Appwrite payload size limits have caused sync failures before. Keep synced state compact.

## Brand Commitments

- Name: Sapphire. The favicon (`favicon.png`) is the existing mark.
- Visual identity lives in code (`css/tokens.css`, `css/v2/tokens.css`) and is not yet documented in DESIGN.md.

## Evidence on Hand

- README screenshots of V1 in dark and light themes.
- No testimonials, user counts, school endorsements, or other claims exist. Do not invent any.

## Product Principles

1. **Your marks are yours.** Comparison and sharing are always opt-in. Grades are personal, and privacy settings decide what anyone else sees.
2. **Zero-effort upkeep.** Logging a mark should take seconds. Anything that feels like maintaining a spreadsheet is a failure.
3. **Know where you stand at a glance.** Weighted averages, trends, and what's next come first. Detail is there on demand.
4. **Works without an account.** Guest mode is fully featured for personal tracking. Sign-in adds sync, not core value.
5. **Friends-only stays friends-only.** Social features serve the circle. The open audience gets a clean personal tool.

## Accessibility & Inclusion

Marks and rankings are sensitive information. Privacy controls must be clear, and their defaults must be conservative. No formal accessibility standard has been set; this is open.
