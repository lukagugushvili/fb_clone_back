import { UserRoles } from 'src/enum/user-roles';

export interface IPayload {
  userId: string;
  email: string;
  roles: UserRoles | undefined;
}
