import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export interface NotificationPayload {
  orderNumber: string;
  customerEmail: string;
  totalAmount: string;
  placedAt: string;
  message: string;
}

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef<Client | null>(null);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const playSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio playback blocked or failed', e);
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    console.log('[WebSocket] useEffect triggered. User:', user);
    if (!user || user.role !== UserRole.ADMIN) {
      console.log('[WebSocket] Connection aborted. Reason: User is either null or not ADMIN.');
      return;
    }

    const token = getCookie('accessToken');
    console.log('[WebSocket] Token retrieved from cookie:', token ? 'Exists' : 'Missing (null)');
    if (!token) {
      console.log('[WebSocket] Connection aborted. Reason: accessToken is missing.');
      return;
    }

    const backendUrl = import.meta.env.VITE_API_BACKEND_URL;
    if (!backendUrl) {
      console.warn('[WebSocket] VITE_API_BACKEND_URL is not defined in .env');
      return;
    }

    const socketUrl = `${backendUrl.replace(/\/$/, '')}/ws`;
    console.log('[WebSocket] Target Socket URL:', socketUrl);

    const client = new Client({
      webSocketFactory: () => {
        console.log('[WebSocket] Initiating SockJS connection to:', socketUrl);
        return new SockJS(socketUrl);
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('[STOMP DEBUG]', str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WebSocket] STOMP connected successfully.');
        client.subscribe('/user/queue/notifications', (message) => {
          console.log('[WebSocket] Message received:', message.body);
          if (message.body) {
            try {
              const payload = JSON.parse(message.body) as NotificationPayload;
              setNotifications((prev) => [payload, ...prev]);
              setUnreadCount((prev) => prev + 1);
              
              playSound();

              toast.custom((t) => (
                <div
                  className={`${
                    t.visible ? 'animate-enter' : 'animate-leave'
                  } max-w-sm w-full bg-white dark:bg-zinc-900 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}
                >
                  <div 
                    className="flex-1 w-0 p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-l-2xl"
                    onClick={() => {
                      toast.dismiss(t.id);
                      navigate(`/admin/orders/${payload.orderNumber}`);
                    }}
                  >
                    <div className="flex items-start">
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {payload.message}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Order: <span className="font-semibold">{payload.orderNumber}</span>
                        </p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          Total: {payload.totalAmount}
                        </p>
                        <p className="mt-1 text-xs text-accent-dark font-medium cursor-pointer">
                          Customer: {payload.customerEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-accent-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ), { duration: 5000 });

            } catch (err) {
              console.error('[WebSocket] Error parsing notification payload', err);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP Broker reported error: ' + frame.headers['message']);
        console.error('[WebSocket] Additional STOMP details: ' + frame.body);
      },
      onWebSocketError: (evt) => {
        console.error('[WebSocket] Underlying WebSocket connection error:', evt);
      },
      onDisconnect: () => {
        console.log('[WebSocket] STOMP disconnected.');
      }
    });

    try {
      client.activate();
      console.log('[WebSocket] Client activated.');
    } catch (e) {
      console.error('[WebSocket] Error activating client:', e);
    }
    
    clientRef.current = client;

    return () => {
      console.log('[WebSocket] Cleaning up hook. Deactivating client...');
      client.deactivate();
      clientRef.current = null;
    };
  }, [user, playSound]);

  return {
    notifications,
    unreadCount,
    markAllAsRead,
  };
};
