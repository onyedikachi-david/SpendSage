# Product Requirements Document: Fireproof Personal Finance Tracker

## Product Overview

The Fireproof Personal Finance Tracker is an offline-first web application that allows users to record financial transactions, categorize expenses, and visualize spending patterns. Built with Fireproof's embedded document database, the application works seamlessly offline and synchronizes data when the user reconnects to the internet.

## Key Features

### 1. Transaction Management
- **Add Transactions:** Record income and expenses with date, amount, category, account, and optional notes
- **Edit Transactions:** Modify existing transaction details
- **Delete Transactions:** Remove unwanted entries
- **Bulk Operations:** Select multiple transactions for batch categorization or deletion
- **Offline Support:** All transaction operations work without internet connection

### 2. Categorization System
- **Predefined Categories:** Common expense categories (Food, Transport, Housing, etc.)
- **Custom Categories:** Create, edit, and delete personalized categories
- **Category Hierarchy:** Support for parent/child category relationships
- **Smart Categorization:** Suggest categories based on transaction history and patterns
- **Category Color Coding:** Visual differentiation between category types

### 3. Financial Accounts
- **Multiple Accounts:** Track transactions across different accounts (cash, checking, credit cards)
- **Account Balances:** Real-time calculation of current balances
- **Transfer Between Accounts:** Record transfers without double-counting expenses

### 4. Data Visualization
- **Spending Breakdown:** Pie charts showing expenses by category
- **Trend Analysis:** Line/bar charts showing spending patterns over time
- **Budget vs. Actual:** Visual comparison of planned vs. actual spending
- **Income vs. Expenses:** Track financial flow with visual indicators
- **Custom Date Ranges:** Filter visualizations by day, week, month, year, or custom periods

### 5. Budget Management
- **Set Budgets:** Create monthly budgets for different categories
- **Budget Notifications:** Visual indicators when approaching or exceeding budgets
- **Recurring Budgets:** Automatically roll over budget settings month to month
- **Budget History:** Track budget performance over time

### 6. Data Sync & Backup
- **Automatic Sync:** Seamlessly synchronize data when online
- **Manual Sync Control:** Option to trigger sync manually
- **Sync Status Indicator:** Clear visual feedback on sync status
- **Export Functionality:** Export data in CSV or JSON format

### 7. User Experience
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Dark/Light Mode:** Supports system preference and manual selection
- **Keyboard Shortcuts:** Efficient data entry with keyboard navigation
- **Search & Filter:** Find transactions by various criteria
- **Sorting Options:** Arrange transactions by date, amount, category, etc.

## Technical Specifications

### Technology Stack
- **Frontend Framework:** React
- **UI Components:** ShadCN UI library
- **Database:** Fireproof (for offline-first data storage and sync)
- **Data Visualization:** Recharts
- **State Management:** Fireproof hooks for data state, React Context for UI state
- **Build Tool:** Vite

### Data Models

#### Transaction Document
```javascript
{
  _id: "transaction:2025-03-06T12:34:56.789Z",
  type: "transaction",
  date: "2025-03-06T12:34:56.789Z",
  amount: 45.67,
  category: "food",
  subcategory: "groceries",
  account: "checking",
  description: "Weekly grocery shopping",
  tags: ["essential", "weekly"],
  isExpense: true,
  createdAt: "2025-03-06T12:34:56.789Z",
  updatedAt: "2025-03-06T12:34:56.789Z"
}
```

#### Category Document
```javascript
{
  _id: "category:food",
  type: "category",
  name: "Food",
  color: "#4CAF50",
  icon: "utensils",
  parent: null,
  createdAt: "2025-03-06T12:34:56.789Z",
  updatedAt: "2025-03-06T12:34:56.789Z"
}
```

#### Account Document
```javascript
{
  _id: "account:checking",
  type: "account",
  name: "Checking Account",
  initialBalance: 1000,
  icon: "bank",
  color: "#2196F3",
  createdAt: "2025-03-06T12:34:56.789Z",
  updatedAt: "2025-03-06T12:34:56.789Z"
}
```

#### Budget Document
```javascript
{
  _id: "budget:food:2025-03",
  type: "budget",
  category: "food",
  amount: 500,
  period: "2025-03",
  createdAt: "2025-03-01T00:00:00.000Z",
  updatedAt: "2025-03-01T00:00:00.000Z"
}
```

### Fireproof Implementation

- **Database Name:** "personal-finance-tracker"
- **Query Indexes:**
  - By type and date for transaction listing
  - By category for category-based filtering
  - By account for account-based views
  - By date ranges for periodic reports
  - Custom indexes for complex aggregations

## User Interface Requirements

### Dashboard
- Summary widgets with total income, expenses, and balance
- Quick-entry form for new transactions
- Recent transactions list (last 5-7 entries)
- Mini charts showing current month's spending by category
- Progress bars for top budget categories

### Transactions Page
- Comprehensive transaction list with filtering and sorting
- Batch editing capabilities
- Search functionality
- Date range selection
- Export options

### Analytics Page
- Full-size visualizations for deeper analysis
- Multiple chart types (pie, bar, line)
- Custom date range selection
- Toggle between different metrics
- Comparison views (month-over-month, year-over-year)

### Budgets Page
- Budget creation and editing interface
- Visual progress for each budget category
- Historical budget performance
- Budget recommendations based on spending history

### Settings Page
- Account management
- Category customization
- Data import/export
- Sync controls
- UI preferences

## Performance Requirements
- Initial load time < 2 seconds
- Transaction entry response time < 100ms
- Smooth scrolling through 500+ transactions
- Low memory footprint for mobile devices
- Efficient sync with minimal data transfer

## Future Enhancement Considerations
- **Multi-device Sync:** Enhanced sync across user's devices
- **Financial Goals:** Set and track savings goals
- **Receipt Scanning:** OCR for automatic transaction entry
- **Recurring Transactions:** Auto-entry for regular bills/income
- **Reports:** Downloadable financial reports (PDF)
- **Tax Preparation:** Tag transactions for tax purposes
- **Investment Tracking:** Basic investment portfolio monitoring

## Implementation Phases

### Phase 1: Core Functionality (MVP)
- Transaction CRUD operations
- Basic categorization
- Account management
- Simple visualizations
- Offline functionality

### Phase 2: Enhanced Features
- Budget management
- Advanced visualizations
- Data export
- Improved categorization

### Phase 3: Polish & Advanced Features
- UI refinements
- Performance optimizations
- Additional chart types
- Enhanced filtering

## Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Sufficient color contrast
- Responsive design for all screen sizes

## Success Metrics
- User retention rate > 60% after 30 days
- Average session duration > 5 minutes
- Transaction entry completion rate > 95%
- Sync success rate > 99%
- User satisfaction score > 4.2/5

This PRD serves as a comprehensive guide for developing the Fireproof Personal Finance Tracker, focusing on offline-first functionality with seamless online synchronization, built with React and styled using the ShadCN UI component library.