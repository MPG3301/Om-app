/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Heart, BarChart2, User, Settings, 
  Moon, Sun, Wind, Zap, Award, LogOut, ChevronRight,
  Shield, Star, Check, LayoutDashboard, Music, Plus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useAuthStore } from './store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user, logout } = useAuthStore();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4 flex justify-between items-center">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => onNavigate('landing')}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Wind className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-indigo-900">Om app</span>
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-indigo-900/70 hover:text-indigo-900 transition-colors">Dashboard</button>
            <button onClick={() => onNavigate('meditate')} className="text-sm font-medium text-indigo-900/70 hover:text-indigo-900 transition-colors">Meditate</button>
            <div className="flex items-center gap-3 pl-6 border-l border-black/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-indigo-900">{user.name}</p>
                <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold">{user.plan_type} PLAN</p>
              </div>
              <button onClick={logout} className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('login')} className="text-sm font-bold text-indigo-900">Login</button>
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const BreathingCircle = () => {
  const [stage, setStage] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStage(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <div className="relative">
        <motion.div
          animate={{
            scale: stage === 'Inhale' ? 1.5 : stage === 'Hold' ? 1.5 : 1,
            opacity: stage === 'Inhale' ? 0.8 : stage === 'Hold' ? 1 : 0.4,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-200 to-purple-300 blur-2xl absolute inset-0"
        />
        <motion.div
          animate={{
            scale: stage === 'Inhale' ? 1.5 : stage === 'Hold' ? 1.5 : 1,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-48 h-48 rounded-full border-2 border-indigo-400/30 flex items-center justify-center relative z-10"
        >
          <span className="text-indigo-900 font-medium tracking-widest uppercase text-sm">{stage}</span>
        </motion.div>
      </div>
      <p className="text-indigo-900/60 text-sm font-medium italic">Follow the rhythm of your soul</p>
    </div>
  );
};

// --- Pages ---

const LandingPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            AI-Powered Spiritual Growth
          </span>
          <h1 className="text-6xl md:text-8xl font-bold text-indigo-950 leading-[0.9] tracking-tighter mb-8">
            Find Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic">Inner OM.</span>
          </h1>
          <p className="text-xl text-indigo-900/60 max-w-lg mb-10 leading-relaxed">
            Personalized frequency healing, AI-driven mood recommendations, and deep meditation tracks designed for your unique journey.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
            >
              Start Your Journey
            </button>
            <button className="px-8 py-4 rounded-2xl font-bold text-indigo-900 border border-indigo-100 hover:bg-indigo-50 transition-all">
              Explore Tracks
            </button>
          </div>
        </motion.div>
        
        <div className="relative flex justify-center">
          <BreathingCircle />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-indigo-50/50 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-950 mb-4">Simple, Spiritual Pricing</h2>
          <p className="text-indigo-900/60">Choose the path that resonates with your soul.</p>
        </div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="bg-white p-10 rounded-3xl border border-indigo-100 shadow-sm">
            <h3 className="text-xl font-bold text-indigo-950 mb-2">Free Plan</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-indigo-950">₹0</span>
              <span className="text-indigo-900/40 font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "3 chants per day",
                "Basic mood tracking",
                "7 days history",
                "Email reminders"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-indigo-900/70">
                  <Check className="w-4 h-4 text-emerald-500" /> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full py-4 rounded-2xl font-bold text-indigo-900 border border-indigo-100 hover:bg-indigo-50 transition-all"
            >
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="bg-indigo-600 p-10 rounded-3xl shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-indigo-950 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>
            <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">₹299</span>
              <span className="text-indigo-100/60 font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-10">
              {[
                "Unlimited chants",
                "AI mood recommendations",
                "Full analytics dashboard",
                "All frequency tracks",
                "Meditation streak rewards",
                "Priority support"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-indigo-50">
                  <Check className="w-4 h-4 text-yellow-400" /> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full py-4 rounded-2xl font-bold bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-lg"
            >
              Go Pro Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, recRes] = await Promise.all([
          fetch('/api/moods/history', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/ai/recommendation', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const histData = await histRes.json();
        const recData = await recRes.json();
        setHistory(histData);
        setRecommendation(recData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const chartData = history.slice().reverse().map(h => ({
    date: new Date(h.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
    rating: h.rating
  }));

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-indigo-950">Welcome back, {user?.name}</h1>
        <p className="text-indigo-900/60">Your spiritual journey is unfolding beautifully.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Streak', value: '12 Days', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Minutes', value: '420m', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { label: 'Sessions', value: '24', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Level', value: 'Seeker', icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <p className="text-xs font-bold text-indigo-900/40 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold text-indigo-950">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-indigo-950">Mood Journey</h3>
              <select className="text-xs font-bold text-indigo-900/60 bg-indigo-50 px-3 py-1.5 rounded-lg border-none focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                  <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Insight</span>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-4">Tomorrow's Path</h3>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
                    <p className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Suggested Frequency</p>
                    <p className="text-xl font-bold">{recommendation?.frequency || '528Hz'}</p>
                    <p className="text-sm opacity-80 mt-1">{recommendation?.type || 'Heart Chakra Healing'}</p>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 italic">
                    "{recommendation?.advice || 'Your energy is shifting towards clarity. Embrace the silence between your thoughts tomorrow.'}"
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
            <h3 className="font-bold text-indigo-950 mb-6">Recent Moods</h3>
            <div className="space-y-4">
              {history.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                    {h.rating}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-950">{h.note || 'Meditation Session'}</p>
                    <p className="text-[10px] text-indigo-900/40">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Meditate = () => {
  const { token, user } = useAuthStore();
  const [chants, setChants] = useState<any[]>([]);
  const [activeChant, setActiveChant] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodRating, setMoodRating] = useState(3);
  const [moodNote, setMoodNote] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/chants', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setChants(data);
        if (data.length > 0) setActiveChant(data[0]);
      });
  }, [token]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFinish = () => {
    setShowMoodModal(true);
    setIsPlaying(false);
  };

  const submitMood = async () => {
    await fetch('/api/moods', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        rating: moodRating,
        note: moodNote,
        meditation_duration: 10,
        frequency: activeChant?.frequency
      })
    });
    setShowMoodModal(false);
    setMoodNote('');
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Player */}
        <div className="bg-white p-12 rounded-[40px] border border-black/5 shadow-2xl shadow-indigo-100 flex flex-col items-center text-center">
          <div className="relative mb-12">
            <motion.div 
              animate={isPlaying ? { rotate: 360 } : {}}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-64 h-64 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-1"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-inner">
                <img 
                  src={`https://picsum.photos/seed/${activeChant?.id || 'om'}/400/400`} 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl"
                />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold text-indigo-950 mb-2">{activeChant?.title || 'Select a Chant'}</h2>
          <p className="text-indigo-500 font-bold tracking-widest uppercase text-xs mb-8">{activeChant?.frequency}</p>
          
          <div className="flex items-center gap-8 mb-12">
            <button className="p-4 hover:bg-indigo-50 rounded-full text-indigo-900 transition-colors">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
            </button>
            <button className="p-4 hover:bg-indigo-50 rounded-full text-indigo-900 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <audio 
            ref={audioRef} 
            src={activeChant?.audio_url} 
            onEnded={handleFinish}
          />

          <div className="w-full h-1.5 bg-indigo-50 rounded-full overflow-hidden mb-4">
            <motion.div 
              animate={isPlaying ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 600, ease: "linear" }}
              className="h-full bg-indigo-600"
            />
          </div>
          <div className="flex justify-between w-full text-[10px] font-bold text-indigo-900/40 uppercase tracking-widest">
            <span>0:00</span>
            <span>10:00</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-indigo-950">Frequency Library</h3>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{chants.length} Tracks</span>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {chants.map((chant) => (
              <div 
                key={chant.id}
                onClick={() => {
                  if (chant.is_premium && user?.plan_type === 'FREE') return;
                  setActiveChant(chant);
                  setIsPlaying(false);
                }}
                className={cn(
                  "p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group",
                  activeChant?.id === chant.id 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white border-black/5 hover:border-indigo-200 text-indigo-950"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    activeChant?.id === chant.id ? "bg-white/20" : "bg-indigo-50"
                  )}>
                    <Music className={cn("w-5 h-5", activeChant?.id === chant.id ? "text-white" : "text-indigo-600")} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{chant.title}</p>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest", activeChant?.id === chant.id ? "text-indigo-100" : "text-indigo-400")}>
                      {chant.frequency} • {chant.category}
                    </p>
                  </div>
                </div>
                {chant.is_premium && user?.plan_type === 'FREE' ? (
                  <Shield className="w-4 h-4 text-yellow-400" />
                ) : (
                  <button className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    activeChant?.id === chant.id ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                  )}>
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Modal */}
      <AnimatePresence>
        {showMoodModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm"
              onClick={() => setShowMoodModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-10 relative z-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-indigo-950 mb-2 text-center">How do you feel?</h3>
              <p className="text-indigo-900/40 text-sm text-center mb-8 italic">Your mood helps us personalize your path.</p>
              
              <div className="flex justify-between mb-10">
                {[1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num}
                    onClick={() => setMoodRating(num)}
                    className={cn(
                      "w-14 h-14 rounded-2xl font-bold text-xl transition-all",
                      moodRating === num 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110" 
                        : "bg-indigo-50 text-indigo-900/40 hover:bg-indigo-100"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <textarea 
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Write a short reflection..."
                className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600 mb-8 min-h-[100px]"
              />

              <button 
                onClick={submitMood}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Save Reflection
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthPage = ({ type, onNavigate }: { type: 'login' | 'signup', onNavigate: (page: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = type === 'login' ? { email, password } : { email, password, name };
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuth(data.user, data.token);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] border border-black/5 shadow-2xl shadow-indigo-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <Wind className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-indigo-950">{type === 'login' ? 'Welcome Back' : 'Join OM'}</h2>
          <p className="text-indigo-900/40 text-sm mt-2">Enter your details to continue your journey.</p>
        </div>

        {error && <p className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-xl mb-6">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <input 
              type="text" placeholder="Full Name" required
              value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
            />
          )}
          <input 
            type="email" placeholder="Email Address" required
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
          />
          <input 
            type="password" placeholder="Password" required
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
          />
          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all mt-4">
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-indigo-900/40 mt-8">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => onNavigate(type === 'login' ? 'signup' : 'login')}
            className="text-indigo-600 ml-1 hover:underline"
          >
            {type === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newChant, setNewChant] = useState({
    title: '', description: '', frequency: '', audio_url: '', category: 'General', is_premium: false
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleAddChant = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/chants', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newChant)
    });
    setNewChant({ title: '', description: '', frequency: '', audio_url: '', category: 'General', is_premium: false });
    alert('Chant added successfully!');
  };

  const toggleUserStatus = async (userId: number, currentStatus: number) => {
    await fetch('/api/admin/users/toggle-status', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ userId, is_disabled: !currentStatus })
    });
    fetchStats();
  };

  if (loading) return <div className="pt-32 text-center text-indigo-900/60">Loading Admin Panel...</div>;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-indigo-950">Admin Dashboard</h1>
        <p className="text-indigo-900/60">Manage your spiritual community and content.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pro Subscriptions', value: stats?.proUsers || 0, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Total Meditations', value: stats?.totalMoods || 0, icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-bold text-indigo-900/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-bold text-indigo-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Add Content */}
        <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm">
          <h3 className="text-xl font-bold text-indigo-950 mb-8">Add New Chant</h3>
          <form onSubmit={handleAddChant} className="space-y-4">
            <input 
              type="text" placeholder="Chant Title" required
              value={newChant.title} onChange={e => setNewChant({...newChant, title: e.target.value})}
              className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Frequency (e.g. 528Hz)" required
                value={newChant.frequency} onChange={e => setNewChant({...newChant, frequency: e.target.value})}
                className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
              />
              <input 
                type="text" placeholder="Category" required
                value={newChant.category} onChange={e => setNewChant({...newChant, category: e.target.value})}
                className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <input 
              type="url" placeholder="Audio URL (MP3)" required
              value={newChant.audio_url} onChange={e => setNewChant({...newChant, audio_url: e.target.value})}
              className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600"
            />
            <textarea 
              placeholder="Description"
              value={newChant.description} onChange={e => setNewChant({...newChant, description: e.target.value})}
              className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm text-indigo-900 focus:ring-2 focus:ring-indigo-600 min-h-[100px]"
            />
            <label className="flex items-center gap-3 cursor-pointer p-2">
              <input 
                type="checkbox" 
                checked={newChant.is_premium} onChange={e => setNewChant({...newChant, is_premium: e.target.checked})}
                className="w-5 h-5 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-950">Premium Content</span>
            </label>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
              Upload Chant
            </button>
          </form>
        </div>

        {/* User Management */}
        <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm">
          <h3 className="text-xl font-bold text-indigo-950 mb-8">Recent Users</h3>
          <div className="space-y-4">
            {stats?.recentUsers?.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/30 border border-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-950">{u.name}</p>
                    <p className="text-[10px] text-indigo-900/40">{u.email} • {u.plan_type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleUserStatus(u.id, u.is_disabled)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    u.is_disabled 
                      ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" 
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  )}
                >
                  {u.is_disabled ? 'Enable' : 'Disable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [page, setPage] = useState('landing');
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && (page === 'login' || page === 'signup')) {
      setPage('dashboard');
    }
  }, [user, page]);

  const renderPage = () => {
    switch (page) {
      case 'landing': return <LandingPage onNavigate={setPage} />;
      case 'login': return <AuthPage type="login" onNavigate={setPage} />;
      case 'signup': return <AuthPage type="signup" onNavigate={setPage} />;
      case 'dashboard': return <Dashboard />;
      case 'meditate': return <Meditate />;
      case 'admin': return <AdminPanel />;
      default: return <LandingPage onNavigate={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-indigo-950 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Navbar onNavigate={setPage} />
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="relative z-10 border-t border-black/5 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Wind className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-indigo-900">Om app</span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-indigo-900/40 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
            {user?.role === 'admin' && (
              <button onClick={() => setPage('admin')} className="text-indigo-600 hover:underline">Admin Panel</button>
            )}
          </div>
          <p className="text-[10px] font-bold text-indigo-900/20 uppercase tracking-[0.2em]">© 2026 Om app. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
