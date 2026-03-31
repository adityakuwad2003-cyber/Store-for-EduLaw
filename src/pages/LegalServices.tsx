import { useState } from 'react';
import { 
  FileText, Scale, Search, MessageCircle, Check, Clock, 
  ArrowRight, Calendar, User, Mail, Phone, FileEdit 
} from 'lucide-react';
import { legalServices } from '@/data/notes';

const iconMap: Record<string, React.ElementType> = {
  'drafting': FileText,
  'notice': Scale,
  'review': Search,
  'consultation': MessageCircle,
};

export function LegalServices() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    description: '',
    preferredDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Booking request submitted! We will contact you shortly.');
  };

  return (
    <div className="pt-20 min-h-screen bg-parchment">
      {/* Hero */}
      <div className="bg-ink py-16">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full mb-6">
              <Scale className="w-4 h-4 text-gold" />
              <span className="font-ui text-sm text-gold">Professional Legal Help</span>
            </span>
            <h1 className="font-display text-4xl lg:text-5xl text-parchment mb-4">
              Expert Legal <span className="text-gold">Services</span>
            </h1>
            <p className="font-body text-lg text-parchment/70">
              Connect with qualified advocates for document drafting, legal notices, contract review, and consultations.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-16">
        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {legalServices.map((service) => {
            const Icon = iconMap[service.id] || FileText;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="w-14 h-14 bg-burgundy/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-burgundy" />
                </div>
                <h3 className="font-display text-lg text-ink mb-2">{service.name}</h3>
                <p className="text-sm text-mutedgray mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-gold">{service.price}</span>
                  <span className="flex items-center gap-1 text-xs text-mutedgray">
                    <Clock className="w-3 h-3" />
                    {service.turnaroundTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking Form */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-card">
            <h2 className="font-display text-2xl text-ink mb-6">Book a Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-ui text-sm text-ink mb-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-ui text-sm text-ink mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-ui text-sm text-ink mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-ui text-sm text-ink mb-1">Service Type</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                  required
                >
                  <option value="">Select a service</option>
                  {legalServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} — {service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-ui text-sm text-ink mb-1">Description</label>
                <div className="relative">
                  <FileEdit className="absolute left-3 top-3 w-4 h-4 text-mutedgray" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                    rows={4}
                    placeholder="Describe your requirements..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-ui text-sm text-ink mb-1">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedgray" />
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-lg font-ui text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-burgundy text-parchment rounded-xl font-ui font-semibold hover:bg-burgundy-light transition-colors flex items-center justify-center gap-2"
              >
                Submit Booking Request
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-burgundy to-burgundy-light rounded-2xl p-8 text-parchment">
              <h3 className="font-display text-xl mb-4">Why Choose Our Legal Services?</h3>
              <ul className="space-y-3">
                {[
                  'Qualified and experienced advocates',
                  'Quick turnaround times',
                  'Affordable pricing',
                  'Secure and confidential',
                  'Multiple revision rounds',
                  '24/7 customer support',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-gold" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-display text-lg mb-4">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Submit Request', desc: 'Fill out the booking form' },
                  { step: 2, title: 'Get Quote', desc: 'We\'ll send you a detailed quote' },
                  { step: 3, title: 'Make Payment', desc: 'Pay securely via Razorpay' },
                  { step: 4, title: 'Receive Service', desc: 'Get your document or consultation' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-burgundy text-parchment flex items-center justify-center text-xs font-ui flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-ui font-medium text-ink">{item.title}</p>
                      <p className="text-xs text-mutedgray">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
