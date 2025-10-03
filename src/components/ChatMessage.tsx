import { Message, Profile } from '../lib/supabase';
import { formatDistanceToNow } from '../utils/dateFormat';

interface ChatMessageProps {
  message: Message;
  profile: Profile;
  isOwnMessage: boolean;
}

export function ChatMessage({ message, profile, isOwnMessage }: ChatMessageProps) {
  return (
    <div className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
        style={{ backgroundColor: profile.avatar_color }}
      >
        {profile.username.charAt(0).toUpperCase()}
      </div>

      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {profile.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(message.created_at)}
          </span>
        </div>

        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
