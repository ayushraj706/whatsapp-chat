'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Loader2, X, Users, Paperclip } from "lucide-react";

// Naye chhote components import kiye hain
import { MediaUpload } from "./media-upload";
import { UserInfoDialog } from "./user-info-dialog";
import { TemplateSelector } from "./template-selector";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, onUpdateName, broadcastGroupName, isTyping = false 
}: any) {
  const [messageInput, setMessageInput] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [refreshingUrls, setRefreshingUrls] = useState<Set<string>>(new Set());
  const [loadingMedia, setLoadingMedia] = useState<Set<string>>(new Set());
  const [audioDurations, setAudioDurations] = useState<{ [key: string]: number }>({});
  const [audioCurrentTime, setAudioCurrentTime] = useState<{ [key: string]: number }>({});
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sendingMedia, setSendingMedia] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // 🚀 SAFED PARDA (CRASH) FIX
  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || broadcastGroupName || "BaseKey User";
  const initials = displayName.substring(0, 2).toUpperCase();

  let statusText = "Online";
  if (isTyping) {
    statusText = "typing...";
  } else if (selectedUser?.last_active) {
    try {
      statusText = `last seen today at ${new Date(selectedUser.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {}
  }

  // 🚀 DOUBLE MESSAGE & LEFT-SIDE BUG FIX
  const cleanMessages = messages.filter((msg: any, index: number, arr: any[]) => {
    const isOpt = msg.isOptimistic || (msg.id && String(msg.id).startsWith('optimistic'));
    if (isOpt) {
      const hasReal = arr.some(m => !m.isOptimistic && !(m.id && String(m.id).startsWith('optimistic')) && m.content === msg.content);
      return !hasReal; 
    }
    return true;
  });

  const uniqueMessages = cleanMessages.filter((msg: any, index: number, self: any[]) => 
    index === self.findIndex((t) => t.id === msg.id)
  );

  // Group messages by Date
  const groupedMessages = uniqueMessages.reduce((groups: { [key: string]: any[] }, message) => {
    const date = new Date(message.timestamp || Date.now()).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [uniqueMessages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && (selectedUser || broadcastGroupName) && !isLoading) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleSendMedia = async (mediaFiles: any[]) => {
    if ((!selectedUser && !broadcastGroupName) || sendingMedia) return;
    if (broadcastGroupName) {
      alert('Media upload to broadcast groups is not yet supported. Please send text messages only.');
      return;
    }
    setSendingMedia(true);
    try {
      const formData = new FormData();
      formData.append('to', selectedUser.id);
      mediaFiles.forEach((mediaFile) => {
        formData.append('files', mediaFile.file);
        formData.append('captions', mediaFile.caption || '');
      });
      const response = await fetch('/api/send-media', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to send media');
    } catch (error) {
      alert(`Failed to send media`);
    } finally {
      setSendingMedia(false);
      setShowMediaUpload(false);
    }
  };

  const handleSendTemplate = async (templateName: string, templateData: any, variables: any) => {
    if (broadcastGroupName) {
      onSendMessage(JSON.stringify({ type: 'template', templateName, templateData, variables, displayMessage: `Template: ${templateName}` }));
      return;
    }
    try {
      await fetch('/api/send-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedUser.id, templateName, templateData, variables }),
      });
    } catch (error) {
      console.error('Error sending template:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Welcome Screen
  if (!selectedUser && !broadcastGroupName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] border-l border-[#30363d]">
        <MessageCircle className="h-24 w-24 text-gray-600 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-400 mb-2">Welcome to BaseKey</h2>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-l border-[#30363d] relative">
      
      {/* Header */}
      <div className="p-3 bg-[#161b22] border-b border-[#30363d] flex items-center gap-3 z-20">
        {isMobile && onBack && <button onClick={onBack} className="p-2 text-gray-400 hover:text-white"><ArrowLeft size={20} /></button>}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#2ea44f] text-white font-semibold">{broadcastGroupName ? <Users size={20} /> : initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 cursor-pointer" onClick={() => !broadcastGroupName && setShowUserInfo(true)}>
          <h2 className="font-semibold text-white text-base leading-tight">{displayName}</h2>
          <p className={`text-xs ${isTyping ? 'text-[#2ea44f] font-medium italic' : 'text-gray-400'}`}>{broadcastGroupName ? "Broadcast Mode" : statusText}</p>
        </div>
        {!isMobile && onClose && <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>}
      </div>

      {/* Messages Area with Doodle */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 relative custom-scrollbar" style={{ backgroundColor: '#0d1117' }}>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundRepeat: 'repeat', backgroundSize: '350px', opacity: 0.1 }}></div>

        <div className="relative z-10 space-y-4">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="bg-[#161b22] text-gray-400 text-xs px-4 py-1.5 rounded-full border border-[#30363d] shadow-sm">{date}</span>
              </div>
              <div className="space-y-2">
                {dayMessages.map((msg: any) => {
                  const isOpt = msg.isOptimistic || (msg.id && String(msg.id).startsWith('optimistic'));
                  const isOwn = isOpt ? true : msg.is_sent_by_me;

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                      <MessageBubble 
                        message={msg}
                        isOwn={isOwn}
                        isOptimistic={isOpt}
                        formatTime={formatTime}
                        isRefreshing={refreshingUrls.has(msg.id)}
                        isMediaLoading={loadingMedia.has(msg.id)}
                        handleMediaLoad={() => setLoadingMedia(prev => { const n = new Set(prev); n.delete(msg.id); return n; })}
                        handleMediaLoadStart={() => setLoadingMedia(prev => new Set(prev).add(msg.id))}
                        refreshMediaUrl={async () => { /* Add refresh logic if needed */ }}
                        downloadMedia={async () => { /* Add download logic if needed */ }}
                        playingAudio={playingAudio}
                        handleAudioPlay={() => {}}
                        audioDuration={audioDurations[msg.id]}
                        audioCurrentTime={audioCurrentTime[msg.id]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (File 2 ka component) */}
      <ChatInput 
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        sendingMedia={sendingMedia}
        broadcastGroupName={broadcastGroupName}
        setShowMediaUpload={setShowMediaUpload}
        setShowTemplateSelector={setShowTemplateSelector}
      />

      {/* Modals from Original Developer */}
      {selectedUser && <MediaUpload isOpen={showMediaUpload} onClose={() => setShowMediaUpload(false)} onSend={handleSendMedia} selectedUser={selectedUser} />}
      {(selectedUser || broadcastGroupName) && (
        <TemplateSelector isOpen={showTemplateSelector} onClose={() => setShowTemplateSelector(false)} onSendTemplate={handleSendTemplate} selectedUser={selectedUser || { id: 'broadcast', name: broadcastGroupName, last_active: new Date().toISOString() }} />
      )}
      {selectedUser && <UserInfoDialog isOpen={showUserInfo} onClose={() => setShowUserInfo(false)} user={selectedUser} onUpdateName={onUpdateName || (async () => {})} />}
    </div>
  );
}
