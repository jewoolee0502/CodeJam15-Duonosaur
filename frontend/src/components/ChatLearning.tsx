import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Volume2 } from 'lucide-react';
import dinoImage from 'figma:asset/3a519b4fad679bec0e5a1851cb49a7ecc7330095.png';

interface ChatLearningProps {
  onBack: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  translation?: string;
  audioText?: string;
}

export function ChatLearning({ onBack }: ChatLearningProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour! Je suis DinoLingo, ton assistant d'apprentissage du français!",
      sender: 'ai',
      translation: "Hello! I'm DinoLingo, your French learning assistant!",
    },
    {
      id: 2,
      text: "Let's start with some basics. Click on a phrase below to practice:",
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const practiceWords = [
    { french: 'Bonjour', english: 'Hello' },
    { french: 'Merci', english: 'Thank you' },
    { french: 'Au revoir', english: 'Goodbye' },
    { french: 'Comment ça va?', english: 'How are you?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "Great effort! Keep practicing. Try another phrase!",
        sender: 'ai',
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInputValue('');
  };

  const handlePracticeWord = (word: { french: string; english: string }) => {
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: word.french,
      sender: 'user',
    };

    setMessages((prev) => [...prev, newUserMessage]);

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `Excellent! "${word.french}" means "${word.english}". Try saying it out loud!`,
        sender: 'ai',
        audioText: word.french,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F5E5C7' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 flex-shrink-0" style={{ borderColor: '#B8621B' }}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm sm:text-base hover:opacity-70 transition-opacity"
          style={{ color: '#B8621B' }}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back to Menu</span>
        </button>
        <div className="flex items-center gap-2">
          <img src={dinoImage} alt="DinoLingo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          <span className="text-sm sm:text-base" style={{ color: '#B8621B' }}>DinoLingo Chat</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 ${
                message.sender === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
              }`}
              style={{
                backgroundColor: message.sender === 'user' ? '#B8621B' : '#FFD7B5',
                color: message.sender === 'user' ? 'white' : '#B8621B',
              }}
            >
              <p className="text-sm sm:text-base">{message.text}</p>
              {message.translation && (
                <p className="text-xs sm:text-sm mt-2 opacity-80">{message.translation}</p>
              )}
              {message.audioText && (
                <button
                  className="mt-2 flex items-center gap-1 text-xs sm:text-sm opacity-80 hover:opacity-100"
                  onClick={() => {
                    // Audio playback would go here
                    console.log('Play audio:', message.audioText);
                  }}
                >
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Listen</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Practice Words Section */}
        {messages.length <= 5 && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {practiceWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handlePracticeWord(word)}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl border-2 text-xs sm:text-sm hover:scale-105 transition-transform"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#B8621B',
                  color: '#B8621B',
                }}
              >
                {word.french}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t-2 flex-shrink-0" style={{ borderColor: '#B8621B', backgroundColor: 'white' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message or click a phrase above..."
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: '#FFD7B5',
              color: '#B8621B',
            }}
          />
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ backgroundColor: '#B8621B' }}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
