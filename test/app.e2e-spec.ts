import * as pactum from 'pactum';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { CreateBookmarkDto } from '../src/bookmark/dto/create-bookmark.dto';
import { EditBookmarkDto } from '../src/bookmark/dto/edit-bookmark.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto/edit-user.dto';

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

		describe('Edit user', () => {
			it('should edit user', () => {
				const dto: EditUserDto = {
					firstName: 'Amir',
					email: 'amir@am.am'
				};

				return pactum
					.spec()
					.patch('/users')
					.withHeaders({
						Authorization: `Bearer $S{userAt}`,
					})
					.withBody(dto)
					.expectStatus(200)
					.expectBodyContains(dto.firstName)
					.expectBodyContains(dto.email);
			});
		});
	});

	describe('Bookmarks', () => {
		describe('Get Empty bookmarks', () => {
			it('should get bookmarks', () => {
				return pactum
					.spec()
					.get('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.expectStatus(200)
					.expectBody([]);
			});
		});

		describe('Create bookmark', () => {
			const dto: CreateBookmarkDto = {
				title: 'First Bookmark',
				link: 'https://google.com'
			};

			it('should create bookmark', () => {
				return pactum
					.spec()
					.post('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.withBody(dto)
					.expectStatus(201)
					.stores('bookmarkId', 'id');
			});
		});

		describe('Get bookmarks', () => {
			it('should get bookmarks', () => {
				return pactum
					.spec()
					.get('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.expectStatus(200)
					.expectJsonLength(1);
			});
		});

		describe('Get bookmark by id', () => {
			it('should get bookmark by id', () => {
				return pactum
					.spec()
					.get('/bookmarks/{id}')
					.withPathParams('id', '$S{bookmarkId}')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.expectStatus(200)
					.expectBodyContains('$S{bookmarkId}');
			});
		});

		describe('Edit bookmark by id', () => {
			const dto: EditBookmarkDto = {
				description: 'This is updated description',
				title: 'Updated Title'
			};

			it('should edit bookmark', () => {
				return pactum
					.spec()
					.patch('/bookmarks/{id}')
					.withPathParams('id', '$S{bookmarkId}')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.withBody(dto)
					.expectStatus(200)
					.expectBodyContains(dto.title)
					.expectBodyContains(dto.description);
			});
		});

		describe('Delete bookmark by id', () => {
			it('should delete bookmark', () => {
				return pactum
					.spec()
					.delete('/bookmarks/{id}')
					.withPathParams('id', '$S{bookmarkId}')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.expectStatus(204);
			});

			it('should get empty bookmark', () => {
				return pactum
					.spec()
					.get('/bookmarks')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}'
					})
					.expectStatus(200)
					.expectJsonLength(0);
			});
		});
	});
});
