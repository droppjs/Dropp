import type { MediaRepository } from "@usedropp/core";
import type { Media, MediaCreateInput } from "@usedropp/types";

export class SequelizeMediaRepository implements MediaRepository {
  constructor(private readonly mediaModel: any) {}

  async create(data: MediaCreateInput): Promise<Media> {
    const created = await this.mediaModel.create(data);
    return created.toJSON ? created.toJSON() : created;
  }

  async findById(id: string): Promise<Media | null> {
    const item = await this.mediaModel.findByPk(id);
    if (!item) return null;
    return item.toJSON ? item.toJSON() : item;
  }

  async findByModel(model: string, modelId: string): Promise<Media[]> {
    const items = await this.mediaModel.findAll({ where: { model, modelId } });
    return items.map((item: any) => (item.toJSON ? item.toJSON() : item));
  }

  async delete(id: string): Promise<void> {
    await this.mediaModel.destroy({ where: { id } });
  }
}
