import type { Customer } from "@shared/schema";

export type AuthStatusResponse = {
  authenticated: boolean;
};

export type CustomerAuthResponse = AuthStatusResponse & {
  customer?: {
    id: string;
    email: string;
    name: string;
    totalPurchases: string;
    totalSpent: string;
    points: string;
    level: string;
    followersCount: string;
    followingCount: string;
    level100RewardClaimed: Date | null;
    walletAddress: string | null;
  };
};

export type AdminCustomer = Omit<Customer, "password" | "encryptedSeedPhrase"> & {
  walletAddress: string | null;
};

export type AdminAuthResponse = AuthStatusResponse & {
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    hiredAt: Date;
  };
};
