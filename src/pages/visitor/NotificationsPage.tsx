import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MessageSquare, Info, ArrowRight } from 'lucide-react';
import { VisitorHeader } from '../../components/VisitorHeader';
import { getGuestId, getNotifications, markAllNotificationsRead } from '../../utils/localStorage';
import type { AppNotification } from '../../types';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 1) return '방금 전';
  if (diffH < 24) return `${Math.floor(diffH)}시간 전`;
  if (diffH < 48) return '어제';
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const guestId = getGuestId();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications(guestId));
    markAllNotificationsRead(guestId);
  }, [guestId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <VisitorHeader />

      <div className="max-w-sm mx-auto px-4 pt-6 pb-20">
        <h1 className="text-base font-bold text-gray-900 mb-1">알림</h1>
        <p className="text-xs text-gray-400 mb-5">이 기기에서 받은 알림 내역이에요</p>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">아직 알림이 없어요</p>
            <p className="text-xs text-gray-300 mt-1">
              문의 답변이 오면 여기서 알려드릴게요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Link
                key={n.id}
                to={n.threadId ? '/messages' : (n.boothId ? `/scan/${n.boothId}` : '#')}
                className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === 'reply' ? 'bg-brand-100' : 'bg-gray-100'
                }`}>
                  {n.type === 'reply' ? (
                    <MessageSquare className="w-4 h-4 text-brand-600" />
                  ) : (
                    <Info className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                  <p className="text-xs text-gray-300 mt-1.5">{formatTime(n.createdAt)}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
