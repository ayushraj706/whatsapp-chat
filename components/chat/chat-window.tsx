'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft, X, Check, CheckCheck, MessageCircle } from "lucide-react";

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, broadcastGroupName 
}: any) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  // Safed Parda (Crash) Fix - 100% Safe Name Loading
  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || broadcastGroupName || "BaseKey User";
  const initials = displayName.substring(0, 2).toUpperCase();

  // Welcome Screen
  if (!selectedUser && !broadcastGroupName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0b141a] border-l border-[#222e35]">
        <MessageCircle className="h-16 w-16 text-[#8696a0] mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-[#e9edef]">BaseKey Web</h2>
        <p className="text-sm text-[#8696a0] mt-2">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b141a] relative border-l border-[#222e35] w-full font-sans">
      
      {/* 1. Header - WhatsApp Dark Mode */}
      <div className="p-3 bg-[#202c33] flex items-center gap-3">
        {isMobile && onBack && (
          <button onClick={onBack} className="p-2 text-[#8696a0] hover:text-[#e9edef]"><ArrowLeft size={20} /></button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#00a884] text-white font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-[#e9edef] text-base leading-tight">{displayName}</h2>
          <p className="text-xs text-[#8696a0]">Online</p>
        </div>
        {!isMobile && onClose && (
          <button onClick={onClose} className="p-2 text-[#8696a0] hover:text-[#e9edef]"><X size={20} /></button>
        )}
      </div>

      {/* 2. Messages Area - Premium UI */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a] custom-scrollbar">
        {messages.map((msg: any, index: number) => {
          const isOwn = msg.is_sent_by_me;
          
          // Safe Time Formatting
          let timeString = "";
          try {
            if (msg.timestamp) timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch (e) {}

          return (
            <div key={msg.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
              <div className={`max-w-[80%] px-3 py-1.5 text-[15px] shadow-sm relative ${
                isOwn 
                  ? 'bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none' 
                  : 'bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none'
              }`}>
                <p className="leading-relaxed break-words">{msg.content || msg.text || "Media/Template Message"}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5 opacity-70 text-[11px] min-w-[50px]">
                  <span>{timeString}</span>
                  {isOwn && (
                    <span>
                      {msg.status === 'read' || msg.is_read ? <CheckCheck size={14} className="text-[#53bdeb]" /> : <Check size={14} className="text-[#8696a0]" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-[#202c33] flex items-center gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg px-4 py-3 text-[15px] focus:outline-none"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading} 
          className="bg-[#00a884] hover:bg-[#008f6f] p-3 rounded-full text-white transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
        </button>
      </form>
    </div>
  );
}
