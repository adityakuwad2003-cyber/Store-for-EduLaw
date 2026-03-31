import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, BookOpen, Package, CreditCard, Settings,
  Download, Eye, LogOut, Crown
} from 'lucide-react';
import { useUserStore } from '@/store';
import { notesData, bundles } from '@/data/notes';

const tabs = [
  { id: 'notes', name: 'My Notes', icon: BookOpen },
  { id: 'bundles', name: 'My Bundles', icon: Package },
  { id: 'subscription', name: 'Subscription', icon: Crown },
  { id: 'orders', name: 'Orders', icon: CreditCard },
  { id: 'profile', name: 'Profile', icon: Settings },
];

// Mock purchased notes
const purchasedNotes = [notesData[0], notesData[1], notesData[4]];
const purchasedBundles = [bundles[0]];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('notes');
  const { logout } = useUserStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-ink mb-4">My Notes</h2>
            {purchasedNotes.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {purchasedNotes.map((note) => (
                  <div key={note.id} className="bg-white rounded-xl p-4 shadow-card flex items-center gap-4">
                    <div className="w-14 h-14 bg-parchment-dark rounded-lg flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-burgundy" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-ui font-medium text-ink">{note.title}</h3>
                      <p className="text-sm text-mutedgray">{note.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-parchment-dark rounded-lg text-burgundy" title="Read Online">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-parchment-dark rounded-lg text-burgundy" title="Download PDF">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <BookOpen className="w-12 h-12 text-mutedgray mx-auto mb-4" />
                <p className="text-mutedgray">No notes purchased yet</p>
                <Link to="/marketplace" className="text-burgundy hover:underline mt-2 inline-block">
                  Browse Marketplace
                </Link>
              </div>
            )}
          </div>
        );

      case 'bundles':
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-ink mb-4">My Bundles</h2>
            {purchasedBundles.length > 0 ? (
              <div className="space-y-4">
                {purchasedBundles.map((bundle) => (
                  <div key={bundle.id} className="bg-white rounded-xl p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display text-lg text-ink">{bundle.name}</h3>
                        <p className="text-sm text-mutedgray">{bundle.noteIds.length} subjects</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-ui">
                        Active
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-burgundy text-parchment rounded-lg font-ui text-sm hover:bg-burgundy-light transition-colors">
                        Access All Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="w-12 h-12 text-mutedgray mx-auto mb-4" />
                <p className="text-mutedgray">No bundles purchased yet</p>
                <Link to="/bundles" className="text-burgundy hover:underline mt-2 inline-block">
                  View Bundles
                </Link>
              </div>
            )}
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-ink mb-4">My Subscription</h2>
            <div className="bg-gradient-to-br from-burgundy to-burgundy-light rounded-xl p-6 text-parchment">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/20 rounded-full text-sm font-ui mb-2">
                    <Crown className="w-4 h-4 text-gold" />
                    Monthly Plan
                  </span>
                  <h3 className="font-display text-2xl">Active Subscription</h3>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-gold">₹499</p>
                  <p className="text-sm text-parchment/70">/month</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="font-display text-xl">3/5</p>
                  <p className="text-xs text-parchment/70">Downloads Left</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="font-display text-xl">15</p>
                  <p className="text-xs text-parchment/70">Days Left</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="font-display text-xl">10%</p>
                  <p className="text-xs text-parchment/70">Service Discount</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gold text-ink rounded-lg font-ui font-medium hover:bg-gold-light transition-colors">
                  Upgrade to Annual
                </button>
                <button className="px-4 py-2 bg-white/10 text-parchment rounded-lg font-ui font-medium hover:bg-white/20 transition-colors">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-ink mb-4">Order History</h2>
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-parchment-dark">
                  <tr>
                    <th className="px-4 py-3 text-left font-ui text-sm">Order ID</th>
                    <th className="px-4 py-3 text-left font-ui text-sm">Item</th>
                    <th className="px-4 py-3 text-left font-ui text-sm">Date</th>
                    <th className="px-4 py-3 text-left font-ui text-sm">Amount</th>
                    <th className="px-4 py-3 text-left font-ui text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'ORD-001', item: 'BNS Complete Notes', date: '2024-03-15', amount: 199, status: 'Completed' },
                    { id: 'ORD-002', item: 'Starter Pack Bundle', date: '2024-03-10', amount: 450, status: 'Completed' },
                    { id: 'ORD-003', item: 'Constitution Part 1', date: '2024-03-05', amount: 199, status: 'Completed' },
                  ].map((order) => (
                    <tr key={order.id} className="border-t border-parchment-dark">
                      <td className="px-4 py-3 font-ui text-sm">{order.id}</td>
                      <td className="px-4 py-3 font-ui text-sm">{order.item}</td>
                      <td className="px-4 py-3 font-ui text-sm text-mutedgray">{order.date}</td>
                      <td className="px-4 py-3 font-ui text-sm">₹{order.amount}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-ui">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-ink mb-4">My Profile</h2>
            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-burgundy/10 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-burgundy" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink">John Doe</h3>
                  <p className="text-mutedgray">john.doe@example.com</p>
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-ui text-sm text-ink mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full px-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                    />
                  </div>
                  <div>
                    <label className="block font-ui text-sm text-ink mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="w-full px-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-ui text-sm text-ink mb-1">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full px-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                  />
                  <p className="text-xs text-mutedgray mt-1">
                    Used for PDF watermarking
                  </p>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 bg-burgundy text-parchment rounded-lg font-ui font-medium hover:bg-burgundy-light transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-parchment">
      <div className="section-container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-4 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 border-b border-parchment-dark mb-4">
                <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-burgundy" />
                </div>
                <div>
                  <p className="font-ui font-medium text-ink">John Doe</p>
                  <p className="text-xs text-mutedgray">john@example.com</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-ui text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-burgundy text-parchment'
                        : 'text-ink hover:bg-parchment-dark'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-ui text-sm text-red-500 hover:bg-red-50 transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
