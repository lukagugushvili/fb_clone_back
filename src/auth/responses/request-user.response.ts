import { UserRoles } from 'src/enum/user-roles';

export class RequestUserResponse {
  userId: string;
  email: string;
  roles: UserRoles;
}
