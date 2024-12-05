import React from 'react';
import { Message } from 'ai';
import { motion } from 'framer-motion';
import { MessageCircle, FileText } from 'lucide-react';
import PDFViewer from './PDFViewer';

interface PreviousSessionPreviewProps {
  messages: Message[];
  pdfName: string;
  pdfUrl: string;
}

const PreviousSessionPreview = ({ messages, pdfName, pdfUrl }: PreviousSessionPreviewProps) => {
  console.log('PreviousSessionPreview Props:', { messages, pdfName, pdfUrl });

  const previewMessages = messages.slice(-4);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto mt-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-400">
            Previous Session: {pdfName}
          </h3>
        </div>
        
        <div className="flex gap-4">
          {/* PDF Preview */}
          <div className="flex-1 h-[300px] rounded-xl overflow-hidden border border-gray-800">
            <PDFViewer pdfUrl={pdfUrl} />
          </div>

          {/* Chat Preview */}
          <div className="flex-1 rounded-xl p-4 border border-gray-800 bg-gray-900/20 max-h-[300px] overflow-y-auto">
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
                        : 'bg-gray-800/50 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviousSessionPreview;