'use client'

import React, { useEffect } from 'react'
import { Input } from './input'
import { useChat } from 'ai/react'
import { SendIcon } from 'lucide-react'
import { Button } from './button'
import MessageList from './MessageList'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Message } from 'ai'
type Props = {chatId: number}

const ChatComponent = ({chatId}: Props) => {
    const {data, isLoading} = useQuery({
        queryKey: ["chat", chatId],
        queryFn: async () => {
            const response = await axios.post<Message[]>('/api/get-messages', {chatId})
            return response.data
        }
    })
    const {messages, input, handleInputChange, handleSubmit} = useChat({
        api: '/api/chat',
        body: {
            chatId,
        },
        initialMessages: data || []
    })
    useEffect(() => {
        const messageContainer = document.getElementById('message-container')
        if (messageContainer) {
            messageContainer.scrollTo({top: messageContainer.scrollHeight, behavior: 'smooth'})
        }
    }, [messages])
  return (
    <div className='relative max-h-screen overflow-scroll flex flex-col h-screen bg-zinc-950' id='message-container'>
        <div className='sticky top-0 inset-x-0 p-2 bg-zinc-950/95 backdrop-blur-md h-fit border-b border-gray-800 z-50'>
            <h3 className='text-xl text-center font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text'>
                Chat
            </h3>
        </div>
        <div className="flex-1 bg-zinc-950">
            <MessageList messages={messages} isLoading={isLoading} />
        </div>
        <form className='sticky bottom-0 inset-x-0 px-4 py-6 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 flex gap-2' onSubmit={handleSubmit}>
            <Input 
                className='flex-1 bg-gradient-to-r from-purple-500 to-blue-500 focus:from-purple-500  text-white focus:to-blue-500 focus:shadow-[0_0_25px_rgba(255,255,255,0.4)] placeholder:text-white/70 border-0 ring-0 focus:ring-0 outline-none shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300'
                placeholder='Ask me anything about the PDF...' 
                value={input} 
                onChange={handleInputChange}
            />
            <Button 
                type='submit' 
                className='bg-transparent hover:text-amber-400 hover:bg-white/10 p-2 rounded-md transition-all duration-300'
            >
                <SendIcon className='w-4 h-4' />
            </Button>
        </form>
    </div>
  )
}

export default ChatComponent