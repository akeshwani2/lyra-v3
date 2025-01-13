"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Save,
  Plus,
  Pause,
  Play,
  Square,
  X,
  CircleDashed,
  FeatherIcon,
  Wand2,
  Pencil,
  Trash2,
  Clock,
  History,
  MessageCircleQuestionIcon,
  Loader2,
  BookOpenCheck,
  FileText,
  ArrowLeft,
} from "lucide-react";
import NotesHistory from "@/components/ui/NotesHistory";
import RichTextEditor from "@/components/ui/RichTextEditor";
import debounce from "lodash/debounce";
import { TypeAnimation } from "react-type-animation";
import { format } from "date-fns";

// Add this type extension to the Note interface (you may need to update your types file)
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  createdAt: string;
  cards: Flashcard[];
}

const ScribePage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const { user } = useUser();
  const router = useRouter();
  const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [isTitleSaved, setIsTitleSaved] = useState(false);
  const [savedTitle, setSavedTitle] = useState("");
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isNewNote, setIsNewNote] = useState(true);
  const [currentNoteId, setCurrentNoteId] = useState<string>();
  const notesHistoryRef = useRef<{
    loadNotes: () => Promise<void>;
    setNotes: (notes: Note[]) => void;
    setIsOpen: (isOpen: boolean) => void;
  } | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "error" | ""
  >("");
  const MAX_RECORDING_TIME = 300; // 10 minutes in seconds
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const [notesHistory, setNotesHistory] = useState<Note[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [editingListItemId, setEditingListItemId] = useState<string | null>(
    null
  );
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [showFlashcardSets, setShowFlashcardSets] = useState(false);
  const [currentSetId, setCurrentSetId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const renderMobileView = () => {
    if (isMobile) {
      return (
        <div className="min-h-screen w-full fixed inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-900 to-black">
          <div className="space-y-6 max-w-md mx-auto">
            <div className="text-6xl mb-8">📱</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Lyra is not optimized for mobile screens yet
            </h1>
            <p className="text-gray-400 text-lg">
              Please visit us on a desktop or laptop computer for the best
              experience.
            </p>
            <div className="flex justify-center">
              <Link href="/">
                <button className="bg-white text-black px-4 py-2 rounded-md">
                  <div className="absolute inset-0">
                    <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
                    <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
                    <div className="absolute inset-0 shadow-[0_0_10px_rgb(140,69,255.7)_inset] rounded-lg"></div>
                  </div>
                  Go back
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // All useEffects should be after state declarations
  useEffect(() => {
    const loadInitialNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const response = await fetch("/api/notes");
        if (!response.ok) throw new Error("Failed to load notes");
        const data = await response.json();
        setNotesHistory(data);
      } catch (error) {
        console.error("Error loading initial notes:", error);
        toast.error("Failed to load notes");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    loadInitialNotes();
  }, []);

  // Disable the exhaustive-deps warning for this specific hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (content: string, noteId?: string, noteTitle?: string) => {
      if (!content) return;

      try {
        setAutoSaveStatus("saving");

        // Determine if this is a new note from AI transcription
        const isNewAINote = !noteId && !noteTitle;
        const title =
          noteTitle ||
          (isNewAINote
            ? `Notes ${new Date().toLocaleString()}`
            : "Untitled Note");

        const response = await fetch("/api/notes/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: noteId,
            title: title,
            content: content,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save notes");
        }

        const data = await response.json();

        // Update note ID if it's a new note
        if (!noteId) {
          setCurrentNoteId(data.id);
          setTitle(title);
        }

        setSavedTitle(title);
        setIsNoteSaved(true);
        setIsTitleSaved(true);
        setAutoSaveStatus("saved");
        setIsNewNote(false);

        // Refresh notes list
        if (notesHistoryRef.current) {
          await notesHistoryRef.current.loadNotes();
        }
      } catch (error) {
        console.error("Auto-save error:", error);
        setAutoSaveStatus("error");
        toast.error("Failed to save note. Please try again.");
      }
    }, 1000),
    []
  );

  // Add useEffect to cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const startRecording = async () => {
    try {
      setIsCancelled(false);
      chunksRef.current = [];
      setRecordingTime(0);

      // Start the recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            clearInterval(recordingTimerRef.current);
            toast("Recording stopped - maximum duration reached", {
              duration: 4000,
              style: {
                background: "rgba(147, 51, 234, 0.1)",
                border: "1px solid rgba(147, 51, 234, 0.2)",
                color: "#fff",
              },
            });
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up audio context and analyzer with adjusted settings
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      // Increase sensitivity by adjusting these values
      analyser.fftSize = 128; // Smaller FFT size for more rapid updates
      analyser.smoothingTimeConstant = 0.5; // Lower value = more reactive (0-1)
      analyser.minDecibels = -90; // Lower value = more sensitive to quiet sounds
      analyser.maxDecibels = -10; // Upper limit of sensitivity

      source.connect(analyser);
      analyserRef.current = analyser;

      visualizeAudio();

      mediaRecorder.ondataavailable = (e) => {
        if (!isCancelled && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (isCancelled) {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          return;
        }

        if (chunksRef.current.length > 0) {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          await processAudio(audioBlob);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setIsCancelled(false);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      // Stop the recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Stop audio visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume the recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            clearInterval(recordingTimerRef.current);
            toast("Recording stopped - maximum duration reached", {
              duration: 4000,
              style: {
                background: "rgba(147, 51, 234, 0.1)",
                border: "1px solid rgba(147, 51, 234, 0.2)",
                color: "#fff",
              },
            });
            return MAX_RECORDING_TIME;
          }
          return prevTime + 1;
        });
      }, 1000);

      // Resume audio visualization
      visualizeAudio();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Clean up audio visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Add check before closing AudioContext
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }

      // Clean up stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      setAudioData(new Array(50).fill(0));
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Add early return if cancelled or blob is empty
    if (isCancelled || audioBlob.size === 0) {
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStatus("Feeding audio to AI...");

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model", "whisper-1");

      const transcriptionResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      // Add check for cancelled state before continuing
      if (isCancelled) {
        return;
      }

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text();
        throw new Error(errorText || "Transcription failed");
      }

      const transcriptionData = await transcriptionResponse.json();

      // Another cancelled check
      if (isCancelled) {
        return;
      }

      const { text: rawTranscript } = transcriptionData;
      setProcessingStatus("Generating notes...");

      const notesResponse = await fetch("/api/process-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: rawTranscript }),
      });

      // Final cancelled check
      if (isCancelled) {
        return;
      }

      const notesData = await notesResponse.json();
      if (!notesResponse.ok) {
        throw new Error(notesData.error || "Notes processing failed");
      }

      // Format the notes with proper spacing, structure, and indentation
      const formattedNotes = notesData.notes
        // Format section headers
        .replace(
          /^(Topic|Key Points|Important Takeaways|Examples|Definitions):/gm,
          "\n$1:"
        )
        // Add proper spacing after section headers
        .replace(/^(.+:)$/gm, "$1\n")
        // Format bullet points with proper indentation
        .replace(/^[•-]\s*/gm, "• ")
        // Indent sub-points
        .replace(/^(• .+)$/gm, (match: string) => {
          const leadingSpaces = match.match(/^\s*/)?.[0].length ?? 0;
          const indentationLevel = Math.floor(leadingSpaces / 2);
          return "    ".repeat(indentationLevel) + match.trim();
        })
        // Ensure proper spacing between sections
        .replace(/\n{3,}/g, "\n\n")
        // Remove any trailing/leading whitespace
        .trim();

      // Immediately save the transcribed note
      const newTitle = `Notes ${new Date().toLocaleString()}`;
      const saveResponse = await fetch("/api/notes/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: formattedNotes,
          isRecorded: true,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save transcribed note");
      }

      const savedNote = await saveResponse.json();

      // Update all relevant state
      setNotes(formattedNotes);
      setTitle(newTitle);
      setSavedTitle(newTitle);
      setCurrentNoteId(savedNote.id);
      setIsNoteSaved(true);
      setIsTitleSaved(true);
      setIsNewNote(false);
      setAutoSaveStatus("saved");

      // Refresh notes list
      if (notesHistoryRef.current) {
        await notesHistoryRef.current.loadNotes();
      }

      toast.success("Notes generated successfully!", {
        style: {
          background: "rgba(147, 51, 234, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          color: "#fff",
        },
      });
    } catch (err) {
      // Only show error if not cancelled
      if (!isCancelled) {
        console.error("Error processing audio:", err);
        setProcessingStatus("Error: Failed to process recording");
        toast.error(
          err instanceof Error ? err.message : "Failed to process recording"
        );
      }
    } finally {
      // Reset processing states if not cancelled
      if (!isCancelled) {
        setIsProcessing(false);
        setProcessingStatus("");
      }
    }
  };

  const visualizeAudio = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray); // Changed to frequency data for more movement

      // Enhanced normalization with more dramatic scaling
      const normalizedData = Array.from(dataArray)
        .slice(0, 50)
        .map((value) => {
          const normalized = value / 255.0; // Normalize to 0-1
          return normalized * normalized * 1.5; // Square for more dramatic effect
        });

      setAudioData(normalizedData);
      animationFrameRef.current = requestAnimationFrame(visualizeAudio);
    }
  };

  const AudioVisualizer = ({ data }: { data: number[] }) => (
    <div className="flex items-center justify-center h-6 gap-[1px]">
      {data.slice(0, 32).map((value, index) => (
        <div
          key={index}
          className="w-[2px] bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-[50ms]"
          style={{
            height: `${Math.max(2, isPaused ? 2 : value * 100)}%`,
            transform: `scaleY(${isPaused ? 1 : 1 + value * 0.5})`,
            opacity: isPaused ? 0.3 : 0.7 + value * 0.3,
          }}
        />
      ))}
    </div>
  );

  const handleSaveNotes = async () => {
    if (!notes) {
      toast.error("No notes to save");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/notes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || `Notes ${new Date().toLocaleString()}`,
          content: notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to save notes");
      }

      setSavedTitle(title || `Notes ${new Date().toLocaleString()}`);
      setIsNoteSaved(true);
      setIsTitleSaved(true);
      setCurrentNoteId(data.id);

      if (notesHistoryRef.current) {
        await notesHistoryRef.current.loadNotes();
      }

      toast.success("Notes saved successfully!", {
        style: {
          background: "rgba(147, 51, 234, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save notes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Add this temporary test function
  const testSave = async () => {
    try {
      const response = await fetch("/api/notes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Note",
          content: "Test content",
        }),
      });

      const data = await response.json();
      console.log("Test save response:", data);

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to save test note"
        );
      }
    } catch (error) {
      console.error("Test save error:", error);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsTitleSaved(false);
    // Only trigger debounced save if the title is not empty
    if (newTitle.trim()) {
      debouncedSave(notes, currentNoteId, newTitle);
    }
  };

  const handleTitleBlur = async () => {
    // Cancel any pending debounced saves
    debouncedSave.cancel();

    // If title is empty, revert to previous title or "Untitled Note"
    if (!title.trim()) {
      const previousTitle = savedTitle || "Untitled Note";
      setTitle(previousTitle);
      setSavedTitle(previousTitle);
      setIsEditingTitle(false);
      return;
    }

    // Only proceed with update if title changed
    if (title.trim() !== savedTitle) {
      try {
        // Only make API call if note has been saved (has an ID)
        if (currentNoteId) {
          const response = await fetch("/api/notes/update-title", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              noteId: currentNoteId,
              title: title.trim(),
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update title");
          }

          // Update flashcard set titles that match the old title
          const oldFlashcardTitle = `Flashcards for ${savedTitle}`;
          const newFlashcardTitle = `Flashcards for ${title.trim()}`;

          // Find and update flashcard sets with matching titles
          const matchingSets = flashcardSets.filter(
            (set) => set.title === oldFlashcardTitle
          );

          // Use Promise.all to handle multiple flashcard set updates concurrently
          await Promise.all(
            matchingSets.map(async (set) => {
              try {
                const updateResponse = await fetch(
                  `/api/flashcard-sets/${set.id}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      title: newFlashcardTitle,
                    }),
                  }
                );

                if (updateResponse.ok) {
                  // Update local state for this specific set
                  setFlashcardSets((prev) =>
                    prev.map((s) =>
                      s.id === set.id ? { ...s, title: newFlashcardTitle } : s
                    )
                  );
                }
              } catch (error) {
                console.error(
                  `Failed to update flashcard set ${set.id}:`,
                  error
                );
              }
            })
          );

          // After successful update, refresh the notes list
          if (notesHistoryRef.current) {
            await notesHistoryRef.current.loadNotes();
          }

          // Update saved title state after all updates are complete
          setSavedTitle(title.trim());
          setIsTitleSaved(true);
          setIsEditingTitle(false);

          toast.success("Title updated", {
            duration: 2000,
            style: {
              background: "rgba(147, 51, 234, 0.1)",
              border: "1px solid rgba(147, 51, 234, 0.2)",
              color: "#fff",
            },
          });
        }
      } catch (error) {
        console.error("Error updating title:", error);
        toast.error("Failed to update title");
      }
    } else {
      // If title hasn't changed, just exit edit mode
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // This will trigger the blur event
    }
  };

  const resetNote = async () => {
    setNotes("");
    setTitle("");
    setCurrentNoteId(undefined);
    setIsNoteSaved(false);
    setIsTitleSaved(false);
    setIsNewNote(true);
    setSavedTitle("");

    // Refresh notes list
    setIsLoadingNotes(true);
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to load notes");
      const data = await response.json();
      setNotesHistory(data);
    } catch (error) {
      console.error("Error refreshing notes:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleSelectNote = (note: Note) => {
    setNotes(note.content);
    setTitle(note.title);
    setSavedTitle(note.title);
    setCurrentNoteId(note.id);
    setIsNoteSaved(true);
    setIsTitleSaved(true);
    setIsNewNote(false);
    localStorage.setItem("lastOpenedNoteId", note.id);
  };

  const handleDeleteNote = async (noteIdToDelete: string) => {
    if (!noteIdToDelete) {
      toast.error("No note to delete");
      return;
    }

    // Create a promise that resolves based on user interaction with the toast
    const userConfirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-white text-center">
              Are you sure you want to delete this note?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 
                       rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 
                       rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000, // 5 seconds
          style: {
            background: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "0.75rem",
            padding: "1rem",
          },
        }
      );
    });

    if (!userConfirmed) return;

    try {
      setIsSaving(true);

      const deleteResponse = await fetch("/api/notes/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId: noteIdToDelete }),
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete note");
      }

      // Update the notesHistory state immediately by filtering out the deleted note
      setNotesHistory((prevNotes) =>
        prevNotes.filter((note) => note.id !== noteIdToDelete)
      );

      // Only reset if we're deleting the currently displayed note
      if (noteIdToDelete === currentNoteId) {
        resetNote();
        localStorage.removeItem("lastOpenedNoteId");
      }

      // Refresh the notes list
      if (notesHistoryRef.current) {
        await notesHistoryRef.current.loadNotes();
      }

      toast.success("Note deleted successfully", {
        style: {
          background: "rgba(34, 197, 94, 0.1)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          color: "#fff",
          borderRadius: "0.75rem",
        },
        position: "bottom-center", // Add this to center the toast
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note", {
        style: {
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fff",
          borderRadius: "0.75rem",
        },
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelRecording = () => {
    // Set cancelled state first
    setIsCancelled(true);
    setIsProcessing(false); // Immediately clear processing state
    setProcessingStatus(""); // Clear any status message

    // Clear the chunks array
    chunksRef.current = [];

    // Stop the media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }

    // Clean up audio visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Reset audio data
    setAudioData(new Array(50).fill(0));

    // Reset notes
    resetNote();
  };

  const startNewNote = async () => {
    try {
      // First reset all states
      resetNote();

      // Generate new title with timestamp
      const newTitle = `Notes ${new Date().toLocaleString()}`;

      // Create a new note in the database
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: "",
          isRecorded: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create new note");
      }

      const newNote = await response.json();

      // Update local state with the new note
      setNotes("");
      setTitle(newTitle);
      setSavedTitle(newTitle);
      setCurrentNoteId(newNote.id);
      setIsNoteSaved(true);
      setIsTitleSaved(true);
      setIsNewNote(false);

      // Refresh notes list
      if (notesHistoryRef.current) {
        await notesHistoryRef.current.loadNotes();
      }

      toast.success("New note created", {
        style: {
          background: "rgba(147, 51, 234, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error creating new note:", error);
      toast.error("Failed to create new note");
    }
  };

  const handleNotesChange = (newContent: string) => {
    if (!currentNoteId) return; // Don't update if no note is selected

    setNotes(newContent);
    setIsNoteSaved(false);
    debouncedSave(newContent, currentNoteId, title);
  };

  const enhanceNotes = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Get any selected text
    const selection = window.getSelection();
    const selectedText = selection?.toString();

    // If no text is selected, check if there's any note content
    if (!selectedText && !notes.trim()) {
      toast.error("Please add some notes first");
      return;
    }

    try {
      setIsEnhancing(true);

      // Create a temporary div to clean HTML
      const tempDiv = document.createElement("div");

      // If we have selected text, clean it first
      const contentToEnhance =
        selectedText ||
        (() => {
          tempDiv.innerHTML = notes;
          return tempDiv.textContent || tempDiv.innerText || "";
        })();

      const response = await fetch("/api/enhance-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToEnhance,
          isPartialContent: !!selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance notes");
      }

      const { enhancedNotes } = await response.json();

      // If we enhanced selected text, replace just that portion
      if (selectedText && selection && selection.rangeCount > 0) {
        // Get the editor's HTML content
        const editor = document.querySelector(".ProseMirror");
        if (!editor) return;

        // Insert the enhanced content at cursor position
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a temporary container for the enhanced content
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = enhancedNotes;

        // Extract text content
        const enhancedText =
          tempContainer.textContent || tempContainer.innerText;

        // Insert the text
        const textNode = document.createTextNode(enhancedText);
        range.insertNode(textNode);

        // Update the notes state with the modified content
        setNotes(editor.innerHTML);
        debouncedSave(editor.innerHTML, currentNoteId, title);
      } else {
        // Replace entire note content
        setNotes(enhancedNotes);
        debouncedSave(enhancedNotes, currentNoteId, title);
      }

      toast.success("Notes enhanced successfully!", {
        duration: 2000,
        style: {
          background: "rgba(147, 51, 234, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error enhancing notes:", error);
      toast.error("Failed to enhance notes");
    } finally {
      setIsEnhancing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleListItemTitleUpdate = async (
    noteId: string,
    newTitle: string
  ) => {
    try {
      const response = await fetch("/api/notes/update-title", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId: noteId,
          title: newTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update title");
      }

      // Find the old title from the notes history
      const oldTitle =
        notesHistory.find((note) => note.id === noteId)?.title || "";

      // Update flashcard set titles that match the old title
      const oldFlashcardTitle = `Flashcards for ${oldTitle}`;
      const newFlashcardTitle = `Flashcards for ${newTitle}`;

      // Find and update flashcard sets with matching titles
      const matchingSets = flashcardSets.filter(
        (set) => set.title === oldFlashcardTitle
      );

      for (const set of matchingSets) {
        const updateResponse = await fetch(`/api/flashcard-sets/${set.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newFlashcardTitle,
          }),
        });

        if (updateResponse.ok) {
          // Update local state
          setFlashcardSets((prev) =>
            prev.map((s) =>
              s.id === set.id ? { ...s, title: newFlashcardTitle } : s
            )
          );
        }
      }

      // Update the notes history state directly
      setNotesHistory((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId ? { ...note, title: newTitle } : note
        )
      );

      // Reset editing state
      setEditingListItemId(null);

      toast.success("Title updated", {
        duration: 2000,
        style: {
          background: "rgba(147, 51, 234, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          color: "#fff",
        },
      });
    } catch (error) {
      toast.error("Failed to update title");
    }
  };

  const generateFlashcards = async () => {
    if (!notes) {
      toast.error("Please add some notes first", {
        duration: 2000,
        style: {
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fff",
        },
      });
      return;
    }

    try {
      setIsGeneratingFlashcards(true);

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = notes;
      const cleanText = tempDiv.textContent || tempDiv.innerText || "";

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: cleanText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();

      // Auto-save the flashcard set immediately after generation
      const saveResponse = await fetch("/api/flashcard-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Flashcards for ${title || "Untitled Note"}`,
          cards: data.cards,
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save flashcard set");

      const newSet = await saveResponse.json();
      setFlashcardSets((prev) => [...prev, newSet]);
      setFlashcards(data.cards || []);
      setShowFlashcards(true);

      toast.success("Flashcards generated and saved!", {
        duration: 2000,
        style: {
          background: "rgba(255, 215, 0, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const loadFlashcardSets = async () => {
    try {
      const response = await fetch("/api/flashcard-sets");
      if (!response.ok) throw new Error("Failed to load flashcard sets");
      const sets = await response.json();
      setFlashcardSets(sets);
    } catch (error) {
      console.error("Error loading flashcard sets:", error);
      toast.error("Failed to load flashcard sets");
    }
  };

  useEffect(() => {
    loadFlashcardSets();
  }, []);

  const loadFlashcardSet = async (setId: string) => {
    try {
      const response = await fetch(`/api/flashcard-sets/${setId}`);
      if (!response.ok) throw new Error("Failed to load flashcard set");
      const set = await response.json();
      setFlashcards(set.cards);
      setCurrentSetId(setId);
      setShowFlashcards(true);
      setShowFlashcardSets(false);
    } catch (error) {
      console.error("Error loading flashcard set:", error);
      toast.error("Failed to load flashcard set");
    }
  };

  const deleteFlashcardSet = async (setId: string) => {
    try {
      const response = await fetch(`/api/flashcard-sets/${setId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete flashcard set");

      // Update the local state to remove the deleted set
      setFlashcardSets((prev) => prev.filter((set) => set.id !== setId));
      toast.success("Flashcard set deleted", {
        style: {
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          color: "#fff",
        },
      });
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950">
      {renderMobileView() || (
        <>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          </div>

          {/* Main content - make this a flex container with h-screen */}
          <div className="absolute inset-0 flex flex-col h-screen">
            {/* Header bar - add flex-shrink-0 to prevent shrinking */}
            <div className="flex justify-between items-center w-full px-8 py-8 flex-shrink-0">
              <h1 className="text-2xl sm:text-4xl pb-1 font-bold bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text pl-2">
                {savedTitle || "Scribe"}
              </h1>

              <div className="flex items-center gap-4">
                {(currentNoteId || notes) && (
                  <div className="relative flex gap-2">
                    <Button
                      onClick={() => {
                        startRecording();
                        resetNote();
                      }}
                      className="group relative bg-gradient-to-r from-purple-500 to-blue-500 hover:from-violet-600 hover:to-cyan-500 transition-all duration-300 ease-in-out rounded-xl px-6 py-2 text-base font-medium shadow-lg hover:shadow-[0_0_2rem_-0.5rem_rgba(139,92,246,0.8)]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        New Recording
                      </span>
                    </Button>
                    <Button
                      onClick={async (e) => {
                        e.preventDefault();
                        await startNewNote();
                      }}
                      className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 ease-in-out rounded-xl px-6 py-2 text-base font-medium shadow-lg hover:shadow-[0_0_2rem_-0.5rem_rgba(16,185,129,0.8)]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <FeatherIcon className="w-4 h-4" />
                        New Note
                      </span>
                    </Button>
                    <button
                      onClick={() => {
                        setShowFlashcards(false);
                        setShowFlashcardSets(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                               text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      View Sets
                    </button>
                    <Button
                      onClick={() => notesHistoryRef.current?.setIsOpen(true)}
                      className="group relative bg-white/5 hover:bg-white/10 transition-all duration-300 ease-in-out rounded-xl px-6 py-2 text-base font-medium"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        History
                      </span>
                    </Button>
                  </div>
                )}

                {/* User button container */}
                <div className="flex items-center gap-4 border border-white/20 rounded-xl px-1 py-1">
                  <span className="bg-gradient-to-t from-zinc-600 tracking-tight via-zinc-300 to-white text-transparent bg-clip-text text-lg md:text-xl font-bold">
                    {user?.username || user?.firstName || ""}
                  </span>
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

            {/* Notes display - update with overflow-y-auto and flex-1 */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {isProcessing ? (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/90 rounded-xl border border-white/10">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                        Feeding audio to AI...
                      </p>
                      <p className="text-sm text-gray-500">
                        Converting your speech into structured notes
                      </p>
                    </div>
                  </div>
                </div>
              ) : currentNoteId || notes ? (
                <div className="relative pt-6">
                  <div className="max-w-[109rem] w-full mx-auto h-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col">
                    <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
                      {/* Title section - with actions aligned */}
                      <div className="flex items-center justify-between">
                        {/* Title and edit button */}
                        <div className="flex items-center justify-center gap-4">
                          {/* Add back arrow */}
                          <button
                            onClick={() => window.location.reload()}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                          </button>

                          {isEditingTitle ? (
                            <input
                              type="text"
                              value={title}
                              onChange={handleTitleChange}
                              onBlur={handleTitleBlur}
                              onKeyDown={handleTitleKeyDown}
                              placeholder="Enter title..."
                              className="bg-transparent border-b border-purple-500/30 focus:border-purple-500 outline-none px-2 py-1 text-white placeholder:text-gray-400 transition-all duration-300 w-full max-w-[400px] text-2xl text-center items-center"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <h3
                                className="text-white text-2xl font-medium text-center items-center cursor-pointer"
                                onClick={() => {
                                  setIsEditingTitle(true);
                                  setIsTitleSaved(false);
                                }}
                              >
                                {savedTitle || "Untitled Note"}
                              </h3>
                              <button
                                onClick={() => {
                                  setIsEditingTitle(true);
                                  setIsTitleSaved(false);
                                }}
                                className="text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-4">
                          {/* Auto-save status indicator */}
                          <div className="text-sm">
                            {autoSaveStatus === "saving" && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <CircleDashed className="w-3 h-3 animate-spin" />
                                Saving...
                              </div>
                            )}
                            {autoSaveStatus === "saved" && (
                              <div className="flex items-center gap-1 text-green-500">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Saved
                              </div>
                            )}
                            {autoSaveStatus === "error" && (
                              <div className="flex items-center gap-1 text-red-500">
                                <X className="w-3 h-3" />
                                Error saving
                              </div>
                            )}
                          </div>

                          {/* Enhance button */}
                          {notes && !isProcessing && (
                            <Button
                              onClick={enhanceNotes}
                              className="group relative bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-300 ease-in-out rounded-xl px-4 py-2 text-sm font-medium shadow-lg hover:shadow-[0_0_2rem_-0.5rem_rgba(167,139,250,0.8)]"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                <Wand2 className="w-4 h-4" />
                                Enhance with AI
                              </span>
                            </Button>
                          )}

                          {/* Flashcard button */}
                          {/* {notes && !isProcessing && (
                            <Button
                              onClick={generateFlashcards}
                              className="group relative bg-gradient-to-r from-orange-500 to-amber-500 
                                       hover:from-orange-600 hover:to-amber-600 transition-all duration-300 
                                       ease-in-out rounded-xl px-4 py-2 text-sm font-medium shadow-lg 
                                       hover:shadow-[0_0_2rem_-0.5rem_rgba(249,115,22,0.8)]"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                <BookOpenCheck className="w-4 h-4" />
                                Generate Flashcards
                              </span>
                            </Button>
                          )} */}
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none flex-1 overflow-hidden">
                      <RichTextEditor
                        content={notes}
                        onChange={handleNotesChange}
                        noteId={currentNoteId}
                      />
                    </div>
                  </div>

                  {/* NotesHistory with explicit z-index */}
                  <NotesHistory
                    ref={notesHistoryRef}
                    onSelectNote={handleSelectNote}
                    currentNoteId={currentNoteId}
                    onDeleteNote={handleDeleteNote}
                    className="z-50"
                  />
                </div>
              ) : (
                <div className="max-w-4xl w-full mx-auto mt-6">
                  {isLoadingNotes ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-500/50" />
                      <p className="text-sm text-gray-500">
                        Checking for notes...
                      </p>
                    </div>
                  ) : notesHistory.length > 0 ? (
                    <div className="w-full space-y-4">
                      {/* Header section with gradient text and backdrop blur */}
                      <div className="flex items-center justify-between mb-4 sticky top-0 bg-zinc-950/80 backdrop-blur-sm z-10 py-4">
                        <h2 className="text-3xl font-semibold text-white/90">
                          Recent Notes
                        </h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              startRecording();
                              resetNote();
                            }}
                            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 
                                     hover:from-violet-600 hover:to-cyan-500 transition-all duration-300 
                                     ease-in-out rounded-xl px-4 py-2 text-sm font-medium shadow-lg 
                                     hover:shadow-[0_0_2rem_-0.5rem_rgba(139,92,246,0.8)]"
                          >
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            <span className="relative z-10 flex items-center gap-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              New Recording
                            </span>
                          </Button>
                          <Button
                            onClick={startNewNote}
                            className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 
                                     hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 
                                     ease-in-out rounded-xl px-4 py-2 text-sm font-medium shadow-lg 
                                     hover:shadow-[0_0_2rem_-0.5rem_rgba(16,185,129,0.8)]"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <FeatherIcon className="w-4 h-4" />
                              New Note
                            </span>
                          </Button>
                          <button
                            onClick={() => {
                              setShowFlashcards(false);
                              setShowFlashcardSets(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                                     text-blue-400 transition-colors flex items-center gap-2"
                          >
                            <BookOpenCheck className="w-4 h-4" />
                            View Sets
                          </button>
                        </div>
                      </div>

                      {/* Notes list with enhanced styling */}
                      <div className="space-y-4">
                        {notesHistory.map((note, index) => (
                          <div
                            key={note.id}
                            onClick={() => handleSelectNote(note)}
                            className="group relative p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl 
                                      border border-white/10 transition-all duration-300 
                                      hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                                      hover:border-purple-500/30
                                      cursor-pointer"
                          >
                            <div className="relative flex items-center justify-between">
                              <div className="flex-1 flex items-center gap-2">
                                {editingListItemId === note.id ? (
                                  <input
                                    type="text"
                                    defaultValue={note.title}
                                    autoFocus
                                    onBlur={(e) =>
                                      handleListItemTitleUpdate(
                                        note.id,
                                        e.target.value
                                      )
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleListItemTitleUpdate(
                                          note.id,
                                          e.currentTarget.value
                                        );
                                      } else if (e.key === "Escape") {
                                        setEditingListItemId(null);
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-transparent border-b border-purple-500/30 focus:border-purple-500 
                                             outline-none px-2 py-1 text-white placeholder:text-gray-400 
                                             transition-all duration-300 w-full max-w-[400px]"
                                  />
                                ) : (
                                  <>
                                    <h3 className="text-lg font-medium text-white/90 group-hover:text-white">
                                      {note.title}
                                    </h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingListItemId(note.id);
                                        }}
                                        className="text-green-400 hover:text-green-300 p-1 rounded-lg hover:bg-green-500/10
                                                 transition-colors duration-200"
                                        aria-label="Edit title"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteNote(note.id);
                                        }}
                                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10
                                                 transition-colors duration-200"
                                        aria-label="Delete note"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                              <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors duration-200">
                                {format(
                                  new Date(note.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Updated empty state to match design
                    <div className="max-w-4xl mx-auto px-4 space-y-12">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="text-md font-bold text-gray-400 [text-shadow:0_0_15px_rgba(255,255,255,0.5)]">
                            Welcome to
                          </div>
                          <span
                            className="bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] 
                                      text-transparent bg-clip-text text-6xl font-bold block"
                          >
                            Scribe
                          </span>
                          <p className="text-gray-400 text-lg max-w-2xl">
                            Your AI-powered note-taking assistant. Record your
                            thoughts, meetings, or lectures and let AI transform
                            them into well-structured notes.
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-start">
                          <Button
                            onClick={() => {
                              startRecording();
                              resetNote();
                            }}
                            className="group relative bg-gradient-to-r from-purple-500 to-blue-500 hover:from-violet-600 
                                     hover:to-cyan-500 transition-all duration-300 ease-in-out rounded-xl px-6 py-3 
                                     text-base font-medium shadow-lg hover:shadow-[0_0_2rem_-0.5rem_rgba(139,92,246,0.8)]"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <div className="w-2 h-2 bg-white rounded-full" />
                              Start Recording
                            </span>
                          </Button>

                          <Button
                            onClick={startNewNote}
                            className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 
                                     hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 
                                     ease-in-out rounded-xl px-6 py-3 text-base font-medium shadow-lg 
                                     hover:shadow-[0_0_2rem_-0.5rem_rgba(16,185,129,0.8)]"
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              <FeatherIcon className="w-4 h-4" />
                              New Note
                            </span>
                          </Button>
                        </div>
                      </div>

                      {/* Features Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                            <MessageCircleQuestionIcon className="w-5 h-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Voice to Notes
                          </h3>
                          <p className="text-gray-400">
                            Record your voice and watch as AI transforms it into
                            well-structured, organized notes.
                          </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                            <Wand2 className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            AI Enhancement
                          </h3>
                          <p className="text-gray-400">
                            Let AI help organize, format, and enhance your notes
                            with additional context and structure.
                          </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                            <History className="w-5 h-5 text-emerald-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Note History
                          </h3>
                          <p className="text-gray-400">
                            Access all your past notes with automatic saving and
                            easy organization.
                          </p>
                        </div>
                      </div>

                      {/* Getting Started Guide */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-white mb-4">
                          Getting Started
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-sm text-purple-400">
                              1
                            </div>
                            <p>
                              Click "Start Recording" to begin capturing your
                              voice
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-sm text-purple-400">
                              2
                            </div>
                            <p>Speak clearly into your microphone</p>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400">
                            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-sm text-purple-400">
                              3
                            </div>
                            <p>
                              Stop recording when finished and let AI process
                              your notes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isRecording && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/90 rounded-xl border border-white/10">
                {/* Audio visualizer and controls */}
                <div className="flex items-center gap-4">
                  {/* Audio visualizer */}
                  <div className="w-32">
                    <AudioVisualizer data={audioData} />
                    <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                        style={{
                          width: `${
                            (recordingTime / MAX_RECORDING_TIME) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-sm text-white/70 min-w-[80px]">
                    {formatTime(recordingTime)}/5:00
                  </div>

                  {/* Control buttons */}
                  <div className="flex items-center gap-2">
                    {!isPaused ? (
                      <button
                        onClick={pauseRecording}
                        className="w-8 h-8 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 
                                 flex items-center justify-center transition-all duration-300
                                 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                      >
                        <Pause className="w-4 h-4 text-yellow-500" />
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/30 
                                 flex items-center justify-center transition-all duration-300
                                 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      >
                        <Play className="w-4 h-4 text-green-500" />
                      </button>
                    )}

                    <button
                      onClick={stopRecording}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 
                               flex items-center justify-center transition-all duration-300
                               hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                      <Square className="w-4 h-4 text-red-500" />
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-8 h-8 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 
                               flex items-center justify-center transition-all duration-300
                               hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Recording status text */}
                <p className="text-sm text-gray-400">
                  Recording in progress...
                </p>
              </div>
            </div>
          )}

          {isEnhancing && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/90 rounded-xl border border-white/10">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                    Enhancing your notes...
                  </p>
                  <p className="text-sm text-gray-500">
                    Adding structure and context to your content
                  </p>
                </div>
              </div>
            </div>
          )}

          {isGeneratingFlashcards && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/90 rounded-xl border border-white/10">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                <p className="text-sm text-gray-400">
                  Generating flashcards...
                </p>
              </div>
            </div>
          )}

          {showFlashcards && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-zinc-900/90 rounded-xl border border-white/10 p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-white">
                      Flashcards
                    </h3>
                    <span className="text-sm text-gray-400">
                      {currentCardIndex + 1} / {flashcards.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View Sets button */}
                    <button
                      onClick={() => {
                        setShowFlashcards(false);
                        setShowFlashcardSets(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 
                               text-blue-400 transition-colors flex items-center gap-2"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      View Sets
                    </button>

                    {/* Close button */}
                    <button
                      onClick={() => {
                        setShowFlashcards(false);
                        setCurrentCardIndex(0);
                        setIsFlipped(false);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Flashcard container */}
                <div className="relative w-full aspect-[16/9] mb-6">
                  <div
                    className={`w-full h-full cursor-pointer transition-all duration-500 preserve-3d
                               ${isFlipped ? "rotate-y-180" : ""}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front of card */}
                    <div className="absolute inset-0 backface-hidden">
                      <div
                        className="w-full h-full bg-white/5 rounded-xl border border-white/10 p-8
                                    flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-sm text-purple-400 mb-2">
                          Question
                        </span>
                        <p className="text-white text-lg">
                          {flashcards[currentCardIndex]?.question}
                        </p>
                      </div>
                    </div>

                    {/* Back of card */}
                    <div className="absolute inset-0 rotate-y-180 backface-hidden">
                      <div
                        className="w-full h-full bg-white/5 rounded-xl border border-white/10 p-8
                                    flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-sm text-emerald-400 mb-2">
                          Answer
                        </span>
                        <p className="text-white text-lg">
                          {flashcards[currentCardIndex]?.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                      setIsFlipped(false);
                    }}
                    disabled={currentCardIndex === 0}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50
                             disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Click card to flip
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentCardIndex((prev) =>
                        Math.min(flashcards.length - 1, prev + 1)
                      );
                      setIsFlipped(false);
                    }}
                    disabled={currentCardIndex === flashcards.length - 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50
                             disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add new modal for flashcard sets */}
          {showFlashcardSets && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-zinc-900/90 rounded-xl border border-white/10 p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Flashcard Sets
                  </h3>
                  <button
                    onClick={() => setShowFlashcardSets(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {flashcardSets.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {flashcardSets.map((set) => (
                      <div
                        key={set.id}
                        className="group p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 
                                 transition-all duration-200 cursor-pointer"
                        onClick={() => loadFlashcardSet(set.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">
                              {set.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {set.cards.length} cards • Created{" "}
                              {new Date(set.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFlashcardSet(set.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                                     text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpenCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No flashcard sets yet</p>
                    <p className="text-sm mt-2">
                      Generate some flashcards from your notes to get started!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ScribePage;
