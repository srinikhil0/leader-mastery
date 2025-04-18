import React from 'react';
import { Persona } from '../types';
import { getExpertIcon } from '../utils/expertUtils';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  experts: string[];
  selectedExpert: string | null;
  subExperts: string[];
  selectedSubExpert: string | null;
  onExpertSelect: (expert: string) => void;
  onSubExpertSelect: (subExpert: string) => void;
  onClearSubExpert: () => void;
}

const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  experts,
  selectedExpert,
  subExperts,
  selectedSubExpert,
  onExpertSelect,
  onSubExpertSelect,
  onClearSubExpert
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Select an Expert</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experts.map((expert) => (
            <button
              key={expert}
              onClick={() => onExpertSelect(expert)}
              className={`p-4 rounded-lg border ${
                selectedExpert === expert
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-semibold">{expert}</h3>
            </button>
          ))}
        </div>

        {selectedExpert && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Specialization</h3>
              <button
                onClick={onClearSubExpert}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Clear Selection
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subExperts.map((subExpert) => (
                <button
                  key={subExpert}
                  onClick={() => onSubExpertSelect(subExpert)}
                  className={`p-4 rounded-lg border ${
                    selectedSubExpert === subExpert
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h4 className="font-medium">{subExpert}</h4>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaModal; 