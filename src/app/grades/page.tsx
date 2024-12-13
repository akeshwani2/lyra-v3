"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Target, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Course } from "@prisma/client";

interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  courseId: string;
}

interface Assignment {
  id: string;
  categoryId: string;
  name: string;
  score: number;
  totalPoints: number;
  dueDate: Date;
  completed: boolean;
}

const CourseGradeCard = ({
  course,
  categories,
  assignments
}: {
  course: Course;
  categories: GradeCategory[];
  assignments: Assignment[];
}) => {
  const calculateGrade = () => {
    let totalWeight = 0;
    let weightedGrade = 0;

    categories.forEach(category => {
      const categoryAssignments = assignments.filter(a => 
        a.categoryId === category.id && a.completed
      );

      if (categoryAssignments.length > 0) {
        const categoryScore = categoryAssignments.reduce((acc, curr) => 
          acc + (curr.score / curr.totalPoints), 0) / categoryAssignments.length;
        weightedGrade += categoryScore * (category.weight / 100);
        totalWeight += category.weight;
      }
    });

    return totalWeight > 0 ? (weightedGrade / totalWeight) * 100 : 0;
  };

  const calculateTrend = () => {
    const recentAssignments = assignments
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
      .slice(0, 2);

    if (recentAssignments.length >= 2) {
      const trend = ((recentAssignments[0].score / recentAssignments[0].totalPoints) -
                    (recentAssignments[1].score / recentAssignments[1].totalPoints)) * 100;
      return trend;
    }
    return null;
  };

  const grade = calculateGrade();
  const trend = calculateTrend();

  return (
    <div className="bg-zinc-800/50 p-4 rounded-lg border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: course.color }}
        />
        <h3 className="font-medium">{course.name}</h3>
      </div>
      
      <div className="flex justify-between items-end">
        <span className="text-2xl font-bold">
          {grade.toFixed(1)}%
        </span>
        {trend !== null && (
          <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        )}
      </div>

      {categories.length > 0 && (
        <div className="mt-4 space-y-2">
          {categories.map(category => {
            const categoryAssignments = assignments.filter(a => a.categoryId === category.id);
            const completedAssignments = categoryAssignments.filter(a => a.completed);
            return (
              <div key={category.id} className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">{category.name}</span>
                <span className="text-sm text-zinc-400">
                  {completedAssignments.length} / {categoryAssignments.length}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const GradesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<GradeCategory[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddingGrade, setIsAddingGrade] = useState(false);

  useEffect(() => {
    // Load courses and grade data
    const loadData = async () => {
      try {
        const [coursesRes, categoriesRes, assignmentsRes] = await Promise.all([
          axios.get("/api/courses"),
          axios.get("/api/categories"),
          axios.get("/api/assignments")
        ]);
        
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data);
        setAssignments(assignmentsRes.data);
      } catch (error) {
        console.error("Failed to load grade data:", error);
        toast.error("Failed to load grade data");
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Grade Planning</h1>
            <p className="text-zinc-400 text-sm">Track your academic progress</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Grade Overview Section */}
          <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Course Grades</h2>
              <button
                onClick={() => setIsAddingGrade(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add Grade
              </button>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <CourseGradeCard 
                    key={course.id}
                    course={course}
                    categories={categories.filter(c => c.courseId === course.id)}
                    assignments={assignments.filter(a => 
                      categories
                        .filter(c => c.courseId === course.id)
                        .map(c => c.id)
                        .includes(a.categoryId)
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-zinc-400 mb-6">Add your first course to start tracking grades</p>
                <button
                  onClick={() => router.push('/')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Set up courses
                </button>
              </div>
            )}
          </div>

          {/* Grade Categories Section */}
          {/* Grade Goals Section */}
          {/* Grade History Section */}
        </div>
      </div>

      {/* Add Grade Modal */}
      {isAddingGrade && (
        <AddGradeModal
          courses={courses}
          categories={categories}
          onClose={() => setIsAddingGrade(false)}
          onAdd={async (assignment: {
            categoryId: string;
            name: string;
            score: number;
            totalPoints: number;
            dueDate: Date;
            completed: boolean;
          }) => {
            try {
              const response = await axios.post('/api/assignments', assignment);
              setAssignments(prev => [...prev, response.data]);
              toast.success('Grade added successfully');
              setIsAddingGrade(false);
            } catch (error) {
              console.error('Failed to add grade:', error);
              toast.error('Failed to add grade');
            }
          }}
        />
      )}
    </div>
  );
};

const AddGradeModal = ({
  courses,
  categories,
  onClose,
  onAdd
}: {
  courses: Course[];
  categories: GradeCategory[];
  onClose: () => void;
  onAdd: (assignment: {
    categoryId: string;
    name: string;
    score: number;
    totalPoints: number;
    dueDate: Date;
    completed: boolean;
  }) => Promise<void>;
}) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [totalPoints, setTotalPoints] = useState('100');
  const [dueDate, setDueDate] = useState(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      categoryId: selectedCategory,
      name,
      score: Number(score),
      totalPoints: Number(totalPoints),
      dueDate,
      completed: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Grade</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Select */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedCategory('');
              }}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
              required
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
              required
            >
              <option value="">Select Category</option>
              {categories
                .filter(cat => cat.courseId === selectedCourse)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Assignment Name */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Assignment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
              required
            />
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Score</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Total Points</label>
              <input
                type="number"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
                required
                min="0"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate.toISOString().split('T')[0]}
              onChange={(e) => setDueDate(new Date(e.target.value))}
              className="w-full bg-zinc-800 rounded-lg px-3 py-2 border border-white/10"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-purple-500 hover:bg-purple-600 rounded-lg"
            >
              Add Grade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradesPage;