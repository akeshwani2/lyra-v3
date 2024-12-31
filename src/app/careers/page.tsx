"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import starsBg from "@/assets/stars.png";
import gridLines from "@/assets/grid-lines.png";
import Header from "@/components/ui/Header";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

const useRelativeMousePosition = (to: React.RefObject<HTMLElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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

const JobCard = ({
  title,
  location,
  salary,
  isOpen,
  onClick,
}: {
  title: string;
  location: string;
  salary: string;
  isOpen: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="cursor-pointer group/card bg-[#190d2e]/90 backdrop-blur-xl border border-white/15 p-6 rounded-lg shadow-[0_0_30px_rgba(140,69,255,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(140,69,255,0.4)]"
  >
    <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
    <div className="flex gap-3 mb-2">
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
        {location}
      </span>
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
        {salary}
      </span>
    </div>
    <div className="mt-4 text-white/70">
      Click to {isOpen ? "close" : "view"} full description
    </div>
  </div>
);

const JobDetails = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm mt-20"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-7xl max-h-[calc(100vh-120px)] overflow-y-auto bg-[#190d2e] border border-white/15 rounded-lg shadow-[0_0_30px_rgba(140,69,255,0.3)]"
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-white">
            Software Engineer Intern
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Remote
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            $18/hour
          </span>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3">
            Role Description
          </h3>
          <p className="text-white/70">
            Lyra is seeking a highly skilled and semi-experienced Software
            Engineer Intern with exceptional expertise in React. This is a
            remote internship role where the intern will contribute to the
            development and enhancement of Lyra's platform, focusing on building
            scalable, high-performance web applications. The main focus will be
            to redesign some pages to improve user experience and interface.
            Once that is accomplished, the focus will shift to growing the
            company and scaling the product/adding new features.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3">
            Responsibilities
          </h3>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>
              Develop and maintain responsive and scalable web applications
              using React
            </li>
            <li>Optimize application performance and troubleshoot issues</li>
            <li>
              Ensure code quality and maintainability through best practices and
              testing
            </li>
            <li>
              Participate in code reviews and provide constructive feedback
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3">
            Qualifications
          </h3>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>
              Proficient in React, including hooks, state management, and
              component lifecycle
            </li>
            <li>Strong foundation in TypeScript and Tailwind CSS</li>
            <li>Experience with Next.js, Neon database, and AWS S3 buckets</li>
            <li>
              Solid understanding of object-oriented programming (OOP)
              principles
            </li>
            <li>
              Familiarity with modern front-end development tools and workflows
              (e.g., npm/yarn)
            </li>
            <li>Excellent problem-solving skills and attention to detail</li>
            <li>
              Ability to work independently and effectively in a remote
              environment
            </li>
            <li>
              Currently a student pursuing a bachelor's degree in Computer
              Science or a related field
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-3">
            Preferred Qualifications
          </h3>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Knowledge of version control systems like Git</li>
            <li>Passion for building intuitive and scalable applications</li>
            <li className="pb-4">Passion for learning</li>
          </ul>
        </div>

        <Link href="/careers/swe">
          <button className="w-full items-center relative py-2 px-2 rounded-lg font-medium text-sm bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] transition-all hover:scale-104 hover:shadow-[0px_0px_16px_#8c45ff]">
            <div className="absolute inset-0">
              <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
              <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>
              <div className="absolute inset-0 shadow-[0_0_10px_rgb(140,69,255.7)_inset] rounded-lg "></div>
            </div>
            <div className="text-white">Apply Now</div>
          </button>
        </Link>
      </div>
    </motion.div>
  </motion.div>
);

const CareersPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, mouseY] = useRelativeMousePosition(containerRef);
  const maskImage = useMotionTemplate`radial-gradient(50% 50% at ${mouseX}px ${mouseY}px, black, transparent)`;
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [showApplication, setShowApplication] = useState(false);

  const jobs = [
    {
      id: 1,
      title: "Software Engineer Intern",
      location: "Remote",
      salary: "$18/hour",
    },
    // Add more jobs here as needed
  ];

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
          backgroundImage: `url(${gridLines.src})`,
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex items-start z-[2] relative">
        <div className="container mx-auto px-4 md:px-20 lg:px-24 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-6xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-center text-transparent bg-clip-text mb-4 pb-1">
              Careers at Lyra!
            </h1>
            <p className="text-lg text-white/70 text-center">
              Help shape the future of academic success
            </p>
          </div>

          {/* Job Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id}>
                <JobCard
                  title={job.title}
                  location={job.location}
                  salary={job.salary}
                  isOpen={selectedJob === job.id}
                  onClick={() =>
                    setSelectedJob(selectedJob === job.id ? null : job.id)
                  }
                />
              </div>
            ))}
          </div>

          {/* Modal */}
          <AnimatePresence mode="wait">
            {selectedJob !== null && (
              <JobDetails
                key="job-details"
                onClose={() => setSelectedJob(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
