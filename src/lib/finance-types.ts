export type TransactionType = "income" | "expense" | "transfer";

export type CategorySlug =
  | "salary"
  | "freelance"
  | "refund"
  | "sale"
  | "transfer_in"
  | "supermarket"
  | "snacks"
  | "delivery"
  | "transport"
  | "education"
  | "home"
  | "health"
  | "subscriptions"
  | "leisure"
  | "shopping"
  | "gifts"
  | "other";

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
  change: number;
  budgetFill: number;
  description: string;
}

export interface RecentTransaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: CategorySlug;
  account: string;
  occurredAt: string;
  needsReview?: boolean;
}

export interface AccountSnapshot {
  name: string;
  balance: number;
  note: string;
}

export interface MonthlySnapshot {
  income: number;
  expenses: number;
  balance: number;
  incomeDelta: number;
  expenseDelta: number;
  balanceDelta: number;
  budgetUsed: number;
  dailyExpenseAverage: number;
  reviewQueue: number;
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
