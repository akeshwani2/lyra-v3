"use client";
import { uploadToS3 } from "@/app/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import React, { forwardRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { FileIcon } from "lucide-react";
import { Button } from "./button";

type FileUploadRef = {
  click: () => void;
};

const FileUpload = forwardRef<FileUploadRef>((_, ref) => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Please upload a smaller file.");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("File uploaded successfully", {
              duration: 4000,
              icon: "🎉",
              style: {
                background: "#4B0082",
                color: "#fff",
              },
            });
            router.push(`/chat/${chat_id}`);
          },
          onError: (error) => {
            toast.error("Error creating chat");
            console.log("Error creating chat", error);
            setUploading(false);
          },
        });
      } catch (error) {
        toast.error("Error uploading file to S3");
        console.error("Error uploading file to S3:", error);
        setUploading(false);
      }
    },
  });

  React.useImperativeHandle(ref, () => ({
    click: open,
  }));

  return (
    <>
      {(uploading || isPending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/90 rounded-xl">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
                Spilling tea to AI...
              </p>
              <p className="text-sm text-gray-500">
                Analyzing your PDF with our advanced AI
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div
        {...getRootProps({
          className:
            "h-full w-full flex items-center justify-center cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <button
            className="relative py-2 px-4 flex flex-row items-center justify-center text-white w-full rounded-lg font-medium text-sm bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] transition-all duration-300 hover:scale-105 hover:shadow-[0px_0px_16px_#8c45ff]"
            disabled={uploading || isPending}
          >
            <div className="absolute inset-0">
              <div className="rounded-lg border border-white/20 absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>

              <div className="rounded-lg border absolute inset-0 border-white/40 [mask-image:linear-gradient(to_top,black,transparent)]"></div>

              <div className="absolute inset-0 shadow-[0_0_10px_rgb(140,69,255.7)_inset] rounded-lg"></div>
            </div>
            Upload PDF
          </button>
        </div>
      </div>
    </>
  );
});

FileUpload.displayName = "FileUpload";

export default FileUpload;
