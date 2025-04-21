import React, { useState } from 'react';

export interface ContentWarning {
  type: 'violence' | 'profanity' | 'nudity' | 'gore' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  count: number;
  timestamps: number[];
}

interface PrePlayAnalysisProps {
  contentWarnings: ContentWarning[];
  onConfirm: (selectedFilters: string[]) => void;
  onCancel: () => void;
}

export const PrePlayAnalysis: React.FC<PrePlayAnalysisProps> = ({
  contentWarnings,
  onConfirm,
  onCancel
}) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterToggle = (type: string) => {
    setSelectedFilters(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="pre-play-analysis">
      <h2>Content Analysis</h2>
      <div className="warning-list">
        {contentWarnings.map(warning => (
          <div key={warning.type} className="warning-item">
            <div className="warning-checkbox">
              <input
                type="checkbox"
                id={`warning-${warning.type}`}
                checked={selectedFilters.includes(warning.type)}
                onChange={() => handleFilterToggle(warning.type)}
                aria-label={warning.type.charAt(0).toUpperCase() + warning.type.slice(1)}
              />
              <label htmlFor={`warning-${warning.type}`}>
                {warning.type.charAt(0).toUpperCase() + warning.type.slice(1)}
              </label>
            </div>
            <div className="warning-info">
              <span className={`severity-badge ${warning.severity}`}>
                {warning.severity}
              </span>
              <span className="count-badge">
                {warning.count} instances
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => onConfirm(selectedFilters)}
          className="confirm-button"
        >
          Apply Selected Filters
        </button>
        <button 
          onClick={onCancel}
          className="cancel-button"
        >
          Continue Without Filters
        </button>
      </div>

      <style data-styled-jsx>{`
        .pre-play-analysis {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 600px;
          margin: 2rem auto;
        }

        .warning-list {
          margin: 2rem 0;
        }

        .warning-item {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .warning-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .warning-info {
          display: flex;
          gap: 0.5rem;
          margin-left: 1.5rem;
        }

        .severity-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .severity-badge.mild {
          background-color: var(--warning-mild);
          color: var(--text-dark);
        }

        .severity-badge.moderate {
          background-color: var(--warning-moderate);
          color: var(--text-dark);
        }

        .severity-badge.severe {
          background-color: var(--warning-severe);
          color: var(--text-light);
        }

        .count-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .confirm-button {
          background: #2196F3;
          color: white;
        }

        .cancel-button {
          background: transparent;
          border: 1px solid #ffffff40;
          color: white;
        }

        button:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default PrePlayAnalysis; 