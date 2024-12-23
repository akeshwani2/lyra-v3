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
      <main className="container mx-auto px-8 py-24">
        <div className="mx-auto space-y-40">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-6xl md:leading-none font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text text-center sm:pb-2 pb-1">
              What&apos;s New in Lyra
            </h1>
            <p className="text-xl text-white/70">
              All the new updates and improvements to Lyra.
            </p>
            <p className="flex items-center justify-center text-sm gap-1 text-white/70">
              Made with <Heart className="w-4 h-4 text-white fill-white" /> by
              Arhaan keshwani
            </p>
          </div>

          {/* Changelog Entries */}
          <div className="space-y-36">
            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="block text-base text-white/50">
                  December 23, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text ">
                  New UI for the Scribe page
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I decided to redesign the Scribe page to make it more modern
                  and user-friendly. The time limit still exists, but in the
                  future, I will remove it. Future features will include
                  document sharing functionalities, no time limit, and a folder structure for your notes.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(scribeImageUi.src)}
              >
                <Image
                  src={scribeImageUi.src}
                  alt="ScribeUIImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
            <hr className="border-t border-white/20 my-12" />

            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="block text-base text-white/50">
                  December 13, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text ">
                  New UI for the tasks page
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I completely redesigned the tasks page to make it more modern
                  and user-friendly. The calendar now shows all of your future
                  assignments. The "Upload Syllabus" button will not work just
                  yet, but it will in the future.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(productImage.src)}
              >
                <Image
                  src={productImage.src}
                  alt="ScribeUIImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
            <hr className="border-t border-white/20 my-12" />

            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="block text-base text-white/50">
                  December 4, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text ">
                  Time limit on Scribe
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I decided to add a 5 minute time limit to Scribe. This is to
                  prevent users from using it for too long and getting
                  overwhelmed. I understand that 5 minutes is not a lot of time
                  by any means, but I think it&apos;s a good compromise between
                  the user getting a good summary and not having to wait too
                  long. In the near future, I will increase this time limit up
                  to 60 minutes.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(scribeImage2.src)}
              >
                <Image
                  src={scribeImage2.src}
                  alt="ScribeUIImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
            <hr className="border-t border-white/20 my-12" />

            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="block text-base text-white/50">
                  December 3, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text ">
                  Updated UI for the tasks page
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I updated the UI for the tasks page to make it more modern and
                  user-friendly. The old UI was starting to look a bit outdated
                  and I wanted to give it a fresh look.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(dashImage.src)}
              >
                <Image
                  src={dashImage.src}
                  alt="dashImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text">
                  New UI for Scribe
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I changed the UI for Scribe to make it more minimalistic and
                  user-friendly. I realized that the old UI was a bit too
                  bright/distracting and made it harder to read.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(productImage.src)}
              >
                <Image
                  src={productImage.src}
                  alt="productImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
            <hr className="border-t border-white/20 my-12" />

            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="block text-base text-white/50">
                  December 2, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text">
                  Redesigned landing page
                </h2>
                <p className="text-white/70 leading-relaxed">
                  This week I improved a few features that weren&apos;t quite
                  living up to their potential. They each had small limitations
                  that were annoying and prevented me and some users from using
                  them well, or at all. I decided to give the landing page a
                  makeover to make it more modern and user-friendly.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(bgImage.src)}
              >
                <Image
                  src={bgImage.src}
                  alt="bgImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
            <hr className="border-t border-white/20 my-12" />

            {/* <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="block text-base text-white/50">
                  December 1, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text">
                  A Heartfelt Thank You to the Users
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Thank you to all of you incredible users who have embraced
                  Lyra! Your support and feedback have been invaluable in
                  shaping my journey. I am committed to continuously improving
                  and enhancing your experience, and I couldn&apos;t have done it
                  without you. Your enthusiasm inspires me every day to innovate
                  and create a better platform for everyone.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(userImage.src)}
              >
                <Image src={userImage.src} alt="userImage" />
              </div>
            </article>

            <hr className="border-t border-white/20 my-12" /> */}

            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="text-base text-white/50">
                  November 29, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tight">
                  AI-powered note-taking
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I have added a new feature that allows you to take notes using
                  AI. When stuck on a topic or don&apos;t have time to take
                  notes, you can use the AI to enhance your notes for you simply
                  by clicking a button.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(noteImage.src)}
              >
                <Image
                  src={noteImage.src}
                  alt="noteImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>

            <hr className="border-t border-white/20 my-12" />

            <article className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <time className="text-base text-white/50">
                  November 20, 2024
                </time>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Introducing Scribe
                </h2>
                <p className="text-white/70 leading-relaxed">
                  I have added a new feature called Scribe. Scribe is a tool
                  that allows you to summarize/transcribe your lectures into a
                  single document. This is a great tool for students who want to
                  quickly summarize their lectures for review or for note-taking
                  and when they don&apos;t have time to take notes during class.
                </p>
              </div>
              <div
                className="border border-white/20 p-4 rounded-xl mt-3 lg:mt-0 cursor-pointer hover:border-white/40 transition-colors"
                onClick={() => setSelectedImage(scribeImage.src)}
              >
                <Image
                  src={scribeImage.src}
                  alt="scribeImage"
                  width={800}
                  height={600}
                />
              </div>
            </article>
          </div>
          <hr className="border-t border-white/20 my-12" />
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
