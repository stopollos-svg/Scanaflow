
export interface ScannedDoc {
  id: string;
  timestamp: number;
  originalImage: string;
  processedImage?: string;
  title: string;
  category: string;
  extractedText: string;
  summary: string;
  status: 'scanning' | 'processing' | 'ready';
  signature?: string;
}

export interface GeminiAnalysisResponse {
  title: string;
  category: 'Receipt' | 'Contract' | 'Note' | 'Whiteboard' | 'Business Card' | 'Other';
  extractedText: string;
  summary: string;
  suggestedFileName: string;
}

export type AppState = 'dashboard' | 'camera' | 'review' | 'settings';
