import axios from 'axios';

const API_BASE_URL = 'http://localhost:8016';

interface Citation {
  page_number: number;
  document_name: string;
  excerpt: string;
}

interface AskQuestionResponse {
  response: string;
  citations: Citation[];
  image_paths: string[];
}

interface AskQuestionRequest {
  question: string;
  expert: string;
  sub_expert?: string;
}

export const pdfApi = {
  // Check API status
  checkStatus: async () => {
    const response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  },

  // Upload PDF
  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/upload-pdf/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Ask a question
  askQuestion: async (request: AskQuestionRequest): Promise<AskQuestionResponse> => {
    const response = await axios.post(`${API_BASE_URL}/ask-question`, request);
    return response.data;
  },

  // Get list of experts
  getExperts: async () => {
    const response = await axios.get(`${API_BASE_URL}/experts/`);
    return response.data.experts;
  },

  // Get sub-experts for a given expert
  getSubExperts: async (expert: string) => {
    const response = await axios.get(`${API_BASE_URL}/sub_experts/?expert=${expert}`);
    return response.data.sub_experts;
  }
}; 