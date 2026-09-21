'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { BsExclamationCircle } from 'react-icons/bs';
import { getCars, getFilters } from '@/lib/api/cars';
import { ApiError, getErrorMessage } from '@/lib/api/client';
import { createEmptyFilterDraft, validateFilters, type FilterDraft } from '@/lib/validation';
import type { CarFilters } from '@/types/car';
import { Filters, type FilterErrors } from './Filters';
import { CarCard } from './CarCard';
import styles from './Catalog.module.css';

const PAGE_SIZE = 12;
const catalogPrefix = ['cars', 'catalog'] as const;
const catalogKey = (filters: CarFilters) => [...catalogPrefix, filters, PAGE_SIZE] as const;

function retryGet(failureCount: number, error: Error) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function Catalog() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<FilterDraft>(createEmptyFilterDraft);
  const [applied, setApplied] = useState<CarFilters>({});
  const [errors, setErrors] = useState<FilterErrors>({});
  const [applying, setApplying] = useState(false);
  const applyingRef = useRef(false);

  const filterQuery = useQuery({
    queryKey: ['cars', 'filters'],
    queryFn: ({ signal }) => getFilters(signal),
    staleTime: 5 * 60 * 1000,
    retry: retryGet,
  });

  const carsQuery = useInfiniteQuery({
    queryKey: catalogKey(applied),
    queryFn: ({ pageParam, signal }) => getCars(applied, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60 * 1000,
    retry: retryGet,
  });

  async function applyFilters(filters: CarFilters) {
    if (applyingRef.current) return;
    applyingRef.current = true;
    setApplying(true);
    try {
      await queryClient.cancelQueries({ queryKey: catalogPrefix });
      // Reset the destination as well as changing the key: revisiting cached filters
      // or submitting the same filters must discard every previously loaded page.
      setApplied(filters);
      await queryClient.resetQueries({ queryKey: catalogKey(filters), exact: true });
    } finally {
      applyingRef.current = false;
      setApplying(false);
    }
  }

  function handleSearch() {
    const result = validateFilters(draft);
    setErrors(result.errors);
    if (result.data) void applyFilters(result.data);
  }

  function handleClear() {
    if (applyingRef.current) return;
    setDraft(createEmptyFilterDraft());
    setErrors({});
    void applyFilters({});
  }

  function handleDraftChange(field: keyof FilterDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function loadMore() {
    if (carsQuery.hasNextPage && !carsQuery.isFetching && !applying) void carsQuery.fetchNextPage();
  }

  const allCars = carsQuery.data?.pages.flatMap((page) => page.cars) ?? [];
  const cars = allCars.filter((car, index) => allCars.findIndex((other) => other.id === car.id) === index);
  const totalCars = carsQuery.data?.pages[0]?.totalCars ?? 0;
  const initialLoading = carsQuery.isPending;

  return (
    <div className={`container ${styles.catalog}`}>
      <h1 className="srOnly">Find your rental car</h1>
      {filterQuery.isError && (
        <div className={styles.notice} role="alert">
          <BsExclamationCircle aria-hidden="true" />
          <p>We couldn’t load the filter options. {getErrorMessage(filterQuery.error)}</p>
          <button type="button" className={styles.textButton} onClick={() => void filterQuery.refetch()} disabled={filterQuery.isFetching}>Try again</button>
        </div>
      )}
      <Filters
        draft={draft}
        errors={errors}
        options={filterQuery.data}
        optionsPending={filterQuery.isPending}
        busy={applying}
        onChange={handleDraftChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />
      <section className={styles.results} aria-label="Available rental cars" aria-busy={carsQuery.isFetching || applying}>
        <p className="srOnly" role="status" aria-live="polite">
          {initialLoading ? 'Loading cars.' : carsQuery.isSuccess ? `${cars.length} of ${totalCars} cars shown.` : ''}
        </p>
        {initialLoading ? (
          <div className={styles.loading}>
            <div className={styles.skeletonGrid} aria-hidden="true">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <div className={styles.skeletonCard} key={index}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonShortLine} />
                  <div className={styles.skeletonButton} />
                </div>
              ))}
            </div>
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingPanel} aria-hidden="true">
                <span className={styles.spinner} />
                <span>Loading cars…</span>
              </div>
            </div>
          </div>
        ) : carsQuery.isError && !carsQuery.data ? (
          <div className={styles.errorState} role="alert">
            <BsExclamationCircle className={styles.errorIcon} aria-hidden="true" />
            <h2>We couldn’t load the cars</h2>
            <p>{getErrorMessage(carsQuery.error)}</p>
            <button type="button" className="button" onClick={() => void carsQuery.refetch()} disabled={carsQuery.isFetching}>Try again</button>
          </div>
        ) : cars.length === 0 ? (
          <div className={styles.empty}>
            <Image src="/images/no-cars.png" width={320} height={320} alt="" loading="eager" className={styles.emptyImage} />
            <h2>No cars found</h2>
            <p>We couldn’t find any cars matching your filters.<br />Try changing your search or reset the filters.</p>
            <button type="button" className="buttonSecondary" onClick={handleClear} disabled={applying}>Reset filters</button>
          </div>
        ) : (
          <>
            {carsQuery.isRefetchError && (
              <div className={styles.notice} role="alert">
                <BsExclamationCircle aria-hidden="true" />
                <p>We couldn’t refresh these results. {getErrorMessage(carsQuery.error)}</p>
                <button type="button" className={styles.textButton} onClick={() => void carsQuery.refetch()} disabled={carsQuery.isFetching}>Try again</button>
              </div>
            )}
            <ul className={styles.grid}>
              {/* Any image in the first desktop row can become the LCP element. */}
              {cars.map((car, index) => (
                <li key={car.id}>
                  <CarCard car={car} imageLoading={index < 4 ? 'eager' : 'lazy'} />
                </li>
              ))}
            </ul>
            {(carsQuery.hasNextPage || carsQuery.isFetchNextPageError) && (
              <div className={styles.pagination}>
                {carsQuery.isFetchNextPageError && <p className={styles.pageError} role="alert">We couldn’t load more cars. {getErrorMessage(carsQuery.error)}</p>}
                <button type="button" className={`button buttonSecondary ${styles.loadMore}`} onClick={loadMore} disabled={carsQuery.isFetching || applying}>
                  {carsQuery.isFetchingNextPage ? 'Loading…' : carsQuery.isFetchNextPageError ? 'Try again' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Catalog;
