export type TFriendshipStatus = 'ACTIVE' | 'BLOCKED' | 'REMOVED';

export interface IFriendship {
  _id: string;

  user1Id: string;
  user2Id: string;

  status: TFriendshipStatus;

  createdAt: string;
  updatedAt?: string | false;
}
