import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from 'src/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
	imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [AuthService, UsersService]
})
export class UsersModule {}
