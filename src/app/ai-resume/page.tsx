"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const AiResumeBuilderPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderMobileView = () => {
    if (isMobile) {
      return (
        <div className='min-h-screen w-full fixed inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-900 to-black'>
          <div className='space-y-6 max-w-md mx-auto'>
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
                <button className='bg-white text-black px-4 py-2 rounded-md'>
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

  return (
    <div className="relative min-h-screen bg-zinc-950 w-full">
      {renderMobileView() || (
        <>
          {/* Original content (blurred) */}
          <div className='blur-sm'>
            <div className='text-white text-2xl font-bold'></div>
          </div>
          
          {/* Striped background overlay with gradient fade */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  to top,
                  rgba(28, 28, 28, 1) 0%,
                  rgba(28, 28, 28, 0) 100%
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 10px,
                  rgba(255, 107, 0, 0.05) 10px,
                  rgba(255, 107, 0, 0.05) 20px
                )
              `
            }}
          />
          
          {/* Centered text */}
          <div className='absolute inset-0 flex items-center'>
            <div className='px-8 py-4 rounded-lg'>
              <p className='text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 text-transparent bg-clip-text'>
                AI Resume Builder will be coming soon!
              </p>
              <p className='text-sm text-gray-500'>
                This feature is currently under development.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AiResumeBuilderPage
