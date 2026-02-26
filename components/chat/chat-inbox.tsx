import React from 'react';
import { Check, CheckCheck, Send } from 'lucide-react';

const ChatInbox = ({ messages }) => {
  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <h2 className="text-white font-semibold">SuperKey Inbox</h2>
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg text-sm relative ${
              msg.isMe ? 'bg-[#2ea44f] text-white' : 'bg-[#21262d] text-gray-200'
            }`}>
              {msg.text}
              
              {/* WhatsApp Ticks Logic */}
              {msg.isMe && (
                <div className="flex justify-end mt-1 space-x-1">
                  {msg.status === 'sent' && <Check size={14} className="text-gray-200/60" />}
                  {msg.status === 'delivered' && <CheckCheck size={14} className="text-gray-200/60" />}
                  {msg.status === 'read' && <CheckCheck size={14} className="text-blue-300" />}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area (GitHub Style) */}
      <div className="p-4 bg-[#161b22] border-t border-[#30363d] flex gap-2">
        <input 
          type="text" 
          placeholder="Type a message..."
          className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#2ea44f]"
        />
        <button className="bg-[#2ea44f] hover:bg-[#2c974b] p-2 rounded-md text-white transition-colors">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInbox;
