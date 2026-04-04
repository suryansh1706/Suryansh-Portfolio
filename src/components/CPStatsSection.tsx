'use client';

import { useEffect, useMemo, useState } from 'react';

type RatingBucket = {
  rating: number;
  solved: number;
};

type TrendPoint = {
  contestId: number;
  rank: number;
  rating: number;
};

type CodeChefTrendPoint = {
  contest: number;
  rating: number;
  rank: number;
};

type StatsPayload = {
  handle: string;
  profile: {
    rank: string;
    rating: number;
    maxRank: string;
    maxRating: number;
  };
  stats: {
    solvedTotal: number;
    solved1700Plus: number;
    solvedLast30Days: number;
    contestsPlayed: number;
    bestContestRank: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    acceptanceRate: number;
  };
  solvedByRating: RatingBucket[];
  recentRatingTrend: TrendPoint[];
  insights: {
    averageSolvedRating: number;
    topTopics: Array<{
      topic: string;
      count: number;
    }>;
    recommendedSheet: Array<{
      key: string;
      name: string;
      rating: number;
      url: string;
      tags: string[];
    }>;
    sheetPool: Array<{
      key: string;
      name: string;
      rating: number;
      url: string;
      tags: string[];
    }>;
    deepStats: {
      wrongAttemptsTop: Array<{
        key: string;
        name: string;
        url: string;
        wrongSubmissions: number;
      }>;
      mostActiveDay: {
        day: string;
        submissions: number;
      } | null;
      biggestGain: {
        value: number;
        contestId: number;
        contestName: string;
      };
      biggestDrop: {
        value: number;
        contestId: number;
        contestName: string;
      };
      fastestContestSolve: {
        problem: string;
        url: string;
        contestId: number;
        minutesFromStart: number;
      } | null;
      hardestSolved: {
        key: string;
        name: string;
        rating: number;
        url: string;
        tags: string[];
      } | null;
      easiestSolved: {
        key: string;
        name: string;
        rating: number;
        url: string;
        tags: string[];
      } | null;
    };
  };
  codechef: {
    handle: string;
    rating: number;
    highestRating: number;
    globalRank: number;
    totalProblemsSolved: number;
    contestsParticipated: number;
    ratingTrend: CodeChefTrendPoint[];
  } | null;
  cses: {
    profile: string;
    submissionCount: number;
  } | null;
};

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

type ActivityPayload = {
  totals: {
    codeforcesSolved: number;
    codechefSolvedRecent: number;
    leetcodeSolved: number;
    leetcodeEasySolved: number;
    leetcodeMediumSolved: number;
    leetcodeHardSolved: number;
    githubCommitsRecent: number;
    githubEventsRecent: number;
  };
  github: {
    publicRepos: number;
    followers: number;
    following: number;
  };
  cses: {
    dailyActivityAvailable: boolean;
    note: string;
  };
  heatmap: {
    days: HeatmapDay[];
    maxDayTotal: number;
    windowDays: number;
  };
};

const CF_HANDLE = 'suryansh1706';
const CC_HANDLE = 'suryansh1706';
const LC_HANDLE = 'suryansh1706';
const GH_HANDLE = 'suryansh1706';

const CFLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden="true">
    <path d="M4 6h4v12H4z" fill="#1f8acb" />
    <path d="M10 10h4v8h-4z" fill="#ef4444" />
    <path d="M16 4h4v14h-4z" fill="#3b82f6" />
  </svg>
);

const CCLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#7c2d12" />
    <path d="M8 12a4 4 0 1 0 0.01 0" stroke="#fca5a5" strokeWidth="2" />
  </svg>
);

const LCLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden="true">
    <path d="M14 5l-5 7 5 7" stroke="#f59e0b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 12h8" stroke="#fbbf24" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const GHLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
    <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.74-1.34-1.74-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.33 3.3 1.23a11.3 11.3 0 0 1 6 0c2.29-1.56 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 0Z" />
  </svg>
);

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

function longestActiveStreak(days: HeatmapDay[]): number {
  let best = 0;
  let current = 0;

  for (const day of days) {
    if (day.total > 0) {
      current += 1;
      if (current > best) {
        best = current;
      }
    } else {
      current = 0;
    }
  }

  return best;
}

type WrapCard = {
  title: string;
  value: string;
  sub: string;
  tone: 'blue' | 'red' | 'orange' | 'indigo' | 'slate';
};

function toneClasses(tone: WrapCard['tone']): string {
  if (tone === 'red') return 'from-red-900/40 to-black border-red-500/40 text-red-200';
  if (tone === 'orange') return 'from-orange-900/40 to-black border-orange-500/40 text-orange-200';
  if (tone === 'indigo') return 'from-indigo-900/40 to-black border-indigo-500/40 text-indigo-200';
  if (tone === 'slate') return 'from-slate-900/60 to-black border-slate-500/40 text-slate-200';
  return 'from-blue-900/40 to-black border-blue-500/40 text-blue-200';
}

function buildDayActivityLines(day: HeatmapDay): string[] {
  const lines: string[] = [];

  if (day.codeforces.submissions > 0 || day.codeforces.solved > 0) {
    const parts: string[] = [];
    if (day.codeforces.submissions > 0) {
      parts.push(`${day.codeforces.submissions} submissions`);
    }
    if (day.codeforces.solved > 0) {
      parts.push(`${day.codeforces.solved} solved`);
    }
    lines.push(`Codeforces: ${parts.join(', ')}`);
  }

  if (day.codechef.submissions > 0 || day.codechef.solved > 0) {
    const parts: string[] = [];
    if (day.codechef.submissions > 0) {
      parts.push(`${day.codechef.submissions} submissions`);
    }
    if (day.codechef.solved > 0) {
      parts.push(`${day.codechef.solved} accepted`);
    }
    lines.push(`CodeChef: ${parts.join(', ')}`);
  }

  if (day.leetcode.submissions > 0 || day.leetcode.solved > 0) {
    const parts: string[] = [];
    if (day.leetcode.submissions > 0) {
      parts.push(`${day.leetcode.submissions} submissions`);
    }
    if (day.leetcode.solved > 0) {
      parts.push(`${day.leetcode.solved} solved`);
    }
    lines.push(`LeetCode: ${parts.join(', ')}`);
  }

  if (day.github.commits > 0 || day.github.events > 0) {
    const parts: string[] = [];
    if (day.github.commits > 0) {
      parts.push(`${day.github.commits} commits`);
    }
    if (day.github.events > 0) {
      parts.push(`${day.github.events} events`);
    }
    lines.push(`GitHub: ${parts.join(', ')}`);
  }

  if (day.cses.submissions > 0 || day.cses.solved > 0) {
    const parts: string[] = [];
    if (day.cses.submissions > 0) {
      parts.push(`${day.cses.submissions} submissions`);
    }
    if (day.cses.solved > 0) {
      parts.push(`${day.cses.solved} solved`);
    }
    lines.push(`CSES: ${parts.join(', ')}`);
  }

  return lines;
}

function formatDateLabel(isoDay: string): string {
  const d = new Date(`${isoDay}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function CPStatsSection() {
  const [statsData, setStatsData] = useState<StatsPayload | null>(null);
  const [activityData, setActivityData] = useState<ActivityPayload | null>(null);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [wrappedIndex, setWrappedIndex] = useState(0);
  const [problemsPerRating, setProblemsPerRating] = useState(2);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsResp, activityResp] = await Promise.all([
          fetch(`/api/codeforces?handle=${CF_HANDLE}`, { cache: 'no-store' }),
          fetch(`/api/activity?cf=${CF_HANDLE}&cc=${CC_HANDLE}&lc=${LC_HANDLE}&gh=${GH_HANDLE}`, { cache: 'no-store' }),
        ]);

        if (!statsResp.ok || !activityResp.ok) {
          throw new Error('fetch_failed');
        }

        const statsPayload = (await statsResp.json()) as StatsPayload;
        const activityPayload = (await activityResp.json()) as ActivityPayload;

        if (isMounted) {
          setStatsData(statsPayload);
          setActivityData(activityPayload);
          setHoveredDay(activityPayload.heatmap.days[activityPayload.heatmap.days.length - 1] ?? null);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load cross-platform stats right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const buildRatingPath = (ratings: number[]): string => {
    if (!ratings.length) {
      return '';
    }

    const width = 640;
    const height = 220;
    const padding = 24;
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const range = Math.max(maxRating - minRating, 1);

    return ratings
      .map((value, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(ratings.length - 1, 1);
        const y = height - padding - ((value - minRating) / range) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };

  const cfRatingPath = useMemo(() => {
    if (!statsData?.recentRatingTrend?.length) {
      return '';
    }
    return buildRatingPath(statsData.recentRatingTrend.map((item) => item.rating));
  }, [statsData]);

  const codechefRatingPath = useMemo(() => {
    const trend = statsData?.codechef?.ratingTrend ?? [];
    if (!trend.length) {
      return '';
    }
    return buildRatingPath(trend.map((item) => item.rating));
  }, [statsData]);

  const maxSolvedBucket = useMemo(() => {
    if (!statsData?.solvedByRating?.length) {
      return 1;
    }
    return Math.max(...statsData.solvedByRating.map((item) => item.solved), 1);
  }, [statsData]);

  const combinedTotals = useMemo(() => {
    if (!statsData || !activityData) {
      return null;
    }

    const cfSolved = statsData.stats.solvedTotal;
    const ccSolved = statsData.codechef?.totalProblemsSolved ?? 0;
    const lcSolved = activityData.totals.leetcodeSolved;
    const csesActivity = statsData.cses?.submissionCount ?? 0;

    return {
      totalProblemsAll: cfSolved + ccSolved + lcSolved,
      codeforces: cfSolved,
      codechef: ccSolved,
      leetcode: lcSolved,
      csesActivity,
      githubCommitsRecent: activityData.totals.githubCommitsRecent,
    };
  }, [statsData, activityData]);

  const wrapped = useMemo(() => {
    if (!activityData || !statsData) {
      return null;
    }

    const days = activityData.heatmap.days;
    const activeDays = days.filter((day) => day.total > 0).length;
    const bestDay = days.reduce<HeatmapDay | null>((best, day) => {
      if (!best || day.total > best.total) {
        return day;
      }
      return best;
    }, null);

    const topTopic = statsData.insights.topTopics[0]?.topic ?? 'mixed topics';
    const streak = longestActiveStreak(days);

    return {
      activeDays,
      bestDay,
      streak,
      topTopic,
      totalActions: days.reduce((sum, day) => sum + day.total, 0),
    };
  }, [activityData, statsData]);

  const recommendedSheet = useMemo(
    () => statsData?.insights.recommendedSheet ?? [],
    [statsData]
  );

  const ratingBucketSheet = useMemo(() => {
    if (!statsData) {
      return [] as Array<{ rating: number; problems: StatsPayload['insights']['sheetPool'] }>;
    }

    const pool = [...(statsData.insights.sheetPool ?? [])].sort((a, b) => a.rating - b.rating || a.name.localeCompare(b.name));
    const maxRating = pool.reduce((best, item) => (item.rating > best ? item.rating : best), 800);

    const byRating = new Map<number, StatsPayload['insights']['sheetPool']>();
    for (const item of pool) {
      if (item.rating < 800) {
        continue;
      }
      const bucket = Math.floor(item.rating / 100) * 100;
      if (!byRating.has(bucket)) {
        byRating.set(bucket, []);
      }
      byRating.get(bucket)?.push(item);
    }

    const rows: Array<{ rating: number; problems: StatsPayload['insights']['sheetPool'] }> = [];
    for (let rating = 800; rating <= maxRating; rating += 100) {
      const list = byRating.get(rating) ?? [];
      rows.push({ rating, problems: list.slice(0, Math.max(1, problemsPerRating)) });
    }

    return rows;
  }, [statsData, problemsPerRating]);

  const downloadPracticeSheetCsv = () => {
    const rows = recommendedSheet;
    const header = 'Title,Rating,Tags,URL';
    const csvRows = rows.map((item) => {
      const title = `"${item.name.replace(/"/g, '""')}"`;
      const rating = `${item.rating}`;
      const tags = `"${item.tags.join(' | ').replace(/"/g, '""')}"`;
      const url = `"${item.url}"`;
      return [title, rating, tags, url].join(',');
    });
    downloadTextFile('cp-practice-sheet.csv', [header, ...csvRows].join('\n'));
  };

  const downloadPracticeSheetMarkdown = () => {
    const rows = recommendedSheet;
    const lines: string[] = [];
    lines.push('# CP Practice Sheet');
    lines.push('Curated from solved Codeforces problems for structured practice.');
    lines.push('');

    rows.forEach((item, index) => {
      lines.push(`${index + 1}. [${item.name}](${item.url}) - Rating ${item.rating} - ${item.tags.join(', ')}`);
    });

    downloadTextFile('cp-practice-sheet.md', lines.join('\n'));
  };

  const generateRatingBucketPdf = () => {
    if (!ratingBucketSheet.length) {
      return;
    }

    const htmlLines: string[] = [];
    htmlLines.push('<!doctype html><html><head><meta charset="utf-8"/>');
    htmlLines.push('<title>CP Rating Bucket Practice Sheet</title>');
    htmlLines.push('<style>body{font-family:Segoe UI,Arial,sans-serif;padding:28px;color:#111} h1{margin:0 0 8px} .meta{color:#444;margin-bottom:18px} .bucket{margin:14px 0;padding:10px 12px;border:1px solid #ddd;border-radius:8px} .bucket h3{margin:0 0 8px} ul{margin:0;padding-left:20px} li{margin:4px 0} a{color:#0a58ca;text-decoration:none}</style>');
    htmlLines.push('</head><body>');
    htmlLines.push('<h1>CP Practice Sheet by Rating</h1>');
    htmlLines.push(`<div class="meta">Handle: ${CF_HANDLE} | Range: 800 to max solved | Problems per rating: ${Math.max(1, problemsPerRating)}</div>`);

    ratingBucketSheet.forEach((bucket) => {
      htmlLines.push(`<div class="bucket"><h3>Rating ${bucket.rating}</h3>`);
      if (!bucket.problems.length) {
        htmlLines.push('<p>No solved problems in this bucket yet.</p></div>');
        return;
      }
      htmlLines.push('<ul>');
      bucket.problems.forEach((problem) => {
        const safeName = problem.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        htmlLines.push(`<li><a href="${problem.url}" target="_blank" rel="noopener noreferrer">${safeName}</a> - ${problem.rating}</li>`);
      });
      htmlLines.push('</ul></div>');
    });

    htmlLines.push('</body></html>');

    const w = window.open('', '_blank');
    if (!w) {
      return;
    }
    w.document.open();
    w.document.write(htmlLines.join(''));
    w.document.close();
    w.focus();
    w.print();
  };

  const wrappedCards = useMemo<WrapCard[]>(() => {
    if (!statsData || !activityData || !wrapped) {
      return [];
    }

    const deep = statsData.insights.deepStats;
    const wrongTop = deep.wrongAttemptsTop[0];
    const topTopic = statsData.insights.topTopics[0];
    const busiestHeatDay = wrapped.bestDay;
    const hardest = deep.hardestSolved;
    const easiest = deep.easiestSolved;

    return [
      { title: 'Total Solved', value: `${combinedTotals?.totalProblemsAll ?? 0}`, sub: 'Across CF + CC + LC', tone: 'blue' },
      { title: 'GitHub Commits', value: `${activityData.totals.githubCommitsRecent}`, sub: 'Recent public push commits', tone: 'slate' },
      { title: 'Longest Active Streak', value: `${wrapped.streak} days`, sub: 'Consecutive tracked activity', tone: 'indigo' },
      { title: 'Best Activity Day', value: `${busiestHeatDay?.total ?? 0} actions`, sub: busiestHeatDay ? formatDateLabel(busiestHeatDay.date) : 'No day tracked', tone: 'orange' },
      { title: 'Most Solved Topic', value: `${topTopic?.topic ?? 'mixed'}`, sub: `${topTopic?.count ?? 0} solved problems`, tone: 'blue' },
      { title: 'Most Wrong Attempts', value: `${wrongTop?.wrongSubmissions ?? 0} attempts`, sub: wrongTop ? wrongTop.name : 'No wrong attempts found', tone: 'red' },
      { title: 'Biggest Rating Gain', value: `${deep.biggestGain.value >= 0 ? '+' : ''}${deep.biggestGain.value}`, sub: deep.biggestGain.contestName || `Contest #${deep.biggestGain.contestId}`, tone: 'blue' },
      { title: 'Biggest Rating Drop', value: `${deep.biggestDrop.value}`, sub: deep.biggestDrop.contestName || `Contest #${deep.biggestDrop.contestId}`, tone: 'red' },
      { title: 'Fastest Contest Solve', value: deep.fastestContestSolve ? `${deep.fastestContestSolve.minutesFromStart} min` : 'N/A', sub: deep.fastestContestSolve ? deep.fastestContestSolve.problem : 'Contest start-time data unavailable', tone: 'orange' },
      { title: 'Hardest Solved', value: hardest ? `${hardest.rating}` : 'N/A', sub: hardest ? hardest.name : 'No rated solved problem', tone: 'indigo' },
      { title: 'Easiest Solved', value: easiest ? `${easiest.rating}` : 'N/A', sub: easiest ? easiest.name : 'No rated solved problem', tone: 'blue' },
      { title: 'Active Days', value: `${wrapped.activeDays}`, sub: `Out of ${activityData.heatmap.windowDays} tracked days`, tone: 'slate' },
      { title: 'Total Tracked Actions', value: `${wrapped.totalActions}`, sub: 'Submissions + solves + commits + events', tone: 'red' },
    ];
  }, [statsData, activityData, wrapped, combinedTotals]);

  const onWrappedNext = () => {
    if (!wrappedCards.length) {
      return;
    }
    setWrappedIndex((prev) => (prev + 1) % wrappedCards.length);
  };

  const onWrappedPrev = () => {
    if (!wrappedCards.length) {
      return;
    }
    setWrappedIndex((prev) => (prev - 1 + wrappedCards.length) % wrappedCards.length);
  };

  const onWrappedTouchStart = (x: number) => {
    setTouchStartX(x);
  };

  const onWrappedTouchEnd = (x: number) => {
    if (touchStartX === null) {
      return;
    }

    const delta = x - touchStartX;
    if (delta <= -40) {
      onWrappedNext();
    } else if (delta >= 40) {
      onWrappedPrev();
    }
    setTouchStartX(null);
  };

  const maxHeatmapTotal = Math.max(activityData?.heatmap.maxDayTotal ?? 0, 1);

  const getHeatColor = (value: number): string => {
    const ratio = value / maxHeatmapTotal;
    if (value === 0) return 'bg-slate-900 border-slate-800';
    if (ratio < 0.25) return 'bg-blue-900/80 border-blue-700/60';
    if (ratio < 0.5) return 'bg-blue-700/90 border-blue-500/70';
    if (ratio < 0.75) return 'bg-red-700/90 border-red-500/70';
    return 'bg-red-500 border-red-300';
  };

  const getDifficultyColor = (rating: number): string => {
    if (rating < 1200) return 'from-gray-500 to-gray-700';
    if (rating < 1400) return 'from-green-500 to-green-700';
    if (rating < 1600) return 'from-blue-500 to-blue-700';
    if (rating < 1800) return 'from-indigo-500 to-indigo-700';
    return 'from-red-500 to-red-700';
  };

  if (loading) {
    return (
      <section id="cp-stats" className="py-20 bg-black min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="border border-blue-500/30 bg-slate-950/60 rounded-xl p-12 text-center text-gray-300">
            <p className="text-lg">Loading cross-platform activity...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !statsData || !activityData) {
    return (
      <section id="cp-stats" className="py-20 bg-black min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-12 text-center text-red-200">
            <p className="text-lg">{error || 'Unable to load stats'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cp-stats" className="py-20 bg-black min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-14 slide-in-top">
          <h2 className="text-5xl md:text-6xl font-bold blue-text mb-4">COMPETITIVE PROGRAMMING</h2>
          <p className="text-gray-400 text-lg">Unified coding activity across Codeforces, CodeChef, LeetCode, CSES, and GitHub</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <a
            href={`https://codeforces.com/profile/${CF_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-blue-950/40 to-black border border-blue-500/60 rounded-xl p-6 hover:border-blue-300 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Codeforces</h3>
              <CFLogo />
            </div>
            <p className="text-sm text-gray-400">Rating</p>
            <p className="text-2xl font-bold text-blue-300">{statsData.profile.rating}</p>
            <p className="text-sm text-gray-400 mt-1">Max {statsData.profile.maxRating}</p>
            <p className="text-sm text-gray-400">Solved {statsData.stats.solvedTotal}</p>
          </a>

          <a
            href={`https://www.codechef.com/users/${CC_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-red-950/40 to-black border border-red-500/60 rounded-xl p-6 hover:border-red-300 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">CodeChef</h3>
              <CCLogo />
            </div>
            <p className="text-sm text-gray-400">Rating</p>
            <p className="text-2xl font-bold text-red-300">{statsData.codechef?.rating ?? 0}</p>
            <p className="text-sm text-gray-400 mt-1">Max {statsData.codechef?.highestRating ?? 0}</p>
            <p className="text-sm text-gray-400">Solved {statsData.codechef?.totalProblemsSolved ?? 0}</p>
          </a>

          <a
            href={`https://leetcode.com/${LC_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-orange-950/40 to-black border border-orange-500/60 rounded-xl p-6 hover:border-orange-300 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">LeetCode</h3>
              <LCLogo />
            </div>
            <p className="text-sm text-gray-400">Total Solved</p>
            <p className="text-2xl font-bold text-orange-300">{activityData.totals.leetcodeSolved}</p>
            <p className="text-xs text-gray-400 mt-1">
              E {activityData.totals.leetcodeEasySolved} | M {activityData.totals.leetcodeMediumSolved} | H {activityData.totals.leetcodeHardSolved}
            </p>
          </a>

          <a
            href={`https://github.com/${GH_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-slate-900 to-black border border-slate-500/60 rounded-xl p-6 hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">GitHub</h3>
              <GHLogo />
            </div>
            <p className="text-sm text-gray-400">Commits (recent)</p>
            <p className="text-2xl font-bold text-white">{activityData.totals.githubCommitsRecent}</p>
            <p className="text-xs text-gray-400 mt-1">Repos {activityData.github.publicRepos} | Followers {activityData.github.followers}</p>
          </a>
        </div>

        {combinedTotals && (
          <div className="bg-gradient-to-r from-blue-950/30 to-red-950/30 border border-blue-500/40 rounded-xl p-7 mb-10">
            <h3 className="text-2xl font-bold text-white mb-5">Combined Totals</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 uppercase">All Solved</p>
                <p className="text-3xl font-bold text-blue-300">{combinedTotals.totalProblemsAll}</p>
              </div>
              <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 uppercase">CF</p>
                <p className="text-2xl font-bold text-blue-300">{combinedTotals.codeforces}</p>
              </div>
              <div className="bg-black/40 border border-red-500/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 uppercase">CC</p>
                <p className="text-2xl font-bold text-red-300">{combinedTotals.codechef}</p>
              </div>
              <div className="bg-black/40 border border-orange-500/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 uppercase">LC</p>
                <p className="text-2xl font-bold text-orange-300">{combinedTotals.leetcode}</p>
              </div>
              <div className="bg-black/40 border border-slate-500/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 uppercase">GH Commits</p>
                <p className="text-2xl font-bold text-white">{combinedTotals.githubCommitsRecent}</p>
              </div>
              <div className="bg-black/40 border border-indigo-500/30 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 uppercase">CSES Activity</p>
                <p className="text-2xl font-bold text-indigo-300">{combinedTotals.csesActivity}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/35 rounded-xl p-7 mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
            <div>
              <h3 className="text-2xl font-bold text-white">Topic Analysis + Community Practice Sheet</h3>
              <p className="text-sm text-gray-400">Most-solved topics from your accepted problem set, plus a curated sheet for others to practice.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-gray-300 border border-blue-500/30 rounded px-2 py-1">
                X per rating
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={problemsPerRating}
                  onChange={(e) => setProblemsPerRating(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                  className="ml-2 w-12 bg-transparent border border-blue-500/30 rounded px-1 py-0.5 text-white"
                />
              </label>
              <button
                type="button"
                onClick={downloadPracticeSheetCsv}
                className="px-4 py-2 text-sm rounded border border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-black transition"
              >
                Download Sheet CSV
              </button>
              <button
                type="button"
                onClick={downloadPracticeSheetMarkdown}
                className="px-4 py-2 text-sm rounded border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-black transition"
              >
                Download Sheet MD
              </button>
              <button
                type="button"
                onClick={generateRatingBucketPdf}
                className="px-4 py-2 text-sm rounded border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500 hover:text-black transition"
              >
                Generate PDF (800+)
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-black/40 border border-blue-500/25 rounded-lg p-4">
              <p className="text-sm text-blue-300 mb-3">Top Problem-Solving Topics</p>
              <div className="flex flex-wrap gap-2">
                {statsData.insights.topTopics.map((topic) => (
                  <span key={topic.topic} className="text-xs bg-blue-500/10 border border-blue-500/30 text-blue-200 px-3 py-1 rounded">
                    {topic.topic} ({topic.count})
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/40 border border-red-500/25 rounded-lg p-4">
              <p className="text-sm text-red-300 mb-3">Recommended Practice Picks ({recommendedSheet.length})</p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                {recommendedSheet.slice(0, 8).map((item) => (
                  <a
                    key={item.key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-gray-200 hover:text-white border border-transparent hover:border-red-500/30 rounded px-2 py-1 transition"
                  >
                    {item.name} - {item.rating}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {wrapped && wrappedCards.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-red-950/40 border border-indigo-500/40 rounded-xl p-8 mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Suryansh CP Wrapped</h3>
            <p className="text-sm text-gray-300 mb-4">Swipe right for next card. 15 cards with deep CP + GitHub facts.</p>

            <div
              className={`bg-gradient-to-br ${toneClasses(wrappedCards[wrappedIndex].tone)} border rounded-xl p-6 md:p-8 min-h-[220px] transition-all`}
              onTouchStart={(e) => onWrappedTouchStart(e.touches[0]?.clientX ?? 0)}
              onTouchEnd={(e) => onWrappedTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
            >
              <p className="text-xs uppercase tracking-wider opacity-80 mb-3">Card {wrappedIndex + 1} / {wrappedCards.length}</p>
              <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">{wrappedCards[wrappedIndex].title}</h4>
              <p className="text-4xl md:text-5xl font-extrabold text-white mb-3">{wrappedCards[wrappedIndex].value}</p>
              <p className="text-sm md:text-base text-gray-200">{wrappedCards[wrappedIndex].sub}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={onWrappedPrev}
                className="px-4 py-2 text-sm rounded border border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-black transition"
              >
                Prev
              </button>
              <div className="flex flex-wrap justify-center gap-1 px-2">
                {wrappedCards.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === wrappedIndex ? 'bg-blue-300' : 'bg-slate-600'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={onWrappedNext}
                className="px-4 py-2 text-sm rounded border border-red-500/40 text-red-300 hover:bg-red-500 hover:text-black transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/35 rounded-xl p-7 mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-2xl font-bold text-white">Unified Daily Activity Heatmap</h3>
              <p className="text-sm text-gray-400">Hover any day for submissions, solved problems, commits, and events</p>
            </div>
            <p className="text-xs text-blue-300">Window: last {activityData.heatmap.windowDays} days</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
              {activityData.heatmap.days.map((day) => {
                const activityLines = buildDayActivityLines(day);
                const title = [
                  formatDateLabel(day.date),
                  `Total activity: ${day.total}`,
                  ...(activityLines.length ? activityLines : ['No tracked activity']),
                ].join('\n');

                return (
                  <button
                    key={day.date}
                    type="button"
                    title={title}
                    onMouseEnter={() => setHoveredDay(day)}
                    onFocus={() => setHoveredDay(day)}
                    className={`w-3.5 h-3.5 rounded-sm border ${getHeatColor(day.total)} transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-blue-300`}
                    aria-label={`Activity on ${day.date}`}
                  />
                );
              })}
            </div>
          </div>

          {hoveredDay && (
            <div className="mt-6 bg-black/45 border border-blue-500/25 rounded-lg p-4">
              <p className="text-sm text-blue-300 font-semibold mb-2">{formatDateLabel(hoveredDay.date)} - Total {hoveredDay.total}</p>
              {buildDayActivityLines(hoveredDay).length > 0 ? (
                <div className="grid md:grid-cols-3 gap-2 text-xs text-gray-300">
                  {buildDayActivityLines(hoveredDay).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No tracked activity on this day.</p>
              )}
            </div>
          )}

        </div>

        <div className="bg-gradient-to-br from-blue-950/30 to-black border border-blue-500/40 rounded-xl p-8 mb-10">
          <h3 className="text-2xl font-bold text-white mb-2">Codeforces Rating Progression</h3>
          <p className="text-gray-400 text-sm mb-5">All rated contests ({statsData.recentRatingTrend.length})</p>
          <svg viewBox="0 0 640 220" className="w-full h-60 rounded bg-black/40 border border-blue-500/20">
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path d={cfRatingPath} fill="none" stroke="url(#ratingGradient)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="bg-gradient-to-br from-red-950/30 to-black border border-red-500/40 rounded-xl p-8 mb-10">
          <h3 className="text-2xl font-bold text-white mb-2">CodeChef Rating Progression</h3>
          <p className="text-gray-400 text-sm mb-5">
            {statsData.codechef?.ratingTrend?.length
              ? `All tracked contests (${statsData.codechef.ratingTrend.length})`
              : 'No historical contest rating data available right now'}
          </p>
          <svg viewBox="0 0 640 220" className="w-full h-60 rounded bg-black/40 border border-red-500/20">
            <defs>
              <linearGradient id="codechefRatingGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            {codechefRatingPath ? (
              <path d={codechefRatingPath} fill="none" stroke="url(#codechefRatingGradient)" strokeWidth="4" strokeLinecap="round" />
            ) : (
              <text x="320" y="120" textAnchor="middle" className="fill-gray-400 text-sm">No CodeChef rating history found.</text>
            )}
          </svg>
        </div>

        <div className="bg-gradient-to-br from-blue-950/30 to-black border border-blue-500/40 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-2">Codeforces Problems by Rating</h3>
          <p className="text-gray-400 text-sm mb-6">Detailed distribution across difficulty levels</p>
          <div className="h-72 flex items-end gap-2 overflow-x-auto pb-4 px-2">
            {statsData.solvedByRating.map((bucket) => {
              const heightPercent = (bucket.solved / maxSolvedBucket) * 100;
              return (
                <div key={bucket.rating} className="min-w-[46px] h-full flex flex-col justify-end items-center group">
                  <p className="text-xs text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition">{bucket.solved}</p>
                  <div
                    className={`w-full rounded-t bg-gradient-to-t ${getDifficultyColor(bucket.rating)} shadow-[0_0_16px_rgba(59,130,246,0.4)] transition hover:scale-y-[1.02]`}
                    style={{ height: `${Math.max(heightPercent, 3)}%` }}
                    title={`${bucket.rating}: ${bucket.solved} solved`}
                  />
                  <p className="text-xs text-gray-400 mt-2">{bucket.rating}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
