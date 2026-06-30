import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center py-10">
      <div className={`${sizes[size]} border-2 border-border border-t-teal rounded-full animate-spin`} />
    </div>
  )
}

export function ErrorState({ onRetry }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted">
      <span className="text-3xl">⚠️</span>
      <p className="text-sm">{t('common.error')}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:border-teal hover:text-teal transition-colors"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted">
      <span className="text-3xl opacity-40">⚽</span>
      <p className="text-sm">{message ?? t('common.noData')}</p>
    </div>
  )
}

export function OfflineBanner() {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      className="bg-amber/10 border-b border-amber/30 text-amber text-xs text-center py-2 px-4"
    >
      {t('common.offline')}
    </motion.div>
  )
}

export function UpdateBanner({ onUpdate }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-teal/10 border-b border-teal/30 text-teal text-xs flex items-center justify-between py-2 px-4"
    >
      <span>{t('common.update')}</span>
      <button
        onClick={onUpdate}
        className="font-semibold underline underline-offset-2"
      >
        {t('common.updateBtn')}
      </button>
    </motion.div>
  )
}
