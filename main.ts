import { Plugin } from 'obsidian';
import {
  getMountContext,
  MountContext,
  mountEnhancedTables,
} from 'src/utils/mount';
import { TableManager } from 'src/TableManager';

function isError(possibleMountContext: any): possibleMountContext is string {
  return typeof possibleMountContext === 'string';
}

export default class EnhancedTablesPlugin extends Plugin {
  public tableManager = new TableManager();

  async onload() {
    this.registerMarkdownPostProcessor(async (el, ctx) => {
      const possibleMountContext = await getMountContext(el, ctx);

      if (!possibleMountContext) {
        return;
      }

      if (isError(possibleMountContext)) {
        const errorsContainer = el.createDiv({ cls: 'enhanced-tables-errors' });

        errorsContainer.createDiv({
          text: `⚠️ Validation errors:`,
          cls: 'enhanced-tables-error',
        });

        errorsContainer.createDiv({
          text: `- ${possibleMountContext}`,
          cls: 'enhanced-tables-error',
        });

        return;
      }

      const [yamlCodeEl, configuration, tableEl, tableData] =
        possibleMountContext as MountContext;

      setTimeout(() => {
        mountEnhancedTables(
          this.app,
          yamlCodeEl,
          configuration,
          tableEl,
          tableData,
        );
      }, 300);
    }, 1);
  }
}
