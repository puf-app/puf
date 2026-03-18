export interface IVerificationDocument {
  verificationId: string;

  documentSide: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileStorageId: string;

  createdAt: string;
  updatedAt?: string | false;
}
