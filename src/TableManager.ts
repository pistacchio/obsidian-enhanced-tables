import { isBlockScopeBoundary } from 'tsutils';

const SUB_HEADER_LINE_REGEX = /^\|\s*-[-\s|]*?-\s*\|$/gm;
const LINE_REGEX = /^\|.*?\|$/gm;

export type LineValues = string[];
type BlockOfText = {
  type: 'text' | 'table';
  lines: string[];
};

class TableDocument {
  blocks: BlockOfText[];

  constructor(fileContent: string) {
    this.blocks = TableDocument.documentToBlocks(fileContent);
  }

  public toString() {
    return this.blocks.flatMap((b) => b.lines).join('\n');
  }

  public getTable(index: number) {
    return this.blocks.filter((b) => b.type === 'table')[index];
  }

  public hasTables() {
    return this.blocks.some((b) => b.type === 'table');
  }

  private static documentToBlocks(fileContent: string): BlockOfText[] {
    const lines = fileContent.split('\n');

    const blocksOfText: BlockOfText[] = [];
    let currentBlockOfText: BlockOfText | null = null;

    for (let lineNo = 0; lineNo < lines.length; lineNo++) {
      const line = lines[lineNo];

      // Check if the current line is the beginning of a line table
      if (
        line.match(LINE_REGEX) &&
        lines[lineNo + 1]?.match(SUB_HEADER_LINE_REGEX)
      ) {
        // Archive the eventual previous block of code;
        if (currentBlockOfText) {
          blocksOfText.push(currentBlockOfText);
        }

        currentBlockOfText = { lines: [line], type: 'table' };

        continue;
      }

      // The current line is not the beginning of a table. If we are adding a table,
      // add the line if it is a table line or close the block of text and start a text
      // one
      if (currentBlockOfText?.type === 'table') {
        if (line.match(LINE_REGEX)) {
          currentBlockOfText.lines.push(line);
          continue;
        }

        blocksOfText.push(currentBlockOfText);

        currentBlockOfText = { lines: [line], type: 'text' };
        continue;
      }

      // Not adding a table. Just add the current like
      if (!currentBlockOfText) {
        currentBlockOfText = { lines: [], type: 'text' };
      }

      currentBlockOfText.lines.push(line);
    }

    // All lines scanned. Add the current block
    if (currentBlockOfText) {
      blocksOfText.push(currentBlockOfText);
    }

    return blocksOfText;
  }
}

export class TableManager {
  public insertLine(
    fileContent: string,
    lineNo: number,
    values: LineValues,
    tableIndex: number = 0,
  ): string {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.hasTables()) {
      return fileContent;
    }

    const tableBlock = tableDocument.getTable(tableIndex);

    if (!tableBlock) {
      return fileContent;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableBlock.lines.length;
    }

    tableBlock.lines.splice(targetLineNo, 0, this.valuesToLine(values));

    return tableDocument.toString();
  }

  public modifyLine(
    fileContent: string,
    lineNo: number,
    values: LineValues,
    tableIndex: number = 0,
  ): string {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.hasTables()) {
      return fileContent;
    }

    const tableBlock = tableDocument.getTable(tableIndex);

    if (!tableBlock) {
      return fileContent;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableBlock.lines.length;
    }

    if (!tableBlock.lines.hasOwnProperty(targetLineNo)) {
      return fileContent;
    }

    tableBlock.lines[lineNo + 2] = this.valuesToLine(values);

    return tableDocument.toString();
  }

  public modifyHeader(
    fileContent: string,
    values: LineValues,
    tableIndex: number = 0,
  ): string {
    return this.modifyLine(fileContent, -2, values, tableIndex);
  }

  public removeLine(
    fileContent: string,
    lineNo: number,
    tableIndex: number = 0,
  ): string {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.hasTables()) {
      return fileContent;
    }

    const tableBlock = tableDocument.getTable(tableIndex);

    if (!tableBlock) {
      return fileContent;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableBlock.lines.length;
    }

    tableBlock.lines.splice(targetLineNo, 1);

    return tableDocument.toString();
  }

  public readLine(
    fileContent: string,
    lineNo: number,
    tableIndex: number = 0,
  ): LineValues | null {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.hasTables()) {
      return null;
    }

    const tableBlock = tableDocument.getTable(tableIndex);

    if (!tableBlock) {
      return null;
    }

    let targetLineNo = lineNo + 2;
    // Line number -1 is to be considered "last line"
    if (lineNo === -1) {
      targetLineNo = tableBlock.lines.length;
    }

    const line = tableBlock.lines.at(targetLineNo);

    if (line) {
      return this.lineToValues(line);
    }

    return null;
  }

  public readTableLines(
    fileContent: string,
    tableIndex: number = 0,
  ): LineValues[] | null {
    const tableDocument = new TableDocument(fileContent);

    if (!tableDocument.hasTables()) {
      return null;
    }

    const tableBlock = tableDocument.getTable(tableIndex);

    if (!tableBlock) {
      return null;
    }

    return tableBlock.lines.map((l) => this.lineToValues(l));
  }

  private valuesToLine(values: LineValues): string {
    return `|${values.map((v) => v.trim()).join('|')}|`;
  }

  private lineToValues(line: string): LineValues {
    return line.replace(/^\|/, '').replace(/\|$/, '').split('|');
  }
}
