'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bell, Lock, Smile } from 'lucide-react';
import { useClassroomStore } from '@/lib/store';
import { colyseusService } from '@/lib/colyseus';

const QUICK_REACTIONS = ['👏', '👍', '❤️', '💡', '🙋', '🎉'];

export function RightSidebar() {
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');
  const [inputText, setInputText] = useState('');
  const [isAnnouncementMode, setIsAnnouncementMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useClassroomStore((s) => s.messages);
  const isChatLocked = useClassroomStore((s) => s.isChatLocked);
  const myRole = useClassroomStore((s) => s.myRole);
  const mySessionId = useClassroomStore((s) => s.mySessionId);

  const isTeacher = myRole === 'teacher';
  const canSend = isTeacher || !isChatLocked;

  const announcements = messages.filter((m) => m.isAnnouncement);
  const displayedMessages = activeTab === 'announcements' ? announcements : messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (isTeacher && isAnnouncementMode) {
      colyseusService.sendAnnouncement(text);
      setIsAnnouncementMode(false);
    } else {
      colyseusService.sendChat(text);
    }
    setInputText('');
  };

  const handleReactionClick = (emoji: string) => {
    colyseusService.sendReaction(emoji);
  };

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-3.5rem-4.5rem)] select-none z-20 shadow-lg">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-800 p-1.5 gap-1 bg-slate-950/60">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'chat'
              ? 'bg-slate-800 text-indigo-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Class Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'announcements'
              ? 'bg-slate-800 text-amber-400 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Announcements</span>
          {announcements.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              {announcements.length}
            </span>
          )}
        </button>
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {displayedMessages.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
            <p>
              {activeTab === 'announcements'
                ? 'No teacher announcements yet.'
                : 'No messages yet. Say hello to the class!'}
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isMe = msg.senderId === mySessionId;
            const isTeacherMsg = msg.senderRole === 'teacher';

            return (
              <div
                key={msg.id}
                className={`p-2.5 rounded-lg text-xs transition-all ${
                  msg.isAnnouncement
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-100 shadow-sm'
                    : isMe
                    ? 'bg-indigo-900/30 border border-indigo-700/40 ml-4'
                    : 'bg-slate-800/60 border border-slate-700/40 mr-4'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-200">
                      {msg.senderName} {isMe && '(You)'}
                    </span>
                    <span
                      className={`text-[8px] font-bold uppercase px-1 py-0.2 rounded ${
                        isTeacherMsg
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {msg.senderRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-300 select-text break-words leading-relaxed">
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions Bar */}
      <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-1">
        <span className="text-[10px] text-slate-500 font-medium">Reactions:</span>
        <div className="flex items-center gap-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              className="p-1 text-sm rounded hover:bg-slate-800 transition-transform active:scale-125"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Message Composer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        {!canSend ? (
          <div className="p-2 rounded bg-slate-800/70 border border-slate-700 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Chat is currently locked by the teacher.</span>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-2">
            {isTeacher && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnnouncementMode}
                    onChange={(e) => setIsAnnouncementMode(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Send as Official Announcement</span>
                </label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAnnouncementMode ? 'Post announcement to class...' : 'Type message to class...'}
                maxLength={400}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </aside>
  );
}
