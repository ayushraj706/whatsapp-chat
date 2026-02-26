'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft, X, Check, CheckCheck, MessageCircle, Clock } from "lucide-react";

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, broadcastGroupName,
  isTyping = false 
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

  // Last Seen Logic
  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || broadcastGroupName || "BaseKey User";
  const initials = displayName.substring(0, 2).toUpperCase();

  let statusText = "Offline";
  if (isTyping) {
    statusText = "typing...";
  } else if (selectedUser?.last_active) {
    try {
      const date = new Date(selectedUser.last_active);
      statusText = `last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      statusText = "Online";
    }
  } else {
    statusText = "Online";
  }

  // 🚀 DOUBLE MESSAGE FIX (Ultimate Logic)
  let cleanMessages = messages.filter((msg: any, index: number, arr: any[]) => {
    // Check agar ye message 'optimistic' (fake/temporary) hai
    const isOpt = msg.isOptimistic || (msg.id && String(msg.id).startsWith('optimistic'));
    if (isOpt) {
      // Agar isi text ka 'asli' message Supabase se aa chuka hai, toh is fake wale ko hata do
      const hasReal = arr.some(m => !m.isOptimistic && !(m.id && String(m.id).startsWith('optimistic')) && m.content === msg.content);
      return !hasReal; 
    }
    return true;
  });

  // Ek final check taaki same ID wale message do baar na dikhein
  const uniqueMessages = cleanMessages.filter((msg: any, index: number, self: any[]) => 
    index === self.findIndex((t) => t.id === msg.id)
  );

  // Welcome Screen
  if (!selectedUser && !broadcastGroupName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0b141a] border-l border-[#222e35]">
        <MessageCircle className="h-16 w-16 text-[#8696a0] mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-[#e9edef]">BaseKey Web</h2>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b141a] relative border-l border-[#222e35] w-full font-sans">
      
      {/* Header */}
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar" style={{ backgroundColor: '#0b141a' }}>
        
        {/* 🚀 BACKGROUND DOODLE FIX */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{ 
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, 
            backgroundRepeat: 'repeat',
            backgroundSize: '350px', // Pattern ko thoda bada kiya
            opacity: 0.12 // Opacity badha di taaki clearly dikhe
          }}
        ></div>

        <div className="relative z-10 space-y-2">
          {uniqueMessages.map((msg: any, index: number) => {
            const isOwn = msg.is_sent_by_me;
            const isOpt = msg.isOptimistic || (msg.id && String(msg.id).startsWith('optimistic'));
            
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
                } ${isOpt ? 'opacity-80' : 'opacity-100'}`}>
                  
                  <p className="leading-relaxed break-words">{msg.content || msg.text || "Media/Template Message"}</p>
                  
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[11px] min-w-[50px] opacity-70">
                    <span>{timeString}</span>
                    
                    {isOwn && (
                      <span className="ml-0.5">
                        {isOpt ? (
                          <Clock size={12} className="text-[#8696a0]" /> // Sending
                        ) : msg.status === 'read' || msg.is_read ? (
                          <CheckCheck size={14} className="text-[#53bdeb]" /> // Blue Ticks
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={14} className="text-[#8696a0]" /> // Double Gray
                        ) : (
                          <Check size={14} className="text-[#8696a0]" /> // Single Gray
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
