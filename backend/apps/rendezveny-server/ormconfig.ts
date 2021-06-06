import config from './src/config/config';

const { type, host, port, username, password, database } = config().database as never;

export = {
	type: type,

	host: host,
	port: port,
	username: username,
	password: password,
	database: database,

	synchronize: false,
	entities: ['src/data/models/**/*.ts'],
	migrations: ['src/data/migrations/*.ts'],
	cli: {
		migrationsDir: 'src/data/migrations'
	}
};
