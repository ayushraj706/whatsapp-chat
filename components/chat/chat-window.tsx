'use client'; [span_6](start_span)// Sabse zaroori line[span_6](end_span)

import React, { useState } from 'react';
import { Check, CheckCheck, Send, ArrowLeft, X } from 'lucide-react';

[span_7](start_span)// Original Props ko maintain karna zaroori hai[span_7](end_span)
export function ChatWindow({ 
  selectedUser, 
  messages = [], 
  onSendMessage, 
  onBack, 
  onClose,
  isMobile = false 
}: any) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim()); [span_8](start_span)// Original function call[span_8](end_span)
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center gap-3">
        {isMobile && onBack && (
          <button onClick={onBack} className="p-2 hover:bg-[#30363d] rounded-full text-white">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-white font-semibold text-sm">
            {selectedUser?.custom_name || selectedUser?.name || "BaseKey Chat"}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[10px] text-gray-400">Connected</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-[#30363d] rounded-full text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[url('https://github.com/fluidicon.png')] bg-fixed bg-center bg-no-repeat bg-opacity-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs italic">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg: any, index: number) => {
            [span_9](start_span)[span_10](start_span)// Original field 'is_sent_by_me' use karna zaroori hai[span_9](end_span)[span_10](end_span)
            const isMe = msg.is_sent_by_me; 
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  isMe ? 'bg-[#2ea44f] text-white rounded-tr-none' : 'bg-[#21262d] text-gray-200 rounded-tl-none border border-[#30363d]'
                }`}>
                  {msg.content || msg.text}
                  <div className="flex justify-end mt-1 -mb-1 ml-2 items-center gap-1 opacity-70">
                    <span className="text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <>
                        {msg.status === 'read' ? <CheckCheck size={12} className="text-blue-300" /> : <CheckCheck size={12} />}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#161b22] border-t border-[#30363d] flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#2ea44f]"
        />
        <button type="submit" className="bg-[#2ea44f] hover:bg-[#2c974b] p-2 rounded-md text-white transition-all active:scale-90">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
