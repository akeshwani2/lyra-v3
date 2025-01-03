"use client";
import React, { useState, useRef, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Brain,
  Calendar,
  Flower2,
  Sparkles,
  SwordIcon,
  Target,
  LineChart,
  XCircle,
  Loader2,
} from "lucide-react";
import lyraLogo from "@/assets/logo-copy.png";
import { dark } from "@clerk/themes";
import { Calendar as CalendarModal } from "@/components/ui/Calendar";
import axios from "axios";
import { AutoSaveStatus } from "@/components/ui/AutoSaveStatus";
import Image from "next/image";

const JournalPage = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [entries, setEntries] = useState({
    reflection: "",
    challenges: "",
    goals: "",
    highlights: "",
    gratitude: "",
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveTimeout = useRef<NodeJS.Timeout | undefined>();

  const initializeUserResources = async () => {
    try {
      const types = [
        "reflection",
        "challenges",
        "goals",
        "highlights",
        "gratitude",
      ];

      // Initialize empty entries for each type
      await Promise.all(
        types.map(async (type) => {
          const response = await axios.get(`/api/journalEntry/${type}`);
          if (!response.data) {
            await axios.put(`/api/journalEntry/${type}`, { content: "" });
          }
        })
      );

      // Initialize board if needed
      const boardResponse = await axios.get("/api/boards");
      if (!boardResponse.data) {
        await axios.post("/api/boards", {
          title: "Journal Board",
        });
      }
    } catch (error) {
      console.error("Error initializing user resources:", error);
    }
  };

  useEffect(() => {
    if (user) {
      initializeUserResources();
    }
  }, [user]);

  useEffect(() => {
    const loadAllEntries = async () => {
      setIsLoading(true);
      try {
        const types = [
          "reflection",
          "challenges",
          "goals",
          "highlights",
          "gratitude",
        ] as const;
        const loadedEntries = await Promise.all(
          types.map(async (type) => {
            const response = await axios.get(`/api/journalEntry/${type}`);
            return { type, content: response.data?.content || "" };
          })
        );

        const newEntries = loadedEntries.reduce(
          (acc, { type, content }) => ({
            ...acc,
            [type]: content,
          }),
          {
            reflection: "",
            challenges: "",
            goals: "",
            highlights: "",
            gratitude: "",
          }
        );

        setEntries(newEntries);
      } catch (error) {
        console.error("Failed to load journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadAllEntries();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Image 
            src={lyraLogo} 
            alt="Lyra Logo" 
            width={48} 
            height={48} 
            className="animate-pulse"
            priority
          />
          <p className="text-sm text-white/60">Loading your journal...</p>
        </div>
      </div>
    );
  }

  const handleEntryChange = (type: string, content: string) => {
    setEntries((prev) => ({ ...prev, [type]: content }));

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    setAutoSaveStatus("saving");
    saveTimeout.current = setTimeout(async () => {
      try {
        await axios.put(`/api/journalEntry/${type}`, { content });
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch (error) {
        console.error(`Failed to save ${type} entry:`, error);
        setAutoSaveStatus("error");
      }
    }, 100);
  };

  const QuickActions = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsCalendarOpen(true)}
        className="p-2 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
      >
        <Calendar size={16} />
        View Calendar
      </button>

      <button className="p-2 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2">
        <LineChart size={16} />
        Weekly Review
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 to-black text-white p-4 overflow-hidden">
      <div className="flex justify-start items-left py-3 px-1">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight font-sans">
                {user?.username || user?.firstName
                  ? `${user.username || user.firstName}'s Journal`
                  : "Daily Journal"}
              </h1>
              <AutoSaveStatus status={autoSaveStatus} />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between gap-2">
            <QuickActions />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox: "w-10 h-10 rounded-lg ring-offset-0",
                  userButtonTrigger: "p-0.5 rounded-lg",
                  userButtonPopoverCard: "min-w-[240px] rounded-lg",
                },
              }}
            />

          </div>
        </div>
      </div>
      <div className="flex gap-4 max-w-[1920px] mx-auto">
        {/* Left side container */}
        <div className="w-1/2 flex flex-col gap-4">
          {/* Daily Reflection */}
          <div className="flex-1 bg-white/5 rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium">Daily Reflection</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    entries.reflection
                      ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  onClick={() => handleEntryChange("reflection", "")}
                  disabled={!entries.reflection}
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-[calc(100%-3rem)] bg-transparent text-white/90 placeholder:text-white/30 
                resize-none focus:outline-none"
              placeholder="Reflect on your day..."
              value={entries.reflection}
              onChange={(e) => handleEntryChange("reflection", e.target.value)}
            />
          </div>

          {/* New Text Area */}
          <div className="flex-1 bg-white/5 rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <SwordIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium">Challenges</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    entries.challenges
                      ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  onClick={() => handleEntryChange("challenges", "")}
                  disabled={!entries.challenges}
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
            
            <textarea
              className="w-full h-[calc(100%-3rem)] bg-transparent text-white/90 placeholder:text-white/30 
                resize-none focus:outline-none"
              placeholder="What challenges did you face today?"
              value={entries.challenges}
              onChange={(e) => handleEntryChange("challenges", e.target.value)}
            />
          </div>
        </div>

        {/* Right side container */}
        <div className="w-1/2 flex h-[calc(93vh-2rem)] flex-col gap-4">
          {/* Goals Section */}
          <div className="flex-1 bg-white/5 rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium">Goals</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    entries.goals
                      ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  onClick={() => handleEntryChange("goals", "")}
                  disabled={!entries.goals}
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-[calc(100%-3rem)] bg-transparent text-white/90 placeholder:text-white/30 
                resize-none focus:outline-none"
              placeholder="What do you want to achieve?"
              value={entries.goals}
              onChange={(e) => handleEntryChange("goals", e.target.value)}
            />
          </div>
          {/* Quick Notes */}
          <div className="flex-1 bg-white/5 rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium">Today's Highlights</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    entries.highlights
                      ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  onClick={() => handleEntryChange("highlights", "")}
                  disabled={!entries.highlights}
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-[calc(100%-3rem)] bg-transparent text-white/90 placeholder:text-white/30 
                resize-none focus:outline-none"
              placeholder="What made you smile today?"
              value={entries.highlights}
              onChange={(e) => handleEntryChange("highlights", e.target.value)}
            />
          </div>

          {/* Gratitude Section */}
          <div className="flex-1 bg-white/5 rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-medium">Gratitude</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    entries.gratitude
                      ? "hover:bg-white/10 text-zinc-400 hover:text-zinc-300"
                      : "text-zinc-700 cursor-not-allowed"
                  }`}
                  onClick={() => handleEntryChange("gratitude", "")}
                  disabled={!entries.gratitude}
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-[calc(100%-3rem)] bg-transparent text-white/90 placeholder:text-white/30 
                resize-none focus:outline-none"
              placeholder="What are you grateful for today?"
              value={entries.gratitude}
              onChange={(e) => handleEntryChange("gratitude", e.target.value)}
            />
          </div>
        </div>
      </div>
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
};

export default JournalPage;
