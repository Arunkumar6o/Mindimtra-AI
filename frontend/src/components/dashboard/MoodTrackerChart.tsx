import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface MoodPoint {
  day: string;
  moodLevel: number; // 4: Happy, 3: Calm, 2: Low, 1: Stressed
  label: string;
  emoji: string;
  note: string;
}

export const MoodTrackerChart: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const [activePoint, setActivePoint] = useState<number>(6); // Default Sunday

  const moodData: MoodPoint[] = [
    { day: 'Mon', moodLevel: 2.2, label: 'Low', emoji: '😔', note: 'Felt overwhelmed at work' },
    { day: 'Tue', moodLevel: 2.8, label: 'Calm', emoji: '🙂', note: 'Took a evening walk in park' },
    { day: 'Wed', moodLevel: 2.4, label: 'Low', emoji: '😔', note: 'Mid-week fatigue' },
    { day: 'Thu', moodLevel: 2.7, label: 'Calm', emoji: '🙂', note: 'Mindfulness breathing session' },
    { day: 'Fri', moodLevel: 2.6, label: 'Calm', emoji: '🙂', note: 'Finished project tasks early' },
    { day: 'Sat', moodLevel: 3.4, label: 'Happy', emoji: '😄', note: 'Spent time with family' },
    { day: 'Sun', moodLevel: 3.8, label: 'Happy', emoji: '😄', note: 'Feeling rested and optimistic' }
  ];

  // SVG dimensions for smooth bezier curve rendering
  const width = 360;
  const height = 140;
  const paddingX = 25;
  const paddingY = 20;

  const getCoords = (index: number, level: number) => {
    const x = paddingX + (index / (moodData.length - 1)) * (width - 2 * paddingX);
    // level 4 -> top (paddingY), level 1 -> bottom (height - paddingY)
    const y = height - paddingY - ((level - 1) / 3) * (height - 2 * paddingY);
    return { x, y };
  };

  // Build SVG path data for smooth bezier curve
  const points = moodData.map((pt, i) => getCoords(i, pt.moodLevel));
  const svgPath = points.reduce((acc, pt, i, a) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = a[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e5ebe6] shadow-xs space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1B4332]">Mood Tracker</h2>
          <p className="text-xs text-slate-500 font-medium">See your emotional journey</p>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="appearance-none bg-[#f4f7f5] border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1.5 pr-7 rounded-xl focus:outline-none focus:border-[#2D6A4F] cursor-pointer"
          >
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="relative flex items-center pt-2">
        
        {/* Y-Axis Emoji Markers */}
        <div className="flex flex-col justify-between h-[140px] pr-3 text-sm shrink-0 select-none">
          <span title="Happy">😄</span>
          <span title="Calm">🙂</span>
          <span title="Low">😔</span>
          <span title="Stressed">😡</span>
        </div>

        {/* Graph SVG & Interactivity Area */}
        <div className="relative flex-1">
          
          {/* Sunday Active Tooltip Badge */}
          {activePoint !== null && (
            <div 
              className="absolute -top-7 transition-all duration-300 transform -translate-x-1/2 z-20"
              style={{ left: `${(activePoint / (moodData.length - 1)) * 100}%` }}
            >
              <div className="bg-[#2D6A4F] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Feeling better than last week! 🎉</span>
              </div>
              <div className="w-2 h-2 bg-[#2D6A4F] rotate-45 mx-auto -mt-1" />
            </div>
          )}

          {/* Chart Canvas */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[140px] overflow-visible">
            
            {/* Horizontal Grid lines */}
            {[1, 2, 3, 4].map((level) => {
              const y = height - paddingY - ((level - 1) / 3) * (height - 2 * paddingY);
              return (
                <line
                  key={level}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e2e8e4"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Gradient Fill under Curve */}
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${svgPath} L ${width - paddingX},${height} L ${paddingX},${height} Z`}
              fill="url(#moodGradient)"
            />

            {/* Main Smooth Line */}
            <path
              d={svgPath}
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Data Point Dots */}
            {points.map((pt, idx) => (
              <g key={idx} className="cursor-pointer" onClick={() => setActivePoint(idx)}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint === idx ? '6' : '4'}
                  fill={activePoint === idx ? '#2D6A4F' : '#ffffff'}
                  stroke="#2D6A4F"
                  strokeWidth="2.5"
                  className="transition-all hover:scale-125"
                />
              </g>
            ))}
          </svg>

          {/* X-Axis Day Labels */}
          <div className="flex justify-between px-2 pt-1 border-t border-slate-100 text-xs font-semibold text-slate-500">
            {moodData.map((pt, idx) => (
              <button
                key={pt.day}
                onClick={() => setActivePoint(idx)}
                className={`transition-colors cursor-pointer ${
                  activePoint === idx ? 'text-[#2D6A4F] font-bold' : 'hover:text-slate-800'
                }`}
              >
                {pt.day}
              </button>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
