import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface MoneyGardenProps {
  savings: number;
  goal: number;
}

interface GrassBlade {
  id: number;
  x: number;
  height: number;
  delay: number;
  rotation: number;
  type: '🌱' | '🌿' | '☘️' | '🍀';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  type: '🌟' | '✨' | '💫' | '🦋' | '🐞' | '🐝';
  speed: number;
}

export const MoneyTree: React.FC<MoneyGardenProps> = ({ savings, goal }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [grassBlades, setGrassBlades] = useState<GrassBlade[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [season, setSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('spring');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get season based on progress
  useEffect(() => {
    const currentProgress = (savings / goal) * 100;
    setProgress(Math.min(currentProgress, 100));
    
    if (currentProgress < 25) setSeason('spring');
    else if (currentProgress < 50) setSeason('summer');
    else if (currentProgress < 75) setSeason('fall');
    else setSeason('winter');
  }, [savings, goal]);

  // Generate grass blades based on progress
  useEffect(() => {
    const bladeCount = Math.floor((progress * 3) + 15); // More grass as progress increases
    const newBlades = Array.from({ length: bladeCount }, (_, i) => {
      const heightVariation = Math.random() * 30 + (progress * 0.8); // Taller grass with more progress
      const rarity = Math.random();
      // Create clusters of grass
      const clusterX = Math.random();
      const xOffset = (Math.random() - 0.5) * 15; // Spread within cluster
      const x = (
        clusterX < 0.2 ? 10 + xOffset : // Left cluster
        clusterX < 0.4 ? 30 + xOffset : // Left-center cluster
        clusterX < 0.6 ? 50 + xOffset : // Center cluster
        clusterX < 0.8 ? 70 + xOffset : // Right-center cluster
        90 + xOffset // Right cluster
      );
      
      const type = rarity > 0.97 ? '🍀' as const : // Very rare four-leaf clover
                  rarity > 0.85 ? '☘️' as const : // Uncommon shamrock
                  rarity > 0.6 ? '🌿' as const : // Common herb
                  '🌱' as const; // Common sprout
      return {
        id: i,
        x: Math.max(0, Math.min(100, x)), // Ensure x stays within bounds
        height: Math.max(40, heightVariation), // Minimum height of 40
        delay: Math.random() * 0.8,
        rotation: -15 + Math.random() * 30, // More pronounced random lean
        type,
      };
    });
    setGrassBlades(newBlades);

    // Generate ambient particles with more variety and better distribution
    const particleCount = Math.floor(progress / 4) + 5; // More particles with progress
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const rarity = Math.random();
      const type = rarity > 0.8 ? '🦋' as const : 
                  rarity > 0.6 ? '🐞' as const : 
                  rarity > 0.4 ? '🐝' as const : 
                  rarity > 0.2 ? '✨' as const : 
                  '🌟' as const;

      // Grid-based distribution for better coverage
      const gridSize = Math.ceil(Math.sqrt(particleCount)); // Create a grid
      const cellWidth = 90 / gridSize; // Leave some margin on edges
      const cellHeight = 50 / gridSize;
      
      // Calculate grid position
      const gridX = i % gridSize;
      const gridY = Math.floor(i / gridSize);
      
      // Add randomness within grid cell
      const x = 5 + (gridX * cellWidth) + (Math.random() * cellWidth);
      const y = 20 + (gridY * cellHeight) + (Math.random() * cellHeight);
      
      // Add some random offset for more natural look
      const randomOffset = 10;
      const finalX = Math.max(5, Math.min(95, x + (Math.random() - 0.5) * randomOffset));
      const finalY = Math.max(20, Math.min(70, y + (Math.random() - 0.5) * randomOffset));
      
      return {
        id: i,
        x: finalX,
        y: finalY,
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * 360,
        type,
        speed: 0.5 + Math.random() * 0.5,
      };
    });
    setParticles(newParticles);
  }, [progress]);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const getGroundGradient = () => {
    if (isDark) {
      switch (season) {
        case 'spring': return 'from-emerald-600/40 via-emerald-800/30 to-emerald-950/20';
        case 'summer': return 'from-green-600/40 via-green-800/30 to-green-950/20';
        case 'fall': return 'from-amber-600/40 via-amber-800/30 to-amber-950/20';
        case 'winter': return 'from-blue-600/40 via-blue-800/30 to-blue-950/20';
      }
    } else {
      switch (season) {
        case 'spring': return 'from-green-200 via-emerald-100 to-green-50';
        case 'summer': return 'from-green-300 via-emerald-200 to-green-100';
        case 'fall': return 'from-orange-200 via-amber-100 to-orange-50';
        case 'winter': return 'from-blue-200 via-indigo-100 to-blue-50';
      }
    }
  };

  const getSkyGradient = () => {
    if (isDark) {
      switch (season) {
        case 'spring': return 'from-emerald-800/30 via-emerald-900/20 to-slate-950';
        case 'summer': return 'from-blue-800/30 via-cyan-900/20 to-slate-950';
        case 'fall': return 'from-amber-800/30 via-orange-900/20 to-slate-950';
        case 'winter': return 'from-blue-800/30 via-indigo-900/20 to-slate-950';
      }
    } else {
      switch (season) {
        case 'spring': return 'from-green-100/60 via-blue-50/40 to-transparent';
        case 'summer': return 'from-blue-100/60 via-cyan-50/40 to-transparent';
        case 'fall': return 'from-orange-100/60 via-yellow-50/40 to-transparent';
        case 'winter': return 'from-blue-100/60 via-indigo-50/40 to-transparent';
      }
    }
  };

  const getProgressColor = () => {
    if (isDark) {
      return progress < 33 ? '#32CD32' : // Lime green for spring
             progress < 66 ? '#00FF7F' : // Spring green for summer
             progress < 100 ? '#FFD700' : // Gold for fall
             '#87CEEB'; // Sky blue for winter
    } else {
      return progress < 33 ? '#90EE90' : // Light green for spring
             progress < 66 ? '#98FB98' : // Pale green for summer
             progress < 100 ? '#F0E68C' : // Khaki for fall
             '#B0E0E6'; // Powder blue for winter
    }
  };

  if (!mounted) return null;

  return (
    <div 
      className={`relative w-full h-[400px] rounded-xl overflow-hidden transition-all duration-1000 border ${
        isDark ? 'border-white/5 shadow-lg shadow-emerald-500/5' : 'border-border/50 shadow-xl shadow-primary/10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sky gradient with glow effect for dark mode */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${getSkyGradient()} transition-colors duration-1000 ${
          isDark ? 'after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-transparent after:to-emerald-500/5' : ''
        }`}
      >
        {/* Season-specific background particles */}
        <AnimatePresence>
          {season === 'spring' && Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`flower-${i}`}
              className="absolute text-2xl"
              initial={{ opacity: 0, scale: 0, x: `${20 + Math.random() * 60}%`, y: -20 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.5, 1, 0.5],
                y: ['0%', '100%'],
                x: [`${20 + Math.random() * 60}%`, `${10 + Math.random() * 80}%`],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 2,
              }}
            >
              🌸
            </motion.div>
          ))}
          {season === 'fall' && Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute text-2xl"
              initial={{ opacity: 0, scale: 0, x: Math.random() * 100 + '%', y: -20 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.5, 1, 0.5],
                y: ['0%', '100%'],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 2,
              }}
            >
              🍂
            </motion.div>
          ))}
          {season === 'winter' && Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute text-xl"
              initial={{ opacity: 0, scale: 0, x: Math.random() * 100 + '%', y: -20 }}
              animate={{
                opacity: [0, 0.7, 0],
                scale: [0.5, 1, 0.5],
                y: ['0%', '100%'],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 2,
              }}
            >
              ❄️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ground with enhanced gradient and glow */}
      <div 
        className={`absolute bottom-0 left-0 w-full h-36 bg-gradient-to-t ${getGroundGradient()} transition-colors duration-1000 ${
          isHovered ? 'opacity-95' : 'opacity-90'
        } ${
          isDark ? 'shadow-lg shadow-emerald-500/10' : ''
        }`}
      />

      {/* Progress indicators moved to top */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        {/* Progress circle */}
        <motion.div
          className={`w-20 h-20 backdrop-blur-sm rounded-full p-1 shadow-lg ${
            isDark ? 'bg-slate-900/60 border border-white/10' : 'bg-background/50'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
              strokeWidth="6"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{
                filter: isDark ? 'brightness(1.2) drop-shadow(0 0 3px rgba(255,255,255,0.2))' : 'none'
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className={`text-lg font-bold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div 
          className={`backdrop-blur-sm rounded-lg p-2 shadow-lg ${
            isDark ? 'bg-slate-900/60 border border-white/10' : 'bg-background/80'
          }`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <p className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-foreground'}`}>
            ${savings.toLocaleString()} / ${goal.toLocaleString()}
          </p>
          <p className={`text-xs ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
            ${(goal - savings).toLocaleString()} to go
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
            {season.charAt(0).toUpperCase() + season.slice(1)} Garden 🌱
          </p>
        </motion.div>
      </div>

      {/* Grass blades */}
      <div className="absolute bottom-0 left-0 w-full">
        <AnimatePresence>
          {grassBlades.map((blade) => (
            <motion.div
              key={blade.id}
              className="absolute bottom-0"
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: blade.height,
                opacity: isDark ? 0.9 : 1,
                rotate: [
                  blade.rotation,
                  blade.rotation + (isHovered ? Math.sin(blade.id) * 8 : 0),
                  blade.rotation - (isHovered ? Math.sin(blade.id) * 8 : 0)
                ],
                scale: isHovered ? [1, 1.02, 1] : 1,
              }}
              transition={{
                height: { duration: 0.8, delay: blade.delay },
                rotate: { 
                  duration: 2 + Math.random(), 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut"
                },
                scale: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
              style={{
                left: `${blade.x}%`,
                transformOrigin: 'bottom',
                zIndex: Math.floor(blade.x),
                filter: isDark ? 'brightness(1.2) drop-shadow(0 0 2px rgba(52, 211, 153, 0.2))' : 'none',
              }}
            >
              <span 
                className="absolute bottom-0 transform -translate-x-1/2 transition-transform duration-300"
                style={{ 
                  filter: isDark ? 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.2))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                  fontSize: blade.type === '🍀' ? '2.5rem' : '2rem'
                }}
              >
                {blade.type}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Ambient particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              x: [
                `${particle.x}%`, 
                `${particle.x + (Math.random() - 0.5) * 15}%`,
                `${particle.x - (Math.random() - 0.5) * 15}%`,
                `${particle.x}%`
              ],
              y: [
                `${particle.y}%`,
                `${particle.y - 10}%`,
                `${particle.y + 10}%`,
                `${particle.y}%`
              ],
              opacity: [0, 0.95, 0.95, 0],
              scale: [
                particle.scale * 0.8, 
                particle.scale * 1.1, 
                particle.scale
              ],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6 / particle.speed,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              position: 'absolute',
              zIndex: Math.floor(particle.y),
              filter: isDark ? 'brightness(1.3) drop-shadow(0 0 3px rgba(255,255,255,0.3))' : 'none',
            }}
          >
            <span 
              className="text-lg filter transition-transform duration-300"
              style={{
                transform: `scale(${isHovered ? 1.1 : 1})`,
                opacity: isDark ? (isHovered ? 1 : 0.9) : (isHovered ? 0.95 : 0.85),
                display: 'block',
                filter: isDark ? 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' : 'none',
              }}
            >
              {particle.type}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Achievement sparkles */}
      <AnimatePresence>
        {[25, 50, 75, 100].map((milestone) => (
          progress >= milestone && (
            <motion.div
              key={`milestone-${milestone}`}
              className="absolute"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 1, 0],
                y: [-20, -40],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 5,
              }}
              style={{
                left: `${milestone}%`,
                bottom: '20%',
              }}
            >
              <span className="text-3xl">
                {milestone === 100 ? '🌺' : '🌸'}
              </span>
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
}; 