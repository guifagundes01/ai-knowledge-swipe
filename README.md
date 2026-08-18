# AI Knowledge Swipe

Create a system design interview application. 

# AI/ML Knowledge Tinder — MVP Scope

## 1. Product concept

A Tinder-style knowledge discovery app for AI/ML.

The core idea is a **personalized knowledge discovery feed** where users swipe through AI/ML resources and gradually build a knowledge profile.

The product optimizes for a balance between:

- **Fun discovery**

- **Actual learning**

The MVP should remain simple and validate whether the swipe-based interaction is a compelling way to discover AI/ML knowledge.

---

## 2. Core loop

**Discover → Swipe → Save → Consume → Earn XP → Better recommendations → Discover again**

This is the central product loop.

---

## 3. Content unit

The feed is a **mix of knowledge types**, rather than a single type of content.

For the MVP, support:

- Articles

- Research papers

- GitHub repositories

The system should automatically ingest content from **trusted, whitelisted sources**.

Potential sources include:

- arXiv

- GitHub

- Selected high-quality engineering/research blogs

The initial database should contain both:

- **Evergreen/foundational knowledge**

- **Recent developments**

---

## 4. Swipe interactions

Three actions:

### Left — Skip

The user is not interested.

### Right — Interested

The item is:

- Saved to the user's profile

- Given a lower XP reward

- Available to open/consume optionally

### Up — Must Learn

The item is:

- Saved to a dedicated **Must Learn queue**

- Given a higher XP reward

- Available to open/consume optionally

The distinction is intentional:

> Right = “This looks interesting.”

>

> Up = “I really want to learn this.”

---

## 5. Consumption

For the MVP, the app **directs the user to the original content**.

It does not need to build its own reader/player.

Consumption can initially mean:

- Opening the original resource

- Optionally marking it as consumed/completed

Do **not** require a knowledge test before awarding XP in the MVP.

Future evolution:

**Resource → Quiz → Score → XP**

This can become a later learning-verification layer.

---

## 6. Knowledge profile

Every user has a persistent knowledge profile.

MVP profile signals:

- Selected interests/topics

- Expertise level

- Swipe history

- Saved content

- Must Learn queue

- Activity history

- XP

The profile should be designed so it can later support much more sophisticated personalization.

---

## 7. Onboarding

Keep onboarding lightweight.

Ask:

1. **What AI/ML topics are you interested in?**

2. **What is your expertise level?**

Do not ask for goals or extensive preferences initially.

---

## 8. Recommendation engine

### MVP approach

Use a **simple rules-based recommendation system with controlled exploration**.

Ranking signals can include:

- Topic match

- User expertise level

- Content freshness

- Popularity

- Previous user interactions

Use an exploration/exploitation strategy:

- Mostly show relevant content

- Occasionally introduce less predictable content

This avoids repetitive feeds while remaining simple.

### Future evolution

The architecture should allow the recommendation system to evolve toward:

1. Content similarity / embeddings

2. Collaborative filtering

3. Hybrid recommendation

4. LLM-powered recommendations

No AI/LLM recommendation system is required for the MVP.

---

## 9. Recommendation explanations

Keep cards minimal.

Occasionally show a small explanation such as:

> “Because you like LLMs”

or

> “Matches your interests + intermediate level”

Do not show recommendation explanations on every card.

---

## 10. Card design

Cards should be **minimal**.

Display approximately:

- Title

- Content type

- One-line description

Avoid making the card content-rich or visually overloaded.

The goal is to preserve the fast Tinder-like interaction.

---

## 11. Main screen

The MVP main screen should be:

**Tinder-style feed + visible XP/streak**

The XP/streak should be visible enough to create a sense of progression, but should not dominate the interface.

Do not add complex levels/progress systems initially.

---

## 12. Gamification

Keep gamification lightweight.

Initial mechanics:

- **+1 XP** — Interested/right swipe

- **+3 XP** — Must Learn/up swipe

- **XP** — consuming/opening content

- **Daily streak** — encourage recurring discovery

The exact XP values can be tuned later.

The purpose of gamification is to make discovery fun and encourage continued learning, not to create a complex game.

---

## 13. Navigation

For the MVP:

### Main experience

**Swipe-only**

Do not initially add:

- Search

- Topic browsing

- Complex discovery pages

The product hypothesis should remain focused:

> Can Tinder-style interaction make AI/ML knowledge discovery more engaging?

Users can still access their:

- Saved items

- Must Learn queue

- Basic profile/progress

---

## 14. MVP scope boundaries

### Include

- User account/profile

- Lightweight onboarding

- Topic + expertise selection

- Automatic ingestion from trusted sources

- Articles, papers, GitHub repos

- Evergreen + recent content

- Tinder-style swipe feed

- Skip / Interested / Must Learn

- Saved items

- Must Learn queue

- External content links

- Basic XP

- Streak

- Persistent knowledge profile

- Rules-based recommendations

- Controlled exploration

- Occasional recommendation explanations

### Explicitly exclude from MVP

- LLM-based recommendations

- Embeddings/vector search

- Collaborative filtering

- Knowledge quizzes

- AI-generated summaries/questions

- In-app content reader

- Search

- Topic browsing

- Complex gamification

- Social features

- User-generated content

- Sophisticated learning paths

---

## 15. Future evolution

The architecture should make it possible to progressively add:

### Recommendation intelligence

Rules → embeddings → collaborative filtering → hybrid/LLM recommendations

### Learning verification

Open content → mark complete → quiz → knowledge score

### Personalization

Interests → behavioral profile → knowledge graph → personalized learning paths

### Content intelligence

Metadata → embeddings → automatic categorization → summaries → generated quizzes

### Gamification

XP → levels → achievements → challenges → learning goals

---

## 16. Product hypothesis

The MVP should validate three core hypotheses:

### H1 — Discovery

People enjoy discovering AI/ML knowledge through a Tinder-like interface.

### H2 — Personalization

Swipe behavior provides enough signal to progressively improve recommendations.

### H3 — Engagement

Lightweight gamification increases repeated discovery and consumption.

The MVP should **not** try to prove that it can teach AI/ML effectively yet.

---

## 17. One-sentence MVP definition

> **A Tinder-style app for discovering AI/ML articles, papers, and GitHub repositories, where users swipe to express interest, save what they want to learn, earn lightweight XP, and progressively receive better personalized recommendations.**



Centralize every backend call in one services layer, and create a mock
implementation of it so the whole app runs without a real backend.

Add tests.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2fa256d-8f42-4564-b4bb-0691ff0cf128).

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
