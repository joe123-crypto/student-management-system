import { Mail, ShieldCheck, UsersRound } from 'lucide-react';

export const ATTACHE_NAV_ITEMS = [
  { id: 'students', label: 'Student Records', icon: UsersRound },
  { id: 'announcements', label: 'Communication Center', icon: Mail },
  { id: 'permission-requests', label: 'Permissions', icon: ShieldCheck },
] as const;
