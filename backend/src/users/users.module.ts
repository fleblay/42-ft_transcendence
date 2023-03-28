import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from 'src/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import passport, { Passport } from 'passport';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';


@Module({
	imports: [TypeOrmModule.forFeature([User]), PassportModule.register({session: true})], // PassportModule.register({session: true}) is used to enable session support
  controllers: [UsersController],
  providers: [AuthService, UsersService, LocalStrategy, SessionSerializer]
})
export class UsersModule {}
