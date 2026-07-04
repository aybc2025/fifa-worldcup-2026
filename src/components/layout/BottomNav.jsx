import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NAV_ITEMS = [
  { to: '/',          icon: '🏠', labelKey: 'nav.home' },
  { to: '/groups',    icon: '📊', labelKey: 'nav.groups' },
  { to: '/knockout',  icon: '🏆', labelKey: 'nav.knockout' },
  { to: '/teams',     icon: '🌍', labelKey: 'nav.teams' },
  { to: '/scorers',   icon: '👟', labelKey: 'nav.scorers' },
]

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-bg/95 backdrop-blur border-t border-border flex">
      {NAV_ITEMS.map(({ to, icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 pt-4 gap-1 text-center transition-colors ${
              isActive ? 'text-teal' : 'text-muted hover:text-text'
            }`
          }
        >
          <span className="text-3xl leading-none">{icon}</span>
          <span className="text-[13px] leading-tight font-medium">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
