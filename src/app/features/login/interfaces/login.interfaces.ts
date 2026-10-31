export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordCredentials {
  username: string;
  currentPassword: string;
  newPassword: string;
}