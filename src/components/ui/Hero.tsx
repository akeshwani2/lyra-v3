"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import starsBg from "@/assets/stars.png";
import { motion, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import { Dot } from "lucide-react";

const Hero = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log(latest);
  });
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const handleNavigation = (path: string) => {
    if (!isSignedIn) {
      console.log("Not signed in, redirecting to sign-in page");
      sessionStorage.setItem("redirectPath", path);
      router.push("/sign-in");
      return;
    }
    router.push(path);
  };

  useEffect(() => {
    if (isSignedIn) {
      const redirectPath = sessionStorage.getItem("redirectPath");
      if (redirectPath) {
        router.push(redirectPath);
        sessionStorage.removeItem("redirectPath");
      }
    }
  }, [isSignedIn, router]);

  return (
    <motion.section
      ref={sectionRef}
      className="h-[492px] md:h-[800px] flex items-center overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      style={{ 
        backgroundImage: `url(${starsBg.src})`,
        backgroundPositionY 
      }}
      animate={{ backgroundPositionX: starsBg.width }}
      transition={{
        duration: 100,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(75%_75%_at_center_center,rgb(140,69,255,.5)_15%,rgb(14,0,36,.5)_78%,transparent)]"></div>

      {/* Logo section with purple theme */}
      <div className="absolute h-24 w-24 md:h-48 md:w-48 top-[25%] md:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Base glow layer */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(50%_50%_at_center,rgb(140,69,255,0.5),transparent_70%)]"></div>
        
        {/* Logo with purple gradient */}
        <svg 
          viewBox="0 0 120 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(140,69,255,0.5)]"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M0 60C38.1371 60 60 38.1371 60 0C60 38.1371 81.8629 60 120 60C81.8629 60 60 81.8629 60 120C60 81.8629 38.1371 60 0 60Z" 
            className="fill-[url(#purple-gradient)]"
          />
          <defs>
            <radialGradient id="purple-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(45) scale(120)">
              <stop offset="0%" stopColor="white" />
              <stop offset="50%" stopColor="rgb(184,148,255)" />
              <stop offset="100%" stopColor="rgb(140,69,255)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Text content with original gradient */}
      <div className="container relative mt-16 md:mt-36">
        <h1 className="text-5xl md:text-[140px] md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-center pb-2 mt-1 md:mt-0 md:pb-5">
          Lyra
        </h1>
        <p className="text-base md:text-xl text-white/70 text-center tracking-tight max-w-xl mx-auto px-4 md:px-0">
          Your AI companion for smarter work, faster learning,
          and breakthrough moments – every single day
        </p>
        <div className="flex flex-col items-center justify-center mt-4 md:mt-6 gap-4 md:gap-6">

          
          <div className="text-white/70 flex px-4 py-2 border border-white/15 rounded-full justify-center items-center gap-1 text-sm font-medium">
            <div className="relative w-6 flex items-center justify-center">
              <Dot className="absolute w-8 h-8 font-bold text-green-500 scale-125 animate-pulse duration-0.5" />
            </div>
            Acquired $5,000 in pre-seed funding
          </div>
        </div>
      </div>

      {/* Ring 1 */}
      <motion.div
        style={{
          translateY: "-50%",
          translateX: "-50%",
        }}
        animate={{ rotate: "1turn" }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute h-[344px] w-[344px] md:h-[580px] md:w-[580px] border rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
      >
        {/* Blob 1, 2 and 3*/}
        <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-2 w-2 left-1/2 bg-white rounded-full top-0 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-5 w-5 left-full border border-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full"></div>
        </div>
      </motion.div>
      {/* Ring 2 */}
      <motion.div
        animate={{
          rotate: "-1turn",
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ translateY: "-50%", translateX: "-50%" }}
        className="absolute h-[444px] md:h-[780px] rounded-full w-[444px] md:w-[780px] border border-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed "
      ></motion.div>

      {/* Ring 3 */}
      <motion.div
        animate={{
          rotate: "-1turn",
        }}
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ translateY: "-50%", translateX: "-50%" }}
        className="absolute h-[544px] md:h-[980px] rounded-full w-[544px] md:w-[980px] border border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
      >
        <div className="absolute h-2 w-2 left-0 bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute h-2 w-2 left-full bg-white rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
