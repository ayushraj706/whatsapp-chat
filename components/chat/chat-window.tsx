'use client';

import React, { useState, useEffect } from 'react';
// Chatscope NPM Styles
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar as ChatAvatar,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import { MessageCircle, Loader2 } from 'lucide-react';

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, broadcastGroupName,
  isTyping = false 
}: any) {

  // 🚀 ANTI-CRASH LOCK (Hydration Fix)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Jab tak browser ready na ho, loader dikhao (Crash rokne ke liye)
  if (!isMounted) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  // Double message filter
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

  const handleSend = (innerHtml: string, textContent: string) => {
    if (textContent.trim() && !isLoading) {
      onSendMessage(textContent.trim());
    }
  };

  const displayName = selectedUser?.custom_name || selectedUser?.whatsapp_name || selectedUser?.name || broadcastGroupName || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  let statusText = "Online";
  if (isTyping) {
    statusText = "typing...";
  } else if (selectedUser?.last_active) {
    try {
      statusText = `last seen today at ${new Date(selectedUser.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {}
  }

  // Welcome Screen
  if (!selectedUser && !broadcastGroupName) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#f4f7f9' }}>
        <MessageCircle size={64} style={{ color: '#ccc', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>BaseKey Chat</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>Powered by Chatscope NPM</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MainContainer>
        <ChatContainer>
          
          <ConversationHeader>
            {isMobile && onBack && <ConversationHeader.Back onClick={onBack} />}
            <ChatAvatar name={initials} />
            <ConversationHeader.Content userName={displayName} info={statusText} />
            <ConversationHeader.Actions>
              {onClose && <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '10px'}}>✕</button>}
            </ConversationHeader.Actions>
          </ConversationHeader>

          <MessageList typingIndicator={isTyping ? <TypingIndicator content={`${displayName} is typing`} /> : null}>
            
            {uniqueMessages.map((msg: any, i: number) => {
              // 🚀 HY BUG FIX: Optimistic message hamesha RIGHT (outgoing) rahega
              const isOpt = msg.isOptimistic || (msg.id && String(msg.id).startsWith('optimistic'));
              const isOwn = isOpt ? true : msg.is_sent_by_me;
              
              let timeString = "";
              try {
                if (msg.timestamp) timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch(e){}

              return (
                <Message
                  key={msg.id || i}
                  model={{
                    message: msg.content || msg.text || "Media Message",
                    sentTime: timeString,
                    sender: isOwn ? "Me" : displayName,
                    direction: isOwn ? "outgoing" : "incoming",
                    position: "single"
                  }}
                >
                  <Message.Footer sentTime={timeString} />
                </Message>
              );
            })}
            
          </MessageList>

          <MessageInput 
            placeholder="Type your message here..." 
            onSend={handleSend} 
            disabled={isLoading}
            attachButton={false} 
          />
          
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
