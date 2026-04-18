import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Search, Filter,
  File, Eye, ShoppingCart, ChevronRight, Tag, FileSpreadsheet,
  Shield, Clock, Award, Check
} from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { LegalScroll3D } from '@/components/ui/LegalSVGs';
import { Drawer } from 'vaul';
import { useCartStore } from '@/store';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FirestoreTemplate {
  id: string;
  title: string;
  slug: string;
  category: 'Petition' | 'Agreement' | 'Notice' | 'Affidavit' | 'Other';
  price: number;
  isFree: boolean;
  language: 'English' | 'Hindi' | 'Both';
  pdfKey?: string;
  docxKey?: string;
  downloadCount: number;
  createdAt: any;
  updatedAt: any;
}

type DisplayFormat = 'pdf' | 'docx' | 'both';

function deriveFormat(t: FirestoreTemplate): DisplayFormat {
  if (t.pdfKey && t.docxKey) return 'both';
  if (t.docxKey) return 'docx';
  return 'pdf';
}

const formatIcons: Record<DisplayFormat, typeof File> = {
  pdf: File,
  docx: FileText,
  both: FileSpreadsheet
};

const CATEGORIES = ['all', 'Petition', 'Agreement', 'Notice', 'Affidavit', 'Other'] as const;

export default function TemplatesStore() {
  const [templates, setTemplates] = useState<FirestoreTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<FirestoreTemplate | null>(null);

  const navigate = useNavigate();
  const { addNote } = useCartStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreTemplate[];
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleClaimFree = async (template: FirestoreTemplate) => {
    if (!currentUser) {
      toast.error('Please sign in to claim free templates');
      navigate('/login');
      return;
    }
    try {
      // Check if already claimed
      const existing = await getDocs(
        query(collection(db, 'purchases'),
          where('userId', '==', currentUser.uid),
          where('productId', '==', template.id),
          limit(1))
      );
      if (!existing.empty) {
        toast.info('Already claimed!', { description: 'Find it in your Dashboard.' });
        navigate('/dashboard');
        return;
      }
      await addDoc(collection(db, 'purchases'), {
        userId: currentUser.uid,
        productId: template.id,
        title: template.title,
        price: 0,
        type: 'template',
        status: 'success',
        razorpay_payment_id: 'FREE_CLAIM',
        purchasedAt: serverTimestamp(),
      });
      toast.success('Template claimed!', {
        description: 'Find it in your Dashboard to download.',
        action: { label: 'Go to Dashboard', onClick: () => navigate('/dashboard') },
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Claim failed:', err);
      toast.error('Could not claim template. Please try again.');
    }
  };

  const handleAddToCart = (template: FirestoreTemplate) => {
    addNote({ ...template, totalPages: 0, isNew: false } as any);
    toast.success('Added to cart!', {
      description: template.title,
      action: { label: 'View Cart', onClick: () => navigate('/cart') }
    });
  };

  const handleBuyNow = (template: FirestoreTemplate) => {
    handleAddToCart(template);
    navigate('/cart');
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTemplates = templates.slice(0, 4);

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <SEO
        title="Legal Templates & Notice Formats — EduLaw"
        description="Download ready-to-use rent agreements, employment contracts, NDA templates, and legal notice formats compliant with Indian laws."
        canonical="/templates"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-parchment to-burgundy/5" />

        <div className="absolute top-40 right-20 w-36 h-36 opacity-20 animate-float">
          <FileText className="w-full h-full text-burgundy" />
        </div>
        <div className="absolute bottom-20 left-20 w-28 h-28 opacity-20 animate-float-delayed">
          <LegalScroll3D />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full mb-6">
              <FileText className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Professional Legal Documents</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
              Legal Templates <span className="text-burgundy">Store</span>
            </h1>

            <p className="font-body text-lg text-mutedgray mb-8">
              Download professionally drafted legal document templates.
              Save time and money with our ready-to-use legal forms.
            </p>

            {!loading && templates.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 mt-12">
                <div className="text-center">
                  <div className="font-display text-3xl text-burgundy">{templates.length}+</div>
                  <div className="font-ui text-sm text-mutedgray">Templates</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-3xl text-burgundy">4.9</div>
                  <div className="font-ui text-sm text-mutedgray">Rating</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {loading ? (
        <section className="py-24 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </section>
      ) : templates.length === 0 ? (
        /* ── EMPTY STATE ── */
        <section className="py-24">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-parchment-dark/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-mutedgray" />
            </div>
            <h2 className="font-display text-2xl text-ink mb-3">Templates Coming Soon</h2>
            <p className="font-body text-mutedgray">
              We're preparing professionally drafted legal templates for you. Check back soon.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Templates */}
          {featuredTemplates.length > 0 && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl text-ink">Featured Templates</h2>
                  <button className="flex items-center gap-2 text-burgundy font-ui text-sm hover:underline">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-parchment rounded-xl border border-parchment-dark overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-burgundy/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-burgundy" />
                          </div>
                          {template.isFree && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-ui text-xs">
                              FREE
                            </span>
                          )}
                        </div>

                        <h3 className="font-display text-lg text-ink mb-2 line-clamp-1">{template.title}</h3>
                        <p className="font-body text-sm text-mutedgray line-clamp-2 mb-4">{template.category}</p>

                        <div className="flex items-center justify-between">
                          <span className="font-display text-xl text-burgundy">
                            {template.isFree ? 'Free' : `₹${template.price}`}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-mutedgray">
                            <Download className="w-4 h-4" />
                            {template.downloadCount}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Filters & Search */}
          <section className="py-8 border-y border-parchment-dark bg-white/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-mutedgray" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    title="Filter by legal category"
                    className="px-4 py-3 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-burgundy"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* All Templates Grid */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl text-ink mb-8">All Templates</h2>

              {filteredTemplates.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-mutedgray mx-auto mb-4" />
                  <h3 className="font-display text-xl text-ink mb-2">No templates found</h3>
                  <p className="font-body text-mutedgray">Try adjusting your search</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template, index) => {
                    const format = deriveFormat(template);
                    const FormatIcon = formatIcons[format];
                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white rounded-2xl border border-parchment-dark overflow-hidden hover:shadow-xl hover:shadow-burgundy/10 transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-burgundy/10 to-gold/10 rounded-xl flex items-center justify-center">
                              <FormatIcon className="w-7 h-7 text-burgundy" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-parchment rounded-lg font-ui text-xs text-mutedgray uppercase">
                                {format}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-display text-lg text-ink mb-2">{template.title}</h3>
                          <p className="font-body text-sm text-mutedgray mb-4 line-clamp-2">
                            {template.category} · {template.language}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-2 py-1 bg-parchment rounded-full font-ui text-xs text-mutedgray">
                              <Tag className="w-3 h-3 inline mr-1" />
                              {template.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-parchment-dark">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-sm text-mutedgray">
                                <Download className="w-4 h-4" />
                                {template.downloadCount}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-mutedgray">
                                <Eye className="w-4 h-4" />
                                Preview
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-display text-xl text-burgundy">
                                {template.isFree ? 'Free' : `₹${template.price}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="px-6 pb-6 flex gap-3">
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="flex-1 py-3 border border-burgundy/20 text-burgundy rounded-xl font-ui font-bold text-xs hover:bg-burgundy/5 transition-all text-center"
                          >
                            Quick View
                          </button>
                          {template.isFree ? (
                            <button
                              onClick={() => handleClaimFree(template)}
                              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-ui font-bold text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Get Free
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(template)}
                              className="flex-1 py-3 bg-burgundy text-parchment rounded-xl font-ui font-bold text-xs hover:bg-burgundy-light transition-all flex items-center justify-center gap-2"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Quick View Drawer */}
      <Drawer.Root
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-[101] outline-none">
            <div className="p-4 bg-white rounded-t-[32px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />

              <div className="max-w-xl mx-auto">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-burgundy/5 text-burgundy rounded-full mb-4">
                      <Tag className="w-3 h-3" />
                      <span className="font-ui text-[10px] font-black uppercase tracking-widest">{selectedTemplate?.category}</span>
                    </div>
                    <Drawer.Title className="font-display text-3xl font-bold text-ink mb-2">
                      {selectedTemplate?.title}
                    </Drawer.Title>
                    <Drawer.Description className="font-body text-slate-500">
                      {selectedTemplate?.language} · {selectedTemplate && deriveFormat(selectedTemplate).toUpperCase()}
                    </Drawer.Description>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-4xl font-bold text-burgundy">
                      {selectedTemplate?.isFree ? 'Free' : `₹${selectedTemplate?.price}`}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-8 mb-12">
                  <div>
                    <h4 className="font-ui text-[11px] font-black text-ink uppercase tracking-wider mb-4">Key Features</h4>
                    <ul className="space-y-3">
                      {['Fully Editable', 'Court Compliant', 'Instant Download', 'Life-time Access'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm font-ui text-slate-600">
                          <div className="w-5 h-5 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-gold" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-ui text-[11px] font-black text-ink uppercase tracking-wider mb-4">Business Benefits</h4>
                    <ul className="space-y-3">
                      {['Risk Mitigation', 'Strategic Clauses', 'Advocate Verified'].map(b => (
                        <li key={b} className="flex items-center gap-3 text-sm font-ui text-slate-600">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-parchment/30 rounded-3xl border border-parchment-dark/50 mb-12 flex items-center justify-around">
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-gold mx-auto mb-2" />
                    <p className="text-[9px] font-ui font-black uppercase tracking-widest text-ink">Secure</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-gold mx-auto mb-2" />
                    <p className="text-[9px] font-ui font-black uppercase tracking-widest text-ink">Instant</p>
                  </div>
                  <div className="text-center">
                    <Award className="w-6 h-6 text-gold mx-auto mb-2" />
                    <p className="text-[9px] font-ui font-black uppercase tracking-widest text-ink">Verified</p>
                  </div>
                </div>

                <div className="sticky bottom-4 left-0 right-0 flex gap-4 pt-4 bg-white">
                  {selectedTemplate?.isFree ? (
                    <button
                      onClick={() => { if (selectedTemplate) handleClaimFree(selectedTemplate); setSelectedTemplate(null); }}
                      className="flex-1 py-5 bg-green-600 text-white rounded-[2rem] font-ui font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Claim Free
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { if (selectedTemplate) handleAddToCart(selectedTemplate); }}
                        className="flex-1 py-5 border-2 border-slate-100 text-ink rounded-[2rem] font-ui font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => { if (selectedTemplate) handleBuyNow(selectedTemplate); }}
                        className="flex-1 py-5 bg-burgundy text-parchment rounded-[2rem] font-ui font-black text-xs uppercase tracking-widest hover:bg-burgundy-light transition-all shadow-xl shadow-burgundy/20 active:scale-95"
                      >
                        Buy Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Why Our Templates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-ink mb-4">
              Why Choose Our <span className="text-burgundy">Templates?</span>
            </h2>
            <p className="font-body text-mutedgray max-w-2xl mx-auto">
              Professionally drafted by experienced lawyers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Legally Verified', desc: 'All templates reviewed by legal experts' },
              { icon: Clock, title: 'Instant Download', desc: 'Get your templates immediately after purchase' },
              { icon: FileText, title: 'Editable Format', desc: 'Word and PDF formats available' },
              { icon: Award, title: 'Regular Updates', desc: 'Templates updated with latest laws' }
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

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-3xl p-12 text-center text-parchment">
            <h2 className="font-display text-3xl mb-4">Need Custom Documents?</h2>
            <p className="font-body mb-8 opacity-90">
              Our legal experts can draft custom documents tailored to your specific needs
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-parchment text-burgundy rounded-xl font-ui font-semibold hover:shadow-lg transition-all">
                Contact Legal Services
              </button>
              <button className="px-8 py-4 border-2 border-parchment text-parchment rounded-xl font-ui font-semibold hover:bg-parchment/10 transition-all">
                Browse All Templates
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
