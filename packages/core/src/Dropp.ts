import type { AttachInput, Media } from "@usedropp/types";
import { createHash } from "node:crypto";
import type {
  MediaPlugin,
  MediaRepository,
  QueueDriver,
  StorageDriver,
  TransformationDriver,
} from "./contracts.js";

export type DroppDependencies = {
  repository: MediaRepository;
  storage: StorageDriver;
  transformer?: TransformationDriver;
  queue?: QueueDriver;
  plugins?: MediaPlugin[];
};

export class Dropp {
  private readonly plugins: MediaPlugin[];

  constructor(private readonly deps: DroppDependencies) {
    this.plugins = deps.plugins ?? [];
  }

  async attach(input: AttachInput): Promise<Media> {
    for (const plugin of this.plugins) {
      await plugin.beforeUpload?.(input);
    }

    const tenantId = input.tenantId ?? "default";
    const contentHash = this.tryHash(input.file);
    const metadata: Record<string, unknown> = {
      ...(input.metadata ?? {}),
      ...(contentHash ? { contentHash } : {}),
    };

    const sameModel = await this.deps.repository.findByModel(
      input.model,
      input.modelId,
    );
    const sameScope = sameModel.filter(
      (item) =>
        (item.tenantId ?? "default") === tenantId &&
        item.collection === (input.collection ?? "default"),
    );

    if (contentHash) {
      const duplicate = sameScope.find(
        (item) =>
          (item.metadata?.contentHash as string | undefined) === contentHash,
      );

      if (duplicate) {
        return duplicate;
      }
    }

    const sameName = sameScope
      .filter((item) => item.fileName === input.fileName)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const previous = sameName[0];
    const previousVersion = Number(previous?.metadata?.version ?? 0);
    metadata.version = previousVersion + 1;
    metadata.active = true;
    if (previous) metadata.previousVersionId = previous.id;

    const basePath = `${input.model}/${input.modelId}/${Date.now()}-${input.fileName}`;
    const storagePath = await this.deps.storage.upload(input.file, basePath);

    if (input.transformations?.length && this.deps.queue) {
      await this.deps.queue.add("media.transform", {
        path: storagePath,
        mimeType: input.mimeType,
        transformations: input.transformations,
      });
    }

    const media = await this.deps.repository.create({
      model: input.model,
      modelId: input.modelId,
      tenantId,
      collection: input.collection ?? "default",
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: 0,
      disk: "default",
      path: storagePath,
      url: this.deps.storage.getUrl(storagePath),
      metadata,
    });

    if (previous && this.deps.repository.update) {
      await this.deps.repository.update(previous.id, {
        metadata: {
          ...previous.metadata,
          active: false,
        },
      });
    }

    for (const plugin of this.plugins) {
      await plugin.afterUpload?.(media);
    }

    return media;
  }

  get(id: string): Promise<Media | null> {
    return this.deps.repository.findById(id);
  }

  getByModel(model: string, modelId: string): Promise<Media[]> {
    return this.deps.repository.findByModel(model, modelId);
  }

  async delete(id: string): Promise<void> {
    const media = await this.deps.repository.findById(id);
    if (!media) return;

    await this.deps.storage.delete(media.path);
    await this.deps.repository.delete(id);
  }

  async rollback(id: string): Promise<Media> {
    const current = await this.deps.repository.findById(id);
    if (!current) {
      throw new Error(`Media not found: ${id}`);
    }

    const previousId = current.metadata?.previousVersionId as
      | string
      | undefined;
    if (!previousId) {
      throw new Error(`Media ${id} has no previous version to rollback to.`);
    }

    const previous = await this.deps.repository.findById(previousId);
    if (!previous) {
      throw new Error(`Previous version not found: ${previousId}`);
    }

    if (!this.deps.repository.update) {
      throw new Error("Rollback requires repository.update() support.");
    }

    await this.deps.repository.update(current.id, {
      metadata: {
        ...current.metadata,
        active: false,
      },
    });

    const restored = await this.deps.repository.update(previous.id, {
      metadata: {
        ...previous.metadata,
        active: true,
      },
    });

    if (!restored) {
      throw new Error(`Failed to restore previous version: ${previous.id}`);
    }

    return restored;
  }

  private tryHash(file: unknown): string | undefined {
    if (file instanceof Uint8Array) {
      return createHash("sha256").update(file).digest("hex");
    }

    if (typeof Buffer !== "undefined" && Buffer.isBuffer(file)) {
      return createHash("sha256").update(file).digest("hex");
    }

    return undefined;
  }
}
