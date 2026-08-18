import { Args, Command, Flags } from "@oclif/core";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import type { DroppConfig } from "../../../types/index.js";
import {
  ORM_OPTIONS,
  renderRepositoryTemplate,
  type SupportedOrm,
} from "../../templates/repository.js";

export default class GenerateAll extends Command {
  static override description =
    "Generate repository, model, and migration in one command";

  static override args = {
    name: Args.string({
      description: "Project/model name (example: media)",
      required: true,
    }),
  };

  static override flags = {
    orm: Flags.string({
      description: "Target ORM",
      options: ORM_OPTIONS as unknown as string[],
      required: true,
    }),
    force: Flags.boolean({
      char: "f",
      description: "Overwrite existing generated files",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GenerateAll);

    const orm = flags.orm as SupportedOrm;
    if (!ORM_OPTIONS.includes(orm)) {
      throw new Error(`Unsupported ORM '${orm}'.`);
    }

    const projectName = this.toSnakeCase(args.name);
    const className = this.toPascalCase(projectName);

    this.log(`Scaffolding ${orm} project: ${projectName}`);

    // 1. Generate repository
    this.log("\n[1/3] Generating repository...");
    const repositoryTsPath = join(process.cwd(), "dropp.repository.ts");
    await mkdir(dirname(repositoryTsPath), { recursive: true });
    await writeFile(repositoryTsPath, renderRepositoryTemplate(orm), "utf8");
    this.log(`  ✓ Repository: ${repositoryTsPath}`);

    // 2. Generate model
    this.log("[2/3] Generating model...");
    const modelTargetPath = this.resolveModelOutputPath(
      orm,
      projectName,
      className,
    );
    await mkdir(dirname(modelTargetPath), { recursive: true });
    await writeFile(
      modelTargetPath,
      this.renderModelTemplate(orm, projectName, className),
      "utf8",
    );
    this.log(`  ✓ Model: ${modelTargetPath}`);

    // 3. Generate migration
    this.log("[3/3] Generating migration...");
    const migrationName = `create_${projectName}_table`;
    const timestamp = this.getTimestamp();
    const migrationTargetPath = this.resolveMigrationOutputPath(
      orm,
      timestamp,
      migrationName,
    );
    await mkdir(dirname(migrationTargetPath), { recursive: true });
    await writeFile(
      migrationTargetPath,
      this.renderMigrationTemplate(orm, timestamp, migrationName),
      "utf8",
    );
    this.log(`  ✓ Migration: ${migrationTargetPath}`);

    // 4. Update config
    this.log("[4/4] Updating config...");
    const configPath = join(process.cwd(), "dropp.config.json");
    const config = await this.readOrCreateConfig(configPath);

    config.orm = {
      ...config.orm,
      driver: orm,
      repository: {
        module: "./dropp.repository.js",
        exportName: "mediaRepository",
      },
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
    this.log(`  ✓ Config: ${configPath}`);

    this.log(
      "\n✅ Complete! Next: compile dropp.repository.ts to .js and run migrations.",
    );
  }

  private resolveModelOutputPath(
    orm: SupportedOrm,
    modelName: string,
    className: string,
  ): string {
    if (orm === "prisma")
      return join(process.cwd(), "prisma", `schema.${modelName}.prisma`);
    if (orm === "drizzle")
      return join(process.cwd(), "src", "db", `schema.${modelName}.ts`);
    if (orm === "sequelize")
      return join(process.cwd(), "src", "models", `${className}.model.ts`);
    if (orm === "mongoose")
      return join(process.cwd(), "src", "models", `${className}.model.ts`);
    if (orm === "kysely")
      return join(process.cwd(), "src", "db", `${modelName}.types.ts`);
    return join(process.cwd(), "src", "entities", `${className}.entity.ts`);
  }

  private renderModelTemplate(
    orm: SupportedOrm,
    modelName: string,
    className: string,
  ): string {
    if (orm === "prisma") {
      return `model ${className} {
  id         String   @id @default(uuid())
  model      String
  modelId    String
  collection String
  fileName   String
  mimeType   String
  size       Int
  disk       String
  path       String
  url        String
  metadata   Json
  createdAt  DateTime @default(now())

  @@map("${modelName}")
}\n`;
    }

    if (orm === "drizzle") {
      return `import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ${modelName}Table = pgTable("${modelName}", {
  id: uuid("id").defaultRandom().primaryKey(),
  model: text("model").notNull(),
  modelId: text("model_id").notNull(),
  collection: text("collection").notNull().default("default"),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull().default(0),
  disk: text("disk").notNull().default("default"),
  path: text("path").notNull(),
  url: text("url").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});\n`;
    }

    return `// Replace with your ${orm} model/entity definition for '${modelName}'.\n`;
  }

  private resolveMigrationOutputPath(
    orm: SupportedOrm,
    timestamp: string,
    migrationName: string,
  ): string {
    if (orm === "prisma") {
      return join(
        process.cwd(),
        "prisma",
        "migrations",
        `${timestamp}_${migrationName}`,
        "migration.sql",
      );
    }

    if (orm === "drizzle") {
      return join(
        process.cwd(),
        "drizzle",
        `${timestamp}_${migrationName}.sql`,
      );
    }

    return join(
      process.cwd(),
      "src",
      "migrations",
      `${timestamp}_${migrationName}.ts`,
    );
  }

  private renderMigrationTemplate(
    orm: SupportedOrm,
    timestamp: string,
    migrationName: string,
  ): string {
    if (orm === "prisma") {
      return `-- Prisma migration: ${timestamp}_${migrationName}\n-- Write SQL for your provider here.\n`;
    }

    if (orm === "drizzle") {
      return `-- Drizzle migration: ${timestamp}_${migrationName}\n-- Example:\n-- CREATE TABLE media (...);\n`;
    }

    return `// Migration: ${timestamp}_${migrationName}\nexport async function up(): Promise<void> {\n  // TODO\n}\n\nexport async function down(): Promise<void> {\n  // TODO\n}\n`;
  }

  private getTimestamp(): string {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");

    return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
  }

  private toSnakeCase(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  private toPascalCase(value: string): string {
    return value
      .split(/[^a-zA-Z0-9]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  private async readOrCreateConfig(path: string): Promise<DroppConfig> {
    try {
      await access(path, constants.F_OK);
      const raw = await readFile(path, "utf8");
      return JSON.parse(raw) as DroppConfig;
    } catch {
      return {
        orm: {
          driver: "json",
        },
        storage: {
          driver: "local",
          local: {
            baseDir: "media",
            baseUrl: "/media",
          },
        },
        queue: {
          enabled: false,
        },
      };
    }
  }
}
