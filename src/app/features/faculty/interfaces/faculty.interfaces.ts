export interface Faculty {
    name: string;
    department: string;
    email: string;
    phone: string;
    statusId: number;
}


export interface ReturnFaculty {
    id: number;
    name: string;
    department: string;
    email: string;
    phone: string;
    status: {
        idStatus: number;
        statusName: string;
    };
}