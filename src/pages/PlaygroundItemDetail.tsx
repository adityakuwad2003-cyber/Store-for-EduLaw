import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BookOpen, AlertCircle, ArrowLeft, Lightbulb, Gavel, Scale, FileText } from 'lucide-react';
import { Navbar as Header } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// Use the exact names from playgroundPools
import { 
  CASE_LAW_POOL, 
  CONSTITUTION_POOL, 
  MAXIM_POOL, 
  DIGEST_POOL,
} from '../data/playgroundPools';

export function PlaygroundItemDetail() {
  const { type, slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      if (!type || !slug) return;
      setLoading(true);
      setError(false);

      // Attempt to load from Firebase first if it matches standard document ID patterns
      try {
        const docRef = doc(db, 'playground_content', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Firebase item fetch failed, falling back to local pool', err);
      }

      // Fallback to offline pools
      let found = null;
      if (type === 'case-law') {
        found = CASE_LAW_POOL.find(c => c.id === slug);
      } else if (type === 'constitution') {
        found = CONSTITUTION_POOL.find(c => c.id === slug);
      } else if (type === 'maxim') {
        found = MAXIM_POOL.find(m => m.id === slug);
      } else if (type === 'digest') {
        found = DIGEST_POOL.find(d => d.id === slug);
      } else if (type === 'news') {
        // News is dynamic-only, no local pool fallback usually, 
        // but we'll let it error/loading handles it via Firebase fetch above
      }

      if (found) {
        setData(found);
      } else {
        setError(true);
      }
      setLoading(false);
    }

    fetchItem();
  }, [type, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-serif">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <p className="text-xl text-burgundy animate-pulse">Retrieving archives...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-serif">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center pt-24 space-y-4">
          <AlertCircle className="w-12 h-12 text-zinc-400" />
          <h2 className="text-2xl text-zinc-900 font-semibold">Document Not Found</h2>
          <p className="text-zinc-600">The legal record you are looking for has been moved or does not exist.</p>
          <Link to="/legal-playground" className="mt-4 px-6 py-3 bg-burgundy hover:bg-gold text-white font-sans rounded-full transition-colors inline-block">
            Return to Legal Playground
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-serif selection:bg-gold/30">
      <Helmet>
        <title>{data.title || data.name || data.maxim} | EduLaw Playground</title>
        <meta name="description" content={data.ratio || data.meaning || data.plainLanguage || data.summary || "Explore essential legal concepts, cases, and maxims on EduLaw."} />
      </Helmet>

      <Header />

      <main className="flex-1 pt-32 pb-24 px-6 max-w-4xl mx-auto w-full">
        <Link to="/legal-playground" className="inline-flex items-center text-sm text-burgundy hover:text-gold transition-colors font-sans uppercase tracking-widest font-semibold mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Playground
        </Link>

        {/* Case Law Template */}
        {type === 'case-law' && (
          <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-burgundy/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgundy to-gold" />
            <div className="mb-4 inline-block px-3 py-1 rounded-full bg-burgundy/10 text-burgundy text-sm font-sans font-bold uppercase tracking-wider">{data.subject}</div>
            <h1 className="text-4xl md:text-5xl text-zinc-900 font-bold leading-tight mb-4">{data.name}</h1>
            <div className="flex flex-wrap gap-4 text-zinc-600 mb-10 font-sans text-sm">
              <span className="flex items-center"><Gavel className="w-4 h-4 mr-2" /> {data.court}</span>
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> {data.citation}</span>
              <span className="bg-zinc-100 px-2 py-0.5 rounded">{data.year}</span>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <Scale className="w-5 h-5 mr-2" /> The Blueprint (Ratio Decidendi)
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7 border-l-2 border-gold/40">{data.ratio}</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" /> Why it Matters
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7">{data.significance}</p>
              </section>
            </div>
          </article>
        )}

        {/* Constitution Article Template */}
        {type === 'constitution' && (
          <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-burgundy/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgundy to-gold" />
            <div className="mb-4 inline-block px-3 py-1 rounded-full bg-burgundy/10 text-burgundy text-sm font-sans font-bold uppercase tracking-wider">{data.part}</div>
            <h1 className="text-4xl md:text-5xl text-zinc-900 font-bold leading-tight mb-2">{data.article}</h1>
            <h2 className="text-2xl text-zinc-600 font-medium mb-10">{data.title}</h2>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" /> Plain Language
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7 border-l-2 border-gold/40">{data.plainLanguage}</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" /> Key Takeaway
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7">{data.keyPoint}</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <Gavel className="w-5 h-5 mr-2" /> Landmark Case
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7">{data.relatedCase}</p>
              </section>
            </div>
          </article>
        )}

        {/* Maxim Template */}
        {type === 'maxim' && (
          <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-burgundy/10 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgundy to-gold" />
            <div className="mb-6 inline-block px-3 py-1 rounded-full bg-burgundy/10 text-burgundy text-sm font-sans font-bold uppercase tracking-wider">{data.origin} Origin</div>
            <h1 className="text-4xl md:text-5xl text-burgundy font-bold leading-tight mb-6 italic">"{data.maxim}"</h1>
            <p className="text-2xl text-zinc-800 font-medium mb-12">"{data.meaning}"</p>

            <div className="space-y-8 text-left max-w-2xl mx-auto">
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <Scale className="w-5 h-5 mr-2" /> Legal Usage
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7 border-l-2 border-gold/40">{data.usage}</p>
              </section>
              <section className="bg-gold/5 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-burgundy mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" /> Memory Hook
                </h3>
                <p className="text-lg text-zinc-700 leading-relaxed">{data.memoryHook}</p>
              </section>
            </div>
          </article>
        )}

        {/* Digest Template */}
        {type === 'digest' && (
          <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-burgundy/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-burgundy to-gold" />
            <div className="mb-4 inline-block px-3 py-1 rounded-full bg-burgundy/10 text-burgundy text-sm font-sans font-bold uppercase tracking-wider">{data.subject}</div>
            <h1 className="text-4xl md:text-5xl text-zinc-900 font-bold leading-tight mb-4">{data.title}</h1>
            <div className="flex flex-wrap gap-4 text-zinc-600 mb-10 font-sans text-sm">
              <span className="flex items-center"><Gavel className="w-4 h-4 mr-2" /> {data.court}</span>
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> {data.citation}</span>
              <span className="bg-zinc-100 px-2 py-0.5 rounded">{data.date}</span>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3">The Brief Facts</h3>
                <p className="text-lg text-zinc-700 leading-relaxed">{data.facts}</p>
              </section>
              <section className="bg-zinc-50 p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-burgundy mb-3">The Issue</h3>
                <p className="text-lg text-zinc-700 italic border-l-4 border-burgundy/50 pl-4">{data.issue}</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3">The Ruling (Held)</h3>
                <p className="text-lg text-zinc-700 leading-relaxed pl-7 border-l-2 border-gold/40">{data.held}</p>
              </section>
              <section>
                <h3 className="text-xl font-bold text-burgundy mb-3">Impact & Significance</h3>
                <p className="text-lg text-zinc-700 leading-relaxed">{data.impact}</p>
              </section>
            </div>
          </article>
        )}

        {/* News Template */}
        {type === 'news' && (
          <article className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-burgundy/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-500" />
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-sans font-bold uppercase tracking-wider">{data.category || 'Legal News'}</div>
              <div className="text-zinc-400 text-sm font-sans">{data.dateString}</div>
            </div>
            
            <h1 className="text-3xl md:text-4xl text-zinc-900 font-bold leading-tight mb-6">{data.title}</h1>
            
            <div className="flex items-center gap-4 py-4 border-y border-zinc-100 mb-8">
              <div className="w-10 h-10 rounded-full bg-burgundy/5 flex items-center justify-center text-burgundy">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900">{data.court}</div>
                <div className="text-xs text-zinc-500">Official Judicial Update</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {data.summary}
              </div>
              
              <div className="bg-zinc-50 p-6 rounded-2xl border-l-4 border-burgundy mt-10">
                <h4 className="font-bold text-burgundy mb-2">Editor's Note:</h4>
                <p className="text-sm text-zinc-600 italic">
                  This summary is prepared for educational purposes to help law students and professionals stay updated with daily legal developments. Use the citation and court name to refer to the full judgment for academic research.
                </p>
              </div>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
