# Australian Citizenship Test — Product & Tech Spec

**Status:** Shipped on `quinstowndotcom` `main` (Vercel deploys from `timnqp/quinstowndotcom`). Parent repo `appthien` tracks the submodule pointer.  
**Audience:** Vietnamese speakers preparing for the official Australian citizenship test  
**Official test language:** English only  
**Our teaching language:** English or Vietnamese, based on the site locale (default **Vietnamese**)  
**Primary sources:**

- [Learn about the citizenship test](https://immi.homeaffairs.gov.au/citizenship/test-and-interview/learn-about-citizenship-interview-and-test/learn-about-citizenship-test) (Department of Home Affairs)
- *Australian Citizenship: Our Common Bond* (Commonwealth of Australia 2020, CC BY 4.0)
- Official ebook / practice resources linked from Home Affairs only
- Official practice test UX to clone (interaction, not branding): [citizenshippracticetest.homeaffairs.gov.au](https://citizenshippracticetest.homeaffairs.gov.au)

This spec is the locked product record. Another agent should follow it rather than re-deriving test rules or copy decisions.

**Production (standalone site):** [thiquoctichuc.com](https://thiquoctichuc.com) — repo/npm package `thiquoctichuc.com`. Public routes: `/`, `/study`, `/study/[id]`, `/practice`, `/practice/run`, `/practice/result`. On quinstowndotcom the same product still lives under `/aucitizenshiptest/*` until 308 redirects to thiquoctichuc.com.

---

## 0. Information architecture (locked, as shipped)

```
Navbar:
  Home | Mindfulness | AU Citizenship ▾ | About | App | Login
                         │
                         ├─ Overview / Tổng quan     → /aucitizenshiptest
                         ├─ Citizenship lessons      → /aucitizenshiptest/study
                         └─ Practice test            → /aucitizenshiptest/practice
```

| Nav item | EN | VI | Route |
|---|---|---|---|
| `nav_home` | Home | Trang chủ | `/` |
| `nav_wellness` | Mindfulness | Mindfulness | `/mindfulness` |
| `nav_resources` | thiquoctichuc.com | Thi Quốc Tịch Úc | dropdown (not a page; quinstowndotcom) |
| `nav_resources_overview` | Overview | Tổng quan | `/aucitizenshiptest` |
| `nav_resources_lessons` | Citizenship lessons | Bài học Quốc tịch | `/aucitizenshiptest/study` |
| `nav_resources_practice` | Practice test | Đề thi thử | `/aucitizenshiptest/practice` |
| `nav_about` | About | Giới thiệu | `/about` |
| `nav_app` | App | Ứng Dụng | `/app` |

**Do not** add a sixth top-level marketing item. Courses + Community collapsed into Mindfulness so AU Citizenship could take the freed slot.

**No backup redirects** for old marketing URLs. `/wellness` and `/resources` (landing) were removed, not redirected. In-app links must use the new paths only.

Still redirected (older catalogue / newsletter URLs):

- `/courses` → `/mindfulness/`
- `/community` → `/mindfulness/?section=newsletter`

Meditation `/courses/[slug]` and `/courses/[slug]/learn` **stay**. Admin course CMS unchanged. `NavBar` `active="wellness"` on `/mindfulness` and `/courses/[slug]*`.

---

## 1. Mindfulness tab (`/mindfulness`)

Public page (Mongo for courses + blogs + newsletter). Order on the page:

1. **Khoá học miễn phí** / **Free courses** (`wellness_title`) + `CourseList`
2. **Bài viết** / **Blog** (`blog_section_title`, `id="blog"`) + `BlogList`
3. Invitation, CoachingOffer, MeditationOffer
4. Newsletter (`id="newsletter"`)

Home “read more articles” links to `/mindfulness/#blog`.

---

## 2. Citizenship — public, no Mongo, no sign-in

Citizenship content is files in git. **No** `scripts/mongodb`, **no** `getServerSession`, **no** `/api/course/progress` on any citizenship page.

```
/                                    landing: two cards (Lessons | Practice)
/study                               lesson overview (course-style outline)
/study/[id]                          one Bài — course learn chrome
/practice                            practice welcome + Start with Test 1
/practice/run                        in-test UI (one question at a time)
/practice/result                     pass/fail breakdown + auto review
```

Guests complete everything. Progress = `localStorage` only.

**Do not impersonate the Department.** Peach/orange Quins Town chrome. No Coat of Arms, no `.gov.au` look-alike header, no government branding. No grey “official booklet” box (`OfficialOcbLinks` was removed).

### 2a. Lessons — reuse the course *learn* framework

Reuse the **UI** of the existing course player, not the Mongo documents:

| Reuse as-is or with a thin adapter | Do not reuse |
|---|---|
| `CourseSidebar` (icons, current item, checkmarks) | `src/pages/courses/[slug]/learn.tsx` (login redirect) |
| `InfoView` (markdown + Mark complete / Next) | `useCourseProgress` POST to Mongo |
| Course outline accordion | Admin course editor |
| Chapter/item shape in `src/course/types.ts` | `QuizView` (lessons have no quizzes) |

Static `Course` in `src/citizenship/studyCourse.ts`: **6 Bài**. Bài 1 and Bài 6 are one `info` item each. Bài 2–5 split into bite-size `info` items. `content_md` from `lessons/{en|vi}/`.

Do **not** import `loadStudyCourses` at page top-level (`fs` is server-only). Dynamic-import it inside `getStaticProps`.

No video items. No quizzes in this subtab. Chapter titles: **Lesson / Bài**, never Day / Ngày.

**Reading format (every lesson file):**

- No paragraph longer than ~3 lines
- Prefer tables, labelled lists, and one-line facts
- Each H3 is one idea
- Optional ⚠️ trap line in orange, max one sentence
- Do **not** paste *Our Common Bond*. Teach the testable facts only
- User-facing copy: no em dashes (`—`)

**Vietnamese “Cụm từ tiếng Anh cần nắm”** is a two-column table: **English | Tiếng Việt**. All VI lessons except Bài 6 (no terms box). English lesson files keep a simple English-terms list.

**Bài 1:** do not tell people “Hãy học sách miễn phí Our Common Bond” or “Đừng mua gói đảm bảo đậu”. Keep the OCB-derived line. Keep the 5/5 + 15/20 pass rule.

### 2b. Vietnamese glossary (locked)

The real test is English. Vietnamese copy **teaches the English wording**, then uses these Vietnamese glosses consistently in lessons **and** `explain_vi`.

| English (exam wording) | Vietnamese (locked) | Notes |
|---|---|---|
| Aboriginal | **thổ dân bản địa** | Not “khảo cổ”. Archaeology is a source, not a translation of Aboriginal |
| Indigenous peoples | **thổ dân bản địa** | Locked gloss for Indigenous people(s) |
| Torres Strait Islander | dân đảo Torres Strait | |
| First Fleet / early British arrivals (Union Jack) | **những người Anh đầu tiên** | Not “định cư Anh” |
| gold rush | **Thời kỳ cơn sốt Vàng** | English stems stay “gold rush” |
| responsibility (citizenship) | **nghĩa vụ** | Not trách nhiệm |
| privilege (citizenship) | **quyền lợi** | Not đặc quyền |
| Governor (NSW / Phillip) | **Thống đốc** | Captain Arthur Phillip was first Governor of NSW, not Governor-General |
| Governor-General | **Toàn quyền** / **Tổng Toàn quyền** | Different office from Governor |
| Australians reject violence | **Người Úc nói không với bạo lực** | Not “bác bỏ bạo lực” |
| equal opportunity in employment | **Nam nữ bình đẳng khi tuyển dụng** | Lesson 5b jobs line |

Do **not** blindly replace every “trách nhiệm”. Federal vs local **government** “responsibility” (portfolio / cấp chính quyền) is a different sense — leave as thẩm quyền / thuộc chính phủ.

`explain_vi` is a one-line explanation, **not** a translation of the English stem. Keep `content/citizenship/quiz-bank.json` and `plan/citizenship-quiz-bank.json` **identical**.

Lesson 3c title: **Nghĩa vụ và quyền lợi**. Headings: **Nghĩa vụ (responsibility)** / **Quyền lợi (privilege)**. `studyCourse.ts` `titleVi` for `3c`: `'Nghĩa vụ và quyền lợi'`.

Lesson 2a headings: **Những người Anh đầu tiên**; **Thời kỳ cơn sốt Vàng**.

Bài 6, section 1 list title: **Những thông số cần nắm** (EN list title stays “Dates, capitals, flags, symbols”).

### 2c. Practice subtab — clone official chrome (interaction, not branding)

Source: [citizenshippracticetest.homeaffairs.gov.au](https://citizenshippracticetest.homeaffairs.gov.au)  
**Interaction and structure: copy. Branding: do not copy.**

**Screen A — Welcome:** sample only, OCB, English only, 45 min, 20 questions, any order, skip/review later, 5/5 values + 15/20, **Start** (`cit_practice_start`: EN Start / VI **Bắt đầu**). Below the fold: pick paper 1–14 (7 basic then 7 advanced). H1: **Thi thử quốc tịch Úc** / **Australian Citizenship Practice Test**. Cross-link text to study on the same line as Start (**Quay lại bài học**).

**Screen B — In test**

```
┌─────────────────────────────────────────────────────────────┐
│  Quins Town  ·  Unofficial practice                         │
│  Australian Citizenship practice                             │
├──────────────┬──────────────────────────────────────────────┤
│ Question 1   │  Part 1 - Australia and its people           │
│ ● (solid)    │                                              │
│ Question 2   │  stem                                        │
│ ○ dashed     │  ○ option A / B / C                          │
│ ...          │         [ Previous ]   [ Next ]     [Submit] │
│ ☐ Review     │                                              │
│   later      │                                              │
├──────────────┴──────────────────────────────────────────────┤
│  n of 20 questions answered     Time remaining: HH:MM:SS    │
└─────────────────────────────────────────────────────────────┘
```

| Official control | We do |
|---|---|
| Left list Question 1…20 | Same. Click jumps |
| Dashed = unanswered; solid = answered or current | Same |
| Current-question bar | Orange, to match nav |
| Review later checkbox | Same |
| Grey Part N header | From `question.part` |
| 3 radio options | Bank is 3 options |
| Previous / Next | Orange background, **white text** |
| Submit | White / quiet (not the loud charcoal clone) |
| Footer answered count + 45:00 timer | Same |
| Listen / Contrast | Skip Listen. Optional A+ |

**Submit modal:** Warning / Are you ready… / Yes / No. Unanswered count as wrong. Auto-submit at 00:00:00 with no modal.

**Screen C — Result:** PASS/FAIL banner, values n/5, overall n/20, four part bars, pass-rule box, What's next (Try another / Review lessons / Official practice). Expandable per-question review with `explain_en` / `explain_vi`. **Do not** show “Raise your hand to let a Test Facilitator know…”.

---

## 3. Landing, chrome, and copy (locked)

Citizenship pages use the main **NavBar + Footer**. **No Hero banner.**

### Landing cards (`/`)

| Key | EN | VI |
|---|---|---|
| `resources_title` (H1) | Australian Citizenship Test | Thi Quốc Tịch Úc |
| `resources_lessons_card` | Click here to view the study summary | Bấm vào đây để xem tài liệu tóm tắt |
| `resources_practice_card` | Click here to take a practice test | Bấm vào đây để thi thử |

Card titles: `text-xl lg:text-2xl font-light text-orange-600` (not `font-fancy`). Practice card also says explanations exist after submit (`cit_practice_has_explanations`).

VI lessons desc (`cit_lessons_desc`) uses Quinn’s cheatsheet sentence (keep the “cheatsheat” spelling as written).

### Browser tab titles (no `· Quins Town · Careers · Life · Wellness` suffix)

| Page | VI | EN |
|---|---|---|
| Landing | Tóm tắt & Thi Thử Quốc Tịch Úc | Australian Citizenship: Summary & Practice Test |
| Lessons overview | Tóm tắt học thi Quốc Tịch Úc | Australian Citizenship Study Summary |
| Practice welcome / run | Thi thử quốc tịch Úc | Australian Citizenship Practice Test |

Keys: `cit_landing_tab`, `cit_lessons_tab`, `cit_practice_title`.

### Disclaimer (`DerivedFromOcb`)

Lighter grey italic. One sentence + official EN/VI PDF links on a new line. **Not** a government-branded box.

VI: `Câu hỏi được soạn từ sách chính thức Australian Citizenship: Our Common Bond. Trang này không liên kết với Department of Home Affairs.`

PDFs: `OCB_PDF_EN` / `OCB_PDF_VI` in `DerivedFromOcb.tsx`.

### Buy Me a Coffee

`https://buymeacoffee.com/quinnta`. Label: **Mời Quỳnh ly cà phê** / **Buy me a coffee**.

On landing + two sub-landings (lessons overview, practice welcome): **bottom** of the page, after the disclaimer, centered. Lesson player already has it at the bottom.

GA4 is `G-WX5L8M3HYE` in `_document.tsx` (prod only; admins opted out). BMC dashboard field should also use that ID so BMC page views join the same property. Ad blockers can block gtag even though the site has no ads.

Citizenship events (`src/citizenship/analytics.ts`): `cit_landing_click` (lessons / practice / coffee), `cit_lesson_view`, `cit_lesson_complete`, `cit_study_complete`, `cit_practice_start`, `cit_practice_submit`, `cit_practice_result`.

### About intro

VI: `Xin chào bạn! Mình là Quỳnh, hiện đang là chuyên viên phân tích dữ liệu (data analyst) tại Coles Group, Sydney, Australia. Trước khi làm Data Analyst, chuyên môn của mình là ở lĩnh vực Marketing, với kinh nghiệm làm việc tại các tập đoàn Electrolux, Samsung và Topica Edtech Group.`

EN: `Hello! I'm Quinn, currently a data analyst at Coles Group in Sydney, Australia. Before becoming a data analyst, my background was in Marketing, with experience at Electrolux, Samsung, and Topica Edtech Group.`

### i18n / locale

- Same keys in `src/locales/en.ts` and `src/locales/vi.ts`
- Default locale Vietnamese (`LanguageContext` initial `'vi'`, `AppConfig.locale = vi_VN`)
- Toggle is client-side (`localStorage`). **No `/en` vs `/vi` URLs, no `hreflang`.** Search engines index **Vietnamese** only. English is for visitors who switch the flag.
- `trailingSlash: true`

---

## 4. Official test format (source of truth)

From Home Affairs (current page, not the 2020 booklet alone):

| Rule | Value |
|---|---|
| Medium | Computer, multiple choice, **English only** |
| Questions | **20** randomly selected |
| Values questions | **5 of the 20** are Australian values questions |
| Pass — values | **5 / 5 (100%)** on values — missing one values question fails the test even at 19/20 |
| Pass — overall | **At least 15 / 20 (75%)** |
| Time | **45 minutes** |
| Who sits it | Most applicants for citizenship by conferral, typically aged 18–59 |
| Cost | Included in the citizenship application fee |
| After a pass | Ceremony usually within **6 months** of approval |

**Book vs current website:** treat the **5 values as inside the 20**. Do **not** build a 25-question paper.

**What is testable:** Parts 1–4 of *Our Common Bond* only. Parts 5–6 (Australia today / Australia’s story) are **not** testable.

**Unofficial product rules:**

- Attribute: *© Commonwealth of Australia 2020. Material used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
- Do **not** use the Commonwealth Coat of Arms.
- Link to the official PDFs (see `DerivedFromOcb`).
- Write **original** questions answerable from Parts 1–4. Do not copy official practice-test wording.

---

## 5. Course titles (study)

| Field | EN | VI |
|---|---|---|
| `slug` | `hoc-thi-quoc-tich-uc` | same |
| Title | Study the Australian Citizenship Test | Học thi Quốc tịch Úc |

| # | EN | VI | Sidebar |
|---|---|---|---|
| 1 | Lesson 1 - The citizenship test format | Bài 1 - Cấu trúc bài thi quốc tịch | 1 card |
| 2 | Lesson 2 - Australia and its people | Bài 2 - Nước Úc và người Úc | 4 items (2a titleVi: Cư dân đầu tiên và những người Anh đầu tiên) |
| 3 | Lesson 3 - Democratic beliefs, rights and liberties | Bài 3 - Niềm tin dân chủ, quyền lợi và quyền tự do | 3 items (3c: Nghĩa vụ và quyền lợi) |
| 4 | Lesson 4 - Government and the law in Australia | Bài 4 - Chính phủ và pháp luật ở Úc | 4 items |
| 5 | Lesson 5 - Australian values | Bài 5 - Các giá trị của Úc | 3 items |
| 6 | Lesson 6 - Dates and facts cheatsheet | Bài 6 - Cheatsheet ngày tháng và sự kiện | 1 page; item titleVi **Những thông số cần nắm** |

Practice: 14 papers, tests 1–7 basic, 8–14 advanced. Landing copy may be Vietnamese. **Every question and option stays English.**

---

## 6. Lessons — bite-size outline

Locale: each card has `en.md` and `vi.md`. Teach facts; do not paste the book. Vietnamese follows §2b.

### Bài 1 — Format (1 card)

Computer, English, **20** questions, **45 minutes**. **5** of 20 are *Australian values*. Pass = **5/5 values** AND **15/20**. ⚠️ 16/20 with 4/5 values = **FAIL**. After pass: ceremony usually within **6 months**.

### Bài 2 — Part 1 (4 cards)

**2a First peoples & những người Anh đầu tiên** — oldest continuous cultures; Aboriginal = Thổ dân (mainland + Tasmania); Torres Strait = islands between Queensland and PNG; First Fleet **11 ships**, **26 January 1788**, first NSW **Governor (Thống đốc) Captain Arthur Phillip**; **Thời kỳ cơn sốt Vàng 1851**, Chinese first large non-European group.

**2b Nation & language** — Federation **1 January 1901**; 1901 population ~4 million **excluded** Indigenous peoples until **1967** referendum (>90% Yes); English = national language.

**2c States** — table only: NSW Sydney, Vic Melbourne, Qld Brisbane, WA Perth, SA Adelaide, Tas Hobart, ACT Canberra, NT Darwin. Canberra = national capital.

**2d Days, flags, symbols** — Australia Day 26 Jan; Anzac Day 25 April (Gallipoli 1915). Welcome to Country = custodian; Acknowledgement = anyone. Flag: Union Jack = **những người Anh đầu tiên** + inherited laws, 7-point Commonwealth Star, Southern Cross. National colours **green and gold** (not flag colours). Flower: golden wattle. Anthem: *Advance Australia Fair*.

### Bài 3 — Part 2 (3 cards)

**3a Beliefs** — parliamentary democracy; Rule of Law; peaceful change; **Người Úc nói không với bạo lực**.

**3b Freedoms** — speech, association, religion while obeying Australian law. Government is **secular**.

**3c Nghĩa vụ / quyền lợi** — Nghĩa vụ: obey, vote (18+ federal/state/territory + referendum), defend if needed, jury if called. Quyền lợi: passport, APS/ADF jobs, children by descent, consular help, stand for parliament (**not** if dual citizen). ⚠️ Local voting may **not** be compulsory.

### Bài 4 — Part 3 (4 cards)

**4a** Head of State = **King Charles III**. Leader of government = **Prime Minister**. Governor-General = King’s representative, **not** in the government, signs Bills (**Royal Assent**).

**4b** House of Representatives = People’s House, by population. Senate = 12 per state, 2 each ACT/NT.

**4c** Federal: tax, immigration, citizenship, defence. State: hospitals, schools, police. Local: rubbish, parks, local roads.

**4d** Innocent until guilty; jury = guilty/not guilty; judge = penalty. Police do not decide guilt.

### Bài 5 — Part 4 values (3 cards)

**5a** Values questions fail you alone. Rule of Law, democracy, peaceful protest, no violence, no racism.

**5b** Religious laws have **no legal status**; polygamy and forced marriage are crimes; same-sex marriage legal; **Nam nữ bình đẳng khi tuyển dụng**; age of consent **16 or 17** (15 illegal everywhere).

**5c** fair go; mateship; learn English; report serious crime / child abuse; dual citizenship OK but Australian law still applies.

### Bài 6 — Cheatsheet (tables)

VI item title: **Những thông số cần nắm**. Dates / thủ phủ / cờ / biểu tượng / lãnh đạo / điều kiện đậu. VI date for gold rush: **Thời kỳ cơn sốt Vàng**. Aboriginal row: **Thổ dân**. Union Jack: **những người Anh đầu tiên**. Coat of Arms: describe kangaroo and emu only — do not draw the Arms.

---

## 7. Ten practice tests

- 20 questions, **3** options (a–c), one correct
- Exactly **5** `topic: 'values'` (Part 4)
- Remaining **15** from Parts 1–3 tagged `topic: 'general'`
- 45-minute countdown; auto-submit on expiry (unanswered = wrong)
- English question text only
- Pass iff **valuesCorrect === 5 AND overallCorrect >= 15**

Basic (1–5): direct recall. Advanced (6–10): Head of State vs PM vs GG; 7-point star; 1788 / 1851 / 1901 / 1967; Senate vs House; dual citizenship vs standing; values miss + high overall still fails; jury vs judge vs police; colours vs flag; local voting; age of consent.

Files (keep in sync):

- `content/citizenship/quiz-bank.json` (runtime)
- `plan/citizenship-quiz-bank.json` (plan copy)

```ts
type BankQuestion = {
  id: string;
  topic: 'values' | 'general';
  part: 1 | 2 | 3 | 4;
  difficulty: 'basic' | 'advanced';
  question: string; // English
  options: { id: 'a' | 'b' | 'c'; text: string }[];
  correct: 'a' | 'b' | 'c';
  explain_en: string;
  explain_vi: string; // glossary-aligned; not a translation of the stem
};
```

---

## 8. Quiz logic

Do **not** patch `QuizView.tsx` (meditation). Scorer lives in `src/citizenship/`.

```ts
export function evaluateCitizenshipTest(
  questions: QuizQuestion[],
  answers: Record<string, string>
): QuizResult {
  const values = questions.filter((q) => q.topic === 'values');
  const valuesCorrect = values.filter((q) => answers[q.id] === q.correct).length;
  const overallCorrect = questions.filter((q) => answers[q.id] === q.correct).length;
  const total = questions.length;
  const valuesPassed = values.length > 0 && valuesCorrect === values.length;
  const overallPassed = overallCorrect >= Math.ceil(total * 0.75); // 15 of 20
  const passed = valuesPassed && overallPassed;
  return {
    score: total > 0 ? Math.round((overallCorrect / total) * 100) : 0,
    passed,
    correctCount: overallCorrect,
    totalCount: total,
    valuesCorrect,
    valuesTotal: values.length,
  };
}
```

All 10 practice papers are reachable from the welcome list. Do not hard-lock lessons.

---

## 9. Architecture

The rest of the site still uses Mongo for blog, wellness courses, and login. Citizenship routes never call it.

```
content/citizenship/
  lessons/en/*.md
  lessons/vi/*.md
  quiz-bank.json
src/citizenship/
  analytics.ts
  evaluateCitizenshipTest.ts
  studyCourse.ts
  loadStudyCourses.ts          ← server-only; dynamic import in GSP
  useLocalProgress.ts
  PracticeWelcome.tsx
  PracticeRunner.tsx
  PracticeResult.tsx
  DerivedFromOcb.tsx
  BuyMeACoffee.tsx
  quizBank.ts
  types.ts
src/pages/index.tsx
src/pages/study/index.tsx
src/pages/study/[id].tsx
src/pages/practice/index.tsx
src/pages/practice/run.tsx
src/pages/practice/result.tsx
src/pages/mindfulness.tsx                    ← quinstowndotcom only
```

### Progress (`localStorage`)

```ts
// citizenship:study
{ completedLessonIds: string[], lastLessonId: string }

// citizenship:practice
{
  results: {
    "test-1": { passed, score, correctCount, valuesCorrect, timedOut, at: number }
  },
  lastTestId: string
}
```

---

## 10. Routes

| Route | Auth | Data | Purpose |
|---|---|---|---|
| `/mindfulness` | public | Mongo courses + blogs | Free courses, blog, coaching, newsletter |
| `/courses` | redirect | — | → `/mindfulness/` |
| `/community` | redirect | — | → `/mindfulness/?section=newsletter` |
| `/courses/[slug]` | public overview | Mongo | Meditation overview |
| `/courses/[slug]/learn` | **login** | Mongo | Wellness courses only |
| `/` | public, static | — | Two cards (thiquoctichuc.com) |
| `/study` | public, static | markdown | Lesson outline |
| `/study/[id]` | public, static | markdown | Course-style learn player |
| `/practice` | public, static | — | Practice welcome |
| `/practice/run` | public, static | quiz JSON | One-question runner |
| `/practice/result` | public, static | session state | Pass/fail |

`getStaticPaths` lesson ids: `1`, `2a`–`2d`, `3a`–`3c`, `4a`–`4d`, `5a`–`5c`, `6`.

**Do not** restore `/wellness` or `/resources` landings as redirects.

---

## 11. Out of scope (v1, still true)

- Mongo / NextAuth / progress API for citizenship
- Pixel-perfect clone of Home Affairs visual design
- Admin CMS for citizenship markdown
- Cross-device progress
- Interview practice
- Translating practice **questions** into Vietnamese (stems stay English)
- Parts 5–6 of the Vietnamese book as testable content
- Separate English URLs / `hreflang` for SEO

**v2:** optional login to sync localStorage; optional `/en` routes if both languages should be indexed.

---

## 12. Acceptance (shipped)

- Nav is `Home | Mindfulness | AU Citizenship ▾ | About | App` (plus Login when logged out)
- Mindfulness shows free courses, then blog, then coaching/meditation/newsletter
- Citizenship dropdown: overview + lessons + practice; all work with cookies cleared
- No citizenship page imports Mongo or `getServerSession`
- Lessons: 6 Bài, bite-size cards, EN/VI toggle; Vietnamese glossary locked in §2b; Bài 6 cheatsheet
- Practice: 3 radios, 45:00, dual pass 5/5 values AND 15/20; explanations after submit
- 16/20 with 4/5 values = **fail**; 15/20 with 5/5 values = **pass**
- Disclaimer + OCB PDFs; no Coat of Arms; BMC at the bottom of landings
- Meditation `/courses/[slug]/learn` still requires login and still uses standard quiz scoring
