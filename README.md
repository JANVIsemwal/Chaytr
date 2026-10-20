<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/logo-mark-dark.png" />
  <img src="assets/brand/logo-mark.png" alt="Chaytr" width="120" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/wordmark-white.png" />
  <img src="assets/brand/wordmark-blue.png" alt="Chaytr" width="260" />
</picture>

### Technology that solves real problems.

The company website of **Chaytr**, a technology startup working across
**AI / ML · Embedded Systems · Robotics · Fintech**.

Built with **React Native + Expo Router**, rendered for the web, and ready to deploy on **Vercel**.

</div>

---

## About Chaytr

Chaytr (named after चैत्र, the month the Indian year begins) builds products that start with a real problem
and end with something people can use, from the device to the app. The website introduces the company,
its four focus areas and its two flagship products.

## Products

<table>
<tr>
<td width="50%" valign="top">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/nexpay-logo-white.svg" />
  <img src="assets/brand/nexpay-logo-black.svg" alt="NexPay" height="48" />
</picture>

**India's UPI, now open to everyone.**
A temporary UPI wallet for foreign visitors to India. Sign up with a passport and visa, load money at a fair
exchange rate, pay at any UPI QR, earn rewards, and cash out what is left before flying home. No Indian bank
account needed.

*Fintech · Coming soon*

</td>
<td width="50%" valign="top">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/bhedak-logo-white.png" />
  <img src="assets/brand/bhedak-logo-black.png" alt="Bhedak (भेदक)" height="64" />
</picture>

**See the threat before it sees you.**
Sentinel Pathfinder is a handheld radar for soldiers on forest patrol. It looks through foliage for the glint
of metal and the rhythm of breathing together, and warns the user with a silent vibration at 30–50 m.

*Defence and public safety · In development*

</td>
</tr>
</table>

## Website features

- **Home:** a live 3D capability map (the four focus areas turning on a glowing table, linked to the
  products), animated counters, focus-area cards, the way we work, and the products.
- **Product pages:** built like the product pages of [Agnikul](https://agnikul.in/product/) and
  [Skyroot](https://www.skyroot.in/mission-prarambh): one idea per screen, big numbers, and details in a
  question accordion that visitors open only if they want them.
  - *NexPay:* live wallet-app animation, interactive "how it works", comparison with cash and forex cards.
  - *Bhedak:* animated radar scope, line-of-sight and dual-signature signal animations, prototype renders.
- **About, Contact, Privacy and Terms** pages, plus a friendly 404 page.
- **Contact form** that works without a backend (see [Contact form](#contact-form)).
- Fully **responsive**: desktop, tablet and phone layouts, all animations included.
- Dark "Fusion" design: cyan and violet on deep navy, saffron highlights, JetBrains Mono labels.

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 57 · [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routes) |
| UI | React 19 · React Native 0.86 · [React Native Web](https://necolas.github.io/react-native-web/) |
| Graphics | `react-native-svg` · HTML canvas animations (`src/components/fx.tsx`) |
| Fonts | Inter · Space Grotesk · JetBrains Mono (via `@expo-google-fonts`) |
| Language | TypeScript |
| Hosting | [Vercel](https://vercel.com) (static single-page app) |

## Getting started

Requirements: **Node.js 20+** and npm.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:8081 (or press **w** in the terminal).

On Windows you can also double-click **`start-website.cmd`**, which starts the site and opens the browser.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server on port 8081 |
| `npm run build:web` | Build the production website into `dist/` |
| `npm run lint` | Check the code with ESLint |
| `npx tsc --noEmit` | Type-check the project |
| `npm run backup -- "name"` | Save a full copy of the project into `../backups` |

## Editing the content

All website text lives in **`src/config/site.ts`**:

- `COMPANY_NAME`, `TAGLINE`: used everywhere (navigation, footer, page titles, SEO).
- `contact`: email, phone, location and map link.
- `home`, `domains`, `about`, `contactPage`: copy for those pages.
- `flagships`, `nexpay`, `bhedak`: product cards and product pages.
- `projects`: smaller project cards (empty for now); `team` (empty: add people and the Team section appears).

Colours, fonts and sizes are in **`src/theme.ts`**.

## Contact form

The site has no backend, so the Contact Us form works in one of two ways:

1. **Default:** *Send Message* opens the visitor's email app with the message already addressed to the
   address in `contact.email`, so they only press Send.
2. **Optional, smoother:** create a free form on [Formspree](https://formspree.io), then set this
   environment variable (locally in `.env.local`, or in Vercel → *Settings → Environment Variables*):

   ```
   EXPO_PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/<your-form-id>
   ```

   Messages are then delivered straight to your inbox.

## Deploying to Vercel

Everything is configured in `vercel.json`: install `npm install`, build `npx expo export -p web`,
output `dist`, and a rewrite so links like `/projects/nexpay` open directly. `.vercelignore` keeps the
`server/` folder out of the deployment.

**From GitHub (recommended):** on [vercel.com](https://vercel.com) choose *Add New… → Project*, import this
repository, set the framework preset to **Other**, and click **Deploy**. Every push to `main` redeploys.

**From your computer:**

```bash
npx vercel
```

```bash
npx vercel --prod
```

**Custom domain:** Vercel project → *Settings → Domains* → add your domain (e.g. `chaytr.in`) and follow
the DNS instructions. HTTPS is set up automatically.

## Project structure

```
src/
  app/                  pages (Expo Router): home, projects, NexPay, Bhedak, about, contact, privacy, terms, 404
  components/
    home/               home page sections and the 3D capability map
    product/            product-page blocks, NexPay and Bhedak animations, product logos
    fusion/             shared design kit (colours, labels, buttons, framed photos)
    fx.tsx              canvas layer, network background, text effects
    Navbar.tsx, Footer.tsx, Page.tsx, …
  config/site.ts        all website text and contact details
  theme.ts              colours, fonts, sizes
assets/
  brand/                Chaytr, NexPay and Bhedak logos, favicon, app icon
  photos/               photos (sources in assets/photos/CREDITS.md)
server/                 sign-in backend, kept for later (not deployed, see below)
scripts/backup.mjs      versioned backups (npm run backup)
vercel.json             Vercel build settings
```

## Sign-in backend (kept for later)

Accounts are switched off on the live site for now. The `server/` folder still contains a complete backend
for them: **Node.js + Express + SQLite** with sign up, sign in, sign out, forgot / reset password by email,
and a contact-form inbox. Passwords are stored as salted **scrypt** hashes, sessions use **httpOnly
cookies**, and login, sign-up and reset requests are **rate-limited**.

To bring it back, host `server/` on a Node host with persistent storage (Render, Railway, Fly.io or a VPS)
and restore the sign-in pages. Settings go in `server/.env` (see `server/.env.example`); that file and the
database are git-ignored and never committed.

## Backups

`npm run backup -- "what-this-version-is"` copies the whole project (code, assets, settings, local database)
into a dated folder next to the project, in `../backups`, skipping `node_modules`, `dist`, `.expo` and
`.git`. To go back, copy a backup folder in place of the project and run `npm install`.

## Credits

- Focus-area photos from [Unsplash](https://unsplash.com) (free to use). Sources in `assets/photos/CREDITS.md`.
- NexPay and Bhedak images and logos from the teams' own presentations (Team Vertex and the Bhedak team,
  THDC IHET, Tehri).
- Fonts: Inter, Space Grotesk and JetBrains Mono, all under the SIL Open Font License.

## To do

- Names and one-liners for further AI/ML, Embedded Systems and Robotics projects
- Founding year and team story for the About page
- Final Privacy Policy and Terms of Use text
- Social media links, once the accounts exist

## License

© 2026 Chaytr. All rights reserved. The code and content in this repository may not be copied or reused
without permission.
