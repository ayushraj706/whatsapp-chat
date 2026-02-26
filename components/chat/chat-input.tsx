'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Paperclip, MessageSquare } from "lucide-react";

export function ChatInput({
  messageInput,
  setMessageInput,
  handleSendMessage,
  isLoading,
  sendingMedia,
  broadcastGroupName,
  setShowMediaUpload,
  setShowTemplateSelector
}: any) {
  return (
    <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
      <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
        
        {/* Hide media button in broadcast mode, show template button */}
        {!broadcastGroupName && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaUpload(true)}
            className="p-2 hover:bg-[#30363d] text-gray-400 rounded-full transition-colors"
            title="Attach media"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        )}
        
        {/* Template button available for both modes */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowTemplateSelector(true)}
          className="p-2 hover:bg-[#30363d] text-gray-400 rounded-full transition-colors"
          title="Send template"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={
            isLoading || sendingMedia 
              ? "Sending..." 
              : broadcastGroupName 
                ? "Type broadcast message..." 
                : "Type a message..."
          }
          className="flex-1 bg-[#0d1117] border-[#30363d] text-white focus:border-[#2ea44f] focus:ring-[#2ea44f] rounded-full px-4 py-2"
          maxLength={1000}
          disabled={isLoading || sendingMedia}
        />

        <Button 
          type="submit" 
          disabled={!messageInput.trim() || isLoading || sendingMedia}
          className="bg-[#2ea44f] hover:bg-[#2c974b] text-white px-6 py-2 rounded-full disabled:opacity-50 transition-all"
        >
          {isLoading || sendingMedia ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
