import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type PaginationOptions = {
  pageSize: number;
  pageNumber: number;
};

export type PaginationViewProps = {
  value: PaginationOptions;
  onChange: (val: PaginationOptions) => void;

  pageSizeOptions: number[];

  totalNumberOfItems: number;
};

export const DEFAULT_MAX_BUTTONS = 3;

export const PaginationView: React.FC<PaginationViewProps> = ({
  pageSizeOptions,

  value,
  onChange,

  totalNumberOfItems,
}) => {
  const [pageNumber, setPageNumber] = useState<number>(value.pageNumber);
  const [pageSize, setPageSize] = useState<number>(value.pageSize);

  const [totalNumberOfPages, setTotalNumberOfPages] = useState<number>(
    Math.ceil(totalNumberOfItems / pageSize),
  );

  const pages = useMemo<number[]>(() => {
    const numberOfPages = Math.ceil(totalNumberOfItems / pageSize);
    setTotalNumberOfPages(numberOfPages);

    // Display all the pages if no "max pages" is used or there are less pages
    // than the ones specified by "max pages"
    if (numberOfPages <= DEFAULT_MAX_BUTTONS) {
      return Array.from({ length: numberOfPages }, (_, idx) => idx + 1);
    }

    // Compute the array of the pages to render before the current one
    const firstPageBeforeTheCurrentOne = Math.max(
      1,
      Math.min(
        pageNumber - Math.floor(DEFAULT_MAX_BUTTONS / 2),
        numberOfPages - DEFAULT_MAX_BUTTONS + 1,
      ),
    );
    const pagesBeforeTheCurrentOne = Array.from(
      { length: pageNumber - firstPageBeforeTheCurrentOne },
      (_, idx) => firstPageBeforeTheCurrentOne + idx,
    );

    // Compute the array of the pages to render after the current one
    const lastPageAfterTheCurrentOne = Math.min(
      numberOfPages,
      Math.max(
        pageNumber + Math.floor(DEFAULT_MAX_BUTTONS / 2),
        DEFAULT_MAX_BUTTONS,
      ),
    );
    const pagesAfterTheCurrentOne = Array.from(
      { length: lastPageAfterTheCurrentOne - pageNumber },
      (_, idx) => pageNumber + idx + 1,
    );

    return [
      ...pagesBeforeTheCurrentOne,
      pageNumber,
      ...pagesAfterTheCurrentOne,
    ];
  }, [pageSize, pageNumber, totalNumberOfItems]);

  const changePage = useCallback(
    (pageNumber: number) => {
      setPageNumber(pageNumber);
      if (onChange) {
        onChange({ pageSize, pageNumber });
      }
    },
    [onChange, pageSize],
  );

  // Reflect internally any change to the external pagination
  useEffect(() => {
    if (value) {
      if (value.pageNumber) {
        setPageNumber(value.pageNumber);
      }

      if (value.pageSize) {
        setPageSize(value.pageSize);
      }
    }
  }, [value]);

  return (
    <Fragment>
      <div className="enhanced-tables-pagination">
        <div className="d-flex flex-wrap py-2 mr-3 ">
          {totalNumberOfItems > pageSize && (
            <Fragment>
              <button
                disabled={pageNumber === 1}
                onClick={() => changePage(1)}
                className="pag-nav-first"
              >
                &lt;&lt;
              </button>

              <button
                className="pag-nav-prev"
                disabled={pageNumber === 1}
                onClick={() => changePage(pageNumber - 1)}
              >
                &lt;
              </button>

              {pages[0] !== 1 && (
                <button
                  disabled
                  style={{ backgroundColor: 'transparent' }}
                  className="pag-nav-dots"
                >
                  ...
                </button>
              )}

              {pages.map((page) => (
                <button
                  className={`${page === pageNumber ? 'active' : undefined} pag-nav-page`}
                  key={page}
                  onClick={() => changePage(page)}
                >
                  {page}
                </button>
              ))}

              {pages[pages.length - 1] !== totalNumberOfPages && (
                <button
                  className="pag-nav-dots"
                  disabled
                  style={{ backgroundColor: 'transparent', color: '#7e8299' }}
                >
                  ...
                </button>
              )}

              <button
                className="pag-nav-next"
                disabled={pageNumber === totalNumberOfPages}
                onClick={() => changePage(pageNumber + 1)}
              >
                &gt;
              </button>

              <button
                className="pag-nav-last"
                disabled={pageNumber === totalNumberOfPages}
                onClick={() => changePage(totalNumberOfPages)}
              >
                &gt;&gt;
              </button>
            </Fragment>
          )}

          <div className="total">
            <div>Total: {totalNumberOfItems}</div>
          </div>
        </div>

        <div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              onChange({ pageSize: Number(e.target.value), pageNumber });
            }}
          >
            {pageSizeOptions.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Fragment>
  );
};
