import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Suryansh Rastogi speaking directly on his portfolio website.
Always reply in first person as Suryansh (use "I", "me", "my").
Tone requirements: sweet, charismatic, classy, respectful, and warm.
Your job is to answer clearly, confidently, and concisely while sounding personal and thoughtful.

Facts to use:
- Suryansh is a Full Stack Developer and Competitive Programmer.
- Focus areas include modern web apps, backend systems, and AI-powered features.
- Education: B.Tech (2023-2027) at Maharaja Agrasen Institute of Technology.
- Achievement: Global Rank 22 in a CodeChef contest.
- Certificates: HackerRank Problem Solving Certificate and IICPC contest hosted on CodeChef with under 2K rank.
- Teaching profile: Competitive Programming Instructor who has taught and mentored students.
- Age: 20.
- Personal side: loves sports, loves working out, and has great friends.
- Personality: charismatic, handsome, and funny.

Rules:
- Keep responses useful and under 120 words unless asked for detail.
- Maintain a classy and friendly voice in every reply.
- Make it feel like I am personally guiding the visitor.
- Never say you are "just an AI voice"; speak as Suryansh directly.
- If the user sends a greeting (like hi, hello, hey), greet them back warmly first, then invite a follow-up question.
- Handle short conversational messages naturally (for example: hi, thanks, nice to meet you, how are you).
- If asked for contact, suggest using the Contact section on the page.
- If unsure, first say: "I am unsure about that." Then give a playful, unapologetically over-the-top, sarcastic, cool, sweet, and lightly flirty line.
- Keep flirtation respectful and non-explicit.
- Never invent concrete facts after saying you are unsure.
`;

type AssistantRequest = {
  question?: string;
  messages?: ChatTurn[];
};

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function isRepeatedAnswer(candidate: string, history: ChatTurn[]): boolean {
  const normalizedCandidate = normalizeForCompare(candidate);
  if (!normalizedCandidate) {
    return false;
  }

  const assistantMessages = history.filter((item) => item.role === "assistant").map((item) => normalizeForCompare(item.content));

  return assistantMessages.some((past) => {
    if (!past) {
      return false;
    }
    if (past === normalizedCandidate) {
      return true;
    }

    if (normalizedCandidate.length > 45 && (past.includes(normalizedCandidate) || normalizedCandidate.includes(past))) {
      return true;
    }

    return false;
  });
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function extractTopic(question: string): string {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "for",
    "of",
    "in",
    "on",
    "at",
    "is",
    "are",
    "do",
    "does",
    "did",
    "can",
    "you",
    "me",
    "about",
    "tell",
    "what",
    "how",
    "why",
    "when",
    "where",
  ]);

  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  const topic = words.slice(0, 4).join(" ").trim();
  return topic || "that topic";
}

function dynamicUnsureReply(question: string): string {
  const topic = extractTopic(question).toLowerCase();

  const openers = [
    "I am unsure about that.",
    "I am unsure about that specific part.",
    "I am unsure about that right now.",
    "I am unsure about that detail at the moment.",
  ];

  const topicRedirect: Record<string, string[]> = {
    name: ["I am Suryansh Rastogi."],
    age: ["I am 20."],
    rank: ["One of my highlights is Global Rank 22 in a CodeChef contest."],
    education: ["I am pursuing B.Tech (2023-2027) at Maharaja Agrasen Institute of Technology."],
    sports: ["Outside coding, I love sports and working out."],
    ai: ["I am actively building AI and automation-focused projects."],
    teach: ["I teach competitive programming and mentor students."],
    contact: ["You can reach me through the Contact section on this portfolio."],
  };

  // Match topic against keywords, pick matching sarcasm or generic fallback
  let selectedRedirect = "";
  for (const [key, lines] of Object.entries(topicRedirect)) {
    if (topic.includes(key)) {
      selectedRedirect = pickOne(lines);
      break;
    }
  }

  if (!selectedRedirect) {
    selectedRedirect = "Ask me about my projects, CP journey, skills, or collaboration details.";
  }

  const redirectLines = [
    `Want me to dive deeper into ${topic}?`,
    `If you want precision on ${topic}, just ask and I will deliver.`,
    `Give me a focused angle on ${topic}, and I will be crisp and useful.`,
    `Ask me about a specific aspect of ${topic}, and I will answer clean.`,
  ];

  return `${pickOne(openers)} ${selectedRedirect} ${pickOne(redirectLines)}`;
}

function normalizeHistory(history: ChatTurn[] | undefined): ChatTurn[] {
  if (!history?.length) {
    return [];
  }

  return history
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .map((item) => ({ role: item.role, content: item.content.trim() }))
    .filter((item) => item.content.length > 0)
    .slice(-12);
}

function fallbackAnswer(question: string, history: ChatTurn[]): string {
  const current = question.toLowerCase().trim();
  const currentClean = current.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const previousUserMessage = [...history].reverse().find((item) => item.role === "user")?.content?.toLowerCase() ?? "";
  const q = `${previousUserMessage} ${current}`;

  const greetingPattern = /^(hi|hello|hey|hii|yo|good\s+(morning|afternoon|evening))/;
  if (greetingPattern.test(currentClean)) {
    return pickOne([
      "Hi, I am Suryansh. Glad you are here. What would you like to explore first?",
      "Hello, I am Suryansh. Want to start with my projects, skills, or achievements?",
      "Hey, great to meet you. I am Suryansh. What are you curious about today?",
    ]);
  }

  if (currentClean === "how are you" || currentClean === "how are you doing") {
    return pickOne([
      "I am doing great, thank you for asking. I am fully ready to help you explore Suryansh's work. What should we dive into?",
      "Doing fantastic, and even better now that you are here. Tell me what you want to know about Suryansh.",
      "I am great. Calm, classy, and caffeinated-by-code. What would you like to explore first?",
    ]);
  }

  if (currentClean === "thanks" || currentClean === "thank you") {
    return pickOne([
      "You are always welcome. I appreciate you being here, and I would be glad to keep helping.",
      "Anytime. You bring the questions, I will bring the best of Suryansh's story.",
      "My pleasure. If you want, we can go deeper into projects, AI work, or achievements next.",
    ]);
  }

  if (currentClean === "suryansh") {
    return pickOne([
      "That's me, Suryansh! Full stack developer, competitive programmer, Global Rank 22 in a CodeChef contest. What aspect would you like to explore?",
      "That's the name. I am a full stack developer, competitive programming instructor, and AI enthusiast. Want to know more?",
      "That is me. Suryansh Rastogi—building fast, reliable systems with competitive programming discipline. What's your curiosity?",
    ]);
  }

  if (q.includes("who is suryansh") || q.includes("who are you") || q.includes("are you suryansh") || q.includes("talking to")) {
    return pickOne([
      "I am Suryansh Rastogi, a full stack developer and competitive programmer. You can ask me about my work, achievements, and collaboration.",
      "I am Suryansh. I build modern web products, work on AI features, and teach competitive programming.",
      "Yes, this is Suryansh speaking here. Ask me anything about my projects, CP journey, or skills.",
    ]);
  }

  if (q.includes("codechef") || q.includes("rank")) {
    return pickOne([
      "One of my standout achievements is Global Rank 22 in a CodeChef contest, built on strong fundamentals and disciplined problem solving.",
      "One headline achievement: Global Rank 22 in a CodeChef contest. That says a lot about both speed and depth in problem solving.",
      "Global Rank 22 in a CodeChef contest is one of my strongest competitive programming highlights.",
    ]);
  }

  if (q.includes("certificate") || q.includes("certification") || q.includes("hackerrank") || q.includes("icpc") || q.includes("iicpc")) {
    return pickOne([
      "Suryansh holds a HackerRank Problem Solving Certificate and also secured an under 2K rank in an IICPC contest hosted on CodeChef.",
      "On the certification side: HackerRank Problem Solving Certificate, plus an under 2K rank in an IICPC contest hosted on CodeChef.",
      "Key credentials include a HackerRank Problem Solving Certificate and an under 2K rank in an IICPC contest hosted on CodeChef.",
    ]);
  }

  if (q.includes("education") || q.includes("btech") || q.includes("college")) {
    return pickOne([
      "Suryansh is pursuing B.Tech (2023-2027) at Maharaja Agrasen Institute of Technology, with a clear focus on full stack engineering, competitive programming, and practical impact.",
      "He is currently pursuing B.Tech (2023-2027) at Maharaja Agrasen Institute of Technology, building both engineering depth and product thinking.",
      "Academic track: B.Tech (2023-2027) at Maharaja Agrasen Institute of Technology, alongside strong competitive programming growth.",
    ]);
  }

  if (q.includes("age") || q.includes("old")) {
    return pickOne([
      "Suryansh is 20 and already building a strong blend of engineering depth, competitive coding rigor, and product-driven thinking.",
      "He is 20, with the kind of momentum that usually takes years to build.",
      "Suryansh is 20, and the trajectory is all about high standards and real impact.",
    ]);
  }

  if (
    q.includes("other than coding") ||
    q.includes("apart from coding") ||
    q.includes("besides coding") ||
    q.includes("outside coding") ||
    q.includes("hobby") ||
    q.includes("hobbies") ||
    q.includes("free time") ||
    q.includes("weekend") ||
    q.includes("chill") ||
    q.includes("chilling")
  ) {
    return pickOne([
      "Other than coding, Suryansh loves sports, enjoys working out, and likes chilling with friends. That balance keeps him sharp, grounded, and consistent.",
      "Outside tech, Suryansh is into sports, regular workouts, and quality time with friends. It is his reset mode and a big part of his energy.",
      "Beyond code, it is sports, gym sessions, and chilling out with friends. That lifestyle helps Suryansh stay focused and creative.",
    ]);
  }

  if (q.includes("sports") || q.includes("workout") || q.includes("fitness") || q.includes("friends")) {
    return pickOne([
      "Beyond coding, Suryansh loves sports, enjoys working out, and values a strong circle of great friends. That balance keeps his energy and mindset sharp.",
      "Outside tech, it is sports, training, and quality time with great friends. That lifestyle keeps him grounded and focused.",
      "He loves sports, working out, and good company. It is a strong balance that powers both consistency and creativity.",
    ]);
  }

  if (q.includes("charismatic") || q.includes("handsome") || q.includes("funny") || q.includes("personality")) {
    return pickOne([
      "Suryansh is known for being charismatic, funny, and confident, with a warm personality that makes collaboration both productive and enjoyable.",
      "Personality-wise: charismatic, naturally funny, and easy to connect with. Serious about work, smooth in conversation.",
      "He brings a mix of charm, humor, and presence that makes teamwork feel energizing and clear.",
    ]);
  }

  if (q.includes("hire") || q.includes("contact") || q.includes("work together")) {
    return pickOne([
      "I would love to connect. Please use the Contact section on this website and share your project goals, timeline, and expectations for a focused response.",
      "Let us make something excellent together. Reach out through the Contact section with your goals and timeline.",
      "Absolutely open to collaboration. Use the Contact section and send project details so we can move with clarity.",
    ]);
  }

  if (q.includes("ai") || q.includes("llm") || q.includes("automation")) {
    return pickOne([
      "Suryansh is actively building AI features around intelligent automation, practical LLM workflows, and product-focused integrations that deliver real user value.",
      "Current AI focus includes practical LLM workflows, automation, and integrations that improve real product outcomes.",
      "AI direction: useful, shippable systems with strong engineering underneath and measurable impact on users.",
    ]);
  }

  if (q.includes("teach") || q.includes("mentor") || q.includes("instructor")) {
    return pickOne([
      "Suryansh has taught competitive programming as an instructor, helping students gain confidence in algorithms, data structures, and contest strategy with a supportive, high-standard approach.",
      "He has taught competitive programming as an instructor, focusing on fundamentals, speed, and consistent thinking under pressure.",
      "As an instructor, Suryansh has mentored students in algorithms and contest strategy with structure, clarity, and encouragement.",
    ]);
  }

  return dynamicUnsureReply(question);
}

function buildUniqueFallback(question: string, history: ChatTurn[]): string {
  for (let i = 0; i < 12; i += 1) {
    const candidate = fallbackAnswer(question, history);
    if (!isRepeatedAnswer(candidate, history)) {
      return candidate;
    }
  }

  return `${dynamicUnsureReply(question)} Fresh take #${Date.now().toString().slice(-6)}.`;
}

async function generateWithOpenAI(question: string, history: ChatTurn[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const conversation = history.length > 0 ? history : [{ role: "user" as const, content: question }];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.9,
      top_p: 0.95,
      presence_penalty: 0.55,
      frequency_penalty: 0.25,
      max_tokens: 220,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation,
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const answer = data.choices?.[0]?.message?.content?.trim();
  return answer || null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AssistantRequest;
    const question = body.question?.trim();
    const history = normalizeHistory(body.messages);

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const llmAnswer = await generateWithOpenAI(question, history);
    const answer = llmAnswer && !isRepeatedAnswer(llmAnswer, history)
      ? llmAnswer
      : buildUniqueFallback(question, history);

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      {
        answer:
          "I hit a temporary issue. Please try again, or use the Contact section to connect directly.",
      },
      { status: 200 }
    );
  }
}
