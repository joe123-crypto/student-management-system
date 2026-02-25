import React, { useEffect, useMemo, useState } from 'react';
import { Announcement, StudentProfile, UserRole } from '@/types';
import Layout from '@/components/layout/Layout';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import SavedViewsBar from '@/components/features/attache/components/SavedViewsBar';
import StudentQueryToolbar from '@/components/features/attache/components/StudentQueryToolbar';
import StudentAdvancedFilters from '@/components/features/attache/components/StudentAdvancedFilters';
import BulkActionsBar from '@/components/features/attache/components/BulkActionsBar';
import StudentRecordsTable from '@/components/features/attache/components/StudentRecordsTable';
import DataInsightsPanel from '@/components/features/attache/components/DataInsightsPanel';
import CommunicationCenter from '@/components/features/attache/components/CommunicationCenter';
import StudentDetailView from '@/components/features/attache/components/StudentDetailView';
import {
  AnnouncementComposerCard,
  AnnouncementFeedSection,
} from '@/components/features/shared/announcements/AnnouncementSections';
import Checkbox from '@/components/ui/Checkbox';
import { AlertCircle, CheckCircle2, Database, Download, FileSpreadsheet, Upload } from 'lucide-react';
import type { CommunicationLogEntry, SavedView, StudentQueryState } from '@/components/features/attache/types';
import {
  applyStudentQuery,
  buildStudentCsv,
  buildStudentDelimited,
  buildStudentJson,
  downloadFile,
  DEFAULT_STUDENT_QUERY,
  getDuplicateGroups,
  getQualityFlags,
  REPORT_COLUMNS,
} from '@/components/features/attache/utils/studentData';

interface AttacheDashboardProps {
  students: StudentProfile[];
  announcements: Announcement[];
  onAddAnnouncement: (a: Announcement) => void;
  onDeleteStudents: (studentIds: string[]) => void;
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => void;
  section: 'dashboard' | 'settings';
  onNavigateSection: (section: 'dashboard' | 'settings') => void;
  onLogout: () => void;
}

const tabItems = [
  { id: 'students', label: 'Student Records' },
  { id: 'announcements', label: 'Announcements' },
] as const;

type ActiveView = (typeof tabItems)[number]['id'];

const SAVED_VIEWS_KEY = 'attache_saved_views';

const defaultReportColumns = ['fullName', 'email', 'inscriptionNumber', 'status', 'university', 'program'];
const CSV_TEMPLATE =
  'fullName,email,inscriptionNumber,universityName,major,degreeLevel,status,phone,nationality,gender\n' +
  'John Doe,john.doe@example.com,INS-2026-001,Example University,Computer Science,Masters,ACTIVE,+1 555 0100,American,M';

type CsvDelimiterOption = 'auto' | ',' | ';' | '\t';

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const output: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      output.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  output.push(current.trim());
  return output;
}

function detectDelimiter(source: string): string {
  const firstLine = source.split(/\r?\n/).find((line) => line.trim().length > 0) || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (tabCount > semicolonCount && tabCount > commaCount) return '\t';
  if (semicolonCount > commaCount) return ';';
  return ',';
}

function parseCsvRows(source: string, delimiterOption: CsvDelimiterOption) {
  const delimiter = delimiterOption === 'auto' ? detectDelimiter(source) : delimiterOption;
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    return headers.reduce<Record<string, string>>((row, key, index) => {
      row[key] = (values[index] || '').trim();
      return row;
    }, {});
  });
}

function getCsvValue(row: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];
    if (value) return value;
  }
  return '';
}

function toStudentProfile(row: Record<string, string>, index: number): StudentProfile | null {
  const email = getCsvValue(row, ['email', 'studentemail', 'contactemail']).toLowerCase();
  const givenName = getCsvValue(row, ['givenname', 'firstname', 'namefirst']);
  const familyName = getCsvValue(row, ['familyname', 'lastname', 'namelast']);
  const fullName = getCsvValue(row, ['fullname', 'studentname']) || `${givenName} ${familyName}`.trim();
  const inscriptionNumber = getCsvValue(row, ['inscriptionnumber', 'registrationnumber', 'studentid']);

  if (!email || !fullName) {
    return null;
  }

  const inferredGivenName = givenName || fullName.split(' ')[0] || '';
  const inferredFamilyName = familyName || fullName.split(' ').slice(1).join(' ') || '';
  const rawGender = getCsvValue(row, ['gender']).toUpperCase();
  const gender = rawGender === 'F' ? 'F' : rawGender === 'OTHER' ? 'Other' : 'M';
  const rawStatus = getCsvValue(row, ['status']).toUpperCase();
  const status: StudentProfile['status'] =
    rawStatus === 'ACTIVE' || rawStatus === 'COMPLETED' ? rawStatus : 'PENDING';

  return {
    id: Math.random().toString(36).substr(2, 9) || `csv-${index}`,
    student: {
      fullName,
      givenName: inferredGivenName,
      familyName: inferredFamilyName,
      inscriptionNumber: inscriptionNumber || `CSV-${Date.now()}-${index + 1}`,
      dateOfBirth: getCsvValue(row, ['dateofbirth', 'dob']),
      nationality: getCsvValue(row, ['nationality']) || 'Unknown',
      gender,
    },
    passport: {
      passportNumber: getCsvValue(row, ['passportnumber']),
      issueDate: getCsvValue(row, ['passportissuedate', 'issueDate']),
      expiryDate: getCsvValue(row, ['passportexpirydate', 'expiryDate']),
      issuingCountry: getCsvValue(row, ['passportissuingcountry', 'issuingCountry']),
    },
    university: {
      universityName: getCsvValue(row, ['universityname', 'university']) || 'Unknown University',
      acronym: getCsvValue(row, ['universityacronym', 'acronym']),
      campus: getCsvValue(row, ['campus']),
      city: getCsvValue(row, ['city']),
    },
    program: {
      degreeLevel: getCsvValue(row, ['degreelevel', 'level']),
      major: getCsvValue(row, ['major', 'program']) || 'Undeclared',
      startDate: getCsvValue(row, ['startdate']),
      expectedEndDate: getCsvValue(row, ['expectedenddate', 'enddate']),
    },
    bankAccount: {
      accountHolderName: getCsvValue(row, ['accountholdername']) || fullName,
      accountNumber: getCsvValue(row, ['accountnumber']),
      iban: getCsvValue(row, ['iban']),
      swiftCode: getCsvValue(row, ['swiftcode']),
    },
    bank: {
      bankName: getCsvValue(row, ['bankname']),
      branchName: getCsvValue(row, ['branchname']),
      branchAddress: getCsvValue(row, ['branchaddress']),
      branchCode: getCsvValue(row, ['branchcode']),
    },
    contact: {
      email,
      phone: getCsvValue(row, ['phone', 'phonenumber']),
      emergencyContactName: getCsvValue(row, ['emergencycontactname']),
      emergencyContactPhone: getCsvValue(row, ['emergencycontactphone']),
    },
    address: {
      homeCountryAddress: getCsvValue(row, ['homecountryaddress']),
      currentHostAddress: getCsvValue(row, ['currenthostaddress']),
    },
    status,
  };
}

const AttacheDashboard: React.FC<AttacheDashboardProps> = ({
  students,
  announcements,
  onAddAnnouncement,
  onDeleteStudents,
  onImportStudents,
  section,
  onNavigateSection,
  onLogout,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>('students');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [query, setQuery] = useState<StudentQueryState>(DEFAULT_STUDENT_QUERY);

  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [reviewedStudentIds, setReviewedStudentIds] = useState<Set<string>>(new Set());

  const [reportColumnKeys, setReportColumnKeys] = useState<string[]>(defaultReportColumns);
  const [reportScope, setReportScope] = useState<'FILTERED' | 'SELECTED'>('FILTERED');
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogEntry[]>([]);
  const [exportPopupOpen, setExportPopupOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvDelimiter, setCsvDelimiter] = useState<CsvDelimiterOption>('auto');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [skipExistingEmails, setSkipExistingEmails] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const duplicateGroups = useMemo(() => getDuplicateGroups(students), [students]);
  const duplicateStudentIds = useMemo(
    () => new Set(duplicateGroups.flatMap((group) => group.studentIds)),
    [duplicateGroups],
  );
  const qualityFlagEntries = useMemo(() => getQualityFlags(students), [students]);
  const qualityIssueCount = useMemo(
    () => qualityFlagEntries.filter((entry) => entry.items.length > 0).length,
    [qualityFlagEntries],
  );

  const filteredStudents = useMemo(
    () => applyStudentQuery(students, query, duplicateStudentIds),
    [students, query, duplicateStudentIds],
  );

  const selectedStudent = selectedStudentId
    ? students.find((student) => student.id === selectedStudentId) ?? null
    : null;

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedStudentIds.has(student.id)),
    [students, selectedStudentIds],
  );

  const uniqueUniversities = useMemo(
    () => Array.from(new Set(students.map((student) => student.university.universityName))).sort(),
    [students],
  );
  const uniquePrograms = useMemo(
    () => Array.from(new Set(students.map((student) => student.program.major))).sort(),
    [students],
  );
  const uniqueAcademicYears = useMemo(
    () =>
      Array.from(
        new Set(students.flatMap((student) => (student.academicHistory || []).map((entry) => entry.year))),
      ).sort(),
    [students],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SavedView[];
      setSavedViews(parsed);
    } catch {
      setSavedViews([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
  }, [savedViews]);

  useEffect(() => {
    setSelectedStudentIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (filteredStudents.some((student) => student.id === id)) next.add(id);
      });
      return next;
    });
  }, [filteredStudents]);

  const updateQuery = (patch: Partial<StudentQueryState>) => {
    setQuery((prev) => ({ ...prev, ...patch }));
    setActiveSavedViewId(null);
  };

  const resetAdvancedFilters = () => {
    setQuery((prev) => ({
      ...prev,
      university: 'ALL',
      program: 'ALL',
      academicYear: 'ALL',
      missingData: 'ALL',
      startDateFrom: '',
      startDateTo: '',
      documentStatus: 'ALL',
      duplicatesOnly: false,
    }));
    setActiveSavedViewId(null);
  };

  const saveCurrentView = (name: string) => {
    const view: SavedView = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      query,
      createdAt: new Date().toISOString(),
    };
    setSavedViews((prev) => [view, ...prev]);
    setActiveSavedViewId(view.id);
  };

  const applySavedView = (viewId: string) => {
    const view = savedViews.find((entry) => entry.id === viewId);
    if (!view) return;
    setQuery(view.query);
    setActiveSavedViewId(view.id);
  };

  const deleteSavedView = (viewId: string) => {
    setSavedViews((prev) => prev.filter((entry) => entry.id !== viewId));
    if (activeSavedViewId === viewId) setActiveSavedViewId(null);
  };

  const exportDataset = (
    dataset: StudentProfile[],
    columns: string[],
    filename: string,
    format: 'CSV' | 'TSV' | 'JSON' = 'CSV',
  ) => {
    if (dataset.length === 0 || columns.length === 0) return;

    if (format === 'JSON') {
      const json = buildStudentJson(dataset, columns, REPORT_COLUMNS);
      downloadFile(filename, 'application/json', json);
      return;
    }

    const delimiter = format === 'TSV' ? '\t' : ',';
    const content =
      format === 'CSV'
        ? buildStudentCsv(dataset, columns, REPORT_COLUMNS)
        : buildStudentDelimited(dataset, columns, REPORT_COLUMNS, delimiter);
    const mimeType = format === 'TSV' ? 'text/tab-separated-values' : 'text/csv';
    downloadFile(filename, mimeType, content);
  };

  const handleQuickExport = (format: 'CSV' | 'TSV' | 'JSON') => {
    const extension = format.toLowerCase();
    const dataset = reportScope === 'SELECTED' ? selectedStudents : filteredStudents;
    const scopeLabel = reportScope.toLowerCase();
    exportDataset(dataset, reportColumnKeys, `student_records_${scopeLabel}.${extension}`, format);
    setExportPopupOpen(false);
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(new Set(filteredStudents.map((student) => student.id)));
      return;
    }
    setSelectedStudentIds(new Set());
  };

  const handleToggleSelectOne = (studentId: string, checked: boolean) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  };

  const handleMarkReviewed = () => {
    setReviewedStudentIds((prev) => {
      const next = new Set(prev);
      selectedStudentIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const appendCommunicationLog = (
    channel: 'EMAIL' | 'SMS',
    template: string,
    recipientCount: number,
  ) => {
    if (recipientCount === 0) return;
    const entry: CommunicationLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      sentAt: new Date().toLocaleString(),
      recipientCount,
      channel,
      template,
    };
    setCommunicationLogs((prev) => [entry, ...prev]);
  };

  const handleRequestMissingDocsBulk = () => {
    appendCommunicationLog('EMAIL', 'MISSING_DOCS', selectedStudents.length);
  };

  const handleExportSelected = () => {
    exportDataset(selectedStudents, defaultReportColumns, 'student_records_selected.csv');
  };

  const handleDeleteSelected = () => {
    if (selectedStudentIds.size === 0) return;
    const shouldDelete = window.confirm(
      `Delete ${selectedStudentIds.size} selected record${selectedStudentIds.size === 1 ? '' : 's'}? This cannot be undone.`,
    );
    if (!shouldDelete) return;

    const idsToDelete = Array.from(selectedStudentIds);
    onDeleteStudents(idsToDelete);
    setSelectedStudentIds(new Set());
    setReviewedStudentIds((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.delete(id));
      return next;
    });
    if (selectedStudentId && idsToDelete.includes(selectedStudentId)) {
      setSelectedStudentId(null);
    }
  };

  const handleSendCommunication = ({
    channel,
    template,
    scope,
  }: {
    channel: 'EMAIL' | 'SMS';
    template: string;
    scope: 'SELECTED' | 'FILTERED';
    customMessage: string;
  }) => {
    const recipients = scope === 'SELECTED' ? selectedStudents.length : filteredStudents.length;
    appendCommunicationLog(channel, template, recipients);
  };

  const handleToggleReportColumn = (columnKey: string, checked: boolean) => {
    setReportColumnKeys((prev) => {
      if (checked) return prev.includes(columnKey) ? prev : [...prev, columnKey];
      return prev.filter((entry) => entry !== columnKey);
    });
  };

  const exportCount = reportScope === 'SELECTED' ? selectedStudents.length : filteredStudents.length;

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const announcement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
      author: 'Attache Officer',
    };

    onAddAnnouncement(announcement);
    setNewTitle('');
    setNewContent('');
    setActiveView('announcements');
  };

  const handleDownloadTemplate = () => {
    downloadFile('student_import_template.csv', 'text/csv', CSV_TEMPLATE);
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      setImportStatus({ type: 'error', message: 'Select a CSV file first.' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);
    try {
      const source = await csvFile.text();
      const rows = parseCsvRows(source, csvDelimiter);

      if (rows.length === 0) {
        setImportStatus({ type: 'error', message: 'No data rows found in the CSV file.' });
        return;
      }

      const parsed = rows
        .map((row, index) => toStudentProfile(row, index))
        .filter((entry): entry is StudentProfile => Boolean(entry));

      if (parsed.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'No valid student rows found. Required columns: fullName and email.',
        });
        return;
      }

      const existingEmailSet = new Set(students.map((student) => student.contact.email.toLowerCase()));
      const seenImportedEmails = new Set<string>();
      let skippedDuplicates = 0;

      const finalRecords = parsed.filter((student) => {
        const email = student.contact.email.toLowerCase();
        if (seenImportedEmails.has(email)) {
          skippedDuplicates += 1;
          return false;
        }

        if (skipExistingEmails && importMode === 'append' && existingEmailSet.has(email)) {
          skippedDuplicates += 1;
          return false;
        }

        seenImportedEmails.add(email);
        return true;
      });

      if (finalRecords.length === 0) {
        setImportStatus({
          type: 'error',
          message: 'All rows were skipped (duplicate emails).',
        });
        return;
      }

      onImportStudents(finalRecords, importMode);
      const invalidRows = rows.length - parsed.length;
      setImportStatus({
        type: 'success',
        message: `Imported ${finalRecords.length} records. Skipped ${invalidRows} invalid row(s) and ${skippedDuplicates} duplicate row(s).`,
      });
      setCsvFile(null);
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Unable to read this file. Please upload a valid UTF-8 CSV.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Layout
      role={UserRole.ATTACHE}
      title={section === 'dashboard' ? 'Attache Management Console' : 'Settings'}
      onLogout={onLogout}
      activeTab={section === 'dashboard' ? 'home' : 'settings'}
      setActiveTab={(tab: string) =>
        onNavigateSection(tab === 'settings' ? 'settings' : 'dashboard')
      }
      showSettingsMenu
    >
      {section === 'dashboard' ? (
        <>
      <Tabs items={tabItems} activeTab={activeView} onChange={(tab) => setActiveView(tab as ActiveView)} className="mb-8" />

      {activeView === 'students' ? (
        selectedStudent ? (
          <StudentDetailView student={selectedStudent} onBack={() => setSelectedStudentId(null)} />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
              <div className="space-y-6">
                <StudentQueryToolbar
                  query={query}
                  onQueryChange={updateQuery}
                  onOpenExportOptions={() => setExportPopupOpen(true)}
                  showAdvancedToggle={false}
                />

                <BulkActionsBar
                  selectedCount={selectedStudentIds.size}
                  onMarkReviewed={handleMarkReviewed}
                  onRequestMissingDocs={handleRequestMissingDocsBulk}
                  onExportSelected={handleExportSelected}
                  onClearSelection={() => setSelectedStudentIds(new Set())}
                  onDeleteSelected={handleDeleteSelected}
                />

                <StudentRecordsTable
                  students={filteredStudents}
                  selectedStudentIds={selectedStudentIds}
                  reviewedStudentIds={reviewedStudentIds}
                  onToggleSelectAll={handleToggleSelectAll}
                  onToggleSelectOne={handleToggleSelectOne}
                  onManage={setSelectedStudentId}
                />

                <div className="hidden md:block">
                  <CommunicationCenter
                    selectedCount={selectedStudents.length}
                    filteredCount={filteredStudents.length}
                    onSend={handleSendCommunication}
                    logs={communicationLogs}
                  />
                </div>

              </div>

              <aside className="hidden md:block xl:sticky xl:top-24 space-y-4">
                <SavedViewsBar
                  views={savedViews}
                  activeViewId={activeSavedViewId}
                  onApply={applySavedView}
                  onDelete={deleteSavedView}
                  onSaveCurrent={saveCurrentView}
                  compact
                />
                <StudentAdvancedFilters
                  query={query}
                  universities={uniqueUniversities}
                  programs={uniquePrograms}
                  academicYears={uniqueAcademicYears}
                  onQueryChange={updateQuery}
                  onReset={resetAdvancedFilters}
                  compact
                />
                <DataInsightsPanel
                  totalCount={students.length}
                  filteredStudents={filteredStudents}
                  searchQuery={query.searchQuery}
                  duplicateGroups={duplicateGroups}
                  qualityIssueCount={qualityIssueCount}
                />
              </aside>
            </div>
          </div>
        )
      ) : null}

      {exportPopupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setExportPopupOpen(false)} />
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Export Records</h3>
            <p className="mt-1 text-sm text-slate-500">Select scope, columns, and format.</p>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReportScope('FILTERED')}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${reportScope === 'FILTERED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Filtered
                </button>
                <button
                  type="button"
                  onClick={() => setReportScope('SELECTED')}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${reportScope === 'SELECTED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Selected
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-3">
                {REPORT_COLUMNS.map((column) => (
                  <Checkbox
                    key={column.key}
                    checked={reportColumnKeys.includes(column.key)}
                    onChange={(e) => handleToggleReportColumn(column.key, e.target.checked)}
                    label={column.label}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500">
                {reportColumnKeys.length} columns • {exportCount} rows
              </p>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  variant="success"
                  onClick={() => handleQuickExport('CSV')}
                  disabled={reportColumnKeys.length === 0 || exportCount === 0}
                >
                  CSV (.csv)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleQuickExport('TSV')}
                  disabled={reportColumnKeys.length === 0 || exportCount === 0}
                >
                  TSV (.tsv)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleQuickExport('JSON')}
                  disabled={reportColumnKeys.length === 0 || exportCount === 0}
                >
                  JSON (.json)
                </Button>
              </div>
            </div>

            <Button className="mt-4 w-full" variant="ghost" onClick={() => setExportPopupOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {activeView === 'announcements' ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <AnnouncementComposerCard
              announcementTitle={newTitle}
              announcementContent={newContent}
              onAnnouncementTitleChange={setNewTitle}
              onAnnouncementContentChange={setNewContent}
              onSubmit={handlePostAnnouncement}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <AnnouncementFeedSection
              announcements={announcements}
              title="Past Announcements"
              compact
              actions={() => (
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                  Delete
                </Button>
              )}
            />
          </div>
        </div>
      ) : null}
        </>
      ) : (
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Database Import</h3>
                <p className="text-sm text-slate-500">Upload students to your records using CSV.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                  Import File
                </label>
                <div className="rounded-2xl border border-dashed border-slate-300 p-5 bg-slate-50/70">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    />
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <Upload className="w-4 h-4" />
                      Choose CSV
                    </span>
                  </label>
                  <p className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    {csvFile ? csvFile.name : 'No file selected'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                  CSV Options
                </label>
                <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Delimiter</label>
                    <select
                      value={csvDelimiter}
                      onChange={(e) => setCsvDelimiter(e.target.value as CsvDelimiterOption)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <option value="auto">Auto detect</option>
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value={'\t'}>Tab (\t)</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Import Mode</label>
                    <select
                      value={importMode}
                      onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <option value="append">Append to existing records</option>
                      <option value="replace">Replace all existing records</option>
                    </select>
                  </div>

                  <Checkbox
                    checked={skipExistingEmails}
                    onChange={(e) => setSkipExistingEmails(e.target.checked)}
                    label="Skip existing emails when appending"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Supported CSV Columns</p>
              <p className="mt-2 text-sm text-slate-600">
                Required: <span className="font-semibold">fullName</span>, <span className="font-semibold">email</span>.
                Recommended: inscriptionNumber, universityName, major, degreeLevel, status, phone, nationality, gender.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4" />
                Download CSV template
              </Button>
              <Button onClick={handleCsvImport} disabled={isImporting}>
                <Upload className="w-4 h-4" />
                {isImporting ? 'Importing...' : 'Import CSV'}
              </Button>
            </div>

            {importStatus ? (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
                  importStatus.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                )}
                <span>{importStatus.message}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AttacheDashboard;
