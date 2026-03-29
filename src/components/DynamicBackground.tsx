'use client';

const cpSymbols = [
  { text: 'O(log n)', left: '8%', delay: '0s', duration: '16s', size: 'text-sm', color: 'text-blue-300/70' },
  { text: 'dp[i][j]', left: '22%', delay: '2s', duration: '19s', size: 'text-base', color: 'text-red-300/60' },
  { text: '#include', left: '35%', delay: '4s', duration: '15s', size: 'text-sm', color: 'text-blue-200/70' },
  { text: 'while(t--)', left: '48%', delay: '1s', duration: '20s', size: 'text-base', color: 'text-red-200/60' },
  { text: '{ } [ ]', left: '60%', delay: '5s', duration: '17s', size: 'text-lg', color: 'text-blue-300/70' },
  { text: '< / >', left: '73%', delay: '3s', duration: '18s', size: 'text-lg', color: 'text-red-300/60' },
  { text: 'binary_search()', left: '86%', delay: '6s', duration: '21s', size: 'text-sm', color: 'text-blue-200/70' },
];

const nodes = [
  { left: '14%', top: '18%', delay: '0s' },
  { left: '32%', top: '28%', delay: '1.1s' },
  { left: '52%', top: '20%', delay: '2.4s' },
  { left: '70%', top: '30%', delay: '0.7s' },
  { left: '84%', top: '16%', delay: '1.8s' },
];

export default function DynamicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="cp-bg-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_75%_75%,rgba(239,68,68,0.16),transparent_42%)]" />

      {cpSymbols.map((symbol) => (
        <span
          key={symbol.text + symbol.left}
          className={`cp-bg-symbol ${symbol.size} ${symbol.color}`}
          style={{
            left: symbol.left,
            animationDelay: symbol.delay,
            animationDuration: symbol.duration,
          }}
        >
          {symbol.text}
        </span>
      ))}

      {nodes.map((node) => (
        <span
          key={node.left + node.top}
          className="cp-bg-node"
          style={{
            left: node.left,
            top: node.top,
            animationDelay: node.delay,
          }}
        />
      ))}
    </div>
  );
}
