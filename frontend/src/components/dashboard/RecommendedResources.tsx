import React, { useState } from 'react';
import { Play, FileText, Video, X } from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  type: 'Audio' | 'Article' | 'Video';
  duration: string;
  image: string;
  description: string;
}

interface RecommendedResourcesProps {
  onSeeAll?: () => void;
}

export const RecommendedResources: React.FC<RecommendedResourcesProps> = ({ onSeeAll }) => {
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const resources: ResourceItem[] = [
    {
      id: '1',
      title: '5-Minute Morning Meditation',
      type: 'Audio',
      duration: '5 min',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
      description: 'Start your day with quiet focus and gentle breath awareness to build calm resilience.'
    },
    {
      id: '2',
      title: 'Gratitude Journaling Prompts',
      type: 'Article',
      duration: '3 min',
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=600&auto=format&fit=crop',
      description: 'Explore 5 simple prompts to cultivate daily thankfulness and positive emotional reflection.'
    },
    {
      id: '3',
      title: 'Managing Anxiety in Daily Life',
      type: 'Video',
      duration: '8 min',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      description: 'Practical grounding techniques to reduce anxiety spikes during busy work routines.'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e5ebe6] shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#1B4332]">Recommended for You</h3>
          <p className="text-xs text-slate-500 font-medium">Personalized resources to support your journey</p>
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#1976D2] hover:underline cursor-pointer"
        >
          See All
        </button>
      </div>

      {/* 3 Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {resources.map((res) => (
          <div
            key={res.id}
            onClick={() => setSelectedResource(res)}
            className="group rounded-2xl overflow-hidden border border-slate-100 hover:border-[#2D6A4F]/40 transition-all cursor-pointer bg-[#fafcfb] hover:shadow-md flex flex-col justify-between"
          >
            {/* Thumbnail Image Container */}
            <div className="relative h-32 w-full overflow-hidden bg-slate-200">
              <img
                src={res.image}
                alt={res.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />

              {/* Media Type Icon Badge */}
              <div className="absolute bottom-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-800 shadow-sm group-hover:bg-[#2D6A4F] group-hover:text-white transition-colors">
                {res.type === 'Audio' && <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                {res.type === 'Article' && <FileText className="w-3.5 h-3.5" />}
                {res.type === 'Video' && <Video className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#2D6A4F] transition-colors leading-snug">
                {res.title}
              </h4>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span>{res.type}</span>
                <span>•</span>
                <span>{res.duration}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Resource Modal Preview */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden border border-emerald-100 shadow-2xl space-y-4 pb-6">
            
            <div className="relative h-48 w-full bg-slate-900">
              <img
                src={selectedResource.image}
                alt={selectedResource.title}
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute top-4 right-4 p-2 text-white bg-slate-950/60 hover:bg-slate-950 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2D6A4F] text-xs font-bold">
                <span>{selectedResource.type}</span>
                <span>•</span>
                <span>{selectedResource.duration}</span>
              </div>

              <h3 className="text-lg font-bold text-[#1B4332]">
                {selectedResource.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedResource.description}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedResource(null)}
                  className="w-full py-3 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Start {selectedResource.type} Session
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
