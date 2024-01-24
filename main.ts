import { Plugin } from 'obsidian';
import { getMountContext, mountAdvancedTableControls } from 'src/utils/mount';
import { TableManager } from 'src/TableManager';

export default class AdvancedTableControlsPlugin extends Plugin {
  public tableManager = new TableManager();

  async onload() {
    this.registerMarkdownPostProcessor(async (el, ctx) => {
      const possibleMountContext = await getMountContext(el, ctx);

      if (possibleMountContext) {
        const [yamlCodeEl, configuration, tableEl, tableData] =
          possibleMountContext;

        setTimeout(() => {
          mountAdvancedTableControls(
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
