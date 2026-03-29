import { NextResponse } from "next/server";

const DEFAULT_HANDLE = "suryansh1706";
const HISTORY_DAYS = 365;
const CF_STATUS_FETCH_COUNT = 5000;
const CODECHEF_MAX_PAGES = 8;
const GITHUB_MAX_PAGES = 3;

type DailyPlatformStats = {
  submissions: number;
  solved: number;
  commits: number;
  events: number;
};

type HeatmapDay = {
  date: string;
  total: number;
  codeforces: DailyPlatformStats;
  codechef: DailyPlatformStats;
  leetcode: DailyPlatformStats;
  github: DailyPlatformStats;
  cses: DailyPlatformStats;
};

type CodeforcesSubmission = {
  verdict?: string;
  creationTimeSeconds: number;
  problem?: {
    contestId?: number;
    index?: string;
  };
};

type CodeChefRecentResponse = {
  max_page?: number;
  content?: string;
};

type LeetCodeCalendarResponse = {
  data?: {
    matchedUser?: {
      submitStatsGlobal?: {
        acSubmissionNum?: Array<{
          difficulty: string;
          count: number;
          submissions: number;
        }>;
      };
      userCalendar?: {
        submissionCalendar?: string;
      };
    };
  };
};

type GitHubEvent = {
  type: string;
  created_at: string;
  payload?: {
    size?: number;
    commits?: Array<unknown>;
  };
};

type GitHubUser = {
  public_repos: number;
  followers: number;
  following: number;
};

type LeetCodeStats = {
  solvedTotal: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
};

function sanitizeHandle(raw: string | null): string {
  const cleaned = raw?.trim();
  return cleaned || DEFAULT_HANDLE;
}

function dateKeyFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(input: string): string {
  return dateKeyFromDate(new Date(input));
}

function emptyStats(): DailyPlatformStats {
  return {
    submissions: 0,
    solved: 0,
    commits: 0,
    events: 0,
  };
}

function buildHeatmapWindow(days: number): Map<string, HeatmapDay> {
  const map = new Map<string, HeatmapDay>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = dateKeyFromDate(d);
    map.set(key, {
      date: key,
      total: 0,
      codeforces: emptyStats(),
      codechef: emptyStats(),
      leetcode: emptyStats(),
      github: emptyStats(),
      cses: emptyStats(),
    });
  }

  return map;
}

function recomputeTotals(map: Map<string, HeatmapDay>): void {
  for (const day of map.values()) {
    day.total =
      day.codeforces.submissions +
      day.codeforces.solved +
      day.codechef.submissions +
      day.codechef.solved +
      day.leetcode.submissions +
      day.leetcode.solved +
      day.github.commits +
      day.github.events +
      day.cses.submissions +
      day.cses.solved;
  }
}

function parseCodeChefDate(raw: string): Date | null {
  const match = raw.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(\d{2})\/(\d{2})\/(\d{2})/i);
  if (!match) {
    return null;
  }

  const hourPart = Number(match[1]);
  const minute = Number(match[2]);
  const amPm = match[3].toUpperCase();
  const day = Number(match[4]);
  const month = Number(match[5]);
  const year = 2000 + Number(match[6]);

  if (!Number.isFinite(hourPart) || !Number.isFinite(minute) || !Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }

  let hour = hourPart % 12;
  if (amPm === "PM") {
    hour += 12;
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      "User-Agent": "Mozilla/5.0",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.text();
}

async function applyCodeforcesActivity(handle: string, map: Map<string, HeatmapDay>): Promise<{ solvedTotal: number }> {
  const raw = await fetchJson<{ status: string; result: CodeforcesSubmission[] }>(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=${CF_STATUS_FETCH_COUNT}`
  );

  const submissions = raw.result ?? [];
  const solvedGlobal = new Set<string>();
  const solvedPerDay = new Map<string, Set<string>>();

  for (const sub of submissions) {
    const day = dateKeyFromDate(new Date(sub.creationTimeSeconds * 1000));
    const dayNode = map.get(day);
    if (!dayNode) {
      continue;
    }

    dayNode.codeforces.submissions += 1;

    const contestId = sub.problem?.contestId;
    const index = sub.problem?.index;
    if (sub.verdict === "OK" && contestId && index) {
      const key = `${contestId}-${index}`;
      solvedGlobal.add(key);

      if (!solvedPerDay.has(day)) {
        solvedPerDay.set(day, new Set<string>());
      }
      solvedPerDay.get(day)?.add(key);
    }
  }

  for (const [day, set] of solvedPerDay.entries()) {
    const dayNode = map.get(day);
    if (!dayNode) {
      continue;
    }
    dayNode.codeforces.solved += set.size;
  }

  return { solvedTotal: solvedGlobal.size };
}

async function applyCodeChefActivity(handle: string, map: Map<string, HeatmapDay>): Promise<{ solvedTotal: number }> {
  let maxPage = 1;
  let solvedTotal = 0;

  for (let page = 0; page < CODECHEF_MAX_PAGES; page += 1) {
    const raw = await fetchText(`https://www.codechef.com/recent/user?user_handle=${encodeURIComponent(handle)}&page=${page}`);
    const parsed = JSON.parse(raw) as CodeChefRecentResponse;

    if (page === 0) {
      maxPage = Math.max(parsed.max_page ?? 1, 1);
    }

    const html = parsed.content ?? "";
    if (!html) {
      continue;
    }

    const rowMatches = html.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
    for (const row of rowMatches) {
      const timeMatch = row.match(/tooltiptext'>\s*([^<]+)\s*</i);
      if (!timeMatch?.[1]) {
        continue;
      }

      const date = parseCodeChefDate(timeMatch[1].trim());
      if (!date) {
        continue;
      }

      const day = dateKeyFromDate(date);
      const dayNode = map.get(day);
      if (!dayNode) {
        continue;
      }

      dayNode.codechef.submissions += 1;
      const accepted = /title=['"]accepted['"]/i.test(row) || /tick-icon\.gif/i.test(row);
      if (accepted) {
        dayNode.codechef.solved += 1;
        solvedTotal += 1;
      }
    }

    if (page + 1 >= maxPage) {
      break;
    }
  }

  return { solvedTotal };
}

async function applyLeetCodeActivity(handle: string, map: Map<string, HeatmapDay>): Promise<LeetCodeStats> {
  const body = {
    query:
      "query userProfileCalendar($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count submissions } } userCalendar { submissionCalendar } } }",
    variables: {
      username: handle,
    },
  };

  const raw = await fetchJson<LeetCodeCalendarResponse>("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: `https://leetcode.com/${encodeURIComponent(handle)}/`,
    },
    body: JSON.stringify(body),
  });

  const acNums = raw.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];
  const all = acNums.find((x) => x.difficulty === "All")?.count ?? 0;
  const easy = acNums.find((x) => x.difficulty === "Easy")?.count ?? 0;
  const medium = acNums.find((x) => x.difficulty === "Medium")?.count ?? 0;
  const hard = acNums.find((x) => x.difficulty === "Hard")?.count ?? 0;

  const calendarStr = raw.data?.matchedUser?.userCalendar?.submissionCalendar ?? "{}";
  let calendar: Record<string, number> = {};

  try {
    calendar = JSON.parse(calendarStr) as Record<string, number>;
  } catch {
    calendar = {};
  }

  for (const [epochStr, count] of Object.entries(calendar)) {
    const epoch = Number(epochStr);
    if (!Number.isFinite(epoch)) {
      continue;
    }

    const day = dateKeyFromDate(new Date(epoch * 1000));
    const dayNode = map.get(day);
    if (!dayNode) {
      continue;
    }

    const value = Number(count) || 0;
    dayNode.leetcode.submissions += value;
    dayNode.leetcode.events += value;
  }

  return {
    solvedTotal: all,
    easySolved: easy,
    mediumSolved: medium,
    hardSolved: hard,
  };
}

async function applyGitHubActivity(handle: string, map: Map<string, HeatmapDay>): Promise<{ commits: number; events: number; user: GitHubUser | null }> {
  let totalCommits = 0;
  let totalEvents = 0;

  for (let page = 1; page <= GITHUB_MAX_PAGES; page += 1) {
    const events = await fetchJson<GitHubEvent[]>(
      `https://api.github.com/users/${encodeURIComponent(handle)}/events/public?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!events.length) {
      break;
    }

    for (const event of events) {
      const day = parseDateKey(event.created_at);
      const dayNode = map.get(day);
      if (!dayNode) {
        continue;
      }

      dayNode.github.events += 1;
      totalEvents += 1;

      if (event.type === "PushEvent") {
        const commitCount = event.payload?.size ?? event.payload?.commits?.length ?? 1;
        dayNode.github.commits += commitCount;
        totalCommits += commitCount;
      }
    }
  }

  let user: GitHubUser | null = null;
  try {
    user = await fetchJson<GitHubUser>(`https://api.github.com/users/${encodeURIComponent(handle)}`, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });
  } catch {
    user = null;
  }

  return { commits: totalCommits, events: totalEvents, user };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cfHandle = sanitizeHandle(searchParams.get("cf") ?? searchParams.get("handle"));
  const ccHandle = sanitizeHandle(searchParams.get("cc") ?? searchParams.get("handle"));
  const lcHandle = sanitizeHandle(searchParams.get("lc") ?? searchParams.get("handle"));
  const ghHandle = sanitizeHandle(searchParams.get("gh") ?? searchParams.get("handle"));

  const heatmap = buildHeatmapWindow(HISTORY_DAYS);

  try {
    const [cf, cc, lc, gh] = await Promise.all([
      applyCodeforcesActivity(cfHandle, heatmap),
      applyCodeChefActivity(ccHandle, heatmap),
      applyLeetCodeActivity(lcHandle, heatmap),
      applyGitHubActivity(ghHandle, heatmap),
    ]);

    recomputeTotals(heatmap);

    const days = Array.from(heatmap.values());
    const maxDayTotal = days.reduce((best, day) => (day.total > best ? day.total : best), 0);

    return NextResponse.json({
      handles: {
        codeforces: cfHandle,
        codechef: ccHandle,
        leetcode: lcHandle,
        github: ghHandle,
      },
      totals: {
        codeforcesSolved: cf.solvedTotal,
        codechefSolvedRecent: cc.solvedTotal,
        leetcodeSolved: lc.solvedTotal,
        leetcodeEasySolved: lc.easySolved,
        leetcodeMediumSolved: lc.mediumSolved,
        leetcodeHardSolved: lc.hardSolved,
        githubCommitsRecent: gh.commits,
        githubEventsRecent: gh.events,
      },
      github: {
        publicRepos: gh.user?.public_repos ?? 0,
        followers: gh.user?.followers ?? 0,
        following: gh.user?.following ?? 0,
      },
      cses: {
        dailyActivityAvailable: false,
        note: "CSES daily user activity is not publicly available without login.",
      },
      heatmap: {
        days,
        maxDayTotal,
        windowDays: HISTORY_DAYS,
      },
      lastUpdatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch cross-platform activity right now.",
      },
      { status: 502 }
    );
  }
}
