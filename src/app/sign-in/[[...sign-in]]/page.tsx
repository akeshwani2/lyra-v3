'use client'

import { useState, useEffect, useRef, RefObject } from 'react';
import { useMotionValue, useMotionTemplate } from 'framer-motion';
import Header from '@/components/ui/Header';
import { SignIn, SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import Link from 'next/link';
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';
import { Github, Linkedin, User } from 'lucide-react';

import { motion } from 'framer-motion';
import starsBg from '@/assets/stars.png';
import gridLines from '@/assets/grid-lines.png';

const useRelativeMousePosition = (to: RefObject<HTMLElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const updateMousePosition = (event: MouseEvent) => {
      if (!to.current) return;
      const { top, left } = to.current.getBoundingClientRect();
      mouseX.set(event.x - left);
      mouseY.set(event.y - top);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return [mouseX, mouseY];
};

export default function Page() {
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, mouseY] = useRelativeMousePosition(containerRef);

  const maskImage = useMotionTemplate`radial-gradient(50% 50% at ${mouseX}px ${mouseY}px, black, transparent)`;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col relative overflow-hidden group"
    >
      <motion.div 
        className="absolute inset-0 bg-black"
        style={{
          backgroundImage: `url(${starsBg.src})`,
        }}
        animate={{ backgroundPositionX: starsBg.width }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
      />

      <Header />

      {/* Static grid overlay */}
      <div
        className="absolute inset-0 bg-[rgb(74,32,138)] bg-blend-overlay [mask-image:radial-gradient(50%_50%_at_50%_35%,black,transparent)] group-hover:opacity-0 transition duration-700"
        style={{ backgroundImage: `url(${gridLines.src})` }}
      />

      {/* Mouse-following grid overlay */}
      <motion.div
        className="absolute inset-0 bg-[rgb(74,32,138)] bg-blend-overlay opacity-0 group-hover:opacity-100 transition duration-700"
        style={{ 
          maskImage,
          backgroundImage: `url(${gridLines.src})` 
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="container relative z-[1]">
          <div className='flex flex-col md:flex-row gap-2 md:gap-20 items-center justify-center'>
            {/* Left side */}
            <div className='flex flex-col gap-5'>
              <h1 className="text-3xl sm:text-6xl md:text-[120px] md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-center sm:pb-2 md:pb-5 lg:pb-7 sm:pt-4">
                Join Lyra today!
              </h1>
              <div className="h-24">
                <p className="text-white/70 text-2xl text-center tracking-tight">              
                  <TypeAnimation 
                    sequence={[
                      'Streamline your workflow effortlessly with AI-powered tools',
                      2000,
                      'Enhance productivity and optimize learning',
                      2000,
                      'Simplify your tasks with cutting-edge AI',
                      2000
                    ]}
                    wrapper="span"
                    speed={70}
                    repeat={Infinity}
                  />
                </p>
              </div>
            </div>

            {/* Right side - Sign in component */}
            <div className='flex flex-col gap-4 sm:items-center sm:justify-center min-w-[400px] mb-10'>
              <SignUp 
                afterSignUpUrl="/tasks"
                redirectUrl="/tasks"
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: "#8B5CF6",
                  },
                  elements: {
                    card: "bg-[#190d2e]/90 backdrop-blur-xl border border-white/15 shadow-[0_0_30px_rgba(140,69,255,0.3)]",
                    headerTitle: "text-white",
                    headerSubtitle: "text-white/70",
                    socialButtonsBlockButton: "bg-[#190d2e] hover:bg-[#4a208a] border border-white/15",
                    formButtonPrimary: "bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] hover:shadow-[0px_0px_16px_#8c45ff]",
                    formFieldInput: "bg-[#190d2e] border-white/15",
                    footerAction: "hidden",
                    footer: "hidden",
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

