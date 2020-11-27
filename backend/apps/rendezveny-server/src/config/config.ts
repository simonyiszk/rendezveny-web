export default (): Record<string, unknown> => ({
	database: {
		host: process.env.DATABASE_HOST ?? 'localhost',
		port: parseInt(process.env.DATABASE_PORT ?? '3306'),
		username: process.env.DATABASE_USERNAME ?? 'rendezveny',
		password: process.env.DATABASE_PASSWORD ?? 'rendezveny',
		database: process.env.DATABASE_DATABASE ?? 'rendezveny_db'
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