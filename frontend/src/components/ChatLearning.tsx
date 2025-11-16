import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Volume2, Mic } from 'lucide-react';
import dinoImage from 'figma:asset/3a519b4fad679bec0e5a1851cb49a7ecc7330095.png';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

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
  const nextId = useRef<number>(3); // id generator (initial messages use 1..2)
  
  // Speech recognition hook
  const {
    transcript,
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'fr-FR', // French language for learning
    continuous: false,
    interimResults: true,
  });

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

  // Update input when speech transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  const handleSpeechToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInputValue('');
      startListening();
    }
  };

  // helper: call backend teach endpoint
  const callTeachApi = async (messageText: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/teach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }
      const data = await res.json();
      return data as { response: string; translation?: string | null; audioText?: string | null };
    } catch (err) {
      console.error(err);
      return { response: `Error contacting teacher: ${String(err)}` };
    }
  };

  const getVoices = () =>
    new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const synth = window.speechSynthesis;
      let voices = synth.getVoices();
      if (voices.length) return resolve(voices);
      const handler = () => {
        voices = synth.getVoices();
        synth.removeEventListener('voiceschanged', handler);
        resolve(voices);
      };
      synth.addEventListener('voiceschanged', handler);
      // fallback timeout in case event never fires
      setTimeout(() => resolve(synth.getVoices()), 1000);
    });

  // 是否存在法语 TTS voice（用于禁用音频功能）
  const [frenchTTSAvailable, setFrenchTTSAvailable] = useState<boolean>(true);

  // 组件挂载时检查是否存在法语 voice；若不存在则禁用音频并记录日志
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported - TTS disabled');
      setFrenchTTSAvailable(false);
      return;
    }
    let mounted = true;
    getVoices().then((voices) => {
      if (!mounted) return;
      const hasFrench = voices.some((v) => v.lang?.toLowerCase().startsWith('fr'));
      if (!hasFrench) {
        console.warn('No French TTS voices available - audio disabled');
      } else {
        console.log('French TTS voice available');
      }
      setFrenchTTSAvailable(hasFrench);
    }).catch((e) => {
      console.warn('Error fetching voices, disabling TTS', e);
      setFrenchTTSAvailable(false);
    });
    return () => { mounted = false; };
  }, []);

  // 简单法语检测：检查法语特有字符或常见法语词汇（启发式，不保证 100% 准确）
  const isFrench = (text?: string | null) => {
    if (!text) return false;
    const t = text.toLowerCase();
    // 常见带重音的法语字符
    const frenchCharRe = /[éèêëàâîïôöùûçœæ]/i;
    if (frenchCharRe.test(text)) return true;
    // 常见法语词汇启发式匹配
    const commonFrenchWords = ['bonjour', 'merci', 'au revoir', 'comment', 'ça', "s'il", 'oui', 'non', 'monsieur', 'madame'];
    return commonFrenchWords.some((w) => t.includes(w));
  };

  const playAudio = async (text?: string | null) => {
    if (!text) return;
    // 仅播放被检测为法语的文本
    if (!isFrench(text)) {
      console.warn('Audio not played: text not detected as French.');
      return;
    }
    // 如果没有法语 TTS voice，则禁用播放
    if (!frenchTTSAvailable) {
      console.warn('Audio not played: no French TTS voice available.');
      return;
    }
    // browser TTS
    if ('speechSynthesis' in window) {
      try {
        const voices = await getVoices();
        // prefer French voices
        const voice =
          voices.find((v) => v.lang?.toLowerCase().startsWith('fr')) ||
          voices.find((v) => v.lang === 'fr-FR') ||
          voices[0];

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'fr-FR';
        if (voice) utter.voice = voice;
        utter.rate = 0.95; // 慢一点更清晰
        utter.pitch = 1;
        utter.volume = 1;

        utter.onstart = () => {
          // 可在此更新 UI（例如显示正在播放）
        };
        utter.onend = () => {
          // 可在此更新 UI（例如关闭播放指示器）
        };
        utter.onerror = (e) => {
          console.warn('TTS error', e);
        };

        window.speechSynthesis.cancel(); // 取消当前播放，确保最新文本播放
        window.speechSynthesis.speak(utter);
        return;
      } catch (e) {
        console.warn('TTS failed, falling back to server audio', e);
      }
    } else {
      console.warn('Web Speech API not supported in this browser');
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: nextId.current++,
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // call backend
    const data = await callTeachApi(userMessage.text);

    const aiMessage: Message = {
      id: nextId.current++,
      text: data.response ?? 'No response',
      sender: 'ai',
      translation: data.translation ?? undefined,
      // 只有后端返回的 audioText 被检测为法语时才保留，否则不提供音频
      audioText: isFrench(data.audioText) ? (data.audioText as string) : undefined,
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  const handlePracticeWord = async (word: { french: string; english: string }) => {
    const userMessage: Message = {
      id: nextId.current++,
      text: word.french,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);

    const data = await callTeachApi(word.french);

    const aiMessage: Message = {
      id: nextId.current++,
      text: data.response ?? `Excellent! "${word.french}" means "${word.english}".`,
      sender: 'ai',
      translation: data.translation ?? `\"${word.french}\" = \"${word.english}\"`,
      // 优先使用后端提供且被检测为法语的 audioText，否则使用本地的法语短语
      audioText: isFrench(data.audioText) ? (data.audioText as string) : word.french,
    };
    setMessages((prev) => [...prev, aiMessage]);
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
              {/* 仅当 audioText 存在且被检测为法语时显示播放按钮 */}
              {message.audioText && isFrench(message.audioText) && frenchTTSAvailable && (
                <button
                  className="mt-2 flex items-center gap-1 text-xs sm:text-sm opacity-80 hover:opacity-100"
                  onClick={() => playAudio(message.audioText)}
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
            placeholder={isListening ? "Listening..." : "Type a message or click a phrase above..."}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 text-sm sm:text-base focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: isListening ? '#22C55E' : '#FFD7B5',
              color: '#B8621B',
            }}
          />
          {isSpeechSupported && (
            <button
              onClick={handleSpeechToggle}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0 ${
                isListening ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: isListening ? '#22C55E' : '#B8621B',
              }}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          )}
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ backgroundColor: '#B8621B' }}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
        {isListening && (
          <div className="mt-2 text-xs text-center" style={{ color: '#22C55E' }}>
            🎤 Listening... Speak now!
          </div>
        )}
      </div>
    </div>
  );
}
