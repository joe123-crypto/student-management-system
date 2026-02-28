import React, { useState } from 'react';
import type { StudentProfile } from '@/types';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { AlertCircle, CheckCircle2, Database, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { downloadFile } from '@/components/features/attache/utils/studentData';
import { CsvDelimiterOption, parseCsvRows, toStudentProfile } from '@/components/features/attache/utils/csvImport';

interface DatabaseImportSectionProps {
  students: StudentProfile[];
  onImportStudents: (records: StudentProfile[], mode: 'append' | 'replace') => void;
}

export default function DatabaseImportSection({
  students,
  onImportStudents,
}: DatabaseImportSectionProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvDelimiter, setCsvDelimiter] = useState<CsvDelimiterOption>('auto');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [skipExistingEmails, setSkipExistingEmails] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const CSV_TEMPLATE =
    'fullName,email,inscriptionNumber,universityName,major,degreeLevel,status,phone,nationality,gender\n' +
    'John Doe,john.doe@example.com,INS-2026-001,Example University,Computer Science,Masters,ACTIVE,+1 555 0100,American,M';

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
  );
}
