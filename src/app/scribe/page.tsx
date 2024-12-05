"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
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
} from "lucide-react";
import NotesHistory from "@/components/ui/NotesHistory";
import { Note } from "@/types";
import RichTextEditor from "@/components/ui/RichTextEditor";
import debounce from "lodash/debounce";
import { TypeAnimation } from "react-type-animation";

const ScribePage = () => {
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
  const notesHistoryRef = useRef<{ loadNotes: () => Promise<void> } | null>(
    null
  );
  const [isCancelled, setIsCancelled] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "error" | ""
  >("");
  const MAX_RECORDING_TIME = 300; // 5 minutes in seconds
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout>();

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
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      // Clean up stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
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

      toast.success("Recording processed and saved successfully!");
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
    <div className="flex items-center justify-center h-12 gap-[2px] px-4">
      {data.map((value, index) => (
        <div
          key={index}
          className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-[50ms]"
          style={{
            height: `${Math.max(4, (isPaused ? 4 : value * 100))}%`,
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

      toast.success("Notes saved successfully!");
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

          // After successful update, refresh the notes list
          if (notesHistoryRef.current) {
            await notesHistoryRef.current.loadNotes();
          }
        }

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
      } catch (error) {
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

  const resetNote = () => {
    setNotes("");
    setTitle("");
    setCurrentNoteId(undefined);
    setIsNoteSaved(false);
    setIsTitleSaved(false);
    setIsNewNote(true);
    setSavedTitle("");
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

    // Prevent multiple deletion attempts
    if (isSaving) return;

    try {
      setIsSaving(true);

      // Show confirmation dialog only once
      if (!confirm("Are you sure you want to delete this note?")) {
        setIsSaving(false);
        return;
      }

      // Delete the note
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

      // Only reset if we're deleting the currently displayed note
      if (noteIdToDelete === currentNoteId) {
        resetNote();
        localStorage.removeItem("lastOpenedNoteId");
      }

      // Refresh the notes list
      if (notesHistoryRef.current) {
        await notesHistoryRef.current.loadNotes();
      }

      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
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

      toast.success("New note created");
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
      setIsProcessing(true);
      setProcessingStatus("Enhancing notes with AI...");

      const response = await fetch("/api/enhance-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: selectedText || notes,
          isPartialContent: !!selectedText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance notes");
      }

      const { enhancedNotes } = await response.json();

      // If we enhanced selected text, replace just that portion
      if (selectedText && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(enhancedNotes));

        // Trigger save with the updated content
        const updatedContent = notes.replace(selectedText, enhancedNotes);
        setNotes(updatedContent);
        debouncedSave(updatedContent, currentNoteId, title);
      } else {
        // Replace entire note content
        setNotes(enhancedNotes);
        debouncedSave(enhancedNotes, currentNoteId, title);
      }

      toast.success("Notes enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing notes:", error);
      toast.error("Failed to enhance notes");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Main content - add flex-col and min-h-screen */}
      <div className="absolute inset-0 flex flex-col min-h-screen">
        {/* Header bar - adjust the right padding and user button container */}
        <div className="flex justify-between items-center w-full px-8 py-8">
          <h1 className="text-2xl sm:text-4xl pb-1 font-bold bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text pl-2">
            {savedTitle || "Scribe"}
          </h1>

          <div className="flex items-center gap-8">
            {notes && (
              <div className="relative flex gap-2">
                {!isRecording ? (
                  <>
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
                  </>
                ) : isPaused ? (
                  <Button
                    onClick={resumeRecording}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-500 transition-all duration-300 px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-all duration-300 px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <CircleDashed className="w-4 h-4 animate-spin" />
                    Stop
                  </Button>
                )}
              </div>
            )}

            {/* Update user button container positioning */}
            <div className="flex items-center gap-2 border border-white/15 rounded-xl px-2 md:right-8 flex items-center gap-2 z-10 tracking-tight">
              <span className="bg-gradient-to-t from-zinc-600 tracking-tight via-zinc-300 to-white text-transparent bg-clip-text text-lg md:text-xl font-bold">
                {user?.username || user?.firstName || ""}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  baseTheme: dark,
                  elements: {
                    avatarBox: "w-8 h-8 md:w-10 md:h-10",
                    userButtonTrigger: "p-1 md:p-2",
                    userButtonPopoverCard: "min-w-[240px]",
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Notes display - add loader */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {isProcessing ? (
            <div className="max-w-3xl w-full mx-auto mt-12 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <div className="text-white/80 text-lg font-medium animate-pulse">
                {processingStatus}
              </div>
            </div>
          ) : currentNoteId || notes ? (
            <div className="max-w-[109rem] w-full mx-auto h-full bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col">
              <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
                {/* Title section - with actions aligned */}
                <div className="flex items-center justify-between">
                  {/* Title and edit button */}
                  <div className="flex items-center justify-center gap-2">
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
                          className="text-white text-2xl font-medium text-center items-center cursor-pointer "
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
          ) : (
            // Welcome screen
            <div className="max-w-3xl w-full mx-auto mt-48 flex flex-col items-center gap-8">
              <div className="flex gap-8">
                {/* Voice Recording Button */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full hover:opacity-50 animate-pulse"></div>
                  <Image
                    onClick={() => {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                        resetNote();
                      }
                    }}
                    src={isRecording ? "/circle-dashed.svg" : "/microphone.svg"}
                    alt={isRecording ? "Recording" : "Microphone"}
                    width={256}
                    height={256}
                    className="relative z-10 p-6 cursor-pointer transition-all duration-300 hover:scale-110"
                  />
                </div>

                {/* Manual Notes Button */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:opacity-50 animate-pulse"></div>
                  <div
                    onClick={startNewNote}
                    className="relative z-10 w-full h-full p-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center"
                  >
                    <FeatherIcon className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-md font-bold text-gray-400 [text-shadow:0_0_15px_rgba(255,255,255,0.5)]">
                  Welcome to
                </div>
                <span className="bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-6xl mb-4 font-bold">
                  Scribe
                </span>
                <p className="text-sm sm:text-xl text-gray-400 sm:pb-0 pt-4 [text-shadow:0_0_15px_rgba(255,255,255,0.5)]">
                  <TypeAnimation
                    sequence={[
                      "Record Lectures and Transform Them into Notes with AI Assistance",
                      2000,
                      "Enhance Your Notes with AI for Better Understanding and Clarity",
                      2000,
                      "Efficiently Organize Your Notes with AI-Powered Enhancements",
                      2000,
                    ]}
                    wrapper="span"
                    speed={75}
                    repeat={Infinity}
                  />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 w-96 bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex flex-col gap-4">
            <AudioVisualizer data={audioData} />

            <div className="flex flex-col gap-2">
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${(recordingTime / MAX_RECORDING_TIME) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-white/70">
                <span>{formatTime(recordingTime)}</span>
                <span className="text-red-400">Max {formatTime(MAX_RECORDING_TIME)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-center gap-4">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="w-10 h-10 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 
                           flex items-center justify-center transition-all duration-300
                           hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                >
                  <Pause className="w-4 h-4 text-yellow-500" />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500/30 
                           flex items-center justify-center transition-all duration-300
                           hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  <Play className="w-4 h-4 text-green-500" />
                </button>
              )}

              <button
                onClick={stopRecording}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 
                         flex items-center justify-center transition-all duration-300
                         hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <Square className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      )}
      <NotesHistory
        ref={notesHistoryRef}
        onSelectNote={handleSelectNote}
        currentNoteId={currentNoteId}
        onDeleteNote={handleDeleteNote}
      />
      {/* Move footer outside the main content area but inside the container */}
    </div>
  );
};
export default ScribePage;