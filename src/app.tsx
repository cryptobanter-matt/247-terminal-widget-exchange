import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { theme } from './styles/theme'  
import type { AppTheme } from './styles/theme';
import { MotionButton } from './components/MotionButton';

const GlobalStyle = createGlobalStyle<{ theme: AppTheme }> `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text_primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

export function App() {
  const handle_click = () => {
    console.log('yourpoes');
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div style={{ padding: '40px'}}>
        <h1>Welcome to our widget</h1>
        <MotionButton onClick={handle_click}>
          Click Me
        </MotionButton>
      </div>
    </ThemeProvider>
  );
}
