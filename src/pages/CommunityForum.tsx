import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, ThumbsUp, Eye, CheckCircle,
  Plus, Clock, Tag, User, MessageCircle,
  Award, Users, BookOpen
} from 'lucide-react';
import { forumTopics } from '@/data/notes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const categories = ['all', 'Criminal Law', 'Civil Law', 'Constitutional Law', 'Corporate Law', 'Career', 'General'];

export default function CommunityForum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest');

  const filteredTopics = forumTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'popular') return b.views - a.views;
    if (sortBy === 'unanswered') return a.replies.length - b.replies.length;
    return 0;
  });

  const solvedTopics = forumTopics.filter(t => t.isSolved).length;
  const totalReplies = forumTopics.reduce((acc, t) => acc + t.replies.length, 0);

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6B1E2E]/5 via-parchment to-[#C9A84C]/5" />
        
        {/* Floating 3D Elements */}
        <div className="absolute top-40 right-10 w-32 h-32 opacity-20 animate-float">
          <Users className="w-full h-full text-[#6B1E2E]" />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 opacity-20 animate-float-delayed">
          <MessageSquare className="w-full h-full text-[#C9A84C]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1E2E]/10 rounded-full mb-6">
              <Users className="w-4 h-4 text-[#6B1E2E]" />
              <span className="font-ui text-sm text-[#6B1E2E]">Join the Discussion</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
              Community <span className="text-[#C9A84C]">Forum</span>
            </h1>
            
            <p className="font-body text-lg text-mutedgray mb-8">
              Connect with fellow law students and legal professionals. 
              Ask questions, share knowledge, and grow together.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">{forumTopics.length}+</div>
                <div className="font-ui text-sm text-mutedgray">Topics</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">{totalReplies}</div>
                <div className="font-ui text-sm text-mutedgray">Replies</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">{solvedTopics}</div>
                <div className="font-ui text-sm text-mutedgray">Solved</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">500+</div>
                <div className="font-ui text-sm text-mutedgray">Members</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Action Bar */}
      <section className="py-6 border-y border-parchment-dark bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#6B1E2E] text-parchment rounded-xl font-ui font-semibold hover:shadow-lg hover:shadow-[#6B1E2E]/30 transition-all">
              <Plus className="w-5 h-5" />
              Ask a Question
            </button>
            
            <div className="flex items-center gap-4">
              <span className="font-ui text-sm text-mutedgray">Sort by:</span>
              <div className="flex gap-2">
                {(['latest', 'popular', 'unanswered'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-4 py-2 rounded-lg font-ui text-sm transition-all ${
                      sortBy === sort
                        ? 'bg-[#6B1E2E] text-parchment'
                        : 'bg-white border border-parchment-dark text-mutedgray hover:text-ink'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-mutedgray" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Topics List */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-mutedgray mx-auto mb-4" />
              <h3 className="font-display text-xl text-ink mb-2">No topics found</h3>
              <p className="font-body text-mutedgray mb-4">Be the first to start a discussion!</p>
              <button className="px-6 py-3 bg-[#6B1E2E] text-parchment rounded-xl font-ui font-semibold">
                Ask a Question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-2xl border border-parchment-dark p-6 hover:shadow-lg hover:shadow-[#6B1E2E]/10 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                      {topic.authorAvatar ? (
                        <img 
                          src={topic.authorAvatar} 
                          alt={topic.authorName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#6B1E2E]/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-[#6B1E2E]" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-lg text-ink group-hover:text-[#6B1E2E] transition-colors line-clamp-1">
                          {topic.title}
                        </h3>
                        {topic.isSolved && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span className="font-ui text-xs">Solved</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="font-body text-sm text-mutedgray line-clamp-2 mb-3">
                        {topic.content}
                      </p>
                      
                      {/* Tags & Meta */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 bg-parchment rounded-full font-ui text-xs text-mutedgray">
                          {topic.category}
                        </span>
                        {topic.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full font-ui text-xs">
                            <Tag className="w-3 h-3 inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4 text-sm text-mutedgray">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {topic.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {topic.replies.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {topic.views}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-mutedgray">
                        <Clock className="w-3 h-3" />
                        <span className="font-ui">{new Date(topic.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Replies Preview */}
                  {topic.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-parchment-dark">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(topic.replies[0] as any).authorAvatar ? (
                            <img 
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              src={(topic.replies[0] as any).authorAvatar} 
                              alt={topic.replies[0].authorName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-[#C9A84C]/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-[#C9A84C]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm text-mutedgray line-clamp-2">
                            <span className="font-semibold text-ink">{topic.replies[0].authorName}:</span>{' '}
                            {topic.replies[0].content}
                          </p>
                        </div>
                        {topic.replies[0].isAccepted && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <Award className="w-3 h-3" />
                            Best Answer
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] rounded-3xl p-12 text-center text-parchment">
            <h2 className="font-display text-3xl mb-4">Join Our Community</h2>
            <p className="font-body mb-8 opacity-90">
              Get answers to your legal questions and help others with your knowledge
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-parchment text-[#6B1E2E] rounded-xl font-ui font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ask a Question
              </button>
              <button className="px-8 py-4 border-2 border-parchment text-parchment rounded-xl font-ui font-semibold hover:bg-parchment/10 transition-all flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Browse All Topics
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
