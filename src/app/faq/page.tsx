"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/Header";
import starsBg from "@/assets/stars.png";
import bgImage from "@/assets/new-bg-image.png";
import scribeImage from "@/assets/scribe.png";
import noteImage from "@/assets/notemate.png";
import Footer from "@/components/ui/Footer";
import scribeImageUi from "../../../public/assets/test.png";
import Logo from "@/assets/logo.svg";
import userImage from "@/assets/users.png";
import dashImage from "@/assets/ui.png";
import productImage from "../../../public/assets/product-image.png";
import scribeImage2 from "@/assets/scribe-ui.png";
import { Heart } from "lucide-react";
import Image from "next/image";

// Add this new type for FAQ items
type FAQItem = {
  question: string;
  answer: string;
};

export default function ChangelogPage() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(
    scrollYProgress,
    [0, 1],
    [-300, 300]
  );

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Add state for tracking which FAQ is open
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  // Add FAQ data
  const faqs: FAQItem[] = [
    {
      question: "What is Lyra?",
      answer: "Lyra is a one-stop-shop for all your note-taking needs. It's a platform that helps you create and manage your notes with AI assistance, record and transcribe your voice, and even take notes for you in a lecture.",
    },
    {
      question: "Is there a time limit for the Scribe feature?",
      answer: "Currently, there is a time limit for the Scribe feature of 5 minutes. However, I am planning to remove this limitation in a future update.",
    },
    {
      question: "Is Lyra free to use?",
      answer: "Lyra is free to use for everyone. You can use it without any limitations.",
    },
    {
      question: "How does Scribe work?",
      answer: "Scribe uses AI to transcribe your voice and convert it into text. It then uses AI to summarize the text and create a note.",
    },
    {
      question: "How accurate is Lyra?",
      answer: "Lyra is designed to be as accurate as possible. However, the accuracy of the transcription may vary depending on the quality of the audio input.",
    },
  ];

  const ImageModal = () => {
    if (!selectedImage) return null;

    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => setSelectedImage(null)}
      >
        <Image
          src={selectedImage}
          alt="Enlarged view"
          width={1200}
          height={800}
          className="max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>
    );
  };

  return (
    <motion.div
      ref={sectionRef}
      className="min-h-screen bg-black text-white"
      style={{
        backgroundImage: `url(${starsBg.src})`,
        backgroundSize: "2000px",
        backgroundRepeat: "repeat",
        backgroundPosition: "center",
        backgroundPositionY,
      }}
      animate={{
        backgroundPositionX: [0, -2000],
      }}
      transition={{
        duration: 60,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
    >
      <Header />
      <ImageModal />

      {/* Main Content */}
      <main className="container mx-auto px-8 py-20">
        <div className="mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-6xl md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-center sm:pb-2 pb-1">
              Frequently Asked Questions
            </h1>
          </div>

          {/* Replace the existing FAQ accordion with animated version */}
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-white/20 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  <span className="transform transition-transform duration-200">
                    {openFAQ === index ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    openFAQ === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 py-4 text-white/70 border-t border-white/20">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center pt-12">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Logo className="h-6 w-6" />
            </Link>
            <div className="">Lyra. All Rights Reserved.</div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
