import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5155/api';

export default function NotificationsDropdown({ collapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('ld_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('ld_token');
      await axios.post(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => 
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkRead(notif.notificationId, { stopPropagation: () => {} });
    }
    setIsOpen(false);
    // Navigate to Training if it's assignment or deadline
    if (notif.type === 'Assignment' || notif.type === 'Deadline') {
      navigate('/');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-3 rounded-xl transition-all relative ${isOpen ? 'bg-[#1a1c23]' : 'hover:bg-[#1a1c23]'}`}
        title="Notifications"
      >
        <Bell size={22} className={`transition-colors ${isOpen || unreadCount > 0 ? 'text-indigo-400' : 'text-slate-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-black" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#14151a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100]">
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-black/20">
            <h3 className="font-bold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <div 
                    key={notif.notificationId}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b border-slate-800/30 cursor-pointer transition-colors hover:bg-slate-800/50 flex gap-3 ${!notif.isRead ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-indigo-400' : 'text-slate-300'}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <button 
                            onClick={(e) => handleMarkRead(notif.notificationId, e)}
                            className="text-slate-500 hover:text-indigo-400 shrink-0"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-600 font-medium mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
