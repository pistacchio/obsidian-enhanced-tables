import { EtConfiguration, EtDataCell } from 'src/utils/types';
import { moment } from 'obsidian';
import {
  DEFAULT_BOOL_YES_INPUT,
  DEFAULT_BOOL_NO_INPUT,
  DEFAULT_TIME_FORMAT,
} from 'src/utils/sharedConstants';

const DOM_DATE_PICKER_FORMAT = 'YYYY-MM-DD';

const DATEPICKER_TYPES = {
  date: 'date',
  datetime: 'datetime-local',
  time: 'time',
};

const DOM_DATE_FORMATS = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DDTHH:mm',
  time: 'HH:mm',
};

function makeButton(
  parent: Element,
  text: string,
  onClick: () => void,
  className?: string,
): HTMLButtonElement {
  const button = parent.createEl('button', {
    text,
    cls: `editor-button ${className ?? ''}`,
  });

  button.addEventListener('click', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    onClick();
  });

  return button;
}

function makeContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'editor-container';

  return container;
}

export function makeEditor(
  td: HTMLElement,
  cell: EtDataCell,
  configuration: EtConfiguration,
  onChange: (val: string) => void,
) {
  let type = cell.column.type;

  // Treat non-configured enums as strings
  if (type === 'enum' && !cell.column.enum) {
    type = 'string';
  }

  switch (type) {
    // `bool`.

    case 'string':
    case 'number': {
      let editor: HTMLElement;

      const currentValue = td.innerHTML;

      // On click, turn the cell into an editable one
      const onClickHandler = () => {
        td.removeEventListener('click', onClickHandler);
        td.textContent = '';

        // Editor
        editor = document.createElement('div');
        editor.innerHTML = cell.rawValue;
        editor.setAttribute('contenteditable', 'true');

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('editor-mt-1em');

        // Cancel button
        makeButton(
          buttonsContainer,
          'Cancel',
          () => {
            onChange(currentValue);
          },
          'editor-mr-5',
        );

        // Ok button
        makeButton(buttonsContainer, 'Done', () => {
          if (cell.column.type === 'number') {
            editor.innerHTML = editor.innerHTML.replace(/[^0-9]/g, '');
          }
          onChange(editor.innerHTML);
        });

        // Mount the components
        td.appendChild(editor);
        td.appendChild(buttonsContainer);
      };

      td.addEventListener('click', onClickHandler);

      td.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          onChange(editor.innerHTML);
        }
      });

      // Prevent writing non-numbers if editing a column of type number
      td.addEventListener('keydown', (e) => {
        if (cell.column.type === 'number') {
          if (!e.key.match(/[0-9.]/)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      });

      break;
    }
    case 'date':
    case 'datetime':
    case 'time': {
      const currentValue = td.innerHTML;
      const outputFormat = (() => {
        if (cell.column.type === 'time') {
          return DEFAULT_TIME_FORMAT;
        } else if (cell.column.type === 'datetime') {
          return configuration['datetime-format'];
        }

        return configuration['date-format'];
      })();
      const datePickerType =
        DATEPICKER_TYPES[cell.column.type as keyof typeof DATEPICKER_TYPES];
      const domDateFormat =
        DOM_DATE_FORMATS[cell.column.type as keyof typeof DATEPICKER_TYPES];

      const onClickHandler = () => {
        td.removeEventListener('click', onClickHandler);
        td.textContent = '';

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('editor-mt-1em');

        // Datepicker
        const datePickerContainer = makeContainer();

        const datePicker = document.createElement('input');
        datePicker.type = datePickerType;
        datePicker.value = cell.value
          ? cell.value.format(DOM_DATE_PICKER_FORMAT)
          : undefined;
        datePicker.addEventListener('change', (e) => {
          // @ts-ignore
          const selectedDate = moment(e.target.value, domDateFormat);
          onChange(moment(selectedDate).format(outputFormat));
        });
        datePickerContainer.appendChild(datePicker);

        // Cancel button
        makeButton(
          buttonsContainer,
          'Cancel',
          () => {
            onChange(currentValue);
          },
          'editor-mr-5',
        );

        // Buttons strip

        // Mount the components
        td.appendChild(datePickerContainer);
        td.appendChild(buttonsContainer);
      };

      td.addEventListener('click', onClickHandler);

      break;
    }
    case 'enum': {
      const currentValue = td.innerHTML;

      const onClickHandler = () => {
        td.removeEventListener('click', onClickHandler);
        td.textContent = '';

        // Select
        const selectContainer = makeContainer();
        const select = document.createElement('select');
        select.addEventListener('change', (e) => {
          // @ts-ignore
          const value = e.target.options[e.target.selectedIndex].value;

          onChange(value);
        });

        selectContainer.appendChild(select);

        for (const [enumValue, enumRepresentation] of Object.entries(
          cell.column.enum as Record<string, string>,
        )) {
          const option = document.createElement('option');
          option.value = enumValue;
          option.innerHTML = enumRepresentation;

          if (enumValue === cell.value) {
            option.selected = true;
          }

          select.appendChild(option);
        }

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('editor-mt-1em');

        // Cancel button
        makeButton(
          buttonsContainer,
          'Cancel',
          () => {
            onChange(currentValue);
          },
          'editor-mr-5',
        );

        // Mount the components
        td.appendChild(selectContainer);
        td.appendChild(buttonsContainer);
      };

      td.addEventListener('click', onClickHandler);

      break;
    }
    case 'bool': {
      const currentValue = td.innerHTML;

      const onClickHandler = () => {
        td.removeEventListener('click', onClickHandler);
        td.textContent = '';

        // Checkbox
        const checkboxContainer = makeContainer();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = cell.value;

        checkbox.addEventListener('change', () => {
          // @ts-ignore
          const value = checkbox.checked
            ? configuration['yes-format'] ?? (DEFAULT_BOOL_YES_INPUT as string)
            : configuration['no-format'] ?? (DEFAULT_BOOL_NO_INPUT as string);

          onChange(value);
        });

        checkboxContainer.appendChild(checkbox);

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('editor-mt-1em');

        // Cancel button
        makeButton(
          buttonsContainer,
          'Cancel',
          () => {
            onChange(currentValue);
          },
          'editor-mr-5',
        );

        // Mount the components
        td.appendChild(checkboxContainer);
        td.appendChild(buttonsContainer);
      };

      td.addEventListener('click', onClickHandler);

      break;
    }
  }
}
