import React, { useState } from 'react';
import { Announcement, StudentProfile, User, UserRole } from '@/types';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import AnnouncementCard from '@/components/ui/AnnouncementCard';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionHeader from '@/components/ui/SectionHeader';

interface AttacheDashboardProps {
  user: User;
  students: StudentProfile[];
  announcements: Announcement[];
  onAddAnnouncement: (a: Announcement) => void;
  onLogout: () => void;
}

const tabItems = [
  { id: 'students', label: 'Student Records' },
  { id: 'announcements', label: 'Announcements' },
] as const;

type ActiveView = (typeof tabItems)[number]['id'];

const AttacheDashboard: React.FC<AttacheDashboardProps> = ({ user, students, announcements, onAddAnnouncement, onLogout }) => {
  const [activeView, setActiveView] = useState<ActiveView>('students');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'inscription'>('name');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  let filteredStudents = students.filter(
    (s) =>
      s.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.inscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (filterStatus !== 'ALL') {
    filteredStudents = filteredStudents.filter((s) => s.status === filterStatus);
  }

  filteredStudents.sort((a, b) => {
    if (sortBy === 'name') return a.student.fullName.localeCompare(b.student.fullName);
    return a.student.inscriptionNumber.localeCompare(b.student.inscriptionNumber);
  });

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const a: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      author: 'Attache Officer',
    };

    onAddAnnouncement(a);
    setNewTitle('');
    setNewContent('');
    setActiveView('announcements');
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Inscription,University,Program,Bank Account\n' +
      students
        .map(
          (s) =>
            `${s.student.fullName},${s.student.inscriptionNumber},${s.university.universityName},${s.program.major},${s.bankAccount.accountNumber}`,
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_database_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout role={UserRole.ATTACHE} userName={user.email} title="Attache Management Console" onLogout={onLogout}>
      <Tabs items={tabItems} activeTab={activeView} onChange={(tab) => setActiveView(tab as ActiveView)} className="mb-8" />

      {activeView === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search students..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Button onClick={handleExport} variant="success" className="w-full md:w-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to CSV
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
              <select
                className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'inscription')}
              >
                <option value="name">Name (A-Z)</option>
                <option value="inscription">Inscription No.</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
              <select
                className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Inscription No.</th>
                    <th className="px-6 py-4">University / Program</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{s.student.fullName}</div>
                        <div className="text-xs text-slate-500">{s.contact.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600">{s.student.inscriptionNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{s.university.universityName}</div>
                        <div className="text-xs text-slate-500">{s.program.major}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-slate-500">No students found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'announcements' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <SectionHeader title="Create Announcement" className="mb-6" />
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <FormField label="Title">
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </FormField>
                <FormField label="Content">
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </FormField>
                <Button type="submit" fullWidth>
                  Post Announcement
                </Button>
              </form>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <SectionHeader title="Past Announcements" className="mb-4" />
            {announcements.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                compact
                actions={
                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                    Delete
                  </Button>
                }
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AttacheDashboard;


