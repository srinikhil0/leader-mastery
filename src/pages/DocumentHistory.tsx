import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, DocumentHistoryState } from '../types/document';
import SettingsModal from '../components/settings/SettingsModal';
import { useAuth } from '../hooks/useAuth';

const DocumentHistory = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [state, setState] = useState<DocumentHistoryState>({
    documents: [],
    currentPage: 1,
    totalDocuments: 0,
    recordsPerPage: 10,
    isLoading: true,
    error: null
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Mock data for demonstration
  useEffect(() => {
    const mockDocuments: Document[] = Array.from({ length: 35 }, (_, i) => ({
      id: `doc-${i + 1}`,
      name: `Document ${i + 1}.${i % 3 === 0 ? 'pdf' : i % 3 === 1 ? 'docx' : 'xlsx'}`,
      type: i % 3 === 0 ? 'pdf' : i % 3 === 1 ? 'docx' : 'xlsx',
      chatId: `chat-${Math.floor(i / 5) + 1}`,
      chatTitle: `Chat Session ${Math.floor(i / 5) + 1}`,
      uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      size: Math.floor(Math.random() * 10000000),
      url: '#'
    }));

    setState(prev => ({
      ...prev,
      documents: mockDocuments,
      totalDocuments: mockDocuments.length,
      isLoading: false
    }));
  }, []);

  // Left Sidebar Component
  const LeftSidebar = () => (
    <>
      {/* Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`${
          isMobile 
            ? `fixed inset-y-0 left-0 w-64 z-30 transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'w-64'
        } h-screen bg-light-bg-primary dark:bg-dark-bg-primary flex flex-col border-r border-light-border dark:border-dark-border`}
      >
        <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <img 
            src="./leader-mastery-emblem-text.png" 
            alt="Leader Mastery"
            className="h-8 w-auto"
          />
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button 
          onClick={() => navigate('/chat')}
          className="mx-4 mt-4 bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Empty space for future content */}
        </div>

        <div className="p-4 border-t border-light-border dark:border-dark-border space-y-2">
          <button 
            onClick={() => navigate('/chat')}
            className="w-full py-2 px-4 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Chat</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full py-2 px-4 rounded-lg hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </>
  );

  const handleRecordsPerPageChange = (value: number) => {
    setState(prev => ({
      ...prev,
      recordsPerPage: value,
      currentPage: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Calculate pagination values
  const totalPages = Math.ceil(state.totalDocuments / state.recordsPerPage);
  const startIndex = (state.currentPage - 1) * state.recordsPerPage;
  const endIndex = Math.min(startIndex + state.recordsPerPage, state.totalDocuments);
  const currentDocuments = state.documents.slice(startIndex, endIndex);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
      {/* Show sidebar differently based on viewport */}
      {!isMobile && <LeftSidebar />}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-light-bg-primary dark:bg-dark-bg-primary">
        {/* Header */}
        <div className="flex-shrink-0 bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border">
          <div className="p-6 flex items-center">
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="mr-4 p-1 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary">Document History</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-light-bg-primary dark:bg-dark-bg-primary">
          {state.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : state.error ? (
            <div className="text-error text-center">{state.error}</div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Scrollable Table Container */}
              <div className="flex-1 overflow-y-auto p-6 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-light-bg-secondary
                [&::-webkit-scrollbar-track]:dark:bg-dark-bg-secondary
                [&::-webkit-scrollbar-thumb]:bg-light-border
                [&::-webkit-scrollbar-thumb]:dark:bg-dark-border
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:border-2
                [&::-webkit-scrollbar-thumb]:border-light-bg-primary
                [&::-webkit-scrollbar-thumb]:dark:border-dark-bg-primary">
                <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
                  <div className="overflow-x-auto
                    [&::-webkit-scrollbar]:h-2
                    [&::-webkit-scrollbar-track]:bg-light-bg-secondary
                    [&::-webkit-scrollbar-track]:dark:bg-dark-bg-secondary
                    [&::-webkit-scrollbar-thumb]:bg-light-border
                    [&::-webkit-scrollbar-thumb]:dark:bg-dark-border
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:border-2
                    [&::-webkit-scrollbar-thumb]:border-light-bg-primary
                    [&::-webkit-scrollbar-thumb]:dark:border-dark-bg-primary">
                    <table className="w-full">
                      <thead className="sticky top-0 bg-light-bg-primary dark:bg-dark-bg-primary">
                        <tr className="border-b border-light-border dark:border-dark-border">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                            Document Name
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                            Chat Instance
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                            Upload Date
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                            Size
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDocuments.map(doc => (
                          <tr key={doc.id} className="hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary">
                            <td className="px-6 py-4 text-sm text-light-text-primary dark:text-dark-text-primary">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{doc.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary uppercase">
                              {doc.type}
                            </td>
                            <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              {doc.chatTitle}
                            </td>
                            <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              {doc.uploadedAt.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              {formatFileSize(doc.size)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Fixed Pagination at Bottom */}
              <div className="flex-shrink-0 border-t border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Show</span>
                    <select
                      value={state.recordsPerPage}
                      onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 text-sm border rounded-lg border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {[10, 25, 50, 100].map(value => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">per page</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {startIndex + 1}-{endIndex} of {state.totalDocuments}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePageChange(state.currentPage - 1)}
                        disabled={state.currentPage === 1}
                        className="p-1 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePageChange(state.currentPage + 1)}
                        disabled={state.currentPage === totalPages}
                        className="p-1 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render mobile sidebar */}
      {isMobile && <LeftSidebar />}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />
    </div>
  );
};

export default DocumentHistory; 