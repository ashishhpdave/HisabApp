export type EntryType = 'udhar' | 'kharcha' | 'income';

export interface Entry {
  id: string;
  user_id: string;
  name: string;
  item: string;
  amount: number;
  type: EntryType;
  date: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface EntryInput {
  name: string;
  item: string;
  amount: number;
  type: EntryType;
  date: string;
  note?: string;
}

export interface Summary {
  totalUdhar: number;
  totalKharcha: number;
  totalIncome: number;
  balance: number;
}
