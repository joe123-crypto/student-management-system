
import React, { useState } from 'react';
import { User, StudentProfile, UserRole, Announcement } from '../types';
import Layout from '../components/Layout';

interface AttacheDashboardProps {
  user: User;
  students: StudentProfile[];
  announcements: Announcement[];
  onAddAnnouncement: (a: Announcement) => void;
  onLogout: () => void;
}

const AttacheDashboard: React.FC<AttacheDashboardProps> = ({ user, students, announcements, onAddAnnouncement, onLogout }) => {
  const [activeView, setActiveView] = useState<'students' | 'announcements' | 'settings'>('students');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'inscription'>('name');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  let filteredStudents = students.filter(s => 
    s.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student.inscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterStatus !== 'ALL') {
    filteredStudents = filteredStudents.filter(s => s.status === filterStatus);
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
      author: 'Attache Officer'
    };
    onAddAnnouncement(a);
    setNewTitle('');
    setNewContent('');
    setActiveView('announcements');
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Inscription,University,Program,Bank Account\n"
      + students.map(s => `${s.student.fullName},${s.student.inscriptionNumber},${s.university.universityName},${s.program.major},${s.bankAccount.accountNumber}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_database_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout role={UserRole.ATTACHE} userName="Attache Admin" title="Attache Management Console" onLogout={onLogout}>
      <div className="flex gap-4 mb-8 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveView('students')}
          className={`pb-4 px-4 text-sm font-semibold transition-all ${activeView === 'students' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Student Records
        </button>
        <button 
          onClick={() => setActiveView('announcements')}
          className={`pb-4 px-4 text-sm font-semibold transition-all ${activeView === 'announcements' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Announcements
        </button>
      </div>

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
              <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button 
              onClick={handleExport}
              className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export to CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
             <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort:</span>
                <select 
                  className="text-xs font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
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
                  {filteredStudents.map(s => (
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
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                          s.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-600 font-semibold text-sm hover:underline">Manage</button>
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
              <h4 className="text-lg font-bold mb-6">Create Announcement</h4>
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                >
                  Post Announcement
                </button>
              </form>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-lg font-bold mb-4">Past Announcements</h4>
            {announcements.map(a => (
              <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="text-lg font-bold text-slate-900">{a.title}</h5>
                    <p className="text-xs text-slate-400">Published on {a.date} by {a.author}</p>
                  </div>
                  <button className="text-red-600 text-sm font-semibold hover:underline">Delete</button>
                </div>
                <p className="text-slate-600 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AttacheDashboard;


