export enum Emotion {
  Happy = 'Happy',
  Distress = 'Distress',
  Neutral = 'Neutral',
  Excited = 'Excited',
  Frustrated = 'Frustrated'
}

export interface KeyMoment {
  timestamp: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface AnalysisResult {
  synchronyScore: number; // 0-100
  childEmotion: Emotion;
  parentEmotion: Emotion;
  turnTakingCount: number;
  feedback: string;
  keyMoments: KeyMoment[];
  suggestedTasks: string[];
}

export interface DailyStat {
  day: string;
  synchrony: number;
  engagement: number; // minutes
}

export interface InterventionTask {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  completed: boolean;
  category: 'Speech' | 'Social' | 'Sensory';
}
