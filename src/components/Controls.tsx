import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { EtConfiguration, EtDataColumn } from 'src/utils/types';

type FiltersConfiguration = [string, string][];

const NONE_SELECTED_SIGNAL = '---';
const ASC = 'asc';
const DESC = 'desc';

type ControlsViewProps = {
  columns: EtDataColumn[];
  configuration: EtConfiguration;
  filtering: string | null;
  setFiltering: Dispatch<SetStateAction<string | null>>;
  sorting: string | null;
  setSorting: Dispatch<SetStateAction<string | null>>;
};

export const ControlsView: React.FC<ControlsViewProps> = ({
  columns,
  configuration,
  filtering,
  setFiltering,
  sorting,
  setSorting,
}) => {
  const [sortOrder, setSortOrder] = useState<string>(
    (sorting ?? '').startsWith('-') ? DESC : ASC,
  );
  const [innerSorting, setInnerSorting] = useState<string>(
    sorting ? sorting.replace(/^-/, '') : NONE_SELECTED_SIGNAL,
  );

  const filters = useMemo<FiltersConfiguration>(
    () =>
      [
        ...(configuration.filter ||
        Object.keys(configuration.filters ?? {}).length > 0
          ? [[NONE_SELECTED_SIGNAL, NONE_SELECTED_SIGNAL]]
          : []),
        ...(configuration.filter ? [['DEFAULT', configuration.filter]] : []),
        ...Object.entries(configuration.filters ?? {}),
      ] as FiltersConfiguration,
    [configuration.filter, configuration.filters],
  );

  useEffect(() => {
    if (innerSorting === NONE_SELECTED_SIGNAL) {
      setSorting(null);
    }
    setSorting(`${sortOrder === DESC ? '-' : ''}${innerSorting}`);
  }, [innerSorting, setSorting, sortOrder]);

  return (
    <div className="enhanced-tables-controls">
      <div className="sorting">
        <label>Sort</label>
        <div>
          <select
            value={innerSorting}
            onChange={(evt) => setInnerSorting(evt.target.value)}
          >
            <option value={NONE_SELECTED_SIGNAL}>{NONE_SELECTED_SIGNAL}</option>
            {(columns ?? []).map((c) => (
              <option key={c.alias} value={c.alias}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(evt) => setSortOrder(evt.target.value)}
          >
            <option value={ASC}>ASC</option>
            <option value={DESC}>DESC</option>
          </select>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="filtering">
          <label>Filter</label>
          <div>
            <select
              value={filtering ?? NONE_SELECTED_SIGNAL}
              onChange={(evt) =>
                setFiltering(
                  evt.target.value === NONE_SELECTED_SIGNAL
                    ? null
                    : evt.target.value,
                )
              }
            >
              {filters.map(([text, value]) => (
                <option key={text} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
