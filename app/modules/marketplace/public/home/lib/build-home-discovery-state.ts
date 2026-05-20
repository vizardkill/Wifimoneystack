import { MARKETPLACE_GOAL_IDS, type MarketplaceGoalId, type MarketplaceHomeDiscoveryState } from '../types/marketplace-home.types'

const VALID_GOALS = new Set<MarketplaceGoalId>(MARKETPLACE_GOAL_IDS)

function normalizeSearchQuery(input: string | null | undefined): string {
  return (input ?? '').trim().replace(/\s+/g, ' ').slice(0, 120)
}

export function parseMarketplaceHomeDiscoveryState(searchParams: URLSearchParams): MarketplaceHomeDiscoveryState {
  const rawGoal = searchParams.get('goal')

  const goalId = rawGoal !== null && VALID_GOALS.has(rawGoal as MarketplaceGoalId) ? (rawGoal as MarketplaceGoalId) : null
  const searchQuery = normalizeSearchQuery(searchParams.get('search'))

  return {
    goal_id: goalId,
    search_query: searchQuery
  }
}

export type MarketplaceStatePatch = {
  goal_id?: MarketplaceGoalId | null
  search_query?: string
}

export function mergeMarketplaceHomeState(base: MarketplaceHomeDiscoveryState, patch: MarketplaceStatePatch): MarketplaceHomeDiscoveryState {
  const nextGoal = patch.goal_id === undefined ? base.goal_id : patch.goal_id
  const nextSearch = patch.search_query === undefined ? base.search_query : normalizeSearchQuery(patch.search_query)

  const safeGoal = nextGoal !== null && VALID_GOALS.has(nextGoal) ? nextGoal : null

  return {
    goal_id: safeGoal,
    search_query: nextSearch
  }
}

export function buildMarketplaceHomeUrl(state: MarketplaceHomeDiscoveryState): string {
  const params = new URLSearchParams()

  if (state.goal_id !== null) {
    params.set('goal', state.goal_id)
  }

  if (state.search_query.length > 0) {
    params.set('search', state.search_query)
  }

  const query = params.toString()
  return query.length > 0 ? `/marketplace?${query}` : '/marketplace'
}

export function buildMarketplaceHomeUrlFrom(base: MarketplaceHomeDiscoveryState, patch: MarketplaceStatePatch): string {
  return buildMarketplaceHomeUrl(mergeMarketplaceHomeState(base, patch))
}
