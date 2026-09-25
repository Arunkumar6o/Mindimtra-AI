import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface WellnessItem {
  id: string;
  label: string;
  completed: boolean;
}

export const TodayWellness: React.FC = () => {
  const [items, setItems] = useState<WellnessItem[]>([
    { id: '1', label: 'Mindful breathing (5 min)', completed: true },
    { id: '2', label: 'Journal your thoughts', completed: true },
    { id: '3', label: 'Drink water', completed: false },
    { id: '4', label: 'Be kind to yourself', completed: false }
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  // SVG parameters for circular progress ring
  const strokeWidth = 8;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e5ebe6] shadow-xs space-y-4 flex flex-col justify-between h-full">
      
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-[#1B4332]">Today's Wellness</h2>
        <p className="text-xs text-slate-500 font-medium">Daily self-care habits</p>
      </div>

      {/* Progress Ring & Checklist Content */}
      <div className="flex items-center gap-5">
        
        {/* SVG Circular Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background Track Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#e2e8e4"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#2D6A4F"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-lg font-black text-[#1B4332]">{progressPercent}%</span>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight">Daily Goals</span>
          </div>
        </div>

        {/* Interactive Checklist List */}
        <div className="flex-1 space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              {/* Checkbox box */}
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                  item.completed
                    ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
                    : 'border-slate-300 bg-white group-hover:border-[#2D6A4F]'
                }`}
              >
                {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors select-none ${
                  item.completed
                    ? 'text-slate-800 line-through decoration-slate-300'
                    : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
