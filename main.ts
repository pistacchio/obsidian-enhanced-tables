import { Plugin } from 'obsidian';
import {
  AdvancedTableControlsPluginSettings,
  DEFAULT_SETTINGS,
  SettingTab,
} from 'SettingsTab';
import { getMountContext, mountAdvancedTableControls } from 'src/utils/mount';

export default class AdvancedTableControlsPlugin extends Plugin {
  settings: AdvancedTableControlsPluginSettings;

  async onload() {
    await this.loadSettings();

    this.registerMarkdownPostProcessor(async (el, ctx) => {
      const possibleMountContext = await getMountContext(el, ctx);

      if (possibleMountContext) {
        const [yamlCodeEl, configuration, tableEl, tableData] =
          possibleMountContext;

        mountAdvancedTableControls(
          yamlCodeEl,
          configuration,
          tableEl,
          tableData,
        );
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
