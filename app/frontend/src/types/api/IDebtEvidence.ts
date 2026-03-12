export interface IDebtEvidence {
  _id: string;

  debtId: string;
  uploadedByUserId: string;

  fileName: string;
  fileType: string;
  fileUrl: string;
  fileStorageId: string;
  evidenceType: string;
  description: string;

  createdAt: string;
  updatedAt?: string | false;
}
