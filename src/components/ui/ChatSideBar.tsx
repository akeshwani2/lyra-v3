'use client'
import { DrizzleChat } from '@/app/lib/db/schema'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './button'
import { MessageCircleIcon, PlusCircle, ArrowLeftIcon, MessageCircle, Trash2, Loader2 } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import LogoIcon from "@/assets/logo.svg";

type Props = {
    chats: DrizzleChat[],
    chatId: number,
}

const ChatSideBar = ({chats, chatId}: Props) => {
    const { user, isSignedIn, isLoaded } = useUser();
    const [deletingChatId, setDeletingChatId] = useState<number | null>(null);
    const router = useRouter();

    const deleteChat = async (chatIdToDelete: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this chat?')) {
            return;
        }
        
        try {
            setDeletingChatId(chatIdToDelete);
            const response = await fetch(`/api/chat/${chatIdToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete chat');
            }

            toast.success('Chat deleted successfully');

            // Trigger refresh in other components
            localStorage.setItem('chat-deleted', Date.now().toString());
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'chat-deleted',
                newValue: Date.now().toString()
            }));

            if (chatIdToDelete === chatId) {
                const currentIndex = chats.findIndex(chat => chat.id === chatIdToDelete);
                const nextChat = chats[currentIndex + 1] || chats[currentIndex - 1];

                if (nextChat) {
                    router.push(`/chat/${nextChat.id}`);
                } else {
                    router.push('/ai-pdf');
                }
            } else {
                router.refresh();
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error deleting chat');
            console.error('Error deleting chat:', error);
        } finally {
            setDeletingChatId(null);
        }
    };

    return (
        <div className='w-full h-screen p-4 text-muted-foreground bg-zinc-950 flex flex-col'>
            {/* Header section */}
            <div className='flex flex-row items-center mb-6'>
                <Link href='/ai-pdf' className='flex flex-row items-center'>
                <div className='border h-14 w-14 rounded-lg inline-flex items-center justify-center border-white/15'>
                    <LogoIcon className="w-12 h-12 text-white" />
                </div>

                <div className="text-4xl ml-4 font-bold tracking-tighter bg-white bg-[radial-gradient(100%_100%_at_top_left,white,white,rgb(74,72,138,.5))] text-transparent bg-clip-text">
                Lyra
                    </div>
                </Link>
            </div>
            <Link href='/ai-pdf'>
                <Button className='w-full border-dashed border-2 border-muted-foreground hover:border-purple-400 rounded-xl cursor-pointer bg-transparent p-4 mb-2 flex flex-row items-center justify-center'>
                    <PlusCircle className='mr-2 w-4 h-4' />
                    New Chat
                </Button>
            </Link>

            <div className="flex-1 overflow-y-auto mt-4 ">
                <div className="flex flex-col gap-6">
                    {chats.map((chat) => (
                        <Link key={chat.id} href={`/chat/${chat.id}`}>
                            <div className={`flex items-center justify-between p-4 hover:bg-gray-800/50 bg-zinc-800/50 rounded-lg transition-all duration-300 ${
                                chat.id === chatId 
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-400/30' 
                                    : ''
                            }`}>
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <MessageCircleIcon className={`w-4 h-4 flex-shrink-0 ${
                                        chat.id === chatId 
                                            ? 'text-white' 
                                            : ''
                                    }`} />
                                    <p className={`text-sm truncate ${
                                        chat.id === chatId 
                                            ? 'text-white font-medium' 
                                            : 'text-gray-200'
                                    }`}>
                                        {chat.pdfName}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => deleteChat(chat.id, e)}
                                    className={`p-1 rounded-md hover:bg-red-500/20 hover:text-red-500 transition-all duration-300 flex-shrink-0 ml-2 ${
                                        chat.id === chatId ? 'text-white hover:text-red-200' : ''
                                    } ${
                                        deletingChatId === chat.id ? 'cursor-not-allowed opacity-50' : ''
                                    }`}
                                    disabled={deletingChatId === chat.id}
                                >
                                    {deletingChatId === chat.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 hover:text-red-500" />
                                    )}
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer with username on the right */}
            <div className='mt-2 pt-2 border-t border-gray-800 bg-zinc-950'>
                <div className='flex items-center justify-start gap-2 p-1 rounded-lg bg-zinc-800/50'>
                    {isLoaded && (
                        <UserButton 
                            afterSignOutUrl="/"
                            appearance={{
                                baseTheme: dark,
                                elements: {
                                    avatarBox: "w-8 h-8",
                                    userButtonTrigger: "p-1",
                                    userButtonPopoverCard: "min-w-[240px]"
                                }
                            }}
                        />
                    )}
                    {isLoaded && isSignedIn && (
                        <span className="bg-gradient-to-t from-zinc-600 via-zinc-300 to-white text-transparent bg-clip-text text-lg font-bold">
                            {user?.username || user?.firstName || ''}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatSideBar