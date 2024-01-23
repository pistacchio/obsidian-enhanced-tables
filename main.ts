import { Plugin } from 'obsidian';
import { getMountContext, mountAdvancedTableControls } from 'src/utils/mount';

export default class AdvancedTableControlsPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor(async (el, ctx) => {
      const possibleMountContext = await getMountContext(el, ctx);

      if (possibleMountContext) {
        const [yamlCodeEl, configuration, tableEl, tableData] =
          possibleMountContext;

        setTimeout(() => {
          mountAdvancedTableControls(
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
