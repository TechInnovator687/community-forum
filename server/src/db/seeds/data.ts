import type { NewCourse, NewEnrollment, NewPost, NewSavedPost, NewUser } from "@server/db/schema";

// Fixed reference point so reseeding is deterministic and reproducible.
const SEED_NOW = new Date("2026-07-02T08:00:00.000Z");

export const USER_IDS = {
  moderator: "10000000-0000-4000-8000-000000000001",
  alice: "10000000-0000-4000-8000-000000000002",
  bob: "10000000-0000-4000-8000-000000000003"
} as const;

export const COURSE_IDS = {
  biology: "20000000-0000-4000-8000-000000000001",
  chemistry: "20000000-0000-4000-8000-000000000002"
} as const;

export const seedUsers = [
  { id: USER_IDS.moderator, name: "Morgan Lee", email: "moderator@example.com", role: "moderator" },
  { id: USER_IDS.alice, name: "Alice Johnson", email: "alice.johnson@example.com", role: "student" },
  { id: USER_IDS.bob, name: "Bob Chen", email: "bob.chen@example.com", role: "student" }
] satisfies NewUser[];

export const seedCourses = [
  {
    id: COURSE_IDS.biology,
    slug: "biology",
    title: "Biology",
    description: "Cell biology, genetics, and evolution for the introductory life sciences track."
  },
  {
    id: COURSE_IDS.chemistry,
    slug: "chemistry",
    title: "Chemistry",
    description: "Reactions, stoichiometry, and lab technique for the introductory chemistry track."
  }
] satisfies NewCourse[];

export const seedEnrollments = [
  { userId: USER_IDS.alice, courseId: COURSE_IDS.biology },
  { userId: USER_IDS.bob, courseId: COURSE_IDS.biology },
  { userId: USER_IDS.bob, courseId: COURSE_IDS.chemistry }
] satisfies NewEnrollment[];

function daysAgo(days: number, hour = 9): Date {
  const date = new Date(SEED_NOW);

  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);

  return date;
}

function post(id: string, courseId: string, authorId: string, createdDaysAgo: number, title: string, content: string): NewPost {
  const createdAt = daysAgo(createdDaysAgo);

  return { id, courseId, authorId, title, content, createdAt, updatedAt: createdAt };
}

function biologyPostId(suffix: string) {
  return `30000001-0000-4000-8000-0000000000${suffix}`;
}

function chemistryPostId(suffix: string) {
  return `30000002-0000-4000-8000-0000000000${suffix}`;
}

export const POST_IDS = {
  biologyWelcome: biologyPostId("01"),
  biologyOsmosis: biologyPostId("02"),
  biologyMitochondria: biologyPostId("03"),
  biologyKrebsCycle: biologyPostId("04"),
  biologyApoptosis: biologyPostId("05"),
  biologyAlleles: biologyPostId("06"),
  biologyDnaReplication: biologyPostId("07"),
  biologyEndosymbiotic: biologyPostId("08"),
  biologyEnzymeInhibition: biologyPostId("09"),
  biologyNaturalSelection: biologyPostId("0a"),
  biologyPhotosynthesis: biologyPostId("0b"),
  biologyLabSafety: biologyPostId("0c"),
  chemistryWelcome: chemistryPostId("01"),
  chemistryRedox: chemistryPostId("02"),
  chemistryEntropy: chemistryPostId("03"),
  chemistryMolarity: chemistryPostId("04"),
  chemistryLimitingReagent: chemistryPostId("05"),
  chemistryVsepr: chemistryPostId("06"),
  chemistryTitration: chemistryPostId("07"),
  chemistryPeriodicTrends: chemistryPostId("08")
} as const;

const { moderator, alice, bob } = USER_IDS;
const { biology, chemistry } = COURSE_IDS;

export const seedPosts = [
  post(
    POST_IDS.biologyWelcome,
    biology,
    moderator,
    28,
    "Welcome to Biology",
    "Use this space to ask questions about cells, genetics, evolution, and everything in between. Introduce yourself and let us know what you're hoping to learn this term.",
  ),
  post(
    POST_IDS.biologyOsmosis,
    biology,
    alice,
    25,
    "How does osmosis differ from diffusion?",
    "I keep mixing these up on practice quizzes. Is osmosis just diffusion of water specifically, or is there more to it?",
  ),
  post(
    POST_IDS.biologyMitochondria,
    biology,
    bob,
    23,
    "Mitochondria: the 'powerhouse of the cell' - how accurate is that meme?",
    "Our textbook barely mentions anything beyond ATP production. What else do mitochondria actually do?",
  ),
  post(
    POST_IDS.biologyKrebsCycle,
    biology,
    alice,
    20,
    "Best resources for learning the Krebs cycle",
    "The diagram in our textbook is hard to follow. Does anyone have a video or diagram that finally made it click?",
  ),
  post(
    POST_IDS.biologyApoptosis,
    biology,
    bob,
    18,
    "Why do some cells undergo apoptosis?",
    "Trying to understand what triggers programmed cell death versus necrosis. Are they always distinguishable?",
  ),
  post(
    POST_IDS.biologyAlleles,
    biology,
    alice,
    16,
    "Confused about dominant vs recessive alleles",
    "If a trait is recessive, does that mean it's automatically rarer in a population? I don't think that's right but I can't explain why.",
  ),
  post(
    POST_IDS.biologyDnaReplication,
    biology,
    bob,
    13,
    "DNA replication: leading vs lagging strand explained",
    "Can someone walk through why the lagging strand needs Okazaki fragments, in plain terms?",
  ),
  post(
    POST_IDS.biologyEndosymbiotic,
    biology,
    alice,
    11,
    "How accurate is the endosymbiotic theory today?",
    "Is this still the leading explanation for mitochondria and chloroplasts, or has newer evidence changed the picture?",
  ),
  post(
    POST_IDS.biologyEnzymeInhibition,
    biology,
    bob,
    9,
    "Enzyme inhibition types: competitive vs noncompetitive",
    "I understand the graphs but not the intuition. What's actually happening at the molecular level for each type?",
  ),
  post(
    POST_IDS.biologyNaturalSelection,
    biology,
    alice,
    6,
    "Understanding natural selection with real-world examples",
    "Textbook examples like peppered moths feel dated. Are there more recent, well-documented cases we could discuss?",
  ),
  post(
    POST_IDS.biologyPhotosynthesis,
    biology,
    bob,
    3,
    "Photosynthesis light-dependent reactions, explained simply",
    "Where exactly do the light-dependent reactions happen, and how do they connect to the Calvin cycle?",
  ),
  post(
    POST_IDS.biologyLabSafety,
    biology,
    moderator,
    1,
    "Lab safety tips for handling live cultures",
    "A reminder before Thursday's lab: gloves at all times, and flag any contamination immediately rather than trying to fix it yourself.",
  ),
  post(
    POST_IDS.chemistryWelcome,
    chemistry,
    moderator,
    24,
    "Welcome to Chemistry",
    "This is the space for questions about reactions, stoichiometry, and lab prep. Please read the syllabus before posting lab-related questions.",
  ),
  post(
    POST_IDS.chemistryRedox,
    chemistry,
    bob,
    21,
    "Balancing redox reactions - any tips?",
    "The half-reaction method makes sense until the electrons don't cancel cleanly. Any tricks for messier equations?",
  ),
  post(
    POST_IDS.chemistryEntropy,
    chemistry,
    bob,
    17,
    "Why does entropy always increase in an isolated system?",
    "Is this a hard rule or just overwhelmingly probable? Trying to understand the statistical argument.",
  ),
  post(
    POST_IDS.chemistryMolarity,
    chemistry,
    bob,
    14,
    "Difference between molarity and molality",
    "I get the formulas but not when you'd actually choose one over the other in practice.",
  ),
  post(
    POST_IDS.chemistryLimitingReagent,
    chemistry,
    bob,
    10,
    "How to identify limiting reagents quickly",
    "Is there a shortcut besides computing moles for every reactant every single time?",
  ),
  post(
    POST_IDS.chemistryVsepr,
    chemistry,
    bob,
    7,
    "VSEPR theory: predicting molecular geometry",
    "Struggling with lone pair repulsion specifically. Any tips for predicting geometry faster during exams?",
  ),
  post(
    POST_IDS.chemistryTitration,
    chemistry,
    bob,
    4,
    "Acid-base titration curve interpretation help",
    "What should I actually be looking for at the equivalence point versus the half-equivalence point?",
  ),
  post(
    POST_IDS.chemistryPeriodicTrends,
    chemistry,
    moderator,
    2,
    "Periodic trends: electronegativity vs ionization energy",
    "A common mix-up on exams. Post your own explanation of the difference and I'll confirm or correct it.",
  )
] satisfies NewPost[];

function saved(id: string, userId: string, postId: string, savedDaysAgo: number, hour = 9): NewSavedPost {
  return { id, userId, postId, savedAt: daysAgo(savedDaysAgo, hour), deletedAt: null };
}

function savedPostId(suffix: string) {
  return `40000000-0000-4000-8000-0000000000${suffix}`;
}

// Alice is only enrolled in Biology, so all of her saves come from that course.
// Bob is enrolled in both courses, so his saves span Biology and Chemistry.
export const seedSavedPosts = [
  saved(savedPostId("01"), alice, POST_IDS.biologyWelcome, 20),
  saved(savedPostId("02"), alice, POST_IDS.biologyOsmosis, 18),
  saved(savedPostId("03"), alice, POST_IDS.biologyKrebsCycle, 14),
  saved(savedPostId("04"), alice, POST_IDS.biologyAlleles, 10),
  saved(savedPostId("05"), alice, POST_IDS.biologyEndosymbiotic, 6),
  saved(savedPostId("06"), alice, POST_IDS.biologyNaturalSelection, 3),
  saved(savedPostId("07"), alice, POST_IDS.biologyLabSafety, 0, 7),
  saved(savedPostId("08"), bob, POST_IDS.biologyWelcome, 19),
  saved(savedPostId("09"), bob, POST_IDS.chemistryWelcome, 15),
  saved(savedPostId("0a"), bob, POST_IDS.chemistryMolarity, 8),
  saved(savedPostId("0b"), moderator, POST_IDS.biologyMitochondria, 12)
] satisfies NewSavedPost[];
