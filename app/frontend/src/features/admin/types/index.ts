import type { IUser, IUserVerification, IVerificationDocument } from '@/types';

export interface IVerificationWithUser extends IUserVerification {
  _id: string;
  user?: IUser;
  documents?: IVerificationDocument[];
}

export interface IVerificationDetails extends IVerificationWithUser {
  documents: IVerificationDocument[];
}
