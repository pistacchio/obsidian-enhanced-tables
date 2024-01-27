import { App, MarkdownPostProcessorContext, parseYaml } from 'obsidian';
import {
  ET_RENDER_TABLE_ATTRIBUTE,
  ET_YAML_SIGNAL,
} from 'src/utils/sharedConstants';
import { EtConfiguration, RawTableData } from 'src/utils/types';
import { EnhancedTables } from 'src/EnhancedTables';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { validateConfiguration } from 'src/utils/validation';

export type MountContext = [
  HTMLElement,
  EtConfiguration,
  HTMLTableElement,
  RawTableData,
];

export async function getMountContext(
  element: HTMLElement,
  ctx: MarkdownPostProcessorContext,
): Promise<MountContext | null | string> {
  // The timeout is necessary to give Obsidian time to render the whole page
  // or else it would be impossible to find the table (since that would not
  // have been rendered yet(
  return new Promise((resolve) => {
    setTimeout(() => {
      let yamlCodeEl = element.find('code.language-yaml');
      let tableEl = element.find('table') as HTMLTableElement;

      // Neither a <code> or a <table> element. No need to continue
      if (!yamlCodeEl && !tableEl) {
        return resolve(null);
      }

      // Since the plugin can be triggered from either changes to the table or
      // changes to the yaml code, make sure that the yaml code configuration has
      // a table after it or that the table has a yaml code before it
      if (yamlCodeEl && !tableEl) {
        const tableElement = lookDownForTheTable(element);

        if (tableElement) {
          tableEl = tableElement;
        }
      }

      if (tableEl && !yamlCodeEl) {
        const yamlCodeElement = lookUpForTheYamlCode(element);
        if (yamlCodeElement) {
          yamlCodeEl = yamlCodeElement;
        }
      }

      // <code> not followed by <table> or a <table> not preceded by <code>
      if (!tableEl || !yamlCodeEl) {
        return resolve(null);
      }

      const configurationString = extractYamlCodeFromTheCodeBlock(
        yamlCodeEl,
        ctx,
      );

      if (!configurationString) {
        return resolve(null);
      }

      let configuration: EtConfiguration;
      try {
        configuration = parseYaml(configurationString);
      } catch (e) {
        return resolve('Cannot parse the yaml configuration');
      }

      const validOrValidationMessage = validateConfiguration(configuration);

      if (validOrValidationMessage !== true) {
        return resolve(validOrValidationMessage);
      }

      const tableData = extractRawTableData(tableEl);

      return resolve([yamlCodeEl, configuration, tableEl, tableData]);
    }, 0);
  });
}

export function mountEnhancedTables(
  app: App,
  yamlCodeEl: HTMLElement,
  configuration: EtConfiguration,
  tableEl: HTMLTableElement,
  tableData: RawTableData,
) {
  Array.from(
    document.querySelectorAll(`div[${ET_RENDER_TABLE_ATTRIBUTE}]`),
  ).forEach((e) => e.remove());

  const rootElement = document.createElement('div');
  rootElement.setAttribute(ET_RENDER_TABLE_ATTRIBUTE, 'true');
  tableEl.after(rootElement);
  tableEl.className = 'enhanced-tables-hidden';

  if (configuration['hide-configuration']) {
    yamlCodeEl.parentElement?.remove();
  }

  createRoot(rootElement).render(
    <EnhancedTables
      app={app}
      configuration={configuration}
      tableData={tableData}
    />,
  );
}

function extractYamlCodeFromTheCodeBlock(
  yamlCodeEl: HTMLElement,
  ctx: MarkdownPostProcessorContext,
): string | null {
  try {
    const sectionInfo = ctx.getSectionInfo(yamlCodeEl);
    const pageLines = sectionInfo?.text.split('\n');

    if (!pageLines?.[sectionInfo!.lineStart].startsWith(ET_YAML_SIGNAL)) {
      return null;
    }

    const yamlCode = pageLines
      ?.slice(sectionInfo!.lineStart + 1, sectionInfo?.lineEnd)
      ?.join('\n');

    return yamlCode ?? null;
  } catch (e) {
    console.error('Cannot get the yaml configuration');
    console.error(e);
    return null;
  }
}

function lookDownForTheTable(element: HTMLElement): HTMLTableElement | null {
  function recurseFindTable(element: Element): Element | null {
    if (element.tagName?.toUpperCase() === 'TABLE') {
      return element;
    }

    for (const child of Array.from(element.children)) {
      const foundTable = recurseFindTable(child);
      if (foundTable) {
        return foundTable;
      }
    }

    return null;
  }

  let nextSibling = element.nextSibling;
  while (nextSibling) {
    const foundTable = recurseFindTable(nextSibling as Element);
    if (foundTable) {
      return foundTable as HTMLTableElement;
    }
    nextSibling = nextSibling.nextSibling;
  }

  return null;
}

function lookUpForTheYamlCode(element: HTMLElement): HTMLElement | null {
  function recurseFindYamlCode(element: Element): Element | null {
    if (element.tagName?.toUpperCase() === 'CODE') {
      return element;
    }

    for (const child of Array.from(element.children)) {
      const foundTable = recurseFindYamlCode(child);
      if (foundTable) {
        return foundTable;
      }
    }

    return null;
  }

  let previousSibling = element.previousSibling;
  while (previousSibling) {
    const foundYamlCode = recurseFindYamlCode(previousSibling as Element);
    if (foundYamlCode) {
      return foundYamlCode as HTMLTableElement;
    }
    previousSibling = previousSibling.nextSibling;
  }

  return null;
}

function extractRawTableData(element: HTMLTableElement): RawTableData {
  const columns = (element.findAll('thead > tr > th') ?? []).map(
    (cell) => cell.innerHTML,
  );

  const rows = (element.findAll('tbody > tr') ?? []).map(
    (row: HTMLTableRowElement) => {
      return row
        .findAll('td')
        .map((cell: HTMLTableCellElement) => cell.innerHTML);
    },
  );

  return { columns, rows };
}
