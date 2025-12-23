import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CheckRole } from '../auth/decorators/check-role.decorator';

@Controller('admin/users')
@CheckRole('admin')
export class UsersAdminController {
  constructor(private usersService: UsersService) {}

  // Tüm kullanıcıları getir
  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // Kullanıcının rolünü güncelle
  @Patch(':id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: 'admin' | 'user',
  ) {
    return this.usersService.updateRole(id, role);
  }
}
