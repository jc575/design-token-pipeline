import { useId, useMemo, useState } from 'react';
import { Button } from '../Button/Button';
import './SeverityTrendChart.css';

export interface SeverityDatum {
  /** Short x axis label, for example a weekday. */
  label: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SeverityTrendChartProps {
  /** State the takeaway, not the topic. For example "Critical alerts tripled on Thursday". */
  title: string;
  subtitle?: string;
  /** Always show where the numbers came from. */
  source: string;
  data: SeverityDatum[];
  state?: 'ready' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  /** Open the table view on first render. */
  initialTableOpen?: boolean;
}

// Critical sits on the baseline so the most important series is the easiest to compare day to day.
const SERIES = [
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' }
] as const;

const W = 640;
const H = 300;
const M = { top: 28, right: 12, bottom: 32, left: 40 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const GAP = 2; // surface colored gap between stacked segments, so neighbors never rely on hue alone

function niceAxis(max: number) {
  const raw = Math.max(max, 1) / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return { step, max: step * 4 };
}

const total = (d: SeverityDatum) => d.critical + d.high + d.medium + d.low;

export function SeverityTrendChart({
  title,
  subtitle,
  source,
  data,
  state = 'ready',
  onRetry,
  initialTableOpen = false
}: SeverityTrendChartProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const tableId = `${uid}-table`;
  const [tableOpen, setTableOpen] = useState(initialTableOpen);
  const [hover, setHover] = useState<number | null>(null);

  const axis = useMemo(() => niceAxis(Math.max(0, ...data.map(total))), [data]);
  const band = data.length ? PLOT_W / data.length : PLOT_W;
  const barW = Math.min(48, band * 0.6);

  const description = `${title}. Total alerts per day: ${data
    .map((d) => `${d.label} ${total(d)}`)
    .join(', ')}. A table with the full severity breakdown is available.`;

  const header = (
    <figcaption className="ds-chart__caption">
      <h3 id={titleId} className="ds-chart__title">
        {title}
      </h3>
      {subtitle && <p className="ds-chart__subtitle">{subtitle}</p>}
    </figcaption>
  );

  let body;
  if (state === 'loading') {
    body = (
      <div role="status" aria-live="polite" className="ds-chart__state">
        <div className="ds-chart__skeleton" aria-hidden="true" />
        <p>Loading alert data</p>
      </div>
    );
  } else if (state === 'error') {
    body = (
      <div role="alert" className="ds-chart__state">
        <p>
          <strong>We could not load alert data.</strong> Your data is safe. Check your connection and try again.
        </p>
        <Button intent="secondary" size="small" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  } else if (state === 'empty' || data.length === 0) {
    body = (
      <div className="ds-chart__state">
        <p>
          <strong>No alerts in this period.</strong> When alerts arrive, they will show here by severity.
        </p>
      </div>
    );
  } else {
    const y0 = M.top + PLOT_H;
    const ticks = [0, 1, 2, 3, 4].map((i) => i * axis.step);
    const hovered = hover === null ? null : data[hover];
    body = (
      <>
        <ul className="ds-chart__legend" aria-label="Severity legend">
          {SERIES.map((s) => (
            <li key={s.key}>
              <span className="ds-chart__swatch" style={{ background: `var(--ds-color-data-severity-${s.key})` }} />
              {s.label}
            </li>
          ))}
        </ul>

        <div className="ds-chart__plot" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${titleId} ${descId}`} className="ds-chart__svg">
            <desc id={descId}>{description}</desc>
            {ticks.map((t) => {
              const y = y0 - (t / axis.max) * PLOT_H;
              return (
                <g key={t}>
                  <line x1={M.left} x2={W - M.right} y1={y} y2={y} className="ds-chart__grid" />
                  <text x={M.left - 8} y={y + 4} textAnchor="end" className="ds-chart__axis-label">
                    {t}
                  </text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const cx = M.left + band * i + band / 2;
              let cum = 0;
              return (
                <g key={d.label}>
                  {SERIES.map((s) => {
                    const v = d[s.key];
                    if (!v) return null;
                    const h = (v / axis.max) * PLOT_H;
                    const y = y0 - cum - h;
                    cum += h;
                    return (
                      <rect
                        key={s.key}
                        x={cx - barW / 2}
                        y={y}
                        width={barW}
                        height={h}
                        fill={`var(--ds-color-data-severity-${s.key})`}
                        className="ds-chart__segment"
                        // The surface colored stroke is the 2px gap between segments.
                        strokeWidth={GAP}
                      />
                    );
                  })}
                  <text x={cx} y={y0 - cum - 8} textAnchor="middle" className="ds-chart__total">
                    {total(d)}
                  </text>
                  <text x={cx} y={H - 10} textAnchor="middle" className="ds-chart__axis-label">
                    {d.label}
                  </text>
                  {/* Hit target is the full column, larger than the mark. */}
                  <rect
                    x={cx - band / 2}
                    y={M.top}
                    width={band}
                    height={PLOT_H + M.bottom}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                  />
                </g>
              );
            })}
          </svg>

          {hovered && hover !== null && (
            <div
              className="ds-chart__tooltip"
              style={{ left: `${((M.left + band * hover + band / 2) / W) * 100}%` }}
              aria-hidden="true"
            >
              <strong>{hovered.label}</strong>
              {SERIES.map((s) => (
                <div key={s.key} className="ds-chart__tooltip-row">
                  <span className="ds-chart__swatch" style={{ background: `var(--ds-color-data-severity-${s.key})` }} />
                  {s.label}
                  <span className="ds-chart__tooltip-value">{hovered[s.key]}</span>
                </div>
              ))}
              <div className="ds-chart__tooltip-row ds-chart__tooltip-total">
                Total<span className="ds-chart__tooltip-value">{total(hovered)}</span>
              </div>
            </div>
          )}
        </div>

        <Button
          intent="secondary"
          size="small"
          aria-expanded={tableOpen}
          aria-controls={tableId}
          onClick={() => setTableOpen((o) => !o)}
        >
          {tableOpen ? 'Hide table' : 'View as table'}
        </Button>

        <div id={tableId} hidden={!tableOpen}>
          <table className="ds-chart__table">
            <caption className="ds-chart__sr-only">Alerts per day by severity</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                {SERIES.map((s) => (
                  <th scope="col" key={s.key}>
                    {s.label}
                  </th>
                ))}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label}>
                  <th scope="row">{d.label}</th>
                  {SERIES.map((s) => (
                    <td key={s.key}>{d[s.key]}</td>
                  ))}
                  <td>{total(d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <figure className="ds-chart" aria-busy={state === 'loading'}>
      {header}
      {body}
      <p className="ds-chart__source">{source}</p>
    </figure>
  );
}
