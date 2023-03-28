import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from 'src/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import passport, { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';


@Module({
	imports: [TypeOrmModule.forFeature([User]), PassportModule],
  controllers: [UsersController],
  providers: [AuthService, UsersService, LocalStrategy]
})
export class UsersModule {}
