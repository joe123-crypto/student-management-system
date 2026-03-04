import { useCallback, useState } from 'react';
import type { StudentQueryState } from '@/components/features/attache/types';

interface UseStudentFiltersResult {
    query: StudentQueryState;
    updateQuery: (patch: Partial<StudentQueryState>) => void;
    resetAdvancedFilters: () => void;
}

export default function useStudentFilters(defaultQuery: StudentQueryState): UseStudentFiltersResult {
    const [query, setQuery] = useState<StudentQueryState>(defaultQuery);

    const updateQuery = useCallback((patch: Partial<StudentQueryState>) => {
        setQuery((prev) => ({ ...prev, ...patch }));
    }, []);

    const resetAdvancedFilters = useCallback(() => {
        setQuery((prev) => ({
            ...prev,
            university: defaultQuery.university,
            program: defaultQuery.program,
            academicYear: defaultQuery.academicYear,
            missingData: defaultQuery.missingData,
            startDateFrom: defaultQuery.startDateFrom,
            startDateTo: defaultQuery.startDateTo,
            documentStatus: defaultQuery.documentStatus,
            duplicatesOnly: defaultQuery.duplicatesOnly,
        }));
    }, [
        defaultQuery.academicYear,
        defaultQuery.documentStatus,
        defaultQuery.duplicatesOnly,
        defaultQuery.missingData,
        defaultQuery.program,
        defaultQuery.startDateFrom,
        defaultQuery.startDateTo,
        defaultQuery.university,
    ]);

    return {
        query,
        updateQuery,
        resetAdvancedFilters,
    };
}
