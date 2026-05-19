import { CURATED_HOME_STACKS, GOAL_ROUTE_DEFINITIONS, MARKETPLACE_HOME_HERO } from './curated-marketplace-home.config'
import { buildMarketplaceHomeUrlFrom } from './build-home-discovery-state'
import type {
  CuratedStackDefinition,
  CuratedStackViewModel,
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

function mapAppBySlug(apps: MarketplacePublishedApp[]): Map<string, MarketplacePublishedApp> {
  return new Map(apps.map((app) => [app.slug, app]))
}

function resolveGoalById(goalId: MarketplaceGoalId | null): GoalRouteDefinition | null {
  if (goalId === null) {
    return null
  }

  return GOAL_ROUTE_DEFINITIONS.find((goal) => goal.id === goalId) ?? null
}

function resolveStacksByGoal(goalId: MarketplaceGoalId | null): CuratedStackDefinition[] {
  const orderedStacks = [...CURATED_HOME_STACKS].sort((left, right) => left.sort_order - right.sort_order)

  if (goalId === null) {
    return orderedStacks
  }

  const scopedStacks = orderedStacks.filter((stack) => stack.goal_ids.includes(goalId))
  return scopedStacks.length > 0 ? scopedStacks : orderedStacks
}

function buildGoalAppSlugSet(goalId: MarketplaceGoalId | null): Set<string> {
  if (goalId === null) {
    return new Set()
  }

  const stackIds = new Set((resolveGoalById(goalId)?.stack_ids ?? []).map((stackId) => stackId))
  const scopedStacks = CURATED_HOME_STACKS.filter((stack) => stackIds.has(stack.id))

  return new Set(scopedStacks.flatMap((stack) => stack.app_slugs))
}

function resolveStackApps(
  stack: CuratedStackDefinition,
  appBySlug: Map<string, MarketplacePublishedApp>,
  fallbackApps: MarketplacePublishedApp[]
): MarketplacePublishedApp[] {
  const fromConfig = stack.app_slugs
    .map((slug) => appBySlug.get(slug) ?? null)
    .filter((app): app is MarketplacePublishedApp => app !== null)

  if (fromConfig.length > 0) {
    return fromConfig
  }

  return fallbackApps.slice(0, Math.min(fallbackApps.length, 3))
}

function dedupeApps(apps: MarketplacePublishedApp[]): MarketplacePublishedApp[] {
  const seen = new Set<string>()

  return apps.filter((app) => {
    if (seen.has(app.id)) {
      return false
    }

    seen.add(app.id)
    return true
  })
}

function buildGoalViewModel(discovery: MarketplaceHomeDiscoveryState, stacks: CuratedStackDefinition[]): GoalRouteViewModel[] {
  return [...GOAL_ROUTE_DEFINITIONS]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((goal) => {
      const isActive = discovery.goal_id === goal.id
      const stackCount = stacks.filter((stack) => stack.goal_ids.includes(goal.id)).length

      return {
        ...goal,
        is_active: isActive,
        stack_count: stackCount,
        to: buildMarketplaceHomeUrlFrom(discovery, {
          goal_id: isActive ? null : goal.id,
          stack_focus_id: null
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
        search_query: '',
        stack_focus_id: null
      })
    })
  }

  if (discovery.goal_id !== null) {
    actions.push({
      id: 'clear_goal',
      label: 'Ver todas las rutas',
      to: buildMarketplaceHomeUrlFrom(discovery, {
        goal_id: null,
        stack_focus_id: null
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
        search_query: '',
        stack_focus_id: null
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
  const appBySlug = mapAppBySlug(sortedApps)
  const activeGoal = resolveGoalById(input.discovery.goal_id)
  const visibleStackDefinitions = resolveStacksByGoal(input.discovery.goal_id)
  const goalAppSlugSet = buildGoalAppSlugSet(input.discovery.goal_id)

  const goalScopedApps =
    goalAppSlugSet.size > 0 ? sortedApps.filter((app) => goalAppSlugSet.has(app.slug)) : sortedApps

  const catalogApps = filterAppsBySearch(goalScopedApps, input.discovery.search_query)
  const hasZeroResults = catalogApps.length === 0

  const stackViews: CuratedStackViewModel[] = visibleStackDefinitions.map((stack) => {
    const stackApps = resolveStackApps(stack, appBySlug, catalogApps.length > 0 ? catalogApps : sortedApps)

    return {
      ...stack,
      apps: dedupeApps(stackApps),
      is_focus: input.discovery.stack_focus_id === stack.id,
      anchor_id: `stack-focus-${stack.id}`,
      focus_to: buildMarketplaceHomeUrlFrom(input.discovery, {
        goal_id: input.discovery.goal_id ?? (stack.goal_ids.at(0) ?? null),
        stack_focus_id: stack.id
      }),
      clear_focus_to: buildMarketplaceHomeUrlFrom(input.discovery, {
        stack_focus_id: null
      })
    }
  })

  const focusedStack =
    input.discovery.stack_focus_id === null
      ? null
      : stackViews.find((stack) => stack.id === input.discovery.stack_focus_id) ?? null

  return {
    hero: MARKETPLACE_HOME_HERO,
    discovery: input.discovery,
    goals: buildGoalViewModel(input.discovery, visibleStackDefinitions),
    visible_stacks: stackViews,
    focused_stack: focusedStack,
    catalog_apps: catalogApps,
    full_catalog_apps: sortedApps,
    recovery_actions: buildRecoveryActions(input.discovery, hasZeroResults, activeGoal),
    total_apps: sortedApps.length,
    total_visible_apps: catalogApps.length,
    has_zero_results: hasZeroResults
  }
}
