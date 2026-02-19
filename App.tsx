
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, StudentProfile, Announcement } from './types';
import { MOCK_STUDENTS, MOCK_ANNOUNCEMENTS } from './constants';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import StudentDashboard from './pages/StudentDashboard';
import AttacheDashboard from './pages/AttacheeDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('announcements');
    return saved ? JSON.parse(saved) : MOCK_ANNOUNCEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
  }, [announcements]);

  const handleLogout = () => {
    setUser(null);
  };

  const addStudent = (profile: StudentProfile) => {
    setStudents(prev => [...prev, profile]);
  };

  const updateStudent = (id: string, profile: Partial<StudentProfile>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...profile } : s));
  };

  const addAnnouncement = (a: Announcement) => {
    setAnnouncements(prev => [a, ...prev]);
  };

  return (
    <HashRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
          
          <Route 
            path="/onboarding" 
            element={
              user?.role === UserRole.STUDENT ? 
              <OnboardingPage user={user} onComplete={addStudent} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/student-dashboard" 
            element={
              user?.role === UserRole.STUDENT ? 
              <StudentDashboard 
                user={user} 
                student={students.find(s => s.contact.email === user.email) || null}
                announcements={announcements}
                onUpdate={updateStudent}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/login" />
            } 
          />

          <Route 
            path="/attache-dashboard" 
            element={
              user?.role === UserRole.ATTACHÉ ? 
              <AttacheDashboard 
                user={user} 
                students={students}
                announcements={announcements}
                onAddAnnouncement={addAnnouncement}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/login" />
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
