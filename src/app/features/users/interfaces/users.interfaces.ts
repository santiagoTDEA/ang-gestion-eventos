export interface CreateUserDto {
    username: string;
    password: string;
    personId: number;
    statusId: number;
}
export interface Status {
    idStatus: number;
    statusName: string;
}

export interface Faculty {
    id: number;
    name: string;
    department: string;
    email: string;
    phone: string;
    status: Status;
}

export interface Role {
    id?: number;
    name?: string;

}

export interface Person {
    id: number;
    cedula: string;
    email: string;
    phone: string;
    address: string;
    status: Status;
    faculty: Faculty;
    role: Role;
    user: string;
}

export interface UserResponse {
    id: string;
    username: string;
    password: string;
    status: Status;
    person: Person;
}