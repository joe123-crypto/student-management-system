import type { Announcement } from '@/types';

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Visa Renewal Workshop',
    content: 'All students with visas expiring in the next 3 months must attend the workshop on Friday at 2 PM in Hall B.',
    date: '2024-05-20',
    author: 'Admin Attache',
  },
  {
    id: 'a2',
    title: 'Bank Allowance Update',
    content: 'The monthly scholarship allowance for June has been processed. Please check your bank accounts by the 5th of the month.',
    date: '2024-05-18',
    author: 'Admin Attache',
  },
];
