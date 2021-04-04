import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/AppModule';

describe('AppController (e2e)', () => {
	const SUCCESS = 200;
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/ (POST)', async () =>
		request(app.getHttpServer())
			.post('/api/v1')
			.send({
				operationName: 'IntrospectionQuery',
				variables: {},
				query: 'query IntrospectionQuery { __schema { queryType { name } }'
			})
			.expect(SUCCESS));
});
