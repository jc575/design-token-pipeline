import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonIntent = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'medium' | 'small';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight and meaning. Mirrors the Intent axis on the Figma Button component set. */
  intent?: ButtonIntent;
  /** Mirrors the Size axis in Figma. Both sizes keep a hit area of at least 24 by 24 CSS pixels (WCAG 2.5.8). */
  size?: ButtonSize;
  /**
   * Documentation only. Forces a visual state so Storybook can show hover and focus side by side,
   * the same way the Figma component set shows them. Never use this in product code.
   */
  previewState?: 'hover' | 'focus';
}

/**
 * Source of truth: the "Button" component set in the Figma file (Intent x Size x State).
 * Every color, spacing, radius, and font size comes from a token generated from Figma variables.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { intent = 'primary', size = 'medium', previewState, className, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={['ds-button', className].filter(Boolean).join(' ')}
      data-intent={intent}
      data-size={size}
      data-preview-state={previewState}
      {...rest}
    />
  );
});
