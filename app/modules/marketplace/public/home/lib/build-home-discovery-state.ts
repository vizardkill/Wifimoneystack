import { CURATED_HOME_STACKS } from './curated-marketplace-home.config'
import { MARKETPLACE_GOAL_IDS, type MarketplaceGoalId, type MarketplaceHomeDiscoveryState } from '../types/marketplace-home.types'

const VALID_GOALS = new Set<MarketplaceGoalId>(MARKETPLACE_GOAL_IDS)
const VALID_STACK_IDS = new Set<string>(CURATED_HOME_STACKS.map((stack) => stack.id))
const GOALS_BY_STACK_ID = new Map(CURATED_HOME_STACKS.map((stack) => [stack.id, stack.goal_ids]))

function normalizeSearchQuery(input: string | null | undefined): string {
  return (input ?? '').trim().replace(/\s+/g, ' ').slice(0, 120)
}

export function parseMarketplaceHomeDiscoveryState(searchParams: URLSearchParams): MarketplaceHomeDiscoveryState {
  const rawGoal = searchParams.get('goal')
  const rawStackFocus = searchParams.get('stack_focus')

  const goalId = rawGoal !== null && VALID_GOALS.has(rawGoal as MarketplaceGoalId) ? (rawGoal as MarketplaceGoalId) : null
  const stackFocusId = rawStackFocus !== null && VALID_STACK_IDS.has(rawStackFocus) ? rawStackFocus : null
  const searchQuery = normalizeSearchQuery(searchParams.get('search'))

  if (goalId !== null) {
    return {
      goal_id: goalId,
      search_query: searchQuery,
      stack_focus_id: stackFocusId
    }
  }

  if (stackFocusId !== null) {
    const inferredGoal = GOALS_BY_STACK_ID.get(stackFocusId)?.[0] ?? null
    return {
      goal_id: inferredGoal,
      search_query: searchQuery,
      stack_focus_id: stackFocusId
    }
  }

  return {
    goal_id: null,
    search_query: searchQuery,
    stack_focus_id: null
  }
}

export type MarketplaceStatePatch = {
  goal_id?: MarketplaceGoalId | null
  search_query?: string
  stack_focus_id?: string | null
}

export function mergeMarketplaceHomeState(base: MarketplaceHomeDiscoveryState, patch: MarketplaceStatePatch): MarketplaceHomeDiscoveryState {
  const nextGoal = patch.goal_id === undefined ? base.goal_id : patch.goal_id
  const nextSearch = patch.search_query === undefined ? base.search_query : normalizeSearchQuery(patch.search_query)
  const nextStack = patch.stack_focus_id === undefined ? base.stack_focus_id : patch.stack_focus_id

  const safeGoal = nextGoal !== null && VALID_GOALS.has(nextGoal) ? nextGoal : null
  const safeStack = nextStack !== null && VALID_STACK_IDS.has(nextStack) ? nextStack : null

  return {
    goal_id: safeGoal,
    search_query: nextSearch,
    stack_focus_id: safeStack
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

  if (state.stack_focus_id !== null) {
    params.set('stack_focus', state.stack_focus_id)
  }

  const query = params.toString()
  return query.length > 0 ? `/marketplace?${query}` : '/marketplace'
}

export function buildMarketplaceHomeUrlFrom(base: MarketplaceHomeDiscoveryState, patch: MarketplaceStatePatch): string {
  return buildMarketplaceHomeUrl(mergeMarketplaceHomeState(base, patch))
}
