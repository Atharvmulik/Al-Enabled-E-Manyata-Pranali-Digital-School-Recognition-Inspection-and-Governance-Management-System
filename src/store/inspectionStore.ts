import { create } from 'zustand';
import { Inspection, InspectionStatus, PriorityLevel, Document, Evidence, FinalReport } from '@/types';
import { dummyInspections } from '@/services/dummyData';

interface InspectionStore {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: InspectionStatus;
    priority?: PriorityLevel;
    searchQuery?: string;
  };

  // Actions
  fetchInspections: () => Promise<void>;
  setCurrentInspection: (inspection: Inspection | null) => void;
  getInspectionById: (id: string) => Inspection | undefined;
  updateInspectionStatus: (id: string, status: InspectionStatus) => void;
  updateDocumentStatus: (inspectionId: string, documentId: string, status: Document['status'], remarks?: string) => void;
  addEvidence: (inspectionId: string, evidence: Omit<Evidence, 'id' | 'inspectionId'>) => void;
  removeEvidence: (inspectionId: string, evidenceId: string) => void;
  submitFinalReport: (inspectionId: string, report: Omit<FinalReport, 'id' | 'inspectionId'>) => void;
  setFilters: (filters: Partial<InspectionStore['filters']>) => void;
  getFilteredInspections: () => Inspection[];
  getStatistics: () => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    highPriority: number;
  };
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: dummyInspections,
  currentInspection: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchInspections: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ isLoading: false, inspections: dummyInspections });
  },

  setCurrentInspection: (inspection) => {
    set({ currentInspection: inspection });
  },

  getInspectionById: (id) => {
    return get().inspections.find(i => i.id === id);
  },

  updateInspectionStatus: (id, status) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === id
          ? { ...inspection, status, updatedAt: new Date().toISOString() }
          : inspection
      ),
    }));
  },

  updateDocumentStatus: (inspectionId, documentId, status, remarks) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
            ...inspection,
            documents: inspection.documents.map(doc =>
              doc.id === documentId
                ? { ...doc, status, remarks, verifiedAt: new Date().toISOString() }
                : doc
            ),
            updatedAt: new Date().toISOString(),
          }
          : inspection
      ),
    }));
  },


  addEvidence: (inspectionId, evidence) => {
    const newEvidence: Evidence = {
      ...evidence,
      id: `evidence-${Date.now()}`,
      inspectionId,
    };

    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
            ...inspection,
            evidence: [...inspection.evidence, newEvidence],
            updatedAt: new Date().toISOString(),
          }
          : inspection
      ),
    }));
  },

  removeEvidence: (inspectionId, evidenceId) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
            ...inspection,
            evidence: inspection.evidence.filter(e => e.id !== evidenceId),
            updatedAt: new Date().toISOString(),
          }
          : inspection
      ),
    }));
  },

  submitFinalReport: (inspectionId, report) => {
    const newReport: FinalReport = {
      ...report,
      id: `report-${Date.now()}`,
      inspectionId,
    };

    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
            ...inspection,
            finalReport: newReport,
            status: report.recommendation === 'approve' ? 'approved' :
              report.recommendation === 'reject' ? 'rejected' : 're_inspection_required',
            updatedAt: new Date().toISOString(),
          }
          : inspection
      ),
    }));
  },


  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  getFilteredInspections: () => {
    const { inspections, filters } = get();

    return inspections.filter(inspection => {
      if (filters.status && inspection.status !== filters.status) return false;
      if (filters.priority && inspection.priority !== filters.priority) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSchool = inspection.school.name.toLowerCase().includes(query);
        const matchesId = inspection.id.toLowerCase().includes(query);
        const matchesCity = inspection.school.city.toLowerCase().includes(query);
        if (!matchesSchool && !matchesId && !matchesCity) return false;
      }
      return true;
    });
  },

  getStatistics: () => {
    const { inspections } = get();

    return {
      total: inspections.length,
      pending: inspections.filter(i => i.status === 'pending' || i.status === 'assigned').length,
      inProgress: inspections.filter(i => i.status === 'document_verification' || i.status === 'in_progress').length,
      completed: inspections.filter(i => i.status === 'completed' || i.status === 'approved' || i.status === 'rejected').length,
      overdue: inspections.filter(i => i.isOverdue).length,
      highPriority: inspections.filter(i => i.priority === 'high' || i.priority === 'urgent').length,
    };
  },
}));
