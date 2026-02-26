"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle, Loader2, X, Download, FileText, Image as ImageIcon, Play, Pause, RefreshCw, Volume2, Paperclip, MessageSquare, Users } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { MediaUpload } from "./media-upload";
import { UserInfoDialog } from "./user-info-dialog";
import { TemplateSelector } from "./template-selector";

// Template interfaces
interface TemplateComponent {
  type: string;
  format?: string;
  text?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  language: string;
  components: TemplateComponent[];
}

interface ChatUser {
  id: string;
  name: string;
  custom_name?: string;
  whatsapp_name?: string;
  last_active: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  is_sent_by_me: boolean;
  message_type?: string;
  media_data?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  isOptimistic?: boolean;
}

interface MediaData {
  type: string;
  id?: string;
  mime_type?: string;
  sha256?: string;
  filename?: string;
  caption?: string;
  voice?: boolean;
  media_url?: string;
  s3_uploaded?: boolean;
  upload_timestamp?: string;
  url_refreshed_at?: string;
  template_name?: string; 
  language?: string;
  header?: {
    format: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    media_url?: string;
    text?: string;
    filename?: string; 
  };
  body?: {
    text?: string;
  };
  footer?: {
    text?: string;
  };
  buttons?: Array<{
    type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'document' | 'audio' | 'video';
  preview?: string;
  caption?: string;
}

interface ChatWindowProps {
  selectedUser: ChatUser | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  isLoading?: boolean;
  onUpdateName?: (userId: string, customName: string) => Promise<void>;
  broadcastGroupName?: string | null;
}

export function ChatWindow({ 
  selectedUser, 
  messages, 
  onSendMessage, 
  onBack, 
  onClose,
  isMobile = false,
  isLoading = false,
  onUpdateName,
  broadcastGroupName
}: ChatWindowProps) {
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
  const unreadIndicatorRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const handleSendTemplate = async (templateName: string, templateData: WhatsAppTemplate, variables: {
    header: Record<string, string>;
    body: Record<string, string>;
    footer: Record<string, string>;
  }) => {
    if (broadcastGroupName) {
      const templateMessage = `Template: ${templateName}`;
      onSendMessage(JSON.stringify({
        type: 'template',
        templateName,
        templateData,
        variables,
        displayMessage: templateMessage
      }));
      return;
    }
    
    if (!selectedUser) return;
    try {
      const response = await fetch('/api/send-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedUser.id,
          templateName,
          templateData,
          variables,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to send template');
      }
      console.log('Template sent successfully:', result);
    } catch (error) {
      console.error('Error sending template:', error);
      throw error;
    }
  };

  const unreadMessages = messages.filter(msg => !msg.is_sent_by_me && !msg.is_read);
  const firstUnreadIndex = messages.findIndex(msg => !msg.is_sent_by_me && !msg.is_read);
  const hasUnreadMessages = unreadMessages.length > 0;

  useEffect(() => {
    if (messages.length === 0) return;
    const scrollTimer = setTimeout(() => {
      if (hasUnreadMessages && firstUnreadIndex !== -1) {
        unreadIndicatorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
    return () => clearTimeout(scrollTimer);
  }, [messages.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showMediaUpload) setShowMediaUpload(false);
        else if (showTemplateSelector) setShowTemplateSelector(false);
        else if (isMobile && onBack) onBack();
        else if (!isMobile && onClose) onClose();
      }
    };
    if (selectedUser) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedUser, isMobile, onBack, onClose, showMediaUpload, showTemplateSelector]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && selectedUser) {
      setShowMediaUpload(true);
    }
  }, [selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && (selectedUser || broadcastGroupName) && !isLoading) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleSendMedia = async (mediaFiles: MediaFile[]) => {
    if ((!selectedUser && !broadcastGroupName) || sendingMedia) return;
    if (broadcastGroupName) {
      alert('Media upload to broadcast groups is not yet supported. Please send text messages only.');
      return;
    }
    if (!selectedUser) return;
    
    setSendingMedia(true);
    try {
      const formData = new FormData();
      formData.append('to', selectedUser.id);
      mediaFiles.forEach((mediaFile) => {
        formData.append('files', mediaFile.file);
        formData.append('captions', mediaFile.caption || '');
      });
      const response = await fetch('/api/send-media', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to send media');
      
      if (result.successCount > 0) console.log(`Successfully sent ${result.successCount} files`);
      if (result.failureCount > 0) alert(`Failed to send ${result.failureCount} files. Please try again.`);
    } catch (error) {
      alert(`Failed to send media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingMedia(false);
    }
  };

  const handleUpdateName = async (userId: string, customName: string) => {
    if (onUpdateName) await onUpdateName(userId, customName);
  };

  const getDisplayName = (user: ChatUser) => {
    return user.custom_name || user.whatsapp_name || user.name || user.id;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    else if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    else return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatAudioDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioPlay = (messageId: string, audioUrl: string) => {
    if (playingAudio && playingAudio !== messageId) {
      const currentAudio = audioRefs.current[playingAudio];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }
    const audio = audioRefs.current[messageId];
    if (audio) {
      if (playingAudio === messageId) {
        audio.pause();
        setPlayingAudio(null);
      } else {
        audio.play();
        setPlayingAudio(messageId);
      }
    } else {
      const newAudio = new Audio(audioUrl);
      newAudio.onloadedmetadata = () => setAudioDurations(prev => ({ ...prev, [messageId]: newAudio.duration }));
      newAudio.ontimeupdate = () => setAudioCurrentTime(prev => ({ ...prev, [messageId]: newAudio.currentTime }));
      newAudio.onended = () => {
        setPlayingAudio(null);
        setAudioCurrentTime(prev => ({ ...prev, [messageId]: 0 }));
      };
      newAudio.onerror = () => setPlayingAudio(null);
      audioRefs.current[messageId] = newAudio;
      newAudio.play();
      setPlayingAudio(messageId);
    }
  };

  const downloadMedia = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) throw new Error('Popup blocked');
      } catch (fallbackError) {
        alert('Unable to download file. Please try again or contact support.');
      }
    }
  };

  const refreshMediaUrl = async (messageId: string) => {
    if (refreshingUrls.has(messageId)) return;
    setRefreshingUrls(prev => new Set(prev).add(messageId));
    try {
      const response = await fetch('/api/media/refresh-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      if (response.ok) console.log('Media URL refreshed:', await response.json());
    } catch (error) {
      console.error('Error refreshing media URL:', error);
    } finally {
      setRefreshingUrls(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const handleMediaLoad = (messageId: string) => {
    setLoadingMedia(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  const handleMediaLoadStart = (messageId: string) => setLoadingMedia(prev => new Set(prev).add(messageId));

  const renderMessageContent = (message: Message, isOwn: boolean) => {
    const messageType = message.message_type || 'text';
    let mediaData: MediaData | null = null;

    if (message.media_data) {
      try {
        if (typeof message.media_data === 'string') {
          mediaData = JSON.parse(message.media_data);
        } else if (typeof message.media_data === 'object') {
          mediaData = message.media_data as unknown as MediaData;
        }
      } catch (error) {
        console.error('Error parsing media data:', error);
      }
    }

    // Yahan maine GitHub Dark UI classes daal di hain
    const baseClasses = `max-w-[85%] px-4 py-3 text-sm shadow-md transition-all ${
      isOwn
        ? 'bg-[#2ea44f] text-white ml-4 rounded-xl rounded-tr-none'
        : 'bg-[#21262d] text-gray-200 border border-[#30363d] mr-4 rounded-xl rounded-tl-none'
    }`;

    const isRefreshing = refreshingUrls.has(message.id);
    const isMediaLoading = loadingMedia.has(message.id);

    switch (messageType) {
      case 'image':
        return (
          <div className={baseClasses}>
            {mediaData?.media_url && mediaData.s3_uploaded ? (
              <div className="mb-2 relative overflow-hidden rounded-xl">
                {isMediaLoading && (
                  <div className="absolute inset-0 bg-[#21262d] flex items-center justify-center rounded-xl">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                )}
                <Image
                  src={mediaData.media_url}
                  alt={mediaData.caption || "Shared image"}
                  width={300}
                  height={200}
                  className="max-w-[300px] max-h-[400px] w-auto h-auto object-cover cursor-pointer rounded-xl"
                  onClick={() => window.open(mediaData.media_url, '_blank')}
                  onLoadingComplete={() => handleMediaLoad(message.id)}
                  onLoadStart={() => handleMediaLoadStart(message.id)}
                  onError={() => {
                    handleMediaLoad(message.id);
                    refreshMediaUrl(message.id);
                  }}
                  priority={false}
                  unoptimized={false}
                />
                {isRefreshing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                    <RefreshCw className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#161b22] rounded-xl mb-2">
                <ImageIcon className="h-8 w-8 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-300">Image</p>
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
                {mediaData?.s3_uploaded === false && (
                  <Button size="sm" variant="ghost" className="p-2 h-8 w-8 text-gray-400" onClick={() => refreshMediaUrl(message.id)} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            )}
            {mediaData?.caption && <p className="text-sm whitespace-pre-wrap break-words mb-2">{mediaData.caption}</p>}
            <span className={`text-xs block ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
          </div>
        );
      case 'document':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-4 p-3 bg-[#161b22] rounded-xl mb-2 min-w-[280px] max-w-[400px]">
              <div className={`p-3 rounded-full ${isOwn ? 'bg-green-600' : 'bg-[#30363d]'}`}>
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-200">{mediaData?.filename || 'Document'}</p>
                <p className="text-xs text-gray-500 mt-1">{mediaData?.mime_type}</p>
              </div>
              {mediaData?.media_url && mediaData.s3_uploaded && (
                <Button size="sm" variant="ghost" className="p-2 h-10 w-10 text-gray-400" onClick={() => downloadMedia(mediaData.media_url!, mediaData?.filename || 'document')} disabled={isRefreshing}>
                  {isRefreshing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                </Button>
              )}
              {(!mediaData?.media_url || !mediaData.s3_uploaded) && (
                <Button size="sm" variant="ghost" className="p-2 h-10 w-10 text-gray-400" onClick={() => refreshMediaUrl(message.id)} disabled={isRefreshing}>
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            <span className={`text-xs block ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
          </div>
        );
      case 'audio':
        const duration = audioDurations[message.id] || 0;
        const currentTime = audioCurrentTime[message.id] || 0;
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-4 p-4 bg-[#161b22] rounded-xl mb-2 min-w-[300px] max-w-[400px]">
              <Button size="sm" variant="ghost" className={`p-3 rounded-full ${isOwn ? 'bg-green-600' : 'bg-[#30363d]'} text-white`} onClick={() => mediaData?.media_url && handleAudioPlay(message.id, mediaData.media_url)} disabled={!mediaData?.media_url || !mediaData.s3_uploaded || isRefreshing}>
                {isRefreshing ? <RefreshCw className="h-5 w-5 animate-spin" /> : playingAudio === message.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">{mediaData?.voice ? 'Voice Message' : 'Audio'}</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-[#30363d] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${isOwn ? 'bg-green-300' : 'bg-blue-400'}`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{formatAudioDuration(currentTime)}</span>
                    <span className="text-xs text-gray-500">{duration > 0 ? formatAudioDuration(duration) : '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>
            <span className={`text-xs block ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
          </div>
        );
      case 'video':
        return (
          <div className={baseClasses}>
            {mediaData?.media_url && mediaData.s3_uploaded ? (
              <div className="mb-2 relative overflow-hidden rounded-xl max-w-[400px] max-h-[300px]">
                {isMediaLoading && (
                  <div className="absolute inset-0 bg-[#21262d] flex items-center justify-center rounded-xl z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                )}
                <video controls className="max-w-[400px] max-h-[300px] w-auto h-auto rounded-xl" preload="metadata" onLoadStart={() => handleMediaLoadStart(message.id)} onCanPlay={() => handleMediaLoad(message.id)} onError={() => { handleMediaLoad(message.id); refreshMediaUrl(message.id); }}>
                  <source src={mediaData.media_url} type={mediaData.mime_type} />
                </video>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-[#161b22] rounded-xl mb-2">
                <Play className="h-8 w-8 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-300">Video</p>
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
              </div>
            )}
            {mediaData?.caption && <p className="text-sm whitespace-pre-wrap break-words mb-2">{mediaData.caption}</p>}
            <span className={`text-xs mt-1 block ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
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
                    <div key={index} className={`px-4 py-3 rounded-lg border border-opacity-30 border-current text-center font-medium cursor-pointer transition-colors ${isOwn ? 'bg-white bg-opacity-20' : 'bg-[#30363d]'}`}>
                      <span className="text-sm">{button.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className={`text-xs mt-3 block ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
          </div>
        );
      default:
        const isOptimistic = message.id.startsWith('optimistic_');
        return (
          <div className={`${baseClasses} ${isOptimistic ? 'opacity-70' : ''} transition-opacity duration-300`}>
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs ${isOwn ? 'text-green-100' : 'text-gray-400'}`}>{formatTime(message.timestamp)}</span>
              {isOptimistic && isOwn && <span className="text-xs text-green-200 flex items-center gap-1">Sending...</span>}
            </div>
          </div>
        );
    }
  };

  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (!selectedUser && !broadcastGroupName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] border-l border-[#30363d]">
        <MessageCircle className="h-24 w-24 text-gray-600 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-400 mb-2">Welcome to BaseKey</h2>
        <p className="text-gray-500 text-center max-w-md">Select a conversation from the sidebar to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-l border-[#30363d] relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      
      {/* Chat Header - Dark Theme */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center gap-3">
        {isMobile && onBack && (
          <button onClick={onBack} className="p-2 hover:bg-[#30363d] text-gray-400 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        )}
        {broadcastGroupName ? (
          <>
            <Avatar className="h-10 w-10"><AvatarFallback className="bg-[#2ea44f] text-white font-semibold"><Users className="h-5 w-5" /></AvatarFallback></Avatar>
            <div className="flex-1">
              <h2 className="font-semibold text-white flex items-center gap-2">{broadcastGroupName}</h2>
              <p className="text-sm text-gray-400">Broadcast Mode</p>
            </div>
          </>
        ) : selectedUser ? (
          <>
            <Avatar className="h-10 w-10">
              {/* YAHI THA CRASH KA KARAN - Ab ye 100% safe hai */}
              <AvatarFallback className="bg-[#2ea44f] text-white font-semibold">
                {(selectedUser?.name || selectedUser?.whatsapp_name || selectedUser?.id || 'BK').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 cursor-pointer hover:bg-[#30363d] rounded-lg p-2 -m-2 transition-colors" onClick={() => setShowUserInfo(true)}>
              <h2 className="font-semibold text-white">{getDisplayName(selectedUser)}</h2>
              <p className="text-sm text-gray-400">
                {isLoading || sendingMedia ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : `Online (BaseKey)`}
              </p>
            </div>
          </>
        ) : null}
        {!isMobile && onClose && <button onClick={onClose} className="p-2 hover:bg-[#30363d] text-gray-400 rounded-full transition-colors"><X className="h-5 w-5" /></button>}
      </div>

      {/* Messages Area - Dark Theme */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-[#0d1117] custom-scrollbar">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                <div className="flex justify-center my-6">
                  <span className="bg-[#161b22] text-gray-400 border border-[#30363d] text-xs px-4 py-2 rounded-full shadow-sm">
                    {formatDate(dayMessages[0].timestamp)}
                  </span>
                </div>
                <div className="space-y-3">
                  {dayMessages.map((message, index) => {
                    const isOwn = message.is_sent_by_me;
                    const globalIndex = messages.findIndex(m => m.id === message.id);
                    const isFirstUnread = globalIndex === firstUnreadIndex;
                    return (
                      <div key={message.id}>
                        {isFirstUnread && hasUnreadMessages && (
                          <div ref={unreadIndicatorRef} className="flex items-center justify-center my-4">
                            <div className="flex-1 h-px bg-[#2ea44f]"></div>
                            <div className="px-3 py-1 bg-[#2ea44f] text-white text-xs font-medium rounded-full shadow-lg">{unreadMessages.length} unread</div>
                            <div className="flex-1 h-px bg-[#2ea44f]"></div>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {renderMessageContent(message, isOwn)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Dark Theme */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          {!broadcastGroupName && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowMediaUpload(true)} className="p-2 hover:bg-[#30363d] text-gray-400 rounded-full transition-colors">
              <Paperclip className="h-5 w-5" />
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowTemplateSelector(true)} className="p-2 hover:bg-[#30363d] text-gray-400 rounded-full transition-colors">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={isLoading || sendingMedia ? "Sending..." : "Type a message..."}
            className="flex-1 bg-[#0d1117] border-[#30363d] text-white focus:border-[#2ea44f] focus:ring-[#2ea44f] rounded-full px-4 py-2"
            maxLength={1000}
            disabled={isLoading || sendingMedia}
          />
          <Button type="submit" disabled={!messageInput.trim() || isLoading || sendingMedia} className="bg-[#2ea44f] hover:bg-[#2c974b] text-white px-6 py-2 rounded-full disabled:opacity-50 transition-all">
            {isLoading || sendingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-[#2ea44f] bg-opacity-20 flex items-center justify-center z-40 backdrop-blur-sm">
          <div className="bg-[#161b22] rounded-2xl p-8 shadow-2xl border-2 border-[#2ea44f] border-dashed">
            <Paperclip className="h-16 w-16 text-[#2ea44f] mx-auto mb-4" />
            <p className="text-2xl font-semibold text-white text-center mb-2">Drop files to send</p>
          </div>
        </div>
      )}

      {selectedUser && <MediaUpload isOpen={showMediaUpload} onClose={() => setShowMediaUpload(false)} onSend={handleSendMedia} selectedUser={selectedUser} />}
      {(selectedUser || broadcastGroupName) && (
        <TemplateSelector isOpen={showTemplateSelector} onClose={() => setShowTemplateSelector(false)} onSendTemplate={handleSendTemplate} selectedUser={selectedUser || { id: 'broadcast', name: broadcastGroupName || 'Broadcast Group', last_active: new Date().toISOString() }} />
      )}
      {selectedUser && <UserInfoDialog isOpen={showUserInfo} onClose={() => setShowUserInfo(false)} user={selectedUser} onUpdateName={handleUpdateName} />}
    </div>
  );
}
