'use client'; // Is line ke bina Next.js 15 crash ho jayega

import React from 'react';
import { Check, CheckCheck, Send } from 'lucide-react';

const ChatWindow = ({ messages = [] }) => {
  // JEE Advanced Logic: Agar messages khali hon toh bhi crash nahi hoga
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
      {/* Chat Header - GitHub Style */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-white font-semibold text-sm">BaseKey Inbox</h2>
          <span className="text-[10px] text-gray-500">Test Mode Active</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] text-gray-400">Status:</span>
           {/* Connected signal - aapke test number ke liye */}
           <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {safeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs italic space-y-2">
            <p>No messages in the database yet.</p>
            <p className="text-[10px] opacity-50">Check your Supabase connection.</p>
          </div>
        ) : (
          safeMessages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow-sm ${
                msg.isMe ? 'bg-[#2ea44f] text-white rounded-tr-none' : 'bg-[#21262d] text-gray-200 rounded-tl-none border border-[#30363d]'
              }`}>
                {msg.text}
                
                {/* WhatsApp Ticks Logic */}
                {msg.isMe && (
                  <div className="flex justify-end mt-1 -mb-1 ml-2">
                    {msg.status === 'sent' && <Check size={12} className="text-gray-200/60" />}
                    {msg.status === 'delivered' && <CheckCheck size={12} className="text-gray-200/60" />}
                    {msg.status === 'read' && <CheckCheck size={12} className="text-blue-300" />}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area - Clean GitHub Look */}
      <div className="p-3 bg-[#161b22] border-t border-[#30363d] flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..."
          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#2ea44f] transition-all"
        />
        <button className="bg-[#2ea44f] hover:bg-[#2c974b] p-2 rounded-md text-white shadow-md active:scale-95 transition-all">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
