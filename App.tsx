import React, { useState, useEffect, useRef } from 'react';
import { Navigation, View } from './components/Navigation';
import { Button } from './components/Button';
import { analyzeVideoInteraction, generateEmergencyTips } from './services/geminiService';
import { AnalysisResult, InterventionTask, DailyStat, Emotion } from './types';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  Brain, 
  Heart,
  Video,
  Mic,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import clsx from 'clsx';

// --- Components for different views ---

const DashboardView: React.FC<{
  onStartAnalysis: () => void;
  tasks: InterventionTask[];
  onToggleTask: (id: string) => void;
}> = ({ onStartAnalysis, tasks, onToggleTask }) => {
  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hello, Sarah</h1>
          <p className="text-slate-500">Let's continue Leo's journey.</p>
        </div>
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">S</span>
        </div>
      </header>

      {/* Daily Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Today's Synchrony</p>
            <h2 className="text-4xl font-bold">78%</h2>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <TrendingUp size={24} className="text-white" />
          </div>
        </div>
        <div className="w-full bg-blue-900/30 h-2 rounded-full mb-2">
          <div className="bg-white h-2 rounded-full w-[78%]"></div>
        </div>
        <p className="text-sm text-blue-100">+12% from last week. Great job!</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onStartAnalysis}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-95"
        >
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
            <Video size={24} />
          </div>
          <span className="font-semibold text-slate-700">New Analysis</span>
        </button>
        <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-95">
          <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
            <Brain size={24} />
          </div>
          <span className="font-semibold text-slate-700">Learn</span>
        </button>
      </div>

      {/* Daily Tasks */}
      <div>
        <h3 className="font-bold text-slate-800 text-lg mb-4">Today's Goals</h3>
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              className={clsx(
                "p-4 rounded-xl border flex items-center gap-4 transition-all",
                task.completed 
                  ? "bg-slate-50 border-slate-200 opacity-75" 
                  : "bg-white border-slate-200 shadow-sm"
              )}
            >
              <button 
                onClick={() => onToggleTask(task.id)}
                className={clsx(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  task.completed 
                    ? "bg-green-500 border-green-500 text-white" 
                    : "border-slate-300 text-transparent hover:border-blue-400"
                )}
              >
                <CheckCircle size={14} fill="currentColor" />
              </button>
              <div className="flex-1">
                <h4 className={clsx("font-semibold", task.completed && "line-through text-slate-500")}>{task.title}</h4>
                <p className="text-xs text-slate-500">{task.duration} min • {task.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalysisView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        // Strip prefix data:image/jpeg;base64,
        const base64Data = base64String.split(',')[1];
        
        const data = await analyzeVideoInteraction(base64Data, file.type);
        setResult(data);
      } catch (error) {
        console.error(error);
        alert("Analysis failed. Please try a shorter video or different format.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="pb-24 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">PCI Analysis</h1>
        <p className="text-slate-500">Upload interaction videos for AI assessment.</p>
      </header>

      {!result && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
            <Upload size={32} />
          </div>
          <div>
            <p className="font-medium text-slate-700">Tap to upload video</p>
            <p className="text-xs text-slate-400 mt-1">MP4, MOV up to 50MB suggested</p>
          </div>
          <input 
            type="file" 
            accept="video/*,image/*" // Accepting images too for simpler demos
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Select File
          </Button>
          {file && <p className="text-sm text-green-600 font-medium">Selected: {file.name}</p>}
          
          {file && (
            <Button className="w-full mt-4" onClick={runAnalysis} isLoading={isAnalyzing}>
              Analyze Interaction
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Score Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-slate-800">Analysis Results</h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">AI Generated</span>
            </div>
            
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full border-8 border-blue-500 flex items-center justify-center text-2xl font-bold text-slate-800 mb-2">
                  {result.synchronyScore}
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Synchrony</p>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Heart size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Child Emotion</p>
                        <p className="font-medium text-slate-700">{result.childEmotion}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Brain size={16} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Interactions</p>
                        <p className="font-medium text-slate-700">{result.turnTakingCount} turns</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
              {result.feedback}
            </div>
          </div>

          {/* Key Moments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Key Moments</h3>
            <div className="space-y-4">
              {result.keyMoments.map((moment, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded h-fit text-slate-500">{moment.timestamp}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{moment.description}</p>
                  </div>
                  <div className={clsx(
                    "w-2 h-2 rounded-full mt-1.5",
                    moment.type === 'positive' ? 'bg-green-500' : moment.type === 'negative' ? 'bg-red-500' : 'bg-slate-300'
                  )} />
                </div>
              ))}
            </div>
          </div>

           <Button variant="secondary" className="w-full" onClick={() => setResult(null)}>
            Analyze Another Video
          </Button>
        </div>
      )}
    </div>
  );
};

const SafetyView: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [distressLevel, setDistressLevel] = useState(10); // Simulated
  const [emergencyTips, setEmergencyTips] = useState<string[]>([]);
  
  // Simulation of monitoring
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isMonitoring) {
        interval = setInterval(() => {
            // Random walk simulation for demo
            setDistressLevel(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.4) * 10)));
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Trigger alert simulation
  useEffect(() => {
    if (distressLevel > 80 && emergencyTips.length === 0) {
        generateEmergencyTips("high distress, screaming").then(setEmergencyTips);
    }
    if (distressLevel < 50) setEmergencyTips([]);
  }, [distressLevel]);

  return (
    <div className="pb-24 space-y-6">
       <header>
        <h1 className="text-2xl font-bold text-slate-800">Guardian Monitor</h1>
        <p className="text-slate-500">Real-time distress detection & safety zones.</p>
      </header>

      {/* Monitor Status */}
      <div className={clsx(
        "rounded-2xl p-8 flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden",
        distressLevel > 75 ? "bg-red-500 text-white" : isMonitoring ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
      )}>
        {/* Animated Rings for visual effect */}
        {isMonitoring && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-64 bg-white/10 rounded-full animate-ping opacity-20"></div>
                 <div className="w-48 h-48 bg-white/10 rounded-full animate-pulse opacity-30 delay-150"></div>
             </div>
        )}

        <div className="relative z-10 text-center space-y-4">
             <div className="bg-white/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto backdrop-blur-sm">
                {distressLevel > 75 ? <AlertTriangle size={40} /> : <Mic size={40} />}
             </div>
             <div>
                <h2 className="text-2xl font-bold">
                    {distressLevel > 75 ? "HIGH DISTRESS DETECTED" : isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
                </h2>
                {isMonitoring && <p className="opacity-90 mt-1">Analyzing audio environment...</p>}
             </div>
        </div>
      </div>
      
      {/* Controls */}
      <Button 
        onClick={() => setIsMonitoring(!isMonitoring)} 
        variant={isMonitoring ? "secondary" : "primary"}
        className="w-full"
      >
        {isMonitoring ? "Stop Monitoring" : "Start Live Monitor"}
      </Button>

      {/* Emergency Tips Card (Conditional) */}
      {emergencyTips.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 animate-pulse">
              <h3 className="text-red-700 font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} /> Immediate Action Required
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-red-800 font-medium">
                  {emergencyTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                  ))}
              </ul>
          </div>
      )}

      {/* Safety Zones */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <MapPin size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">Safety Zones</h3>
                    <p className="text-xs text-slate-500">Geofencing Active</p>
                </div>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
         </div>
         <div className="space-y-3">
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                 <span className="text-slate-700">Home</span>
                 <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Safe</span>
             </div>
             <div className="flex justify-between items-center py-2">
                 <span className="text-slate-700">Therapy Center</span>
                 <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Away</span>
             </div>
         </div>
      </div>
    </div>
  );
};

const ProgressView: React.FC = () => {
    // Mock Data
    const data: DailyStat[] = [
        { day: 'Mon', synchrony: 45, engagement: 10 },
        { day: 'Tue', synchrony: 52, engagement: 15 },
        { day: 'Wed', synchrony: 48, engagement: 12 },
        { day: 'Thu', synchrony: 60, engagement: 20 },
        { day: 'Fri', synchrony: 65, engagement: 25 },
        { day: 'Sat', synchrony: 72, engagement: 30 },
        { day: 'Sun', synchrony: 78, engagement: 35 },
    ];

    return (
        <div className="pb-24 space-y-6">
             <header>
                <h1 className="text-2xl font-bold text-slate-800">Progress Tracker</h1>
                <p className="text-slate-500">Weekly growth and milestones.</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-6">Synchrony Score Trend</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSync" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="synchrony" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorSync)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <div className="bg-yellow-100 w-10 h-10 rounded-full flex items-center justify-center text-yellow-600 mb-3">
                        <Award size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">3 Days</div>
                    <div className="text-xs text-yellow-700">Streak Record</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                        <Play size={20} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">12</div>
                    <div className="text-xs text-indigo-700">Sessions Completed</div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [tasks, setTasks] = useState<InterventionTask[]>([
    { id: '1', title: 'Joint Attention Game', description: 'Look at the same object together.', duration: 10, completed: false, category: 'Social' },
    { id: '2', title: 'Mirroring Movements', description: 'Copy childs actions immediately.', duration: 5, completed: true, category: 'Sensory' },
    { id: '3', title: 'Vocal Turn Taking', description: 'Respond to sounds with sounds.', duration: 15, completed: false, category: 'Speech' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onStartAnalysis={() => setCurrentView('analysis')} tasks={tasks} onToggleTask={toggleTask} />;
      case 'analysis':
        return <AnalysisView />;
      case 'safety':
        return <SafetyView />;
      case 'progress':
        return <ProgressView />;
      default:
        return <DashboardView onStartAnalysis={() => setCurrentView('analysis')} tasks={tasks} onToggleTask={toggleTask} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-lg mx-auto min-h-screen bg-white shadow-2xl relative">
        <div className="px-6 py-8">
            {renderView()}
        </div>
        <Navigation currentView={currentView} onNavigate={setCurrentView} />
      </main>
    </div>
  );
};

export default App;