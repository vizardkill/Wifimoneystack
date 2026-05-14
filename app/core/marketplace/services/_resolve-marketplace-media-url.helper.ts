import { getAppBaseUrl } from '@lib/config/_app.config'
import { buildPublicMediaProxyUrlFromStorageUrl, STORAGE_PUBLIC_MEDIA_PREFIXES } from '@lib/services/_storage.service'

export const resolveMarketplaceMediaUrl = (sourceUrl: string | null): string | null => {
  return buildPublicMediaProxyUrlFromStorageUrl(sourceUrl, getAppBaseUrl(), STORAGE_PUBLIC_MEDIA_PREFIXES.MARKETPLACE_STOREFRONTS)
}
