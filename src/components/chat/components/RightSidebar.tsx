import React from 'react';
import { Document, Page } from 'react-pdf';
import { Citation } from '../types/chat';

interface RightSidebarProps {
  isCitationsVisible: boolean;
  activeCitations: Citation[];
  pdfFile: string | null;
  pageScale: number;
  onScaleChange: (scale: number) => void;
  onClose: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isCitationsVisible,
  activeCitations,
  pdfFile,
  pageScale,
  onScaleChange,
  onClose
}) => {
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`Loaded ${numPages} pages`);
  };

  return (
    <div 
      className={`fixed right-0 top-0 w-[600px] h-screen bg-light-bg-primary dark:bg-dark-bg-primary 
        transform transition-all duration-300 ease-out shadow-lg border-l border-light-border dark:border-dark-border
        ${isCitationsVisible ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Source Pages ({activeCitations.length})
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onScaleChange(Math.max(0.5, pageScale - 0.1))}
              className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary group"
              title="Zoom out"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <div className="px-2 py-1 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              {Math.round(pageScale * 90)}%
            </div>
            <button
              onClick={() => onScaleChange(Math.min(2.0, pageScale + 0.1))}
              className="p-2 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary group"
              title="Zoom in"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 group"
              title="Close citations"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {activeCitations.length > 0 ? (
          <div className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-65px)] custom-scrollbar">
            {activeCitations.map(citation => (
              <div key={citation.id} className="space-y-4">
                <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      <svg className="w-4 h-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      Page {citation.pageNumber}
                    </span>
                    <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                      {new Date(citation.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                      {citation.content}
                    </p>
                  </div>
                </div>
                
                {/* PDF Page Render */}
                {pdfFile && (
                  <div className="flex justify-center bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg border border-light-border dark:border-dark-border shadow-sm">
                    <Document
                      file={pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={
                        <div className="flex items-center justify-center h-[500px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={citation.pageNumber}
                        scale={pageScale}
                        loading={
                          <div className="flex items-center justify-center h-[500px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                          </div>
                        }
                      />
                    </Document>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-65px)] text-light-text-tertiary dark:text-dark-text-tertiary">
            <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <p className="text-lg font-medium">No citations available</p>
            <p className="text-sm">Citations will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
}; 