"use client";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar7 from "@/assets/avatar-7.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.png";
import Image from "next/image";
import { motion } from "framer-motion";
const testimonials = [
  {
    text: "“Love what Arhaan has done here. The impact was immediate - it's transformed how I work!”",
    name: "Arya Toufanian",
    title: "Founder/CEO of Cita Marketplace",
    avatarImg: avatar7,
  },
  {
    text: "“The user interface is so intuitive and easy to use, it helps me organize my notes and tasks efficiently.”",
    name: "Maria Victoria",
    title: "Upcoming student @ Harvard University",
    avatarImg: avatar5,
  },
  {
    text: "“This tool has greatly assisted me in organizing my tasks and staying on track.”",
    name: "Jamie Lee",
    title: "Student @ UC Berkeley",
    avatarImg: avatar2,
  },
  {
    text: "“Lyra has been a game changer for me and my friends. It's easy to use and has saved us countless hours.”",
    name: "Sophia Perez",
    title: "Student @ Georgia Tech",
    avatarImg: avatar1,
  },
  {
    text: "“Since I began using Lyra, my time management has improved remarkably.”",
    name: "Alec Whitten",
    title: "Upcoming student @ MIT",
    avatarImg: avatar4,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl md:text-6xl text-center tracking-tighter font-medium">
          Beyond Expectations.
        </h2>
        <p className="text-white/70 md:text-xl text-lg max-w-sm mx-auto text-center mt-5 tracking-tight">
        Our revolutionary AI-powered tools are redefining how students and professionals organize, learn, and achieve their goals
        </p>
        <div className="flex overflow-hidden mt-10 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
          <motion.div
            initial={{ translateX: "-50%" }}
            animate={{ translateX: "0%" }}
            transition={{
              duration: 45,
              ease: "linear",
              repeat: Infinity,
            }}
            className="flex gap-5 pr-5 flex-none"
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
