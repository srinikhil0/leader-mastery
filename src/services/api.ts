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
  async uploadPDF(file: File, userId: string): Promise<UploadPDFResponse> {
    console.log('Starting PDF upload process...');
    console.log('File details:', { name: file.name, type: file.type, size: file.size });
    console.log('Using Firebase User ID:', userId);

    // Validate file type
    if (!file.type || !file.type.includes('pdf')) {
      console.error('Invalid file type:', file.type);
      throw new Error('Only PDF files are allowed');
    }

    const formData = new FormData();
    formData.append('file_pdf', file);
    formData.append('user_id', userId);

    try {
      console.log('Sending upload request to:', `${API_BASE_URL}/upload_pdf`);
      const response = await axios.post(`${API_BASE_URL}/upload_pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      console.log('Upload successful:', response.data);
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
  async askQuestion(question: string, collectionName: string, userId: string): Promise<RetrieveChunksResponse> {
    console.log('Starting question process...');
    console.log('Question:', question);
    console.log('Using Firebase User ID:', userId);
    console.log('Collection name:', collectionName);

    const formData = new FormData();
    formData.append('question_text', question);
    formData.append('collection_name', collectionName);
    formData.append('user_id', userId);

    try {
      console.log('Sending question request to:', `${API_BASE_URL}/retrieve_chunks`);
      const response = await axios.post(`${API_BASE_URL}/retrieve_chunks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      console.log('Question response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  },

  // Retrieve document chunks (without a question)
  async retrieveChunks(collectionName: string, userId: string): Promise<RetrieveChunksResponse> {
    console.log('Starting chunk retrieval process...');
    console.log('Collection name:', collectionName);
    console.log('Using Firebase User ID:', userId);

    const formData = new FormData();
    formData.append('collection_name', collectionName);
    formData.append('user_id', userId);

    try {
      console.log('Sending chunk retrieval request to:', `${API_BASE_URL}/retrieve_chunks`);
      const response = await axios.post(`${API_BASE_URL}/retrieve_chunks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      console.log('Chunk retrieval successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error retrieving chunks:', error);
      throw error;
    }
  },
}; 