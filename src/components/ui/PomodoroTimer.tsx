import { Play, Pause, RotateCcw, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const PomodoroTimer = () => {
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
    const [isBreak, setIsBreak] = useState(false);
    const [pomodoroSettings, setPomodoroSettings] = useState({
      focusDuration: 15,
      breakDuration: 5,
      soundEnabled: true
    });
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
  
    const resetTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsTimerRunning(false);
      setIsBreak(false);
      setTimeRemaining(pomodoroSettings.focusDuration * 60);
    };
  
    const toggleTimer = () => {
      if (isTimerRunning) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setIsTimerRunning(false);
      } else {
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              // Timer completed
              if (pomodoroSettings.soundEnabled) {
                new Audio('/timer-complete.mp3').play().catch(() => {});
              }
              
              // Switch between focus and break
              setIsBreak((prev) => {
                const newIsBreak = !prev;
                setTimeRemaining(
                  newIsBreak 
                    ? pomodoroSettings.breakDuration * 60 
                    : pomodoroSettings.focusDuration * 60
                );
                return newIsBreak;
              });
              return prev;
            }
            return prev - 1;
          });
        }, 1000);
        setIsTimerRunning(true);
      }
    };
  
    const toggleSound = () => {
      setPomodoroSettings(prev => ({
        ...prev,
        soundEnabled: !prev.soundEnabled
      }));
    };
  
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
  
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, []);
  
    // Calculate the progress percentage for the circular timer
    const progress = (timeRemaining / (pomodoroSettings.focusDuration * 60)) * 100;
    const circumference = 2 * Math.PI * 120; // radius = 120
    const strokeDashoffset = circumference - (progress / 100) * circumference;
  
    const startTimer = () => {
      setIsFullscreen(true);
      toggleTimer();
    };
  
    const stopTimer = () => {
      resetTimer();
      setIsFullscreen(false);
    };
  
    const updateFocusDuration = (minutes: number) => {
        setPomodoroSettings(prev => ({
            ...prev,
            focusDuration: minutes
        }));
        // Reset timer with new duration if it's not currently in a break
        if (!isBreak) {
            setTimeRemaining(minutes * 60);
        }
    };
  
    return (
      <>
        {/* Minimized view */}
        {!isFullscreen && (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-6 p-6">
            {/* Title and description */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-white tracking-tight">Eliminate Distractions</h2>
              <p className="text-zinc-400 text-sm tracking-tight">Start a focus session and get all of your work done</p>
            </div>

            {/* Timer button with larger circle */}
            <div 
              onClick={startTimer}
              className="relative w-32 h-32 cursor-pointer group"
            >
              <div className="absolute inset-0 bg-zinc-900/50 rounded-full transform transition-all group-hover:scale-105">
                <svg className="transform -rotate-90" viewBox="0 0 256 256">
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="12"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 group-hover:stroke-white"
                  />
                </svg>
                <Play 
                  size={28} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-500 group-hover:text-white transition-colors" 
                />
              </div>
            </div>

            {/* Duration selector with improved styling */}
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((duration) => (
                <button
                  key={duration}
                  onClick={() => updateFocusDuration(duration)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    pomodoroSettings.focusDuration === duration
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  {duration}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fullscreen view */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            <div className="text-center relative w-[400px] h-[400px]">
              {/* Circular progress indicator */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#3f3f46"
                  strokeWidth="2"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200"
                />
              </svg>

              {/* Timer Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-7xl font-['Futura'] tracking-wider">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-lg text-zinc-400 font-['Futura'] mt-2 mb-8">
                  {isBreak ? 'Break Time' : 'Focus Session'}
                </div>
                
                <div className="flex justify-center gap-6">
                  <button
                    onClick={toggleTimer}
                    className="p-3 rounded-full bg-purple-500 hover:bg-purple-600 transition-colors"
                  >
                    {isTimerRunning ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button
                    onClick={stopTimer}
                    className="p-3 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
};

export default PomodoroTimer;
