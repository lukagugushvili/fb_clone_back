import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/enum/user-roles';

export const Roles_Key = process.env.ROLES_KEY;
export const Roles = (...roles: UserRoles[]) => SetMetadata(Roles_Key, roles);
