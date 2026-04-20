import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StakingPool {
    apy: number;
    totalStaked: number;
    poolName: string;
    userStaked: number;
}
export interface MarketData {
    token: string;
    change24h: number;
    price: number;
}
export type Time = bigint;
export interface TokenBalance {
    token: string;
    balance: number;
    price: number;
}
export interface UserProfile {
    network: string;
    walletAddress: string;
}
export interface Transaction {
    token: string;
    timestamp: Time;
    txType: string;
    amount: number;
}
export interface backendInterface {
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getMarketData(): Promise<Array<MarketData>>;
    getPortfolio(): Promise<Array<TokenBalance>>;
    getStakingPools(): Promise<Array<StakingPool>>;
    getTransactionHistory(): Promise<Array<Transaction>>;
    getUserProfile(): Promise<UserProfile | null>;
    setUserProfile(walletAddress: string, network: string): Promise<void>;
}
