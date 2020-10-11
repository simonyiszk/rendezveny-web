import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
	const SUCCESS = 200;
	let app: INestApplication;

	beforeEach(async() => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/ (GET)', async() => request(app.getHttpServer())
		.get('/')
		.expect(SUCCESS)
		.expect('Hello World!'));
});
