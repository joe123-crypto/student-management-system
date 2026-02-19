
import React, { useState, useEffect, useRef } from 'react';
import { User, StudentProfile, UserRole, Announcement, ProgressDetails } from '../types';
import Layout from '../components/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PROGRESS_DATA } from '../constants';

interface StudentDashboardProps {
  user: User;
  student: StudentProfile | null;
  announcements: Announcement[];
  onUpdate: (id: string, profile: Partial<StudentProfile>) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, student, announcements, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'academic'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingAcademic, setIsUpdatingAcademic] = useState(false);
  const [editData, setEditData] = useState<StudentProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  // Form state for new academic progress
  const [newProgress, setNewProgress] = useState<Partial<ProgressDetails>>({
    year: '',
    level: '',
    grade: '',
    proofDocument: ''
  });

  useEffect(() => {
    if (student) setEditData(JSON.parse(JSON.stringify(student)));
  }, [student, isEditing]);

  if (!student || !editData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleUpdateField = (section: keyof StudentProfile, field: string, value: any) => {
    setEditData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      };
    });
  };

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUpdateField('student', 'profilePicture', base64String);
        if (!isEditing) {
          onUpdate(student.id, {
            student: { ...student.student, profilePicture: base64String }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProgress(prev => ({ ...prev, proofDocument: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    if (editData) {
      onUpdate(student.id, editData);
      setIsEditing(false);
    }
  };

  const submitAcademicUpdate = () => {
    if (!newProgress.year || !newProgress.grade || !newProgress.level) {
      alert("Please fill in Year, Level, and Grade.");
      return;
    }

    const updatedHistory = [...(student.academicHistory || [])];
    const newEntry: ProgressDetails = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      year: newProgress.year!,
      level: newProgress.level!,
      grade: newProgress.grade!,
      status: 'PENDING',
      proofDocument: newProgress.proofDocument
    };
    
    updatedHistory.push(newEntry);
    onUpdate(student.id, { academicHistory: updatedHistory });
    setIsUpdatingAcademic(false);
    setNewProgress({ year: '', level: '', grade: '', proofDocument: '' });
  };

  const getMissingItems = () => {
    const items = [];
    if (!student.student.profilePicture) items.push('Profile picture is missing');
    if (!student.bankAccount.iban) items.push('Bank RIB Key is missing');
    if (!student.bank.branchCode) items.push('Bank Branch Code is missing');
    
    // Check if progress report for Year 1 is missing (mock check)
    const hasYear1 = student.academicHistory?.some(h => h.year === 'Year 1');
    if (!hasYear1) items.push('Progress report for Year 1 is pending');
    
    return items;
  };

  const missingItems = getMissingItems();

  return (
    <Layout 
      role={UserRole.STUDENT} 
      userName={student.student.fullName} 
      title="Student Dashboard" 
      onLogout={onLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      profilePicture={student.student.profilePicture}
    >
      <div className="flex gap-8 mb-10 overflow-x-auto">
        <button 
          onClick={() => { setActiveTab('overview'); setIsEditing(false); setIsUpdatingAcademic(false); }}
          className={`pb-5 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Overview
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => { setActiveTab('profile'); setIsUpdatingAcademic(false); }}
          className={`pb-5 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          My Profile
          {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
        <button 
          onClick={() => { setActiveTab('academic'); setIsEditing(false); }}
          className={`pb-5 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'academic' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Academic Progress
          {activeTab === 'academic' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full"></div>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 relative pb-24">
        <div className="lg:col-span-2 space-y-10">
          
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px]">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Niveau</p>
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-[#1a1b3a] tracking-tighter">L1</span>
                    <span className="text-xl font-bold text-slate-300">/ L2</span>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[160px]">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Grade</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-indigo-600 tracking-tighter">17.2</span>
                    <span className="text-xl font-bold text-slate-300">/ 20</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                <h4 className="text-2xl font-black text-slate-900 mb-8 font-rounded">Latest Announcements</h4>
                <div className="space-y-6">
                  {announcements.map(a => (
                    <div key={a.id} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="text-xl font-extrabold text-[#1a1b3a] group-hover:text-indigo-600 transition-colors">{a.title}</h5>
                        <span className="text-xs font-bold text-slate-400 tracking-wider bg-white px-3 py-1 rounded-full border border-slate-100">{a.date}</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed font-medium">{a.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                    {(isEditing ? editData.student.profilePicture : student.student.profilePicture) ? (
                      <img 
                        src={isEditing ? editData.student.profilePicture : student.student.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleProfilePictureUpload} 
                  />
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h4 className="text-3xl font-black text-[#1a1b3a] font-rounded">
                    {isEditing ? editData.student.fullName : student.student.fullName}
                  </h4>
                  <p className="text-slate-500 font-medium">Inscription Number: <span className="font-mono font-bold text-indigo-600">{student.student.inscriptionNumber}</span></p>
                  <div className="flex gap-4 justify-center md:justify-start">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      Upload New Picture
                    </button>
                    {(isEditing ? editData.student.profilePicture : student.student.profilePicture) && (
                      <button 
                        onClick={() => handleUpdateField('student', 'profilePicture', undefined)}
                        className="text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <h4 className="text-2xl font-black text-[#1a1b3a] font-rounded">
                    {isEditing ? 'Fill Missing Details' : 'Database Record'}
                  </h4>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`text-sm font-bold px-8 py-3 rounded-full transition-all shadow-lg ${isEditing ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white shadow-indigo-100 hover:scale-105'}`}
                  >
                    {isEditing ? 'Cancel' : 'Edit Info'}
                  </button>
                </div>

                <div className="p-10 space-y-12">
                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Personal Identity</h5>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Given Name</label>
                        {isEditing ? (
                          <input 
                            value={editData.student.givenName || ''} 
                            onChange={e => handleUpdateField('student', 'givenName', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.student.givenName || student.student.fullName.split(' ')[0]}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Family Name</label>
                        {isEditing ? (
                          <input 
                            value={editData.student.familyName || ''} 
                            onChange={e => handleUpdateField('student', 'familyName', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.student.familyName || student.student.fullName.split(' ')[1] || '---'}</p>}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bank Details</h5>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Bank Name</label>
                        {isEditing ? (
                          <input 
                            value={editData.bank.bankName} 
                            onChange={e => handleUpdateField('bank', 'bankName', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.bank.bankName}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Account Number</label>
                        {isEditing ? (
                          <input 
                            value={editData.bankAccount.accountNumber} 
                            onChange={e => handleUpdateField('bankAccount', 'accountNumber', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-mono font-bold text-slate-800">{student.bankAccount.accountNumber}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">RIB Key</label>
                        {isEditing ? (
                          <input 
                            value={editData.bankAccount.iban} 
                            onChange={e => handleUpdateField('bankAccount', 'iban', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-mono font-bold text-indigo-600">{student.bankAccount.iban}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Branch Code</label>
                        {isEditing ? (
                          <input 
                            value={editData.bank.branchCode || ''} 
                            onChange={e => handleUpdateField('bank', 'branchCode', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.bank.branchCode || '---'}</p>}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-amber-600 rounded-full"></div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contact Details</h5>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Email Address</label>
                        {isEditing ? (
                          <input 
                            value={editData.contact.email} 
                            onChange={e => handleUpdateField('contact', 'email', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.contact.email}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Phone Number</label>
                        {isEditing ? (
                          <input 
                            value={editData.contact.phone} 
                            onChange={e => handleUpdateField('contact', 'phone', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.contact.phone || '---'}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Emergency Contact Name</label>
                        {isEditing ? (
                          <input 
                            value={editData.contact.emergencyContactName} 
                            onChange={e => handleUpdateField('contact', 'emergencyContactName', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.contact.emergencyContactName || '---'}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Emergency Phone</label>
                        {isEditing ? (
                          <input 
                            value={editData.contact.emergencyContactPhone} 
                            onChange={e => handleUpdateField('contact', 'emergencyContactPhone', e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        ) : <p className="text-lg font-bold text-slate-800">{student.contact.emergencyContactPhone || '---'}</p>}
                      </div>
                    </div>
                  </section>
                </div>

                {isEditing && (
                  <div className="p-10 bg-indigo-50 flex items-center justify-between border-t border-indigo-100 sticky bottom-0 z-10 animate-slide-up">
                    <p className="text-sm font-bold text-indigo-600">You have unsaved changes in your profile.</p>
                    <div className="flex gap-4">
                      <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Discard</button>
                      <button onClick={saveProfile} className="bg-indigo-600 text-white text-sm font-bold px-10 py-3 rounded-full shadow-xl shadow-indigo-100 hover:scale-105 transition-all">Save Profile</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 min-h-[500px] transition-all overflow-hidden relative">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <h4 className="text-2xl font-black text-[#1a1b3a] font-rounded">
                    {isUpdatingAcademic ? 'Upload Progress Details' : 'Progress'}
                  </h4>
                  {!isUpdatingAcademic && (
                    <button 
                      onClick={() => setIsUpdatingAcademic(true)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100 hover:scale-105 transition-all active:scale-95"
                    >
                      Update
                    </button>
                  )}
                </div>
                {!isUpdatingAcademic && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                    Real-time Data
                  </div>
                )}
              </div>

              {!isUpdatingAcademic ? (
                <div className="space-y-12">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PROGRESS_DATA}>
                        <defs>
                          <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94a3b8" 
                          fontSize={10} 
                          fontWeight="bold" 
                          axisLine={false} 
                          tickLine={false} 
                          dy={10}
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          domain={[0, 4]} 
                          fontSize={10} 
                          fontWeight="bold" 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '20px', 
                            border: 'none', 
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                            padding: '16px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="gpa" 
                          stroke="#4f46e5" 
                          strokeWidth={5} 
                          fillOpacity={1} 
                          fill="url(#colorGpa)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {student.academicHistory && student.academicHistory.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Submission History</h5>
                      <div className="grid gap-4">
                        {student.academicHistory.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{entry.year} - {entry.level}</p>
                              <p className="text-xs text-slate-400 font-medium">Submitted on {entry.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-indigo-600">{entry.grade}/20</p>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{entry.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in space-y-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Academic Year</label>
                      <select 
                        value={newProgress.year}
                        onChange={e => setNewProgress(p => ({ ...p, year: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="">Select Year</option>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                        <option value="Year 5">Year 5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Level</label>
                      <input 
                        placeholder="e.g. L1, M2"
                        value={newProgress.level}
                        onChange={e => setNewProgress(p => ({ ...p, level: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Final Grade (/20)</label>
                      <input 
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={newProgress.grade}
                        onChange={e => setNewProgress(p => ({ ...p, grade: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Proof of Result (Transcript)</label>
                    <div 
                      onClick={() => proofInputRef.current?.click()}
                      className={`w-full h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${newProgress.proofDocument ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-200'}`}
                    >
                      {newProgress.proofDocument ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Document Uploaded</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setNewProgress(p => ({ ...p, proofDocument: '' })); }}
                            className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase mt-2"
                          >
                            Replace
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          </div>
                          <span className="text-sm font-bold text-slate-600">Drop your transcript here</span>
                          <span className="text-xs text-slate-400 mt-1 font-medium">Or click to browse (PDF, PNG, JPG)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        ref={proofInputRef} 
                        className="hidden" 
                        onChange={handleProofUpload}
                        accept=".pdf,image/*"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => setIsUpdatingAcademic(false)}
                      className="px-8 py-3 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={submitAcademicUpdate}
                      className="px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
                    >
                      Submit for Validation
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar wrapper that maintains row height for proper sticky behavior */}
        <aside className="relative h-full">
          <div className="md:sticky md:top-20 space-y-8 z-10 transition-all">
            <div className="bg-[#1a1b3a] text-white rounded-[2rem] p-10 shadow-[0_32px_64px_-16px_rgba(26,27,58,0.3)] relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl transition-all group-hover:scale-125"></div>
              <div className="relative z-10 flex flex-col">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">Action Center</p>
                <h4 className="text-2xl font-black mb-8 leading-tight">Missing Information</h4>
                
                <div className="space-y-5">
                  {missingItems.length > 0 ? (
                    missingItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item cursor-pointer">
                        <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-indigo-400 mt-0.5 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">
                          {item}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm font-bold text-slate-300">Your profile is up to date!</p>
                    </div>
                  )}
                </div>

                {missingItems.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Priority High</span>
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                      <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
