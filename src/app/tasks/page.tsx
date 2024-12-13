'use client'
import KanbanBoard from '@/components/ui/KanbanBoard'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import TasksPage2 from '@/components/ui/TasksPage2'
const TasksPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className='min-h-screen w-full fixed inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-900 to-black'>
        <div className='space-y-6 max-w-md mx-auto'>
          {/* Mobile Icon */}
          <div className='text-6xl mb-8'>
            📱
          </div>
          <h1 className='text-3xl font-bold text-white mb-4'>
            Lyra is not optimized for mobile screens yet
          </h1>
          <p className='text-gray-400 text-lg'>
            Please visit us on a desktop or laptop computer for the best experience.
          </p>
          <div className='flex justify-center'>
            <Link href="/">
              <button className='bg-white text-black px-4 py-2 rounded-md' >
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

  return (
    <div className='h-screen overflow-hidden text-white text-2xl font-bold bg-zinc-950'>
      <TasksPage2 />  
    </div>
  )
}

export default TasksPage

