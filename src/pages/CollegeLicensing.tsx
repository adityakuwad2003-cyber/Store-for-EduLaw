import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, CheckCircle, Mail, Phone, User,
  GraduationCap, BarChart3, Headphones, BookOpen, Shield, Zap,
  ArrowRight, Star
} from 'lucide-react';
import { collegeLicensePlans } from '@/data/notes';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function CollegeLicensing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    collegeName: '',
    contactPerson: '',
    email: '',
    phone: '',
    studentCount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your interest! Our team will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6B1E2E]/5 via-parchment to-[#C9A84C]/5" />
        
        {/* Floating 3D Elements */}
        <div className="absolute top-40 right-10 w-32 h-32 opacity-20 animate-float">
          <Building2 className="w-full h-full text-[#6B1E2E]" />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 opacity-20 animate-float-delayed">
          <GraduationCap className="w-full h-full text-[#C9A84C]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6B1E2E]/10 rounded-full mb-6">
              <Building2 className="w-4 h-4 text-[#6B1E2E]" />
              <span className="font-ui text-sm text-[#6B1E2E]">For Educational Institutions</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">
              College <span className="text-[#C9A84C]">Licensing</span>
            </h1>
            
            <p className="font-body text-lg text-mutedgray mb-8">
              Provide your students with unlimited access to India's premier legal notes library. 
              Special institutional pricing for law colleges and universities.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">50+</div>
                <div className="font-ui text-sm text-mutedgray">Partner Colleges</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">10,000+</div>
                <div className="font-ui text-sm text-mutedgray">Student Users</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl text-[#6B1E2E]">46</div>
                <div className="font-ui text-sm text-mutedgray">Subjects Covered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-ink mb-4">
              Why Choose <span className="text-[#6B1E2E]">Institutional License?</span>
            </h2>
            <p className="font-body text-mutedgray max-w-2xl mx-auto">
              Empower your students with comprehensive legal education resources
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Complete Library Access', desc: 'All 46 subjects with regular updates' },
              { icon: Users, title: 'Unlimited Student Accounts', desc: 'Each student gets individual access' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track student progress and engagement' },
              { icon: Headphones, title: 'Priority Support', desc: 'Dedicated support for your institution' },
              { icon: Shield, title: 'Legal & Compliant', desc: 'All content reviewed by legal experts' },
              { icon: Zap, title: 'Easy Integration', desc: 'Works with your existing LMS' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-parchment rounded-2xl"
              >
                <div className="w-14 h-14 bg-[#6B1E2E]/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-[#6B1E2E]" />
                </div>
                <h3 className="font-display text-lg text-ink mb-2">{feature.title}</h3>
                <p className="font-body text-sm text-mutedgray">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-ink mb-4">
              Institutional <span className="text-[#C9A84C]">Plans</span>
            </h2>
            <p className="font-body text-mutedgray max-w-2xl mx-auto">
              Choose the plan that fits your institution's needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {collegeLicensePlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl border-2 overflow-hidden ${
                  selectedPlan === plan.id 
                    ? 'border-[#6B1E2E] shadow-xl shadow-[#6B1E2E]/20' 
                    : 'border-parchment-dark hover:border-[#6B1E2E]/50'
                } transition-all`}
              >
                {index === 1 && (
                  <div className="absolute top-0 left-0 right-0 bg-[#C9A84C] text-parchment text-center py-2 font-ui text-sm">
                    Most Popular
                  </div>
                )}
                
                <div className={`p-8 ${index === 1 ? 'pt-14' : ''}`}>
                  <div className="text-center mb-8">
                    <h3 className="font-display text-2xl text-ink mb-2">{plan.name}</h3>
                    <p className="font-body text-sm text-mutedgray">{plan.description}</p>
                  </div>
                  
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display text-4xl text-[#6B1E2E]">₹{plan.price.toLocaleString()}</span>
                      <span className="font-ui text-mutedgray">/{plan.period}</span>
                    </div>
                    <p className="font-ui text-sm text-mutedgray mt-2">
                      Up to {plan.studentCount} students
                    </p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="font-body text-sm text-mutedgray">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-4 rounded-xl font-ui font-semibold transition-all ${
                      selectedPlan === plan.id
                        ? 'bg-[#6B1E2E] text-parchment'
                        : 'bg-parchment text-[#6B1E2E] hover:bg-[#6B1E2E] hover:text-parchment'
                    }`}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-parchment rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl text-ink mb-4">Get in Touch</h2>
              <p className="font-body text-mutedgray">
                Fill out the form below and our team will contact you within 24 hours
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-ui text-sm text-mutedgray mb-2">College/University Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                    <input
                      type="text"
                      required
                      value={formData.collegeName}
                      onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
                      placeholder="Enter college name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-ui text-sm text-mutedgray mb-2">Contact Person *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-ui text-sm text-mutedgray mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-ui text-sm text-mutedgray mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block font-ui text-sm text-mutedgray mb-2">Number of Students *</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                  <input
                    type="number"
                    required
                    value={formData.studentCount}
                    onChange={(e) => setFormData({...formData, studentCount: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-parchment-dark bg-white font-ui text-sm focus:outline-none focus:border-[#6B1E2E]"
                    placeholder="Approximate number of students"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] text-parchment rounded-xl font-ui font-semibold hover:shadow-lg hover:shadow-[#6B1E2E]/30 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-ink mb-4">
              Trusted by <span className="text-[#6B1E2E]">Leading Institutions</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                college: 'National Law University, Delhi', 
                quote: 'EduLaw has transformed how our students access legal resources. The institutional license is excellent value.',
                person: 'Prof. Rajesh Kumar'
              },
              { 
                college: 'GLC Mumbai', 
                quote: 'Our students love the comprehensive notes and mock tests. Highly recommended for all law colleges.',
                person: 'Dr. Priya Sharma'
              },
              { 
                college: 'Faculty of Law, DU', 
                quote: 'The analytics dashboard helps us track student progress. Great support from the EduLaw team.',
                person: 'Prof. Anil Verma'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-parchment-dark p-8"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-5 h-5 text-[#C9A84C] fill-[#C9A84C]" />
                  ))}
                </div>
                <p className="font-body text-mutedgray mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-ui font-semibold text-ink">{testimonial.person}</p>
                  <p className="font-ui text-sm text-mutedgray">{testimonial.college}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#6B1E2E] to-[#8B2E42] rounded-3xl p-12 text-center text-parchment">
            <h2 className="font-display text-3xl mb-4">Ready to Get Started?</h2>
            <p className="font-body mb-8 opacity-90">
              Contact us today for a personalized demo and custom quote for your institution
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 bg-parchment text-[#6B1E2E] rounded-xl font-ui font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us: +91 98765 43210
              </button>
              <button className="px-8 py-4 border-2 border-parchment text-parchment rounded-xl font-ui font-semibold hover:bg-parchment/10 transition-all flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email: colleges@edulaw.in
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
