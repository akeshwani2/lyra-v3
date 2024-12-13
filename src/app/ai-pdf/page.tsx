"use client";
import { Button } from "@/components/ui/button";
import UserSection from "@/components/ui/UserSection";
import { ArrowUpRight, Upload } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import FileUpload from "@/components/ui/FileUpload";
import ChatPreview from "@/components/ui/ChatPreview";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Message } from "ai";
import toast from "react-hot-toast";
import PreviousSessionPreview from "@/components/ui/PreviousSessionPreview";

type FileUploadRef = {
  click: () => void;
};

export default function AiPdf() {
  const router = useRouter();
  const [hasChats, setHasChats] = useState<boolean>(false);
  const [firstChatId, setFirstChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [pdfName, setPdfName] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fileInputRef = useRef<FileUploadRef>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      setIsLoading(true);
      try {
        console.log("Starting fetch preview...");
        const response = await fetch("/api/check-chats");
        const data = await response.json();
        console.log("check-chats response:", data);

        if (data.hasChats) {
          console.log("Has chats, fetching messages for chatId:", data.firstChatId);
          const messagesResponse = await fetch("/api/get-messages", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatId: data.firstChatId }),
          });
          
          const messagesData = await messagesResponse.json();
          console.log("Messages response:", messagesData);

          setPreviewMessages(messagesData || []);
          setPdfName(data.pdfName || "");
          setPdfUrl(data.pdfUrl || "");
          setHasChats(true);
          setFirstChatId(data.firstChatId);
          
          console.log("States updated:", {
            messages: messagesData,
            pdfName: data.pdfName,
            pdfUrl: data.pdfUrl,
            hasChats: true,
            firstChatId: data.firstChatId
          });
        } else {
          console.log("No chats found");
          setPreviewMessages([]);
          setPdfName("");
          setPdfUrl("");
          setHasChats(false);
          setFirstChatId(null);
        }
      } catch (error) {
        console.error("Error in fetchPreview:", error);
        toast.error("Failed to load chat preview");
      } finally {
        setIsLoading(false);
        console.log("Loading finished");
      }
    };

    fetchPreview();
  }, [refreshKey]);

  useEffect(() => {
    console.log("Current state:", {
      isLoading,
      hasChats,
      previewMessages,
      pdfName,
      pdfUrl,
      firstChatId
    });
  }, [isLoading, hasChats, previewMessages, pdfName, pdfUrl, firstChatId]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chat-deleted") {
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleChatNavigation = () => {
    if (hasChats && firstChatId) {
      router.push(`/chat/${firstChatId}`);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
        <UserSection />
      <div className="flex flex-col items-center bg-gradient-to-b from-zinc-950 to-black justify-center min-h-screen p-6">
        <div className="max-w-4xl text-center space-y-6">
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 text-transparent bg-clip-text">
              Chat with any PDF
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 font-light">
            <TypeAnimation
              sequence={[
                "Effortlessly analyze documents using AI",
                2000,
                "Get instant answers from your PDFs",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </p>
        </div>

        {!isLoading && hasChats && previewMessages.length > 0 && (
          <PreviousSessionPreview
            messages={previewMessages}
            pdfName={pdfName}
            pdfUrl={pdfUrl}
          />
        )}

        <div className="flex mt-10">
          <button
            className="relative py-2 px-4 flex flex-row items-center justify-center text-white w-full rounded-lg font-medium text-sm bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] transition-all duration-300 hover:scale-105 hover:shadow-[0px_0px_16px_#8c45ff]"
            onClick={handleChatNavigation}
            disabled={isLoading}
          >
            <div className="absolute inset-0">
              <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>

              <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>

              <div className="absolute inset-0 shadow-[0_0_10px_rgb(140,69,255.7)_inset] rounded-lg"></div>
            </div>
            {isLoading ? (
              "Loading..."
            ) : hasChats ? (
              <>
                Go to Chats
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                You haven&apos;t started any chats yet
              </>
            )}
          </button>
        </div>


      </div>
    </>
  );
}
