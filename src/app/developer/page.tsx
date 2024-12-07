'use client'

import { useState, useEffect, useRef, RefObject } from 'react';
import { useMotionValue, useMotionTemplate } from 'framer-motion';
import Header from '@/components/ui/Header';
import Link from 'next/link';
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';
import { Github, Linkedin, User, GraduationCap, Briefcase, Rocket } from 'lucide-react';

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
      className="min-h-screen flex flex-col relative overflow-hidden group bg-black"
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
      <div className="flex-1 flex items-start justify-start pt-20">
        <div className="px-4 md:px-20 lg:px-24 w-full relative z-[1]">
          <div className='flex flex-col md:flex-row gap-2 md:gap-32 items-center justify-between'>
            {/* Left side */}
            <div className='flex flex-col gap-4 max-w-3xl'>
              <h2 className='text-xs sm:text-xl md:pb-1 md:text-2xl md:leading-none text-center font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text'>
                Hello! My name is
              </h2>
              <h1 className="text-3xl sm:text-7xl text-center md:text-[80px] md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text">
                Arhaan Keshwani
              </h1>

              {/* Added TypeAnimation for role */}
              <div className="text-xl text-center sm:text-xl pb-4 pt-1 md:text-2xl text-white/80">
                <TypeAnimation
                  sequence={[
                    'Full Stack Developer',
                    2000,
                    'UI/UX Enthusiast',
                    2000,
                    'Problem Solver',
                    2000,
                  ]}
                  repeat={Infinity}
                />
              </div>

              {/* Added bio section */}
              <p className="text-white/70 text-lg leading-relaxed pt-8 sm:text-center">
                I'm a passionate developer based in Atlanta, GA. I have a strong foundation in computer science
                and about 2 years of experience. I just like learning new things and creating new experiences!
              </p>

              {/* Added achievements/highlights */}
              <div className="flex flex-col gap-2 text-white/70">
                <p className="flex items-center gap-2">
                  <GraduationCap size={32} className='border border-white/15 rounded-lg p-1' />
                  Studying Computer Science at Georgia State University
                </p>
                <p className="flex items-center gap-2">
                  <Briefcase size={30} className='border border-white/15 rounded-lg p-1' />
                  Currently working on Lyra!
                </p>
                <p className="flex items-center gap-2">
                  <Rocket size={32} className='border border-white/15 rounded-lg p-1' />
                  Built about 5 production applications including iOS apps
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-6 pt-3 sm:justify-center">
                <Link href="https://github.com/akeshwani2" target="_blank" className="text-white/70 hover:text-white transition-colors">
                  <Github size={24} />
                </Link>
                <Link href="https://linkedin.com/in/arhaan-keshwani" target="_blank" className="text-white/70 hover:text-white transition-colors">
                  <Linkedin size={24} />
                </Link>
                <Link href="https://ak-port.vercel.app" target="_blank" className="text-white/70 hover:text-white transition-colors">
                  <User size={24} />
                </Link>
              </div>
            </div>

            {/* Right side - Experience Timeline */}
            <div className='flex flex-col sm:mt-10 sm:mb-10 gap-6 bg-[#190d2e]/90 backdrop-blur-xl border border-white/15 md:p-8 lg:p-8 p-4 rounded-lg shadow-[0_0_30px_rgba(140,69,255,0.3)] w-full md:min-w-[400px] mx-4'>
              <h2 className="text-2xl font-semibold text-white">Experience</h2>
              
              <div className="relative flex flex-col gap-6">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-white/20" />

                {/* Experience Item 1 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative flex gap-4"
                >
                  <div className="w-4 h-4 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-sm">Sep 2024 - Oct 2024</span>
                    <h3 className="text-white font-medium text-lg">Software Engineer Intern</h3>
                    <p className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">Cita Marketplace</p>
                    <p className="text-white/60 text-sm">
                    Enhanced backend systems for seamless reservations, implemented real-time API integrations, and developed performance monitoring tools. Supported scalability and collaborated with teams to drive platform stability and improvements.
                    </p>
                  </div>
                </motion.div>

                {/* Experience Item 2 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative flex gap-4"
                >
                  <div className="w-4 h-4 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-sm">Jul 2024 - Aug 2024</span>
                    <h3 className="text-white font-medium text-lg">Virtual Software Engineer Intern</h3>
                    <p className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">JPMorgan Chase & Co.</p>
                    <p className="text-white/60 text-sm">
                    Set up the development environment, fixed repository issues, and optimized the web application. Implemented JP Morgan's Perspective library to create a live, user-friendly graph for real-time data monitoring and ensured the graph was clear and visually appealing, providing traders with an effective tool for monitoring real-time data.
                    </p>
                  </div>
                </motion.div>

                {/* Experience Item 3 */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative flex gap-4"
                >
                  <div className="w-4 h-4 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-white/50 text-sm">Mar 2024 - Jul 2024</span>
                    <h3 className="text-white font-medium text-lg">Freelance Software Developer</h3>
                    <p className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">Roast</p>
                    <p className="text-white/60 text-sm">
                    Developed a mobile app for a coffee shop using React Native, integrating Apple Pay, Face ID, and secure sign-in/sign-up. Enhanced customer engagement with ordering, payments, and personalized promotions, improving operational efficiency.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

