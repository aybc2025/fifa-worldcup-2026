import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../hooks/index'

export function TopBar() {
  const { t } = useTranslation()
  const { isHebrew, toggle } = useLanguage()

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur border-b border-border flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚽</span>
        <span className="font-display text-teal font-semibold tracking-tight text-base">
          {t('home.title')}
        </span>
      </div>

      <button
        onClick={toggle}
        aria-label="Toggle language"
        className="flex gap-1 text-xs rounded-lg border border-border overflow-hidden"
      >
        <span className={`px-2.5 py-1 transition-colors ${isHebrew ? 'bg-teal/15 text-teal' : 'text-muted hover:text-text'}`}>
          עב
        </span>
        <span className={`px-2.5 py-1 transition-colors ${!isHebrew ? 'bg-teal/15 text-teal' : 'text-muted hover:text-text'}`}>
          EN
        </span>
      </button>
    </header>
  )
}
