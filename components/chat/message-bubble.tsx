'use client';

import React from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Image as ImageIcon, Play, Pause, RefreshCw, Volume2, Check, CheckCheck, Clock } from "lucide-react";

export function MessageBubble({
  message,
  isOwn,
  isOptimistic,
  formatTime,
  isRefreshing,
  isMediaLoading,
  handleMediaLoad,
  handleMediaLoadStart,
  refreshMediaUrl,
  downloadMedia,
  playingAudio,
  handleAudioPlay,
  audioDuration = 0,
  audioCurrentTime = 0
}: any) {
  const messageType = message.message_type || 'text';
  let mediaData: any = null;

  if (message.media_data) {
    try {
      mediaData = typeof message.media_data === 'string' ? JSON.parse(message.media_data) : message.media_data;
    } catch (error) {}
  }

  // Original Developer Theme + Optimistic Fade
  const baseClasses = `max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
    isOwn ? 'bg-green-500 text-white ml-4' : 'bg-white dark:bg-muted border border-border mr-4'
  } ${isOptimistic ? 'opacity-80' : 'opacity-100'}`;

  let timeString = "";
  try {
    if (message.timestamp) timeString = formatTime(message.timestamp);
  } catch (e) {}

  const formatAudioDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // WhatsApp Ticks Logic
  const renderTicks = () => {
    if (!isOwn) return null;
    if (isOptimistic) return <Clock size={12} className="text-green-200 ml-1 inline" />;
    if (message.status === 'read' || message.is_read) return <CheckCheck size={14} className="text-blue-400 ml-1 inline" />;
    if (message.status === 'delivered') return <CheckCheck size={14} className="text-green-200 ml-1 inline" />;
    return <Check size={14} className="text-green-200 ml-1 inline" />;
  };

  switch (messageType) {
    case 'image':
      return (
        <div className={baseClasses}>
          {mediaData?.media_url && mediaData.s3_uploaded ? (
            <div className="mb-2 relative overflow-hidden rounded-xl">
              {isMediaLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center rounded-xl z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500 mb-2" />
                  <span className="text-xs text-gray-500">Loading image...</span>
                </div>
              )}
              <Image
                src={mediaData.media_url}
                alt={mediaData.caption || "Shared image"}
                width={300}
                height={200}
                className="max-w-[300px] max-h-[400px] w-auto h-auto object-cover cursor-pointer rounded-xl"
                style={{ maxWidth: '100%', height: 'auto' }}
                onClick={() => window.open(mediaData.media_url, '_blank')}
                onLoadingComplete={() => handleMediaLoad(message.id)}
                onLoadStart={() => handleMediaLoadStart(message.id)}
                onError={() => {
                  handleMediaLoad(message.id);
                  refreshMediaUrl(message.id);
                }}
              />
              {isRefreshing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl z-20">
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-2">
              <ImageIcon className="h-8 w-8 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Image</p>
                <p className="text-xs text-gray-500">Loading...</p>
              </div>
              {mediaData?.s3_uploaded === false && (
                <Button size="sm" variant="ghost" className="p-2 h-8 w-8" onClick={() => refreshMediaUrl(message.id)} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          )}
          {mediaData?.caption && <p className="text-sm whitespace-pre-wrap break-words mb-2">{mediaData.caption}</p>}
          <div className="flex justify-end items-center mt-1">
            <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-muted-foreground'}`}>{timeString}</span>
            {renderTicks()}
          </div>
        </div>
      );

    case 'document':
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2 min-w-[280px] max-w-[400px]">
            <div className={`p-3 rounded-full ${isOwn ? 'bg-green-600' : 'bg-blue-500'}`}>
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">{mediaData?.filename || 'Document'}</p>
              <p className="text-xs text-gray-500 mt-1">{mediaData?.mime_type}</p>
            </div>
            {mediaData?.media_url && mediaData.s3_uploaded && (
              <Button size="sm" variant="ghost" className={`p-2 h-10 w-10 ${isOwn ? 'hover:bg-green-600' : 'hover:bg-gray-200'}`} onClick={() => downloadMedia(mediaData.media_url!, mediaData?.filename || 'document')} disabled={isRefreshing}>
                {isRefreshing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              </Button>
            )}
            {(!mediaData?.media_url || !mediaData.s3_uploaded) && (
              <Button size="sm" variant="ghost" className={`p-2 h-10 w-10 ${isOwn ? 'hover:bg-green-600' : 'hover:bg-gray-200'}`} onClick={() => refreshMediaUrl(message.id)} disabled={isRefreshing}>
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          <div className="flex justify-end items-center mt-1">
            <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-muted-foreground'}`}>{timeString}</span>
            {renderTicks()}
          </div>
        </div>
      );

    case 'audio':
      const progress = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;
      return (
        <div className={baseClasses}>
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2 min-w-[300px] max-w-[400px]">
            <Button size="sm" variant="ghost" className={`p-3 rounded-full ${isOwn ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`} onClick={() => mediaData?.media_url && handleAudioPlay(message.id, mediaData.media_url)} disabled={!mediaData?.media_url || !mediaData.s3_uploaded || isRefreshing}>
              {isRefreshing ? <RefreshCw className="h-5 w-5 animate-spin" /> : playingAudio === message.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{mediaData?.voice ? 'Voice Message' : 'Audio'}</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${isOwn ? 'bg-green-300' : 'bg-blue-400'}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatAudioDuration(audioCurrentTime)}</span>
                  <span className="text-xs text-gray-500">{audioDuration > 0 ? formatAudioDuration(audioDuration) : '--:--'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center mt-1">
            <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-muted-foreground'}`}>{timeString}</span>
            {renderTicks()}
          </div>
        </div>
      );

    case 'video':
      return (
        <div className={baseClasses}>
          {mediaData?.media_url && mediaData.s3_uploaded ? (
            <div className="mb-2 relative overflow-hidden rounded-xl max-w-[400px] max-h-[300px]">
              {isMediaLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center rounded-xl z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500 mb-2" />
                  <span className="text-xs text-gray-500">Loading video...</span>
                </div>
              )}
              <video controls className="max-w-[400px] max-h-[300px] w-auto h-auto rounded-xl" preload="metadata" onLoadStart={() => handleMediaLoadStart(message.id)} onCanPlay={() => handleMediaLoad(message.id)} onError={() => { handleMediaLoad(message.id); refreshMediaUrl(message.id); }}>
                <source src={mediaData.media_url} type={mediaData.mime_type} />
              </video>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-2">
              <Play className="h-8 w-8 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Video</p>
                <p className="text-xs text-gray-500">Loading...</p>
              </div>
            </div>
          )}
          {mediaData?.caption && <p className="text-sm whitespace-pre-wrap break-words mb-2">{mediaData.caption}</p>}
          <div className="flex justify-end items-center mt-1">
            <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-muted-foreground'}`}>{timeString}</span>
            {renderTicks()}
          </div>
        </div>
      );

    case 'template':
      return (
        <div className={baseClasses}>
          <div className="space-y-3">
            {mediaData?.header && (
              <div>
                {mediaData.header.format === 'IMAGE' && mediaData.header.media_url ? (
                  <Image src={mediaData.header.media_url} alt="Template header" width={250} height={150} className="max-w-full h-auto object-cover rounded-lg mb-3" />
                ) : mediaData.header.text ? (
                  <p className="text-base font-semibold leading-relaxed mb-3">{mediaData.header.text}</p>
                ) : null}
              </div>
            )}
            {mediaData?.body && <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{mediaData.body.text || message.content}</p>}
            {!mediaData?.body && !mediaData?.header && <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>}
            {mediaData?.footer && <p className="text-xs opacity-75 leading-relaxed mt-2">{mediaData.footer.text}</p>}
            {mediaData?.buttons && mediaData.buttons.length > 0 && (
              <div className="mt-4 space-y-2">
                {mediaData.buttons.map((button: any, index: number) => (
                  <div key={index} className={`px-4 py-3 rounded-lg border border-opacity-30 border-current text-center font-medium cursor-pointer transition-colors ${isOwn ? 'bg-white bg-opacity-20 hover:bg-opacity-30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <span className="text-sm">{button.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end items-center mt-1">
            <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-muted-foreground'}`}>{timeString}</span>
            {renderTicks()}
          </div>
        </div>
      );

    default:
      return (
        <div className={baseClasses}>
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-muted-foreground'}`}>{timeString}</span>
            {renderTicks()}
          </div>
        </div>
      );
  }
                  }

