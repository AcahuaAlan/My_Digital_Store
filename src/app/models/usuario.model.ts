export interface Usuario {
  username: string;
  nombre?: string;
  email?: string;
  address: string;
  neighborhood: string;
  city: string;
  password: string;
  confirmPassword?: string;
  securityQuestion: string;
  securityAnswer: string;
}