import React from 'react';
import { Achievement } from '../../types/achievements';
import { formatProgress } from '../../lib/achievements';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { motion } from 'framer-motion';

interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 ${achievement.isUnlocked ? 'bg-green-50' : ''}`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{achievement.title}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            <div className="mt-2">
              <Progress value={achievement.progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Progress: {formatProgress(achievement.progress)}
              </p>
            </div>
            {achievement.isUnlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2 text-sm text-green-600 font-semibold"
              >
                🎉 Unlocked {achievement.unlockedAt?.toLocaleDateString()}
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}; 