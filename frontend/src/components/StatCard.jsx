// components/StatCard.jsx
export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-primary-50', icon: 'text-primary-600', ring: 'ring-primary-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-200' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'ring-amber-200'   },
    red:     { bg: 'bg-red-50',     icon: 'text-red-600',     ring: 'ring-red-200'     },
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    ring: 'ring-blue-200'    },
    purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  ring: 'ring-purple-200'  },
  };
  const c = colors[color] || colors.primary;

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="font-display text-3xl font-bold text-slate-900 leading-none">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
}
