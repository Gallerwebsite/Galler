# Galler Website — Complete Documentation

**Product:** Galler / GallerIndia / Galler Engineering  
**Tagline:** An end-to-end engineering solutions company  
**Meta title:** Galler - End-to-End Engineering Solutions  
**Description:** End-to-end manufacturing solutions from machining and fabrication to molding and assembly

---

## 1. Project overview

Galler is a corporate marketing website for an Indian end-to-end engineering and electronics manufacturing company. The site covers:

- Design, R&D, and manufacturing of mechanical & electro-mechanical smart devices
- ESDM / IoT-enabled electronics manufacturing
- Engagement models: **ODM**, **OEM**, and **Re-engineering**
- Industries including telecom, petroleum, defense, automotive, industrial automation, energy, retail, finance, transportation, and emerging tech

Almost all public copy and media is **CMS-driven** via an Express API (`GET /api/content`). An admin portal lets the team edit pages, manage jobs, review form submissions, and run newsletter campaigns.

---

## 2. Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Animation | Framer Motion, Magic UI `TextAnimate` |
| Icons | `react-icons` |
| Backend / CMS | Express, Mongoose, JWT, bcrypt, Helmet, CORS, rate limiting |
| Database | MongoDB (with JSON fallbacks) |
| Media | Cloudinary + local `/uploads` |
| Email | Resend |
| Auth | Cookie JWT (`galler_admin_token`), Next.js middleware on `/admin/*` |
| Maps | Google Maps embeds |
| Hosting (typical) | Vercel (frontend) + Render (API) |

---

## 3. Site navigation

### Primary nav (Navbar)

| Label | URL |
|--------|-----|
| Home | `/` |
| About Us | `/about` |
| Our Projects | `/projects` |
| Careers | `/careers` |
| Contact | `/contact` |

- Fixed header with navy gradient background
- Logo links to home
- Desktop: centered links; Mobile: slide-over panel from the right
- Active link: white text + orange accent dot (`--primary-orange`)

### Footer

Same five routes, plus:

- Newsletter subscribe form
- Contact block (address / phone / email)
- Social links: Instagram, LinkedIn, YouTube

### Not in main nav

| Route | Purpose |
|--------|---------|
| `/unsubscribe` | Newsletter unsubscribe |
| `/admin/login` | CMS login |
| `/admin` | Protected CMS dashboard |

### Legacy redirects

| Old URL | Redirects to |
|---------|----------------|
| `/industries/[slug]` | `/projects/[slug]` |
| `/industries/[slug]/[productSlug]` | `/projects/[slug]/[productSlug]` |

---

## 4. Color system

### Design tokens (`app/globals.css`)

| CSS variable | Hex | Tailwind usage |
|--------------|-----|----------------|
| `--background` | `#f5f5f5` | Page / section backgrounds |
| `--foreground` | `#171717` | Default text |
| `--primary-orange` | `#d4531a` | Brand accent → `bg-primary` / `text-primary` |
| `--dark-navy` | `#1a1145` | Navy token → `bg-navy` / `text-navy` |

### Brand & UI colors (used across the site)

| Role | Hex | Typical use |
|------|-----|-------------|
| Deep navy (gradient start) | `#051c2c` | Navbar, heroes, certificates overlay |
| Mid navy (gradient mid) | `#0a3e65` | Same brand gradients |
| Section navy | `#0b1f4a` | Headings, primary buttons, focus rings |
| Navy hover (darker) | `#0a1840` | Button hover |
| Navy hover (lighter) | `#123066` | Product download button hover |
| Certificate card navy | `#0a2540` | Certificate cards |
| Work-with-us card navy | `#071829`, `#0a2035` | Engagement model cards |
| Accent cyan / blue | `#0099E1` | Services, Work With Us, stats |
| Accent blue (alt) | `#0094df` | About “Know More” border |
| Cyan hover | `#0088cc` | Work With Us modal submit hover |
| Soft cyan (hover tint) | `#6ec4e8` | Soft hover backgrounds |
| Journey cyan | `#4dd9f0`, `#7ee8ff` | Timeline shimmer |
| Orange primary | `#d4531a` | Brand CTA accent / hover |
| Orange darker | `#b8451a` | Primary form buttons, required asterisks, accents |
| Gold | `#c9a227` | Careers form required markers |
| Blueprint stroke | `#7eb8d4` | About dimensions pattern |
| About CTA blues | `#4a6a8a`, `#2a4a6a`, `#1a3050` | Achievements contact panel |
| Button black | `#1a1a1a`, `#2a2a2a` | Shared `Button` component |
| Icon gray (footer) | `#9ca3af` | Footer SVG strokes |

### Neutrals & surfaces

| Hex | Use |
|-----|-----|
| `#ffffff` / white | Cards, text on dark, form backgrounds |
| `#faf6ef` | Warm icon chip background (contact) |
| `#f8f9fa`, `#f8f8f8` | Light hover / alt surfaces |
| `#f7f7f7` | Product gallery empty / media bg |
| `#f6f6f6` | About section, logo marquee |
| `#f5f5f5` | Global page bg, certificates, contact form area |
| `#f2f2f2` | Subtle section fills |
| `#e8e0d0` | Warm borders (contact icon chips) |
| `#e5e5e5`, `#e0e0e0`, `#ddd` | Dividers / form borders |
| `#d8d8d8`, `#c8c8c8`, `#a8a8a8` | Industry card placeholders |
| `#aaa`, `#777`, `#666`, `#555` | Muted UI / labels |
| `#4a4a4a` | Body copy |
| `#333` | Form input text |
| `#1a1a1a` | Strong headings / dark UI |
| `#000000` | Display headings on light sections |

### Brand gradients

```css
/* Navbar, Services, Work With Us */
linear-gradient(49deg, #051c2c 32%, #051c2c 32%, #0a3e65 64%)

/* Hero / projects hero fallbacks */
from-[#051c2c] via-[#0a3e65] to-[#051c2c]
```

---

## 5. Typography

| Font | CSS / class | Usage |
|------|-------------|--------|
| **Century Gothic** | `--font-century` / `font-century` | Body, nav, UI copy (~15px) |
| **Cinzel** | `--font-cinzel` / `font-cinzel` | Display headings (~27–40px) |
| **Geist / Geist Mono** | `--font-geist-sans`, `--font-geist-mono` | Loaded via `next/font`; body prefers Century Gothic |

**Pattern:** Cinzel for H1/H2 display + Century Gothic for body. Many headings use character-by-character slide animations.

---

## 6. Page-by-page documentation

### 6.1 Home — `/`

**File:** `app/page.tsx`  
**Purpose:** Brand landing and capability overview  
**Chrome:** Navbar + Footer

| # | Section | Component | What it does |
|---|---------|-----------|--------------|
| 1 | Hero | `HeroSection` | Full-bleed hero video; headline “AN END-TO-END ENGINEERING / SOLUTIONS COMPANY” |
| 2 | About | `AboutSection` | Company story, animated count-up stats, “KNOW MORE” → `/about` |
| 3 | Our Services | `OurServicesSection` | Design / Manufacturing / Lifecycle (ESDM) on navy gradient |
| 4 | Industries | `IndustriesSection` | Industry carousel; cards link to `/projects/[slug]` |
| 5 | Work With Us | `WorkWithUsSection` | ODM / OEM / Re-engineering cards; opens query modal |
| 6 | Certificates | `CertificatesSection` | Certificate carousel + lightbox zoom |
| 7 | Clients | `LogoMarquee` | “OUR CLIENTS” infinite logo marquee |

**Features on this page:** CMS content, Framer Motion entrances, count-up numbers, query modal form, certificate lightbox, marquee animation.

---

### 6.2 About Us — `/about`

**File:** `app/about/page.tsx`  
**Meta:** About Us — Galler Engineering  
**Chrome:** Navbar + Footer

| # | Section | Component | What it does |
|---|---------|-----------|--------------|
| 1 | Hero | `AboutHero` | About page hero |
| 2 | Positioning | `AboutSectionTwo` | Client-first design / develop / manufacture story |
| 3 | Journey | `JourneyCarousel` | Company journey / timeline carousel |
| 4 | Dimensions | `AboutDimensions` | Feasibility / method / concepts with blueprint styling |
| 5 | Team | `AboutTeamSection` | Leadership / team showcase |
| 6 | Achievements + CTA | `AboutAchievementsContact` | Stats, requirement form, logo marquee |

**Features:** CMS-driven about page content, timeline shimmer animation, sticky-scroll style reveals, requirement inquiry form.

---

### 6.3 Our Projects — `/projects`

**File:** `app/projects/page.tsx`  
**Chrome:** Navbar + Footer

| # | Section | Component | What it does |
|---|---------|-----------|--------------|
| 1 | Hero | `ProjectsHero` | Navy gradient hero + “START A PROJECT” CTA (modal) |
| 2 | Industries grid | `ProjectsIndustriesGrid` | Grid of industries linking to detail pages |

**Features:** Start Project modal (name, company, email, phone, subject, details).

---

### 6.4 Industry detail — `/projects/[slug]`

**File:** `app/projects/[slug]/page.tsx`

| # | Section | Component | What it does |
|---|---------|-----------|--------------|
| 1 | Industry hero | `ProjectsIndustryHero` | Industry title / intro on navy gradient |
| 2 | Products | `ProductPreviewCard` grid | Product cards → product detail |

---

### 6.5 Product detail — `/projects/[slug]/[productSlug]`

**File:** `app/projects/[slug]/[productSlug]/page.tsx`  
**Main UI:** `IndustryDetailContent`

**Features:**

- Image / video gallery with thumbnail strip
- Click-to-zoom on media
- Feature list
- Downloads: brochure, 3D model, checkout video (when available)
- Corner-bracket frame styling on media

---

### 6.6 Careers — `/careers`

**File:** `app/careers/page.tsx`  
**Meta:** Careers — Galler Engineering  
**Chrome:** Navbar + Footer

| # | Section | Component | What it does |
|---|---------|-----------|--------------|
| 1 | Hero | `CareersHero` | Careers hero / brand message |
| 2 | Why Galler | `WhyWorkAtGaller` | Benefits / reasons to join |
| 3 | Life at Galler | `LifeAtGaller` | Culture / workplace imagery |
| 4 | Openings | `CurrentOpenings` | Live jobs from API + apply / resume CTA |
| 5 | Hiring process | `HiringProcess` | Step-by-step hiring flow |

**Features:**

- Jobs loaded from `/api/careers/jobs`
- Categories (engineering, sales, operations, manufacturing, support)
- `ApplyJobModal` — apply with resume upload
- `SubmitResumeModal` — general resume drop

---

### 6.7 Contact — `/contact`

**File:** `app/contact/page.tsx`  
**Meta:** Contact — Galler Engineering  
**Chrome:** Navbar + Footer

| # | Section | Component | What it does |
|---|---------|-----------|--------------|
| 1 | Hero | `ContactHero` | Contact page hero |
| 2 | Main | `ContactMain` | Contact info + inquiry form |
| 3 | Locations | `ContactLocations` | Plant / office list + Google Maps embed |
| 4 | Departments | `ContactDepartments` | Department contacts (sales, support, etc.) |

**Contact form fields:** Full name, email, phone (optional), subject, message.

---

### 6.8 Unsubscribe — `/unsubscribe?token=…`

**File:** `app/unsubscribe/page.tsx`  
**Purpose:** Confirm newsletter unsubscribe  
**Chrome:** Standalone (no navbar/footer)

---

### 6.9 Admin — `/admin` & `/admin/login`

| Route | File | Purpose |
|--------|------|---------|
| `/admin/login` | `app/admin/login/page.tsx` | Email/password CMS login |
| `/admin` | `app/admin/(protected)/page.tsx` | Full CMS dashboard |

**Admin capabilities:**

- Edit homepage, about, contact, careers, projects / industries / products, footer
- View & manage form submissions (contact, start project, work-with-us)
- Manage jobs, applications, resumes
- Newsletter subscribers & campaigns
- Media uploads (image / video / document)

Middleware requires auth cookie for `/admin/*` except login. Admin layout is noindex.

---

## 7. Shared layout & common components

| Component | Path | Role |
|-----------|------|------|
| Root layout | `app/layout.tsx` | Metadata, fonts, `globals.css` |
| Navbar | `app/components/common/Navbar.tsx` | Fixed site header |
| Footer | `app/components/common/Footer.tsx` | Links, newsletter, contact, social |
| Button | `app/components/common/Button.tsx` | Primary / outline CTA with orange arrow |
| CountUpNumber | `app/components/common/CountUpNumber.tsx` | Animated statistics |

---

## 8. Features checklist

### Content & CMS

- [x] CMS-driven page content (`GET /api/content`)
- [x] Admin PUT per content section
- [x] Dynamic pages (`force-dynamic`) so CMS edits show immediately
- [x] JSON fallbacks when API / DB unavailable

### Forms & leads

- [x] Contact form
- [x] Start a Project modal
- [x] Work With Us query modal
- [x] About page requirement form
- [x] Job application (with resume)
- [x] General resume submission

### Careers

- [x] Public jobs board
- [x] Apply + resume upload
- [x] Hiring process section
- [x] Admin job CRUD

### Newsletter

- [x] Footer subscribe
- [x] Unsubscribe page (token-based)
- [x] Admin subscribers + campaigns (Resend)

### Media & products

- [x] Hero video
- [x] Certificate carousel + lightbox
- [x] Client logo marquee
- [x] Product image/video gallery + zoom
- [x] Brochure / 3D model / video downloads
- [x] Cloudinary + local uploads

### UX / motion

- [x] Framer Motion page / section entrances
- [x] Character slide headings
- [x] Infinite marquees
- [x] Timeline shimmer
- [x] Certificate hover scale
- [x] Reduced-motion support for marquees / shimmer
- [x] Responsive mobile nav

### Auth & security

- [x] JWT cookie admin auth
- [x] Rate-limited login
- [x] Helmet, CORS, CSP / HSTS (server)
- [x] Admin noindex

### Ops

- [x] Health endpoint

---

## 9. API surface (summary)

### Next.js proxies (`app/api/`)

| Route | Role |
|-------|------|
| `GET /api/auth/token` | Expose admin JWT for large uploads |
| `POST /api/upload/image` | Proxy image upload |
| `POST /api/upload/video` | Proxy video upload |
| `POST /api/upload/document` | Proxy document upload |

Proxy route: `/api-backend/:path*` → `NEXT_PUBLIC_API_URL` (`app/api-backend/[...path]`).

### Express backend (`server/`, typically port **5001**)

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | login, verify, logout |
| `/api/content` | GET all / section; PUT section (auth) |
| `/api/upload` | image, video, document; DELETE (auth) |
| `/api/files` | file download |
| `/api/contact` | public POST; admin GET/PATCH |
| `/api/projects` | start-project POST; admin GET/PATCH |
| `/api/work-with-us` | query POST; admin GET/PATCH |
| `/api/careers` | jobs, resume, apply; admin applications |
| `/api/newsletter` | subscribe, unsubscribe, campaigns |
| `/api/health` | status + storage flags |

---

## 10. File map (high level)

```
Galler/
├── app/                      # Next.js pages, components, API proxies
│   ├── page.tsx              # Home
│   ├── about/                # About
│   ├── projects/             # Projects + industry + product
│   ├── careers/              # Careers
│   ├── contact/              # Contact
│   ├── unsubscribe/          # Newsletter unsubscribe
│   ├── admin/                # CMS login + dashboard
│   ├── industries/           # Legacy redirects → /projects
│   ├── components/           # UI by area (home, about, contact, …)
│   ├── api/                  # Next proxies
│   ├── lib/                  # Content helpers, auth, downloads
│   ├── globals.css           # Tokens, fonts, animations
│   └── layout.tsx
├── server/                   # Express CMS API
├── Assets/                   # Logo & brand images
├── Fonts/                    # Cinzel, Century Gothic
├── public/                   # favicon, video, gifs, marquee logos
├── registry/magicui/         # TextAnimate
└── middleware.ts             # Admin auth gate
```

---

## 11. Branding summary

| Signal | Copy / asset |
|--------|----------------|
| Names | **Galler**, **GallerIndia**, **Galler Engineering** |
| Hero | “AN END-TO-END ENGINEERING SOLUTIONS COMPANY” |
| Positioning | India’s industrial electronics & software solutions; custom smart devices; R&D-led |
| Services | IoT-enabled integrated electronics manufacturing across ESDM |
| Models | ODM · OEM · Re-engineering |
| Careers tone | Build products. Solve real problems. Create impact. |
| Logo | `/Assets/logo.png` |
| Favicon | `/public/favicon.png` |
| Home video | `/public/videos/home-video.mp4` |

---

*Generated from the current Galler codebase. Content on public pages may change via the CMS without code changes.*
