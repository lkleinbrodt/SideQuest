Here’s a full README.md draft for SideQuest. It’s Markdown-friendly, repo-ready, and combines + expands on the last two specs. It’s fleshed out for clarity so an AI collaborator (or a human dev) could pick it up and immediately understand what needs building.

⸻

# SideQuest 🎯

_A playful, minimalist app for daily micro-adventures._

---

## Overview

**SideQuest** is a mobile app that delivers **three personalized “side quests” every morning**.  
These quests are small, fun, achievable challenges that help users add novelty, productivity, and joy to their day — without guilt or pressure.

Users can:

- Receive a fresh set of quests each morning (auto-generated with AI).
- Pick which quests to pursue.
- Mark them complete (or skipped) later in the day.
- Give thumbs-up/thumbs-down feedback to refine future quests.

The app is **single-user focused** at first (to keep scope tight), but we’ll build with real persistence and APIs so it can grow into a multi-user/social product if desired.

---

## Product Goals

- **Delight, not guilt:** SideQuest is about fun nudges, not chores.
- **Tiny adventures:** Each quest should take ≤15 minutes.
- **Personalized:** Quests reflect user preferences and past feedback.
- **Varied:** No two mornings feel the same.
- **Lightweight build:** Weekend-sized MVP using React Native, Flask, Supabase, and an LLM backend.

---

## Core User Flows

### 1. Onboarding

- Present ~10 example quests across diverse categories (fitness, social, mindfulness, chores, hobbies, outdoors, etc.).
- User gives thumbs-up/thumbs-down for each.
- User optionally adds a **“Preferences Prompt”** in free text (e.g. _“I work from home, have a big dog, vegetarian household, limited time on weekdays”_).
- Save preferences and initial positive/negative examples.

### 2. Morning Quest Generation

- At ~7:00 AM local time, SideQuest generates **three quests**.
- Generation logic uses:
  - User preferences (prompt + category thumbs).
  - Past likes/dislikes and completions.
  - Diversity rules (no duplicate categories/verbs).
  - Time context (weekday vs weekend).
- If LLM call fails, fallback to curated pool of 60+ pre-seeded quests.

### 3. Quest Selection & Feedback

- User sees 3 quest cards. Options:
  - **Pick** quests to pursue (0–3).
  - **Thumbs up/down** any quest, regardless of selection.
  - **Swap** a card for a new suggestion (1 reroll per card).

### 4. Completion & Reflection

- Later in the day, user marks quests as **Done** or **Skipped**.
- Optionally add a short note (e.g. why skipped, or a reflection).

### 5. Feedback Loop

- Store explicit thumbs and implicit signals (done = good, skipped = mild negative).
- Next day’s generation is biased toward tags/phrases from positive feedback and avoids negatives.
- Maintain diversity and recency rules.

---

## Product Guardrails

- **Tone:** Whimsical, light, indie-styled.
- **Scope:** ≤15 minutes per quest.
- **Constraints:** Respect preferences (e.g. vegetarian, has dog, avoid weather-incompatible tasks if integrated later).
- **Diversity:** Avoid repeating same category/verb within 7 days.
- **Privacy:** Store minimal data. No microphones, no GPS.

---

## Tech Architecture

### App

- **Frontend:** React Native + Expo (TypeScript).
- **Backend:** Flask (Python) — orchestrates quest generation and stores feedback.
- **Database:** Supabase (Postgres).
- **LLM:** OpenAI API (or any preferred LLM endpoint).
- **Notifications:** Expo Notifications for daily reminders and evening nudges.
- **Scheduling:**
  - Client: Expo Task Manager triggers daily fetch.
  - Server (optional): cron pre-generates quests ~5 minutes early.

### API Endpoints

- `POST /generate_daily` → returns 3 quests.
- `GET /today` → idempotent fetch of today’s set.
- `POST /feedback` → thumbs up/down (and optional note).
- `POST /select` → mark quests as “in play.”
- `POST /complete` → mark done/skip + timestamp.

---

## Data Model (Supabase)

**users**

- id, created_at, timezone, optional name

**preferences**

- user_id (FK)
- free_text_prompt
- category_weights JSONB (tag → score)
- quiet_hours JSONB

**quest_templates**

- id, text, tags JSONB, source ENUM['curated','llm'], active BOOL

**daily_sets**

- id, user_id, date, generated_at, items JSONB
- items = [{quest_id?, text, tags, source}]

**feedback**

- id, user_id, quest_text_hash, tags JSONB
- thumb ENUM['up','down'], created_at

**selections**

- id, user_id, daily_set_id, item_idx, selected BOOL, swapped BOOL

**completions**

- id, user_id, daily_set_id, item_idx
- status ENUM['done','skipped'], note TEXT, completed_at

---

## Personalization Logic

- **Tag Scores:** Track like/dislike per tag with decay (0.95/week).
- **Scoring:** +2 thumbs-up, +1 done, −2 thumbs-down, −1 skipped.
- **Diversity:** Softmax sample tags with temperature (τ≈0.8).
- **Recency:** Avoid exact text repeats within 30 days.
- **Context Awareness:** Bias to time/day context (weekday, weekend, morning/evening available time).

---

## Prompt Design

**System Prompt:**

You generate playful, short “side quests” for a user.
Constraints:
• 5–15 minutes
• Whimsical, zero shame
• No medical, financial, or dangerous advice
Output a JSON array of 3 quests with fields {text, tags}.

**User Prompt Template:**

Preferences:
Recent positives: <3 examples>
Recent negatives: <2 examples>
Context: weekday=Tue, WFH=true, has_dog=true, break_times=12-1
Generate 3 distinct quests with varied categories.

**Example Output:**

```json
{
  "text": "Text your hiking buddy to pick a trail for this weekend",
  "tags": ["social", "outdoors", "5-10min"]
}
```

## UI/UX

### Onboarding

- Stack of example quests → thumbs up/down.
- Free-text prompt field ("Tell us your vibe").

### Daily Deck

- 3 quest cards with:
  - Big title (quest text).
  - Buttons: Pick, Swap, 👍, 👎.
  - Footer with today's picks and "Mark Done."

### History

- Scrollable list of past 7 days.
- Completion stats.

### Settings

- Edit preferences.
- Adjust reminder time.
- Enable/disable quest categories.

---

## Success Metrics

- Daily Open Rate (did notification → open happen?)
- Selection Rate (# quests selected per day)
- Completion Rate (# quests completed / selected)
- Quest Quality (thumbs_up − thumbs_down / total).

---

## Edge Cases

- 0 quests selected → still log thumbs, deliver "micro-win" next morning.
- Generation fails → fallback to curated pool.
- Quests always tied to user's timezone date.
- Idempotent fetch (GET /today) ensures same quests all day.

---

## Out of Scope (MVP)

- Social features (leaderboards, sharing).
- ML fine-tuning beyond tag weighting.
- Calendar/weather integrations.
- Heavy gamification (streaks, badges, points).

---

## Build Plan (Weekend MVP)

### Day 1

- Expo skeleton project.
- Supabase schema.
- Flask backend with /generate_daily + curated pool.
- Onboarding UI with thumbs + preferences.

### Day 2

- Daily Deck UI with cards, select/swap/thumb.
- Completion + History screens.
- Notifications at 7:00 AM.
- LLM integration + fallback logic.
- Polish empty/error states.

---
