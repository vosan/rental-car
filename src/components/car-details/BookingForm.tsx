'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MdErrorOutline } from 'react-icons/md';
import { createBookingRequest } from '@/lib/api/cars';
import { getErrorMessage } from '@/lib/api/client';
import { validateBooking } from '@/lib/validation';
import type { BookingInput } from '@/types/car';
import styles from './BookingForm.module.css';

type BookingField = 'name' | 'email' | 'comment';
type FormValues = Record<BookingField, string>;
type FieldErrors = Partial<Record<BookingField, string>>;

const emptyValues: FormValues = { name: '', email: '', comment: '' };

export function BookingForm({ carId }: { carId: string }) {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const booking = useMutation({
    mutationFn: (input: BookingInput) => createBookingRequest(carId, input),
    retry: false,
    onSuccess: () => {
      setValues(emptyValues);
      setErrors({});
    },
  });

  function updateField(field: BookingField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    if (booking.isSuccess || booking.isError) booking.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (booking.isPending) return;

    const validation = validateBooking(values);
    setErrors(validation.errors);

    if (!validation.data) {
      const firstInvalid = validation.errors.name
        ? nameRef
        : validation.errors.email
          ? emailRef
          : commentRef;
      firstInvalid.current?.focus();
      return;
    }

    booking.mutate(validation.data);
  }

  function errorFor(field: BookingField) {
    return errors[field] ? `${formId}-${field}-error` : undefined;
  }

  return (
    <section className={styles.panel} aria-labelledby={`${formId}-title`}>
      <div className={styles.heading}>
        <h2 id={`${formId}-title`}>Book your car now</h2>
        <p>Stay connected! We are always ready to help you.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-busy={booking.isPending}>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label
              htmlFor={`${formId}-name`}
              className={errors.name ? styles.errorLabel : 'srOnly'}
            >
              Name<span aria-hidden="true">*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                ref={nameRef}
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Name*"
                required
                value={values.name}
                onChange={(event) => updateField('name', event.target.value)}
                disabled={booking.isPending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errorFor('name')}
                className={styles.input}
              />
              {errors.name && <MdErrorOutline className={styles.errorIcon} size={24} aria-hidden="true" />}
            </div>
            {errors.name && <p id={errorFor('name')} className={styles.fieldError}>{errors.name}</p>}
          </div>

          <div className={styles.field}>
            <label
              htmlFor={`${formId}-email`}
              className={errors.email ? styles.errorLabel : 'srOnly'}
            >
              Email<span aria-hidden="true">*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                ref={emailRef}
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email*"
                required
                value={values.email}
                onChange={(event) => updateField('email', event.target.value)}
                disabled={booking.isPending}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errorFor('email')}
                className={styles.input}
              />
              {errors.email && <MdErrorOutline className={styles.errorIcon} size={24} aria-hidden="true" />}
            </div>
            {errors.email && <p id={errorFor('email')} className={styles.fieldError}>{errors.email}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor={`${formId}-comment`} className="srOnly">Comment (optional)</label>
            <div className={styles.inputWrapper}>
              <textarea
                ref={commentRef}
                id={`${formId}-comment`}
                name="comment"
                placeholder="Comment"
                rows={3}
                value={values.comment}
                onChange={(event) => updateField('comment', event.target.value)}
                disabled={booking.isPending}
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errorFor('comment')}
                className={`${styles.input} ${styles.comment}`}
              />
              {errors.comment && <MdErrorOutline className={styles.errorIcon} size={24} aria-hidden="true" />}
            </div>
            {errors.comment && <p id={errorFor('comment')} className={styles.fieldError}>{errors.comment}</p>}
          </div>
        </div>

        <button type="submit" className={`button ${styles.submit}`} disabled={booking.isPending}>
          {booking.isPending ? 'Sending…' : 'Send'}
        </button>

        {booking.isError && (
          <p className={styles.requestError} role="alert">
            {getErrorMessage(booking.error)} Your details have been kept. Please try again.
          </p>
        )}
        <div className={styles.status} role="status" aria-live="polite" aria-atomic="true">
          {booking.isSuccess && (
            <p className={styles.success}>
              Your booking request was sent successfully. We’ll be in touch soon.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
