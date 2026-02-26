'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Paperclip, MessageSquare } from "lucide-react";

export function ChatInput({ onSendMessage, isLoading, setShowMediaUpload, setShowTemplateSelector, broadcastGroupName }: any) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="p-3 bg-[#202c33] flex items-center gap-2">
      <Button type="button" variant="ghost" size="icon" onClick={() => setShowMediaUpload(true)} className="text-[#8696a0] hover:text-[#e9edef]">
        <Paperclip size={20} />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => setShowTemplateSelector(true)} className="text-[#8696a0] hover:text-[#e9edef]">
        <MessageSquare size={20} />
      </Button>
      <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="bg-[#2a3942] border-none text-[#e9edef] focus-visible:ring-0 rounded-lg" />
        <Button type="submit" disabled={!input.trim() || isLoading} className="bg-[#00a884] hover:bg-[#008f6f] rounded-full p-2 h-10 w-10">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
        </Button>
      </form>
    </div>
  );
}
