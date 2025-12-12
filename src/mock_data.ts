import type { NewsItem, TradingConfig } from './types/news';

export const mock_news_items: NewsItem[] = [
    {
        _id: '3',
        title: 'Unusual trading volume detected on OKX - 2,500 BTC moved from cold storage',
        time: Date.now() - 1000 * 60 * 2,
        scraped_time: Date.now() - 1000 * 60 * 2 + 89,
        type: 'alert',
        source: 'Whale Alert',
        sentiment: 'neutral',
    },
    {
        _id: '1',
        title: 'Bitcoin ETF sees record $1.2B inflows as institutional demand surges',
        body: 'BlackRock\'s iShares Bitcoin Trust (IBIT) led the pack with over $500 million in single-day inflows, marking the highest volume since launch. The surge in institutional interest comes as Bitcoin approaches its previous all-time high, with analysts predicting further upside potential.',
        time: Date.now() - 1000 * 60 * 6,
        scraped_time: Date.now() - 1000 * 60 * 6 + 382,
        type: 'news',
        source: 'CoinDesk',
        url: 'https://coindesk.com/markets/bitcoin-etf-inflows',
        image: 'https://picsum.photos/200/150?random=1',
        sentiment: 'positive',
    },
    {
        _id: '2',
        title: 'New Ethereum scaling solution proposal',
        body: 'Been thinking about a new approach to rollup sequencing that could reduce costs by 10x while preserving decentralization.',
        time: Date.now() - 1000 * 60 * 15,
        scraped_time: Date.now() - 1000 * 60 * 15 + 156,
        type: 'twitter',
        source: 'Vitalik Buterin',
        source_handle: 'VitalikButerin',
        url: 'https://twitter.com/VitalikButerin/status/123456789',
        sentiment: 'neutral',
    },
    {
        _id: '7',
        title: 'Major exchange hack: $120M drained from DeFi protocol',
        time: Date.now() - 1000 * 60 * 1,
        scraped_time: Date.now() - 1000 * 60 * 1 + 45,
        type: 'alert',
        source: 'PeckShield',
        sentiment: 'negative',
    },
    {
        _id: '4',
        title: 'SEC delays decision on Solana ETF applications citing need for review',
        body: 'The U.S. Securities and Exchange Commission has pushed back its deadline for ruling on multiple Solana ETF applications. Industry experts suggest this could be a strategic move ahead of the upcoming regulatory framework discussions. The delay affects applications from several major asset managers including Grayscale, VanEck, and 21Shares.',
        time: Date.now() - 1000 * 60 * 45,
        scraped_time: Date.now() - 1000 * 60 * 45 + 512,
        type: 'news',
        source: 'Bloomberg',
        url: 'https://bloomberg.com/crypto/sec-solana-etf',
        image: 'https://picsum.photos/300/200?random=3',
        sentiment: 'negative',
    },
    {
        _id: '8',
        title: 'Thread on the future of decentralized identity',
        body: 'Just published a deep dive on how zero-knowledge proofs will revolutionize digital identity verification. The implications for privacy and security are massive. We\'re looking at a future where you can prove you\'re over 18 without revealing your birthdate, or prove you have enough funds without showing your balance.',
        time: Date.now() - 1000 * 60 * 30,
        scraped_time: Date.now() - 1000 * 60 * 30 + 200,
        type: 'twitter',
        source: 'Balaji Srinivasan',
        source_handle: 'balaboratory',
        url: 'https://twitter.com/balaboratory/status/111222333',
        image: 'https://picsum.photos/400/300?random=4',
        sentiment: 'neutral',
    },
    {
        _id: '5',
        title: 'Aave announces $50M bug bounty program',
        body: 'In what may be the largest bug bounty in crypto history, critical vulnerability discoveries will be rewarded.',
        time: Date.now() - 1000 * 60 * 120,
        scraped_time: Date.now() - 1000 * 60 * 120 + 234,
        type: 'twitter',
        source: 'Aave',
        source_handle: 'AaveAave',
        url: 'https://twitter.com/AaveAave/status/987654321',
        image: 'https://picsum.photos/150/200?random=5',
        sentiment: 'positive',
    },
    {
        _id: '9',
        title: 'China signals potential crypto policy reversal as Hong Kong experiments succeed',
        body: 'Sources close to Chinese regulators indicate Beijing is closely monitoring Hong Kong\'s cryptocurrency initiatives. The success of regulated crypto trading in the special administrative region may influence mainland policy. Multiple state-owned enterprises have reportedly begun preliminary research into blockchain infrastructure.',
        time: Date.now() - 1000 * 60 * 90,
        scraped_time: Date.now() - 1000 * 60 * 90 + 300,
        type: 'news',
        source: 'South China Morning Post',
        url: 'https://scmp.com/business/china-crypto-policy',
        image: 'https://picsum.photos/250/250?random=6',
        sentiment: 'positive',
    },
    {
        _id: '6',
        title: 'Breaking: Federal Reserve announces emergency rate decision as Bitcoin and Ethereum surge past key resistance levels amid growing institutional adoption',
        body: 'Markets react to unexpected policy shift with major cryptocurrencies seeing double-digit gains.',
        time: Date.now() - 1000 * 60 * 8,
        scraped_time: Date.now() - 1000 * 60 * 8 + 127,
        type: 'news',
        source: 'Reuters',
        url: 'https://reuters.com/markets/crypto-fed-decision',
        sentiment: 'positive',
    },
    {
        _id: '10',
        title: 'Massive liquidation cascade incoming',
        time: Date.now() - 1000 * 60 * 5,
        scraped_time: Date.now() - 1000 * 60 * 5 + 60,
        type: 'alert',
        source: 'Coinglass',
        sentiment: 'negative',
    },
    {
        _id: '11',
        title: 'The merge was just the beginning',
        body: 'One year post-merge analysis: Ethereum\'s energy consumption down 99.95%, but the real transformation is happening at L2. We\'re seeing unprecedented innovation in rollup technology, with transaction costs dropping to fractions of a cent while maintaining security guarantees.',
        time: Date.now() - 1000 * 60 * 180,
        scraped_time: Date.now() - 1000 * 60 * 180 + 400,
        type: 'twitter',
        source: 'Ryan Sean Adams',
        source_handle: 'RyanSAdams',
        url: 'https://twitter.com/RyanSAdams/status/444555666',
        sentiment: 'positive',
    },
    {
        _id: '12',
        title: 'MicroStrategy acquires additional 12,000 BTC worth $780 million',
        body: 'Michael Saylor\'s company continues its aggressive Bitcoin accumulation strategy, bringing total holdings to over 200,000 BTC. The purchase was funded through a combination of convertible notes and cash reserves. Analysts remain divided on whether this concentration of holdings represents a systemic risk or a vote of confidence in Bitcoin\'s long-term value proposition.',
        time: Date.now() - 1000 * 60 * 240,
        scraped_time: Date.now() - 1000 * 60 * 240 + 180,
        type: 'news',
        source: 'The Block',
        url: 'https://theblock.co/microstrategy-btc-purchase',
        image: 'https://picsum.photos/350/150?random=7',
        sentiment: 'positive',
    },
];

export const mock_trading_config_4: TradingConfig = {
    coins: [
        { symbol: 'BTC', price_change_percent: 2.34 },
        { symbol: 'ETH', price_change_percent: -0.87 },
    ],
    amount_presets: [100, 250, 500, 1000],
};

export const mock_trading_config_3: TradingConfig = {
    coins: [
        { symbol: 'BTC', price_change_percent: 2.34 },
        { symbol: 'ETH', price_change_percent: -0.87 },
    ],
    amount_presets: [100, 500, 1000],
};

export const mock_trading_config_2: TradingConfig = {
    coins: [
        { symbol: 'BTC', price_change_percent: 2.34 },
        { symbol: 'ETH', price_change_percent: -0.87 },
    ],
    amount_presets: [250, 1000],
};

export const mock_trading_config_1: TradingConfig = {
    coins: [
        { symbol: 'BTC', price_change_percent: 2.34 },
        { symbol: 'ETH', price_change_percent: -0.87 },
    ],
    amount_presets: [500],
};

export const mock_trading_configs = [
    mock_trading_config_4,
    mock_trading_config_3,
    mock_trading_config_2,
    mock_trading_config_1,
];
