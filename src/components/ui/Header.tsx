"use client";
import React, { useEffect, useState } from "react";
import LogoIcon from "@/assets/logo.svg";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import MenuIcon from "@/assets/icon-menu.svg";
import Link from "next/link";


const Header = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="py-4 border-b border-white/15 md:border-none sticky top-0 z-10 backdrop-blur md:backdrop-blur-none">
      <div className="container">
        <div className="flex justify-between items-center md:border border-white/15 md:p-2.5 rounded-xl max-w-2xl mx-auto md:backdrop-blur">
          <div>
            <div className="border h-10 w-10 rounded-lg inline-flex items-center justify-center border-white/15">
              <Link href="/">
                <LogoIcon className="w-8 h-8 text-white" />
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <nav className="flex text-white/70 gap-8 text-sm">
              <button 
                onClick={() => handleNavigation("/tasks")} 
                className="hover:text-white transition"
              >
                Features
              </button>
              <a href="https://ak-port.vercel.app" target="_blank" className="hover:text-white transition">
                Developer
              </a>
              <Link href="/changelog" className="hover:text-white transition">
                Changelog
              </Link>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
            </nav>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
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
              <span className="relative z-10 text-white">
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
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden menu-button"
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mobile-menu absolute left-0 right-0 top-[calc(100%+1px)] bg-black/95 backdrop-blur border-b border-white/15">
            <nav className="container py-4 flex flex-col text-white/70 gap-4 text-sm">
              <button 
                onClick={() => {
                  handleNavigation("/tasks");
                  setIsMenuOpen(false);
                }} 
                className="hover:text-white transition text-left"
              >
                Features
              </button>
              <a href="https://ak-port.vercel.app" target="_blank" className="hover:text-white transition">
                Developer
              </a>
              <Link href="/changelog" className="hover:text-white transition">
                Changelog
              </Link>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
