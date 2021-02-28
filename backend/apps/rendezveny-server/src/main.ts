import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import {
	initializeTransactionalContext
} from 'typeorm-transactional-cls-hooked';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

initializeTransactionalContext();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// eslint-disable-next-line no-magic-numbers
	await app.listen(3000);
}

// eslint-disable-next-line no-void
void bootstrap();
