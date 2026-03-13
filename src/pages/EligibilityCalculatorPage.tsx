import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { schemes } from '@/data/schemes';
import { useEligibility, getEligibilityLabel, type UserProfile } from '@/hooks/use-eligibility';
import { Button } from '@/components/ui/button';

const EligibilityCalculatorPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [profileData, setProfileData] = useState<UserProfile>({
    age: 30,
    education: '12th',
    category: 'general',
    occupation: 'other',
    monthlyIncome: 20000,
    location: 'urban',
    isWoman: false,
    isPWD: false,
    isBPL: false,
  });

  const eligibilityResults = useEligibility(schemes, profileData);
  const highlySuitable = eligibilityResults.filter((r) => r.eligibilityScore >= 80);
  const suitable = eligibilityResults.filter((r) => r.eligibilityScore >= 60 && r.eligibilityScore < 80);

  const handleCalculate = () => {
    setStep('results');
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 to-slate-800 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur-md px-5 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white mb-3"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Eligibility Calculator</h1>
        <p className="text-sm text-white/60">Find schemes you qualify for</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 space-y-4 px-5 py-6"
          >
            {/* Age */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Age: {profileData.age} years
              </label>
              <input
                type="range"
                min="15"
                max="80"
                value={profileData.age}
                onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Education */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Education Level</label>
              <select
                value={profileData.education}
                onChange={(e) => setProfileData({ ...profileData, education: e.target.value as any })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="below10" className="bg-slate-800">Below 10th</option>
                <option value="10th" className="bg-slate-800">10th Pass</option>
                <option value="12th" className="bg-slate-800">12th Pass</option>
                <option value="graduate" className="bg-slate-800">Graduate</option>
                <option value="postgraduate" className="bg-slate-800">Post-Graduate</option>
              </select>
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Occupation</label>
              <select
                value={profileData.occupation}
                onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value as any })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="farmer" className="bg-slate-800">Farmer</option>
                <option value="student" className="bg-slate-800">Student</option>
                <option value="worker" className="bg-slate-800">Worker/Labour</option>
                <option value="business" className="bg-slate-800">Business/Self-employed</option>
                <option value="housewife" className="bg-slate-800">Housewife</option>
                <option value="senior" className="bg-slate-800">Retired/Senior</option>
                <option value="other" className="bg-slate-800">Other</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Social Category</label>
              <select
                value={profileData.category}
                onChange={(e) => setProfileData({ ...profileData, category: e.target.value as any })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="general" className="bg-slate-800">General</option>
                <option value="sc" className="bg-slate-800">Scheduled Caste (SC)</option>
                <option value="st" className="bg-slate-800">Scheduled Tribe (ST)</option>
                <option value="obc" className="bg-slate-800">Other Backward Class (OBC)</option>
                <option value="ewc" className="bg-slate-800">Economically Weaker (EWC)</option>
              </select>
            </div>

            {/* Monthly Income */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Monthly Income: ₹{profileData.monthlyIncome.toLocaleString()}
              </label>
              <input
                type="range"
                min="0"
                max="200000"
                step="5000"
                value={profileData.monthlyIncome}
                onChange={(e) => setProfileData({ ...profileData, monthlyIncome: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-xs text-white/50">Annual: ₹{(profileData.monthlyIncome * 12).toLocaleString()}</p>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Location</label>
              <div className="flex gap-3">
                {(['rural', 'urban'] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setProfileData({ ...profileData, location: loc })}
                    className={`flex-1 rounded-lg py-3 font-semibold transition ${
                      profileData.location === loc
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/15'
                    }`}
                  >
                    {loc === 'rural' ? '🌾 Rural' : '🏙️ Urban'}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.isWoman}
                  onChange={(e) => setProfileData({ ...profileData, isWoman: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-white/20 bg-white/5 accent-pink-500"
                />
                <span className="text-sm font-medium text-white">I am a woman</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.isPWD}
                  onChange={(e) => setProfileData({ ...profileData, isPWD: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-white/20 bg-white/5 accent-blue-500"
                />
                <span className="text-sm font-medium text-white">Person with Disability (PWD)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.isBPL}
                  onChange={(e) => setProfileData({ ...profileData, isBPL: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-white/20 bg-white/5 accent-green-500"
                />
                <span className="text-sm font-medium text-white">Below Poverty Line (BPL)</span>
              </label>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 font-bold text-white shadow-xl transition hover:shadow-2xl mt-8"
            >
              Calculate My Eligible Schemes
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 space-y-4 px-5 py-6"
          >
            {/* Summary Cards */}
            <div className="grid gap-3 grid-cols-2">
              <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4">
                <div className="text-3xl font-black text-green-400">{highlySuitable.length}</div>
                <p className="text-xs text-green-200 mt-1">Highly Suitable</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-4">
                <div className="text-3xl font-black text-blue-400">{suitable.length}</div>
                <p className="text-xs text-blue-200 mt-1">Suitable</p>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={handleBackToForm}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              ← Modify Profile
            </button>

            {/* Highly Suitable Section */}
            {highlySuitable.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-400" />
                  <h2 className="font-bold text-white">Top Matches ({highlySuitable.length})</h2>
                </div>
                {highlySuitable.map(({ scheme, eligibilityScore }) => (
                  <SchemeCard key={scheme.id} scheme={scheme} score={eligibilityScore} />
                ))}
              </div>
            )}

            {/* Suitable Section */}
            {suitable.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <h2 className="font-bold text-white">Also Eligible ({suitable.length})</h2>
                </div>
                <div className="space-y-2">
                  {suitable.slice(0, 5).map(({ scheme, eligibilityScore }) => (
                    <SchemeCard key={scheme.id} scheme={scheme} score={eligibilityScore} />
                  ))}
                  {suitable.length > 5 && (
                    <p className="text-xs text-white/50 text-center py-2">
                      +{suitable.length - 5} more schemes
                    </p>
                  )}
                </div>
              </div>
            )}

            {highlySuitable.length === 0 && suitable.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-white/60">No exact matches found.</p>
                <p className="text-xs text-white/40 mt-2">Try adjusting your profile to see more options.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SchemeCardProps {
  scheme: typeof schemes[0];
  score: number;
}

const SchemeCard = ({ scheme, score }: SchemeCardProps) => {
  const navigate = useNavigate();
  const { label, color } = getEligibilityLabel(score);

  return (
    <motion.button
      onClick={() => navigate(`/scheme/${scheme.id}`)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-white/20"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${scheme.colorGradient}`}>
          <span className="text-xl">{scheme.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white line-clamp-1">{scheme.name}</p>
          <p className="text-xs text-white/50 line-clamp-1">{scheme.benefit}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  score >= 80
                    ? 'bg-green-500'
                    : score >= 60
                    ? 'bg-blue-500'
                    : score >= 40
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ${color}`}>{score}%</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default EligibilityCalculatorPage;
