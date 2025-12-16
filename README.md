Below is a **clean, durable goal spec sheet** you can drop directly into your `README.md`.
It’s written for *future agents* (Codex, humans, or otherwise): stable, non-implementation-specific, and oriented around **intent, constraints, and invariants** rather than tools.

You should treat this as the **north-star contract** for the repo.

---

# Dinewith — Goal Specification (Canonical)

## 1. Purpose

**Dinewith connects people with people through shared meals and eating.**

The platform enables:

* Companionship during meals (virtual or in-person)
* Cooking together or eating together
* Watching or hanging out with others while eating via live video

Dinewith is **not** a food delivery app, a dating app, or an adult platform.

It is a **people-centered marketplace** with a live streaming layer.

---

## 2. Core Product Pillars

### A. Marketplace

A curated marketplace of individuals offering dining companionship.

Users may offer:

* Eating together (virtual or in person)
* Cooking together (virtual)
* Hosting or joining small group meals
* Conversation while eating

Key properties:

* Individuals only (no businesses)
* All offerings are user-defined (pricing, format, availability)
* Manual approval required before listings go live
* Bookings can be requested, accepted, completed, reviewed

---

### B. Live Streaming

A live video layer where users:

* Eat on camera
* Cook on camera
* Hang out with viewers while they eat

Streaming formats include:

* 1:1 private sessions
* Small group rooms
* Broadcast streams with chat

Properties:

* Non-adult, PG-13 standard
* Moderated by humans
* Streams may be ticketed, tipped, or subscription-based
* VOD retention is **7 days max**

---

## 3. Geographic Model

* Launch regions: **Minneapolis–St. Paul, Chicago, Madison**
* Expansion happens via **city nodes**
* Each city has:

  * A public landing page
  * A waitlist
  * Structured data feeds (machine-readable)

City pages are **first-class entities**, not marketing afterthoughts.

---

## 4. Users & Roles

### User types

* **Guest** — browses, books, watches
* **Host** — offers services or streams
* **Moderator** — reviews content and reports
* **Admin** — operational control

### Eligibility

* 18+ only
* Identity verification required for hosts
* No background checks at MVP
* No minors as buyers or sellers

---

## 5. Trust, Safety, and Boundaries (Hard Constraints)

Dinewith explicitly forbids:

* Adult services
* Nudity or sexualized content
* Escorting or dating services
* Any interaction involving minors

Safety principles:

* Human review of hosts and flagged content
* Clear reporting and enforcement pathways
* Location privacy until booking is confirmed
* Transparent Safety Hub and enforcement metrics

These constraints are **non-negotiable**.

---

## 6. Payments & Economics

### Pricing

* All pricing is set by users
* Supported models include:

  * Fixed price
  * Hourly / per-minute
  * Ticketed events
  * Subscriptions
  * Tips / gifts

### Fees

* Platform fee: **4%**, paid by the host
* Payment processing fees paid by the guest
* Fees are explicit and transparent

### Payment flow

* Delayed capture (authorization → completion)
* Refund policy:

  * ≥24h: full refund
  * <24h: 50%
  * No-show: host keeps 100%
  * Platform fee refunded only on platform fault

---

## 7. Content & Profiles

Hosts maintain profiles that may include:

* Bio and photos
* Offerings and menus
* Availability
* Pricing
* Reviews
* Safety and identity badges

Content creation uses:

* Simple WYSIWYG tools
* Structured blocks (text, images, menus, schedules)
* No markdown or raw HTML required

---

## 8. Moderation & Community Safety

* Manual approval for hosts and listings
* User-initiated reporting on all content
* Moderator queue for review and enforcement
* Safety Hub with:

  * Rules
  * Reporting guidance
  * Transparency statistics

Moderation decisions must be **auditable**.

---

## 9. Data & Discoverability (Future-Proofing)

The platform is designed to be:

* Searchable by humans
* Indexable by machines
* Usable by LLM agents

Requirements:

* Stable entity IDs
* Public read-only APIs for listings and streams
* JSON-LD embedded in public pages
* City and listing feeds (JSON / NDJSON)

Private data is never exposed.

---

## 10. Technical Invariants (Tool-Agnostic)

Regardless of implementation details:

* Web-first
* Deterministic builds
* Strong typing and validation
* Role-based access control
* No secrets in source control
* Deployment via GitHub → Vercel

Technology may change; **these constraints do not**.

---

## 11. MVP Definition of “Done”

The MVP is complete when:

1. Users can browse city pages and join waitlists
2. Hosts can apply, be reviewed, and publish listings
3. Guests can book and complete a paid session
4. Live streams can be created, monetized, and moderated
5. Reviews, payouts, and refunds function correctly
6. Safety reporting and moderation are operational
7. Public data is machine-readable and stable

---

## 12. Non-Goals (Explicit)

Dinewith is **not**:

* A dating platform
* A delivery service
* A restaurant reservation system
* A creator content network
* A gig platform for minors

Any future agent should **not drift** into these areas.

---

## 13. Design Ethos

**Human first. Tech enabled. Quietly modern.**

The product should feel:

* Calm
* Trustworthy
* Personal
* Non-performative
* Not gamified for its own sake

The technology should disappear behind the interaction.

---

**This document is canonical.
If implementation conflicts with this spec, the spec wins.**

---

