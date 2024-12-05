import React from 'react';
import { Message } from 'ai';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatPreviewProps {
  messages: Message[];
  pdfName: string;
}

const ChatPreview = ({ messages, pdfName }: ChatPreviewProps) => {
  // Only show last 3 messages for preview
  const previewMessages = messages.slice(-3);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-400">
          Previous Chat: {pdfName}
        </h3>
      </div>
      
      <div className="space-y-4">
        {previewMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ChatPreview;