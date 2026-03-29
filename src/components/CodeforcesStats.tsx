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

type MonthlySolvedPoint = {
  month: string;
  solved: number;
};

type StatsPayload = {
  handle: string;
  profile: {
    rank: string;
    rating: number;
    maxRank: string;
    maxRating: number;
    organization: string;
    country: string;
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
  monthlySolvedTrend: MonthlySolvedPoint[];
  recentRatingTrend: TrendPoint[];
  codechef: {
    handle: string;
    rating: number;
    highestRating: number;
    globalRank: number;
    countryRank: number;
    totalProblemsSolved: number;
    contestsParticipated: number;
    latestContestGlobalRank: number;
  } | null;
  cses: {
    profile: string;
    submissionCount: number;
    firstSubmission: string;
    lastSubmission: string;
  } | null;
  lastUpdatedAt: string;
};

const HANDLE = 'suryansh1706';

export default function CodeforcesStats() {
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/codeforces?handle=${HANDLE}`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('fetch_failed');
        }

        const payload = (await response.json()) as StatsPayload;
        if (isMounted) {
          setData(payload);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load live Codeforces stats right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const maxSolved = useMemo(() => {
    if (!data?.solvedByRating?.length) {
      return 1;
    }

    return Math.max(...data.solvedByRating.map((item) => item.solved), 1);
  }, [data]);

  const monthlyMaxSolved = useMemo(() => {
    if (!data?.monthlySolvedTrend?.length) {
      return 1;
    }
    return Math.max(...data.monthlySolvedTrend.map((item) => item.solved), 1);
  }, [data]);

  const ratingPath = useMemo(() => {
    if (!data?.recentRatingTrend?.length) {
      return '';
    }

    const width = 640;
    const height = 220;
    const padding = 24;
    const ratings = data.recentRatingTrend.map((item) => item.rating);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const range = Math.max(maxRating - minRating, 1);

    return data.recentRatingTrend
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.recentRatingTrend.length - 1, 1);
        const y = height - padding - ((item.rating - minRating) / range) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }, [data]);

  const overallAnalytics = useMemo(() => {
    if (!data) {
      return null;
    }

    const cfSolved = data.stats.solvedTotal;
    const cfContests = data.stats.contestsPlayed;
    const ccSolved = data.codechef?.totalProblemsSolved ?? 0;
    const ccContests = data.codechef?.contestsParticipated ?? 0;
    const csesSubmissions = data.cses?.submissionCount ?? 0;

    const activePlatforms = [
      true,
      Boolean(data.codechef),
      Boolean(data.cses),
    ].filter(Boolean).length;

    return {
      activePlatforms,
      totalProblemActivity: cfSolved + ccSolved + csesSubmissions,
      totalContestVolume: cfContests + ccContests,
      bestRatingSnapshot: Math.max(data.profile.maxRating, data.codechef?.highestRating ?? 0),
    };
  }, [data]);

  return (
    <section id="codeforces" className="py-20 bg-black min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-12 slide-in-top">
          <h2 className="text-5xl md:text-6xl font-bold blue-text mb-4">COMPETITIVE STATS</h2>
          <p className="text-gray-400 text-lg">Only high-impact competitive programming stats</p>
          <p className="text-blue-300/90 text-sm mt-2">Sources: Codeforces API, CodeChef profile data, CSES profile stats</p>
        </div>

        {loading && (
          <div className="border border-blue-500/30 bg-slate-950/60 rounded-xl p-8 text-center text-gray-300">
            Loading live stats from Codeforces, CodeChef, and CSES...
          </div>
        )}

        {!loading && error && (
          <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-8 text-center text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/25 rounded-xl p-5 hover-lift">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Codeforces Max Rating</p>
                <p className="text-3xl font-bold text-white mt-2">{data.profile.maxRating}</p>
                <p className="text-blue-300 text-sm mt-1 capitalize">{data.profile.maxRank} · Codeforces</p>
              </div>
              <div className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/25 rounded-xl p-5 hover-lift">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Best CF Contest Rank</p>
                <p className="text-3xl font-bold text-white mt-2">#{data.stats.bestContestRank}</p>
                <p className="text-blue-300 text-sm mt-1">Across {data.stats.contestsPlayed} rated contests · Codeforces</p>
              </div>
              <div className="bg-gradient-to-br from-slate-950 to-black border border-red-500/25 rounded-xl p-5 hover-lift">
                <p className="text-gray-400 text-xs uppercase tracking-wide">CodeChef Contest Peak</p>
                <p className="text-3xl font-bold text-white mt-2">#22</p>
                <p className="text-red-300 text-sm mt-1">Global Rank 22 in a contest · CodeChef</p>
              </div>
              <div className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/25 rounded-xl p-5 hover-lift">
                <p className="text-gray-400 text-xs uppercase tracking-wide">CSES Submissions</p>
                <p className="text-3xl font-bold text-white mt-2">{data.cses?.submissionCount ?? 0}</p>
                <p className="text-blue-300 text-sm mt-1">CSES problem-set activity · CSES</p>
              </div>
            </div>

            {overallAnalytics && (
              <div className="bg-gradient-to-r from-slate-950 to-black border border-blue-500/20 rounded-xl p-6 md:p-8 hover-glow mb-8">
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Overall Analytics</h3>
                  <p className="text-gray-400 text-sm">Combined snapshot from Codeforces, CodeChef, and CSES</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Connected Platforms</p>
                    <p className="text-3xl font-bold text-white mt-2">{overallAnalytics.activePlatforms}/3</p>
                    <p className="text-blue-300 text-sm mt-1">Codeforces + CodeChef + CSES</p>
                  </div>

                  <div className="bg-black/40 border border-red-500/20 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Total Problem Activity</p>
                    <p className="text-3xl font-bold text-white mt-2">{overallAnalytics.totalProblemActivity}</p>
                    <p className="text-red-300 text-sm mt-1">Codeforces + CodeChef + CSES problem activity</p>
                  </div>

                  <div className="bg-black/40 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Best Rating Snapshot</p>
                    <p className="text-3xl font-bold text-white mt-2">{overallAnalytics.bestRatingSnapshot}</p>
                    <p className="text-blue-300 text-sm mt-1">Best of Codeforces max / CodeChef highest</p>
                  </div>
                </div>
              </div>
            )}

            {!data.cses && (
              <div className="mb-8 border border-blue-500/20 rounded-lg p-4 bg-blue-500/5 text-sm text-blue-200">
                CSES stats are ready to plug in, but CSES does not expose a direct username lookup endpoint. Share your numeric CSES profile URL (format: /user/id), and I will wire it instantly.
              </div>
            )}

            <div className="bg-gradient-to-r from-slate-950 to-black border border-blue-500/20 rounded-xl p-6 md:p-8 hover-glow">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Problems Solved by Rating</h3>
                  <p className="text-gray-400 text-sm">Dynamic distribution generated from your accepted submissions (Codeforces)</p>
                </div>
                <a
                  href={`https://codeforces.com/profile/${HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded border border-blue-500/40 text-blue-300 hover:bg-blue-500 hover:text-black transition font-semibold"
                >
                  View Codeforces Profile
                </a>
              </div>

              <div className="h-72 flex items-end gap-2 md:gap-3 overflow-x-auto pb-2">
                {data.solvedByRating.map((bucket) => {
                  const heightPercent = (bucket.solved / maxSolved) * 100;
                  const gradient =
                    bucket.rating < 1200
                      ? 'from-slate-300 to-slate-500'
                      : bucket.rating < 1400
                        ? 'from-green-300 to-green-500'
                        : bucket.rating < 1600
                          ? 'from-cyan-300 to-cyan-500'
                          : bucket.rating < 1800
                            ? 'from-indigo-300 to-indigo-500'
                            : 'from-fuchsia-300 to-fuchsia-500';

                  return (
                    <div key={bucket.rating} className="min-w-[52px] h-full flex flex-col justify-end items-center group">
                      <p className="text-[11px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition">{bucket.solved}</p>
                      <div
                        className={`w-10 md:w-12 rounded-t bg-gradient-to-t ${gradient} shadow-[0_0_18px_rgba(59,130,246,0.35)] transition-all duration-700`}
                        style={{ height: `${Math.max(heightPercent, 3)}%` }}
                      />
                      <p className="text-xs text-gray-400 mt-2">{bucket.rating}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 border-t border-blue-500/20 pt-4">
                <p className="text-gray-400 text-sm">Showing only strongest indicators and distribution trends. Sources are labeled per stat card.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-r from-slate-950 to-black border border-red-500/20 rounded-xl p-6 hover-glow">
                <h3 className="text-2xl font-bold text-white mb-2">Codeforces Rating Trend</h3>
                <p className="text-gray-400 text-sm mb-4">Last 20 rated contests (Codeforces)</p>
                <svg viewBox="0 0 640 220" className="w-full h-56 rounded bg-black/30 border border-red-500/20">
                  <defs>
                    <linearGradient id="ratingLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <path d={ratingPath} fill="none" stroke="url(#ratingLineGradient)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>

              <div className="bg-gradient-to-r from-slate-950 to-black border border-blue-500/20 rounded-xl p-6 hover-glow">
                <h3 className="text-2xl font-bold text-white mb-2">Monthly Solve Momentum</h3>
                <p className="text-gray-400 text-sm mb-4">Unique accepted problems over last 8 months (Codeforces)</p>
                <div className="h-56 flex items-end gap-2 rounded bg-black/30 border border-blue-500/20 p-4">
                  {data.monthlySolvedTrend.map((point) => {
                    const height = Math.max((point.solved / monthlyMaxSolved) * 100, 4);
                    return (
                      <div key={point.month} className="flex-1 min-w-0 flex flex-col items-center justify-end">
                        <span className="text-[11px] text-gray-400 mb-1">{point.solved}</span>
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-blue-500 to-red-500 transition-all duration-700"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[11px] text-gray-400 mt-2">{point.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
