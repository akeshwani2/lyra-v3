"use client";
import React from "react";
import acmeLogo from "@/assets/logo-acme.png";
import apexLogo from "@/assets/logo-apex.png";
import celestialLogo from "@/assets/logo-celestial.png";
import quantumLogo from "@/assets/logo-quantum.png";
import pulseLogo from "@/assets/logo-pulse.png";
import echoLogo from "@/assets/logo-echo.png";
import denverlogo from "@/assets/duLogo.png";
import berkleylogo from "@/assets/berk2-removebg-preview.png";
import harvardlogo from "@/assets/harvardtest.png";
import dukeLogo from "@/assets/dukelogo_white.png";
import mitLogo from "@/assets/mit_logo_std_rgb_white.png";

import { motion } from "framer-motion";
import Image from 'next/image';

const LogoTicker = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="flex items-center gap-5">
          <div className="flex-1 md:flex-none">
            <h2>Revolutionizing productivity for users around the world</h2>
          </div>
          <div className="flex flex-1 overflow-hidden items-center [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div 
              initial={{ translateX: '-50%'}}
              animate={{ translateX: '0' }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="flex flex-none items-center justify-center gap-20 pr-20"
            >
              {[
                mitLogo,
                quantumLogo,
                dukeLogo,
                pulseLogo,
                denverlogo,
                acmeLogo,
                mitLogo,
                dukeLogo,
                quantumLogo,
                pulseLogo,
                denverlogo,
                acmeLogo,
              ].map((logo, index) => (
                <div key={`${logo.src}-${index}`} className="flex items-center justify-center h-20">
                  <Image
                    src={logo.src}
                    alt=""
                    width={logo === mitLogo ? 100 : 80}
                    height={0}
                    className={`w-auto ${logo === mitLogo ? 'h-10' : 'h-8'} object-contain`}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoTicker;
