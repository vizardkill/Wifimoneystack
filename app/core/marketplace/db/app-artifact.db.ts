import type { MarketplaceAppArtifact } from '@prisma/client'

import { db } from '@/db.server'

/**
 * Data Access Object para MarketplaceAppArtifact
 */
export class AppArtifactDB {
  /**
   * Crear un artefacto y desactivar el anterior si existe
   */
  static async create(input: {
    app_id: string
    storage_key: string
    file_name: string
    mime_type: string
    size_bytes: bigint
    checksum?: string
    version_label?: string
    created_by_user_id: string
  }): Promise<MarketplaceAppArtifact> {
    // Desactivar artefactos previos
    await db.marketplaceAppArtifact.updateMany({
      where: { app_id: input.app_id, is_active: true },
      data: { is_active: false }
    })

    return db.marketplaceAppArtifact.create({
      data: {
        app_id: input.app_id,
        storage_key: input.storage_key,
        file_name: input.file_name,
        mime_type: input.mime_type,
        size_bytes: input.size_bytes,
        checksum: input.checksum,
        version_label: input.version_label,
        created_by_user_id: input.created_by_user_id
      }
    })
  }

  /**
   * Obtener artefacto activo de una app
   */
  static async findActiveByApp(app_id: string): Promise<MarketplaceAppArtifact | null> {
    return db.marketplaceAppArtifact.findFirst({
      where: { app_id, is_active: true }
    })
  }

  /**
   * Listar todos los artefactos de una app
   */
  static async listByApp(app_id: string): Promise<MarketplaceAppArtifact[]> {
    return db.marketplaceAppArtifact.findMany({
      where: { app_id },
      orderBy: { created_at: 'desc' }
    })
  }
}
