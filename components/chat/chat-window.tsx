'use client'; [span_0](start_span)// Next.js 15 Client Directive[span_0](end_span)

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Send, Loader2, X, Download, FileText, 
  Image as ImageIcon, Play, Pause, RefreshCw, Volume2, Paperclip, 
  MessageSquare, Users, MessageCircle 
} from "lucide-react";
import { MediaUpload } from "./media-upload";
import { UserInfoDialog } from "./user-info-dialog";
import { TemplateSelector } from "./template-selector";

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, onUpdateName, broadcastGroupName 
}: any) {
  
  const [messageInput, setMessageInput] = useState("");
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  [span_1](start_span)// Auto-scroll logic[span_1](end_span)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  [span_2](start_span)// Safe Name Logic[span_2](end_span)
  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || selectedUser?.id || "Unknown";

  if (!selectedUser && !broadcastGroupName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-gray-500">
        <MessageCircle size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-white">Welcome to BaseKey</h2>
        <p className="text-sm mt-2">Select a chat to start messaging</p>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && !isLoading) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] relative border-l border-[#30363d] w-full font-sans">
      
      {/* Header - GitHub Style */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <button onClick={onBack} className="p-2 text-gray-400 hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          )}
          <Avatar className="h-10 w-10 border border-[#30363d]">
            <AvatarFallback className="bg-[#2ea44f] text-white font-bold">
              {displayName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 cursor-pointer" onClick={() => setShowUserInfo(true)}>
            <h2 className="font-semibold text-white text-sm">{displayName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[10px] text-gray-500">Connected (BaseKey)</span>
            </div>
          </div>
        </div>
        {!isMobile && onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
        )}
      </div>

      [span_3](start_span){/* Messages Area - Heavy Safety Added [cite: 96-100] */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-5 custom-scrollbar">
        {messages && messages.map((msg: any, index: number) => {
          [cite_start]// Safety: Check ownership and content[span_3](end_span)
          const isOwn = msg.is_sent_by_me;
          
          [span_4](start_span)// Safety: Date formatting protection[span_4](end_span)
          let timeString = "";
          try {
            if (msg.timestamp) {
              timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) { timeString = "Error"; }

          return (
            <div key={msg.id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-md transition-all ${
                isOwn ? 'bg-[#2ea44f] text-white rounded-tr-none' : 'bg-[#21262d] text-gray-200 rounded-tl-none border border-[#30363d]'
              }`}>
                
                [span_5](start_span){/* Media Logic with JSON Protection [cite: 97-100] */}
                {msg.message_type === 'image' && msg.media_data && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/10 cursor-pointer">
                     <img 
                      src={typeof msg.media_data === 'string' ? JSON.parse(msg.media_data).media_url : msg.media_data.media_url} 
                      alt="Media" 
                      className="max-w-full h-auto hover:scale-105 transition-transform" 
                    />
                  </div>
                )}

                {msg.message_type === 'video' && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-white/10 bg-black">
                    <video controls className="w-full h-auto max-h-[300px]">
                      <source src={typeof msg.media_data === 'string' ? JSON.parse(msg.media_data).media_url : msg.media_data.media_url} />
                    </video>
                  </div>
                )}

                [cite_start]{/* Template Rendering[span_5](end_span) */}
                {msg.message_type === 'template' && (
                  <div className="mb-2 p-2 bg-white/10 rounded border-l-2 border-[#2ea44f]">
                    <p className="text-[10px] font-bold text-[#2ea44f] mb-1">WHATSAPP TEMPLATE</p>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                )}

                {/* Text Content */}
                {msg.message_type !== 'template' && (
                  <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content || msg.text || "Empty message"}</p>
                )}

                [span_6](start_span){/* Footer: Time & Status[span_6](end_span) */}
                <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px]">
                  <span>{timeString}</span>
                  {isOwn && (
                    <span>
                      {msg.is_read ? <CheckCheck size={12} className="text-blue-400" /> : <Check size={12} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      [span_7](start_span){/* Input Area - Full Features [cite: 231-240] */}
      <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
        <form onSubmit={handleFormSubmit} className="flex gap-2 items-center">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUpload(true)} className="text-gray-400 hover:text-[#2ea44f] p-2 hover:bg-[#30363d] rounded-full transition-colors">
            <Paperclip size={20} />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowTemplateSelector(true)} className="text-gray-400 hover:text-[#2ea44f] p-2 hover:bg-[#30363d] rounded-full transition-colors">
            <MessageSquare size={20} />
          </Button>
          <input 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-[#2ea44f] transition-all"
          />
          <button type="submit" disabled={!messageInput.trim() || isLoading} className="bg-[#2ea44f] hover:bg-[#2c974b] p-2 rounded-md text-white transition-all disabled:opacity-50 shadow-md active:scale-95">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>

      [cite_start]{/* Modals [cite: 242-246] */}
      {selectedUser && (
        <>
          <MediaUpload isOpen={showMediaUpload} onClose={() => setShowMediaUpload(false)} onSend={() => {}} selectedUser={selectedUser} />
          <TemplateSelector isOpen={showTemplateSelector} onClose={() => setShowTemplateSelector(false)} onSendTemplate={() => {}} selectedUser={selectedUser} />
          <UserInfoDialog isOpen={showUserInfo} onClose={() => setShowUserInfo(false)} user={selectedUser} onUpdateName={onUpdateName || (async () => {})} />
        </>
      )}
    </div>
  );
}
