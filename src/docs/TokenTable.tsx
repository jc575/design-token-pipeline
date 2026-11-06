import resolved from '../tokens/resolved.json';

type Props = { group: 'color' | 'static' };

export function TokenTable({ group }: Props) {
  const light = resolved.light as Record<string, string>;
  const dark = resolved.dark as Record<string, string>;
  const stat = resolved.static as Record<string, string>;
  const th = { textAlign: 'left' as const, padding: '8px 12px', fontWeight: 600 };
  const td = { padding: '8px 12px', borderTop: '1px solid var(--ds-color-border-default)' };
  const chip = (v: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        aria-hidden="true"
        style={{ width: 16, height: 16, borderRadius: 4, background: v, border: '1px solid var(--ds-color-border-default)' }}
      />
      <code>{v}</code>
    </span>
  );
  if (group === 'static') {
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <caption style={{ position: 'absolute', left: -9999 }}>Static tokens</caption>
        <thead>
          <tr>
            <th scope="col" style={th}>Token</th>
            <th scope="col" style={th}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stat).map(([k, v]) => (
            <tr key={k}>
              <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 400 }}><code>{k}</code></th>
              <td style={td}>{v.startsWith('#') ? chip(v) : <code>{v}</code>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <caption style={{ position: 'absolute', left: -9999 }}>Semantic color tokens by mode</caption>
      <thead>
        <tr>
          <th scope="col" style={th}>Token</th>
          <th scope="col" style={th}>Light</th>
          <th scope="col" style={th}>Dark</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(light).map((k) => (
          <tr key={k}>
            <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 400 }}><code>{k}</code></th>
            <td style={td}>{chip(light[k])}</td>
            <td style={td}>{chip(dark[k])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
