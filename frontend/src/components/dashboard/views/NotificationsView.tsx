import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  TrendingUp,
  Tag,
  CreditCard,
  Sparkles,
  Info,
  ExternalLink,
  CheckCheck
} from 'lucide-react'
import { useDashboard } from '../../../context/DashboardContext'
import { DemoDataBadge } from '../components/DemoDataBadge'

export function NotificationsView() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, lang } = useDashboard()
  const [filterType, setFilterType] = useState<string>('All')

  const filterTabs = ['All', 'offer', 'price', 'match', 'payment', 'system']

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'All') return true
    return n.type === filterType
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-wheat rounded-3xl border border-soil/15 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-turmeric bg-monsoon px-2.5 py-0.5 rounded-full">
                {lang === 'en' ? 'Live Alert Center' : 'सूचना केंद्र'}
              </span>
              <DemoDataBadge />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-soil">
              {lang === 'en' ? 'Notifications & Live Signals' : 'सूचनाएं व लाइव अलर्ट्स'}
            </h1>
            <p className="font-body text-xs text-soil/70 mt-1">
              {lang === 'en'
                ? `You have ${unreadCount} unread market signals, offers, and payment updates.`
                : `आपके पास ${unreadCount} अपठित सूचनाएं हैं।`}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-xs font-semibold bg-soil/10 hover:bg-soil/15 text-soil transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-turmeric" />
              {lang === 'en' ? 'Mark All as Read' : 'सभी को पढ़ा हुआ चिह्नित करें'}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-soil/10">
          {filterTabs.map((type) => {
            const count = type === 'All' ? notifications.length : notifications.filter(n => n.type === type).length
            const label =
              type === 'All'
                ? lang === 'en'
                  ? 'All'
                  : 'सभी'
                : type === 'offer'
                ? lang === 'en'
                  ? 'Offers'
                  : 'ऑफ़र'
                : type === 'price'
                ? lang === 'en'
                  ? 'Price Alerts'
                  : 'भाव अलर्ट'
                : type === 'match'
                ? lang === 'en'
                  ? 'Buyer Matches'
                  : 'खरीदार'
                : type === 'payment'
                ? lang === 'en'
                  ? 'Payments'
                  : 'भुगतान'
                : 'System'

            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl font-body text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === type
                    ? 'bg-monsoon text-wheat font-semibold shadow-sm'
                    : 'bg-soil/5 text-soil/80 hover:bg-soil/10 border border-soil/10'
                }`}
              >
                <span>{label}</span>
                <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterType === type ? 'bg-turmeric text-monsoon' : 'bg-soil/10 text-soil/60'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notif) => {
          const icon =
            notif.type === 'offer' ? (
              <Tag className="w-5 h-5 text-turmeric" />
            ) : notif.type === 'price' ? (
              <TrendingUp className="w-5 h-5 text-datateal" />
            ) : notif.type === 'match' ? (
              <Sparkles className="w-5 h-5 text-datateal" />
            ) : notif.type === 'payment' ? (
              <CreditCard className="w-5 h-5 text-turmeric" />
            ) : (
              <Info className="w-5 h-5 text-soil/70" />
            )

          return (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-5 md:p-6 rounded-3xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-wheat border-soil/15 opacity-80'
                  : 'bg-wheat border-2 border-turmeric/50 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-soil/5 border border-soil/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {icon}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-lg font-semibold text-soil">
                      {lang === 'en' ? notif.title : notif.titleHi}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-turmeric animate-pulse" />
                    )}
                  </div>
                  <p className="font-body text-xs text-soil/80 leading-relaxed max-w-2xl">
                    {lang === 'en' ? notif.message : notif.messageHi}
                  </p>
                  <span className="font-mono text-[11px] text-soil/50 block mt-2">{notif.timeAgo}</span>
                </div>
              </div>

              {notif.link && (
                <Link
                  to={notif.link}
                  className="p-2 rounded-xl bg-soil/5 hover:bg-soil/10 text-soil flex-shrink-0 transition-colors"
                  title="Navigate"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

