import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, Mail, Lock, Eye, EyeOff, ArrowRight,
  Chrome, UserPlus 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { signInWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        toast.success("Welcome back!");
      } else {
        await signupWithEmail(email, password);
        toast.success("Account created successfully!");
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast.success("Successfully logged in with Google!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-parchment flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-burgundy flex items-center justify-center">
              <Scale className="w-6 h-6 text-gold" />
            </div>
            <span className="font-display text-2xl text-ink">
              Edu<span className="text-gold">Law</span>
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="font-display text-2xl text-ink text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-mutedgray text-center mb-6">
            {isLogin 
              ? 'Sign in to access your notes and downloads' 
              : 'Join thousands of law students on EduLaw'}
          </p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-parchment-dark rounded-xl font-ui font-medium text-ink hover:bg-parchment-dark transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-parchment-dark" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-mutedgray text-sm font-ui">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block font-ui text-sm text-ink mb-1">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-xl font-ui text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/10"
                    placeholder="Your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-ui text-sm text-ink mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-parchment-dark rounded-xl font-ui text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-ui text-sm text-ink mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedgray" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-parchment-dark rounded-xl font-ui text-sm focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedgray hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-parchment-dark" />
                  <span className="text-sm text-mutedgray">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-burgundy hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-burgundy text-parchment rounded-xl font-ui font-semibold hover:bg-burgundy-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-mutedgray">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-burgundy font-medium hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <Link to="/" className="text-mutedgray hover:text-ink transition-colors">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
