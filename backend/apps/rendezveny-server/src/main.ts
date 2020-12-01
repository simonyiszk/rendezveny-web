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

	const configService = app.get(ConfigService);
	if(configService.get<boolean>('debug') === false) {
		app.use(helmet());
		app.enableCors({
			origin: configService.get('security.domain'),
			methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
			preflightContinue: false
		});
		app.use(rateLimit({
			// eslint-disable-next-line no-magic-numbers
			windowMs: 15 * 60 * 1000,
			max: configService.get('security.rateLimit')
		}));
	}
	else {
		app.enableCors({
			origin: true
		});
	}

	// eslint-disable-next-line no-magic-numbers
	await app.listen(3000);
}

// eslint-disable-next-line no-void
void bootstrap();
