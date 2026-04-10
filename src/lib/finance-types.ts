export type TransactionType = "income" | "expense" | "transfer";

export type CategorySlug = string;

export interface WeeklyFlowPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryInsight {
  slug: CategorySlug;
  label: string;
  amount: number;
  share: number;
  budgetFill: number | null;
}

export interface RecentTransaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  categorySlug: CategorySlug | null;
  categoryLabel: string;
  account: string;
  occurredAt: string;
}

export interface AccountSnapshot {
  id: string;
  name: string;
  institution: string | null;
  balance: number;
  creditLimit: number;
  accountType: string;
  note: string;
  isDefault: boolean;
}

export interface MonthlySnapshot {
  income: number;
  expenses: number;
  balance: number;
  budgetUsed: number | null;
  dailyExpenseAverage: number;
  transactionCount: number;
}

export interface ParsedTransactionCandidate {
  input: string;
  normalizedText: string;
  amount: number | null;
  type: TransactionType;
  merchant: string | null;
  category: CategorySlug | null;
  occurredAtIso: string | null;
  detectedDateLabel: string | null;
  confidence: number;
  needsReview: boolean;
  explanation: string;
}

export interface MerchantRule {
  keywords: string[];
  merchant: string;
  category: CategorySlug;
  type?: TransactionType;
}

export interface BudgetCategory {
  id: string;
  slug: CategorySlug;
  label: string;
  spent: number;
  limit: number;
  note: string;
}

export interface AutomationMethod {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  footnote: string;
}

export interface ShortcutTransactionPayload {
  text?: string;
  merchant?: string;
  amount?: number;
  currency?: string;
  occurredAt?: string;
  note?: string;
  source?: "apple_pay" | "shortcut" | "voice_button" | "message";
  device?: string;
  webhookSecret?: string;
}

export interface FinanceAnswer {
  title: string;
  summary: string;
  bullets: string[];
}

export interface SetupFocusItem {
  title: string;
  detail: string;
}

export interface DashboardData {
  userName: string;
  monthLabel: string;
  defaultAccountId: string | null;
  defaultAccountLabel: string | null;
  monthlySnapshot: MonthlySnapshot;
  weeklyFlow: WeeklyFlowPoint[];
  categoryInsights: CategoryInsight[];
  budgetCategories: BudgetCategory[];
  recentTransactions: RecentTransaction[];
  accountSnapshots: AccountSnapshot[];
  automationMethods: AutomationMethod[];
  askFinancePrompts: string[];
  captureExamples: string[];
  setupFocus: SetupFocusItem[];
  hasTransactions: boolean;
  hasBudgets: boolean;
}

export interface CapturedTransactionResult {
  transaction: RecentTransaction;
  parsedTransaction: ParsedTransactionCandidate;
  accountLabel: string;
  summary: string;
}
