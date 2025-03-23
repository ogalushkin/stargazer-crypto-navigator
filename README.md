
# Stargazer Crypto Navigator

A multi-chain blockchain explorer that allows you to analyze and visualize transactions across Ethereum, Bitcoin, Solana, and TON networks.

## Features

- **Multi-Chain Support**: Analyze addresses across Ethereum, Bitcoin, Solana, and TON networks with a unified interface.
- **Transaction Visualization**: See the flow of funds with interactive graph visualizations that highlight connections.
- **Balance & Asset Details**: Explore complete address balances and held assets with accurate valuations.
- **Transaction History**: View and filter transaction history for any blockchain address.
- **Graph Navigation**: Interactive node-based visualization of transaction relationships.

## Technologies

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui component library
- React Router
- Tanstack React Query
- Cytoscape.js for graph visualization

## API Keys

The application uses various blockchain APIs to fetch data. API keys are configured in `src/utils/config.ts`. You will need to obtain your own API keys for the following services:

- Etherscan (Ethereum)
- Infura (Ethereum)
- Blockchair (Bitcoin)
- Helius (Solana)
- Toncenter (TON)
- CoinMarketCap (Price data)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stargazer-crypto-navigator.git
   cd stargazer-crypto-navigator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API keys:
   Edit `src/utils/config.ts` and insert your own API keys.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:8080`

### Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Static Hosting (Netlify, Vercel, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your preferred static hosting service.

### Traditional Server

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy the contents of the `dist` directory to your web server's public directory.

3. Configure your web server to serve the application:

   **Apache (.htaccess)**:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **Nginx**:
   ```nginx
   location / {
     root /path/to/dist;
     try_files $uri $uri/ /index.html;
   }
   ```

## Environment Variables

This project doesn't use environment variables directly. All configuration is done through the `src/utils/config.ts` file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Etherscan](https://etherscan.io/) - Ethereum blockchain explorer
- [Blockchair](https://blockchair.com/) - Bitcoin blockchain explorer
- [Solscan](https://solscan.io/) - Solana blockchain explorer
- [TON Explorer](https://explorer.ton.org/) - The Open Network blockchain explorer
- [CoinGecko](https://www.coingecko.com/) - Cryptocurrency price data
- [Cytoscape.js](https://js.cytoscape.org/) - Graph visualization library

## Screenshots

### Home Page
![Home](https://github.com/ogalushkin/stargazer-crypto-navigator/raw/main/public/screenshot-home.png)

### Address Details
![Address Details](https://github.com/ogalushkin/stargazer-crypto-navigator/raw/main/public/screenshot-address.png)

### Transaction Graph
![Transaction Graph](https://github.com/ogalushkin/stargazer-crypto-navigator/raw/main/public/screenshot-graph.png)
