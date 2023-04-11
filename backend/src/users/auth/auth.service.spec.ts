import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../../model/user.entity';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../model/refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';


describe('AuthService', () => {
    let authService: AuthService;
    let fakeUsersService: Partial<UsersService>;
    let fakeRepo: Partial<Repository<RefreshToken>>;
    let user: User;
	let returnUser: Partial<User>;
    const REFRESH_TOKEN_REPOSITORY = getRepositoryToken(RefreshToken);
    let refreshToken: RefreshToken;
	let refreshTokenList: RefreshToken[];

    let jwtService : JwtService;
    user = {
        id: 1,
        username: 'test',
        password: 'test',
        email: 'test@test.fr',
        savedGames: [],
        wonGames: [],
    };

	returnUser = {
		id: 1,
		username: 'test',
        email: 'test@test.fr',
        savedGames: [],
        wonGames: [],
	}


    refreshToken = {
        id: 1,
        refreshToken: 'test',
        userId: 1,
    };
	refreshTokenList = [refreshToken];
    beforeEach(async () => {
		jest.useFakeTimers()
        fakeUsersService = {
            findOne: (id: number) => Promise.resolve(user),
            findOneByEmail: (email: string) => Promise.resolve(user),
        };

        fakeRepo = {
            findOne: (any: any) => Promise.resolve(refreshToken),
            find: (any: any) => Promise.resolve([refreshToken]),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
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
		const refresh_token_payload = { username: user.username, sub: user.id};
		const refresh_token_options = {expiresIn: '7d', secret: 'refresh'}; 
		refreshToken.refreshToken = jwtService.sign(refresh_token_payload, refresh_token_options);

    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    //create a test for validateUser
    it('validateUser : should validate a user', async () => {
        let email : string = 'test@test.fr';
        let password : string = 'test';
        let result = await authService.validateUser(email, password);
		console.log(result);
        expect(result).toEqual(returnUser);
    });

    it('validateUser :should return null', async () => {
        let email : string = 'test@test.fr';
        let password : string = 'test2';
        let result = await authService.validateUser(email, password);
        expect(result).toEqual(null);
    });

	// test validateAccessToken

    it('validateAccessToken : should return a user', async () => {
        let bearerToken : string;
        const access_token_payload = { username: user.username, sub: user.id };
        const access_token_options = { expiresIn: '1m', secret: 'access' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
        let result = await authService.validateAccessToken(bearerToken);
        expect(result).toEqual(user);
    });


	it('validateAccessToken : bad password should return null ', async () => {
        let bearerToken : string;
        const access_token_payload = { username: user.username, sub: user.id };
        const access_token_options = { expiresIn: '1m', secret: 'accesss' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
        let result = await authService.validateAccessToken(bearerToken);
        expect(result).toEqual(null);
    });


	it('validateAccessToken : bad user should return null ', async () => {
        let bearerToken : string;
        const access_token_payload = { username: "toto", sub: user.id };
        const access_token_options = { expiresIn: '1m', secret: 'accesss' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
        let result = await authService.validateAccessToken(bearerToken);
        expect(result).toEqual(null);
    });


	it('validateAccessToken : token is expered return null ', async () => {
		let bearerToken : string;
        const access_token_payload = { username: user.username, sub: user.id };
        const access_token_options = { expiresIn: '0.000001s', secret: 'access' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
		jest.advanceTimersByTime(60000);
        let result = await authService.validateAccessToken(bearerToken);
        expect(result).toEqual(null);
	});

	// test decodeToken
	// create test fore decodeToken
	it('decodeToken : should return a user', async () => {
		let bearerToken : string;
        const access_token_payload = { username: user.username, sub: user.id };
        const access_token_options = { expiresIn: '1m', secret: 'access' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
        let result = await authService.decodeToken(bearerToken);
        expect(result).toEqual(user);
	});

	it('decodeToken : should return null', async () => {
		let bearerToken : string;
        const access_token_payload = { username: user.username, sub: user.id };
        const access_token_options = { expiresIn: '1m', secret: 'accesss' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
        let result = await authService.decodeToken(bearerToken);
        expect(result).toEqual(user);
	});

	it('getTokens : should return a token', async () => {
		let result = await authService.getTokens(user);
		console.log("getToken result", result);
		expect(await authService.validateAccessToken(result.access_token)).toEqual(user);
		expect(await authService.validateRefreshToken(result.refresh_token)).toEqual(user);
	});

	it('validateRefreshToken : should return a user', async () => {
		let result = await authService.validateRefreshToken(refreshToken.refreshToken);
		expect(result).toEqual(user);
	});

	it('validateRefreshToken : invalid token should return null', async () => {
		try
		{
			let result = await authService.validateRefreshToken("test");
		
		}
		catch (e)
		{
			expect(e).toEqual(new ForbiddenException('Invalid refresh token'));
		}
	});

	it('validateRefreshToken : should return null', async () => {
	
		const refresh_token_payload = { username: "toto", sub: user.id};
		const refresh_token_options = {expiresIn: '7d', secret: 'refresh'};
		const refresh_token = jwtService.sign(refresh_token_payload, refresh_token_options);
		try
		{
			let result = await authService.validateRefreshToken(refresh_token);
		
		}
		catch (e)
		{
			expect(e).toEqual(new NotFoundException('User not found'));
		}
	});


	    

});
