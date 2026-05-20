import { CURATED_HOME_STACKS, GOAL_ROUTE_DEFINITIONS, MARKETPLACE_HOME_HERO } from './curated-marketplace-home.config'
import { buildMarketplaceHomeUrlFrom } from './build-home-discovery-state'
import type {
  GoalRouteDefinition,
  GoalRouteViewModel,
  MarketplaceGoalId,
  MarketplaceHomeDiscoveryState,
  MarketplaceHomeViewModel,
  MarketplacePublishedApp,
  MarketplaceRecoveryAction
} from '../types/marketplace-home.types'

interface BuildCuratedHomeViewModelInput {
  apps: MarketplacePublishedApp[]
  discovery: MarketplaceHomeDiscoveryState
}

function normalizeForSearch(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function filterAppsBySearch(apps: MarketplacePublishedApp[], searchQuery: string): MarketplacePublishedApp[] {
  const query = normalizeForSearch(searchQuery)
  if (query.length === 0) {
    return apps
  }

  return apps.filter((app) => {
    const searchable = normalizeForSearch(`${app.name} ${app.summary}`)
    return searchable.includes(query)
  })
}

function sortApps(apps: MarketplacePublishedApp[]): MarketplacePublishedApp[] {
  return [...apps].sort((left, right) => left.name.localeCompare(right.name, 'es'))
}

function resolveGoalById(goalId: MarketplaceGoalId | null): GoalRouteDefinition | null {
  if (goalId === null) {
    return null
  }

  return GOAL_ROUTE_DEFINITIONS.find((goal) => goal.id === goalId) ?? null
}

function buildGoalAppSlugSet(goalId: MarketplaceGoalId | null): Set<string> {
  if (goalId === null) {
    return new Set()
  }

  const stackIds = new Set((resolveGoalById(goalId)?.stack_ids ?? []).map((stackId) => stackId))
  const scopedStacks = CURATED_HOME_STACKS.filter((stack) => stackIds.has(stack.id))

  return new Set(scopedStacks.flatMap((stack) => stack.app_slugs))
}

function countAppsForGoal(goalId: MarketplaceGoalId, allApps: MarketplacePublishedApp[]): number {
  const appSlugs = buildGoalAppSlugSet(goalId)
  if (appSlugs.size === 0) {
    return allApps.length
  }

  return allApps.filter((app) => appSlugs.has(app.slug)).length
}

function buildGoalViewModel(discovery: MarketplaceHomeDiscoveryState, allApps: MarketplacePublishedApp[]): GoalRouteViewModel[] {
  return [...GOAL_ROUTE_DEFINITIONS]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((goal) => {
      const isActive = discovery.goal_id === goal.id
      const appCount = countAppsForGoal(goal.id, allApps)

      return {
        ...goal,
        is_active: isActive,
        app_count: appCount,
        to: buildMarketplaceHomeUrlFrom(discovery, {
          goal_id: isActive ? null : goal.id
        })
      }
    })
}

function buildRecoveryActions(
  discovery: MarketplaceHomeDiscoveryState,
  hasZeroResults: boolean,
  activeGoal: GoalRouteDefinition | null
): MarketplaceRecoveryAction[] {
  if (!hasZeroResults) {
    return []
  }

  const actions: MarketplaceRecoveryAction[] = []

  if (discovery.search_query.length > 0) {
    actions.push({
      id: 'clear_search',
      label: 'Quitar busqueda',
      to: buildMarketplaceHomeUrlFrom(discovery, {
        search_query: ''
      })
    })
  }

  if (discovery.goal_id !== null) {
    actions.push({
      id: 'clear_goal',
      label: 'Ver todas las rutas',
      to: buildMarketplaceHomeUrlFrom(discovery, {
        goal_id: null
      })
    })
  }

  if (activeGoal?.fallback_goal_ids && activeGoal.fallback_goal_ids.length > 0) {
    const fallbackGoal = GOAL_ROUTE_DEFINITIONS.find((goal) => goal.id === activeGoal.fallback_goal_ids?.[0])

    actions.push({
      id: 'fallback_goal',
      label: `Cambiar a ${fallbackGoal?.label.toLowerCase() ?? 'otra ruta'}`,
      to: buildMarketplaceHomeUrlFrom(discovery, {
        goal_id: activeGoal.fallback_goal_ids[0],
        search_query: ''
      })
    })
  }

  actions.push({
    id: 'clear_all',
    label: 'Quitar todos los filtros',
    to: '/marketplace'
  })

  return actions
}

export function buildCuratedHomeViewModel(input: BuildCuratedHomeViewModelInput): MarketplaceHomeViewModel {
  const sortedApps = sortApps(input.apps)
  const activeGoal = resolveGoalById(input.discovery.goal_id)
  const goalAppSlugSet = buildGoalAppSlugSet(input.discovery.goal_id)

  const goalScopedApps =
    goalAppSlugSet.size > 0 ? sortedApps.filter((app) => goalAppSlugSet.has(app.slug)) : sortedApps

  const catalogApps = filterAppsBySearch(goalScopedApps, input.discovery.search_query)
  const hasZeroResults = catalogApps.length === 0

  return {
    hero: MARKETPLACE_HOME_HERO,
    discovery: input.discovery,
    goals: buildGoalViewModel(input.discovery, sortedApps),
    catalog_apps: catalogApps,
    full_catalog_apps: sortedApps,
    recovery_actions: buildRecoveryActions(input.discovery, hasZeroResults, activeGoal),
    total_apps: sortedApps.length,
    total_visible_apps: catalogApps.length,
    has_zero_results: hasZeroResults
  }
}
