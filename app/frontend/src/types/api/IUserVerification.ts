export type TUserVerificationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export interface IUserVerification {
  userId: {
    _id: string;
    username: string;
    email: string;
  };

  verificationType: string;
  documentNumber: string;
  countryCode: string;
  status: TUserVerificationStatus;

  reviewedAt: string;
  expiresAt: string;
  reviewNote: string;

  createdAt: string;
  updatedAt?: string | false;
}
