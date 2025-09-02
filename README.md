# SideQuest 🎯

_A playful, minimalist app for daily micro-adventures._

---

## Overview

**SideQuest** is a mobile app that delivers personalized side quests that the user can take on. These quests are small, fun, achievable challenges that help users add novelty, productivity, and joy to their day — without guilt or pressure.

Users can:

- Receive a fresh set of quests each morning (auto-generated with AI).
- Pick which quests to pursue.
- Mark them complete (or abandoned) later in the day.
- Give feedback to refine future quests.

---

## Product Goals

- **Delight, not guilt:** SideQuest is about fun nudges, not chores.
- **Personalized:** Quests reflect user preferences and past feedback.
- **Varied:** No two mornings feel the same.
- **Fun** The most important thing is that we give quests that actually are fun + positive in the user's life.

---

## Core User Flows

### 1. Onboarding

## Current State

- User is presented with the list of available categories and selects which they are interested in.
- User provides the difficulty, and desired time for quests.
- User opts in to notifications for quests.
- Preferences saved to db, user is moved to main app.

## Desired State

- User selects which categories they are interested in
- We show them ~5-10 prime example quests based on their selections, and the user quickly swipes through them to say which they like or dislike (left or right swipe)
- We use those as a cold start to seed their preferences.
- User optionally adds a **“Preferences Prompt”** in free text (e.g. _“I work from home, have a big dog, vegetarian household, limited time on weekdays”_).
- Save preferences and initial positive/negative examples, move to main app.

### 2. Quest Board Management

- Whenever a user opens their app / refreshes the board, we check if the board needs a refresh. Boards are stale each day at midnight in the user's timezone.
- See below for refresh logic
- Show the user their new board
- User sees 3 quest cards. Options:
  - **Accept** quests to pursue (0–3).
  - **Decline** quests to pursue (0–3).
- Accepted quests are moved to the active quests tab.
- Declined quests are removed from the board.

### 4. Completion & Reflection

- Later in the day, user marks quests as **Completed** or **Abandoned**.
- Optionally add a short note (e.g. why abandoned, or a reflection).

### 5. Feedback Loop

- Implicit signals (accepted, declined, completed, abandoned) are used to update the user's preferences.
- Explicit feedback (thumbs up, thumbs down, comment) is also used to update the user's preferences.
- Next day’s generation is biased toward tags/phrases from positive feedback and avoids negatives.
- Maintain diversity and recency rules.

### 6. History + Stats (not yet implemented)

- A history page shows your quest history
- "Streak" = how many days in a row you've completed quests
- 7 day history. Shows last 7 days and a preview of the quests you've completed.
- "Success Rate" = percentage of accepted quests you've completed
- "Most Completed Category" = the category you've completed the most quests in
- "Top Tags" = the tags you've completed the most quests in

---

## Product Guardrails

- **Tone:** Whimsical, light, indie-styled.
- **Constraints:** Respect preferences (e.g. vegetarian, has dog, avoid weather-incompatible tasks if integrated later).
- **Diversity:** Avoid repeating same category/verb within 7 days.
- **Privacy:** Store minimal data. No microphones, no GPS.

---

## Tech Architecture

### App

- **Frontend:** React Native + Expo (TypeScript).
- **Backend:** Flask (Python) — orchestrates quest generation and stores feedback.
- **Database:** Supabase (Postgres).
- **LLM:** OpenRouter
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

### Core Tables

**`sidequest_users`** - User preferences and settings

- `user_id` (FK to main user table)
- `categories` (JSON array of selected categories)
- `difficulty` (easy/medium/hard)
- `max_time` (minutes, default 15)
- `include_completed/skipped` (boolean flags)
- `notifications_enabled`, `notification_time`, `timezone`
- `onboarding_completed`, `last_quest_generation`

**`sidequest_quests`** - Individual quest instances

- `user_id`, `quest_board_id` (FKs)
- `text`, `category`, `estimated_time`, `difficulty`, `tags` (JSON)
- `status` (potential/accepted/completed/failed/abandoned/declined)
- `completed_at`, `feedback_rating`, `feedback_comment`, `time_spent`
- `generated_at`, `expires_at`, `model_used`, `fallback_used`

**`sidequest_quest_boards`** - Daily quest boards

- `user_id` (FK)
- `last_refreshed`, `is_active`
- Contains 3 quests per day, refreshed at midnight user timezone

**`sidequest_generation_logs`** - Analytics for quest generation

- `user_id`, `request_preferences` (JSON), `context_data` (JSON)
- `quests_generated`, `model_used`, `fallback_used`
- `generation_time_ms`, `tokens_used`

### Enums

- **QuestCategory**: fitness, social, mindfulness, chores, hobbies, outdoors, learning, creativity
- **QuestDifficulty**: easy, medium, hard
- **QuestRating**: thumbs_up, thumbs_down
- **QuestStatus**: potential, accepted, completed, failed, abandoned, declined

# TODO:

1. User's timezone is not properly set in the db
2. Improve the quest generation logic!
3. Add the history + stats page
4. Add notifications to check quest board if you haven't yet
5. Improve the onboarding flow
6. Improve user preference management

Action Plan:

1. Ensure user's timezone is properly set in the db
2. Improve the profile page to allow you to control all the right preferences. Improve preference management in general.
3. Add UX to quickly vote on potential quests and get feedback. Will need a new data table to store votes.
4. Add notifications
5. Adapt onboarding flow based on 2-3
6. Implement the history + stats page
