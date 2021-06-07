/* eslint-disable no-magic-numbers */
//url.match(/postgres:\/\/(.*):(.*)@(.*):([0-9]{4})\/(.*)/)

const connectionUrlSplit =
	process.env.DATABASE_URL !== undefined
		? process.env.DATABASE_URL.match(/postgres:\/\/(.*):(.*)@(.*):([0-9]{4})\/(.*)/)
		: null;

export default (): Record<string, unknown> => ({
	app: {
		// eslint-disable-next-line no-magic-numbers
		port: process.env.PORT ?? 3000
	},
	database: {
		type: 'postgres',
		host: connectionUrlSplit ? connectionUrlSplit[3] : process.env.DATABASE_HOST ?? 'localhost',
		port: parseInt(connectionUrlSplit ? connectionUrlSplit[4] : process.env.DATABASE_PORT ?? '5432'),
		username: connectionUrlSplit ? connectionUrlSplit[1] : process.env.DATABASE_USERNAME ?? 'postgres',
		password: connectionUrlSplit ? connectionUrlSplit[2] : process.env.DATABASE_PASSWORD ?? 'somePassword',
		database: connectionUrlSplit ? connectionUrlSplit[5] : process.env.DATABASE_DATABASE ?? 'postgres'
	},
	token: {
		secret: process.env.TOKEN_SECRET ?? 'rendezveny',
		accessValidity: process.env.ACCESS_VALIDITY ?? '5m',
		refreshValidity: process.env.REFRESH_VALIDITY ?? '90d',
		eventValidity: process.env.EVENT_VALIDITY ?? '5m'
	},
	security: {
		domain: process.env.DOMAIN ?? 'localhost:3000',
		rateLimit: parseInt(process.env.RATE_LIMIT ?? '100')
	},
	authsch: {
		clientId: 'clientId',
		secretKey: 'secretKey'
	},
	debug: process.env.DEBUG !== undefined
});
