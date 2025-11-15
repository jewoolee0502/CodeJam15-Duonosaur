import { motion, AnimatePresence } from 'motion/react';
import dinoImage from 'figma:asset/16f41035dd9df1c1060df8ef3139f206bb95a481.png';

interface HoleProps {
  isActive: boolean;
  onClick: () => void;
  isPlaying: boolean;
}

export function Hole({ isActive, onClick, isPlaying }: HoleProps) {
  return (
    // ALIGNMENT: Centered content with relative positioning
    <div className="relative flex items-end justify-center h-28 overflow-hidden">
      {/* REPETITION: Elliptical hole shape repeated 9 times */}
      {/* CONTRAST: Brown hole matching the theme */}
      <div className="absolute bottom-0 w-full h-20 rounded-[50%] border-4 shadow-[inset_0_6px_12px_rgba(0,0,0,0.2)] z-0" style={{ 
        background: 'linear-gradient(to bottom, #8B6F47, #6B5335)',
        borderColor: '#6B5335'
      }} />
      
      {/* HIERARCHY: Moles are the primary interactive element */}
      {/* CONTRAST: Bright mole against dark hole */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-0 z-10"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              disabled={!isPlaying}
              className="relative group disabled:cursor-default"
              aria-label="Whack mole"
            >
              {/* REPETITION: Consistent sizing for all moles */}
              {/* CONTRAST: Dinosaur character as the target */}
              <div className="w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img 
                  src={dinoImage} 
                  alt="Dinosaur"
                  className="w-full h-full object-contain"
                  style={{
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
              {/* CONTRAST: Hit effect with bright color */}
              <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-60 transition-opacity pointer-events-none" style={{ backgroundColor: '#FFD7B5' }}></div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}