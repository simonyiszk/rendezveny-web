import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import { ConfigService } from '@nestjs/config';

initializeTransactionalContext();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	await app.listen(configService.get('database.type')!);
}

// eslint-disable-next-line no-void
void bootstrap();
