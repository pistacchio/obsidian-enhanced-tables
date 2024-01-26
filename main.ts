import { Plugin } from 'obsidian';
import { getMountContext, mountEnhancedTables } from 'src/utils/mount';
import { TableManager } from 'src/TableManager';

export default class EnhancedTablesPlugin extends Plugin {
  public tableManager = new TableManager();

  async onload() {
    this.registerMarkdownPostProcessor(async (el, ctx) => {
      const possibleMountContext = await getMountContext(el, ctx);

      if (possibleMountContext) {
        const [yamlCodeEl, configuration, tableEl, tableData] =
          possibleMountContext;

        setTimeout(() => {
          mountEnhancedTables(
            this.app,
            yamlCodeEl,
            configuration,
            tableEl,
            tableData,
          );
        }, 300);
      }
    }, 1);
  }
}
