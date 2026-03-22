import {
  extractIdFromApiData,
  getFromApi,
  patchToApi,
  postFormDataToApi,
  postToApi,
} from '@/lib/api/client';
import type { IVerificationWithUser } from '@/features/admin/types';

/** Response from GET /api/verification/my-status (workflow may include DRAFT). */
export type IMyVerificationStatus = Omit<IVerificationWithUser, 'status'> & {
  status: string;
};

export const mapDocumentTypeForApi = (
  form: string,
): 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE' => {
  if (form === 'NATIONAL_ID') return 'ID_CARD';
  if (form === 'PASSPORT') return 'PASSPORT';
  return 'DRIVERS_LICENSE';
};

export const getMyVerificationStatus = () =>
  getFromApi<IMyVerificationStatus>('/api/verification/my-status');

export const createVerificationRequest = async (body: {
  verificationType: 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE';
  documentNumber: string;
  countryCode: string;
}) => {
  const data = await postToApi<unknown>('/api/verification/request', {
    verificationType: body.verificationType,
    documentNumber: body.documentNumber,
    countryCode: body.countryCode,
  });
  const id = extractIdFromApiData(data);
  if (!id) {
    throw new Error('Could not read verification id from server response');
  }
  return id;
};

export const uploadVerificationDocument = (
  verificationId: string,
  documentSide: 'FRONT' | 'BACK' | 'SELFIE',
  file: File
) => {
  const fd = new FormData();
  fd.append('verificationId', verificationId);
  fd.append('documentSide', documentSide);
  fd.append('document', file);
  return postFormDataToApi<unknown>('/api/verification/upload', fd);
};

export const submitVerificationForReview = (verificationId: string) =>
  postToApi<unknown>(`/api/verification/submit/${verificationId}`, {});

export const resubmitVerificationDraft = (verificationId: string) =>
  postToApi<unknown>(`/api/verification/resubmit/${verificationId}`, {});

export const syncProfileFromVerificationForm = (
  userId: string,
  body: { firstName: string; lastName: string; phone: string }
) => patchToApi(`/api/users/updateUserProfile/${userId}`, body as Record<string, unknown>);
