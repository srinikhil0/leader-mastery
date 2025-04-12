import React, { useState } from 'react';
import { pdfApi } from '../../api/pdfApi';

interface Citation {
  page_number: number;
  document_name: string;
  excerpt: string;
}

const PdfApiTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [experts, setExperts] = useState<string[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string>('');
  const [subExperts, setSubExperts] = useState<string[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [citations, setCitations] = useState<Citation[]>([]);

  const testApiStatus = async () => {
    try {
      const response = await pdfApi.checkStatus();
      setStatus(JSON.stringify(response));
    } catch (error) {
      setStatus('Error: ' + (error as Error).message);
    }
  };

  const loadExperts = async () => {
    try {
      const expertList = await pdfApi.getExperts();
      setExperts(expertList);
    } catch (error) {
      console.error('Error loading experts:', error);
    }
  };

  const loadSubExperts = async (expert: string) => {
    try {
      const subExpertList = await pdfApi.getSubExperts(expert);
      setSubExperts(subExpertList);
    } catch (error) {
      console.error('Error loading sub-experts:', error);
    }
  };

  const askQuestion = async () => {
    try {
      const response = await pdfApi.askQuestion({
        question,
        expert: selectedExpert,
      });
      setAnswer(response.response);
      setCitations(response.citations);
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PDF API Test</h1>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={testApiStatus}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test API Status
          </button>
          <pre className="mt-2 bg-gray-100 p-2 rounded">{status}</pre>
        </div>

        <div>
          <button 
            onClick={loadExperts}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Load Experts
          </button>
          <div className="mt-2">
            {experts.map(expert => (
              <button
                key={expert}
                onClick={() => {
                  setSelectedExpert(expert);
                  loadSubExperts(expert);
                }}
                className={`mr-2 px-3 py-1 rounded ${
                  selectedExpert === expert ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {expert}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Sub-Experts</h2>
          <div className="flex flex-wrap gap-2">
            {subExperts.map(subExpert => (
              <span key={subExpert} className="bg-gray-200 px-3 py-1 rounded">
                {subExpert}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Ask a Question</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={askQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ask
            </button>
          </div>
        </div>

        {answer && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Answer</h2>
            <p className="bg-gray-100 p-4 rounded">{answer}</p>
          </div>
        )}

        {citations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Citations</h2>
            <div className="space-y-2">
              {citations.map((citation, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded">
                  <p><strong>Document:</strong> {citation.document_name}</p>
                  <p><strong>Page:</strong> {citation.page_number}</p>
                  <p><strong>Excerpt:</strong> {citation.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfApiTest; 