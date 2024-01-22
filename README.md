# obsidian-advanced-table-controls
A plugin for Obsidian to add advanced controls (like sorting and filtering) to standard markup tables


## Doc / esempio

```yaml atc

# Config example

# date-format: DD-MM-YYYY
columns:
  Column 2:
    alias: column2
    type: number
    number-format: ''
  Column 3:
    alias: column3
    type: number
    number-format: "style: 'currency', currency: 'EUR'"
  Date column:
    alias: dateColumn
    type: date
    date-format: YYYY/MM/DD
  Column 4:
    formatter: "`<span style='color: green'>${$cell}</span> (${$row.column2})`"
  Hidden column:
    hidden: true
  Enum column:
    alias: enumColumn
    type: enum
    enum:
      '1': '⭐️'
      '2': '⭐️⭐️'
      '3': '⭐️⭐️⭐️'
      '4': '⭐️⭐️⭐️⭐️'
      '5': '⭐️⭐️⭐️⭐️⭐️'
filter: $row.column2 !== 3
#  it also has access to $data
sort: dateColumn
# sort: -column3
filters:
 High score: $row.enumColumn > 2
 Column 2 equals 3: $row.column2 === 3
pagination:
  page-size: 10
  page-sizes:
   - 10
   - 20
   - 30
# hide-controls: true
# hide-configuration: true

```


| Column 1 | Column 2 | Column 3 | Date column | Normal column | Column 4 | Hidden column | Enum column |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Val 1 | 1 | 1000 | 20-05-1981 | _**Bold**_ | some colored text | Hidden | 2 |
| Val 2 | 2 | 50 |  |  |  | Hidden | 5 |
| This will be filtered out | 3 | 0 |  |  |  |  | 2 |
| Val 4 | 4 | 2500 | 25-05-1981 | ~~strike~~ |  |  | 3 |
