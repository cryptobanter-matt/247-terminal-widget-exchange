import { useState } from 'preact/hooks';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './styles/theme';
import type { AppTheme } from './styles/theme';
import { NewsCard } from './features/news_feed/news_card';
import { WidgetContainer } from './components/WidgetContainer';
import { mock_news_items, mock_trading_configs } from './mock_data';

export type ButtonStyle = 'swipe' | 'standard';

const ToggleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    margin-bottom: 12px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.radii.md};
`;

const ToggleLabel = styled.span`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text_secondary};
    font-weight: 500;
`;

const ToggleButton = styled.button<{ is_active: boolean }>`
    padding: 6px 12px;
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    background: ${({ is_active, theme }) => is_active ? theme.colors.primary : 'transparent'};
    color: ${({ is_active, theme }) => is_active ? '#fff' : theme.colors.text_secondary};

    &:hover {
        background: ${({ is_active, theme }) => is_active ? theme.colors.primary : 'rgba(255,255,255,0.1)'};
    }
`;

const GlobalStyle = createGlobalStyle<{ theme: AppTheme }>`
  * {
    box-sizing: border-box;
  }

  :host {
    all: initial;
    display: block;
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text_primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }
`;


export function App() {
  const [button_style, set_button_style] = useState<ButtonStyle>('standard');

  const handle_trade = (coin: string, amount: number, side: 'long' | 'short', news_id: string) => {
    console.log(`Trade: ${side.toUpperCase()} $${amount} ${coin} (from news: ${news_id})`);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <WidgetContainer>
        <ToggleContainer>
          <ToggleLabel>Button Style:</ToggleLabel>
          <ToggleButton
            is_active={button_style === 'swipe'}
            onClick={() => set_button_style('swipe')}
          >
            Swipe
          </ToggleButton>
          <ToggleButton
            is_active={button_style === 'standard'}
            onClick={() => set_button_style('standard')}
          >
            Standard
          </ToggleButton>
        </ToggleContainer>

        {mock_news_items.map((item, index) => (
          <NewsCard
            key={item._id}
            news_item={item}
            trading_config={mock_trading_configs[index % mock_trading_configs.length]}
            button_style={button_style}
            on_trade={handle_trade}
          />
        ))}
      </WidgetContainer>
    </ThemeProvider>
  );
}
