'use client';

import { useId, useRef, type FormEvent } from 'react';
import { BsExclamationCircle } from 'react-icons/bs';
import type { FilterOptions } from '@/types/car';
import type { FilterDraft } from '@/lib/validation';
import { Select } from './Select';
import styles from './Filters.module.css';

export type FilterErrors = Partial<Record<keyof FilterDraft, string>>;

type FiltersProps = {
  draft: FilterDraft;
  errors: FilterErrors;
  options?: FilterOptions;
  optionsPending: boolean;
  busy: boolean;
  onChange: (field: keyof FilterDraft, value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

function getPriceOptions(range?: FilterOptions['price']) {
  if (!range) return [];
  const values = new Set([range.min, range.max]);
  for (let value = Math.ceil(range.min / 10) * 10; value <= range.max; value += 10) values.add(value);
  return [...values].sort((a, b) => a - b).map((price) => ({ value: String(price), label: `To $${price}` }));
}

export function Filters({ draft, errors, options, optionsPending, busy, onChange, onSearch, onClear }: FiltersProps) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch();
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form} aria-label="Filter cars" noValidate>
      <div className={styles.brand}>
        <Select
          label="Car brand"
          value={draft.brand}
          placeholder={optionsPending ? 'Loading brands…' : 'Choose a brand'}
          options={[{ value: '', label: 'All brands' }, ...(options?.brands ?? []).map((brand) => ({ value: brand, label: brand }))]}
          onChange={(value) => onChange('brand', value)}
          disabled={!options}
          error={errors.brand}
        />
      </div>
      <div className={styles.price}>
        <Select
          label="Price / 1 hour"
          value={draft.price}
          placeholder={optionsPending ? 'Loading prices…' : 'Choose a price'}
          options={[{ value: '', label: 'Any price' }, ...getPriceOptions(options?.price)]}
          onChange={(value) => onChange('price', value)}
          disabled={!options}
          error={errors.price}
        />
      </div>
      <fieldset className={styles.mileage}>
        <legend className={styles.label}>Car mileage / km</legend>
        <div className={styles.mileageControls}>
          {(['minMileage', 'maxMileage'] as const).map((field) => (
            <div key={field} className={styles.mileageField}>
              <div className={`${styles.mileageInput} ${errors[field] ? styles.invalid : ''}`}>
                <label htmlFor={`${id}-${field}`}>{field === 'minMileage' ? 'From' : 'To'}</label>
                <input
                  id={`${id}-${field}`}
                  name={field}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={draft[field]}
                  aria-label={field === 'minMileage' ? 'Minimum mileage in kilometers' : 'Maximum mileage in kilometers'}
                  aria-invalid={Boolean(errors[field])}
                  aria-describedby={errors[field] ? `${id}-${field}-error` : undefined}
                  onChange={(event) => onChange(field, event.target.value)}
                />
              </div>
              {errors[field] && (
                <span id={`${id}-${field}-error`} className={styles.error}>
                  <BsExclamationCircle aria-hidden="true" />{errors[field]}
                </span>
              )}
            </div>
          ))}
        </div>
      </fieldset>
      <div className={styles.actions}>
        <button type="submit" className={`button ${styles.search}`} disabled={busy}>{busy ? 'Searching…' : 'Search'}</button>
        <button type="button" className={styles.clear} onClick={onClear} disabled={busy}>Clear filters</button>
      </div>
    </form>
  );
}
