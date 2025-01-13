import { useState, useEffect } from "react";
import { X, Clock, MapPin, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast, Toaster } from "sonner";

interface ClassSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
  days: { name: string }[];
  userId: string;
}

const ClassScheduler = () => {
  const { user } = useUser();
  
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);

  // Load classes on component mount
  useEffect(() => {
    const loadClasses = async () => {
      if (user) {
        try {
          const response = await axios.get('/api/classes');
          setClasses(response.data);
        } catch (error) {
          console.error('Failed to load classes:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadClasses();
  }, [user]);

  const navigateDay = (direction: 'prev' | 'next') => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentIndex = days.indexOf(selectedDay);
    if (direction === 'prev') {
      const newIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
      setSelectedDay(days[newIndex]);
    } else {
      const newIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
      setSelectedDay(days[newIndex]);
    }
  };

  const todaysClasses = classes.filter(cls => 
    cls.days.some(day => day.name === selectedDay)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddClass = async (newClass: Omit<ClassSchedule, 'id' | 'userId' | 'days'> & { days: string[] }) => {
    try {
      const response = await axios.post('/api/classes', newClass);
      setClasses(prev => [...prev, response.data]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add class:', error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await axios.delete(`/api/classes?id=${id}`);
      setClasses(prev => prev.filter(cls => cls.id !== id));
      toast.success("Class deleted successfully");
    } catch (error) {
      toast.error("Failed to delete class");
      console.error('Failed to delete class:', error);
    }
  };

  const handleEditClass = (classToEdit: ClassSchedule) => {
    setEditingClass(classToEdit);
  };

  const handleUpdateClass = async (
    id: string, 
    updates: {
      name: string;
      startTime: string;
      endTime: string;
      location?: string;
      days: string[];
    }
  ) => {
    try {
      const response = await axios.patch(`/api/classes/${id}`, updates);
      setClasses(prev => prev.map(cls => 
        cls.id === id ? response.data : cls
      ));
      setEditingClass(null);
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Toaster position="bottom-right" />
      
      <div className="flex-shrink-0">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDay('prev')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              title="Previous day"
            >
              <ChevronLeft size={14} className="text-zinc-400" />
            </button>
            <h3 className="text-sm font-medium text-zinc-400">
              {selectedDay}
              <span className="text-zinc-500 ml-2">
                {todaysClasses.length === 0 
                  ? "No classes" 
                  : `${todaysClasses.length} ${todaysClasses.length === 1 ? 'class' : 'classes'}`}
              </span>
            </h3>
            <button
              onClick={() => navigateDay('next')}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              title="Next day"
            >
              <ChevronRight size={14} className="text-zinc-400" />
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="Add class"
          >
            <Plus size={14} className="text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 mb-4">
          {todaysClasses.map(cls => (
            <div 
              key={cls.id}
              className="group bg-zinc-900/50 rounded-lg p-2.5 hover:bg-zinc-900 
                border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate">{cls.name}</h3>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {cls.startTime} - {cls.endTime}
                    </span>
                  </div>
                  {cls.location && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} className="text-zinc-500" />
                      <span className="text-xs text-zinc-500 truncate">{cls.location}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditClass(cls)}
                    className="p-1 hover:bg-white/5 rounded"
                    title="Edit class"
                  >
                    <Pencil size={12} className="text-zinc-400" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1 hover:bg-white/5 rounded"
                    title="Delete class"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-1.5 px-3 bg-zinc-900/50 border border-white/5 rounded-lg
            text-xs text-zinc-400 hover:bg-zinc-900 hover:border-white/10 
            hover:text-zinc-300 transition-all"
        >
          Add Class
        </button>
      </div>

      {showAddForm && (
        <AddClassForm onSubmit={handleAddClass} onClose={() => setShowAddForm(false)} />
      )}

      {editingClass && (
        <EditClassForm 
          class={editingClass} 
          onSubmit={handleUpdateClass} 
          onClose={() => setEditingClass(null)} 
        />
      )}
    </div>
  );
};

interface AddClassFormProps {
  onSubmit: (newClass: Omit<ClassSchedule, 'id' | 'userId' | 'days'> & { days: string[] }) => void;
  onClose: () => void;
}

const AddClassForm = ({ onSubmit, onClose }: AddClassFormProps) => {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      startTime,
      endTime,
      location,
      days: selectedDays
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Add New Class</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Class Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                  focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                  focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Days</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDays(prev => 
                    prev.includes(day) 
                      ? prev.filter(d => d !== day)
                      : [...prev, day]
                  )}
                  className={`px-3 py-1.5 text-sm rounded border ${
                    selectedDays.includes(day)
                      ? 'bg-white text-black border-white'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm hover:bg-zinc-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !startTime || !endTime || selectedDays.length === 0}
              className="px-4 py-2 text-sm bg-white text-black rounded disabled:opacity-50"
            >
              Add Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditClassFormProps {
  class: ClassSchedule;
  onSubmit: (id: string, updates: {
    name: string;
    startTime: string;
    endTime: string;
    location?: string;
    days: string[];
  }) => void;
  onClose: () => void;
}

const EditClassForm = ({ class: classToEdit, onSubmit, onClose }: EditClassFormProps) => {
  const [name, setName] = useState(classToEdit.name);
  const [startTime, setStartTime] = useState(classToEdit.startTime);
  const [endTime, setEndTime] = useState(classToEdit.endTime);
  const [location, setLocation] = useState(classToEdit.location || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(
    classToEdit.days.map(day => day.name)
  );

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(classToEdit.id, {
      name,
      startTime,
      endTime,
      location,
      days: selectedDays
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Edit Class</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Class Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                  focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                  focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Location (Optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-zinc-800 rounded px-3 py-2 text-sm border border-zinc-700 
                focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Days</label>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDays(prev => 
                    prev.includes(day) 
                      ? prev.filter(d => d !== day)
                      : [...prev, day]
                  )}
                  className={`px-3 py-1.5 text-sm rounded border ${
                    selectedDays.includes(day)
                      ? 'bg-white text-black border-white'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm hover:bg-zinc-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !startTime || !endTime || selectedDays.length === 0}
              className="px-4 py-2 text-sm bg-white text-black rounded disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassScheduler;
