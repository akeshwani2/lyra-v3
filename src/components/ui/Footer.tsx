"use client";
import React from "react";
import Logo from "@/assets/logo.svg";
import Image from "next/image";
import { Github, Linkedin, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Footer = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleNavigation = (path: string) => {
    if (!isSignedIn) {
      sessionStorage.setItem("redirectPath", path);
      router.push("/sign-in");
      return;
    }
    router.push(path);
  };

  return (
    <footer className="py-5 border-t border-white/15">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex items-center gap-2 lg:flex-1">
            <Link href="/">
              <Logo className="h-6 w-6" />
            </Link>
            <div className=""> Lyra. All Rights Reserved.</div>
          </div>

          <nav className="flex flex-col lg:flex-row gap-5 lg:gap-7 lg:flex-1 lg:justify-center">
            <button
              onClick={() => handleNavigation("/tasks")}
              className="text-xs md:text-sm hover:text-white transition text-white/70 text-left"
            >
              Features
            </button>
            <a
              href="/developer"
              className="text-xs md:text-sm hover:text-white transition text-white/70"
            >
              Developer
            </a>
            <Link
              href="/changelog"
              className="text-xs md:text-sm hover:text-white transition text-white/70"
            >
              Changelog
            </Link>
            <Link
              href="/faq"
              className="text-xs md:text-sm hover:text-white transition text-white/70"
            >
              FAQ
            </Link>
            <a
              href="/contact"
              className="text-xs md:text-sm hover:text-white transition text-white/70"
            >
              Contact
            </a>
          </nav>
          <div className="flex gap-5 lg:flex-1 lg:justify-end">
            <Github
              className=" text-white/40 hover:text-white transition"
              onClick={() =>
                window.open("https://github.com/akeshwani2", "_blank")
              }
            />
            <Linkedin
              className=" text-white/40 hover:text-white transition"
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/arhaan-keshwani",
                  "_blank"
                )
              }
            />
            <User
              className=" text-white/40 hover:text-white transition"
              onClick={() =>
                window.open("https://ak-port.vercel.app", "_blank")
              }
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
