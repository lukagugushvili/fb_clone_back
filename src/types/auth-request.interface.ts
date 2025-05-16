import { UserRoles } from 'src/enum/user-roles';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: UserRoles;
  };
}
