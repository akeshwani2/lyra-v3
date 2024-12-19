"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  BookOpen,
  Target,
  Calendar,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  PlusCircle,
  CircleDashed,
  Check,
  CheckCircle,
  MessageCircle,
  MessageCircleQuestionIcon,
  Loader2,
} from "lucide-react";
import { dark } from "@clerk/themes";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Plus, Clock } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import * as Tooltip from "@radix-ui/react-tooltip";
import PomodoroTimer from "@/components/ui/PomodoroTimer";
import MiniKanban from "@/components/ui/MiniKanban";
import PDFViewer from "@/components/ui/PDFViewer";

interface Task {
  id: string;
  content: string;
  status: "todo" | "inProgress" | "completed";
}

// Add the state for dragging
interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

interface TourOverlayProps {
  onFinish: () => void;
}

interface Course {
  id: string;
  name: string;
  color: string;
}

interface EditCourseModalProps {
  course: Course;
  onClose: () => void;
  onSave: (id: string, newName: string, newColor: string) => void;
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  type: "Assignment" | "Exam" | "Quiz" | "Other";
}

interface EditAssignmentModalProps {
  assignment: Assignment;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Assignment>) => void;
}

// Add this new interface
interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

// Add this interface
interface ParsedAssignment {
  title: string;
  dueDate: string;
  type: "Assignment" | "Exam" | "Quiz" | "Project" | "Other";
  weight: number | null;
}

// Add this shared color palette at the top of the file, outside any components
const COURSE_COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#F5F5F5', // Pearl White
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

const TasksPage = () => {
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showDemoData, setShowDemoData] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(true);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Add loading states
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Add these state variables
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // Add state for task counts
  const [taskCounts, setTaskCounts] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
  });

  // Add these new state variables
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout>();

  // Add state for task modal
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Add these state variables
  const [parsedAssignments, setParsedAssignments] = useState<ParsedAssignment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add these state variables at the top of your component
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());

  // Add this function at the beginning of your TasksPage component
  const initializeUserResources = async () => {
    try {
      // Initialize Quick Notes
      const notesResponse = await axios.get("/api/quickNotes");
      if (!notesResponse.data) {
        await axios.post("/api/quickNotes", { content: "" });
      }

      // Initialize Board
      const boardResponse = await axios.get("/api/boards");
      if (!boardResponse.data) {
        await axios.post("/api/boards", {
          title: "Tasks Board",
        });
      }
    } catch (error) {
      console.error("Error initializing user resources:", error);
    }
  };

  // Add this useEffect near your other useEffects
  useEffect(() => {
    if (user) {
      initializeUserResources();
    }
  }, [user]); // Only run when user changes

  // Update the useEffect for loading courses
  useEffect(() => {
    const loadCourses = async () => {
      if (!showDemoData) {
        setIsLoadingCourses(true);
        try {
          const response = await axios.get("/api/courses");
          setCourses(response.data);
        } catch (error) {
          console.error("Failed to load courses:", error);
        } finally {
          setIsLoadingCourses(false);
        }
      }
    };

    loadCourses();
  }, [showDemoData]);

  // Update the useEffect for loading assignments
  useEffect(() => {
    const loadAssignments = async () => {
      if (!showDemoData) {
        setIsLoadingAssignments(true);
        try {
          const response = await axios.get("/api/assignments");
          setAssignments(response.data);
        } catch (error) {
          console.error("Failed to load assignments:", error);
          if (axios.isAxiosError(error)) {
            console.error("Error response data:", error.response?.data);
          }
        } finally {
          setIsLoadingAssignments(false);
        }
      }
    };

    loadAssignments();
  }, [showDemoData]);

  // Add a new function to handle manual tour trigger
  const handleStartTour = () => {
    setShowTour(true);
    setShowDemoData(true);
    // Reset tour step to beginning
    setCurrentTourStep(0);
  };

  const handleTourExit = () => {
    setShowTour(false);
    setShowDemoData(false); // Remove demo data when manually exiting tour
  };

  const QuickActions = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsAddCourseOpen(true)}
        className="p-2 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
      >
        <PlusCircle size={16} />
        Add Course
      </button>
      <button
        onClick={() => setIsAddAssignmentOpen(true)}
        className="p-2 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
      >
        <Calendar size={16} />
        Add Deadline
      </button>
      {/* <button
        onClick={handleStartTour}
        className="p-2 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
      >
        <BookOpen className="w-4 h-4" />
        View Tutorial
      </button> */}
      <button
        onClick={() => router.push("/contact")}
        className="p-2 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
      >
        <MessageCircleQuestionIcon size={18} />
        Feedback
      </button>
    
    </div>
  );

  const tourSteps: TourStep[] = [
    {
      target: "#course-overview",
      title: "Course Overview",
      description:
        "Add courses and upload syllabi to extract key dates automatically.",
      position: "right",
    },
    {
      target: "#upcoming-deadlines",
      title: "Upcoming Deadlines",
      description: "Track assignment due dates and important deadlines.",
      position: "right",
    },
    // {
    //   target: "#grade-overview",
    //   title: "Grade Tracking",
    //   description: "Track your progress in each course.",
    //   position: "bottom",
    // },
    {
      target: "#study-sessions",
      title: "Study Sessions",
      description: "Plan and track study time for better organization.",
      position: "left",
    },
    {
      target: "#calendar-view",
      title: "Calendar",
      description: "See all deadlines at a glance.",
      position: "left",
    },
    {
      target: "#study-progress",
      title: "Study Progress",
      description: "Monitor your overall progress across all courses.",
      position: "left",
    },
  ];

  // Tour overlay component
  const TourOverlay = ({ onFinish }: TourOverlayProps) => {
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [highlightPosition, setHighlightPosition] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    useEffect(() => {
      updatePositions();
      window.addEventListener("resize", updatePositions);
      return () => window.removeEventListener("resize", updatePositions);
    }, [currentTourStep]);

    const updatePositions = () => {
      const targetElement = document.querySelector(
        tourSteps[currentTourStep].target
      );
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();

      // Update highlight position
      setHighlightPosition({
        x: rect.x - 8,
        y: rect.y - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });

      // Calculate tooltip position based on step position
      const position = tourSteps[currentTourStep].position;
      const padding = 20;
      let x = 0;
      let y = 0;

      switch (position) {
        case "right":
          x = rect.right + padding;
          y = rect.top;
          break;
        case "left":
          x = rect.left - padding - 320; // 320px is tooltip width
          y = rect.top;
          break;
        case "bottom":
          x = rect.left;
          y = rect.bottom + padding;
          break;
        case "top":
          x = rect.left;
          y = rect.top - padding - 200; // 200px is approximate tooltip height
          break;
      }

      setTooltipPosition({ x, y });
    };

    return (
      <AnimatePresence>
        {showTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          >
            {/* Highlight area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: highlightPosition.x,
                y: highlightPosition.y,
                width: highlightPosition.width,
                height: highlightPosition.height,
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="absolute bg-purple-500/20 border-2 border-purple-500 rounded-lg"
            />

            {/* Tour tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: tooltipPosition.x,
                y: tooltipPosition.y,
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="absolute bg-zinc-900 rounded-xl p-6 w-80 border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold tracking-tight">
                  {tourSteps[currentTourStep].title}
                </h3>
                <button
                  onClick={handleTourExit}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-zinc-400 mb-6 text-sm">
                {tourSteps[currentTourStep].description}
              </p>

              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={`step-${index}`}
                      className={`w-2 h-2 rounded-full ${
                        index === currentTourStep
                          ? "bg-purple-500"
                          : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-4">
                  {currentTourStep > 0 && (
                    <button
                      onClick={() => setCurrentTourStep((prev) => prev - 1)}
                      className="text-sm text-zinc-400 hover:text-white"
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (currentTourStep === tourSteps.length - 1) {
                        onFinish();
                      } else {
                        setCurrentTourStep((prev) => prev + 1);
                      }
                    }}
                    className="text-sm text-purple-400 hover:text-purple-300 tracking-tight"
                  >
                    {currentTourStep === tourSteps.length - 1
                      ? "Finish"
                      : "Next"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handler for Get Started click
  const handleGetStarted = () => {
    setHasData(true); // This will switch to the dashboard view
    // Start the tour after a brief delay to allow dashboard to render
    setTimeout(() => setShowTour(true), 500);
  };

  // When tour ends
  const handleTourEnd = () => {
    setShowTour(false);
    setTimeout(() => {
      setShowDemoData(false);
    }, 300);
  };

  const handleCourseSetup = () => {
    setShowOptions(false);
    setHasData(true);
  };

  const handleGradePlanning = () => {
    setShowOptions(false);
    setHasData(true);
  };

  // Update the options array to be navigation choices
  const setupOptions = [
    {
      title: "Course Dashboard",
      description: "View and manage your courses and deadlines",
      icon: <BookOpen className="w-6 h-6" />,
      action: "View Dashboard",
      onClick: handleCourseSetup,
    },
    {
      title: "Grade Planner",
      description: "Plan and track your grades across all courses",
      icon: <Target className="w-6 h-6" />,
      action: "View Grades",
      onClick: handleGradePlanning,
    },
  ];

  const EmptyState = ({
    title,
    description,
    icon,
    action,
    onClick,
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    action: string;
    onClick?: () => void;
  }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
      <div className="p-3 bg-white/5 rounded-xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-4 max-w-sm">{description}</p>
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
      >
        <Plus size={16} />
        {action}
      </button>
    </div>
  );

  const AddCourseModal = () => {
    const [courseName, setCourseName] = useState("");
    const [selectedColor, setSelectedColor] = useState(`hsl(${Math.random() * 360}, 70%, 50%)`);
    const [recentlyAdded, setRecentlyAdded] = useState<Course[]>([]);

    // Minimal, carefully chosen color palette
    const colors = COURSE_COLORS;

    // Add ref for the modal content
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside
    const handleBackdropClick = (e: React.MouseEvent) => {
      // Check if click was on the backdrop (not the modal content)
      if (e.target === e.currentTarget) {
        handleDone();
      }
    };

    const handleDone = () => {
      setIsAddCourseOpen(false);
      setRecentlyAdded([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!courseName.trim()) return;

      const newCourse = {
        name: courseName.trim(),
        color: selectedColor,
      };

      try {
        const response = await axios.post("/api/courses", newCourse);
        setCourses((prev) => [...prev, response.data]);
        setRecentlyAdded((prev) => [...prev, response.data]);
        setCourseName("");
        setSelectedColor(`hsl(${Math.random() * 360}, 70%, 50%)`);
      } catch (error) {
        console.error("Failed to create course:", error);
        // Add user feedback for error
        alert("Failed to create course. Please try again.");
      }
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-zinc-900 rounded-xl w-full max-w-md border border-black overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="relative h-20 bg-zinc-900">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 border-b border-white/40" />
            <div className="absolute top-4 left-6 ">
              <h2 className="text-xl font-semibold tracking-tight">Add New Course</h2>
              <p className="text-sm text-zinc-400 ">
                Create a new course to track
              </p>
            </div>
            <button
              onClick={() => setIsAddCourseOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-4">
            {/* Course name input */}
            <div className="space-y-2 mb-6">
              <label className="text-sm text-zinc-400 tracking-tight">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Accounting"
                className="w-full bg-zinc-800/50 rounded-lg px-4 py-2.5 
                  focus:outline-none focus:ring-0
                  border border-white/5 placeholder:text-zinc-600 text-sm"
              />
            </div>

            {/* Minimalistic color selection */}
            <div className="space-y-2 mb-8">
              <label className="text-sm text-zinc-400">Color</label>
              <div className="flex items-center gap-4">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="group relative"
                  >
                    <div 
                      className={`w-3 h-3 rounded-full transition-transform duration-200
                        ${selectedColor === color ? 'scale-150 ring-2 ring-white/20' : 'hover:scale-125'}`}
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-white/5">
              <p className="text-sm text-zinc-400 mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-sm">{courseName || "Course Name"}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleDone}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {recentlyAdded.length === 0
                  ? "Cancel"
                  : `Done (${recentlyAdded.length} added)`}
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!courseName.trim()}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors
                    ${
                      courseName.trim()
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-zinc-700 cursor-not-allowed text-zinc-400"
                    }`}
                >
                  Add Course
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CourseOverview = () => {
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Add useEffect for handling outside clicks
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setMenuOpen(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Demo data for the tutorial
    const demoData: Course[] = [
      { id: "1", name: "Calculus II", color: "hsl(270, 70%, 50%)" },
      { id: "2", name: "CS 101", color: "hsl(200, 70%, 50%)" },
      { id: "3", name: "Physics", color: "hsl(350, 70%, 50%)" },
    ];

    // Use demo data if showDemoData is true, otherwise use actual courses
    const displayedCourses = showDemoData ? demoData : courses;

    const deleteCourse = async (courseId: string) => {
      try {
        // First, delete the course
        const response = await axios.delete(`/api/courses/${courseId}`);

        if (response.status === 200) {
          // Update courses state
          setCourses((prev) => prev.filter((course) => course.id !== courseId));

          // Also filter out all assignments associated with this course
          setAssignments((prev) =>
            prev.filter((assignment) => assignment.courseId !== courseId)
          );

          toast.success(
            "Course and associated assignments deleted successfully!",
            {
              style: {
                background: "#18181b",
                boxShadow: "none",
                fontSize: "14px",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
              },
            }
          );
        }
      } catch (error) {
        console.error("Delete course error:", error);
        toast.error("Failed to delete course");
      }
    };

    const handleDeleteCourse = async (courseId: string) => {
      toast(
        (t) => (
          <div className="flex flex-col items-center gap-2 bg-zinc-900 rounded-xl p-4 border border-white/10">
            <span className="text-white text-sm">Are you sure?</span>
            <span className="text-muted-foreground text-xs text-center items-center mb-3">
              The associated assignments will be deleted!
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  deleteCourse(courseId);
                }}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-md transition-colors text-white"
              >
                Delete
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          style: {
            background: "transparent",
            boxShadow: "none",
          },
        }
      );
    };

    const handleEditSave = async (
      id: string,
      newName: string,
      newColor: string
    ) => {
      console.log("Attempting to edit course:", { id, newName, newColor });
      if (!showDemoData) {
        try {
          console.log("Sending edit request for course:", id);
          const response = await axios.patch(`/api/courses/${id}`, {
            name: newName,
            color: newColor,
          });
          console.log("Edit response:", response);

          setCourses((prev) =>
            prev.map((course) => (course.id === id ? response.data : course))
          );
          toast.success("Course updated successfully!", {
            style: {
              background: "#18181b",
              boxShadow: "none",
              fontSize: "14px",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          });
        } catch (error) {
          console.error("Edit course error details:", error);
          if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
            const errorMessage =
              error.response?.data?.error || "Failed to update course";
            toast.error(errorMessage);
          } else {
            toast.error("Failed to update course");
          }
        }
      }
      setEditingCourse(null);
    };

    return (
      <div
        id="course-overview"
        className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 h-[45%] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 flex-shrink-0">
          <h2 className="text-lg font-semibold tracking-tight">My Courses</h2>

          <button
            onClick={() => setIsAddCourseOpen(true)}
            className="p-1 hover:bg-white/10 rounded flex items-center gap-2"
          >
            <span className="text-sm text-purple-400">{courses.length}</span>
            <Plus size={16} />
          </button>
        </div>

        {/* Add scrollable content wrapper */}
        <div className="overflow-y-auto flex-1 scrollbar-hide hover:scrollbar-default">
          {displayedCourses.length > 0 ? (
            <div className="space-y-3">
              {displayedCourses.map((course, index) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      <span className="text-lg tracking-tight">{course.name}</span>
                    </div>

                    {!showDemoData && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Pencil
                            size={14}
                            className="text-zinc-400 hover:text-white"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Trash2
                            size={14}
                            className="text-red-400 hover:text-red-300"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  {index < displayedCourses.length - 1 && (
                    <div className="h-px bg-white/5 mx-2 my-1" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No courses yet"
              description="Add your first course to get started tracking your academic progress"
              icon={<BookOpen className="w-6 h-6" />}
              action="Add Course"
              onClick={() => setIsAddCourseOpen(true)}
            />
          )}
        </div>

        {/* Edit Course Modal */}
        {editingCourse && !showDemoData && (
          <div className="flex gap-4">
            <div className="w-1/2">
              <EditCourseModal
                course={editingCourse}
                onClose={() => setEditingCourse(null)}
                onSave={handleEditSave}
              />
            </div>
            {pdfUrl && (
              <div className="w-1/2 h-[600px]">
                <PDFViewer pdfUrl={pdfUrl} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Add this new component
  const EditCourseModal = ({
    course,
    onClose,
    onSave,
  }: EditCourseModalProps) => {
    const [courseName, setCourseName] = useState(course.name);
    const [selectedColor, setSelectedColor] = useState(
      course.color || "hsl(270, 70%, 50%)"
    );
    const modalRef = useRef<HTMLDivElement>(null);

    const colors = COURSE_COLORS;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!courseName.trim()) return;
      onSave(course.id, courseName.trim(), selectedColor);
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-zinc-900 rounded-xl w-full max-w-md border border-white/10 overflow-hidden"
        >
          <div className="relative h-20 bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
            <div className="absolute top-4 left-6">
              <h2 className="text-xl font-semibold tracking-tight">Edit Course</h2>
              <p className="text-sm text-zinc-400">Update course details</p>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-4">
            <div className="space-y-2 mb-6">
              <label className="text-sm text-zinc-400 tracking-tight">Course Name</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full bg-zinc-800/50 rounded-lg px-4 py-2.5 
                  focus:outline-none focus:ring-0
                  border border-white/5"
              />
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-sm text-zinc-400">Color</label>
              <div className="flex items-center gap-4">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="group relative"
                  >
                    <div 
                      className={`w-3 h-3 rounded-full transition-transform duration-200
                        ${selectedColor === color ? 'scale-150 ring-2 ring-white/20' : 'hover:scale-125'}`}
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!courseName.trim()}
                className={`px-4 py-2 text-sm rounded-lg transition-colors
                  ${
                    courseName.trim()
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "bg-zinc-700 cursor-not-allowed text-zinc-400"
                  }`}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // First, modify the AddAssignmentModal props to accept a prefilled date
  const AddAssignmentModal = ({ prefilledDate }: { prefilledDate?: string }) => {
    const [importMethod, setImportMethod] = useState<"manual" | "paste" | "upload">("manual");
    const [bulkText, setBulkText] = useState("");
    const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState(prefilledDate || ""); // Use prefilled date if provided
    const [type, setType] = useState<"Assignment" | "Exam" | "Quiz" | "Other">("Assignment");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add these state variables
    const [parsedAssignments, setParsedAssignments] = useState<ParsedAssignment[]>([]);
    const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add ref for the modal content
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle clicking outside
    const handleBackdropClick = (e: React.MouseEvent) => {
      // Check if click was on the backdrop (not the modal content)
      if (e.target === e.currentTarget) {
        setIsAddAssignmentOpen(false);
      }
    };

    const handleBulkImport = async () => {
      if (!bulkText.trim()) return;

      try {
        const assignments = bulkText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => {
            const [title, dueDate, type = "Assignment"] = line
              .split(",")
              .map((s) => s.trim());
            return {
              title,
              dueDate,
              type: type as "Assignment" | "Exam" | "Quiz" | "Other",
            };
          });

        if (assignments.length === 0) {
          toast.error("No valid assignments found");
          return;
        }

        const newAssignments = await Promise.all(
          assignments.map(async (assignment) => {
            const response = await axios.post("/api/assignments", {
              courseId: selectedCourse,
              ...assignment,
            });
            return response.data;
          })
        );

        setAssignments((prev) => [...prev, ...newAssignments]);

        toast.success(`${assignments.length} assignments added successfully!`, {
          style: {
            background: "#18181b",
            boxShadow: "none",
            fontSize: "14px",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        });
        setIsAddAssignmentOpen(false);
      } catch (error) {
        console.error("Failed to import assignments:", error);
        toast.error("Failed to import assignments");
      }
    };

    const handleFileUpload = async (file: File) => {
      if (!selectedCourse) {
        toast.error('Please select a course first');
        return;
      }

      setIsProcessing(true);

      try {
        // Validate file type and size
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          toast.error('Please upload a PDF file');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error('File size must be less than 10MB');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', selectedCourse);

        const response = await axios.post('/api/syllabus/parse', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.assignments && response.data.assignments.length > 0) {
          setParsedAssignments(response.data.assignments);
          setSelectedAssignments(new Set(response.data.assignments.map((_: ParsedAssignment, i: number) => i)));
          
          // Set the PDF URL from the response
          if (response.data.fileUrl) {
            setPdfUrl(response.data.fileUrl);
          }

          toast.success(`Found ${response.data.total} assignments!`, {
            style: {
              background: "#18181b",
              boxShadow: "none",
              fontSize: "14px",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          });
        } else {
          toast.error('No assignments found in the syllabus');
        }

      } catch (error) {
        console.error('Error uploading file:', error);
        
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.error || 'Failed to process syllabus';
          toast.error(errorMessage);
        } else {
          toast.error('Failed to process syllabus');
        }
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("File input change triggered"); // Debug log
      const file = e.target.files?.[0];
      if (!file) {
        console.log("No file selected"); // Debug log
        return;
      }

      console.log("File selected:", file.name, file.type); // Debug log
      handleFileUpload(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const assignmentData = {
        courseId: selectedCourse,
        title,
        dueDate,
        type,
      };

      console.log("Submitting assignment data:", assignmentData);

      try {
        const response = await axios.post("/api/assignments", assignmentData);
        console.log("Assignment response:", response.data);

        setAssignments((prev) => [...prev, response.data]);

        toast.success("Assignment added successfully!", {
          style: {
            background: "#18181b",
            boxShadow: "none",
            fontSize: "14px",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        });

        setIsAddAssignmentOpen(false);
      } catch (error) {
        console.error("Failed to add assignment:", error);
        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data || "Failed to add assignment";
          console.error("Error details:", error.response?.data);
          toast.error(errorMessage);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // Add this helper function
    const toggleAssignment = (index: number) => {
      const newSelected = new Set(selectedAssignments);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedAssignments(newSelected);
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}  // Add click handler here
      >
        <div 
          ref={modalRef}
          className="bg-zinc-900 rounded-xl w-full max-w-md border border-white/10"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Assignments</h2>
              <button
                onClick={() => setIsAddAssignmentOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Course Selection */}
            <div className="mb-6">
              <label className="text-sm text-zinc-400">Course</label>
              <div className="relative mt-1">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-zinc-800/50 rounded-lg px-4 py-3
                    appearance-none text-base
                    border border-white/5 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                >
                  <option value="" className="text-zinc-400">Select a course</option>
                  {courses.map((course) => (
                    <option 
                      key={course.id} 
                      value={course.id}
                      className="py-2"
                    >
                      {course.name}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-zinc-400"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Import Method Tabs */}
            <div className="flex gap-4 mb-6">
              {[
                { id: "manual", label: "Manual Entry", icon: Pencil },
                // { id: "upload", label: "Upload Syllabus", icon: BookOpen },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() =>
                    setImportMethod(id as "manual" | "paste" | "upload")
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                    ${
                      importMethod === id
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
                        : "hover:bg-white/5"
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Import Method Content */}
            {importMethod === "manual" && (
              // Existing manual entry form
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 ">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-800/50 rounded-lg px-4 py-3
                        appearance-none text-base
                        border border-white/5 cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-800/50 rounded-lg px-4 py-3
                        appearance-none text-base
                        border border-white/5 cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-purple-500/20 [color-scheme:dark]"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="text-sm text-zinc-400">Type</label>
                  <div className="relative mt-1">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "Assignment" | "Exam" | "Quiz" | "Other")}
                      className="w-full bg-zinc-800/50 rounded-lg px-4 py-3
                        appearance-none text-base
                        border border-white/5 cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="Assignment">Assignment</option>
                      <option value="Exam">Exam</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Other">Other</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-zinc-400"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddAssignmentOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-sm bg-purple-500 rounded-lg ${
                      isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-purple-600"
                    }`}
                  >
                    {isSubmitting ? "Adding..." : "Add Assignment"}
                  </button>
                </div>
              </form>
            )}

            {importMethod === "upload" && (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-white/10 rounded-lg p-8
                  text-center hover:border-purple-500/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="syllabus-upload"
                  />
                  <label
                    htmlFor="syllabus-upload"
                    className="cursor-pointer space-y-2 block" // Added block display
                  >
                    <Upload className="w-8 h-8 mx-auto text-zinc-400" />
                    <p className="text-sm text-zinc-400">
                      Drop your syllabus here or click to upload
                    </p>
                    <p className="text-xs text-zinc-500">
                      Supports PDF, Word documents
                    </p>
                  </label>
                </div>

                {/* Show processing state */}
                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                    <p className="text-zinc-400 text-sm">Processing syllabus...</p>
                  </div>
                )}

                {/* Show parsed assignments if available */}
                {!isProcessing && parsedAssignments.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-zinc-400">
                        Select assignments to import
                      </p>
                      <button
                        onClick={() => {
                          if (selectedAssignments.size === parsedAssignments.length) {
                            setSelectedAssignments(new Set());
                          } else {
                            setSelectedAssignments(new Set(parsedAssignments.map((_: ParsedAssignment, i: number) => i)));
                          }
                        }}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        {selectedAssignments.size === parsedAssignments.length ? 
                          "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {parsedAssignments.map((assignment, index) => (
                        <div
                          key={index}
                          onClick={() => toggleAssignment(index)}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer
                            ${
                              selectedAssignments.has(index)
                                ? "bg-purple-500/20 border-purple-500/40"
                                : "bg-zinc-800/50 border-white/5 hover:bg-zinc-800"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{assignment.title}</span>
                                <span className="text-xs text-zinc-400">
                                  {new Date(assignment.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-purple-400">{assignment.type}</span>
                                {assignment.weight && (
                                  <span className="text-xs text-zinc-500">
                                    {assignment.weight} points
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-sm text-zinc-400">
                        {selectedAssignments.size} of {parsedAssignments.length} selected
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setParsedAssignments([]);
                            setSelectedAssignments(new Set());
                            setImportMethod("manual");
                          }}
                          className="px-4 py-2 text-sm text-zinc-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            if (selectedAssignments.size === 0) {
                              toast.error("Please select at least one assignment");
                              return;
                            }

                            try {
                              const selectedItems = Array.from(selectedAssignments).map(
                                index => parsedAssignments[index]
                              );

                              await Promise.all(
                                selectedItems.map(assignment =>
                                  axios.post("/api/assignments", {
                                    ...assignment,
                                    courseId: selectedCourse,
                                  })
                                )
                              );
                              
                              toast.success(`Added ${selectedItems.length} assignments!`);
                              setIsAddAssignmentOpen(false);
                            } catch (error) {
                              console.error("Failed to import assignments:", error);
                              toast.error("Failed to import assignments");
                            }
                          }}
                          disabled={selectedAssignments.size === 0}
                          className={`px-4 py-2 text-sm rounded-lg
                            ${
                              selectedAssignments.size > 0
                                ? "bg-purple-500 hover:bg-purple-600"
                                : "bg-zinc-700 cursor-not-allowed text-zinc-400"
                            }`}
                        >
                          Import Selected
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EditAssignmentModal = ({
    assignment,
    onClose,
    onSave,
  }: EditAssignmentModalProps) => {
    const [title, setTitle] = useState(assignment.title);
    const [dueDate, setDueDate] = useState(assignment.dueDate);
    const [type, setType] = useState(assignment.type);
    const [courseId, setCourseId] = useState(assignment.courseId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const updates = {
        title,
        dueDate,
        type,
        courseId,
      };

      await onSave(assignment.id, updates);
      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 rounded-xl w-full max-w-md border border-white/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Assignment</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Selection Dropdown */}
              <div>
                <label className="text-sm text-zinc-400">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full bg-zinc-800/50 rounded-lg px-4 py-2.5 mt-1
                    border border-white/5"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-800/50 rounded-lg px-4 py-2.5 mt-1
                    border border-white/5"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-zinc-800/50 rounded-lg px-4 py-2.5 mt-1
                    border border-white/5 text-white
                    focus:outline-none focus:ring-0
                    [color-scheme:dark]"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Type</label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "Assignment" | "Exam" | "Quiz" | "Other")
                  }
                  className="w-full bg-zinc-800/50 rounded-lg px-4 py-2.5 mt-1
                    border border-white/5"
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Exam">Exam</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !courseId}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors
                    ${
                      courseId && !isSubmitting
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "bg-zinc-700 cursor-not-allowed text-zinc-400"
                    }`}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const UpcomingDeadlines = () => {
    const [editingAssignment, setEditingAssignment] =
      useState<Assignment | null>(null);

    const handleDeleteAssignment = async (assignmentId: string) => {
      toast(
        (t) => (
          <div className="flex flex-col items-center gap-2 bg-zinc-900 rounded-xl p-4 border border-white/10">
            <span className="text-white text-sm">Delete this assignment?</span>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`/api/assignments/${assignmentId}`);
                    setAssignments((prev) =>
                      prev.filter((a) => a.id !== assignmentId)
                    );
                    toast.success("Assignment deleted", {
                      style: {
                        background: "#18181b",
                        boxShadow: "none",
                        fontSize: "14px",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.1)",
                        textAlign: "center",
                      },
                    });
                  } catch (error) {
                    console.error("Failed to delete assignment:", error);
                    toast.error("Failed to delete assignment");
                  }
                  toast.dismiss(t.id);
                }}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-md transition-colors text-white"
              >
                Delete
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ),
        {
          style: {
            background: "transparent",
            boxShadow: "none",
          },
        }
      );
    };

    const handleEditSave = async (id: string, updates: Partial<Assignment>) => {
      try {
        const response = await axios.patch(`/api/assignments/${id}`, updates);
        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.id === id ? response.data : assignment
          )
        );
        toast.success("Assignment updated successfully!", {
          style: {
            background: "#18181b",
            boxShadow: "none",
            fontSize: "14px",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          },
        });
        setEditingAssignment(null);
      } catch (error) {
        console.error("Failed to update assignment:", error);
        toast.error("Failed to update assignment");
      }
    };

    const sortedAssignments = assignments.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    const getRelativeDays = (date: string) => {
      // Get current date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get due date at midnight
      const dueDate = new Date(date + "T00:00:00"); // Add time component to ensure consistent parsing

      // Calculate difference in days
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays < 0) return "Overdue";
      return `${diffDays}d`;
    };

    return (
      <div
        id="upcoming-deadlines"
        className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 h-[calc(55%-1.5rem)] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 flex-shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Upcoming Deadlines
            <span className="text-sm text-purple-400"></span>
          </h2>
          <button
            onClick={() => setIsAddAssignmentOpen(true)}
            className="p-1 hover:bg-white/10 rounded flex items-center gap-2"
          >
            <p className="text-zinc-400 text-sm">
              <span className="font-semibold text-purple-400">
                {assignments.length}
              </span>
            </p>
            <Plus size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide hover:scrollbar-default">
          {showDemoData ? (
            <div className="space-y-3">
              {[
                { course: "CS101", task: "Project Milestone 1", due: "2d" },
                { course: "MATH201", task: "Assignment 3", due: "4d" },
              ].map((item) => (
                <div
                  key={item.task}
                  className="p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-400">{item.course}</span>
                    <span className="text-zinc-400">{item.due}</span>
                  </div>
                  <p className="text-sm mt-1">{item.task}</p>
                </div>
              ))}
            </div>
          ) : assignments.length > 0 ? (
            <div className="space-y-3">
              {sortedAssignments.map((assignment, index) => {
                const course = courses.find((c) => c.id === assignment.courseId);
                return (
                  <div key={assignment.id}>
                    <div className="p-2 hover:bg-white/5 rounded-lg group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 text-sm truncate">
                              {course?.name || "Unknown Course"}
                            </span>
                            <span className="text-xs text-zinc-400 shrink-0">
                              {getRelativeDays(assignment.dueDate)}
                            </span>
                          </div>
                          <p className="text-sm mt-1 truncate">{assignment.title}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingAssignment(assignment)}
                            className="p-1 hover:bg-white/10 rounded-lg"
                          >
                            <Pencil size={14} className="text-zinc-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="p-1 hover:bg-white/10 rounded-lg"
                          >
                            <Trash2 size={14} className="text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {index < sortedAssignments.length - 1 && (
                      <div className="h-px bg-white/5 mx-2 my-1" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No deadlines yet"
              description="Add your important dates and assignments"
              icon={<Calendar className="w-6 h-6" />}
              action="Add Assignment"
              onClick={() => setIsAddAssignmentOpen(true)}
            />
          )}
        </div>

        {editingAssignment && (
          <EditAssignmentModal
            assignment={editingAssignment}
            onClose={() => setEditingAssignment(null)}
            onSave={handleEditSave}
          />
        )}
      </div>
    );
  };

  const DayDetailsModal = ({
    date,
    onClose,
  }: {
    date: string;
    onClose: () => void;
  }) => {
    // Add timezone offset to handle date correctly
    const adjustedDate = new Date(date);
    adjustedDate.setMinutes(
      adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset()
    );
    const formattedDate = adjustedDate.toISOString().split("T")[0];

    const dayAssignments = assignments.filter(
      (assignment) => assignment.dueDate === formattedDate
    );

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-zinc-900 rounded-xl w-full max-w-md border border-white/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {adjustedDate.toLocaleDateString("default", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {dayAssignments.length > 0 ? (
              <div className="space-y-4">
                {dayAssignments.map((assignment) => {
                  const course = courses.find(
                    (c) => c.id === assignment.courseId
                  );
                  return (
                    <div
                      key={assignment.id}
                      className="p-4 bg-zinc-800/50 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 text-sm">
                          {course?.name || "Unknown Course"}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {assignment.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{assignment.title}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-zinc-400 text-sm">
                  No assignments due on this date.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add loading screen component
  const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center bg-zinc-950">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm">Assembling your workspace...</p>
      </div>
    </div>
  );

  // Show loading screen while data is being fetched
  if ((isLoadingCourses || isLoadingAssignments) && !showDemoData) {
    return <LoadingScreen />;
  }

  // Return the main dashboard if user has data
  return (
    <div className="h-screen overflow-auto bg-zinc-950 text-white">
      <Toaster />
      <div className="p-6">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-sans">
              {user?.username || user?.firstName
                ? `${user.username || user.firstName}'s Dashboard`
                : "Dashboard"}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-zinc-400 text-sm tracking-tight font-sans">
                <span className="font-semibold text-purple-400">
                  {courses.length}
                </span>{" "}
                {courses.length === 1 ? "Course" : "Courses"}
              </p>
              <p className="text-zinc-400 text-sm tracking-tight font-sans">
                <span className="font-semibold text-purple-400">
                  {assignments.length}
                </span>{" "}
                {assignments.length === 1 ? "Deadline" : "Deadlines"}
              </p>
            </div>
          </div>

          {/* Add QuickActions here, between stats and user button */}
          <div className="flex items-center gap-4">
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

        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
          {/* Left Column - Course Overview & Upcoming */}
          <div className="col-span-3 space-y-4 h-full overflow-hidden">
            <CourseOverview />

            {/* Upcoming Deadlines */}
            <UpcomingDeadlines />
          </div>

          {/* Center Column - Main Content */}
          <div className="col-span-6 space-y-4 h-full overflow-hidden">
            {/* Study Sessions - Mini Kanban */}
            <div
              id="study-sessions"
              className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 h-[45%] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  Active Tasks
                  <span className="text-sm text-purple-400">
                    {taskCounts.todo +
                      taskCounts.inProgress +
                      taskCounts.completed}
                  </span>
                </h2>
              </div>
              <MiniKanban onTaskCountsChange={setTaskCounts} />
            </div>

            {/* Quick Notes */}
            <QuickNotes />
          </div>

          {/* Right Column - Calendar & Progress */}
          <div className="col-span-3 space-y-4 h-full overflow-hidden">
            {/* Calendar */}
            <div
              id="calendar-view"
              className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 h-[45%] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-2 flex-shrink-0 border-b border-white/10 pb-2">
                <h2 className="text-lg font-semibold tracking-tight">Calendar</h2>
                <span className="text-sm tracking-tight text-zinc-400">
                  {new Date().toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              
              {/* Calendar grid container */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={`header-${day}`} className="text-zinc-400 py-1">
                      {day[0]}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="flex-1 grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({
                    length: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1
                    ).getDay(),
                  }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-1" />
                  ))}
                  {Array.from({
                    length: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth() + 1,
                      0
                    ).getDate(),
                  }).map((_, i) => {
                    const dayNumber = i + 1;
                    const currentDate = new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      dayNumber
                    )
                      .toISOString()
                      .split("T")[0];
                    const isToday = dayNumber === new Date().getDate();
                    const dayAssignments = assignments.filter(
                      (assignment) => assignment.dueDate === currentDate
                    );

                    return (
                      <Tooltip.Provider key={`day-${i}`}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div
                              onClick={() => setSelectedDate(currentDate)}
                              className={`p-1 flex flex-col items-center justify-center rounded relative
                                ${isToday ? "bg-purple-500/20 text-purple-400 font-semibold" : "hover:bg-white/5"}
                                ${dayAssignments.length > 0 ? "cursor-pointer" : ""}
                              `}
                            >
                              {dayNumber}
                              {dayAssignments.length > 0 && (
                                <div
                                  className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                                  style={
                                    dayAssignments.length === 1
                                      ? {
                                          backgroundColor: courses.find(
                                            (c) => c.id === dayAssignments[0].courseId
                                          )?.color,
                                        }
                                      : { backgroundColor: "rgb(239, 68, 68)" }
                                  }
                                />
                              )}
                            </div>
                          </Tooltip.Trigger>
                          {dayAssignments.length > 0 && (
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-zinc-900 px-3 py-2 rounded-lg border border-white/10 shadow-lg"
                                sideOffset={5}
                              >
                                <div className="text-xs">
                                  <p className="text-zinc-400 mb-1">
                                    {dayAssignments.length}{" "}
                                    {dayAssignments.length === 1
                                      ? "assignment"
                                      : "assignments"}
                                  </p>
                                  {dayAssignments.map((assignment, index) => {
                                    const course = courses.find(
                                      (c) => c.id === assignment.courseId
                                    );
                                    return (
                                      <div
                                        key={assignment.id}
                                        className="flex items-center gap-2"
                                      >
                                        <div
                                          className="w-1.5 h-1.5 rounded-full"
                                          style={{
                                            backgroundColor: course?.color,
                                          }}
                                        />
                                        <span className="text-white">
                                          {course?.name}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <Tooltip.Arrow className="fill-zinc-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          )}
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Study Progress */}
            <div
              id="study-progress"
              className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 h-[calc(55%-1.5rem)] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 flex-shrink-0">
                <h2 className="text-lg font-semibold tracking-tight flex-shrink-0">
                  Focus Session
                </h2>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <PomodoroTimer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddCourseOpen && <AddCourseModal />}
      {showTour && <TourOverlay onFinish={handleTourEnd} />}
      {isAddAssignmentOpen && <AddAssignmentModal prefilledDate={selectedDate || undefined} />}
      {selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

// Helper functions for positioning
function getTargetPosition(selector: string) {
  const element = document.querySelector(selector);
  if (!element) return {};
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width + 16,
    height: rect.height + 16,
    x: rect.x - 8,
    y: rect.y - 8,
  };
}

function getTooltipPosition(step: TourStep) {
  const element = document.querySelector(step.target);
  if (!element) return {};
  const rect = element.getBoundingClientRect();

  switch (step.position) {
    case "right":
      return { left: rect.right + 20, top: rect.top };
    case "left":
      return { right: window.innerWidth - rect.left + 20, top: rect.top };
    case "bottom":
      return { left: rect.left, top: rect.bottom + 20 };
    case "top":
      return { left: rect.left, bottom: window.innerHeight - rect.top + 20 };
  }
}

// Add this new component
const QuickNotes = () => {
  const [newNote, setNewNote] = useState<string>("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveTimeout = useRef<NodeJS.Timeout | undefined>();

  // Add this new useEffect to load the saved note on mount
  useEffect(() => {
    const loadSavedNote = async () => {
      try {
        const response = await axios.get("/api/quickNotes");
        setNewNote(response.data.content || "");
      } catch (error) {
        console.error("Failed to load quick note:", error);
      }
    };

    loadSavedNote();
  }, []);

  // Existing auto-save effect
  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    setAutoSaveStatus("saving");
    saveTimeout.current = setTimeout(async () => {
      try {
        await axios.put("/api/quickNotes", { content: newNote });
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save quick note:", error);
        setAutoSaveStatus("error");
      }
    }, 500);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [newNote]);

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/10 h-[calc(55%-1.5rem)] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 flex-shrink-0">
        <h2 className="text-lg font-semibold tracking-tight">Quick Notes</h2>
        {/* Replace the old status indicator with the new one */}
        <div className="text-xs">
          {autoSaveStatus === "saving" && (
            <div className="flex items-center gap-1.5 text-yellow-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              Saving...
            </div>
          )}
          {autoSaveStatus === "saved" && (
            <div className="flex items-center gap-1.5 text-green-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Saved
            </div>
          )}
          {autoSaveStatus === "error" && (
            <div className="flex items-center gap-1.5 text-red-500/80">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Error saving
            </div>
          )}
        </div>
      </div>

      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Type your notes here..."
        className="flex-1 w-full bg-transparent resize-none text-sm 
          placeholder:text-zinc-600 focus:outline-none"
      />
    </div>
  );
};

export default TasksPage;