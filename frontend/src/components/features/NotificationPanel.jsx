import { useQuery } from '@tanstack/react-query';
import {  getUserNotifications, markNotificationRead, markAllNotificationsRead  } from '@/lib/api';
import { Bell, X, Check, AlertCircle, Calendar, Pill, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const typeIcons = {
  booking_confirmation: <Calendar className="w-4 h-4 text-primary" />,
  appointment_reminder: <Bell className="w-4 h-4 text-accent" />,
  cancellation: <X className="w-4 h-4 text-destructive" />,
  doctor_leave: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  medication_reminder: <Pill className="w-4 h-4 text-purple-500" />,
  post_visit_summary: <CheckCircle className="w-4 h-4 text-green-500" />,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationPanel({ userId, onClose }) {
  const { data: notifications = [], refetch } = useQuery({ queryKey: ['notifications', userId], queryFn: () => getUserNotifications(userId), enabled: !!userId });
  const unread = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    refetch();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead(userId);
    refetch();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-card shadow-2xl border-l border-border flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Notifications</span>
            {unread > 0 && <Badge className="bg-primary text-primary-foreground">{unread}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAll} className="text-xs">
                <Check className="w-3 h-3 mr-1" /> Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 cursor-pointer hover:bg-muted/40 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{typeIcons[n.type] || <Bell className="w-4 h-4" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
