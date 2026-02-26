'use client';

import React, { useEffect, useRef } from 'react';
// Chatscope ki in-built professional CSS
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
import { MessageCircle } from 'lucide-react';

export function ChatWindow({ 
  selectedUser, messages = [], onSendMessage, onBack, onClose, 
  isMobile = false, isLoading = false, broadcastGroupName,
  isTyping = false 
}: any) {

  // 🚀 HY BUG FIX: Message hamesha Right Side rahega aur duplicate nahi hoga
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

  // Send Message Logic
  const handleSend = (innerHtml: string, textContent: string) => {
    if (textContent.trim() && !isLoading) {
      onSendMessage(textContent.trim());
    }
  };

  // Welcome Screen
  if (!selectedUser && !broadcastGroupName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0b141a]">
        <MessageCircle className="h-16 w-16 text-gray-500 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-white">BaseKey Web</h2>
        <p className="text-sm text-gray-400 mt-2">Professional UI Loaded</p>
      </div>
    );
  }

  // Name and Status Logic
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

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MainContainer>
        <ChatContainer>
          
          {/* Header Component */}
          <ConversationHeader>
            {isMobile && onBack && <ConversationHeader.Back onClick={onBack} />}
            <ChatAvatar name={initials} />
            <ConversationHeader.Content userName={displayName} info={statusText} />
            <ConversationHeader.Actions>
              {onClose && <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '10px'}}>✕</button>}
            </ConversationHeader.Actions>
          </ConversationHeader>

          {/* Messages List Component */}
          <MessageList typingIndicator={isTyping ? <TypingIndicator content={`${displayName} is typing`} /> : null}>
            
            {uniqueMessages.map((msg: any, i: number) => {
              // 🚀 HY BUG FIX 2: Optimistic messages hamesha 'outgoing' (Right) rahenge
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

          {/* Chatscope Input Field Component */}
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
