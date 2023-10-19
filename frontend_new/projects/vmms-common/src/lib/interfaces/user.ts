export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  group: string;
  groups: []
  host: string;

  user_permissions: []
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;

  date_joined: Date;
  last_login: Date;
}
