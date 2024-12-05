'use client'
import React from 'react'
import { Message } from 'ai'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
    messages: Message[]
    isLoading: boolean
}

const MessageList = ({messages, isLoading}: Props) => {
    if (isLoading) return <div className='flex flex-col gap-2 px-4'><Loader2 className='w-4 h-4 animate-spin' /></div>
    if (!messages) return <></>

    return (
        <div className='flex flex-col gap-2 px-4'>
            {messages.map((message) => {
                const isUser = message.role === 'user'
                return (
                    <div key={message.id}
                        className={cn('flex', {
                            'justify-end': isUser,
                            'justify-start': !isUser,
                        })}
                    >
                        <div className={
                            cn('rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10', {
                                'bg-gradient-to-r from-purple-500 to-blue-500 text-white': isUser,
                                'bg-gray-800 text-white prose prose-invert max-w-none': !isUser,
                            })
                        }>
                            {isUser ? (
                                <p>{message.content}</p>
                            ) : (
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Customize heading styles
                                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props}/>,
                                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props}/>,
                                        h3: ({node, ...props}) => <h3 className="text-md font-bold mb-1" {...props}/>,
                                        // Style lists
                                        ul: ({node, ...props}) => <ul className="list-disc pl-8 space-y-1 mb-4" {...props}/>,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-8 space-y-1 mb-4" {...props}/>,
                                        // Add list item styling
                                        li: ({node, ...props}) => <li className="marker:text-white" {...props}/>,
                                        // Style code blocks
                                        code: ({node, ...props}) => (
                                            <code className="bg-gray-700 rounded px-1 py-0.5" {...props}/>
                                        ),
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default MessageList