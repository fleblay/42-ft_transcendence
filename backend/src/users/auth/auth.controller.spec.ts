import { Test } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { RTGuard } from '../guard/refresh-token.guard';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../model/user.entity';
import { ExecutionContext } from '@nestjs/common';
import { ATGuard } from '../guard/access-token.guard';
import { RefreshToken } from '../../model/refresh-token.entity';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from './auth.module';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestHelper } from './test-helper';


describe('Guard', () => {

  let rtGuard: RTGuard;
  let atGuard: ATGuard;
  let fakeUsersService: Partial<UsersService>
  let user: User;
  let refreshToken: RefreshToken;
  let fakeRepo: Partial<Repository<RefreshToken>>;

  user = {
    id: 1,
    username: 'test',
    password: 'test',
    email: 'test@test.fr',
    savedGames: [],
    wonGames: [],
  };

  refreshToken = {
    id: 1,
    refreshToken: 'test',
    userId: 1,
  };


  
  beforeAll(async () => {
    await TestHelper.instance.setupTestDB();
  });
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ATGuard, RTGuard, { provide: UsersService, useValue: fakeUsersService }, JwtService, AuthService],
      imports: [AuthModule, TypeOrmModule.forRoot(
        {
          name : 'default',
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [User, RefreshToken],
          synchronize: true,
        }
      )],
    }).compile();

    fakeUsersService = {
      findOne: (id: number) => Promise.resolve(user),
    };

    atGuard = module.get<ATGuard>(ATGuard);
    rtGuard = module.get<RTGuard>(RTGuard);
  })

  afterAll(async () => {
    await TestHelper.instance.tearDownTestDB();
  });

  it('RT should be defined', () => {
    expect(rtGuard).toBeDefined();
  });

  it(' AT should be defined', () => {
    expect(atGuard).toBeDefined();
  });

  it('should return true if the access token is valid', () => {
    const jwtService = new JwtService();
    const access_token_payload = { username: user.username, sub: user.id };
    const access_token_options = { expiresIn: '10s', secret: 'access' };
    const validAccessToken = jwtService.sign(access_token_payload, access_token_options);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${validAccessToken}`,
          },
        }),
        getResponse: () => ({}),
      }),
    };

    const result = atGuard.canActivate(context as ExecutionContext);
    expect(result).toBe(true);
  });

  it('should return false if the access token is invalid with wrong username', () => {
    const jwtService = new JwtService();
    const access_token_payload = { username: "toto", sub: user.id };
    const access_token_options = { expiresIn: '10s', secret: 'access' };
    const validAccessToken = jwtService.sign(access_token_payload, access_token_options);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${validAccessToken}`,
          },
        }),
        getResponse: () => ({}),
      }),
    };

    const result = atGuard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if the access token is invalid with wrong id', () => {
    const jwtService = new JwtService();
    const access_token_payload = { username: user.username, sub: 2 };
    const access_token_options = { expiresIn: '10s', secret: 'access' };
    const validAccessToken = jwtService.sign(access_token_payload, access_token_options);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${validAccessToken}`,
          },
        }),
        getResponse: () => ({}),
      }),
    };

    const result = atGuard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if the access token is invalid with wrong secret', () => {
    const jwtService = new JwtService();
    const access_token_payload = { username: user.username, sub: user.id };
    const access_token_options = { expiresIn: '10s', secret: 'refresh' };
    const validAccessToken = jwtService.sign(access_token_payload, access_token_options);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${validAccessToken}`,
          },
        }),
        getResponse: () => ({}),
      }),
    };

    const result = atGuard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });

  it('should return false if access token as invalide expiration', () => {
    const jwtService = new JwtService();
    const access_token_payload = { username: user.username, sub: user.id };
    const access_token_options = { expiresIn: '1s', secret: 'refresh' };
    const validAccessToken = jwtService.sign(access_token_payload, access_token_options);
    jest.advanceTimersByTime(2000);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: `Bearer ${validAccessToken}`,
          },
        }),
        getResponse: () => ({}),
      }),
    };

    const result = atGuard.canActivate(context as ExecutionContext);
    expect(result).toBe(false);
  });




});







/* describe('AuthController', () => {
  let controller: AuthController;
  let fakeUsersService: Partial<UsersService>
  let fakeAuthService: Partial<AuthService>

  beforeEach(async () => {
    //create valide token in fakeDatabase
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

  })

    it('should return a new valid access token and refresh token ', async () => {

    });

    it('should return a new refresh token', async () => {
    } );

    it('should return a new access token and refresh token', async () => {
    } );

    it('should return an error if the refresh token is invalid', async () => {
    } );
    
    it('should return an ')
});
 */