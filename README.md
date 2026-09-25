

The root `package.json` declares `client` and `server` as npm workspaces, so
that one command installs all three.# Dipisha Chhetri — Portfolio

A multi-page portfolio with a full admin panel. Every word, every picture, the
order things appear in and whether they appear at all lives in the database and
is editable from `/admin` — no code changes, no redeploy.

**Stack:** React 19 + Vite + React Router (client) · Express 5 + Postgres
(server) · Tailwind CSS v4 · JWT auth

**Design:** flat and illustrative — thick black outlines, flat coral / indigo /
yellow / lavender, generous rounding, and hand-drawn SVG illustrations. No
gradients, no shadows, no bevels. Everything is drawn.

---

## Pages

| Route | What's on it |
| --- | --- |
| `/` | Hero, scrolling skills band, the numbers, an intro block, featured projects, a closing pitch |
| `/about` | Her story, contact card, skills grouped into cards, the journey list |
| `/work` | Every project, with filter buttons built from the project kinds |
| `/work/:slug` | One project: cover, write-up, tools, gallery, links, and more work |
| `/services` | The service cards, a four-step "how this goes", a closing block |
| `/contact` | The form, direct details, social links, availability |
| `/admin` | The control desk (below) |

---

## Getting it running

```bash
npm install
```

The root `package.json` declares `client` and `server` as npm workspaces, so
that single command installs all three.

Copy `server/.env.example` to `server/.env` and fill it in:

```
DATABASE_URL=postgresql://…       # Supabase, Neon, Railway or a local Postgres
JWT_SECRET=…                      # node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

SUPABASE_URL=https://your-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=…       # Project Settings → API Keys → service_role
SUPABASE_BUCKET=DIPISHA           # must exist and be public
```

Uploaded images go into Supabase Storage. The **service_role** key is what lets
the server write to the bucket — it bypasses every security rule, so it stays
on the server and never reaches the browser. The bucket must exist and be
public; create it under **Storage → New bucket** if it does not.

Then create the tables, load the starter content, and make her account:

```bash
npm run db:setup
```
```bash
npm run db:seed
```
```bash
npm run create:admin
```

`create:admin` asks for an email and password at the prompt. There is no public
sign-up — that is the only way an account is made.

Start both halves together:

```bash
npm run dev
```

The site is at <http://localhost:5173>, the API at <http://localhost:4000>.
Vite proxies `/api` and `/uploads` through to the server, so the browser only
ever talks to one origin — same as in production.

To check everything is wired up, including the database:

```bash
npm run smoke
```

That spins up a throwaway admin account, exercises all 31 behaviours of the
API end to end, and deletes everything it made.

---

## The control desk — `/admin`

| Page | Controls |
| --- | --- |
| **Dashboard** | Counts, unread messages, and a four-step "start here" |
| **Profile & hero** | Name, photo, headline, story, email, phone, CV, availability light, social links, the home page numbers, and the title and description Google shows |
| **Page headings** | The heading, small label and sentence for every block on every page — plus a switch to hide a whole block |
| **Projects** | Cover image, gallery, write-up, tools, live and code links, "feature it", and the web address |
| **Skills** | The scrolling band and the grouped cards on the about page |
| **Services** | The big cards, each with a hand-drawn illustration |
| **Journey** | Education, jobs and certificates |
| **Inbox** | Messages from the contact form, with reply and delete |
| **Images** | Every uploaded file — upload, copy a link, delete |

Every list has the same controls: arrows to reorder, a Visible/Hidden toggle to
take something off the site without deleting it, and Delete with a confirmation.

### Why nothing is hardcoded

Dipisha has not settled on a direction yet — frontend, design, SEO, or some mix.
So the site does not assume a job title anywhere. If she decides she is a
designer, she renames the headings, swaps the skills and deletes the code-heavy
services, and the site follows. Same if she goes all-in on frontend. The only
fixed words on the public site are the five navigation labels and the four steps
on the services page.

---

## Security

- **Passwords** are hashed with bcrypt (cost 12). A login against a missing
  email still runs a comparison, so a wrong email and a wrong password take the
  same time to answer.
- **Sessions** are JWTs signed with `JWT_SECRET`, valid for seven days. The
  server refuses to start in production without a real secret set.
- **Deleting an account ends its sessions.** `requireAuth` checks the admin row
  still exists rather than trusting the signature alone — otherwise a token
  from a deleted account would keep working for up to a week. Verified by
  `npm run check:revoke`.
- **Admin routes** all sit behind `requireAuth`. Table and column names are
  checked against a whitelist in `server/src/tables.js` before they ever reach
  a query — nothing from a request body becomes SQL. Values are always
  parameterised.
- **Login** is rate limited to 10 attempts per 15 minutes; the contact form to
  `CONTACT_RATE_LIMIT` (default 5) per hour.
- **Uploads** are capped at 10MB, limited to image types plus PDF, and renamed
  to a safe slug with a random suffix before being sent to Supabase Storage.
  The file never touches this server's disk.
- **The service-role key** stays on the server. It bypasses every row-level
  security rule, so it must never be committed or reach the browser — only the
  resulting public URLs do. It lives in `server/.env`, which is gitignored.
- **The contact form** has a honeypot field and length checks on every value.

If the database URL is ever pasted somewhere public, reset it in Supabase under
**Settings → Database → Reset database password** and update `server/.env`.

---

## Deploying

There are two arrangements, and the repo supports both. The API always runs as
a long-lived Node process; what changes is whether it also serves the site.

### Render (or any host that runs a process)

The client builds to static files and the server hosts them, so the whole
thing runs as one Node service. [`render.yaml`](render.yaml) sets it up as a
blueprint; for any other host the two commands are:

```bash
npm install && npm run build
```
```bash
npm start
```

**The install must be a plain root `npm install`.** Because the repo uses npm
workspaces, that single command installs the client and the server too.
A build command that installs only the root, or only the root and the client,
leaves the server without its dependencies and the service dies at boot with
`Cannot find package 'dotenv'`.

Set these in the host's environment (not in a committed file):
`DATABASE_URL`, `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_BUCKET`. `PORT` is provided by the host. `CLIENT_ORIGIN` is only
needed if the front end is ever served from a different domain — when the same
service serves both, requests are same-origin and never touch CORS.

`JWT_SECRET` is required in production: the server refuses to start without it
rather than falling back to a known development value.

Uploaded images go to Supabase Storage rather than this server's disk, so a
host that gives the container a fresh filesystem on each deploy loses nothing.
There is no persistent-disk setup to do.

### Vercel (front end only)

The other arrangement: Vercel serves the built site from its CDN, and the
API stays on Render. [`vercel.json`](vercel.json) builds `client/dist` and
sends every unknown path to `index.html` so the client router handles deep
links. Import the repo at vercel.com/new and leave the framework preset as
**Other**.

Two variables, one on each side:

| Where | Variable | Value |
| --- | --- | --- |
| Vercel | `VITE_API_URL` | `https://your-api.onrender.com` (origin only, no `/api`) |
| Render | `CLIENT_ORIGIN` | `https://your-site.vercel.app,https://*.vercel.app` |

`CLIENT_ORIGIN` is not optional. The API only answers browsers from the
origins listed there, and it defaults to localhost — without it every request
from Vercel is blocked by CORS.

Entries may contain one `*`, which matches a single label and never a dot, so
`https://*.vercel.app` covers the fresh subdomain Vercel gives each preview
deploy without also matching `https://evil.vercel.app.attacker.com`. Check
what a running server actually accepts with:

```bash
npm run check:cors
```

`VITE_API_URL` is read at **build** time, not run time — Vite bakes it into
the bundle. Changing it means redeploying, not just restarting.

**Render's free tier sleeps after 15 minutes idle.** The page arrives from
Vercel instantly and then waits up to a minute for the API to wake, on every
visit after a quiet spell. On a paid plan this does not happen; on the free
plan, hosting both halves on Render avoids the split but not the sleep.

---

## Layout

```
client/
├─ src/
│  ├─ pages/            one file per route, plus pages/admin/*
│  ├─ components/
│  │  ├─ art/           the illustrations, and the maths that draws them
│  │  ├─ site/          header, footer, project card, social links
│  │  ├─ admin/         the generic CRUD editor, form fields, image pickers
│  │  └─ ui/            buttons, chips, headings, reveal-on-scroll
│  ├─ lib/              api client, content + auth context, page metadata
│  └─ index.css         the whole design system
server/
└─ src/
   ├─ routes/           auth, public, admin, upload
   ├─ tables.js         the table and column whitelist
   ├─ schema.sql        the tables
   ├─ seed.sql          the starter content
   └─ scripts/          setup, seed, create:admin, smoke
```

### The design system

All of it is in `client/src/index.css`, as plain classes usable anywhere:

| Class | What it is |
| --- | --- |
| `.block` / `.block-sm` | A flat panel with a 3px black outline |
| `.fill-coral` `.fill-indigo` `.fill-yellow` `.fill-lavender` `.fill-ink` | Flat colour fills |
| `.block-hover` | Lifts on hover. Movement, never a shadow |
| `.btn` + `.btn-ink` `.btn-coral` `.btn-yellow` `.btn-indigo` `.btn-sm` `.btn-icon` | Outlined pill buttons |
| `.chip` | A small uppercase pill |
| `.field` | An outlined input; focus turns it lavender |
| `.shell` | The page width |
| `.marquee-track` `.spin-slow` `.bob` `.reveal` | The four bits of motion |

Colours are CSS custom properties in the `@theme` block at the top. Change them
there and the whole site — illustrations aside — re-skins.

The component classes live inside `@layer components`, so Tailwind utilities
always win over them. That is what makes `md:hidden` work on a `.btn`.

### Motion

| Where | What happens |
| --- | --- |
| **Hero illustrations** | Point at them (or tap, or tab to them) and her photo takes over: the phone folds away and shrinks, the portrait swings in from a slight tilt, a wave runs diagonally across all sixteen bursts, and the yellow burst grows. A "Hover me" chip with a pulsing ring nudges you the first time, and fades out once you do |
| **Every heading** | Arrives a word at a time, each rising out of its own clipped line |
| **Every page banner** | Shapes drift behind the content, floating on their own timers and sliding against the scroll |
| Top of the window | A reading-progress bar fills as you go down the page |
| The header | Tightens up and turns white once you leave the top |
| Hero blocks | Drop in and settle on load, staggered |
| Her surname | The yellow bar draws itself in from the left |
| Burst grid | Each burst springs out with a spin, staggered by position |
| The numbers | Count up from zero the first time they scroll into view |
| The split-screen drawing | The pointer taps the button over and over, with a ripple where it lands |
| The card stack | Each card drifts on its own timer |
| The envelope | The letter lifts out and settles back |
| Every section | Lifts into place on first scroll |
| Project cards | Lift on hover; the cover image zooms; the placeholder burst rotates 135° |
| Service cards | Lift; the illustration grows and tilts |
| Route changes | The new page fades up rather than snapping in |
| Skills band | Slides continuously and loops seamlessly; pauses when you point at it |

The skills band measures itself rather than using a fixed duration. It repeats
the list until one half is at least as wide as the band (so a short list cannot
leave a gap mid-loop), then works the duration out from that width so it always
travels at 62 px/s — whether there are four skills or forty. The loop is a
translate of exactly -50% across two identical halves, which lands pixel-for-
pixel on the start of the second half, so it repeats without a jump.

### The motion switch

Most sites follow the operating system's "reduce motion" setting. This one
deliberately does not — it animates by default, because the motion is the
design, and a visitor whose machine has that setting on would otherwise see a
completely static page without knowing why.

Instead there is a **Motion on / Motion off** switch in the footer. It sets
`data-motion` on `<html>`, remembers the choice in `localStorage`, and is
applied by a snippet in `index.html` before the first paint so nothing
animates for a frame and then stops. Turning it off stops every animation and
transition at once, and the skills band becomes an ordinary side-scrolling row
so the whole list is still reachable.

**This is a real trade-off.** `prefers-reduced-motion` exists for people who
get motion sickness from animation, and ignoring it by default is not the
conventional choice. The footer switch is the mitigation: it is visible on
every page and takes one click. If you would rather follow the system setting
instead, change the default in `src/lib/motion.js` and the bootstrap snippet in
`index.html` to start from `matchMedia('(prefers-reduced-motion: reduce)')`.

The scroll-driven pieces (parallax, progress bar) write transforms straight to
the node inside a `requestAnimationFrame` rather than through React state — a
scroll handler that re-renders the tree is how a page starts to feel sluggish.
The parallax offset is clamped so a shape near the top of a long page cannot
drift out of the band it decorates.

All of it is switched off by the `prefers-reduced-motion` rule at the bottom of
`index.css`. The hover reveal still works there — it just happens instantly.

The reveal is only offered when there is actually a photo to show. Without one,
the illustrations stay put and the block is a plain `div` rather than a button.

**About the portrait:** `npm run placeholder:portrait` (already run) drops an
illustrated placeholder into `server/uploads/profile/` and points the profile at
it, so the hover reveal has something to reveal. It is deliberately a drawing in
the site's own style rather than a stock photo of a stranger — swap it for a
real photo in **/admin → Profile & hero**.

### The illustrations

`client/src/components/art/` — every drawing is inline SVG with the same ink,
the same stroke weight and flat fills. The eight-armed burst, the scalloped
flower and the cupcake frosting are generated from maths in `shapes.js` rather
than hand-written path data, so they stay perfectly symmetrical and are easy to
retune in one place.

`SERVICE_ART` and `TIMELINE_ART` map a name stored in the database to a drawing,
which is how the admin panel's "Picture" dropdown works.

---

## Notes

- The front end is a single-page app, so page titles and descriptions are set
  after mount. Google runs JavaScript before indexing, so this is fine — but if
  search traffic ever really matters, that is the thing to change.
- Brand icons are inline paths in `components/site/SocialLinks.jsx`. LinkedIn is
  drawn by hand because Simple Icons does not ship it for trademark reasons.
- `npm run lint` lints the client.
