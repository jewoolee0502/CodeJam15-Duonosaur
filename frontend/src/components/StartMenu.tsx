import React, { useState } from 'react';
import { Gamepad2, Settings, HelpCircle, ArrowUp, Hammer, X, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import dinoImage from '../assets/dinosaur_reading.gif';

interface StartMenuProps {
  onSelectGame: (game: 'whack-a-mole' | 'jump' | 'dunolingo' | 'chat-learning') => void;
}

export function StartMenu({ onSelectGame }: StartMenuProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F5E5C7' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 flex-shrink-0">
        <button className="flex items-center gap-2 text-sm" style={{ color: '#B8621B' }}>
          <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Game Menu</span>
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center hover:bg-white/50 transition-colors"
          style={{ borderColor: '#B8621B', color: '#B8621B' }}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-y-auto">
        {/* Dinosaur Character */}
        <div className="mb-4" style={{ backgroundColor: 'transparent' }}>
          <img 
            src={dinoImage} 
            alt="Dinosaur mascot"
            className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
            style={{ 
              backgroundColor: 'transparent'
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-wider mb-2 text-center" style={{ color: '#B8621B', letterSpacing: '0.15em' }}>
          DUONOSAUR
        </h1>
        
        {/* Subtitle */}
        <p className="text-xs sm:text-sm mb-6" style={{ color: '#B8621B' }}>
          better than the green bird
        </p>

        {/* Game Options */}
        <div className="w-full max-w-sm space-y-3">
          {/* Dunolingo Game */}
          <button
            onClick={() => onSelectGame('dunolingo')}
            className="w-full bg-white rounded-2xl p-4 border-2 flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
            style={{ borderColor: '#B8621B' }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFD7B5' }}>
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#B8621B' }} />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg" style={{ color: '#B8621B' }}>Dinolingo</h3>
              <p className="text-xs sm:text-sm" style={{ color: '#8B6F47' }}>Classic endless runner - jump to survive</p>
            </div>
          </button>

          {/* Jump Game */}
          <button
            onClick={() => onSelectGame('jump')}
            className="w-full bg-white rounded-2xl p-4 border-2 flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
            style={{ borderColor: '#B8621B' }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFD7B5' }}>
              <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#B8621B' }} />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg" style={{ color: '#B8621B' }}>Jump Game</h3>
              <p className="text-xs sm:text-sm" style={{ color: '#8B6F47' }}>Jump over obstacles and reach new heights</p>
            </div>
          </button>

          {/* Whack-a-Mole */}
          <button
            onClick={() => onSelectGame('whack-a-mole')}
            className="w-full bg-white rounded-2xl p-4 border-2 flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
            style={{ borderColor: '#B8621B' }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFD7B5' }}>
              <Hammer className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#B8621B' }} />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg" style={{ color: '#B8621B' }}>Whack-a-Mole</h3>
              <p className="text-xs sm:text-sm" style={{ color: '#8B6F47' }}>Test your reflexes and timing</p>
            </div>
          </button>

          {/* Chat Learning */}
          <button
            onClick={() => onSelectGame('chat-learning')}
            className="w-full bg-white rounded-2xl p-4 border-2 flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
            style={{ borderColor: '#B8621B' }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFD7B5' }}>
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#B8621B' }} />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg" style={{ color: '#B8621B' }}>Chat Learning</h3>
              <p className="text-xs sm:text-sm" style={{ color: '#8B6F47' }}>Interactive chat to learn new words</p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="relative pb-4">
        <p className="text-center text-xs tracking-widest" style={{ color: '#B8621B' }}>
          TEAM • DUONOSAUR
        </p>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 max-w-md w-full mx-4" style={{ borderColor: '#B8621B' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl" style={{ color: '#B8621B' }}>Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg border-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ borderColor: '#B8621B', color: '#B8621B' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border-2" style={{ borderColor: '#FFD7B5', backgroundColor: '#FFD7B5' }}>
              <label className="text-lg" style={{ color: '#B8621B' }}>Sound</label>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors"
                style={{ 
                  backgroundColor: soundEnabled ? '#B8621B' : 'white',
                  borderColor: '#B8621B'
                }}
              >
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6" style={{ color: 'white' }} />
                ) : (
                  <VolumeX className="w-6 h-6" style={{ color: '#B8621B' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}