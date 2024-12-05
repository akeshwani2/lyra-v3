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

      {/* Start Planet */}
      <div className="absolute h-64 w-64 md:h-96 md:w-96 bg-purple-500 rounded-full border border-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(50%_50%_at_16.8%_18.3%,white,rgb(184,148,255)_37.7%,rgb(24,0,66))] shadow-[-20px_-20px_50px_rgb(255,255,255,.5),-20px_-20px_80px_rgb(255,255,255,.1),0_0_50px_rgb(140,69,255)]"></div>
      {/* End Planet */}

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

      <div className="container relative mt-8">
        <h1 className="text-8xl md:text-[168px] md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-center sm:pb-3.5 md:pb-6 lg:pb-8">
          Lyra
        </h1>
        <p className="text-lg md:text-xl text-white/70 mt-5 text-center max-w-xl mx-auto">
          Streamline your workflow effortlessly with AI-powered tools that
          enhance productivity, optimize learning, and simplify your tasks
        </p>
        <div className="flex flex-col items-center justify-center mt-6">
          <button
            className="relative py-2 px-3 rounded-lg font-medium text-sm bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] transition-all duration-300 hover:scale-105 hover:shadow-[0px_0px_16px_#8c45ff]"
            onClick={() =>
              isSignedIn ? router.push("/tasks") : router.push("/sign-in")
            }
          >
            <div className="absolute inset-0">
              <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>

              <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>

              <div className="absolute inset-0 shadow-[0_0_10px_rgb(140,69,255.7)_inset] rounded-lg"></div>
            </div>
            <span className="relative z-10">
              {isSignedIn ? (
                `Welcome ${
                  user?.username || user?.firstName
                    ? user?.username || user?.firstName
                    : "back"
                }!`
              ) : (
                <>Explore Lyra</>
              )}
            </span>

          </button>
          <div className="text-white/70 flex mt-6 px-4 py-2 border border-white/15 rounded-full justify-center items-center gap-1 text-sm font-medium">
            <div className="relative w-6 flex items-center justify-center">
              <Dot className="absolute w-8 h-8 font-bold text-green-500 scale-125" />
            </div>
            Secured $5K in seed funding
          </div>

        </div>
      </div>
    </motion.section>
  );
};

export default Hero;
