import type { MediaRepository } from "@droppjs/core";
import type { Media, MediaCreateInput } from "@droppjs/types";

export class TypeOrmMediaRepository implements MediaRepository {
  constructor(private readonly repository: any) {}

  async create(data: MediaCreateInput): Promise<Media> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  findById(id: string): Promise<Media | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByModel(model: string, modelId: string): Promise<Media[]> {
    return this.repository.find({ where: { model, modelId } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
