import Crop from '#modules/harvests/crop.model'
import { CropNormalizationService } from '#modules/harvests/services/crop_normalization.service'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class HarvestCropService {
  constructor(private normalization = new CropNormalizationService()) {}

  async replace(idHarvest: string, values: string[], transaction: TransactionClientContract) {
    const normalized = this.normalization.normalize(values)
    const cropIds: string[] = []

    for (const input of normalized) {
      let crop = await Crop.query({ client: transaction })
        .where('normalizedName', input.normalizedName)
        .first()

      if (!crop) {
        crop = new Crop()
        crop.useTransaction(transaction)
        crop.merge(input)
        await crop.save()
      }
      cropIds.push(crop.idCrop)
    }

    await transaction.from('harvest_crops').where('id_harvest', idHarvest).delete()
    if (cropIds.length) {
      await transaction
        .table('harvest_crops')
        .multiInsert(cropIds.map((idCrop) => ({ id_harvest: idHarvest, id_crop: idCrop })))
    }
  }
}
