import { useFireproof } from "use-fireproof";
import { fireproof } from "@fireproof/core";
import type { DocBase } from "@fireproof/core";

// Initialize the database
export const db = fireproof("spendsage-finance");

// Types for our data models
export interface Transaction extends DocBase {
  type: "transaction";
  date: string;
  amount: number;
  category: string;
  description: string;
  isExpense: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category extends DocBase {
  type: "category";
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// Data hooks for specific types
export function useTransactions() {
  const { useLiveQuery } = useFireproof("spendsage-finance");
  return useLiveQuery(
    (doc: any) => {
      if ('type' in doc && doc.type === "transaction") {
        return [doc.type, doc.date];
      }
      return null;
    },
    { descending: true }
  );
}

export function useCategories() {
  const { useLiveQuery } = useFireproof("spendsage-finance");
  return useLiveQuery(
    (doc: any) => {
      if ('type' in doc && doc.type === "category") {
        return doc.type;
      }
      return null;
    },
    { descending: false }
  );
}

// Helper function to generate IDs
export function generateId(type: string): string {
  return `${type}:${new Date().toISOString()}`;
}

// Helper to create a new transaction
export function createTransaction(data: Omit<Transaction, "type" | "createdAt" | "updatedAt" | "_id">): Transaction {
  const now = new Date().toISOString();
  return {
    _id: generateId("transaction"),
    type: "transaction",
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

// Helper to create a new category
export function createCategory(data: Omit<Category, "type" | "createdAt" | "updatedAt" | "_id">): Category {
  const now = new Date().toISOString();
  return {
    _id: generateId("category"),
    type: "category",
    ...data,
    createdAt: now,
    updatedAt: now,
  };
} 