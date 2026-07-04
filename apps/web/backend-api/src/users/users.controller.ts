import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('me')
  getCurrentUser() {
    return {
      id: 'local-dev-user',
      email: 'dev@fluxsql.local',
      name: 'FluxSQL Dev',
    };
  }
}

