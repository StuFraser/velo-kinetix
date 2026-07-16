export const RIDING_STYLES = [
  'Commuter',
  'Adventure/Gravel',
  'Cross Country',
  'Trail',
  'Enduro',
  'Downhill',
  'Road',
] as const;

export type RidingStyle = (typeof RIDING_STYLES)[number];

export const PHOTO_SLOTS = [
  { photoType: 'profile_drive', label: 'Drive-side profile', hint: 'Pedals near 6/12 o’clock', required: 'required' },
  { photoType: 'front_on', label: 'Front on', hint: 'Facing the camera', required: 'recommended' },
  { photoType: 'bike_static', label: 'Bike only', hint: '~45° angle, no rider', required: 'recommended' },
] as const;

export type PhotoType = (typeof PHOTO_SLOTS)[number]['photoType'];

export interface PhotoUpload {
  photoType: PhotoType;
  base64Data: string;
  mimeType: string;
}

export interface AnalyseRequest {
  ridingStyle: RidingStyle;
  riderNotes: string;
  photos: PhotoUpload[];
}

export type Impact = 'High' | 'Medium' | 'Low';

export interface Adjustment {
  title: string;
  detail: string;
  impact: Impact;
  zone: string;
}

export interface BikeAdjustments {
  free: Adjustment[];
  lowCost: Adjustment[];
  highCost: Adjustment[];
}

export interface AnalyseResponse {
  success: boolean;
  ridingStyle: string;
  riderAdjustments: Adjustment[];
  bikeAdjustments: BikeAdjustments;
  analysisLimitations: string[];
  disclaimer: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function analyseFit(request: AnalyseRequest): Promise<AnalyseResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/fitanalysis/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError('Could not reach the analysis service. Check your connection and try again.', 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.errors?.join(' ') ?? body?.error ?? `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  return response.json();
}

export const FEEDBACK_CATEGORIES = ['Ideas', 'Feedback', 'Q&A'] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export interface FeedbackRequest {
  category: FeedbackCategory;
  message: string;
  website?: string;
}

export interface FeedbackResponse {
  success: boolean;
  discussionUrl: string;
}

export async function submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError('Could not reach the feedback service. Check your connection and try again.', 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.errors?.join(' ') ?? body?.error ?? `Request failed with status ${response.status}.`;
    throw new ApiError(message, response.status);
  }

  return response.json();
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
