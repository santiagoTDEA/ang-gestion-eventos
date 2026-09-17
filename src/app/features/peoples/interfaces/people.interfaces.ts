export interface CreatePersonDto {
  cedula: string;
  email: string;
  phone: string;
  address: string;
  facultyId: number;
  roleId: string;
  statusId: number;
}

export interface UpdatePersonDto {
  cedula?: string;
  email?: string;
  phone?: string;
  address?: string;
  facultyId?: number;
  statusId?: number;
  roleId?: string;
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


export interface PersonSummary {
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

export interface NestedUser {
  id: string;
  username: string;
  password: string;
  status: Status;
  person: PersonSummary;
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
  user: NestedUser;
}
