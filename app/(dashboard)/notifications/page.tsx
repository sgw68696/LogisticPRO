"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/context/NotificationContext";
import { formatDate } from "@/lib/utils";
import {
  Bell, Check, CheckCheck, Trash2,
  Package, Truck, AlertTriangle, Info,
  CheckCircle, Settings, Filter, ShieldAlert,
} from "lucide-react";

// ── Notification type config ─────────────────
const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  dot: string;
}> = {
  success: {
    icon: <CheckCircle size={15} />,
    color: 'bg-green-500/10 border-green-500/20 text-green-400',
    dot:   'bg-green-400',
  },
  warning: {
    icon: <AlertTriangle size={15} />,
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    dot:   'bg-amber-400',
  },
  error: {
    icon: <ShieldAlert size={15} />,
    color: 'bg-red-500/10 border-red-500/20 text-red-400',
    dot:   'bg-red-400',
  },
  shipment: {
    icon: <Package size={15} />,
    color: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    dot:   'bg-sky-400',
  },
  delivery: {
    icon: <Truck size={15} />,
    color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    dot:   'bg-indigo-400',
  },
  info: {
    icon: <Info size={15} />,
    color: 'bg-muted/60 border-border/60 text-muted-foreground',
    dot:   'bg-muted-foreground',
  },
};

const getTypeConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

// ── Filter buttons config ────────────────────
const FILTER_ITEMS = [
  { value: 'all',      label: 'All Notifications', icon: <Bell size={13} /> },
  { value: 'shipment', label: 'Shipments',          icon: <Package size={13} /> },
  { value: 'delivery', label: 'Deliveries',         icon: <Truck size={13} /> },
  { value: 'warning',  label: 'Warnings',           icon: <AlertTriangle size={13} /> },
  { value: 'success',  label: 'Success',            icon: <CheckCircle size={13} /> },
];

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "all")    return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount  = notifications.filter(n =>
    new Date(n.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <PageWrapper
      title="Notifications"
      description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      actions={
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="
            flex items-center gap-2 px-3.5 py-2
            rounded-[10px] text-[0.82rem] font-semibold
            bg-muted/40 border border-border/60
            text-muted-foreground
            hover:text-foreground hover:bg-muted/70 hover:-translate-y-px
            disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0
            transition-all duration-200
          "
        >
          <CheckCheck size={13} /> Mark All Read
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ════════════════════════════════════════
            Main List — 2/3 width
        ════════════════════════════════════════ */}
        <div className="lg:col-span-2 bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">

          {/* Panel header */}
          <div className="
            flex items-center justify-between px-5 py-4
            border-b border-border/40
            bg-gradient-to-r from-muted/20 to-transparent
          ">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Bell size={15} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[0.92rem] font-bold font-display text-foreground tracking-tight">
                  All Notifications
                </h3>
                <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* All / Unread pill switcher */}
            <div className="flex items-center gap-1 bg-muted/40 border border-border/60 rounded-[10px] p-1">
              {[
                { value: 'all',    label: 'All' },
                { value: 'unread', label: 'Unread', count: unreadCount },
              ].map(({ value, label, count }) => {
                const isActive = value === 'unread'
                  ? filter === 'unread'
                  : filter !== 'unread';
                return (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5
                      rounded-[8px] text-[0.78rem] font-semibold
                      transition-all duration-150
                      ${isActive
                        ? 'bg-card text-foreground shadow-sm border border-border/60'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {label}
                    {count !== undefined && count > 0 && (
                      <span className={`
                        inline-flex items-center justify-center
                        min-w-[18px] h-[18px] px-1 rounded-full
                        text-[0.62rem] font-bold
                        ${isActive
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable notification list */}
          <div className="h-[600px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center">
                  <Bell size={24} className="text-muted-foreground opacity-30" />
                </div>
                <div className="text-center">
                  <p className="text-[0.88rem] font-semibold text-muted-foreground">
                    No notifications
                  </p>
                  <p className="text-[0.75rem] text-muted-foreground/60 mt-0.5">
                    You're all caught up!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredNotifications.map(notification => {
                  const cfg = getTypeConfig(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`
                        group relative flex items-start gap-3.5
                        rounded-xl border px-4 py-3.5
                        transition-all duration-200
                        hover:shadow-[0_2px_12px_rgba(0,0,0,0.1)]
                        hover:-translate-y-px
                        ${!notification.read
                          ? 'bg-primary/[0.04] border-primary/20 hover:border-primary/35'
                          : 'bg-muted/20 border-border/40 hover:bg-muted/30 hover:border-border/60'
                        }
                      `}
                    >
                      {/* Unread left accent bar */}
                      {!notification.read && (
                        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-primary/60" />
                      )}

                      {/* Type icon badge */}
                      <div className={`
                        w-9 h-9 rounded-xl flex-shrink-0
                        flex items-center justify-center border
                        mt-0.5 transition-transform duration-200
                        group-hover:scale-105
                        ${cfg.color}
                      `}>
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className={`text-[0.84rem] leading-snug truncate ${
                            notification.read
                              ? 'text-muted-foreground font-medium'
                              : 'font-bold text-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                          )}
                        </div>
                        <p className="text-[0.76rem] text-muted-foreground leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[0.7rem] text-muted-foreground/50 mt-1.5 font-medium">
                          {formatDate(notification.timestamp, "datetime")}
                        </p>
                      </div>

                      {/* Hover action buttons */}
                      <div className="
                        absolute right-3 top-3
                        flex items-center gap-1
                        opacity-0 group-hover:opacity-100
                        translate-x-1 group-hover:translate-x-0
                        transition-all duration-150
                      ">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                            className="
                              w-7 h-7 flex items-center justify-center rounded-lg
                              bg-card/80 border border-border/60
                              text-muted-foreground backdrop-blur-sm
                              hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20
                              transition-all duration-150
                            "
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          title="Delete"
                          className="
                            w-7 h-7 flex items-center justify-center rounded-lg
                            bg-card/80 border border-border/60
                            text-muted-foreground backdrop-blur-sm
                            hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20
                            transition-all duration-150
                          "
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            Sidebar — 1/3 width
        ════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* ── Quick Stats ── */}
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-muted/20 to-transparent">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                Quick Stats
              </p>
            </div>
            <div className="p-4 space-y-0">
              {[
                {
                  label: 'Total',
                  value: notifications.length,
                  color: 'bg-muted/60 border-border/60 text-muted-foreground',
                },
                {
                  label: 'Unread',
                  value: unreadCount,
                  color: unreadCount > 0
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-muted/60 border-border/60 text-muted-foreground',
                },
                {
                  label: 'Today',
                  value: todayCount,
                  color: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
                >
                  <span className="text-[0.82rem] text-muted-foreground">{label}</span>
                  <span className={`
                    inline-flex items-center justify-center
                    min-w-[28px] h-6 px-2 rounded-full
                    text-[0.7rem] font-bold border
                    ${color}
                  `}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filter by Type ── */}
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-muted/20 to-transparent">
              <div className="flex items-center gap-2">
                <Filter size={12} className="text-muted-foreground" />
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                  Filter by Type
                </p>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {FILTER_ITEMS.map(({ value, label, icon }) => {
                const isActive = filter === value;
                const typeCount = value === 'all'
                  ? notifications.length
                  : notifications.filter(n => n.type === value).length;
                return (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5
                      rounded-[9px] text-[0.82rem] font-semibold
                      transition-all duration-150
                      ${isActive
                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-[0_0_0_1px_oklch(var(--primary)/0.1)]'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent'
                      }
                    `}
                  >
                    <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                      {icon}
                    </span>
                    <span className="flex-1 text-left">{label}</span>
                    {typeCount > 0 && (
                      <span className={`
                        text-[0.68rem] font-bold
                        ${isActive ? 'text-primary/70' : 'text-muted-foreground/50'}
                      `}>
                        {typeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Notification Settings ── */}
          <div className="bg-card border border-border/60 rounded-xl shadow-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-border/40 bg-gradient-to-r from-muted/20 to-transparent">
              <div className="flex items-center gap-2">
                <Settings size={12} className="text-muted-foreground" />
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.6px] text-muted-foreground">
                  Settings
                </p>
              </div>
            </div>
            <div className="p-3">
              <a
                href="/settings"
                className="
                  flex items-center justify-center gap-2 w-full py-2.5 px-4
                  rounded-[9px] text-[0.82rem] font-semibold
                  bg-muted/40 border border-border/60 text-muted-foreground
                  hover:text-foreground hover:bg-muted/70
                  transition-all duration-150
                "
              >
                <Settings size={13} /> Manage Preferences
              </a>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}