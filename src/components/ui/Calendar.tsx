"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;

  datesWithEntries?: Date[] // Array of dates that have journal entries
}

export const Calendar = ({ isOpen, onClose, datesWithEntries = [] }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Navigation functions
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (!isOpen) return null;

  // This is a helper function that checks if a date has a journal entry cuhhhh
  const hasEntry = (date: Date) => {
    return datesWithEntries.some(entryDate => 
      isSameDay(entryDate, date)
    )
  }

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Calendar container */}
      <div className="bg-gray-900 rounded-xl p-4 w-[340px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex gap-2">
            <button onClick={previousMonth} className="p-1 hover:bg-white/10 rounded">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day) => (
            <button
              key={day.toString()}
              className={`
                aspect-square p-2 rounded-lg text-sm
                hover:bg-white/10
                ${isSameDay(day, new Date()) ? "bg-purple-500/20 text-purple-300" : ""}
              `}
              onClick={() => {
                // Handle day selection here
                onClose();
              }}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>

        {/* Close button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};