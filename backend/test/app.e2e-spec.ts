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

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, JwtService],
		}).compile();

		

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/ (GET)', () => {
		return request(app.getHttpServer())
			.get('/')
			.expect(200)
			.expect('Hello World!');
	});
});


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
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'admin1', password: 'admin1', email: 'admin1@admin.com' })
			.expect(201);
	});

	it('/protected (GET)', () => {
		return request(app.getHttpServer())
			.get('/protected')
			.expect(401)
			.expect('Unauthorized');
	});


	it('[REGISTER] should return access token & refresh token ', async () => {
		const res = await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'admin', password: 'admin', email: 'admin@admin.com' })
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
	expect(jwtResponseRT.username).toEqual('admin');
	});


	it('[LOGIN] should return access token & refresh token ', async () => {
		const res = await request(app.getHttpServer())
			.post('/auth/login')
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
			.post('/auth/login')
			.send({ email: 'admin1@admin.com', password: 'admin1' })
			.expect(201);

		const accessToken = res.body.access_token;

		const res1 = await request(app.getHttpServer())
			.get('/protected')
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(res1.body.message).toEqual('You are protected');
	});

	it('ACCESS TOKEN null', async () => {
		const res1 = await request(app.getHttpServer())
		.get('/protected')
		.set('Authorization', `Bearer`)
		.expect(401);
	});

	it('ACCESS TOKEN invalid', async () => {
		const access_token_payload = { username: "admin1", sub: 1 };
		const access_token = jwtService.sign(access_token_payload, { expiresIn: '1m', secret: 'invalid' });
		const res1 = await request(app.getHttpServer())
		.get('/protected')
		.set('Authorization', `Bearer ${access_token}`)
		.expect(401);
	});

	it('ACCESS TOKEN bad date', async () => {
		const access_token_payload = { username: "admin1", sub: 1 };
		const access_token = jwtService.sign(access_token_payload, { expiresIn: '-60', secret: 'invalid' });
		const res1 = await request(app.getHttpServer())
		.get('/protected')
		.set('Authorization', `Bearer ${access_token}`)
		.expect(498);
	});



		
}
);
