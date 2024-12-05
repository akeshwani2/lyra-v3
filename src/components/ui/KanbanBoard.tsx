'use client'
import React, { useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Trash2, Pen, Loader, GripVertical, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { UserButton, useUser, useAuth } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
// import { DragStartEvent } from '@dnd-kit/core';


interface Card {
    id: string;
    content: string;
    columnId: string;
}

interface Column {
    id: string;
    title: string;
    cards: Card[];
}

function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>([]);
    const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
    const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = useState<{id: string, title: string} | null>(null);
    const [editingCardContent, setEditingCardContent] = useState<{id: string, content: string} | null>(null);
    const [board, setBoard] = useState<{ id: string; title: string } | null>(null);
    const [editingBoardTitle, setEditingBoardTitle] = useState<{ id: string; title: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
    const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
    const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState<string>("");
    const [isEditingColumnId, setIsEditingColumnId] = useState<string | null>(null);
    const { user } = useUser();
    const { isSignedIn, isLoaded } = useAuth();
    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleColumnTitleEdit = (columnId: string, currentTitle: string) => {
        setEditingColumnTitle({ id: columnId, title: currentTitle });
    };

    const handleDragStart = (cardId: string) => {
        console.log('Drag started:', cardId);
        setDraggingCardId(cardId);
    };
    
    
    const handleDragOver = (e: React.DragEvent, columnId: string, cardId?: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (cardId) {
            const cardElement = e.currentTarget as HTMLElement;
            const rect = cardElement.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const position = e.clientY < midpoint ? 'top' : 'bottom';
            
            setDropPosition(position);
            setDropTargetId(cardId);
        } else {
            setDropPosition(null);
            setDropTargetId(columnId);
        }
    };

    const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggingCardId) return;

        try {
            const targetCard = dropTargetId;
            const position = dropPosition;

            // Find the source column
            const sourceColumn = columns.find(col => 
                col.cards.some(card => card.id === draggingCardId)
            );

            // Get the dragged card
            const draggedCard = sourceColumn?.cards.find(card => card.id === draggingCardId);
            if (!draggedCard) return;

            const response = await fetch(`/api/cards/${draggingCardId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    columnId: targetColumnId,
                    targetCardId: targetCard,
                    position: position 
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to move card');
            }

            const updatedCard = await response.json();

            // Update columns state
            setColumns(prevColumns => prevColumns.map(col => {
                // If same column, reorder cards
                if (col.id === targetColumnId && col.id === sourceColumn?.id) {
                    const newCards = col.cards.filter(card => card.id !== draggingCardId);
                    const targetIndex = targetCard 
                        ? newCards.findIndex(card => card.id === targetCard)
                        : newCards.length;
                    
                    const insertIndex = position === 'top' ? targetIndex : targetIndex + 1;
                    newCards.splice(insertIndex, 0, updatedCard);
                    return {
                        ...col,
                        cards: newCards
                    };
                }
                // Remove from source column
                if (col.id === sourceColumn?.id) {
                    return {
                        ...col,
                        cards: col.cards.filter(card => card.id !== draggingCardId)
                    };
                }
                // Add to target column
                if (col.id === targetColumnId) {
                    const newCards = [...col.cards];
                    if (targetCard) {
                        const targetIndex = newCards.findIndex(card => card.id === targetCard);
                        const insertIndex = position === 'top' ? targetIndex : targetIndex + 1;
                        newCards.splice(insertIndex, 0, updatedCard);
                    } else {
                        newCards.push(updatedCard);
                    }
                    return {
                        ...col,
                        cards: newCards
                    };
                }
                return col;
            }));
        } catch (error) {
            console.error("Error moving card:", error);
        } finally {
            setDraggingCardId(null);
            setDropTargetId(null);
            setDropPosition(null);
        }
    };

    const handleColumnTitleSave = async (columnId: string, newTitle: string) => {
        if (newTitle.trim() === '') return;
        await updateColumnTitle(columnId, newTitle);
        setEditingColumnTitle(null);
    };

    const handleCardEdit = (cardId: string, currentContent: string) => {
        setEditingCardContent({ id: cardId, content: currentContent });
    };

    const handleCardSave = async (cardId: string, content: string) => {
        try {
            // If content is empty, get the current card's content
            const currentCard = columns
                .flatMap(col => col.cards)
                .find(card => card.id === cardId);
                
            const contentToSave = content.trim() || currentCard?.content || "New Task";

            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: contentToSave })
            });

            if (!response.ok) {
                throw new Error('Failed to update card');
            }

            // Update local state immediately
            setColumns(prevColumns => 
                prevColumns.map(column => ({
                    ...column,
                    cards: column.cards.map(card => 
                        card.id === cardId 
                            ? { ...card, content: contentToSave }
                            : card
                    )
                }))
            );

            setEditingCardContent(null);
        } catch (error) {
            console.error("Error updating card:", error);
        }
    };

    const handleBoardTitleEdit = (boardId: string, currentTitle: string) => {
        setEditingBoardTitle({ id: boardId, title: currentTitle });
    };
    
    const handleBoardTitleSave = async (boardId: string, newTitle: string) => {
        if (!newTitle.trim()) {
            setEditingBoardTitle(null);
            return;
        }
        try {
            const response = await fetch('/api/boards', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update board title');
            }
    
            await loadBoard();
        } catch (error) {
            console.error("Error updating board title:", error);
        } finally {
            setEditingBoardTitle(null);
        }
    };
    
    useEffect(() => {
        loadBoard();
    }, []);

    async function loadBoard() {
        setIsLoading(true);  // Start loading
        try {
            const response = await fetch('/api/boards');
            if (!response.ok) {
                throw new Error(`Failed to load board: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            if (!data) {
                throw new Error('No data received from server');
            }
            
            setBoard({ id: data.id, title: data.title });
            if (data.columns) {
                setColumns(data.columns);
            }
        } catch (error) {
            console.error("Error loading board:", error instanceof Error ? error.message : 'Unknown error');
            // Optionally set an error state here to show to the user
            setColumns([]); // Reset to empty state on error
            setBoard(null);
        } finally {
            setIsLoading(false);  // End loading
        }
    }

    async function createNewCard(columnId: string) {
        try {
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    columnId,
                    content: "New Task"
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create card');
            }

            await loadBoard();
        } catch (error) {
            console.error("Error creating card:", error);
        }
    }

    // async function deleteColumn(columnId: string) {
    //     try {
    //         setDeletingColumnId(columnId);
    //         const response = await fetch(`/api/columns/${columnId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });
            
    //         if (!response.ok) {
    //             throw new Error('Failed to delete column');
    //         }
        
    //         await loadBoard();
    //     } catch (error) {
    //         console.error("Error deleting column:", error);
    //     } finally {
    //         setDeletingColumnId(null);
    //     }
    // }

    async function deleteCard(cardId: string) {
        try {
            setDeletingCardId(cardId);
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete card');
            }
    
            await loadBoard();
        } catch (error) {
            console.error("Error deleting card:", error);
        } finally {
            setDeletingCardId(null);
        }
    }

    async function createNewColumn() {
        try {
            const response = await fetch('/api/boards', {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.columns) {
                setColumns(data.columns);
            }
        } catch (error) {
            console.error("Error creating column:", error);
        }
    }

    async function updateColumnTitle(columnId: string, newTitle: string) {
        try {
            const response = await fetch(`/api/columns/${columnId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update column');
            }
    
            await loadBoard();
        } catch (error) {
            console.error("Error updating column:", error);
        } finally {
            setEditingColumnId(null);
        }
    }
    // async function updateCardContent(cardId: string, newContent: string) {
    //     try {
    //         const response = await fetch(`/api/cards/${cardId}`, {
    //             method: 'PATCH',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({ content: newContent })
    //         });
            
    //         if (!response.ok) {
    //             throw new Error('Failed to update card');
    //         }
    
    //         await loadBoard();
    //     } catch (error) {
    //         console.error("Error updating card:", error);
    //     } finally {
    //         setEditingCardId(null);
    //     }
    // }

    const handleDragEnd = () => {
        setDropTargetId(null);
        setDropPosition(null);
        setDraggingCardId(null);
    };

    useEffect(() => {
        document.addEventListener('dragend', handleDragEnd);
        return () => document.removeEventListener('dragend', handleDragEnd);
    }, []);

    // Add this helper function to show drop indicators
    // function getDropIndicatorPosition(e: React.DragEvent, element: HTMLElement) {
    //     const rect = element.getBoundingClientRect();
    //     const midpoint = rect.top + rect.height / 2;
    //     return e.clientY < midpoint ? 'top' : 'bottom';
    // }

    const handleColumnDragStart = (columnId: string) => {
        setDraggingColumnId(columnId);
    };

    const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (draggingColumnId && draggingColumnId !== columnId) {
            setDropTargetColumnId(columnId);
        }
    };

    const handleColumnDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        if (!draggingColumnId || draggingColumnId === targetColumnId) return;

        try {
            // Find the indices of the source and target columns
            const sourceIndex = columns.findIndex(col => col.id === draggingColumnId);
            const targetIndex = columns.findIndex(col => col.id === targetColumnId);
            
            // Optimistically update the UI
            setColumns(prevColumns => {
                const newColumns = [...prevColumns];
                const [draggedColumn] = newColumns.splice(sourceIndex, 1);
                newColumns.splice(targetIndex, 0, draggedColumn);
                return newColumns;
            });

            const response = await fetch(`/api/columns/${draggingColumnId}/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    targetColumnId: targetColumnId,
                    sourceIndex,
                    targetIndex
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to reorder columns');
                // If the API call fails, reload the board to restore the correct order
                await loadBoard();
            }
        } catch (error) {
            console.error("Error reordering columns:", error);
            // Reload the board to ensure we're in sync with the server
            await loadBoard();
        } finally {
            setDraggingColumnId(null);
            setDropTargetColumnId(null);
        }
    };

    const handleColumnTitleChange = async (columnId: string, newTitle: string) => {
        // If empty title, revert to previous title
        if (!newTitle.trim()) {
            const currentColumn = columns.find(col => col.id === columnId);
            setEditingTitle(currentColumn?.title || '');
            setIsEditingColumnId(null);
            return;
        }

        try {
            const response = await fetch(`/api/columns/${columnId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: newTitle.trim() })
            });

            if (!response.ok) {
                throw new Error('Failed to update column title');
            }

            await loadBoard();
        } catch (error) {
            console.error("Error updating column title:", error);
        } finally {
            setIsEditingColumnId(null);
        }
    };

    const handleStartEditing = (columnId: string, currentTitle: string) => {
        setIsEditingColumnId(columnId);
        setEditingTitle(currentTitle);
    };

    const handleAddCard = async (columnId: string) => {
        try {
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    columnId,
                    content: 'New Task'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add card');
            }

            await loadBoard();
        } catch (error) {
            console.error("Error adding card:", error);
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        try {
            const response = await fetch(`/api/columns/${columnId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete column');
            }

            await loadBoard();
        } catch (error) {
            console.error("Error deleting column:", error);
        }
    };

    const checkForOverflow = useCallback(() => {
        if (containerRef.current) {
            const { scrollWidth, clientWidth } = containerRef.current;
            setShowScrollButtons(scrollWidth > clientWidth);
        }
    }, []);

    useEffect(() => {
        checkForOverflow();
        window.addEventListener('resize', checkForOverflow);
        return () => window.removeEventListener('resize', checkForOverflow);
    }, [checkForOverflow, columns]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (containerRef.current) {
            const scrollAmount =1500; // Adjust this value to control scroll distance
            const currentScroll = containerRef.current.scrollLeft;
            const targetScroll = direction === 'left' 
                ? currentScroll - scrollAmount 
                : currentScroll + scrollAmount;

            containerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full overflow-x-hidden tracking-tight">
                        {isLoading ? (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        {/* <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 border-t-purple-500" /> */}
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <p className="text-gray-400 text-sm">Assembling your masterpiece...</p>
                    </div>
                </div>
            ) : null}
            <div className="px-4 md:px-[40px] pt-24 md:pt-12">
                <div className="fixed top-4 border border-white/15 rounded-xl px-2 md:right-8 flex items-center gap-2 z-10">
                    {isLoaded && isSignedIn && (
                        <span className="bg-gradient-to-t from-zinc-600 via-zinc-300 to-white text-transparent bg-clip-text text-lg md:text-xl font-bold">
                            {user?.username || user?.firstName || ''}
                        </span>
                    )}
                    {isLoaded && (
                        <UserButton 
                            afterSignOutUrl="/"
                            appearance={{
                                baseTheme: dark,
                                elements: {
                                    avatarBox: "w-8 h-8 md:w-10 md:h-10",
                                    userButtonTrigger: "p-1 md:p-2",
                                    userButtonPopoverCard: "min-w-[240px]"
                                }
                            }}
                        />
                    )}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        {editingBoardTitle?.id === board?.id ? (
                            <input
                                type="text"
                                value={editingBoardTitle?.title ?? board?.title}
                                onChange={(e) => {
                                    if (editingBoardTitle) {
                                        setEditingBoardTitle({ ...editingBoardTitle, title: e.target.value });
                                    }
                                }}
                                onBlur={() => {
                                    if (editingBoardTitle && board) {
                                        handleBoardTitleSave(board.id, editingBoardTitle.title);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editingBoardTitle && board) {
                                        handleBoardTitleSave(board.id, editingBoardTitle.title);
                                    }
                                    if (e.key === 'Escape') {
                                        setEditingBoardTitle(null);
                                    }
                                }}
                                className="text-3xl md:text-4xl text-center font-bold bg-transparent text-white border-b-2 border-white/15 outline-none px-2 py-1 min-w-[200px] md:min-w-[300px]"
                                autoFocus
                            />
                        ) : (
                            <div className="flex items-center gap-3">
                                
                                <h1 className="text-4xl md:text-7xl font-bold text-white">
                                    {board?.title || 'My Board'}
                                </h1>
                                <Button
                                    variant="ghost"
                                    className="h-auto p-2 text-gray-400 hover:text-purple-400"
                                    onClick={() => board && handleBoardTitleEdit(board.id, board.title)}
                                >
                                    <Pen size={24} />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-6">
                        <div className="text-gray-400">
                            <span className="font-semibold text-purple-400">{columns.length}</span>
                            {' '}{columns.length === 1 ? 'Column' : 'Columns'}
                        </div>
                        {(() => {
                            const taskCount = columns.reduce((total, column) => total + column.cards.length, 0);
                            return (
                                <div className="text-gray-400">
                                    <span className="font-semibold text-purple-400">{taskCount}</span>
                                    {' '}{taskCount === 1 ? 'Task' : 'Tasks'}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
            <div className="flex-1 relative flex flex-col mt-8">
                <div 
                    ref={containerRef}
                    className="flex-1 overflow-x-auto custom-scrollbar"
                >
                    <div className="inline-flex gap-4 p-4 md:p-[40px]">
                        <AnimatePresence mode="popLayout">
                            {columns.map((column: Column) => (
                                <motion.div
                                    key={column.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.4 }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-[350px] h-[500px] shrink-0 bg-zinc-900/60 rounded-md flex flex-col border border-white/10
                                        ${draggingColumnId === column.id ? 'opacity-50' : ''}
                                        ${dropTargetColumnId === column.id ? 'ring-2 ring-white/50' : ''}`}
                                    draggable
                                    onDragStart={() => handleColumnDragStart(column.id)}
                                    onDragOver={(e) => handleColumnDragOver(e, column.id)}
                                    onDrop={(e) => handleColumnDrop(e, column.id)}
                                    onDragEnd={() => {
                                        setDraggingColumnId(null);
                                        setDropTargetColumnId(null);
                                    }}
                                >
                                    <div className="p-2 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors duration-200 border-b border-white/10">
                                        <div 
                                            className="flex items-center gap-2 flex-1 cursor-grab min-w-0"
                                            onMouseDown={() => handleColumnDragStart(column.id)}
                                        >
                                            <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-300 shrink-0" />
                                            {isEditingColumnId === column.id ? (
                                                <input
                                                    ref={(input) => {
                                                        if (input && column.title === "New Column" && editingTitle === "New Column") {
                                                            input.focus();
                                                            input.select();
                                                        }
                                                    }}
                                                    type="text"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => {
                                                        if (editingTitle.trim()) {
                                                            handleColumnTitleChange(column.id, editingTitle);
                                                        } else {
                                                            setIsEditingColumnId(null);
                                                            setEditingTitle(column.title);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            if (editingTitle.trim()) {
                                                                handleColumnTitleChange(column.id, editingTitle);
                                                            } else {
                                                                setIsEditingColumnId(null);
                                                                setEditingTitle(column.title);
                                                            }
                                                        } else if (e.key === 'Escape') {
                                                            setIsEditingColumnId(null);
                                                            setEditingTitle(column.title);
                                                        }
                                                    }}
                                                    autoFocus
                                                    className="bg-transparent text-white font-semibold min-w-0 w-full outline-none focus:ring-1 focus:ring-purple-500/50 rounded px-1"
                                                />
                                            ) : (
                                                <span className="text-white font-semiboldtruncate">{column.title}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                onClick={() => handleAddCard(column.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-green-400"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleStartEditing(column.id, column.title)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-purple-400"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteColumn(column.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div 
                                        className={`flex-grow p-2 flex flex-col gap-2 overflow-y-auto transition-colors duration-200 ${
                                            dropTargetId === column.id && !column.cards?.length 
                                                ? 'bg-white/5 ring-2 ring-white/20 rounded-md' 
                                                : ''
                                        }`}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            if (!column.cards?.length) {
                                                setDropTargetId(column.id);
                                                setDropPosition(null);
                                            }
                                        }}
                                        onDragLeave={(e) => {
                                            // Only clear if we're not entering a child element
                                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                setDropTargetId(null);
                                                setDropPosition(null);
                                            }
                                        }}
                                        onDrop={(e) => {
                                            handleDrop(e, column.id);
                                            setDropTargetId(null);
                                            setDropPosition(null);
                                        }}
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {column.cards?.map((card: Card) => (
                                                <div 
                                                    key={card.id}
                                                    className="relative"
                                                    onDragOver={(e) => handleDragOver(e, column.id, card.id)}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        handleDrop(e, column.id);
                                                    }}
                                                >
                                                    {dropTargetId === card.id && dropPosition === 'top' && (
                                                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500 -translate-y-[2px]" />
                                                    )}
                                                    <motion.div
                                                        draggable
                                                        onDragStart={() => handleDragStart(card.id)}
                                                        className={`group relative bg-white/10 p-3 rounded-md shadow-sm 
                                                            hover:ring-1 hover:ring-inset hover:ring-white/20 cursor-grab
                                                            ${draggingCardId === card.id ? 'opacity-50' : ''}`}
                                                    >
                                                        {editingCardContent?.id === card.id ? (
                                                            <div className="pr-16">
                                                                <input
                                                                    ref={(input) => {
                                                                        if (input && card.content === "New Task" && editingCardContent.content === "New Task") {
                                                                            input.focus();
                                                                            input.select();
                                                                        }
                                                                    }}
                                                                    type="text"
                                                                    value={editingCardContent.content}
                                                                    onChange={(e) => setEditingCardContent({ 
                                                                        ...editingCardContent, 
                                                                        content: e.target.value 
                                                                    })}
                                                                    onBlur={() => handleCardSave(card.id, editingCardContent.content)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            handleCardSave(card.id, editingCardContent.content);
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setEditingCardContent(null);
                                                                        }
                                                                    }}
                                                                    className="bg-[#1F2937] px-2 py-1 rounded-md outline-none focus:ring-1 focus:ring-purple-500 w-full"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="break-words whitespace-pre-wrap overflow-hidden pr-16">
                                                                {card.content}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                className="h-auto p-1 text-gray-400 hover:text-purple-400"
                                                                onClick={() => handleCardEdit(card.id, card.content)}
                                                            >
                                                                <Pen size={16} />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                className="h-auto p-1 text-gray-400 hover:text-red-400"
                                                                onClick={() => deleteCard(card.id)}
                                                                disabled={deletingCardId === card.id}
                                                            >
                                                                {deletingCardId === card.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={16} />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                    {dropTargetId === card.id && dropPosition === 'bottom' && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 translate-y-[2px]" />
                                                    )}
                                                </div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <div className="p-2 border-t border-white/10">
                                        <Button 
                                            className="w-full flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 justify-start px-2"
                                            variant="ghost"
                                            onClick={() => createNewCard(column.id)}
                                        >
                                            <Plus size={16} />
                                            Add task
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0"
                            >
                                <Button 
                                    className="h-[500px] w-[350px] min-w-[350px] cursor-pointer rounded-md 
                                        bg-black/40 hover:bg-white/5 hover:ring-1 hover:ring-inset hover:ring-white/20 
                                        flex items-center justify-center gap-2 text-gray-400 hover:text-white
                                        border border-white/10"
                                    onClick={createNewColumn}
                                >
                                    <Plus size={24} />
                                    Add Column
                                </Button>
                            </motion.div>
                            </AnimatePresence>
                    </div>
                </div>

                {showScrollButtons && (
                    <div className="flex justify-center gap-4 py-4 sticky bottom-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-zinc-900 hover:bg-white/10 rounded-full h-10 w-10 md:h-12 md:w-12"
                            onClick={() => handleScroll('left')}
                        >
                            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-zinc-900 hover:bg-white/10 rounded-full h-10 w-10 md:h-12 md:w-12"
                            onClick={() => handleScroll('right')}
                        >
                            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default KanbanBoard;