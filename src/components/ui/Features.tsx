"use client";
import {
  DotLottieCommonPlayer,
  DotLottiePlayer,
} from "@dotlottie/react-player";
import Image from "next/image";
import productImage from "../../../public/assets/product-image.png";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { ValueAnimationTransition } from "framer-motion";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { Dot } from "lucide-react";

const tabs = [
  {
    icon: "/assets/lottie/vroom.lottie",
    title: "User-friendly dashboard",
    isNew: false,
    backgroundPositionX: 0,
    backgroundPositionY: 0,
    backgroundSizeX: 100,
  },
  {
    icon: "/assets/lottie/click.lottie",
    title: "Organize your daily tasks",
    isNew: true,
    backgroundPositionX: 50,
    backgroundPositionY: 75,
    backgroundSizeX: 160,
  },
  {
    icon: "/assets/lottie/stars.lottie",
    title: "Track Assignments at a Glance",
    isNew: false,
    backgroundPositionX: 100,
    backgroundPositionY: 0,
    backgroundSizeX: 140,
  },

];

const FeatureTab = (
  props: (typeof tabs)[number] &
    ComponentPropsWithoutRef<"div"> & { selected: boolean }
) => {
  const tabRef = useRef<HTMLDivElement>(null);
  const dotLottieRef = useRef<DotLottieCommonPlayer>(null);

  const xPercentage = useMotionValue(0);
  const yPercentage = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(80px 80px at ${xPercentage}% ${yPercentage}%,black,transparent)`;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!tabRef.current || !props.selected) return;
    xPercentage.set(0);
    yPercentage.set(0);
    const { height, width } = tabRef.current?.getBoundingClientRect();
    const circumference = height * 2 + width * 2;

    const times = [
      0,
      width / circumference,
      (width + height) / circumference,
      (width * 2 + height) / circumference,
      1,
    ];

    const options: ValueAnimationTransition = {
      times,
      duration: 4,
      ease: "linear",
      repeatType: "loop",
      repeat: Infinity,
    };
    animate(xPercentage, [0, 100, 100, 0, 0], options);

    animate(yPercentage, [0, 0, 100, 100, 0], options);
  }, [props.selected]);

  const handleTabHover = () => {
    if (dotLottieRef.current === null) return;
    dotLottieRef.current.seek(0);
    dotLottieRef.current.play();
  };

  return (
    <div
      ref={tabRef}
      onMouseEnter={handleTabHover}
      className="border border-white/15 flex p-2.5 rounded-xl gap-2.5 items-center lg:flex-1 relative"
      onClick={props.onClick}
    >
      {props.selected && (
        <motion.div
          style={{ maskImage }}
          className="absolute inset-0 -m-px rounded-xl border border-[#A369FF] "
        ></motion.div>
      )}

      <div className="h-12 w-12 border border-white/15 rounded-lg inline-flex items-center justify-center">
        <DotLottiePlayer
          ref={dotLottieRef}
          src={props.icon}
          className="h-5 w-5"
          autoplay
        />
      </div>
      <div className="font-medium">{props.title}</div>
      {props.isNew && (
        <div className="text-xs rounded-full px-1 py-0.5 bg-[#8c44ff] text-black font-semibold flex items-center">
          <Dot className="w-4 h-4 text-green-500" />
          New
        </div>
      )}
    </div>
  );
};

export const Features = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const backgroundPositionX = useMotionValue(tabs[0].backgroundPositionX);
  const backgroundPositionY = useMotionValue(tabs[0].backgroundPositionY);
  const backgroundSizeX = useMotionValue(tabs[0].backgroundSizeX);
  const backgroundPosition = useMotionTemplate`${backgroundPositionX}% ${backgroundPositionY}%`;
  const backgroundSize = useMotionTemplate`${backgroundSizeX}% auto`;

  const handleSelectTab = (index: number) => {
    setSelectedTab(index);
    animate(
      backgroundSizeX,
      [backgroundSizeX.get(), 100, tabs[index].backgroundSizeX],
      { duration: 2, ease: "easeInOut" }
    );

    animate(
      backgroundPositionX,
      [backgroundPositionX.get(), tabs[index].backgroundPositionX],
      { duration: 2, ease: "easeInOut" }
    );
  };
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl md:text-6xl font-medium text-center tracking-tighter">
          Transform the Way You Learn and Organize.
        </h2>
        <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto tracking-tight text-center mt-5">
          From students to professionals, our AI-powered platform is redefining
          how people organize, learn, and achieve their goals
        </p>
        <div className="mt-10 lg:flex-row flex flex-col gap-3">
          {tabs.map((tab, index) => (
            <FeatureTab
              {...tab}
              selected={selectedTab === index}
              onClick={() => handleSelectTab(index)}
              key={tab.title}
            />
          ))}
        </div>
        <div className="border border-white/20 p-2.5 rounded-xl mt-3">
          <motion.div
            className="aspect-video bg-cover border border-white/20 rounded-lg"
            style={{
              backgroundPosition,
              backgroundSize,
              backgroundImage: `url(${productImage.src})`,
            }}
          ></motion.div>
        </div>
      </div>
    </section>
  );
};
