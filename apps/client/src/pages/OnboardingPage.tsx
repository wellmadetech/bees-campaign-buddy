import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  ArrowRight, ArrowLeft, Check, User, Building2, Megaphone,
  Sparkles, Package, BarChart3, Bell, MessageSquare
} from 'lucide-react';

const BEES_BRANCHES = [
  { id: 'branch-1', name: 'Northeast Distribution', code: 'NE-001' },
  { id: 'branch-2', name: 'Southeast Distribution', code: 'SE-001' },
  { id: 'branch-3', name: 'West Coast Distribution', code: 'WC-001' },
  { id: 'branch-4', name: 'Midwest Distribution', code: 'MW-001' },
  { id: 'branch-5', name: 'Southwest Distribution', code: 'SW-001' },
];

const TOUR_SLIDES = [
  {
    icon: Megaphone,
    title: 'Create Campaigns in Minutes',
    description: 'Use the step-by-step wizard to build campaigns — select your type, add content, define your audience, and submit. The orchestration engine handles the rest.',
    color: 'text-brand-600 bg-brand-100',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Copy Assistant',
    description: 'Stuck on what to write? The AI Copy Assistant generates headlines, body text, and CTAs tailored to your campaign type. Just pick and go.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: Package,
    title: 'Subscribe to Campaign Bundles',
    description: 'Major events like Super Bowl, Cinco de Mayo, and World Cup come pre-packaged with coordinated campaign series. Subscribe in one click.',
    color: 'text-info-600 bg-info-50',
  },
  {
    icon: BarChart3,
    title: 'Track Your Performance',
    description: 'See real-time metrics on every launched campaign — open rates, click-through rates, and estimated revenue. Know what works and do more of it.',
    color: 'text-success-600 bg-success-50',
  },
  {
    icon: Bell,
    title: 'Stay in the Loop',
    description: 'Get notified instantly when your campaign status changes, when someone comments, or when action is needed. No more checking manually.',
    color: 'text-warn-600 bg-warn-50',
  },
  {
    icon: MessageSquare,
    title: 'Collaborate Directly',
    description: 'Leave comments on campaigns to communicate with content creators and managers. No more back-and-forth emails.',
    color: 'text-danger-600 bg-danger-50',
  },
];

type Step = 'welcome' | 'profile' | 'branches' | 'tour' | 'done';

export function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>('welcome');
  const [profile, setProfile] = useState({ displayName: user?.displayName ?? '', phone: '', timezone: 'America/New_York' });
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [tourSlide, setTourSlide] = useState(0);
  const isWholesaler = user?.role === 'wholesaler_manager';

  const completeOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 mb-6 shadow-lg shadow-brand-500/20">
              <span className="text-white text-3xl font-bold">B</span>
            </div>
            <h1 className="text-2xl font-semibold text-surface-900 tracking-tight mb-2">
              Welcome to Campaign Buddy
            </h1>
            <p className="text-surface-500 mb-2">BEES One Digital Communications Portal</p>

            <div className="card p-6 mt-8 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center text-lg font-semibold text-surface-600">
                  {user?.displayName?.split(' ').map(n => n[0]).join('') ?? '?'}
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-surface-900">{user?.displayName}</div>
                  <div className="text-sm text-surface-500">{user?.email}</div>
                </div>
              </div>

              <div className="bg-surface-50 rounded-lg p-4 mb-4">
                <div className="text-[13px] font-medium text-surface-700 mb-1">Your Role</div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-brand">
                    {user?.role === 'dc_manager' ? 'DC Manager' : user?.role === 'content_creator' ? 'Content Creator' : 'Wholesaler Manager'}
                  </span>
                  <span className="text-xs text-surface-400">
                    {user?.role === 'dc_manager'
                      ? 'Full access to manage campaigns, users, and workflows'
                      : user?.role === 'content_creator'
                        ? 'Review drafts, customize content, manage templates'
                        : 'Submit campaigns, track status, view performance'}
                  </span>
                </div>
              </div>

              {isWholesaler && (
                <div className="bg-brand-50 rounded-lg p-4 border border-brand-200/50">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-brand-800">Wholesaler Account</div>
                      <p className="text-xs text-brand-600 mt-0.5">You'll select your distribution branches in the next step to scope your campaigns.</p>
                    </div>
                  </div>
                </div>
              )}

              {!isWholesaler && (
                <div className="bg-info-50 rounded-lg p-4 border border-info-200/50">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-info-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-info-800">BEES Internal Team</div>
                      <p className="text-xs text-info-600 mt-0.5">You have access to all branches and internal management tools.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setStep('profile')} className="btn-primary mt-6 w-full">
              Let's Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Setup */}
        {step === 'profile' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Your Profile</h2>
                <p className="text-sm text-surface-400">Confirm your details</p>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Display Name</label>
                <input value={profile.displayName} onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Phone (optional)</label>
                <input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="input-field" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Timezone</label>
                <select value={profile.timezone} onChange={(e) => setProfile(p => ({ ...p, timezone: e.target.value }))} className="input-field">
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-surface-700 mb-1.5">Notification Preferences</label>
                <div className="space-y-2">
                  {['Campaign status changes', 'New comments on my campaigns', 'Bundle launch alerts'].map((pref) => (
                    <label key={pref} className="flex items-center gap-2.5 text-sm text-surface-700 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-surface-300" />
                      {pref}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('welcome')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep(isWholesaler ? 'branches' : 'tour')} className="btn-primary">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Branch Selection (Wholesalers only) */}
        {step === 'branches' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Select Your Branches</h2>
                <p className="text-sm text-surface-400">Choose the distribution branches you manage</p>
              </div>
            </div>

            <div className="card p-2 space-y-1">
              {BEES_BRANCHES.map((branch) => (
                <label
                  key={branch.id}
                  className={`flex items-center gap-3 p-3.5 rounded-lg cursor-pointer transition-all ${
                    selectedBranches.includes(branch.id) ? 'bg-brand-50 border border-brand-200' : 'hover:bg-surface-50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBranches.includes(branch.id)}
                    onChange={(e) => {
                      setSelectedBranches(prev =>
                        e.target.checked ? [...prev, branch.id] : prev.filter(id => id !== branch.id)
                      );
                    }}
                    className="rounded border-surface-300"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-surface-900">{branch.name}</div>
                    <div className="text-xs text-surface-400">{branch.code}</div>
                  </div>
                  {selectedBranches.includes(branch.id) && (
                    <Check className="w-4 h-4 text-brand-600" />
                  )}
                </label>
              ))}
            </div>

            <p className="text-xs text-surface-400 mt-3 px-1">You can update branch access later in Settings.</p>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep('profile')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
              <button onClick={() => setStep('tour')} disabled={selectedBranches.length === 0} className="btn-primary">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Product Tour */}
        {step === 'tour' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-surface-900">Quick Tour</h2>
              <p className="text-sm text-surface-400">Here's what you can do with Campaign Buddy</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {TOUR_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTourSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === tourSlide ? 'bg-surface-900 w-6' : 'bg-surface-300'
                  }`}
                />
              ))}
            </div>

            <div className="card p-8 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${TOUR_SLIDES[tourSlide].color}`}>
                {(() => { const Icon = TOUR_SLIDES[tourSlide].icon; return <Icon className="w-7 h-7" strokeWidth={1.5} />; })()}
              </div>
              <h3 className="text-[17px] font-semibold text-surface-900 mb-2">{TOUR_SLIDES[tourSlide].title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed max-w-sm mx-auto">{TOUR_SLIDES[tourSlide].description}</p>
            </div>

            <div className="flex justify-between mt-6">
              {tourSlide > 0 ? (
                <button onClick={() => setTourSlide(s => s - 1)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Previous</button>
              ) : (
                <button onClick={() => setStep(isWholesaler ? 'branches' : 'profile')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
              )}
              {tourSlide < TOUR_SLIDES.length - 1 ? (
                <button onClick={() => setTourSlide(s => s + 1)} className="btn-primary">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setStep('done')} className="btn-primary">
                  Finish Tour <Check className="w-4 h-4" />
                </button>
              )}
            </div>

            <button onClick={() => setStep('done')} className="btn-ghost text-xs mx-auto mt-3 block">Skip tour</button>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 mb-2">You're All Set!</h2>
            <p className="text-sm text-surface-500 mb-8 max-w-sm mx-auto">
              Your account is configured and ready to go. Start creating campaigns or explore the platform.
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8">
              <button onClick={() => { completeOnboarding(); navigate('/campaigns/new'); }} className="card p-4 text-center hover:shadow-[--shadow-elevated] transition-shadow">
                <Megaphone className="w-6 h-6 text-brand-500 mx-auto mb-2" strokeWidth={1.5} />
                <span className="text-sm font-medium text-surface-900">Create Campaign</span>
              </button>
              <button onClick={() => { completeOnboarding(); navigate('/bundles'); }} className="card p-4 text-center hover:shadow-[--shadow-elevated] transition-shadow">
                <Package className="w-6 h-6 text-info-500 mx-auto mb-2" strokeWidth={1.5} />
                <span className="text-sm font-medium text-surface-900">Browse Bundles</span>
              </button>
            </div>

            <button onClick={completeOnboarding} className="btn-primary w-full max-w-sm">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex justify-center gap-2 mt-8">
            {(['welcome', 'profile', ...(isWholesaler ? ['branches'] : []), 'tour'] as Step[]).map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${step === s ? 'bg-surface-900' : arr.indexOf(step) > i ? 'bg-success-500' : 'bg-surface-300'}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
