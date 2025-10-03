import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase, Message, Profile } from '../lib/supabase';
import { ChatMessage } from './ChatMessage';
import { OnlineUsers } from './OnlineUsers';
import { Send, LogOut, Moon, Sun, Menu, X } from 'lucide-react';

export function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        setMessages(data);
        const userIds = [...new Set(data.map(m => m.user_id))];
        await fetchProfiles(userIds);
      }
    };

    const fetchProfiles = async (userIds: string[]) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (data) {
        const profileMap = new Map(data.map(p => [p.id, p]));
        setProfiles(profileMap);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          if (!profiles.has(newMsg.user_id)) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMsg.user_id)
              .maybeSingle();

            if (data) {
              setProfiles((prev) => new Map(prev).set(data.id, data));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || !user) return;

    setLoading(true);
    try {
      await supabase.from('messages').insert({
        user_id: user.id,
        content: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-800 shadow-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chat App</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <aside
          className={`${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-20 w-64 h-[calc(100vh-73px)] transition-transform duration-300 p-4`}
        >
          <OnlineUsers />
        </aside>

        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <main className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const profile = profiles.get(message.user_id);
                if (!profile) return null;

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    profile={profile}
                    isOwnMessage={message.user_id === user?.id}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
