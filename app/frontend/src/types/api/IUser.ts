export type TVerificationLevel = 'NONE' | 'BASIC' | 'IDENTITY' | 'ENHANCED';

export type TUserStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface IUser {
  _id: string;

  firstName: string;
  lastName: string;
  username: string;
  phone?: string | null;

  profileImageUrl?: string;

  isVerified: boolean;
  verificationLevel: TVerificationLevel;

  lastLoginAt?: string;
  lastSeenAt?: string;

  status: TUserStatus;

  admin: boolean;
  company: boolean;

  createdAt: string;
  updatedAt?: string | false;
}
