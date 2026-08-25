# Indian Film Flair

Indian Cinema Rating & Ranking App

Copy everything below into Lovable as your starting prompt.

The Vision

Build a web app called Kalpit — a rating, ranking, and stats platform for Indian cinema across all industries (Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood, Bengali cinema, etc). Think Letterboxd's obsessive cataloging + Spotify Wrapped's shareable stat-card energy + the bold, kinetic visual confidence of apps like District. This is NOT a generic movie database clone — the UI/UX needs to feel like nothing else in the Indian film-app space. Indian cinema fans are loud, passionate, and visual — the app should feel like it belongs to them, not like a spreadsheet with posters.

Tech Stack

React + Tailwind CSS (Lovable default)

Supabase for auth, database, and storage (free tier)

TMDB API for movie/people data (free, licensed for third-party use) — do NOT scrape or hardcode data from IMDb, Wikipedia, or any other source

Framer Motion (or equivalent) for animations/transitions

Core Data Model

movies: id, title, industry (Bollywood/Tollywood/Kollywood/Mollywood/Sandalwood/Bengali/Other), release_year, poster_url (from TMDB), runtime, genres, synopsis, tmdb_id

people: id, name, role (actor/director/music_director — can hold multiple), photo_url, tmdb_id

movie_people: join table (movie_id, person_id, role_on_this_film)

ratings: user_id, movie_id, score (1-10), review_text, created_at

lists: user_id, title, description, movie_ids[]

users: id, username, avatar, bio, joined_date

submissions: user-submitted movies pending moderation (title, year, cast, poster upload, submitted_by, status)

MVP Features (build these first)

Movie database, seeded via TMDB API

Import script/integration pulling Indian-industry films by country + original_language filters (hi, ta, te, ml, kn, bn)

Movie detail page: poster, synopsis, cast, crew, aggregate rating, industry tag

Rating & review system

1–10 scale (not just stars — Indian cinema fans are precise about this)

Written reviews, editable/deletable by author

A "report review" flag button on every review (required for moderation — do not skip this)

Rankings / leaderboards

Top movies, top actors, top directors, top music directors

Filterable by industry, by decade, by genre

Rankings computed from aggregate user ratings (weighted average, not simple mean — protects against low-vote-count films gaming the top spot)

Person profile pages (actor / director / music director)

Filmography grid, aggregate rating across their films, basic factual stat card (films count, avg rating, top genre, years active)

Personal stat cards

Auto-generated from a user's own rating history: total films rated, top genre, top industry, highest/lowest rated film, "your year in cinema"

Must be visually shareable — designed to be screenshotted or exported as an image, this is your growth engine

Custom lists

User-created, titled, described, reorderable, public/private toggle

Crowdsourced submission flow

Logged-in users can submit a missing film (title, year, cast, poster upload) if it's not in the TMDB import

Goes into a moderation queue — build a simple admin view to approve/reject before it goes live

This is how you fill regional-cinema gaps without doing manual data entry yourself

Search & filter

Search movies, actors, directors, music directors

Filter by industry, genre, decade, rating

Compliance basics (non-negotiable, build even in MVP)

Terms of Service page (stub is fine for now)

Privacy Policy page (stub is fine for now)

Report/flag mechanism on all user-generated content (reviews, submissions)

UI/UX Direction — THIS IS THE MAIN GAME

This cannot look like a template. Push hard on these directions:

Full-bleed cinematic visuals. Movie posters and stills should dominate — hero sections with blurred/gradient-masked backdrop images behind content, not white cards on white backgrounds.

Dark mode as default, not an afterthought — like Spotify. Deep blacks/near-blacks with saturated accent colors punching through.

Industry-coded color identity. Give each film industry (Bollywood, Kollywood, Tollywood, etc.) its own accent color/gradient so the app visually shifts tone as you browse — this is a distinctive hook nobody else has done.

Bold, oversized typography for ratings and rankings — numbers should feel like the hero of the page, not small print.

Motion with purpose. Rating a film should feel satisfying (a little animation/haptic-style feedback), rankings should animate into position, stat cards should reveal with a "wrapped"-style sequential animation, not just appear.

Stat cards designed for screenshots. This is your viral loop — they need to look good enough that people want to post them on Instagram/Twitter without any editing. Study Spotify Wrapped's card layouts for inspiration on density and visual hierarchy, but make it distinctly Indian-cinema (posters, industry colors, Devanagari/regional-script accent typography where tasteful).

Swipeable, card-based browsing on discovery/ranking pages rather than plain scrolling lists — give it a tactile, app-like feel even on web.

Micro-interactions everywhere — hover states on posters, smooth transitions between pages, satisfying rating-submission feedback.

Do not default to generic SaaS-dashboard UI patterns (sidebar + card grid + gray backgrounds). This should feel like a media/entertainment product, not an admin panel.

What NOT to build yet (explicitly out of scope for MVP)

Social features (following users, activity feed)

Box office data/tracking

"Where to watch" streaming links

Payments/subscription tiers

Native mobile app

Future Roadmap (for reference — do not build now, but keep the data model extensible for these)

Social layer: follow users, activity feed, comments on reviews

"Where to watch": JustWatch API integration for streaming availability + affiliate monetization

Freemium tier: paid plan unlocking advanced stats, unlimited lists, unwatermarked stat card exports, ad-free

Watermarked stat cards: free-tier shared cards carry a small app watermark/logo — paid removes it

Display ads: once traffic justifies it (Google AdSense or an India-focused ad network)

Box office tracking: opening weekend, lifetime gross, trend charts per film

Data licensing: once you have a real volume of ratings/rankings data (1–2 years in), aggregate audience-sentiment insights could be licensed to production houses/OTT platforms

Native mobile app: React Native port once the web product has traction

Regional language UI: localize the interface itself into Hindi/Tamil/Telugu/etc, not just the content

Build the MVP list above first, prioritizing the movie database + rating system + rankings + stat cards as the core loop. Everything else in the future roadmap should be architecturally possible later but not built now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22ff7b03-a24f-4dd2-bedf-caeb714bfc3f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
