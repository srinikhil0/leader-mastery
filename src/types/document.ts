export type DocumentType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'txt' | 'csv' | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  chatId: string;
  chatTitle: string;
  uploadedAt: Date;
  size: number;
  url: string;
}

export interface DocumentHistoryState {
  documents: Document[];
  currentPage: number;
  totalDocuments: number;
  recordsPerPage: number;
  isLoading: boolean;
  error: string | null;
} 