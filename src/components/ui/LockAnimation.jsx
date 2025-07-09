import React, { useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const LockAnimation = ({ onAnimationComplete }) => {
  const { themes, actualTheme } = useTheme();
  const [animationStage, setAnimationStage] = useState(0);
  
  // Get current theme colors
  const themeColors = themes[actualTheme]?.colors || themes.light.colors;
  // 0: Initial lock, 1: Start transforming, 2: Fully unlocked, 3: Fade out
  
  useEffect(() => {
    // Stage 0 (Initial lock): Show for 600ms with subtle pulse
    const timer1 = setTimeout(() => {
      setAnimationStage(1); // Begin transformation
    }, 600);
    
    // Stage 1 (Transforming): Morph for 700ms
    const timer2 = setTimeout(() => {
      setAnimationStage(2); // Complete unlock
    }, 1300);
    
    // Stage 2 (Unlocked): Hold for 600ms with glow effect
    const timer3 = setTimeout(() => {
      setAnimationStage(3); // Begin fade out
    }, 1900);
    
    // Stage 3: Fade out for 500ms
    const timer4 = setTimeout(() => {
      onAnimationComplete(); // Signal animation complete
    }, 2400);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onAnimationComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
      animationStage === 3 ? 'pointer-events-none' : ''
    }`}
      style={{
        background: actualTheme === 'dark' 
          ? 'rgba(17, 24, 39, 1)' // Same as dark main-content but solid
          : themeColors.background, // Use theme background color
        backdropFilter: 'blur(10px)',
        opacity: animationStage === 3 ? 0 : 1
      }}>
      <div className={`transform transition-all duration-500 ease-in-out ${
        animationStage === 0 ? 'scale-100 animate-pulse' : 
        animationStage === 1 ? 'scale-110' : 
        animationStage === 2 ? 'scale-130' : 
        'scale-150 opacity-0'
      }`}>
        {/* Container for both icons to ensure perfect alignment */}
        <div className="relative flex items-center justify-center h-24 w-24">
          
          {/* Unlocked state with gradient background */}
          <div 
            className={`absolute inset-0 flex items-center justify-center rounded-full 
            transition-all duration-700 ease-in-out
            ${
              animationStage === 0 ? 'opacity-0 scale-50' : 
              animationStage === 1 ? 'opacity-100 scale-100' : 
              'opacity-100 scale-100'
            }`}
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.accent} 0%, ${themeColors.primary} 100%)`,
            }}
          >
            <Unlock className="w-12 h-12 text-white transform transition-all duration-700" />
          </div>
          
          {/* Locked state with gradient background */}
          <div 
            className={`absolute inset-0 flex items-center justify-center rounded-full 
            transition-all duration-700 ease-in-out
            ${
              animationStage === 0 ? 'opacity-100 scale-100' : 
              animationStage === 1 ? 'opacity-0 scale-110' : 
              'opacity-0 scale-120'
            }`}
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.secondary} 0%, ${themeColors.primary} 100%)`,
            }}
          >
            <Lock className="w-12 h-12 text-white transform transition-all duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockAnimation;
