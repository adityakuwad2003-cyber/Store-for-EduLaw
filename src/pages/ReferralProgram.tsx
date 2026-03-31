import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, Copy, CheckCircle, Users, IndianRupee, TrendingUp,
  Share2, MessageCircle, Mail, Link2, Star,
  Wallet
} from 'lucide-react';
import { referralConfig } from '@/data/notes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const [referralCode] = useState('EDULAW' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [referralLink] = useState(`https://edulaw.in/ref/${referralCode}`);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock data for demonstration
  const referralStats = {
    totalReferrals: 12,
    successfulReferrals: 8,
    totalEarnings: 800,
    pendingEarnings: 300
  };

  const referredUsers = [
    { name: 'Rahul Kumar', date: '2024-03-15', amount: 299, commission: 100, status: 'completed' },
    { name: 'Priya Sharma', date: '2024-03-12', amount: 599, commission: 100, status: 'completed' },
    { name: 'Ananya Patel', date: '2024-03-10', amount: 199, commission: 0, status: 'pending' },
    { name: 'Karan Malhotra', date: '2024-03-08', amount: 450, commission: 100, status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 via-parchment to-[#6B1E2E]/5" />
        
        {/* Floating 3D Elements */}
        <div className="absolute top-40 right-10 w-32 h-32 opacity-20 animate-float">
          <Gift className="w-full h-full text-[#C9A84C]" />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 opacity-20 animate-float-delayed">
          <IndianRupee className="w-full h-full text-[#6B1E2E]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C]/10 rounded-full mb-6">
              <Gift className="w-4 h-4 text-[#C9A84C]" />
              <span className="font-ui text-sm text-[#C9A84C]">Earn While You Share</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
              Refer & <span className="text-[#6B1E2E]">Earn</span>
            </h1>
            
            <p className="font-body text-lg text-mutedgray mb-8">
              Share EduLaw with your friends and earn ₹{referralConfig.referrerReward} for every successful referral. 
              Your friends also get ₹{referralConfig.referredUserDiscount} off on their first purchase!
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">₹{referralConfig.referrerReward}</div>
                <div className="font-ui text-sm text-mutedgray">Per Referral</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">₹{referralConfig.referredUserDiscount}</div>
                <div className="font-ui text-sm text-mutedgray">Friend's Discount</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">{referralConfig.maxReferralsPerMonth}</div>
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
              How It <span className="text-[#6B1E2E]">Works</span>
            </h2>
            <p className="font-body text-mutedgray max-w-2xl mx-auto">
              Three simple steps to start earning
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '1', 
                icon: Share2, 
                title: 'Share Your Link', 
                desc: 'Copy your unique referral link and share it with friends via WhatsApp, email, or social media' 
              },
              { 
                step: '2', 
                icon: Users, 
                title: 'Friends Purchase', 
                desc: 'Your friends sign up and make their first purchase using your referral code' 
              },
              { 
                step: '3', 
                icon: Wallet, 
                title: 'Earn Rewards', 
                desc: `Get ₹${referralConfig.referrerReward} credited to your wallet for each successful referral` 
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center p-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#6B1E2E] to-[#8B2E42] rounded-2xl flex items-center justify-center text-parchment font-display text-2xl">
                  <item.icon className="w-10 h-10" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center text-white font-display">
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
          <div className="bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] rounded-3xl p-8 md:p-12 text-parchment">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl mb-2">Your Referral Code</h2>
              <p className="font-body opacity-90">Share this code with your friends</p>
            </div>
            
            {/* Referral Code */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-ui text-sm opacity-70">Referral Code</span>
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="font-ui text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-display text-4xl md:text-5xl tracking-wider">
                {referralCode}
              </div>
            </div>
            
            {/* Referral Link */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="font-ui text-sm opacity-70">Or share this link</span>
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                >
                  <Link2 className="w-4 h-4" />
                  <span className="font-ui text-sm">Copy Link</span>
                </button>
              </div>
              <div className="font-ui text-sm opacity-90 truncate">
                {referralLink}
              </div>
            </div>
            
            {/* Share Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-green-500 rounded-xl font-ui font-semibold hover:shadow-lg transition-all">
                <MessageCircle className="w-5 h-5" />
                Share on WhatsApp
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl font-ui font-semibold hover:shadow-lg transition-all">
                <Mail className="w-5 h-5" />
                Share via Email
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-ink mb-8">Your Referral Stats</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Referrals', value: referralStats.totalReferrals, icon: Users, color: 'bg-blue-100 text-blue-700' },
              { label: 'Successful', value: referralStats.successfulReferrals, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
              { label: 'Total Earnings', value: `₹${referralStats.totalEarnings}`, icon: IndianRupee, color: 'bg-[#C9A84C]/20 text-[#C9A84C]' },
              { label: 'Pending', value: `₹${referralStats.pendingEarnings}`, icon: TrendingUp, color: 'bg-orange-100 text-orange-700' }
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
          
          {/* Referred Users Table */}
          <div className="bg-white rounded-2xl border border-parchment-dark overflow-hidden">
            <div className="p-6 border-b border-parchment-dark">
              <h3 className="font-display text-xl text-ink">Referred Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-parchment">
                  <tr>
                    <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Name</th>
                    <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Date</th>
                    <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Purchase</th>
                    <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Commission</th>
                    <th className="px-6 py-4 text-left font-ui text-sm text-mutedgray">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {referredUsers.map((user, index) => (
                    <tr key={index} className="border-b border-parchment-dark last:border-0">
                      <td className="px-6 py-4 font-body text-ink">{user.name}</td>
                      <td className="px-6 py-4 font-ui text-sm text-mutedgray">{new Date(user.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-ui text-sm text-ink">₹{user.amount}</td>
                      <td className="px-6 py-4 font-ui text-sm text-[#6B1E2E]">₹{user.commission}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full font-ui text-xs ${
                          user.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

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
                'Referral rewards are credited to your EduLaw wallet within 7 days of successful purchase.',
                'Self-referrals are not allowed and will be disqualified.',
                'EduLaw reserves the right to modify or terminate the referral program at any time.'
              ].map((term, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-mutedgray">{term}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] rounded-3xl p-12 text-center text-parchment">
            <h2 className="font-display text-3xl mb-4">Start Earning Today!</h2>
            <p className="font-body mb-8 opacity-90">
              Share EduLaw with your friends and help them succeed in their legal studies
            </p>
            <button 
              onClick={() => copyToClipboard(referralLink)}
              className="px-8 py-4 bg-parchment text-[#6B1E2E] rounded-xl font-ui font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copied!' : 'Copy Referral Link'}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
