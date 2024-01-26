import { AtcConfiguration, AtcDataCell } from 'src/utils/types';
import { moment } from 'obsidian';
import {
  DEFAULT_BOOL_YES_INPUT,
  DEFAULT_BOOL_NO_INPUT,
  DEFAULT_TIME_FORMAT,
} from 'src/utils/sharedConstants';

const DOM_DATE_PICKER_FORMAT = 'YYYY-MM-DD';
const DOM_TIME_PICKER_FORMAT = 'HH:mm';
const DOM_DATETIME_PICKER_FORMAT = 'YYYY-MM-DDTHH:mm';

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

function makeButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.innerHTML = text;

  button.style.fontSize = 'var(--font-smallest)';
  button.style.height = '20px';
  button.style.padding = '3px';
  button.style.padding = '3px';

  button.style.marginRight = '5px';
  button.addEventListener('click', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    onClick();
  });

  return button;
}

function makeContainer(): HTMLDivElement {
  const container = document.createElement('div');

  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.alignContent = 'center';
  container.style.justifyContent = 'center';
  container.style.justifyItems = 'center';

  return container;
}

export function makeEditor(
  td: HTMLElement,
  cell: AtcDataCell,
  configuration: AtcConfiguration,
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
        td.innerHTML = '';

        // Editor
        editor = document.createElement('div');
        editor.innerHTML = cell.rawValue;
        editor.setAttribute('contenteditable', 'true');

        // Cancel button
        const cancelButton = makeButton('Cancel', () => {
          onChange(currentValue);
        });
        cancelButton.style.marginRight = '5px';

        // Ok button
        const okButton = makeButton('Done', () => {
          if (cell.column.type === 'number') {
            editor.innerHTML = editor.innerHTML.replace(/[^0-9]/g, '');
          }
          onChange(editor.innerHTML);
        });

        // Buttons strip
        const buttonsContainer = document.createElement('div');

        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(okButton);
        buttonsContainer.style.marginTop = '1em';

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
        td.innerHTML = '';

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
        const cancelButton = makeButton('Cancel', () => {
          onChange(currentValue);
        });
        cancelButton.style.marginRight = '5px';

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.style.marginTop = '1em';

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
        td.innerHTML = '';

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

        // Cancel button
        const cancelButton = makeButton('Cancel', () => {
          onChange(currentValue);
        });
        cancelButton.style.marginRight = '5px';

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.style.marginTop = '1em';

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
        td.innerHTML = '';

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

        // Cancel button
        const cancelButton = makeButton('Cancel', () => {
          onChange(currentValue);
        });
        cancelButton.style.marginRight = '5px';

        // Buttons strip
        const buttonsContainer = document.createElement('div');
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.style.marginTop = '1em';

        // Mount the components
        td.appendChild(checkboxContainer);
        td.appendChild(buttonsContainer);
      };

      td.addEventListener('click', onClickHandler);

      break;
    }
  }
}
