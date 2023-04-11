import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../../model/user.entity';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../model/refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RTGuard } from '../guard/refresh-token.guard';
import { ATGuard } from '../guard/access-token.guard';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';


describe('Guard', () => {

	let authService: AuthService;
	let fakeUsersService: Partial<UsersService>;
	let fakeRepo: Partial<Repository<RefreshToken>>;
	let user: User;
	const REFRESH_TOKEN_REPOSITORY = getRepositoryToken(RefreshToken);
	let refreshToken: RefreshToken;
	let refreshTokenList: RefreshToken[];
	let rtGuard: RTGuard;
	let atGuard: ATGuard;

	let jwtService: JwtService;
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
	refreshTokenList = [refreshToken];
	beforeEach(async () => {
		jest.useFakeTimers()
		fakeUsersService = {
			findOne: (id: number) => {
				console.log('fake user service');
				if (id === 1) {
					console.log('fake user service 1')
					return Promise.resolve(user);
				}
				else
					return Promise.resolve(undefined)
			},
			findOneByEmail: (email: string) => Promise.resolve(user),
		};

		fakeRepo = {
			findOne: (any: any) => Promise.resolve(refreshToken),
			find: (any: any) => Promise.resolve([refreshToken]),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [ATGuard, RTGuard,
				AuthService,
				{
					provide: UsersService,
					useValue: fakeUsersService,
				},
				{
					provide: REFRESH_TOKEN_REPOSITORY,
					useValue: fakeRepo,
				}, JwtService,
			],
		}).compile();
		authService = module.get<AuthService>(AuthService);
		jwtService = module.get<JwtService>(JwtService);
		rtGuard = module.get<RTGuard>(RTGuard);
		atGuard = module.get<ATGuard>(ATGuard);
		const refresh_token_payload = { username: user.username, sub: user.id };
		const refresh_token_options = { expiresIn: '7d', secret: 'refresh' };
		refreshToken.refreshToken = jwtService.sign(refresh_token_payload, refresh_token_options);

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
		console.log();
		atGuard.canActivate(context as ExecutionContext).then((res) => {
			expect(res).toBe(true);
		});
	});

	it('should return false if the access token is invalid with wrong username', () => {
		const jwtService = new JwtService();
		const access_token_payload = { username: "toto", sub: 2 };
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

		atGuard.canActivate(context as ExecutionContext).then((res) => {
			expect(res).toBe(false);

		});
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

		atGuard.canActivate(context as ExecutionContext).then((res) => {
			expect(res).toBe(false);
		});
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

		atGuard.canActivate(context as ExecutionContext).then((res) => {
			expect(res).toBe(false)
		});
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

		atGuard.canActivate(context as ExecutionContext).then((res) => {
			expect(res).toBe(false)
		});
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