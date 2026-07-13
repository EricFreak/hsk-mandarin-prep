# Founder beta recruitment (copy-paste)

Post to **r/ChineseLanguage** when local smoke test passes.

---

## Title options (pick one)

- `[Beta] Free Pro access — HSK 3.0 AI prep tool (looking for 10 testers)`
- `Building an HSK 3 prep site aligned to the new 3.0 syllabus — need beta feedback`

---

## Post body

Hi everyone,

I'm building a **free HSK prep website** aligned to the official **HSK 3.0 (GF0025-2021)** syllabus — not another generic Chinese app.

**What works today (beta):**
- SRS flashcards (HSK 1–3 vocabulary)
- AI-generated practice questions (20/day free)
- One full **HSK 3 mock exam** with instant scoring
- Weakness report after the exam

**What I'm looking for:** ~10 people preparing for **HSK 3** (or planning to) who can:
1. Run through one mock exam
2. Tell me if the questions feel close to the real test
3. Say whether the weakness report would actually change how you study

**What you get:** Free **Pro** access for the beta period (unlimited practice + all mock exams + AI writing feedback).

**What I need from you:** Honest feedback — especially if something is wrong or useless. DM me or comment and I'll send the link + enable Pro on your account.

Not selling anything during beta. Just trying to build something useful before adding payments.

Thanks!

---

## After people respond

1. Deploy to Vercel (or share localhost only for first 2–3 testers — not ideal)
2. Collect emails
3. Run in Supabase SQL Editor:

```sql
update profiles
set plan = 'pro', founder_cohort = true
where email in (
  'tester1@gmail.com',
  'tester2@gmail.com'
);
```

4. Reply to each tester with link + "Pro is enabled, please try the mock exam first"

## Follow-up questions to ask testers

1. Did the mock exam feel like real HSK 3 format?
2. Was the weakness report actionable?
3. Would you pay ~$9/month for unlimited practice + mock exams?
4. What's missing that would make you use this daily?
