'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft, X, Check, CheckCheck, MessageCircle, Clock } from "lucide-react";

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, broadcastGroupName,
  isTyping = false // Naya prop typing ke liye
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

  // 1. Last Seen & Typing Logic
  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || broadcastGroupName || "BaseKey User";
  const initials = displayName.substring(0, 2).toUpperCase();

  let statusText = "Offline";
  if (isTyping) {
    statusText = "typing...";
  } else if (selectedUser?.last_active) {
    try {
      const date = new Date(selectedUser.last_active);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      statusText = `last seen today at ${timeStr}`;
    } catch (e) {
      statusText = "Online";
    }
  } else {
    statusText = "Online";
  }

  // Double Message Fix (Deduplication Logic)
  // Ye duplicate messages ko screen par do baar aane se rokega
  const uniqueMessages = messages.filter((msg: any, index: number, self: any[]) => 
    index === self.findIndex((t) => (t.id === msg.id || (t.content === msg.content && t.timestamp === msg.timestamp)))
  );

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
      
      {/* Header - WhatsApp Dark Mode */}
      <div className="p-3 bg-[#202c33] flex items-center gap-3 z-20 shadow-sm">
        {isMobile && onBack && (
          <button onClick={onBack} className="p-2 text-[#8696a0] hover:text-[#e9edef]"><ArrowLeft size={20} /></button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#00a884] text-white font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold text-[#e9edef] text-base leading-tight">{displayName}</h2>
          <p className={`text-xs ${isTyping ? 'text-[#00a884] font-medium italic' : 'text-[#8696a0]'}`}>
            {statusText}
          </p>
        </div>
        {!isMobile && onClose && (
          <button onClick={onClose} className="p-2 text-[#8696a0] hover:text-[#e9edef]"><X size={20} /></button>
        )}
      </div>

      {/* 2. Messages Area - With Doodle Background */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar" style={{ backgroundColor: '#0b141a' }}>
        
        {/* WhatsApp Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
          style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundRepeat: 'repeat' }}
        ></div>

        <div className="relative z-10 space-y-2">
          {uniqueMessages.map((msg: any, index: number) => {
            const isOwn = msg.is_sent_by_me;
            const isOptimistic = msg.isOptimistic || msg.id?.startsWith('temp_'); // Check if message is still sending
            
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
                    
                    {/* 3. Real WhatsApp Ticks Logic */}
                    {isOwn && (
                      <span className="ml-0.5">
                        {isOptimistic ? (
                          <Clock size={12} className="text-[#8696a0]" /> // Sending (Clock)
                        ) : msg.status === 'read' || msg.is_read ? (
                          <CheckCheck size={14} className="text-[#53bdeb]" /> // Read (Blue Ticks)
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={14} className="text-[#8696a0]" /> // Delivered (Double Gray)
                        ) : (
                          <Check size={14} className="text-[#8696a0]" /> // Sent (Single Gray)
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-[#202c33] flex items-center gap-2 z-20">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message"
          className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg px-4 py-3 text-[15px] focus:outline-none"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading} 
          className="bg-[#00a884] hover:bg-[#008f6f] p-3 rounded-full text-white transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1 -mt-0.5" />}
        </button>
      </form>
    </div>
  );
}
