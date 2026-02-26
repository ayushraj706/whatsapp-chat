'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Send, Loader2, X, Download, FileText, 
  Image as ImageIcon, Play, Pause, RefreshCw, Volume2, Paperclip, 
  MessageSquare, Users, MessageCircle 
} from "lucide-react";
import Image from "next/image";
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
    <div className="h-full flex flex-col bg-[#0d1117] relative border-l border-[#30363d] w-full">
      
      {/* Header - GitHub Style */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <button onClick={onBack} className="p-2 text-gray-400 hover:text-white"><ArrowLeft size={20} /></button>
          )}
          <Avatar className="h-10 w-10 border border-[#30363d]">
            <AvatarFallback className="bg-[#2ea44f] text-white">
              {(selectedUser?.name || broadcastGroupName || "BK").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 cursor-pointer" onClick={() => setShowUserInfo(true)}>
            <h2 className="font-semibold text-white text-sm">
              {selectedUser?.custom_name || selectedUser?.name || broadcastGroupName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-[10px] text-gray-500">Connected (BaseKey)</span>
            </div>
          </div>
        </div>
        {!isMobile && onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        )}
      </div>

      {/* Messages Area - Refactored for Compiler Safety */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-5">
        {messages.map((msg: any, index: number) => (
          <div key={msg.id || index} className={`flex ${msg.is_sent_by_me ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-md ${
              msg.is_sent_by_me ? 'bg-[#2ea44f] text-white rounded-tr-none' : 'bg-[#21262d] text-gray-200 rounded-tl-none border border-[#30363d]'
            }`}>
              
              {/* Media: Image/Video/Audio Handlers */}
              {msg.message_type === 'image' && msg.media_data && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                  <img src={typeof msg.media_data === 'string' ? JSON.parse(msg.media_data).media_url : msg.media_data.media_url} alt="Shared" className="max-w-full h-auto" />
                </div>
              )}

              {msg.message_type === 'video' && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/10 bg-black">
                  <video controls className="w-full h-auto max-h-[300px]">
                    <source src={typeof msg.media_data === 'string' ? JSON.parse(msg.media_data).media_url : msg.media_data.media_url} />
                  </video>
                </div>
              )}

              {/* Template logic */}
              {msg.message_type === 'template' && (
                <div className="mb-2 p-2 bg-white/10 rounded border-l-2 border-white/30">
                  <p className="text-[10px] font-bold opacity-70 mb-1 italic">TEMPLATE</p>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              )}

              {/* Text Content */}
              {msg.message_type !== 'template' && (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content || msg.text}</p>
              )}

              {/* Footer: Time & Ticks */}
              <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px]">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.is_sent_by_me && (
                  <span>
                    {msg.status === 'read' ? <CheckCheck size={12} className="text-blue-300" /> : <CheckCheck size={12} />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
        <form onSubmit={handleFormSubmit} className="flex gap-2 items-center">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUpload(true)} className="text-gray-400 hover:text-[#2ea44f] p-2">
            <Paperclip size={20} />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowTemplateSelector(true)} className="text-gray-400 hover:text-[#2ea44f] p-2">
            <MessageSquare size={20} />
          </Button>
          <input 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-[#2ea44f]"
          />
          <button type="submit" disabled={!messageInput.trim() || isLoading} className="bg-[#2ea44f] hover:bg-[#2c974b] p-2 rounded-md text-white transition-all disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>

      {/* Modals */}
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
