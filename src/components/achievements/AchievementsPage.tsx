import React from 'react';
import { ACHIEVEMENTS } from '../../lib/achievements';
import { AchievementCard } from './AchievementCard';
import { motion } from 'framer-motion';

export const AchievementsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Achievements</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}; 