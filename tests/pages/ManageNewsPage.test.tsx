import React from 'react';
import { render, screen } from '@testing-library/react';
import ManageNewsPage from '@/pages/ManageNewsPage';
import { apiRequest } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('@/components/ui/NewsStatusBadge', () => ({
  __esModule: true,
  default: ({ status }: any) => <span>{status}</span>,
}));

jest.mock('@/components/modals/ConfirmationModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

describe('ManageNewsPage', () => {
  test('maps backend is_published to status and publishedDate', async () => {
    (apiRequest as jest.Mock).mockResolvedValue([
      { id: 'NEWS-001', title: 'ข่าว A', author_name: 'ผู้เขียน', is_published: true, published_date: '2026-01-01T00:00:00.000Z' },
      { id: 'NEWS-002', title: 'ข่าว B', author_name: 'ผู้เขียน', is_published: false, published_date: null },
    ]);

    render(<ManageNewsPage setActiveView={() => { }} />);

    expect(await screen.findByText('ข่าว A')).toBeInTheDocument();
    expect(await screen.findByText('published')).toBeInTheDocument();
    expect(await screen.findByText('draft')).toBeInTheDocument();
  });
});

