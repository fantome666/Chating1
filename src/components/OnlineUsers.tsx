import { useEffect, useState } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { Users } from 'lucide-react';

export function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_online', true)
        .order('username');

      if (data) {
        setOnlineUsers(data);
      }
    };

    fetchOnlineUsers();

    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
        <h2 className="font-semibold text-gray-900 dark:text-white">
          En ligne ({onlineUsers.length})
        </h2>
      </div>

      <div className="space-y-2">
        {onlineUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        ))}

        {onlineUsers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Aucun utilisateur en ligne
          </p>
        )}
      </div>
    </div>
  );
}
