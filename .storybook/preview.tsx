import type { Preview } from '@storybook/react-vite';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '../src/tokens/tokens.css';
import '../src/styles/base.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color mode, driven by the Color variable collection in Figma',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => (
      <div
        data-theme={context.globals.theme}
        style={{
          background: 'var(--ds-color-bg-page)',
          color: 'var(--ds-color-text-primary)',
          padding: 'var(--ds-spacing-xl)'
        }}
      >
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true }
  }
};

export default preview;
