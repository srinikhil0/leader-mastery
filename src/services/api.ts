import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';  // FastAPI default port

interface UploadPDFResponse {
  filename: string;
  message: string;
  metadata: {
    '/Title'?: string;
    '/Author'?: string;
    '/Subject'?: string;
    '/Keywords'?: string;
    '/Creator'?: string;
    '/Producer'?: string;
    '/CreationDate'?: string;
    '/ModDate'?: string;
    [key: string]: string | undefined;
  };
  coll_name: string;
}

interface RetrieveChunksResponse {
  question: string;
  retrieved_docs: string[] | string | Record<string, unknown>;
  page_numbers: number[];
  page_contents?: string[]; // Array of page contents corresponding to page_numbers
  answer?: string;
}

export const apiService = {
  // Upload PDF file
  async uploadPDF(file: File, userId: number): Promise<UploadPDFResponse> {
    // Validate file type
    if (!file.type || !file.type.includes('pdf')) {
      throw new Error('Only PDF files are allowed');
    }

    // Generate a numeric user ID from the string UID
    // This ensures we always have a valid integer ID
    const numericUserId = Math.abs(userId) || 1;

    const formData = new FormData();
    formData.append('file_pdf', file);
    formData.append('user_id', numericUserId.toString());

    try {
      const response = await axios.post(`${API_BASE_URL}/upload_pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          console.error('Validation error:', error.response.data);
          throw new Error('Invalid file or user ID. Please check your input.');
        }
        console.error('Error details:', error.response?.data);
      }
      console.error('Error uploading PDF:', error);
      throw error;
    }
  },

  // Ask a question about the document
  async askQuestion(question: string, userId: number, collectionName: string): Promise<RetrieveChunksResponse> {
    const numericUserId = Math.abs(userId) || 1;

    const formData = new FormData();
    formData.append('question_text', question);
    formData.append('user_id', numericUserId.toString());
    formData.append('collection_name', collectionName);

    try {
      const response = await axios.post(`${API_BASE_URL}/retrieve_chunks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  },

  // Retrieve document chunks (without a question)
  async retrieveChunks(collectionName: string, userId: number): Promise<RetrieveChunksResponse> {
    const numericUserId = Math.abs(userId) || 1;

    const formData = new FormData();
    formData.append('collection_name', collectionName);
    formData.append('user_id', numericUserId.toString());

    try {
      const response = await axios.post(`${API_BASE_URL}/retrieve_chunks`, formData);
      return response.data;
    } catch (error) {
      console.error('Error retrieving chunks:', error);
      throw error;
    }
  },
}; 