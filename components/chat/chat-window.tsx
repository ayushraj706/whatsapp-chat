'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { MediaUpload } from "./media-upload";
import { TemplateSelector } from "./template-selector";
import { Video, X, MoreVertical } from "lucide-react";

export function ChatWindow({ selectedUser, messages = [], onSendMessage, isLoading, broadcastGroupName }: any) {
  const [messageInput, setMessageInput] = useState("");
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Screen ko niche scroll karne ke liye
  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !selectedUser) return;
    
    // Parent component (Dashboard) ko message bhejne ke liye bolna
    if (onSendMessage) {
      await onSendMessage(text);
    }
  };

  const displayName = selectedUser?.name || selectedUser?.whatsapp_name || "Unknown";
  const displayImage = selectedUser?.image || "/placeholder.png";

  return (
    <div className="h-full flex flex-col bg-[#0b141a] relative">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
           style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}>
      </div>

      {/* Header */}
      <div className="p-3 bg-[#202c33] flex justify-between items-center z-10">
        <div className="flex gap-3 items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={displayImage} className="object-cover" />
            <AvatarFallback className="bg-[#00a884] text-white">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-[#e9edef] font-medium">{displayName}</p>
            <p className="text-[11px] text-[#8696a0]">
              {selectedUser?.is_online ? "online" : "click here for info"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[#aebac1]">
          <Video size={22} className="cursor-pointer hover:text-[#e9edef]" />
          <MoreVertical size={22} className="cursor-pointer hover:text-[#e9edef]" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar z-10">
        <div className="space-y-1">
          {messages.map((msg: any, idx: number) => {
            // FIX: Agar message content Meta ka technical ID ho, toh use mat dikhao
            if (msg.content && msg.content.length > 15 && !msg.content.includes(" ")) {
              if (msg.content.match(/^[a-zA-Z0-9]+$/)) return null; 
            }

            return (
              <MessageBubble 
                key={msg.id || idx} 
                message={msg} 
                isOwn={msg.is_sent_by_me} 
                formatTime={(t: any) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="z-20">
        <ChatInput 
          onSendMessage={handleSend} 
          isLoading={isLoading} 
          setShowMediaUpload={setShowMediaUpload}
          setShowTemplateSelector={setShowTemplateSelector}
        />
      </div>

      {/* Modals from your existing dashboard */}
      {showMediaUpload && (
        <MediaUpload 
          isOpen={showMediaUpload} 
          onClose={() => setShowMediaUpload(false)} 
          selectedUser={selectedUser} 
        />
      )}
      {showTemplateSelector && (
        <TemplateSelector 
          isOpen={showTemplateSelector} 
          onClose={() => setShowTemplateSelector(false)} 
          selectedUser={selectedUser} 
        />
      )}
    </div>
  );
}
