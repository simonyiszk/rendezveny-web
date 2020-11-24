import { Module } from '@nestjs/common';
import { ApiV1Module } from './api/v1/ApiV1Module';
import { DataModule } from './data/DataModule';
import { BusinessModule } from './business/BusinessModule';

@Module({
	imports: [
		...ApiV1Module.forRoot(),
		ApiV1Module,

		...BusinessModule.forRoot(),
		BusinessModule,

		...DataModule.forRoot(),
		DataModule
	]
})
export class AppModule {}
