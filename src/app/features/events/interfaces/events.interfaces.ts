export interface EventApproval {
    personId: number;
    roleId: string;
    date: string;
    signature: string;
}

export interface Event {
    eventType: string;
    otherEventType?: string;
    name: string;
    facultyId: number;
    academicProgram: string;
    teacherProfile: string;
    duration: number;
    startTime: string;
    endTime: string;
    selectedDays: string[];
    modality: string;
    startDate: string;
    endDate: string;
    minimumCapacity: number;
    maximumCapacity: number;
    participantProfile: string;
    presentation: string;
    scope: string;
    generalObjective: string;
    objectives: string[];
    competencies: string;
    modules: string[];
    logistics: Record<string, string>;
    costPerParticipant: number;
    confirmedMinimumCapacity: number;
    financialObservations: string;
    approvals: EventApproval[];
}

export interface ReturnEvent extends Omit<Event, 'facultyId' | 'approvals'> {
    id: number;
    faculty: {
        id: number;
        name: string;
    };
    approvals: {
        id: number;
        date: string;
        signature: string;
        person: { id: number; email: string };
        role: { id: string; name: string };
    }[];
    createdAt: string;
}
