import { NestFactory } from '@nestjs/core';
import { SeedModule } from './SeedModule';
import { SeedService } from './SeedService';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';

initializeTransactionalContext();

async function bootstrap() {
	const appContext = await NestFactory.createApplicationContext(SeedModule);
	const seedService = appContext.get(SeedService);

	await seedService.clearDatabase();
	await seedService.seedDatabase();
	await appContext.close();
}

// eslint-disable-next-line no-void
void bootstrap();