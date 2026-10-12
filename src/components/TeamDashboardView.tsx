import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import * as LucideIcons from 'lucide-react';

interface TeamDashboardViewProps {
  teamId: string;
  deptId: string;
}

export const TeamDashboardView: React.FC<TeamDashboardViewProps> = ({ teamId, deptId }) => {
  const {
    teams,
    departments,
    teamMembers,
    chatConversations,
    chatMessages,
    sendChatMessage,
    fetchConversations,
    fetchMessages,
    currentUser
  } = useProject();

  const [activeChannelType, setActiveChannelType] = useState<'private_chat' | 'public_channel' | 'notification' | 'leader_channel'>('private_chat');
  const [msgText, setMsgText] = useState('');

  const team = teams.find((t: any) => t.id === teamId);
  const dept = departments.find((d: any) => d.id === deptId);

  // Fetch conversations on load
  useEffect(() => {
    if (fetchConversations) {
      fetchConversations();
    }
  }, [teamId]);

  if (!team) return <div className="text-center py-12 text-xs text-text-secondary">تیم مورد نظر یافت نشد</div>;

  const renderIcon = (name: string, size = 16, className = "") => {
    const IconComp = (LucideIcons as any)[name] || LucideIcons.Users;
    return <IconComp size={size} className={className} />;
  };

  // Find the exact active conversation for the selected channel type
  const activeConv = chatConversations.find(
    (c: any) => c.teamId === teamId && c.channelType === activeChannelType
  );

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConv && fetchMessages) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !activeConv || !sendChatMessage) return;
    await sendChatMessage(activeConv.id, msgText);
    setMsgText('');
    if (fetchMessages) {
      fetchMessages(activeConv.id);
    }
  };

  const channelNames = {
    private_chat: 'گپ خصوصی تیمی',
    public_channel: 'کانال عمومی',
    notification: 'کانال اعلانات تیمی',
    leader_channel: 'کانال مدیران تیمی'
  };

  // Get current messages list
  const currentMessages = activeConv ? chatMessages.filter((m: any) => m.conversationId === activeConv.id) : [];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" style={{ direction: 'rtl' }}>
      {/* Right Column: Team Meta & Members (1/3 width) */}
      <div className="space-y-6">
        {/* Team Details */}
        <div className="bg-surface-primary border border-border-primary rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: team.color || '#6C63FF' }}>
              {team.avatar || team.name.substring(0, 1)}
            </div>
            <div>
              <span className="text-[10px] bg-[#6C63FF]/15 text-[#6C63FF] px-2 py-0.5 rounded-full font-bold">
                {dept?.name || 'بدون دپارتمان'}
              </span>
              <h2 className="text-sm font-black text-text-primary mt-1">{team.name}</h2>
            </div>
          </div>

          {team.description && (
            <p className="text-xs text-text-secondary leading-relaxed bg-hover-overlay p-3 rounded-lg">
              {team.description}
            </p>
          )}

          <div className="pt-3 border-t border-border-primary/50 text-[10.5px] text-text-secondary space-y-2">
            <div className="flex justify-between">
              <span>شناسه تیمی:</span>
              <span className="font-mono text-text-primary">{team.id}</span>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-surface-primary border border-border-primary rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-black text-text-primary flex items-center gap-1.5 border-b border-border-primary/50 pb-2.5">
            {renderIcon('Users', 14)}
            متخصصین و پرسنل این تیم
          </h3>

          <div className="space-y-2.5">
            {teamMembers.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between hover:bg-hover-overlay/40 p-1.5 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-hover-overlay text-text-primary font-bold flex items-center justify-center text-xs">
                    {m.name.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-text-primary">{m.name}</h4>
                    <p className="text-[9.5px] text-[#6C63FF] font-bold mt-0.5">کارشناس فنی</p>
                  </div>
                </div>

                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${m.status === 'online' ? 'bg-brand-success' : 'bg-text-secondary/50'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${m.status === 'online' ? 'bg-brand-success' : 'bg-text-secondary/50'}`}></span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Left Column: Team Chat & Channels (2/3 width) */}
      <div className="lg:col-span-2 space-y-6 flex flex-col h-[70vh]">
        {/* Channel Selector Tab Pill */}
        <div className="bg-surface-primary border border-border-primary rounded-xl p-3 flex gap-1 justify-between shrink-0">
          {(['private_chat', 'public_channel', 'notification', 'leader_channel'] as const).map(type => (
            <button
              key={type}
              onClick={() => setActiveChannelType(type)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 ${
                activeChannelType === type
                  ? 'bg-[#6C63FF] text-white shadow-md'
                  : 'text-text-secondary hover:bg-hover-overlay hover:text-text-primary'
              }`}
            >
              {type === 'private_chat' && renderIcon('Lock', 12)}
              {type === 'public_channel' && renderIcon('Megaphone', 12)}
              {type === 'notification' && renderIcon('Bell', 12)}
              {type === 'leader_channel' && renderIcon('ShieldCheck', 12)}
              {channelNames[type]}
            </button>
          ))}
        </div>

        {/* Chat Window Box */}
        <div className="bg-surface-primary border border-border-primary rounded-xl flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-hover-overlay/40 border-b border-border-primary/50 px-4 py-3 shrink-0 flex items-center justify-between">
            <h3 className="text-xs font-black text-text-primary flex items-center gap-2">
              <span className="p-1 bg-[#6C63FF]/15 text-[#6C63FF] rounded-lg">
                {activeChannelType === 'private_chat' && renderIcon('Lock', 12)}
                {activeChannelType === 'public_channel' && renderIcon('Megaphone', 12)}
                {activeChannelType === 'notification' && renderIcon('Bell', 12)}
                {activeChannelType === 'leader_channel' && renderIcon('ShieldCheck', 12)}
              </span>
              {channelNames[activeChannelType]} - {team.name}
            </h3>
            <span className="text-[9px] text-text-secondary font-bold">بستر ارتباطی اتوماتیک تیمی</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {currentMessages.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-secondary">
                هیچ پیامی در این بستر ارتباطی یافت نشد. ارسال اولین پیام را شروع کنید.
              </div>
            ) : (
              currentMessages.map((msg: any) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${isMe ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
                    <div className="w-8 h-8 rounded-full bg-hover-overlay flex items-center justify-center font-bold text-xs shrink-0 border border-border-primary/40">
                      {msg.senderAvatar || msg.senderName?.substring(0, 1)}
                    </div>
                    <div>
                      <div className={`text-[10px] text-text-secondary mb-1 flex items-center gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-bold text-text-primary">{msg.senderName}</span>
                        <span className="text-[9px] font-mono">{new Date(msg.timestamp).toLocaleTimeString('fa-IR')}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe 
                          ? 'bg-[#6C63FF] text-white rounded-tr-none' 
                          : 'bg-hover-overlay text-text-primary rounded-tl-none border border-border-primary/50'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat input form */}
          <div className="p-3 border-t border-border-primary/50 shrink-0 bg-hover-overlay/20">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="ارسال پیام به تیم فنی..."
                className="flex-1 px-4 py-2.5 bg-hover-overlay border border-border-primary/60 rounded-xl text-xs focus:outline-none focus:border-[#6C63FF] text-text-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#6C63FF] hover:bg-[#5B54E0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {renderIcon('Send', 12)}
                ارسال
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
