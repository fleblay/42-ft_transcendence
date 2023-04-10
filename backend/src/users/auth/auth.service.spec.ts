import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../../model/user.entity';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../model/refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';


describe('AuthService', () => {
    let authService: AuthService;
    let fakeUsersService: Partial<UsersService>;
    let fakeRepo: Partial<Repository<RefreshToken>>;
    let user: User;
    const REFRESH_TOKEN_REPOSITORY = getRepositoryToken(RefreshToken);
    let refreshToken: RefreshToken;
    let jwtService : JwtService;
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

    beforeEach(async () => {
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

    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    //create a test for validateUser
    it('should validate a user', async () => {
        let email : string = 'test@test.fr';
        let password : string = 'test';
        let result = await authService.validateUser(email, password);
        expect(result).toEqual(user);
    });

    it('should return null', async () => {
        let email : string = 'test@test.fr';
        let password : string = 'test2';
        let result = await authService.validateUser(email, password);
        expect(result).toEqual(null);
    });

    it('test validateAccessToken : should return a user', async () => {
        let bearerToken : string;
        const access_token_payload = { username: user.username, sub: user.id };
        const access_token_options = { expiresIn: '5s', secret: 'access' };
        bearerToken = jwtService.sign(access_token_payload, access_token_options);
        let result = await authService.validateAccessToken(bearerToken);
        expect(result).toEqual(user);
    });

    

});
