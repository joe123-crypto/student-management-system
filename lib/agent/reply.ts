import type {
  Announcement,
  AttacheAgentContext,
  PermissionRequest,
  StudentProfile,
} from '@/types';

type AgentScopeSummary = {
  filteredStudents: StudentProfile[];
  selectedStudents: StudentProfile[];
  activeCount: number;
  pendingCount: number;
  completedCount: number;
  duplicateCount: number;
  missingProfileCount: number;
  missingBankCount: number;
  missingHistoryCount: number;
  missingContactCount: number;
};

function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase();
}

function countDuplicates(students: StudentProfile[]): number {
  const byEmail = new Map<string, number>();
  const byInscription = new Map<string, number>();

  for (const student of students) {
    const email = student.contact.email.trim().toLowerCase();
    const inscription = student.student.inscriptionNumber.trim().toLowerCase();

    if (email) {
      byEmail.set(email, (byEmail.get(email) || 0) + 1);
    }
    if (inscription) {
      byInscription.set(inscription, (byInscription.get(inscription) || 0) + 1);
    }
  }

  const duplicateStudentIds = new Set<string>();

  for (const student of students) {
    const email = student.contact.email.trim().toLowerCase();
    const inscription = student.student.inscriptionNumber.trim().toLowerCase();

    if ((email && (byEmail.get(email) || 0) > 1) || (inscription && (byInscription.get(inscription) || 0) > 1)) {
      duplicateStudentIds.add(student.id);
    }
  }

  return duplicateStudentIds.size;
}

function getScopedStudents(students: StudentProfile[], context?: AttacheAgentContext) {
  if (!context || context.filteredStudentIds.length === 0) {
    return {
      filteredStudents: students,
      selectedStudents: [] as StudentProfile[],
    };
  }

  const filteredIds = new Set(context.filteredStudentIds);
  const selectedIds = new Set(context.selectedStudentIds);
  const filteredStudents = students.filter((student) => filteredIds.has(student.id));
  const selectedStudents = filteredStudents.filter((student) => selectedIds.has(student.id));

  return {
    filteredStudents,
    selectedStudents,
  };
}

function summarizeScope(students: StudentProfile[], context?: AttacheAgentContext): AgentScopeSummary {
  const { filteredStudents, selectedStudents } = getScopedStudents(students, context);

  return {
    filteredStudents,
    selectedStudents,
    activeCount: filteredStudents.filter((student) => student.status === 'ACTIVE').length,
    pendingCount: filteredStudents.filter((student) => student.status === 'PENDING').length,
    completedCount: filteredStudents.filter((student) => student.status === 'COMPLETED').length,
    duplicateCount: countDuplicates(filteredStudents),
    missingProfileCount: filteredStudents.filter((student) => !student.student.profilePicture).length,
    missingBankCount: filteredStudents.filter((student) => !student.bankAccount.iban || !student.bank.branchCode).length,
    missingHistoryCount: filteredStudents.filter((student) => !student.academicHistory?.length).length,
    missingContactCount: filteredStudents.filter((student) => !student.contact.phone).length,
  };
}

function buildScopeLabel(summary: AgentScopeSummary, context?: AttacheAgentContext): string {
  if (summary.selectedStudents.length > 0) {
    return `${summary.selectedStudents.length} selected student(s) inside ${summary.filteredStudents.length} filtered record(s)`;
  }

  if (context?.searchQuery.trim()) {
    return `${summary.filteredStudents.length} filtered record(s) for "${context.searchQuery.trim()}"`;
  }

  return `${summary.filteredStudents.length} student record(s)`;
}

function buildScopeDetails(context?: AttacheAgentContext): string[] {
  if (!context) {
    return [];
  }

  const details: string[] = [];
  if (context.statusFilter && context.statusFilter !== 'ALL') {
    details.push(`Status filter: ${context.statusFilter}`);
  }
  if (context.university && context.university !== 'ALL') {
    details.push(`University filter: ${context.university}`);
  }
  if (context.program && context.program !== 'ALL') {
    details.push(`Program filter: ${context.program}`);
  }
  if (context.duplicatesOnly) {
    details.push('Duplicate-only mode is active');
  }
  return details;
}

function buildTopPriority(summary: AgentScopeSummary): string {
  const actions = [
    {
      label: 'draft a missing-documents reminder',
      count: summary.missingHistoryCount,
    },
    {
      label: 'review missing bank information',
      count: summary.missingBankCount,
    },
    {
      label: 'resolve duplicate student records',
      count: summary.duplicateCount,
    },
    {
      label: 'follow up on missing contact details',
      count: summary.missingContactCount,
    },
  ].sort((left, right) => right.count - left.count);

  const top = actions[0];
  if (!top || top.count === 0) {
    return 'No urgent data-quality issue stands out in the current scope. I would move to pending-record review or outbound follow-up.';
  }

  return `The next best action is to ${top.label} for ${top.count} record(s) in the current scope.`;
}

function buildRecentUpdatesReply(params: {
  announcements: Announcement[];
  permissionRequests: PermissionRequest[];
  summary: AgentScopeSummary;
  context?: AttacheAgentContext;
}): string {
  const recentAnnouncements = params.announcements.slice(0, 3);
  const pendingRequests = params.permissionRequests.filter((request) => request.status === 'PENDING').length;
  const lines = [
    `Current scope: ${buildScopeLabel(params.summary, params.context)}.`,
    '',
    `- ${pendingRequests} permission request(s) are still pending review.`,
    `- ${params.summary.pendingCount} student record(s) are still pending.`,
    `- ${params.summary.duplicateCount} record(s) are flagged by duplicate email or inscription number.`,
  ];

  if (recentAnnouncements.length > 0) {
    lines.push('');
    lines.push('Recent announcements:');
    recentAnnouncements.forEach((announcement) => {
      lines.push(`- ${announcement.title} (${announcement.date})`);
    });
  }

  return lines.join('\n');
}

function buildSummaryReply(summary: AgentScopeSummary, context?: AttacheAgentContext): string {
  const scopeDetails = buildScopeDetails(context);
  const universities = Array.from(
    new Set(summary.filteredStudents.map((student) => student.university.universityName).filter(Boolean)),
  ).slice(0, 3);

  const lines = [
    `Here is the current scope summary for ${buildScopeLabel(summary, context)}.`,
    '',
    `- ${summary.activeCount} active`,
    `- ${summary.pendingCount} pending`,
    `- ${summary.completedCount} completed`,
    `- ${summary.missingProfileCount} missing profile picture`,
    `- ${summary.missingBankCount} missing bank details`,
    `- ${summary.missingHistoryCount} missing academic history`,
    `- ${summary.duplicateCount} duplicate-flagged record(s)`,
  ];

  if (scopeDetails.length > 0) {
    lines.push('');
    scopeDetails.forEach((detail) => lines.push(`- ${detail}`));
  }

  if (universities.length > 0) {
    lines.push('');
    lines.push(`Top universities in view: ${universities.join(', ')}.`);
  }

  return lines.join('\n');
}

function buildDraftReply(summary: AgentScopeSummary, context?: AttacheAgentContext): string {
  const targetCount = summary.selectedStudents.length || summary.filteredStudents.length;
  const focus =
    summary.missingHistoryCount >= summary.missingBankCount
      ? 'academic history and supporting documents'
      : 'banking information';

  return [
    `Here is a draft you can adapt for ${targetCount} student(s) in the current scope:`,
    '',
    'Subject: Follow-up on your student record',
    '',
    'Hello,',
    '',
    `We are reviewing your record and noticed that we still need updated ${focus} to complete processing on our side.`,
    '',
    'Please sign in to your portal profile and submit the missing information as soon as possible. If you believe you already provided it, reply with the date of submission so we can verify it quickly.',
    '',
    'Regards,',
    'Attache Office',
    '',
    context?.searchQuery.trim()
      ? `Context note: this draft was prepared from the filtered scope for "${context.searchQuery.trim()}".`
      : 'Context note: this draft was prepared from the current attache dashboard scope.',
  ].join('\n');
}

function buildCapabilitiesReply(summary: AgentScopeSummary, context?: AttacheAgentContext): string {
  return [
    'I can help with three things right now:',
    '- summarize the current student scope',
    '- recommend the next best follow-up action',
    '- draft an outreach message for the current scope',
    '',
    `At the moment I am looking at ${buildScopeLabel(summary, context)}.`,
  ].join('\n');
}

export function buildAttacheAgentReply(params: {
  prompt: string;
  students: StudentProfile[];
  announcements: Announcement[];
  permissionRequests: PermissionRequest[];
  context?: AttacheAgentContext;
}): { content: string; metadata: Record<string, unknown> } {
  const normalizedPrompt = normalizePrompt(params.prompt);
  const summary = summarizeScope(params.students, params.context);

  let content: string;
  let intent = 'capabilities';

  if (/draft|write|compose|reply|message/.test(normalizedPrompt)) {
    intent = 'draft';
    content = buildDraftReply(summary, params.context);
  } else if (/recent update|recent updates|announcement|what changed/.test(normalizedPrompt)) {
    intent = 'recent_updates';
    content = buildRecentUpdatesReply({
      announcements: params.announcements,
      permissionRequests: params.permissionRequests,
      summary,
      context: params.context,
    });
  } else if (/next best action|what should i do next|priority|priorit/i.test(normalizedPrompt)) {
    intent = 'next_best_action';
    content = [
      buildSummaryReply(summary, params.context),
      '',
      buildTopPriority(summary),
    ].join('\n');
  } else if (/summarize|summary|overview|scope/.test(normalizedPrompt)) {
    intent = 'summary';
    content = buildSummaryReply(summary, params.context);
  } else {
    content = buildCapabilitiesReply(summary, params.context);
  }

  return {
    content,
    metadata: {
      intent,
      filteredCount: summary.filteredStudents.length,
      selectedCount: summary.selectedStudents.length,
      missingProfileCount: summary.missingProfileCount,
      missingBankCount: summary.missingBankCount,
      missingHistoryCount: summary.missingHistoryCount,
      duplicateCount: summary.duplicateCount,
    },
  };
}
