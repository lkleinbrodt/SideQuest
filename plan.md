By far the most important thing about this app is that **the quests are actually good**. Without that it's useless.

Right now, we generate all quests on the fly (by asking LLM). This isn't really necessary. We can also have a database of already generated quests that we know are of high quality. We can use this to 1) supply quests 2) train our models to generate better quests.

I'm going to kickstart this myself by adding a bit to the app that will specifically be used for our testing users to quickly rate possible quests.

So:

Add a new screen to the app "Vote" where the user will be presented with possible quests and it asks for their feedback, a simple left swipe votes no and a right swipe votes yes.

In the backend:

- We've already created a QuestTemplate model, this is what we will be using to store possible quests.
- We also need some way to store votes on quest templates
- so some "vote" type model that says:
- here was the user, here was the quest template they saw, and here was the vote (up/down).
- a method of serving quest templates to the frontend. this is different than serving quests/quest boards, it's totally different
- we will want an endpoint "quests to vote on" or something like that which will:
  - grab n quest templates (that hte user has not already voted on - if none exists, then create new ones)
    - note that when creating these new templates, they should NOT be tied directly to the user (no owner id)
- A "vote" template that will be used to vote on quest templates (stores the user, the quest template, and the vote, etc)

In the frontend:

- A voter page that will be used to vote on quest templates
- Preloads n templates, allows the user to swipe on them one by one, sending vote to backend
- keeps serving up quests, never running out (bc backend should generate more on the fly as needed)
