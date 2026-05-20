import type { CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS } from '@types'

type PublishedAppsResponseData = NonNullable<CONFIG_LIST_PUBLISHED_MARKETPLACE_APPS.RequestResponse['data']>

export type MarketplacePublishedApp = PublishedAppsResponseData['apps'][number]

export const MARKETPLACE_GOAL_IDS = ['sell_more', 'launch_faster', 'validate_products', 'order_operations'] as const

export type MarketplaceGoalId = (typeof MARKETPLACE_GOAL_IDS)[number]

export interface MarketplaceHeroDefinition {
  badge: string
  title: string
  subtitle: string
  supporting_points: string[]
}

export interface GoalRouteDefinition {
  id: MarketplaceGoalId
  label: string
  headline: string
  supporting_copy: string
  stack_ids: string[]
  sort_order: number
  fallback_goal_ids?: MarketplaceGoalId[]
}

export interface CuratedStackDefinition {
  id: string
  title: string
  result_statement: string
  context_statement: string
  next_step_label: string
  goal_ids: MarketplaceGoalId[]
  app_slugs: string[]
  supporting_signals: string[]
  sort_order: number
}

export interface MarketplaceHomeDiscoveryState {
  goal_id: MarketplaceGoalId | null
  search_query: string
}

export interface GoalRouteViewModel extends GoalRouteDefinition {
  is_active: boolean
  app_count: number
  to: string
}

export interface CuratedStackViewModel extends CuratedStackDefinition {
  apps: MarketplacePublishedApp[]
  is_focus: boolean
  anchor_id: string
  focus_to: string
  clear_focus_to: string
}

export interface MarketplaceRecoveryAction {
  id: 'clear_search' | 'clear_goal' | 'clear_all' | 'fallback_goal'
  label: string
  to: string
}

export interface MarketplaceHomeViewModel {
  hero: MarketplaceHeroDefinition
  discovery: MarketplaceHomeDiscoveryState
  goals: GoalRouteViewModel[]
  catalog_apps: MarketplacePublishedApp[]
  full_catalog_apps: MarketplacePublishedApp[]
  recovery_actions: MarketplaceRecoveryAction[]
  total_apps: number
  total_visible_apps: number
  has_zero_results: boolean
}
