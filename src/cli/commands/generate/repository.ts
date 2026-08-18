import { Args, Command, Flags } from "@oclif/core";
import { access, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import type { DroppConfig } from "../../../types/index.js";
import {
  ORM_OPTIONS,
  renderRepositoryTemplate,
  type SupportedOrm,
} from "../../templates/repository.js";

export default class GenerateRepository extends Command {
  static override description =
    "Generate a dropp.repository.ts template and wire dropp.config.json";

  static override args = {
    orm: Args.string({
      description: "Target ORM template",
      required: true,
      options: ORM_OPTIONS as unknown as string[],
    }),
  };

  static override flags = {
    force: Flags.boolean({
      char: "f",
      description: "Overwrite existing dropp.repository.ts",
      default: false,
    }),
    configOnly: Flags.boolean({
      description: "Only patch dropp.config.json without writing template file",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GenerateRepository);
    const orm = args.orm as SupportedOrm;

    const repositoryTsPath = join(process.cwd(), "dropp.repository.ts");

    if (!flags.configOnly) {
      await this.ensureWritable(repositoryTsPath, flags.force);
      await writeFile(
        repositoryTsPath,
        renderRepositoryTemplate(orm),
        "utf8",
      );
      this.log(`Generated template: ${repositoryTsPath}`);
    }

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
    this.log(`Updated config: ${configPath}`);
    this.log(
      "Note: compile dropp.repository.ts to dropp.repository.js before runtime.",
    );
  }

  private async ensureWritable(path: string, force: boolean): Promise<void> {
    try {
      await access(path, constants.F_OK);
    } catch {
      return;
    }

    if (!force) {
      throw new Error(`${path} already exists. Use --force to overwrite.`);
    }
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
