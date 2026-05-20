import type { CuratedStackDefinition, GoalRouteDefinition, MarketplaceHeroDefinition } from '../types/marketplace-home.types'

export const MARKETPLACE_HOME_HERO: MarketplaceHeroDefinition = {
  badge: 'Marketplace operativo para ecommerce real',
  title: 'Elige un objetivo y activa la app correcta en minutos.',
  subtitle: 'Filtra por objetivo, explora el catalogo completo y avanza sin salir del marketplace.',
  supporting_points: [
    'Rutas claras para vender mas, lanzar rapido, validar productos y ordenar operacion.',
    'Catalogo completo con filtros por resultado de negocio.',
    'Catalogo completo disponible cuando quieras explorar.'
  ]
}

export const CURATED_HOME_STACKS: CuratedStackDefinition[] = [
  {
    id: 'sell-more-conversion-stack',
    title: 'Stack de conversion comercial',
    result_statement: 'Activa campañas y seguimiento para convertir mas visitas en ventas.',
    context_statement: 'Ideal para tiendas con trafico activo que necesitan mejorar cierre semanal.',
    next_step_label: 'Abrir flujo de conversion',
    goal_ids: ['sell_more'],
    app_slugs: ['shopify-store-cloner', 'wifi-add-report', 'wifi-numbers'],
    supporting_signals: ['CTA claras en cada paso', 'Medicion simple por canal', 'Activacion en menos de 30 minutos'],
    sort_order: 1
  },
  {
    id: 'launch-faster-pilot-stack',
    title: 'Stack para lanzar nuevo producto',
    result_statement: 'Pasa de idea a piloto con contenidos y operaciones sincronizadas.',
    context_statement: 'Ideal cuando necesitas sacar un nuevo producto esta semana.',
    next_step_label: 'Iniciar lanzamiento guiado',
    goal_ids: ['launch_faster'],
    app_slugs: ['dashboard-logistico', 'wifi-numbers', 'shopify-store-cloner'],
    supporting_signals: ['Checklist de salida', 'Control de riesgos logísticos', 'Ejecucion por bloques diarios'],
    sort_order: 2
  },
  {
    id: 'validate-products-feedback-stack',
    title: 'Stack de validacion temprana',
    result_statement: 'Prueba propuestas rapido y recoge señales antes de escalar inversión.',
    context_statement: 'Ideal para nuevos SKUs o hipótesis de oferta que aun no están validadas.',
    next_step_label: 'Abrir circuito de validacion',
    goal_ids: ['validate_products'],
    app_slugs: ['wifi-tiktoker-scanner', 'wifi-add-report', 'shopify-store-cloner'],
    supporting_signals: ['Iteraciones cortas', 'Señales de adopcion accionables', 'Aprendizaje continuo por experimento'],
    sort_order: 3
  },
  {
    id: 'operations-control-stack',
    title: 'Stack de orden operativo',
    result_statement: 'Centraliza procesos criticos para reducir errores y tiempos muertos.',
    context_statement: 'Ideal para equipos que crecieron rapido y necesitan consistencia operativa.',
    next_step_label: 'Estabilizar operación',
    goal_ids: ['order_operations'],
    app_slugs: ['dashboard-logistico', 'wifi-add-report', 'wifi-numbers'],
    supporting_signals: ['Prioridad por cuellos de botella', 'Ritmo operativo diario', 'Visibilidad para decisiones rapidas'],
    sort_order: 4
  }
]

export const GOAL_ROUTE_DEFINITIONS: GoalRouteDefinition[] = [
  {
    id: 'sell_more',
    label: 'Vender mas',
    headline: 'Optimiza conversion y cierre comercial',
    supporting_copy: 'Activa apps para atraer, convertir y medir con foco en ingreso.',
    stack_ids: ['sell-more-conversion-stack'],
    sort_order: 1,
    fallback_goal_ids: ['launch_faster', 'order_operations']
  },
  {
    id: 'launch_faster',
    label: 'Lanzar mas rapido',
    headline: 'Acelera salida a mercado de nuevas ofertas',
    supporting_copy: 'Conecta ejecución comercial y logística para lanzar sin fricción.',
    stack_ids: ['launch-faster-pilot-stack'],
    sort_order: 2,
    fallback_goal_ids: ['sell_more', 'validate_products']
  },
  {
    id: 'validate_products',
    label: 'Validar productos',
    headline: 'Reduce incertidumbre antes de escalar',
    supporting_copy: 'Prueba, mide y decide con ciclos cortos y señales claras.',
    stack_ids: ['validate-products-feedback-stack'],
    sort_order: 3,
    fallback_goal_ids: ['launch_faster', 'sell_more']
  },
  {
    id: 'order_operations',
    label: 'Ordenar operación',
    headline: 'Construye consistencia para crecer sin caos',
    supporting_copy: 'Estandariza tareas clave y mejora tiempos de respuesta operativa.',
    stack_ids: ['operations-control-stack'],
    sort_order: 4,
    fallback_goal_ids: ['sell_more', 'launch_faster']
  }
]
