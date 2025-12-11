import { render } from 'preact';
import { App } from './app.tsx';
import { use_widget_store } from './store/widget_store';

interface WidgetConfig {
    container_selector: string;
    api_key: string;
    exchange_user_id?: string;
}

const ExchangeWidget = {
    init: (config: WidgetConfig) => {
        const { container_selector, api_key, exchange_user_id } = config;

        const container_element = document.querySelector(container_selector);
        if (!container_element) {
            console.error('Widget container not found');
            return;
        }

        use_widget_store.getState().initialize({ api_key, exchange_user_id });

        const shadow_root = container_element.attachShadow({ mode: 'open' });

        const app_root = document.createElement('div');
        shadow_root.appendChild(app_root);

        render(App(), app_root);
    }
};

(window as any).ExchangeWidget = ExchangeWidget;

export default ExchangeWidget;