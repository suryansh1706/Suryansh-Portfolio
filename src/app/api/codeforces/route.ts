import { NextResponse } from "next/server";

const DEFAULT_HANDLE = "suryansh1706";
const STATUS_FETCH_COUNT = 10000;
const CSES_FALLBACK_USER_IDS: Record<string, string> = {
  suryansh1706: "248485",
};

type CodeforcesUser = {
  handle: string;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  organization?: string;
  country?: string;
};

type RatingChange = {
  contestId: number;
  rank: number;
  oldRating?: number;
  newRating: number;
  contestName?: string;
};

type ContestInfo = {
  id: number;
  name: string;
  startTimeSeconds?: number;
};

type Submission = {
  verdict?: string;
  creationTimeSeconds: number;
  problem?: {
    contestId?: number;
    index?: string;
    name?: string;
    rating?: number;
    tags?: string[];
  };
};

type TopicStat = {
  topic: string;
  count: number;
};

type PracticeProblem = {
  key: string;
  name: string;
  rating: number;
  url: string;
  tags: string[];
};

type WrongProblemStat = {
  key: string;
  name: string;
  url: string;
  wrongSubmissions: number;
};

type DaySubmissionStat = {
  day: string;
  submissions: number;
};

type Bucket = {
  rating: number;
  solved: number;
};

type MonthlySolvedPoint = {
  month: string;
  solved: number;
};

type CodeChefStats = {
  handle: string;
  rating: number;
  highestRating: number;
  globalRank: number;
  countryRank: number;
  totalProblemsSolved: number;
  contestsParticipated: number;
  latestContestGlobalRank: number;
};

type CsesStats = {
  profile: string;
  submissionCount: number;
  firstSubmission: string;
  lastSubmission: string;
};

type CodeChefRatingPoint = {
  rating?: string;
  rank?: string;
};

function sanitizeHandle(raw: string | null): string {
  if (!raw) {
    return DEFAULT_HANDLE;
  }

  const cleaned = raw.trim();
  if (!cleaned) {
    return DEFAULT_HANDLE;
  }

  return cleaned;
}

function bucketizeSolvedByRating(submissions: Submission[]): Bucket[] {
  const solvedKeys = new Set<string>();
  const distribution = new Map<number, number>();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    const rating = sub.problem?.rating;

    if (!contestId || !index || !rating) {
      continue;
    }

    const key = `${contestId}-${index}`;
    if (solvedKeys.has(key)) {
      continue;
    }

    solvedKeys.add(key);

    const bucket = Math.floor(rating / 100) * 100;
    distribution.set(bucket, (distribution.get(bucket) ?? 0) + 1);
  }

  const sorted = Array.from(distribution.entries()).sort((a, b) => a[0] - b[0]);
  return sorted.map(([rating, solved]) => ({ rating, solved }));
}

function uniqueSolvedCount(submissions: Submission[]): number {
  const solvedKeys = new Set<string>();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    if (!contestId || !index) {
      continue;
    }

    solvedKeys.add(`${contestId}-${index}`);
  }

  return solvedKeys.size;
}

function solved1700PlusCount(submissions: Submission[]): number {
  const solvedKeys = new Set<string>();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    const rating = sub.problem?.rating ?? 0;
    if (!contestId || !index || rating < 1700) {
      continue;
    }

    solvedKeys.add(`${contestId}-${index}`);
  }

  return solvedKeys.size;
}

function buildSolvedProblemCatalog(submissions: Submission[]): PracticeProblem[] {
  const map = new Map<string, PracticeProblem>();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    const name = sub.problem?.name;
    const rating = sub.problem?.rating;
    if (!contestId || !index || !name || !rating) {
      continue;
    }

    const key = `${contestId}-${index}`;
    if (map.has(key)) {
      continue;
    }

    map.set(key, {
      key,
      name,
      rating,
      url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
      tags: sub.problem?.tags ?? [],
    });
  }

  return Array.from(map.values());
}

function buildTopTopics(catalog: PracticeProblem[], limit = 10): TopicStat[] {
  const topicCount = new Map<string, number>();

  for (const problem of catalog) {
    for (const rawTag of problem.tags) {
      const tag = rawTag.trim().toLowerCase();
      if (!tag) {
        continue;
      }
      topicCount.set(tag, (topicCount.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(topicCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic, count]) => ({ topic, count }));
}

function averageSolvedRating(catalog: PracticeProblem[]): number {
  if (!catalog.length) {
    return 0;
  }

  const total = catalog.reduce((sum, item) => sum + item.rating, 0);
  return Math.round(total / catalog.length);
}

function buildRecommendedSheet(catalog: PracticeProblem[], targetCount = 30): PracticeProblem[] {
  const highValueTags = new Set([
    "binary search",
    "dp",
    "graphs",
    "greedy",
    "implementation",
    "math",
    "two pointers",
    "data structures",
    "sortings",
    "strings",
    "constructive algorithms",
    "number theory",
  ]);

  const pool = catalog.filter((problem) => problem.rating >= 800);
  if (!pool.length) {
    return [];
  }

  const score = (problem: PracticeProblem): number => {
    const tagScore = problem.tags.reduce((acc, tag) => (highValueTags.has(tag.toLowerCase()) ? acc + 1 : acc), 0);
    // Prefer medium band slightly while still allowing all ratings.
    const ratingBias = problem.rating >= 1100 && problem.rating <= 1900 ? 1 : 0;
    return tagScore * 3 + ratingBias;
  };

  const buckets = new Map<number, PracticeProblem[]>();
  for (const problem of pool) {
    const bucket = Math.floor(problem.rating / 100) * 100;
    if (!buckets.has(bucket)) {
      buckets.set(bucket, []);
    }
    buckets.get(bucket)?.push(problem);
  }

  const orderedBuckets = Array.from(buckets.keys()).sort((a, b) => a - b);
  for (const bucket of orderedBuckets) {
    const items = buckets.get(bucket) ?? [];
    items.sort((a, b) => {
      const delta = score(b) - score(a);
      if (delta !== 0) {
        return delta;
      }
      return a.name.localeCompare(b.name);
    });
  }

  const selected: PracticeProblem[] = [];
  let keepPicking = true;

  // Round-robin over rating buckets to keep distribution diverse.
  while (selected.length < targetCount && keepPicking) {
    keepPicking = false;
    for (const bucket of orderedBuckets) {
      if (selected.length >= targetCount) {
        break;
      }

      const list = buckets.get(bucket);
      if (!list || list.length === 0) {
        continue;
      }

      selected.push(list.shift() as PracticeProblem);
      keepPicking = true;
    }
  }

  return selected;
}

function buildWrongAttemptsLeaderboard(submissions: Submission[], topN = 5): WrongProblemStat[] {
  const counts = new Map<string, WrongProblemStat>();

  for (const sub of submissions) {
    if (sub.verdict === "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    const name = sub.problem?.name;
    if (!contestId || !index || !name) {
      continue;
    }

    const key = `${contestId}-${index}`;
    const existing = counts.get(key);
    if (!existing) {
      counts.set(key, {
        key,
        name,
        url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
        wrongSubmissions: 1,
      });
    } else {
      existing.wrongSubmissions += 1;
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.wrongSubmissions - a.wrongSubmissions)
    .slice(0, topN);
}

function buildMostActiveSubmissionDay(submissions: Submission[]): DaySubmissionStat | null {
  const dayCount = new Map<string, number>();

  for (const sub of submissions) {
    const day = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
  }

  let best: DaySubmissionStat | null = null;
  for (const [day, count] of dayCount.entries()) {
    if (!best || count > best.submissions) {
      best = { day, submissions: count };
    }
  }

  return best;
}

function buildBiggestRatingSwing(ratingHistory: RatingChange[]) {
  let bestGain = { value: 0, contestId: 0, contestName: "" };
  let worstDrop = { value: 0, contestId: 0, contestName: "" };

  for (const item of ratingHistory) {
    if (typeof item.oldRating !== "number") {
      continue;
    }
    const delta = item.newRating - item.oldRating;

    if (delta > bestGain.value) {
      bestGain = {
        value: delta,
        contestId: item.contestId,
        contestName: item.contestName ?? "",
      };
    }

    if (delta < worstDrop.value) {
      worstDrop = {
        value: delta,
        contestId: item.contestId,
        contestName: item.contestName ?? "",
      };
    }
  }

  return { bestGain, worstDrop };
}

function buildFastestContestSolve(submissions: Submission[], contests: ContestInfo[]) {
  const contestStart = new Map<number, number>();
  for (const contest of contests) {
    if (typeof contest.startTimeSeconds === "number") {
      contestStart.set(contest.id, contest.startTimeSeconds);
    }
  }

  let best: {
    problem: string;
    url: string;
    contestId: number;
    minutesFromStart: number;
  } | null = null;

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    const name = sub.problem?.name;
    if (!contestId || !index || !name) {
      continue;
    }

    const start = contestStart.get(contestId);
    if (!start) {
      continue;
    }

    const deltaSeconds = sub.creationTimeSeconds - start;
    if (deltaSeconds < 0) {
      continue;
    }

    const minutes = Math.round(deltaSeconds / 60);
    if (!best || minutes < best.minutesFromStart) {
      best = {
        problem: name,
        url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
        contestId,
        minutesFromStart: minutes,
      };
    }
  }

  return best;
}

function buildMonthlySolvedTrend(submissions: Submission[], monthsBack = 8): MonthlySolvedPoint[] {
  const solvedByMonth = new Map<string, Set<string>>();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    if (!contestId || !index) {
      continue;
    }

    const date = new Date(sub.creationTimeSeconds * 1000);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    if (!solvedByMonth.has(key)) {
      solvedByMonth.set(key, new Set<string>());
    }

    solvedByMonth.get(key)?.add(`${contestId}-${index}`);
  }

  const now = new Date();
  const points: MonthlySolvedPoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    points.push({
      month: label,
      solved: solvedByMonth.get(key)?.size ?? 0,
    });
  }

  return points;
}

function countSubmissionsByVerdict(submissions: Submission[]): { total: number; accepted: number } {
  const total = submissions.length;
  const accepted = submissions.filter((item) => item.verdict === "OK").length;
  return { total, accepted };
}

function solvedLast30Days(submissions: Submission[]): number {
  const THIRTY_DAYS = 30 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  const cutoff = now - THIRTY_DAYS;
  const solvedKeys = new Set<string>();

  for (const sub of submissions) {
    if (sub.verdict !== "OK") {
      continue;
    }

    if (sub.creationTimeSeconds < cutoff) {
      continue;
    }

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    if (!contestId || !index) {
      continue;
    }

    solvedKeys.add(`${contestId}-${index}`);
  }

  return solvedKeys.size;
}

async function fetchCodeforcesJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Codeforces request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

function parseFirstNumber(pattern: RegExp, text: string): number {
  const match = text.match(pattern);
  if (!match || !match[1]) {
    return 0;
  }

  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function parseNumberString(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseCodeChefSeries(html: string): CodeChefRatingPoint[] {
  const settingsMatch = html.match(/jQuery\.extend\(Drupal\.settings,\s*(\{[\s\S]*?\})\);/);
  if (!settingsMatch?.[1]) {
    return [];
  }

  try {
    const settings = JSON.parse(settingsMatch[1]) as {
      date_versus_rating?: {
        all?: CodeChefRatingPoint[];
      };
    };

    return settings.date_versus_rating?.all ?? [];
  } catch {
    return [];
  }
}

async function fetchCodeChefStats(handle: string): Promise<CodeChefStats | null> {
  try {
    const response = await fetch(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const ratingSeries = parseCodeChefSeries(html);
    const latestPoint = ratingSeries.length > 0 ? ratingSeries[ratingSeries.length - 1] : null;

    const ratingFromSeries = parseNumberString(latestPoint?.rating);
    const highestFromSeries = ratingSeries.reduce((best, point) => {
      const value = parseNumberString(point.rating);
      return value > best ? value : best;
    }, 0);

    const rating = ratingFromSeries || parseFirstNumber(/(\d[\d,]*)\s*\(Div\s*\d\)\s*[★*]/i, html);
    const highestRating = highestFromSeries || parseFirstNumber(/Highest\s+Rating\s*(\d[\d,]*)/i, html);
    const totalProblemsSolved = parseFirstNumber(/Total\s+Problems\s+Solved:\s*(\d[\d,]*)/i, html);
    const contestsFromSeries = ratingSeries.length;
    const contestsParticipated = contestsFromSeries || parseFirstNumber(/No\.\s*of\s*Contests\s*Participated:\s*(\d[\d,]*)/i, html);
    const latestContestGlobalRank = parseNumberString(latestPoint?.rank) || parseFirstNumber(/Global\s+Rank:\s*([\d,]+)/i, html);
    const globalRank = parseFirstNumber(/\[(\d[\d,]*)\]\s*Global\s+Rank/i, html) || latestContestGlobalRank;
    const countryRank = parseFirstNumber(/\[(\d[\d,]*)\]\s*Country\s+Rank/i, html);

    if (!rating && !highestRating && !totalProblemsSolved) {
      return null;
    }

    return {
      handle,
      rating,
      highestRating,
      globalRank,
      countryRank,
      totalProblemsSolved,
      contestsParticipated,
      latestContestGlobalRank,
    };
  } catch {
    return null;
  }
}

async function fetchCsesStats(username: string): Promise<CsesStats | null> {
  const userId = process.env.CSES_USER_ID?.trim() || CSES_FALLBACK_USER_IDS[username.toLowerCase()] || "";

  const urls = userId
    ? [`https://cses.fi/user/${encodeURIComponent(userId)}`]
    : [`https://cses.fi/user/${encodeURIComponent(username)}`];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      const profile = (html.match(/<h1>\s*User\s+([^<]+)<\/h1>/i)?.[1] ?? "").trim();
      const submissionCount = parseFirstNumber(/Submission\s+count:\s*<\/td>\s*<td[^>]*>\s*([\d,]+)/i, html);
      const firstSubmission = (html.match(/First\s+submission:\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1] ?? "").trim();
      const lastSubmission = (html.match(/Last\s+submission:\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i)?.[1] ?? "").trim();

      if (!profile || submissionCount <= 0) {
        continue;
      }

      // When userId is not configured, only accept exact username profile match.
      if (!userId && profile.toLowerCase() !== username.toLowerCase()) {
        continue;
      }

      return {
        profile,
        submissionCount,
        firstSubmission,
        lastSubmission,
      };
    } catch {
      continue;
    }
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = sanitizeHandle(searchParams.get("handle"));

  try {
    const [infoRaw, ratingRaw, statusRaw, contestRaw, codeChefStats, csesStats] = await Promise.all([
      fetchCodeforcesJson<{ status: string; result: CodeforcesUser[] }>(
        `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`
      ),
      fetchCodeforcesJson<{ status: string; result: RatingChange[] }>(
        `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`
      ),
      fetchCodeforcesJson<{ status: string; result: Submission[] }>(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${STATUS_FETCH_COUNT}`
      ),
      fetchCodeforcesJson<{ status: string; result: ContestInfo[] }>(
        `https://codeforces.com/api/contest.list?gym=false`
      ),
      fetchCodeChefStats(handle),
      fetchCsesStats(handle),
    ]);

    const user = infoRaw.result?.[0];
    const ratingHistory = ratingRaw.result ?? [];
    const submissions = statusRaw.result ?? [];
    const solvedByRating = bucketizeSolvedByRating(submissions);
    const solvedCatalog = buildSolvedProblemCatalog(submissions);
    const topTopics = buildTopTopics(solvedCatalog, 12);
    const cfAverageSolvedRating = averageSolvedRating(solvedCatalog);
    const recommendedSheet = buildRecommendedSheet(solvedCatalog, 30);
    const wrongAttemptsTop = buildWrongAttemptsLeaderboard(submissions, 5);
    const mostActiveDay = buildMostActiveSubmissionDay(submissions);
    const { bestGain, worstDrop } = buildBiggestRatingSwing(ratingHistory);
    const fastestContestSolve = buildFastestContestSolve(submissions, contestRaw.result ?? []);
    const hardestSolved = solvedCatalog.reduce<PracticeProblem | null>((best, item) => {
      if (!best || item.rating > best.rating) {
        return item;
      }
      return best;
    }, null);
    const easiestSolved = solvedCatalog.reduce<PracticeProblem | null>((best, item) => {
      if (!best || item.rating < best.rating) {
        return item;
      }
      return best;
    }, null);
    const solvedTotal = uniqueSolvedCount(submissions);
    const solved1700Plus = solved1700PlusCount(submissions);
    const recentSolved = solvedLast30Days(submissions);
    const monthlySolvedTrend = buildMonthlySolvedTrend(submissions, 8);
    const submissionStats = countSubmissionsByVerdict(submissions);
    const acceptanceRate = submissionStats.total > 0
      ? Number(((submissionStats.accepted / submissionStats.total) * 100).toFixed(1))
      : 0;

    const bestContestRank = ratingHistory.reduce<number | null>((best, item) => {
      if (!item.rank || item.rank <= 0) {
        return best;
      }
      if (best === null) {
        return item.rank;
      }
      return item.rank < best ? item.rank : best;
    }, null);

    const lastTwentyRatings = ratingHistory.slice(-20).map((item) => ({
      contestId: item.contestId,
      rank: item.rank,
      rating: item.newRating,
    }));

    return NextResponse.json({
      handle,
      profile: {
        rank: user?.rank ?? "unrated",
        rating: user?.rating ?? 0,
        maxRank: user?.maxRank ?? "unrated",
        maxRating: user?.maxRating ?? 0,
        organization: user?.organization ?? "",
        country: user?.country ?? "",
      },
      stats: {
        solvedTotal,
        solved1700Plus,
        solvedLast30Days: recentSolved,
        contestsPlayed: ratingHistory.length,
        bestContestRank: bestContestRank ?? 0,
        totalSubmissions: submissionStats.total,
        acceptedSubmissions: submissionStats.accepted,
        acceptanceRate,
      },
      solvedByRating,
      monthlySolvedTrend,
      recentRatingTrend: lastTwentyRatings,
      insights: {
        averageSolvedRating: cfAverageSolvedRating,
        topTopics,
        recommendedSheet,
        sheetPool: solvedCatalog,
        deepStats: {
          wrongAttemptsTop,
          mostActiveDay,
          biggestGain: bestGain,
          biggestDrop: worstDrop,
          fastestContestSolve,
          hardestSolved,
          easiestSolved,
        },
      },
      codechef: codeChefStats,
      cses: csesStats,
      source: "Codeforces + CodeChef + CSES",
      lastUpdatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch Codeforces stats right now.",
      },
      { status: 502 }
    );
  }
}
