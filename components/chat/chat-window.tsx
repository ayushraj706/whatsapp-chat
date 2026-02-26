'use client'; [span_3](start_span)// Client-side rendering ke liye zaroori[span_3](end_span)

import React, { useState } from 'react';
import { Check, CheckCheck, Send, ArrowLeft, X, MessageCircle } from 'lucide-react';

[span_4](start_span)// Original Named Export maintain karna zaroori hai[span_4](end_span)
export function ChatWindow({ 
  selectedUser, 
  messages = [], 
  onSendMessage, 
  onBack, 
  onClose,
  isMobile = false 
}: any) {
  const [input, setInput] = useState("");

  [span_5](start_span)// 1. Welcome Screen Logic (Agar koi user select na ho)[span_5](end_span)
  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0d1117] text-gray-400">
        <MessageCircle size={64} className="mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-white">Welcome to BaseKey</h2>
        <p className="text-sm mt-2">Select a chat to start messaging</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim()); [span_6](start_span)// Parent function call[span_6](end_span)
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-[#30363d] w-full">
      {/* 2. Header (GitHub Style) */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button onClick={onBack} className="p-1 text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h3 className="text-white font-medium text-sm">
              [span_7](start_span){selectedUser.custom_name || selectedUser.whatsapp_name || selectedUser.name}[span_7](end_span)
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-500">Active now (Test Mode)</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      [span_8](start_span)[span_9](start_span){/* 3. Messages Area[span_8](end_span)[span_9](end_span) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 text-xs mt-20 italic">
            Start the conversation with {selectedUser.name}
          </div>
        ) : (
          messages.map((msg: any, index: number) => {
            [span_10](start_span)const isMe = msg.is_sent_by_me; // Original field name[span_10](end_span)
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  isMe ? 'bg-[#2ea44f] text-white rounded-tr-none' : 'bg-[#21262d] text-gray-200 rounded-tl-none border border-[#30363d]'
                }`}>
                  <p className="leading-relaxed">{msg.content || msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px]">
                    [span_11](start_span){new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}[span_11](end_span)
                    {isMe && (
                      <span>
                        [span_12](start_span){msg.status === 'read' ? <CheckCheck size={12} className="text-blue-400" /> : <CheckCheck size={12} />}[span_12](end_span)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      [span_13](start_span)[span_14](start_span){/* 4. Input Area[span_13](end_span)[span_14](end_span) */}
      <form onSubmit={handleSubmit} className="p-4 bg-[#161b22] border-t border-[#30363d] flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-[#2ea44f] transition-all"
        />
        <button type="submit" disabled={!input.trim()} className="bg-[#2ea44f] text-white p-2 rounded-md hover:bg-[#2c974b] disabled:opacity-50 transition-all">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
