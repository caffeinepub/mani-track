import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FinanceEntry {
    id: string;
    entryType: EntryType;
    owner: Principal;
    date: bigint;
    description: string;
    category: string;
    amount: number;
}
export interface UserProfile {
    name: string;
}
export enum EntryType {
    expense = "expense",
    saving = "saving",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFinanceEntry(id: string, amount: number, date: bigint, category: string, entryType: EntryType, description: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFinanceEntry(id: string): Promise<void>;
    getAllFinanceEntries(): Promise<Array<FinanceEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntriesByDateRange(startDate: bigint, endDate: bigint): Promise<Array<FinanceEntry>>;
    getEntriesByType(entryType: EntryType): Promise<Array<FinanceEntry>>;
    getFinanceEntry(id: string): Promise<FinanceEntry>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateFinanceEntry(id: string, amount: number, date: bigint, category: string, entryType: EntryType, description: string): Promise<void>;
}
