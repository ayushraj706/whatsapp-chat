'use client';

import React from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, ImageIcon, Play, Pause, RefreshCw, Volume2, Check, CheckCheck, Clock } from "lucide-react";

export function MessageBubble({ message, isOwn, isOptimistic, formatTime, isMediaLoading, handleMediaLoad, handleMediaLoadStart, playingAudio, handleAudioPlay, audioDuration = 0, audioCurrentTime = 0 }: any) {
  const messageType = message.message_type || 'text';
  let mediaData: any = null;
  if (message.media_data) {
    try { mediaData = typeof message.media_data === 'string' ? JSON.parse(message.media_data) : message.media_data; } catch (e) {}
  }

  // WhatsApp Dark Theme classes for old project
  const baseClasses = `max-w-[85%] px-3 py-2 rounded-xl shadow-sm ${
    isOwn ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none ml-auto' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none mr-auto'
  } ${isOptimistic ? 'opacity-70' : ''}`;

  return (
    <div className={baseClasses}>
      {messageType === 'text' && <p className="text-[14.5px] leading-relaxed break-words">{message.content}</p>}
      
      {/* Media Rendering (Image/Video/Audio/Template logic from your original code) */}
      {messageType === 'image' && mediaData?.media_url && (
        <div className="mb-1 relative rounded-lg overflow-hidden">
          <Image src={mediaData.media_url} alt="Image" width={300} height={200} className="rounded-lg cursor-pointer" onClick={() => window.open(mediaData.media_url, '_blank')} />
        </div>
      )}

      {/* Ticks & Time */}
      <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[11px]">
        <span>{formatTime(message.timestamp)}</span>
        {isOwn && (
          <span className="ml-0.5">
            {isOptimistic ? <Clock size={12} /> : (message.status === 'read' || message.is_read) ? <CheckCheck size={14} className="text-[#53bdeb]" /> : <Check size={14} />}
          </span>
        )}
      </div>
    </div>
  );
}
