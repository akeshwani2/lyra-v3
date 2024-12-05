'use client'

import { useState, useEffect, useRef, RefObject } from 'react';
import { useMotionValue, useMotionTemplate } from 'framer-motion';
import Header from '@/components/ui/Header';
import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import Link from 'next/link';
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';
import { Github, Linkedin, User } from 'lucide-react';

import { motion } from 'framer-motion';
import starsBg from '@/assets/stars.png';
import gridLines from '@/assets/grid-lines.png';
import emailjs from '@emailjs/browser';

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await emailjs.send(
        'service_8bsgl2c',
        'template_rqjsxaa',
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        'JPORaptdXlmY9VLhL'
      );
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      className="min-h-screen flex flex-col bg-black relative group"
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
        className="absolute inset-0 z-[1] bg-[rgb(74,32,138)] bg-blend-overlay [mask-image:radial-gradient(50%_50%_at_50%_35%,black,transparent)] group-hover:opacity-0 transition duration-700"
        style={{ backgroundImage: `url(${gridLines.src})` }}
      />

      {/* Mouse-following grid overlay */}
      <motion.div
        className="absolute inset-0 z-[1] bg-[rgb(74,32,138)] bg-blend-overlay opacity-0 group-hover:opacity-100 transition duration-700"
        style={{ 
          maskImage,
          backgroundImage: `url(${gridLines.src})` 
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex items-start z-[2] relative">
        <div className="container relative">
          <div className='mx-auto mt-20 mb-20'>
            {/* Contact Form */}
            <h1 className="text-6xl md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-center sm:pb-3 md:pb-5 lg:pb-7">
              Help me improve Lyra!
            </h1>
            <p className='text-white/70 text-center mb-8 text-lg'>
              I would love to hear from you! If you have any questions, feedback, or suggestions, please reach out!
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="Your message..."
                  required
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="text-green-400 text-center">Message sent successfully! I will get back to you as soon as possible.</div>
              )}
              
              {submitStatus === 'error' && (
                <div className="text-red-400 text-center">Failed to send message. Please try again.</div>
              )}
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full max-w-[600px] items-center relative py-2 px-3 rounded-lg font-medium text-sm bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] transition-all duration-300 hover:scale-105 hover:shadow-[0px_0px_16px_#8c45ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0">
                    <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>

                    <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>

                    <div className="absolute inset-0 shadow-[0_0_10px_rgb(140,69,255.7)_inset] rounded-lg"></div>
                  </div>
                  <span className="relative z-10 text-white">
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

