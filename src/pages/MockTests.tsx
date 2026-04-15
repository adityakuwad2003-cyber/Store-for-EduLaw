import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, FileQuestion, Trophy, Star, 
  Play, Filter, Search, TrendingUp, Award,
  ChevronRight, BookOpen, Target, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockTests } from '@/data/notes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { Gavel3D, ScalesOfJustice3D } from '@/components/ui/LegalSVGs';

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700'
};

export default function MockTests() {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTests = mockTests.filter(test => {
    const matchesFilter = filter === 'all' || (filter === 'free' ? test.isFree : !test.isFree);
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesFilter && matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(mockTests.map(t => t.category)))];

  const getNoteSlugForTest = (test: any) => {
    // Priority: slug mapping or category fallback
    if (test.slug.startsWith('mt-')) {
      const subject = test.slug.replace('mt-', '');
      return subject;
    }
    // Fallback search by category slug
    return test.category.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <SEO 
        title="Legal Mock Tests & MCQ Practice — EduLaw"
        description="Practice with the latest BNS, BNSS, and BSA mock tests. All India judiciary mock exams and LLB semester practice questions."
        canonical="/mock-tests"
      />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy/5 via-parchment to-gold/5" />
        
        {/* Floating 3D Elements */}
        <div className="absolute top-40 right-10 w-32 h-32 opacity-20 animate-float">
          <Gavel3D />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 opacity-20 animate-float-delayed">
          <ScalesOfJustice3D />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy/10 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-burgundy" />
              <span className="font-ui text-sm text-burgundy">Test Your Knowledge</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
              Mock Tests & <span className="text-gold">MCQs</span>
            </h1>
            
            <p className="font-body text-lg text-mutedgray mb-8">
              Practice with our comprehensive MCQ tests covering all major law subjects. 
              Track your progress and ace your exams with confidence.
            </p>

            {/* Coming Soon Banner */}
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/50 border border-gold/20 rounded-2xl mb-8 backdrop-blur-sm animate-pulse">
              <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
              <p className="text-[10px] font-ui font-black uppercase tracking-[0.2em] text-ink/70">
                Subject-Specific Mastery Tests <span className="text-gold">— COMING SOON</span>
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="font-display text-3xl text-burgundy">{mockTests.length}+</div>
                <div className="font-ui text-sm text-mutedgray">Mock Tests</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-burgundy">500+</div>
                <div className="font-ui text-sm text-mutedgray">Questions</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-burgundy">{mockTests.filter(t => t.isFree).length}</div>
                <div className="font-ui text-sm text-mutedgray">Free Tests</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-8 border-y border-parchment-dark bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
              <input
                type="text"
                placeholder="Search mock tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-burgundy"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-mutedgray" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                title="Filter mock tests by subject"
                className="px-4 py-3 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-burgundy"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Price Filter */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-parchment-dark p-1">
              {(['all', 'free', 'paid'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-ui text-sm transition-all ${
                    filter === f 
                      ? 'bg-burgundy text-parchment' 
                      : 'text-mutedgray hover:text-ink'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mock Tests Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <FileQuestion className="w-16 h-16 text-mutedgray mx-auto mb-4" />
              <h3 className="font-display text-xl text-ink mb-2">No tests found</h3>
              <p className="font-body text-mutedgray">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-parchment-dark overflow-hidden hover:shadow-xl hover:shadow-burgundy/10 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="relative p-6 bg-gradient-to-br from-burgundy/5 to-gold/5">
                    {test.isFeatured && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-gold rounded-full">
                        <Star className="w-3 h-3 text-white" />
                        <span className="font-ui text-xs text-white">Featured</span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full font-ui text-xs ${difficultyColors[test.difficulty]}`}>
                        {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                      </div>
                      {test.isFree && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-ui text-xs font-semibold">
                          FREE
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-display text-lg text-ink mb-2 line-clamp-2">{test.title}</h3>
                    <p className="font-body text-sm text-mutedgray line-clamp-2">{test.description}</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="px-6 py-4 border-y border-parchment-dark">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileQuestion className="w-4 h-4 text-burgundy" />
                        <span className="font-ui text-sm text-mutedgray">{test.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-burgundy" />
                        <span className="font-ui text-sm text-mutedgray">{test.duration} min</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {test.isFree ? (
                          <span className="font-display text-2xl text-green-600">Free</span>
                        ) : (
                          <>
                            <span className="font-display text-2xl text-burgundy">₹{test.price}</span>
                            <span className="font-ui text-sm text-mutedgray line-through ml-2">₹{test.price * 2}</span>
                          </>
                        )}
                      </div>
                      <span className="font-ui text-xs text-mutedgray bg-parchment px-2 py-1 rounded">
                        {test.category}
                      </span>
                    </div>
                    
                    {test.isFree ? (
                      <button 
                        onClick={() => window.location.href = `/mock-tests/${test.slug}`}
                        className="w-full py-3 rounded-xl font-ui font-semibold flex items-center justify-center gap-2 transition-all bg-burgundy text-parchment hover:shadow-lg hover:shadow-burgundy/30"
                      >
                        <Play className="w-4 h-4" />
                        Start Free Test
                      </button>
                    ) : (
                      <Link 
                        to={`/product/${getNoteSlugForTest(test)}`}
                        className="w-full py-3 rounded-xl font-ui font-semibold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-gold/80 to-gold text-ink hover:shadow-lg hover:shadow-gold/20"
                      >
                        <Lock className="w-4 h-4" />
                        Unlock via Note Bundle
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-ink mb-4">
              Why Take Our <span className="text-gold">Mock Tests?</span>
            </h2>
            <p className="font-body text-mutedgray max-w-2xl mx-auto">
              Our MCQs are designed by legal experts to help you prepare effectively for exams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: 'Exam Pattern', desc: 'Questions based on actual exam patterns' },
              { icon: TrendingUp, title: 'Performance Tracking', desc: 'Detailed analytics of your progress' },
              { icon: BookOpen, title: 'Detailed Explanations', desc: 'Learn from comprehensive explanations' },
              { icon: Award, title: 'Certificates', desc: 'Earn certificates on completion' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-burgundy/10 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-burgundy" />
                </div>
                <h3 className="font-display text-lg text-ink mb-2">{feature.title}</h3>
                <p className="font-body text-sm text-mutedgray">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-3xl p-12 text-center text-parchment">
            <h2 className="font-display text-3xl mb-4">Ready to Test Your Knowledge?</h2>
            <p className="font-body mb-8 opacity-90">
              Start with our free mock tests and upgrade for comprehensive practice
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-parchment text-burgundy rounded-xl font-ui font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <Play className="w-5 h-5" />
                Start Free Test
              </button>
              <button className="px-8 py-4 border-2 border-parchment text-parchment rounded-xl font-ui font-semibold hover:bg-parchment/10 transition-all flex items-center gap-2">
                View All Tests
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
