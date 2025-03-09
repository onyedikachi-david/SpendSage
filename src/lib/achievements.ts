import { Achievement } from '../types/achievements';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'budget-master',
    title: 'Budget Master',
    description: 'Stay under budget for 3 months straight',
    icon: '🎯',
    requirement: {
      type: 'budget',
      value: 3,
    },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'savings-guru',
    title: 'Savings Guru',
    description: 'Reach your savings goal',
    icon: '💰',
    requirement: {
      type: 'savings',
      value: 100,
    },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'data-wizard',
    title: 'Data Wizard',
    description: 'Successfully import a large dataset',
    icon: '🧙‍♂️',
    requirement: {
      type: 'import',
      value: 100,
    },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: 'category-creator',
    title: 'Category Creator',
    description: 'Create 10 custom categories',
    icon: '📊',
    requirement: {
      type: 'category',
      value: 10,
    },
    progress: 0,
    isUnlocked: false,
  },
];

export const checkAchievementProgress = (
  achievement: Achievement,
  currentValue: number
): Achievement => {
  const progress = Math.min(
    Math.floor((currentValue / achievement.requirement.value) * 100),
    100
  );
  
  return {
    ...achievement,
    progress,
    isUnlocked: progress >= 100,
    unlockedAt: progress >= 100 && !achievement.isUnlocked ? new Date() : achievement.unlockedAt,
  };
};

export const formatProgress = (progress: number): string => {
  return `${Math.min(progress, 100)}%`;
}; 