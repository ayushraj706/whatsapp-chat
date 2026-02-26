'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { MediaUpload } from "./media-upload";
import { TemplateSelector } from "./template-selector";

export function ChatWindow({ selectedUser, messages = [], onSendMessage, isLoading, broadcastGroupName }: any) {
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || broadcastGroupName || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="h-full flex flex-col bg-[#0b141a] border-l border-[#222e35]">
      {/* Header */}
      <div className="p-3 bg-[#202c33] flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#00a884] text-white">{(selectedUser?.name || 'BK').substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-[#e9edef]">{displayName}</h2>
          <p className="text-xs text-[#8696a0]">{broadcastGroupName ? "Broadcast Mode" : "Online"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')` }}></div>
        <div className="relative z-10 space-y-2">
          {messages.map((msg: any, idx: number) => (
            <MessageBubble key={msg.id || idx} message={msg} isOwn={msg.is_sent_by_me} formatTime={(t: any) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} setShowMediaUpload={setShowMediaUpload} setShowTemplateSelector={setShowTemplateSelector} />

      {/* Dashboards (Connects to your existing files) */}
      {selectedUser && <MediaUpload isOpen={showMediaUpload} onClose={() => setShowMediaUpload(false)} selectedUser={selectedUser} />}
      <TemplateSelector isOpen={showTemplateSelector} onClose={() => setShowTemplateSelector(false)} selectedUser={selectedUser} />
    </div>
  );
}
