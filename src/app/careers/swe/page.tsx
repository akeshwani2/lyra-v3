"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import starsBg from "@/assets/stars.png";
import gridLines from "@/assets/grid-lines.png";
import Header from "@/components/ui/Header";

// Reuse the same mouse position hook
const useRelativeMousePosition = (to: React.RefObject<HTMLElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  React.useEffect(() => {
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

const ApplicationPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, mouseY] = useRelativeMousePosition(containerRef);
  const maskImage = useMotionTemplate`radial-gradient(50% 50% at ${mouseX}px ${mouseY}px, black, transparent)`;
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    resumeFile: null as File | null,
    github: "",
    portfolio: "",
    yearsExperience: "",
    whyLyra: "",
    projectDescription: "",
    availableStart: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle submission logic
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Basic Information
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData((prev) => ({ ...prev, resumeFile: file }));
                }}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Professional Links
            </h3>
            <div className="space-y-4">
              <input
                type="url"
                placeholder="GitHub Profile URL"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
              />
              <input
                type="url"
                placeholder="Portfolio Website (if any)"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                value={formData.portfolio}
                onChange={(e) =>
                  setFormData({ ...formData, portfolio: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Years of Experience"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                value={formData.yearsExperience}
                onChange={(e) =>
                  setFormData({ ...formData, yearsExperience: e.target.value })
                }
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Screening Questions
            </h3>
            <div className="space-y-4">
              <textarea
                placeholder="Why do you want to work at Lyra?"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white h-32"
                value={formData.whyLyra}
                onChange={(e) =>
                  setFormData({ ...formData, whyLyra: e.target.value })
                }
              />
              <textarea
                placeholder="Describe a challenging project you've worked on"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white h-32"
                value={formData.projectDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectDescription: e.target.value,
                  })
                }
              />
              <input
                type="date"
                placeholder="When can you start?"
                className="w-full p-3 rounded-lg bg-[#2a1c3f] border border-white/20 text-white"
                value={formData.availableStart || ""}
                onChange={(e) =>
                  setFormData({ ...formData, availableStart: e.target.value })
                }
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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

      {/* Application Form */}
      <div className="flex-1 flex items-start justify-center z-[2] relative pt-20">
        <div className="w-full max-w-2xl mx-4 bg-[#190d2e] border border-white/15 rounded-lg shadow-[0_0_30px_rgba(140,69,255,0.3)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">
                Application for Software Engineer Intern
              </h2>
            </div>

            {renderStep()}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-lg bg-[#2a1c3f] text-white/70 hover:text-white"
                >
                  Previous
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 rounded-lg bg-[#2a1c3f] text-white/70 hover:text-white ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-b from-[#190d2e] to-[#4a208a] text-white ml-auto"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;