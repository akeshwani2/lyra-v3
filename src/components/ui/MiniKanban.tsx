"use client";
import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Check, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
interface Comment {
  id: string;
  content: string;
  timestamp: Date;
}

interface Task {
  id: string;
  content: string;
  status: 'todo' | 'inProgress' | 'completed';
  order: number;
  comments: Comment[];
}

interface Column {
  id: string;
  title: string;
  cards: Task[];
}

interface Card {
  id: string;
  content: string;
  order: number;
  columnId: string;
  completed: boolean;
}

interface MiniKanbanProps {
  onTaskCountsChange: (counts: { todo: number; inProgress: number; completed: number }) => void;
}

const MiniKanban = ({ onTaskCountsChange }: MiniKanbanProps) => {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [dropTarget, setDropTarget] = useState<{
    columnId: 'todo' | 'inProgress' | 'completed';
    position: number;
    taskId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialFocus, setInitialFocus] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
        try {
            setIsLoading(true);
            // First, get or create the user's board
            let boardResponse = await axios.get('/api/boards');
            let board = boardResponse.data;
            
            if (!board) {
                // Create a new board if none exists
                boardResponse = await axios.post('/api/boards', {
                    title: 'My Tasks'
                });
                board = boardResponse.data;
            }
            
            if (!board) {
                toast.error('Failed to initialize board');
                return;
            }
            
            setBoardId(board.id);

            // Now fetch the columns for this board
            let columnsResponse = await axios.get(`/api/boards/${board.id}/columns`);
            let columns = columnsResponse.data;
            
            // If no columns exist, create default columns
            if (!columns || columns.length === 0) {
                await axios.post(`/api/boards/${board.id}/columns`, {
                    columns: [
                        { title: 'Todo', order: 0 },
                        { title: 'In Progress', order: 1 },
                        { title: 'Completed', order: 2 }
                    ]
                });
                // Fetch columns again after creating them
                columnsResponse = await axios.get(`/api/boards/${board.id}/columns`);
                columns = columnsResponse.data;
            }
            
            // Make title matching case-insensitive
            const todoColumn = columns.find((c: Column) => c.title.toLowerCase() === 'todo');
            const inProgressColumn = columns.find((c: Column) => c.title.toLowerCase() === 'in progress');
            const completedColumn = columns.find((c: Column) => c.title.toLowerCase() === 'completed');
            
            if (todoColumn) setTodoTasks(todoColumn.cards || []);
            if (inProgressColumn) setInProgressTasks(inProgressColumn.cards || []);
            if (completedColumn) setCompletedTasks(completedColumn.cards || []);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                toast.error(`Failed to load tasks: ${error.response?.data?.error || error.message}`);
            } else {
                console.error('Error loading tasks:', error);
                toast.error('Failed to load tasks');
            }
        } finally {
            setIsLoading(false);
        }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    onTaskCountsChange({
      todo: todoTasks.length,
      inProgress: inProgressTasks.length,
      completed: completedTasks.length
    });
  }, [todoTasks, inProgressTasks, completedTasks, onTaskCountsChange]);

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };
  
  const handleDragOver = (e: React.DragEvent, columnId: 'todo' | 'inProgress' | 'completed') => {
    e.preventDefault();
    const column = e.currentTarget;
    const tasks = column.querySelectorAll('.task-card');
    
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const rect = task.getBoundingClientRect();
        const mouseY = e.clientY;
        
        // If mouse is in the top half of the task
        if (mouseY < rect.top + (rect.height / 2)) {
            setDropTarget({ 
                columnId, 
                position: i,
                taskId: task.getAttribute('data-task-id') || undefined
            });
            return;
        }
        // If mouse is in the bottom half of the task
        else if (mouseY < rect.bottom) {
            setDropTarget({ 
                columnId, 
                position: i + 1,
                taskId: task.getAttribute('data-task-id') || undefined
            });
            return;
        }
    }
    
    // If we're below all tasks
    setDropTarget({ 
        columnId, 
        position: tasks.length,
        taskId: undefined
    });
  };
  
  const handleDrop = async (e: React.DragEvent, targetColumnId: 'todo' | 'inProgress' | 'completed') => {
    e.preventDefault();
    if (!draggingTaskId || !dropTarget) return;

    try {
        const columnTitle = targetColumnId === 'todo' ? 'Todo' : 
                           targetColumnId === 'inProgress' ? 'In Progress' : 
                           'Completed';

        const targetTasks = targetColumnId === 'todo' ? todoTasks :
                          targetColumnId === 'inProgress' ? inProgressTasks :
                          completedTasks;

        const targetTaskId = targetTasks[dropTarget.position]?.id || null;

        const response = await axios.patch(`/api/boards/cards/${draggingTaskId}`, {
            columnId: columnTitle,
            targetCardId: targetTaskId,
            position: targetTaskId ? 'before' : 'bottom'
        });

        const updatedTask = response.data;

        // Remove from all columns
        setTodoTasks(prev => prev.filter(t => t.id !== draggingTaskId));
        setInProgressTasks(prev => prev.filter(t => t.id !== draggingTaskId));
        setCompletedTasks(prev => prev.filter(t => t.id !== draggingTaskId));

        // Add to target column at the specific position
        const updateTaskList = (tasks: Task[]) => {
            const newTasks = [...tasks];
            newTasks.splice(dropTarget.position, 0, updatedTask);
            return newTasks;
        };

        switch (targetColumnId) {
            case 'todo':
                setTodoTasks(prev => updateTaskList(prev));
                break;
            case 'inProgress':
                setInProgressTasks(prev => updateTaskList(prev));
                break;
            case 'completed':
                setCompletedTasks(prev => updateTaskList(prev));
                break;
        }
    } catch (error) {
        console.error('Error moving task:', error);
        toast.error('Failed to move task');
    } finally {
        setDraggingTaskId(null);
        setDropTarget(null);
    }
};

  const handleAddCard = async (status: 'todo' | 'inProgress' | 'completed') => {
    try {
        // First ensure we have a board
        if (!boardId) {
            // Create a new board if none exists
            const boardResponse = await axios.post('/api/boards', {
                title: 'My Tasks'
            });
            const board = boardResponse.data;
            
            if (!board?.id) {
                throw new Error('Failed to create board');
            }
            
            setBoardId(board.id);

            // Create default columns
            await axios.post(`/api/boards/${board.id}/columns`, {
                columns: [
                    { title: 'Todo', order: 0 },
                    { title: 'In Progress', order: 1 },
                    { title: 'Completed', order: 2 }
                ]
            });
        }

        const columnTitle = status === 'todo' ? 'Todo' : 
                          status === 'inProgress' ? 'In Progress' : 
                          'Completed';

        const response = await axios.post('/api/boards/cards', {
            boardId,
            columnTitle,
            content: 'New Task'
            
        });

        // Optimistically update UI
        const newTask = response.data;
        switch (status) {
            case 'todo':
                setTodoTasks(prev => [newTask, ...prev]);
                break;
            case 'inProgress':
                setInProgressTasks(prev => [newTask, ...prev]);
                break;
            case 'completed':
                setCompletedTasks(prev => [newTask, ...prev]);
                break;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.error || error.message;
            const errorDetails = error.response?.data?.details || '';
            console.error('API Error:', {
                message: errorMessage,
                details: errorDetails,
                status: error.response?.status
            });
            toast.error(`Failed to create task: ${errorMessage}`);
        } else {
            console.error('Non-Axios Error:', error);
            toast.error('Failed to create task');
        }
    }
};

  const handleDeleteTask = async (taskId: string) => {
    try {
        await axios.delete(`/api/boards/cards/${taskId}`);
        
        // Remove from state
        setTodoTasks(prev => prev.filter(t => t.id !== taskId));
        setInProgressTasks(prev => prev.filter(t => t.id !== taskId));
        setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
};

  const handleEditTask = (taskId: string) => {
    const allTasks = [...todoTasks, ...inProgressTasks, ...completedTasks];
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
  
    setEditingTaskId(taskId);
    setEditingContent(task.content);
    setInitialFocus(true);
  };

  const handleSaveEdit = async (taskId: string) => {
    // Find the current task to get its original content
    const allTasks = [...todoTasks, ...inProgressTasks, ...completedTasks];
    const currentTask = allTasks.find(t => t.id === taskId);
    
    // If input is empty or only whitespace, revert to original content
    if (!editingContent.trim() && currentTask) {
        setEditingTaskId(null);
        setEditingContent("");
        return;
    }
    
    try {
        const response = await axios.patch(`/api/boards/cards/${taskId}`, {
            content: editingContent.trim() || (currentTask?.content || 'Untitled Task')
        });

        const updatedTask = response.data;
        
        // Update state based on which column contains the task
        setTodoTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        setInProgressTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        setCompletedTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        
        setEditingTaskId(null);
        setEditingContent("");
    } catch (error) {
        toast.error('Failed to update task', {
            style: {
                background: "#18181b",
                boxShadow: "none",
                fontSize: "14px",
                color: "white",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
            },
        });
    }
};

  const handleCompleteTask = async (taskId: string) => {
    try {
      // Find which column the task is in
      const task = [...todoTasks, ...inProgressTasks].find(t => t.id === taskId);
      if (!task) return;

      const response = await axios.patch(`/api/boards/cards/${taskId}`, {
        columnId: 'Completed'
      });

      const updatedTask = response.data;

      // Remove from other columns
      setTodoTasks(prev => prev.filter(t => t.id !== taskId));
      setInProgressTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Add to completed column
      setCompletedTasks(prev => [updatedTask, ...prev]);
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task', {
        style: {
          background: "#18181b",
          boxShadow: "none",
          fontSize: "14px",
          color: "white",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        },
      });
    }
  };

  const handleClearCompleted = async () => {
    try {
      // Delete all completed tasks
      for (const task of completedTasks) {
        await axios.delete(`/api/boards/cards/${task.id}`);
      }
      
      // Update state to remove all completed tasks
      setCompletedTasks([]);
      
      // Show success toast
      toast.success('Tasks successfully cleared!', {
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
      console.error('Error clearing completed tasks:', error);
      toast.error('Failed to clear completed tasks');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 h-[calc(100%-3rem)]">
        {['To Do', 'In Progress', 'Completed'].map((title) => (
          <div key={title} className="flex flex-col bg-zinc-800/50 rounded-lg border border-white/5 overflow-hidden">
            <div className="p-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <span className="text-sm font-medium">{title}</span>
            </div>
            <div className="p-2 flex-1 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 h-[calc(100%-3rem)]">
      {/* To Do Column */}
      <div className="flex flex-col bg-zinc-800/50 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-medium">To Do</span>
          <button
            onClick={() => handleAddCard("todo")}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div 
          className="p-2 overflow-y-auto flex-1"
          onDragOver={(e) => handleDragOver(e, "todo")}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => handleDrop(e, "todo")}
        >
          {todoTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {dropTarget?.columnId === 'todo' && dropTarget.position === index && (
                <div className="h-[2px] bg-purple-500 my-2 rounded-full transition-all duration-200" />
              )}
              <div
                draggable
                data-task-id={task.id}
                onDragStart={() => handleDragStart(task.id)}
                className="task-card bg-white/5 p-2 rounded-md mb-2 cursor-grab hover:bg-white/10 group"
              >
                <div className="flex justify-between items-start gap-2">
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => {
                        setEditingContent(e.target.value);
                        setInitialFocus(false);
                      }}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(task.id);
                        if (e.key === 'Escape') {
                          setEditingTaskId(null);
                          setEditingContent("");
                        }
                      }}
                      className="bg-zinc-800 text-sm p-1 rounded-md outline-none focus:ring-1 focus:ring-purple-500/50 w-full"
                      autoFocus
                      ref={(input) => {
                        if (input && initialFocus) {
                          input.focus();
                          input.select();
                          setInitialFocus(false);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm">{task.content}</span>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                      onClick={() => handleEditTask(task.id)}
                      className="p-1 hover:text-purple-400"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-1 hover:text-green-400"
                      title="Mark as completed"
                    >
                      <Check size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          {dropTarget?.columnId === 'todo' && dropTarget.position === todoTasks.length && (
            <div className="h-[2px] bg-purple-500 my-2 rounded-full transition-all duration-200" />
          )}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="flex flex-col bg-zinc-800/50 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-medium">In Progress</span>
          <button
            onClick={() => handleAddCard("inProgress")}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div 
          className="p-2 overflow-y-auto flex-1"
          onDragOver={(e) => handleDragOver(e, "inProgress")}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => handleDrop(e, "inProgress")}
        >
          {inProgressTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {dropTarget?.columnId === 'inProgress' && dropTarget.position === index && (
                <div className="h-[2px] bg-purple-500 my-2 rounded-full transition-all duration-200" />
              )}
              <div
                draggable
                data-task-id={task.id}
                onDragStart={() => handleDragStart(task.id)}
                className="task-card bg-white/5 p-2 rounded-md mb-2 cursor-grab hover:bg-white/10 group"
              >
                <div className="flex justify-between items-start gap-2">
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => {
                        setEditingContent(e.target.value);
                        setInitialFocus(false);
                      }}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(task.id);
                        if (e.key === 'Escape') {
                          setEditingTaskId(null);
                          setEditingContent("");
                        }
                      }}
                      className="bg-zinc-800 text-sm p-1 rounded-md outline-none focus:ring-1 focus:ring-purple-500/50 w-full"
                      autoFocus
                      ref={(input) => {
                        if (input && initialFocus) {
                          input.focus();
                          input.select();
                          setInitialFocus(false);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm">{task.content}</span>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">

                    <button
                      onClick={() => handleEditTask(task.id)}
                      className="p-1 hover:text-purple-400"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-1 hover:text-green-400"
                      title="Mark as completed"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          {dropTarget?.columnId === 'inProgress' && dropTarget.position === inProgressTasks.length && (
            <div className="h-[2px] bg-purple-500 my-2 rounded-full transition-all duration-200" />
          )}
        </div>
      </div>

      {/* Completed Column */}
      <div className="flex flex-col bg-zinc-800/50 rounded-lg border border-white/5 overflow-hidden">
        <div className="p-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-medium">Completed</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearCompleted}
              className={`p-1 rounded-lg transition-colors ${
                completedTasks.length > 0 
                  ? "hover:bg-white/10 text-zinc-400 hover:text-red-400" 
                  : "text-zinc-700 cursor-not-allowed"
              }`}
              title="Clear all completed tasks"
              disabled={completedTasks.length === 0}
            >
              <XCircle size={14} />
            </button>
            <button
              onClick={() => handleAddCard("completed")}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div 
          className="p-2 overflow-y-auto flex-1"
          onDragOver={(e) => handleDragOver(e, "completed")}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => handleDrop(e, "completed")}
        >
          {completedTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {dropTarget?.columnId === 'completed' && dropTarget.position === index && (
                <div className="h-[2px] bg-purple-500 my-2 rounded-full transition-all duration-200" />
              )}
              <div
                draggable
                data-task-id={task.id}
                onDragStart={() => handleDragStart(task.id)}
                className="task-card bg-white/5 p-2 rounded-md mb-2 cursor-grab hover:bg-white/10 group"
              >
                <div className="flex justify-between items-start gap-2">
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => {
                        setEditingContent(e.target.value);
                        setInitialFocus(false);
                      }}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(task.id);
                        if (e.key === 'Escape') {
                          setEditingTaskId(null);
                          setEditingContent("");
                        }
                      }}
                      className="bg-zinc-800 text-sm p-1 rounded-md outline-none focus:ring-1 focus:ring-purple-500/50 w-full"
                      autoFocus
                      ref={(input) => {
                        if (input && initialFocus) {
                          input.focus();
                          input.select();
                          setInitialFocus(false);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm line-through opacity-50">{task.content}</span>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => handleEditTask(task.id)}
                      className="p-1 hover:text-purple-400"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          {dropTarget?.columnId === 'completed' && dropTarget.position === completedTasks.length && (
            <div className="h-[2px] bg-purple-500 my-2 rounded-full transition-all duration-200" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniKanban;