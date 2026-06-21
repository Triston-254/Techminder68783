import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { hasEmailInput, isValidEmail, shouldDeferValidCheck } from '../utils/validation';

function AuthEmailInput({
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  label,
  placeholder,
  required = false,
  autoComplete = 'email',
  readOnly = false,
  className = 'mb-3',
}) {
  const { page } = useLanguage();
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (!isFocused) {
      setDebouncedValue(value);
      return undefined;
    }

    const timer = window.setTimeout(() => setDebouncedValue(value), 500);
    return () => window.clearTimeout(timer);
  }, [value, isFocused]);

  const validationValue = isFocused ? debouncedValue : value;
  const isValid = isValidEmail(validationValue);
  const deferCheck = isFocused && shouldDeferValidCheck(value);
  const showValidCheck = isValid && !deferCheck;
  const showInvalid = touched && hasEmailInput(value) && !isValid;

  const handleBlur = (event) => {
    setIsFocused(false);
    setTouched(true);
    setDebouncedValue(value);
    onBlur?.(event);
  };

  const handleFocus = (event) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const inputClassName = [
    'form-control',
    'form-control-lg',
    'auth-input',
    showValidCheck ? 'auth-input-with-check' : '',
    showInvalid ? 'auth-input-invalid auth-input-with-check' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label auth-label">{label}</label>
      <div className="auth-email-wrap">
        <input
          id={id}
          name={name}
          type="email"
          className={inputClassName}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          aria-invalid={showInvalid ? 'true' : 'false'}
          aria-describedby={showInvalid ? `${id}-error` : undefined}
        />
        {showValidCheck && (
          <span className="auth-email-valid-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        )}
        {showInvalid && (
          <span
            id={`${id}-error`}
            className="auth-email-invalid-check"
            title={page.authEmailInvalid}
            role="alert"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            <span className="visually-hidden">{page.authEmailInvalid}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default AuthEmailInput;
