import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PrePlayAnalysis, { ContentWarning } from '../PrePlayAnalysis';

describe('PrePlayAnalysis', () => {
  const mockContentWarnings: ContentWarning[] = [
    {
      type: 'violence',
      severity: 'moderate',
      count: 3,
      timestamps: [120, 350, 780]
    },
    {
      type: 'profanity',
      severity: 'mild',
      count: 5,
      timestamps: [45, 160, 280, 420, 600]
    }
  ];

  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup({ delay: null });
  });

  it('renders all content warnings', async () => {
    await render(
      <PrePlayAnalysis
        contentWarnings={mockContentWarnings}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: /content analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /violence/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /profanity/i })).toBeInTheDocument();
    expect(screen.getByText('3 instances')).toBeInTheDocument();
    expect(screen.getByText('5 instances')).toBeInTheDocument();
  });

  it('renders content warnings with checkboxes', async () => {
    await render(
      <PrePlayAnalysis contentWarnings={mockContentWarnings} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    for (const warning of mockContentWarnings) {
      const label = warning.type.charAt(0).toUpperCase() + warning.type.slice(1);
      const checkbox = screen.getByRole('checkbox', { name: new RegExp(label, 'i') });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    }
  });

  it('displays severity badges correctly', async () => {
    await render(
      <PrePlayAnalysis contentWarnings={mockContentWarnings} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    for (const warning of mockContentWarnings) {
      const severityBadge = screen.getByText(warning.severity);
      expect(severityBadge).toHaveClass(`severity-badge ${warning.severity}`);
    }
  });

  it('toggles filters when checkboxes are clicked', async () => {
    await render(
      <PrePlayAnalysis contentWarnings={mockContentWarnings} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />
    );

    for (const warning of mockContentWarnings) {
      const label = warning.type.charAt(0).toUpperCase() + warning.type.slice(1);
      const checkbox = screen.getByRole('checkbox', { name: new RegExp(label, 'i') }) as HTMLInputElement;
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    }
  });

  it('calls onConfirm with selected filters', async () => {
    await render(
      <PrePlayAnalysis
        contentWarnings={mockContentWarnings}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Select both filters
    await user.click(screen.getByRole('checkbox', { name: /violence/i }));
    await user.click(screen.getByRole('checkbox', { name: /profanity/i }));

    // Click confirm button
    await user.click(screen.getByRole('button', { name: /apply selected filters/i }));

    expect(mockOnConfirm).toHaveBeenCalledWith(['violence', 'profanity']);
  });

  it('calls onCancel when continuing without filters', async () => {
    await render(
      <PrePlayAnalysis
        contentWarnings={mockContentWarnings}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /continue without filters/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('maintains correct state when toggling multiple filters', async () => {
    await render(
      <PrePlayAnalysis
        contentWarnings={mockContentWarnings}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Toggle Violence on
    await user.click(screen.getByRole('checkbox', { name: /violence/i }));
    await user.click(screen.getByRole('button', { name: /apply selected filters/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(['violence']);

    // Toggle Profanity on
    await user.click(screen.getByRole('checkbox', { name: /profanity/i }));
    await user.click(screen.getByRole('button', { name: /apply selected filters/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(['violence', 'profanity']);

    // Toggle Violence off
    await user.click(screen.getByRole('checkbox', { name: /violence/i }));
    await user.click(screen.getByRole('button', { name: /apply selected filters/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith(['profanity']);
  });

  it('renders correct count badges', async () => {
    await render(
      <PrePlayAnalysis
        contentWarnings={mockContentWarnings}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    for (const warning of mockContentWarnings) {
      expect(screen.getByText(`${warning.count} instances`)).toBeInTheDocument();
    }
  });

  it('renders with empty content warnings', async () => {
    await render(
      <PrePlayAnalysis
        contentWarnings={[]}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: /content analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply selected filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue without filters/i })).toBeInTheDocument();
  });
}); 