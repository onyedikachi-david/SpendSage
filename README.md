# SpendSage - Personal Finance Management Application

SpendSage is a modern, offline-first personal finance management application built with React, TypeScript, and Fireproof. It helps users track expenses, manage budgets, analyze spending patterns, and make informed financial decisions.

![SpendSage Logo](src/assets/logo.png)

## Features

### 1. Financial Dashboard
- Quick transaction entry with date picker
- Real-time financial overview
- Recent transactions list
- Summary widgets showing income, expenses, and savings

### 2. Transaction Management
- Add, edit, and delete transactions
- Categorize expenses and income
- Multiple account support
- Detailed transaction history
- CSV import/export functionality

### 3. Budget Management
- Set monthly budgets by category
- Track budget vs. actual spending
- Visual progress indicators
- Budget alerts and notifications

### 4. Analytics & Reporting
- Interactive charts and visualizations
- Expense breakdown by category
- Income vs. expense analysis
- Savings growth tracking
- Cash flow analysis
- Custom date range filtering

### 5. Data Visualization Components
- Cash Flow Waterfall Chart
- Savings Growth Stacked Area Chart
- Budget Performance Radar Chart
- Category Distribution Pie Chart
- Monthly Trends Bar Chart

### 6. Offline-First Architecture
- Works without internet connection
- Automatic data synchronization
- Real-time sync status indicator
- Data persistence across sessions

## Technology Stack

- **Frontend Framework:** React with TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Database:** Fireproof (offline-first, embedded document database)
- **Date Handling:** date-fns
- **Form Management:** React Hook Form
- **Notifications:** Sonner
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/onyedikachi-david/spendsage.git
   cd spendsage
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
pnpm build
pnpm preview
```

## Project Structure

```
src/
├── assets/         # Static assets and images
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   └── visualizations/ # Chart components
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── lib/          # Utility functions and store
├── store/        # State management
├── types/        # TypeScript type definitions
└── layouts/      # Page layouts
```

## Key Components

- `Dashboard.tsx`: Main dashboard with quick entry and overview
- `Analytics.tsx`: Data visualization and analysis
- `Budgets.tsx`: Budget management interface
- `Settings.tsx`: Application settings and data management
- `Transactions.tsx`: Transaction history and management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Fireproof](https://fireproof.storage/) for the offline-first database
- [Recharts](https://recharts.org/) for the charting library
