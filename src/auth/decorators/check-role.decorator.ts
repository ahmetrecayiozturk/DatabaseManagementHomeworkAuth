import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = '';
export const CheckRole = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
