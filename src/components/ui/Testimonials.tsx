"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import mike1 from "@/assets/mike.png";
import avatar6 from "@/assets/image.png";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const testimonials = [
  {
    text: "“Love what Arhaan has done here. The impact was immediate - it's transformed how I work!”",
    name: "Arya Toufanian",
    title: "Founder/CEO of Cita Marketplace",
    avatarImg: avatar7,
  },

  {
    text: "“This feels like a combination of Notion and Obsidian, except everything is in one place and free!”",
    name: "Maria Victoria",
    title: "Upcoming student @ Harvard University",
    avatarImg: avatar5,
  },
  {
    text: "“Lyra has been a game changer for me and my friends. It's easy to use and has saved us countless hours.”",
    name: "Jenna Laine",
    title: "Student @ Georgia Tech",
    avatarImg: avatar1,
  },
  {
    text: "“I love the UI, it's very modern and I like the AI PDF reader, it's easy to use and very helpful.”",
    name: "Michael Pressman",
    title: "Student @ Baylor University/CEO of TCR",
    avatarImg: mike1,
  },
  {
    text: "“I love the Scribe feature! I don't have to worry about taking notes anymore.”",
    name: "Alex Sanchez",
    title: "News Editor @ Channel 4 KFOR",
    avatarImg: avatar6,
  },
];

export const Testimonials = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      translateX: "0%",
      transition: {
        duration: 45,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }, [controls]);

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl md:text-6xl text-center tracking-tighter font-medium">
          Beyond Expectations.
        </h2>
        <p className="text-white/70 md:text-xl text-lg max-w-sm mx-auto text-center mt-5 tracking-tight">
          Lyra is actively helping hundreds of users transform and streamline their academic lives
        </p>
        <div className="flex overflow-hidden mt-10 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
          <motion.div
            initial={{ translateX: "-50%" }}
            animate={controls}
            drag="x"
            dragConstraints={{ left: -1500, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            whileDrag={{ cursor: "grabbing" }}
            whileHover={{ cursor: "grab" }}
            onMouseDown={() => controls.stop()}
            onMouseUp={() => {
              controls.start({
                translateX: "0%",
                transition: {
                  duration: 45,
                  ease: "linear",
                  repeat: Infinity,
                },
              });
            }}
            onTouchStart={() => controls.stop()}
            onTouchEnd={() => {
              controls.start({
                translateX: "0%",
                transition: {
                  duration: 45,
                  ease: "linear",
                  repeat: Infinity,
                },
              });
            }}
            className="flex gap-5 pr-5 flex-none touch-none"
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="border-white/15 border p-6 md:p-10 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)] max-w-xs md:max-w-md flex-none"
              >
                <div className="text-lg tracking-tight md:text-2xl">
                  {testimonial.text}
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <div className="relative after:content-[''] after:absolute after:inset-0 after:bg-[rgba(140,69,244,0.7)] after:mix-blend-soft-light before:content-[''] before:absolute before:inset-0 before:border before:border-white/30 before:z-10 before:rounded-lg">
                    <Image
                      src={testimonial.avatarImg}
                      alt=""
                      className="h-11 w-11 rounded-lg grayscale border border-white/30"
                    />
                  </div>
                  <div className="">
                    <div>{testimonial.name}</div>
                    <div className="text-white/50 text-sm">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
