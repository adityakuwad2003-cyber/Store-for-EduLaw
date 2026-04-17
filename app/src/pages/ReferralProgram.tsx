import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Copy, CheckCircle, Users, IndianRupee, TrendingUp,
  Share2, MessageCircle, Mail, Link2, Star,
  Wallet, Loader2, LogIn
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';
import { referralConfig } from '@/data/notes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateReferralCode, getUserReferrals, type ReferralRecord } from '@/lib/referrals';
import { toast } from 'sonner';

const SITE_DOMAIN = 'https://store.theedulaw.in';

export default function ReferralProgram() {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const referralLink = referralCode ? `${SITE_DOMAIN}/?ref=${referralCode}` : '';

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([
      getOrCreateReferralCode(currentUser.uid, currentUser.email || ''),
      getUserReferrals(currentUser.uid),
    ]).then(([code, refs]) => {
      setReferralCode(code);
      setReferrals(refs);
    }).catch(() => {
      toast.error('Could not load referral data');
    }).finally(() => setLoading(false));
  }, [currentUser]);

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareOnWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! Check out EduLaw — the best legal notes marketplace for law students 🎓\n\nUse my referral link and get ₹${referralConfig.referredUserDiscount} off your first purchase:\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent('Get ₹50 off on EduLaw Notes!');
    const body = encodeURIComponent(
      `Hi,\n\nI've been using EduLaw for my legal studies and it's amazing! They have high-quality notes for all law subjects.\n\nUse my referral link to sign up and get ₹${referralConfig.referredUserDiscount} off your first purchase:\n${referralLink}\n\nHappy studying! 📚`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Stats derived from real data
  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(r => r.status === 'approved' || r.status === 'paid').length;
  const totalEarnings = referrals
    .filter(r => r.status === 'approved' || r.status === 'paid')
    .reduce((sum, r) => sum + r.commissionAmount, 0);
  const pendingEarnings = referrals
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return (
    <div className="min-h-screen bg-parchment">
      <SEO 
        title="Refer & Earn — EduLaw Affiliate Program"
        description="Share EduLaw with your friends and earn 20% commission on every successful referral. Join India's largest legal affiliate network today."
        canonical="/referral"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-parchment to-burgundy/5" />
        <div className="absolute top-40 right-10 w-32 h-32 opacity-20 animate-float">
          <Gift className="w-full h-full text-gold" />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 opacity-20 animate-float-delayed">
          <IndianRupee className="w-full h-full text-burgundy" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full mb-6">
              <Gift className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Earn While You Share</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
              Refer & <span className="text-burgundy">Earn</span>
            </h1>

            <p className="font-body text-lg text-mutedgray mb-8">
              Share EduLaw with your friends and earn ₹{referralConfig.referrerReward} for every successful referral.
              Your friends also get ₹{referralConfig.referredUserDiscount} off on their first purchase!
            </p>

            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="font-display text-3xl text-burgundy">₹{referralConfig.referrerReward}</div>
                <div className="font-ui text-sm text-mutedgray">Per Referral</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-burgundy">₹{referralConfig.referredUserDiscount}</div>
                <div className="font-ui text-sm text-mutedgray">Friend's Discount</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-burgundy">{referralConfig.maxReferralsPerMonth}</div>
                <div className="font-ui text-sm text-mutedgray">Max/Month</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-ink mb-4">
              How It <span className="text-burgundy">Works</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Share2, title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends via WhatsApp, email, or social media' },
              { step: '2', icon: Users, title: 'Friends Purchase', desc: 'Your friends sign up and make their first purchase using your referral link' },
              { step: '3', icon: Wallet, title: 'Earn Rewards', desc: `Get ₹${referralConfig.referrerReward} credited for each successful referral` },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center p-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-burgundy to-burgundy-light rounded-2xl flex items-center justify-center text-parchment">
                  <item.icon className="w-10 h-10" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white font-display">
                  {item.step}
                </div>
                <h3 className="font-display text-xl text-ink mb-3">{item.title}</h3>
                <p className="font-body text-sm text-mutedgray">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Code Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!currentUser ? (
            <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-3xl p-8 md:p-12 text-parchment text-center">
              <LogIn className="w-16 h-16 mx-auto mb-6 opacity-70" />
              <h2 className="font-display text-3xl mb-3">Log in to Get Your Code</h2>
              <p className="font-body opacity-80 mb-8">Create an account or log in to generate your unique referral link and start earning.</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-parchment text-burgundy rounded-xl font-ui font-semibold hover:shadow-lg transition-all"
              >
                <LogIn className="w-5 h-5" />
                Log In / Sign Up
              </Link>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-burgundy to-burgundy-light rounded-3xl p-8 md:p-12 text-parchment">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl mb-2">Your Referral Code</h2>
                <p className="font-body opacity-90">Share this code or link with your friends</p>
              </div>

              {/* Code */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-ui text-sm opacity-70">Referral Code</span>
                  <button
                    onClick={() => copyToClipboard(referralCode, 'code')}
                    title="Copy referral code"
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                  >
                    {copied === 'code' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="font-ui text-sm">{copied === 'code' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-display text-4xl md:text-5xl tracking-wider">{referralCode}</div>
              </div>

              {/* Link */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-ui text-sm opacity-70">Or share this link</span>
                  <button
                    onClick={() => copyToClipboard(referralLink, 'link')}
                    title="Copy referral link"
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                  >
                    <Link2 className="w-4 h-4" />
                    <span className="font-ui text-sm">{copied === 'link' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                <div className="font-ui text-sm opacity-90 break-all">{referralLink}</div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={shareOnWhatsApp}
                  title="Share on WhatsApp"
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-ui font-semibold hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={shareByEmail}
                  title="Share via Email"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-ui font-semibold hover:shadow-lg transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Share via Email
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Dashboard — only shown when logged in */}
      {currentUser && !loading && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl text-ink mb-8">Your Referral Stats</h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Total Referrals', value: totalReferrals, icon: Users, color: 'bg-blue-100 text-blue-700' },
                { label: 'Successful', value: successfulReferrals, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
                { label: 'Total Earnings', value: `₹${totalEarnings}`, icon: IndianRupee, color: 'bg-gold/20 text-gold' },
                { label: 'Pending', value: `₹${pendingEarnings}`, icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-parchment rounded-2xl p-6"
                >
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="font-display text-3xl text-ink mb-1">{stat.value}</div>
                  <div className="font-ui text-sm text-mutedgray">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Referrals Table */}
            <div className="bg-white rounded-2xl border border-parchment-dark overflow-hidden">
              <div className="p-6 border-b border-parchment-dark">
                <h3 className="font-display text-xl text-ink">Your Referred Students</h3>
              </div>
              {referrals.length === 0 ? (
                <div className="text-center py-16 text-mutedgray">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-ui">No referrals yet — share your link to start earning!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-parchment">
                      <tr>
                        <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Student Email</th>
                        <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Order</th>
                        <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Your Earnings</th>
                        <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((r) => {
                        const date = r.createdAt?.toDate
                          ? r.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';
                        return (
                          <tr key={r.id} className="border-b border-parchment-dark last:border-0">
                            <td className="px-6 py-4 font-body text-ink text-sm">
                              <div>{r.refereeEmail}</div>
                              <div className="text-xs text-mutedgray mt-0.5">{date}</div>
                            </td>
                            <td className="px-6 py-4 font-ui text-sm text-ink">₹{r.orderAmount}</td>
                            <td className="px-6 py-4 font-ui text-sm text-burgundy font-semibold">₹{r.commissionAmount}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full font-ui text-xs font-semibold ${
                                r.status === 'paid' ? 'bg-green-100 text-green-700' :
                                r.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Terms Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-ink mb-6">Terms & Conditions</h2>
          <div className="bg-white rounded-2xl border border-parchment-dark p-8">
            <ul className="space-y-4">
              {[
                `You earn ₹${referralConfig.referrerReward} for each successful referral when your friend makes a purchase of ₹${referralConfig.minPurchaseForReward} or more.`,
                `Your friend gets ₹${referralConfig.referredUserDiscount} off on their first purchase.`,
                `Maximum ${referralConfig.maxReferralsPerMonth} referrals per month.`,
                'Referral rewards are credited to your EduLaw wallet within 7 days of a successful purchase.',
                'Self-referrals are not allowed and will be disqualified.',
                'EduLaw reserves the right to modify or terminate the referral program at any time.',
              ].map((term, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-mutedgray">{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
