import React, { useState } from 'react';
import { InboxMessage } from '../types/game';
import { useToast } from './Toast';
import { Mail, MailOpen, Trash2, Calendar, CheckSquare, XSquare, MessageSquare } from 'lucide-react';

interface InboxPanelProps {
  messages: InboxMessage[];
  onMarkRead: (id: string) => void;
  onAcceptTakeover: (offerId: string, amount: number) => void;
  onRejectTakeover: (offerId: string) => void;
}

export default function InboxPanel({
  messages,
  onMarkRead,
  onAcceptTakeover,
  onRejectTakeover
}: InboxPanelProps) {
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const { show: notify } = useToast();

  const selectedMessage = messages.find((m) => m.id === selectedMsgId);

  const handleMessageClick = (msg: InboxMessage) => {
    setSelectedMsgId(msg.id);
    if (!msg.read) {
      onMarkRead(msg.id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="inbox-panel">
      {/* Messages List */}
      <div className="md:col-span-1 flex flex-col gap-2.5 bg-slate-900 border border-slate-800 p-4 rounded-2xl max-h-[500px] overflow-y-auto">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Chairman Mailbox</h3>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MailOpen className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-500 italic">No emails in inbox.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => {
              const isSelected = msg.id === selectedMsgId;
              return (
                <div
                  key={msg.id}
                  onClick={() => handleMessageClick(msg)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 relative ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500'
                      : 'bg-slate-950/50 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  {/* Unread indicator */}
                  {!msg.read && (
                    <span className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}

                  <div className={`p-2 rounded-lg ${
                    msg.read ? 'bg-slate-900 text-slate-500' : 'bg-indigo-950/40 text-indigo-400'
                  }`}>
                    {msg.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className={`text-xs truncate ${msg.read ? 'text-slate-400' : 'text-white font-bold'}`}>
                      {msg.subject}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{msg.sender}</p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono mt-1">
                      <Calendar className="w-2.5 h-2.5" />
                      Y{msg.year}, W{msg.week}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Reader */}
      <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col min-h-[300px]">
        {selectedMessage ? (
          <div className="flex flex-col h-full gap-4">
            {/* Header info */}
            <div className="border-b border-slate-950 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white font-display">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-semibold text-indigo-400">{selectedMessage.sender}</span>
                  {selectedMessage.senderRole && (
                    <span className="text-[10px] text-slate-500">({selectedMessage.senderRole})</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Year {selectedMessage.year}, Week {selectedMessage.week}
              </span>
            </div>

            {/* Email Body */}
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed flex-1">
              {selectedMessage.content}
            </div>

            {/* Interactive Takeover Actions */}
            {selectedMessage.actionType === 'takeover_offer' && selectedMessage.actionData && (
              <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl flex flex-col gap-3 mt-4">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Proposed Acquisition Offer Console
                </div>
                <p className="text-[10px] text-slate-400">
                  Accepting this offer will transfer ownership of your club to {selectedMessage.sender}. All outstanding debts are paid off automatically, and the net surplus of <span className="text-emerald-400 font-bold">£{selectedMessage.actionData.amount}M</span> will be deposited into your personal career net worth.
                </p>

                <div className="flex gap-3 mt-1.5">
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you absolutely sure you want to sell the club for £${selectedMessage.actionData.amount}M? This action is irreversible.`)) {
                        onAcceptTakeover(selectedMessage.actionData.offerId, selectedMessage.actionData.amount);
                        setSelectedMsgId(null);
                        notify('Club sold! The net proceeds have been added to your personal career wealth.', 'success');
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/10"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Accept Offer (£{selectedMessage.actionData.amount}M)
                  </button>
                  <button
                    onClick={() => {
                      onRejectTakeover(selectedMessage.actionData.offerId);
                      setSelectedMsgId(null);
                      notify('Takeover offer rejected. Bidders have withdrawn from negotiations.', 'error');
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <XSquare className="w-3.5 h-3.5" />
                    Reject Offer
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 text-slate-600">
            <Mail className="w-12 h-12 mb-3 text-slate-800" />
            <h4 className="font-bold text-sm text-slate-400">Select a message to read</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">Check back here frequently for scout requests, takeover deals, stadium updates, and commercial negotiations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
