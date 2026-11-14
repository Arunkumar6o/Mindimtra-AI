import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle2
} from 'lucide-react';
import { 
  getCommunityPosts, 
  addCommunityPost, 
  reactToCommunityPost, 
  type CommunityPostRecord 
} from '../../../services/sanctuaryDbService';

export const CommunitySection: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPostRecord[]>([]);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [authorAlias, setAuthorAlias] = useState<string>('MindfulFriend');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tag, setTag] = useState<string>('Encouragement');
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    getCommunityPosts().then(p => setPosts(p));
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;

    const updated = await addCommunityPost({
      authorAlias,
      title,
      content,
      tag
    });
    setPosts(updated);
    setTitle('');
    setContent('');
    setShowShareModal(false);
    setToastMsg('Your reflection has been anonymously shared with the community!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleReact = async (postId: string, reaction: 'warmth' | 'support' | 'gratitude') => {
    const updated = await reactToCommunityPost(postId, reaction);
    setPosts(updated);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f2f7f9] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>Anonymous Peer Sanctuary</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            You Are Never Alone in This
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            A safe, non-judgmental space to read uplifting reflections, share your own journey anonymously, and exchange heartfelt support.
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Share a Reflection</span>
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#d8e8dc] text-[#1B4332] text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Community Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div
            key={post.id}
            className="p-6 bg-white rounded-3xl border border-[#e5ebe6] shadow-sm space-y-3 transition-all hover:border-[#2D6A4F]/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2D6A4F] flex items-center justify-center font-bold text-xs shadow-xs">
                  {post.author_alias[0]}
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">{post.author_alias}</span>
                  <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                #{post.tag}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#1B4332]">{post.title}</h3>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {post.content}
            </p>

            {/* Reactions Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleReact(post.id, 'warmth')}
                className="px-3 py-1.5 rounded-xl bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>❤️ Send Warmth</span>
                <span className="font-extrabold">({post.reactions.warmth})</span>
              </button>

              <button
                onClick={() => handleReact(post.id, 'support')}
                className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#D8F3DC] text-[#2D6A4F] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🤝 You're Not Alone</span>
                <span className="font-extrabold">({post.reactions.support})</span>
              </button>

              <button
                onClick={() => handleReact(post.id, 'gratitude')}
                className="px-3 py-1.5 rounded-xl bg-[#F3E5F5] hover:bg-[#E1BEE7] text-[#7B1FA2] text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🙏 Gratitude</span>
                <span className="font-extrabold">({post.reactions.gratitude})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#1B4332]">Share an Anonymous Reflection</h3>
            <p className="text-xs text-slate-500">
              Your identity is protected. All private information (like phone numbers or emails) is automatically sanitized.
            </p>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Author Alias</label>
                <input
                  type="text"
                  value={authorAlias}
                  onChange={e => setAuthorAlias(e.target.value)}
                  placeholder="e.g. PeacefulRiver, CalmBreeze"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reflection Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Small steps make all the difference"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category / Tag</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F]"
                >
                  <option value="Daily Encouragement">Daily Encouragement</option>
                  <option value="Burnout Relief">Burnout Relief</option>
                  <option value="Sleep & Night Calm">Sleep & Night Calm</option>
                  <option value="Anxiety Support">Anxiety Support</option>
                  <option value="Mindfulness Practice">Mindfulness Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Story or Words of Comfort</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What helped you get through a tough time? What encouragement would you share with someone having a difficult day?"
                  className="w-full p-3 rounded-xl bg-[#fafcfb] border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#2D6A4F] resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Publish Anonymously
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunitySection;
