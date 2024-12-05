import React from 'react'

const AiResumeBuilderPage = () => {
  return (
    <div className="relative min-h-screen bg-zinc-950 w-full">
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
          <p className='text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-500 text-transparent bg-clip-text'>AI Resume Builder will be coming soon!</p>
          <p className='text-sm text-gray-500'>This feature is currently under development.</p>

        </div>
      </div>
    </div>
  )
}

export default AiResumeBuilderPage
