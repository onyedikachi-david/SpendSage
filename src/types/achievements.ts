export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'budget' | 'savings' | 'import' | 'category' | 'streak';
    value: number;
  };
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export type AchievementType = Achievement['requirement']['type'];

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
} 