import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { folderService, type UserNotification } from '../../services/folder.service';
import { notifMeta, timeAgo } from '../../lib/folderMeta';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: folderService.notifications,
    refetchInterval: 60_000,
  });

  const list = notifications as UserNotification[];
  const unread = list.filter((n) => !n.lu).length;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markRead = useMutation({
    mutationFn: (nid: string) => folderService.markRead(nid),
    onSuccess: invalidate,
  });
  const markAll = useMutation({
    mutationFn: () => folderService.markAllRead(),
    onSuccess: invalidate,
  });

  const openNotification = (n: UserNotification) => {
    if (!n.lu) markRead.mutate(n.id);
    setOpen(false);
    navigate(`/app/folders/${n.folderId}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          {/* Ancré sous la cloche, ouvert vers la droite (la sidebar est à
              gauche) : le panneau descend en bas-droite de la cloche et
              déborde dans la zone de contenu, donc entièrement visible. */}
          <div className="absolute left-0 top-full mt-2 z-40 w-[24rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                Notifications
                {unread > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </span>
              {unread > 0 && (
                <button
                  onClick={() => markAll.mutate()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline"
                >
                  <CheckCheck size={13} /> Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {list.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-gray-400">
                  Aucune notification
                </div>
              ) : (
                list.map((n) => {
                  const m = notifMeta(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`flex w-full gap-2.5 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 ${
                        n.lu ? '' : 'bg-orange-50/40'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.lu ? 'bg-transparent' : 'bg-orange-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${m.cls}`}
                            >
                              {m.label}
                            </span>
                            <span className="truncate text-xs font-medium text-gray-600">
                              {n.folderTitre}
                            </span>
                          </div>
                          <span className="shrink-0 text-[11px] text-gray-400">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className={`mt-1 line-clamp-2 break-words text-sm ${n.lu ? 'text-gray-500' : 'text-gray-700'}`}>
                          {n.message}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
