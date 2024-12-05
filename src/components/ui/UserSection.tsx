"use client";

import { UserButton, useUser, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import FileUpload from "@/components/ui/FileUpload";

export default function UserSection() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="absolute top-4 right-8 flex items-center gap-4">
      <FileUpload />
      <div className="border border-white/15 rounded-xl px-2 flex items-center gap-2">
        {isLoaded && isSignedIn && (
          <span className="bg-gradient-to-t from-zinc-600 via-zinc-300 to-white text-transparent bg-clip-text text-lg md:text-xl font-bold">
            {user?.username || user?.firstName || ""}
          </span>
        )}
        {isLoaded && (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              baseTheme: dark,
              elements: {
                avatarBox: "w-10 h-10",
                userButtonTrigger: "p-2",
                userButtonPopoverCard: "min-w-[240px]",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
