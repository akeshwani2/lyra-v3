"use client";
import {
  DotLottieCommonPlayer,
  DotLottiePlayer,
} from "@dotlottie/react-player";
import productImage from "../../../public/assets/product-image.png";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { ValueAnimationTransition } from "framer-motion";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
// import { Dot } from "lucide-react";

const tabs = [

  {
    icon: "/assets/lottie/stars.lottie",
    title: "Event Tracking",
    description: "Real-time progress tracking with powerful filtering.",
    isNew: false,
    backgroundPositionX: 100,
    backgroundPositionY: 0,
    backgroundSizeX: 140,
  },
  {
    icon: "/assets/lottie/vroom.lottie",
    title: "Intelligent Dashboard",
    description: "Beautiful analytics and insights, designed for focus.",
    isNew: false,
    backgroundPositionX: 0,
    backgroundPositionY: 30,
    backgroundSizeX: 100,
  },
  {
    icon: "/assets/lottie/click.lottie",
    title: "Task Organization",
    description: "Effortlessly manage your workflow with smart automation.",
    isNew: true,
    backgroundPositionX: 50,
    backgroundPositionY: 0,
    backgroundSizeX: 150,
  },
];

interface FeatureTabProps extends ComponentPropsWithoutRef<'div'> {
  selected: boolean;
  icon: string;
  title: string;
  description: string;
  isNew?: boolean;
}

const FeatureTab = ({ selected, ...props }: FeatureTabProps) => {
  const tabRef = useRef<HTMLDivElement>(null);
  const dotLottieRef = useRef<DotLottieCommonPlayer>(null);

  const xPercentage = useMotionValue(0);
  const yPercentage = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(80px 80px at ${xPercentage}% ${yPercentage}%,black,transparent)`;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!tabRef.current || !selected) return;
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
  }, [selected]);

  const handleTabHover = () => {
    if (dotLottieRef.current === null) return;
    dotLottieRef.current.seek(0);
    dotLottieRef.current.play();
  };

  return (
    <div
      ref={tabRef}
      onMouseEnter={handleTabHover}
      className={`group relative overflow-hidden px-6 py-5 rounded-lg transition-all duration-300 cursor-pointer border border-white/[0.08] ${
        selected
          ? "bg-gradient-to-b from-white/[0.08] to-transparent"
          : "hover:bg-white/[0.02]"
      }`}
      onClick={props.onClick}
    >
      {selected && (
        <motion.div
          style={{ maskImage }}
          className="absolute inset-0 bg-gradient-to-r from-[#A369FF]/20 to-[#8c44ff]/20"
        />
      )}

      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <DotLottiePlayer
            ref={dotLottieRef}
            src={props.icon}
            className="h-5 w-5"
            autoplay
          />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">{props.title}</h3>
            {props.isNew && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#8c44ff]/10 text-[#8c44ff] font-medium">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-white/50">{props.description}</p>
        </div>
      </div>
    </div>
  );
};

export const Features = () => {
  const [selectedTab, setSelectedTab] = useState(1);
  const backgroundPositionX = useMotionValue(tabs[1].backgroundPositionX);
  const backgroundPositionY = useMotionValue(tabs[1].backgroundPositionY);
  const backgroundSizeX = useMotionValue(tabs[1].backgroundSizeX);
  const backgroundPosition = useMotionTemplate`${backgroundPositionX}% ${backgroundPositionY}%`;
  const backgroundSize = useMotionTemplate`${backgroundSizeX}% auto`;

  const handleSelectTab = (index: number) => {
    setSelectedTab(index);
    animate(
      backgroundSizeX,
      [backgroundSizeX.get(), 100, tabs[index].backgroundSizeX],
      { duration: 0.8, ease: "easeInOut" }
    );

    animate(
      backgroundPositionX,
      [backgroundPositionX.get(), tabs[index].backgroundPositionX],
      { duration: 0.8, ease: "easeInOut" }
    );
  };
  return (
    <section className="py-24 md:py-32">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Learn Smarter, Organize Better, Achieve More.
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">
            From students to professionals, Lyra is redefining how people organize,
            learn, and achieve their goals
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-2">
          {tabs.map((tab, index) => (
            <FeatureTab
              {...tab}
              selected={selectedTab === index}
              onClick={() => handleSelectTab(index)}
              key={tab.title}
            />
          ))}
        </div>

        <div className="mt-4 rounded-xl overflow-hidden bg-gradient-to-b from-white/[0.08] to-transparent p-px">
          <motion.div
            className="aspect-video bg-cover rounded-lg bg-black/40 border border-white/10 backdrop-blur-3xl"
            style={{
              backgroundPosition,
              backgroundSize,
              backgroundImage: `url(${productImage.src})`,
            }}
          />
        </div>
      </div>
    </section>
  );
};
