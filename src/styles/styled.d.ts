import 'styled-components';
import type { ThemeConfig } from '../config/theme.ts';

declare module 'styled-components' {
    export interface DefaultTheme extends ThemeConfig {}
}