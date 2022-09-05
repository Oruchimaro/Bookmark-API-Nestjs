import * as pactum from 'pactum';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
	let app: INestApplication;
	let prisma: PrismaService;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleRef.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({
			whitelist: true
		}));

		await app.init();
		await app.listen(8000);

		prisma = app.get(PrismaService);
		await prisma.cleanDb();
		pactum.request.setBaseUrl('http://localhost:8000');
	});

	afterAll(() => {
		app.close();
	});

	/** Tests */
	describe('Auth', () => {
		const dto: AuthDto = {
			email: 'am@am.am',
			password: 'password'
		};

		describe('Signup', () => {
			it('should throw if no body provided', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.expectStatus(400);
			});

			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto.password)
					.expectStatus(400);
			});

			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto.email)
					.expectStatus(400);
			});

			it('should signup', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(dto)
					.expectStatus(201);
				// .inspect(); // inspect the request and response
			});
		});

		describe('Signin', () => {
			it('should throw if no body provided', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.expectStatus(400);
			});

			it('should throw if email empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto.password)
					.expectStatus(400);
			});

			it('should throw if password empty', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto.email)
					.expectStatus(400);
			});

			it('should signin', () => {
				return pactum
					.spec()
					.post('/auth/signin')
					.withBody(dto)
					.expectStatus(200)
					.stores('userAt', 'access_token'); // store a value 
			});
		});
	});

	describe('User', () => {
		describe('Get me', () => {
			it('should get current user', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: `Bearer $S{userAt}`,
					})
					.expectStatus(200);
			});
		});

		describe('Edit user', () => { });
	});

	describe('Bookmarks', () => {
		describe('Create bookmark', () => { });
		describe('Get bookmarks', () => { });
		describe('Get bookmark by id', () => { });
		describe('Edit bookmark by id', () => { });
		describe('Delete bookmark by id', () => { });
	});
});
