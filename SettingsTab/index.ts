import { App, PluginSettingTab, Setting } from 'obsidian';
import AdvancedTableControlsPlugin from 'main';

export type AdvancedTableControlsPluginSettings = {
  defaultDateFormat: string;
};

export const DEFAULT_SETTINGS: AdvancedTableControlsPluginSettings = {
  defaultDateFormat: 'yyyy-MM-dd',
};

export class SettingTab extends PluginSettingTab {
  plugin: AdvancedTableControlsPlugin;

  constructor(app: App, plugin: AdvancedTableControlsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h3', { text: 'Advanced table control settings' });

    new Setting(containerEl)
      .setName('Default date format')
      .setDesc('In date-fns format')
      .addText((text) =>
        text
          .setValue(this.plugin.settings.defaultDateFormat)
          .onChange(async (value) => {
            this.plugin.settings.defaultDateFormat = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
