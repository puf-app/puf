export type TFriendRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELED';

export interface IFriendRequest {
  _id: string;

  senderUserId: string;
  receiverUserId: string;

  status: TFriendRequestStatus;
  message: string;

  respondedAt?: string | null;

  createdAt: string;
  updatedAt?: string | false;
}
