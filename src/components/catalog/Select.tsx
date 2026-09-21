'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import styles from './Filters.module.css';

type Option = { value: string; label: string };

type SelectProps = {
  label: string;
  value: string;
  placeholder: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export function Select({ label, value, placeholder, options, onChange, disabled, error }: SelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeaheadRef = useRef({ value: '', lastTime: 0 });
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled || options.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex(open
          ? (activeIndex + direction + options.length) % options.length
          : Math.max(0, selectedIndex));
        setOpen(true);
        return;
      }
      case 'Home':
      case 'End':
        event.preventDefault();
        setOpen(true);
        setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) choose(activeIndex);
        else {
          setActiveIndex(Math.max(0, selectedIndex));
          setOpen(true);
        }
        return;
      case 'Escape':
        if (open) event.preventDefault();
        setOpen(false);
        return;
      case 'Tab':
        setOpen(false);
        return;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) return;
        const now = Date.now();
        const prior = now - typeaheadRef.current.lastTime < 700 ? typeaheadRef.current.value : '';
        const search = `${prior}${event.key}`.toLocaleLowerCase();
        typeaheadRef.current = { value: search, lastTime: now };
        const index = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(search));
        if (index >= 0) {
          event.preventDefault();
          setActiveIndex(index);
          setOpen(true);
        }
      }
    }
  }

  return (
    <div ref={wrapperRef} className={styles.selectField}>
      <span id={`${id}-label`} className={styles.label}>{label}</span>
      <button
        type="button"
        role="combobox"
        className={`${styles.selectButton} ${error ? styles.invalid : ''}`}
        aria-labelledby={`${id}-label ${id}-value`}
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => {
          setActiveIndex(Math.max(0, selectedIndex));
          setOpen((current) => !current);
        }}
      >
        <span id={`${id}-value`} className={styles.selectValue}>{value && selected ? selected.label : placeholder}</span>
        <BsChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul ref={listRef} id={`${id}-listbox`} role="listbox" aria-labelledby={`${id}-label`} className={styles.options}>
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`${styles.option} ${index === activeIndex ? styles.activeOption : ''} ${option.value === value ? styles.selectedOption : ''}`}
              onPointerMove={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {error && <span id={`${id}-error`} className={styles.error}>{error}</span>}
    </div>
  );
}
