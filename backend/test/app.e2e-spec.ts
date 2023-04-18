import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';


type decodeToken = {
	username: string;
	iat: number;
	exp: number;
};

describe('AppController (e2e)', () => {
	let app: INestApplication;



	describe('Protected (e2e)', () => {
		let app: INestApplication;
		let jwtService: JwtService;
		const access_token_options = { expiresIn: '1m', secret: 'access' };
		const refresh_token_options = { expiresIn: '7d', secret: 'refresh' };



		beforeEach(async () => {
			process.env.POSTRES_HOST = 'localhost:5432' as string;
			process.env.POSTGRES_DB = 'postgres' as string;
			process.env.POSTGRES_USER = 'postgres' as string;
			process.env.POSTGRES_PASSWORD = 'postgres' as string;

			const moduleFixture: TestingModule = await Test.createTestingModule({
				imports: [AppModule],
				providers: [JwtService],
			}).compile();
			jwtService = moduleFixture.get<JwtService>(JwtService);
			app = moduleFixture.createNestApplication();
			await app.init();
		});

		it('/protected (GET)', () => {
			return request(app.getHttpServer())
				.get('/protected')
				.expect(403)
		});


		it('[REGISTER] should return access token & refresh token ', async () => {


			const username = 'admin' + Math.random();

			const res = await request(app.getHttpServer())
				.post('/users/register')
				.send({ username, password: 'admin', email: Math.random() + 'admin@admin.com' })
				.expect(201);
			const accessToken = res.body.access_token;
			const refresh_token = res.body.refresh_token;
			try {
				jwtService.verify(accessToken, access_token_options);
				jwtService.verify(refresh_token, refresh_token_options);
			}
			catch (e) {
				console.log(e);
			}
			const jwtResponseAT = jwtService.decode(accessToken) as decodeToken;
			const jwtResponseRT = jwtService.decode(refresh_token) as decodeToken;
			expect(jwtResponseAT.username).toEqual(username);
			expect(jwtResponseRT.username).toEqual(username);
		});


		it('[LOGIN] should return access token & refresh token ', async () => {
			const res = await request(app.getHttpServer())
				.post('/users/login')
				.send({ email: 'admin1@admin.com', password: 'admin1' })
				.expect(201);

			const accessToken = res.body.access_token;
			const refresh_token = res.body.refresh_token;
			// must validate the token
			try {
				jwtService.verify(accessToken, access_token_options);
				jwtService.verify(refresh_token, refresh_token_options);
			}
			catch (e) {
				console.log(e);
			}
			const jwtResponseAT = jwtService.decode(accessToken) as decodeToken;
			const jwtResponseRT = jwtService.decode(refresh_token) as decodeToken;
			expect(jwtResponseAT.username).toEqual('admin1');
			expect(jwtResponseRT.username).toEqual('admin1');
		});

		it('[ACCESS TOKEN] should return 200', async () => {
			const res = await request(app.getHttpServer())
				.post('/users/login')
				.send({ email: 'admin1@admin.com', password: 'admin1' })
				.expect(201);

			const accessToken = res.body.access_token;

			const res1 = await request(app.getHttpServer())
				.get('/protected')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200);

		});

		it('[ACCESS TOKEN] null', async () => {
			const res1 = await request(app.getHttpServer())
				.get('/protected')
				.set('Authorization', `Bearer`)
				.expect(403);
		});

		it('[ACCESS TOKEN] not access token', async () => {
			const res1 = await request(app.getHttpServer())
				.get('/protected')
				.expect(403);
		});

		it('[ACCESS TOKEN] invalid', async () => {
			const access_token_payload = { username: "admin1", sub: 1 };
			const access_token = jwtService.sign(access_token_payload, { expiresIn: '1m', secret: 'invalid' });
			const res1 = await request(app.getHttpServer())
				.get('/protected')
				.set('Authorization', `Bearer ${access_token}`)
				.expect(403);
		});

		it('[ACCESS TOKEN] bad date', async () => {
			const access_token_payload = { username: "admin1", sub: 1 };
			const access_token = jwtService.sign(access_token_payload, { expiresIn: '-60', secret: 'invalid' });
			const res1 = await request(app.getHttpServer())
				.get('/protected')
				.set('Authorization', `Bearer ${access_token}`)
				.expect(498);
		});

		it('[REFRESH TOKEN] should return new access token & new refresh token', async () => {
			const res1 = await request(app.getHttpServer())
				.post('/users/login')
				.send({ email: 'admin1@admin.com', password: 'admin1' })
				.expect(201);

			const valid_refresh_token = res1.body.refresh_token;

			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', `${valid_refresh_token}`)
				.expect(200);
			const accessToken = res.body.access_token;
			const refresh_token = res.body.refresh_token;
			// must validate the token
			try {
				jwtService.verify(accessToken, access_token_options);
				jwtService.verify(refresh_token, refresh_token_options);
			}
			catch (e) {
				console.log(e);
			}
			const jwtResponseAT = jwtService.decode(accessToken) as decodeToken;
			const jwtResponseRT = jwtService.decode(refresh_token) as decodeToken;
			expect(jwtResponseAT.username).toEqual('admin1');
			expect(jwtResponseRT.username).toEqual('admin1');
		});

		it('[REFRESH TOKEN] valid token but not in refresh token base', async () => {
			const refresh_token_payload = { username: "admin1", sub: 1 };
			const valid_refresh_token = jwtService.sign(refresh_token_payload, refresh_token_options);

			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', `${valid_refresh_token}`)
				.expect(403);
		});

		it('[REFRESH TOKEN] user in not in database', async () => {
			const refresh_token_payload = { username: "yolo", sub: 1 };
			const valid_refresh_token = jwtService.sign(refresh_token_payload, refresh_token_options);

			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', `${valid_refresh_token}`)
				.expect(403);
		});

		it('[REFRESH TOKEN] invalid secret', async () => {
			const refresh_token_payload = { username: "admin1", sub: 1 };
			const valid_refresh_token = jwtService.sign(refresh_token_payload, { expiresIn: '7d', secret: 'coucou' });

			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', `${valid_refresh_token}`)
				.expect(403);
		});


		it('[REFRESH TOKEN] date no valid', async () => {
			const refresh_token_payload = { username: "admin1", sub: 1 };
			const valid_refresh_token = jwtService.sign(refresh_token_payload, { expiresIn: '-7d', secret: 'refresh' });

			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', `${valid_refresh_token}`)
				.expect(403);
		});

		it('[REFRESH TOKEN] no token add', async () => {
			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', ``)
				.expect(403);
		});

		it('[REFRESH TOKEN] full invalid token', async () => {
			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.set('X-Refresh-Token', `prout`)
				.expect(403);
		});

		it('[REFRESH TOKEN] no refresh', async () => {
			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.expect(403);
		});

		it('[REFRESH TOKEN] no refresh', async () => {
			const res = await request(app.getHttpServer())
				.get('/auth/refresh')
				.expect(403);
		});

	}
	);
});