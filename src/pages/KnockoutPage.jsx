import { useTranslation } from 'react-i18next'
import { useAllFixtures } from '../hooks/useMatches'
import { useKnockout } from '../hooks/index'
import { BracketTree } from '../components/knockout/BracketTree'
import { LoadingSpinner, ErrorState } from '../components/common/index'

export default function KnockoutPage() {
  const { t } = useTranslation()
  const { fixtures, isLoading, isError, refetch } = useAllFixtures()
  const { rounds } = useKnockout(fixtures)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 mb-2">
        <h1 className="text-lg font-bold text-teal">{t('knockout.title')}</h1>
      </div>

      <BracketTree rounds={rounds} />
    </div>
  )
}
