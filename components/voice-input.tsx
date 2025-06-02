'use client';

import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from './ui/button';

// Types
interface VoiceInputContextType {
  isRecording: boolean;
  time: number;
  isTranscribing: boolean;
  isDemo: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleDemo: () => void;
}

interface VoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onTranscription?: (text: string) => void;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  children: React.ReactNode;
}

// Context
const VoiceInputContext = createContext<VoiceInputContextType | null>(null);

const useVoiceInput = () => {
  const context = useContext(VoiceInputContext);
  if (!context) {
    throw new Error('Voice input components must be used within VoiceInput');
  }
  return context;
};

// Main VoiceInput component
const VoiceInput = React.forwardRef<HTMLDivElement, VoiceInputProps>(
  (
    {
      onStart,
      onStop,
      onTranscription,
      demoMode = false,
      demoInterval = 3000,
      className,
      children,
    },
    ref,
  ) => {
    const [isRecording, setIsRecording] = useState(false);
    const [time, setTime] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isDemo, setIsDemo] = useState(demoMode);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Timer effect
    useEffect(() => {
      let intervalId: NodeJS.Timeout;

      if (isRecording) {
        onStart?.();
        intervalId = setInterval(() => {
          setTime((t) => t + 1);
        }, 1000);
      } else {
        if (time > 0) onStop?.(time);
        setTime(0);
      }

      return () => clearInterval(intervalId);
    }, [isRecording, time, onStart, onStop]);

    // Demo mode effect
    useEffect(() => {
      if (!isDemo) return;

      let timeoutId: NodeJS.Timeout;
      const runAnimation = () => {
        setIsRecording(true);
        timeoutId = setTimeout(() => {
          setIsRecording(false);
          timeoutId = setTimeout(runAnimation, 1000);
        }, demoInterval);
      };

      const initialTimeout = setTimeout(runAnimation, 100);
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(initialTimeout);
      };
    }, [isDemo, demoInterval]);

    const startRecording = async () => {
      if (isDemo) {
        setIsDemo(false);
        setIsRecording(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = handleStopRecording;
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Could not access microphone:', err);
      }
    };

    const stopRecording = () => {
      if (isDemo) {
        setIsDemo(false);
        setIsRecording(false);
        return;
      }

      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    };

    const handleStopRecording = async () => {
      setIsTranscribing(true);
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm',
      });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      try {
        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.text && onTranscription) {
          onTranscription(data.text);
        }
      } catch (err) {
        console.error('Transcription failed:', err);
      } finally {
        setIsTranscribing(false);
      }
    };

    const toggleDemo = () => {
      setIsDemo(!isDemo);
      setIsRecording(false);
    };

    const contextValue: VoiceInputContextType = {
      isRecording,
      time,
      isTranscribing,
      isDemo,
      startRecording,
      stopRecording,
      toggleDemo,
    };

    return (
      <VoiceInputContext.Provider value={contextValue}>
        <div ref={ref} className={cn('w-full py-4', className)}>
          {children}
        </div>
      </VoiceInputContext.Provider>
    );
  },
);
VoiceInput.displayName = 'VoiceInput';

// VoiceTrigger component
const VoiceTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { isRecording, isTranscribing, startRecording, stopRecording } =
    useVoiceInput();

  const handleClick = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <Button
      ref={ref}
      className={cn(
        'hover:bg-zinc-200 hover:dark:bg-zinc-900 rounded-full',
        className,
      )}
      type="button"
      onClick={handleClick}
      variant="ghost"
      size="icon"
      disabled={isTranscribing}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
      {...props}
    >
      {children || (
        <>
          {isTranscribing ? (
            <div
              className="pointer-events-auto size-6 animate-spin cursor-pointer rounded-sm bg-black dark:bg-white"
              style={{ animationDuration: '3s' }}
            />
          ) : isRecording ? (
            <div className="size-6 animate-pulse rounded-full bg-red-500" />
          ) : (
            <Mic className="size-5 text-black/70 dark:text-white/70" />
          )}
        </>
      )}
    </Button>
  );
});
VoiceTrigger.displayName = 'VoiceTrigger';

// RecordTime component
const RecordTime = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { time, isRecording } = useVoiceInput();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <span
      ref={ref}
      className={cn(
        'font-mono text-sm transition-opacity duration-300',
        isRecording
          ? 'text-black/70 dark:text-white/70'
          : 'text-black/30 dark:text-white/30',
        className,
      )}
      {...props}
    >
      {formatTime(time)}
    </span>
  );
});
RecordTime.displayName = 'RecordTime';

// WaveVisualizer component
const WaveVisualizer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { bars?: number }
>(({ className, bars = 48, ...props }, ref) => {
  const { isRecording } = useVoiceInput();

  return (
    <div
      ref={ref}
      className={cn(
        'flex h-4 w-64 items-center justify-center gap-0.5',
        className,
      )}
      {...props}
    >
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-0.5 rounded-full transition-all duration-300',
            isRecording
              ? 'animate-pulse bg-black/50 dark:bg-white/50'
              : 'h-1 bg-black/10 dark:bg-white/10',
          )}
          style={
            isRecording
              ? {
                  height: `${20 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.05}s`,
                }
              : undefined
          }
        />
      ))}
    </div>
  );
});
WaveVisualizer.displayName = 'WaveVisualizer';

// StatusText component
const StatusText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { isRecording, isTranscribing } = useVoiceInput();

  const defaultText = isTranscribing
    ? 'Transcribing...'
    : isRecording
      ? 'Listening...'
      : 'Click to speak';

  return (
    <p
      ref={ref}
      className={cn('h-4 text-xs text-black/70 dark:text-white/70', className)}
      {...props}
    >
      {children || defaultText}
    </p>
  );
});
StatusText.displayName = 'StatusText';

export {
  RecordTime,
  StatusText,
  useVoiceInput,
  VoiceInput,
  VoiceTrigger,
  WaveVisualizer,
};
