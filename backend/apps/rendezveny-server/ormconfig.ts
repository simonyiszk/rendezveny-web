export = {
	type: 'mysql',
	host: 'localhost',
	port: 3306,
	username: 'rendezveny',
	password: 'rendezveny',
	database: 'rendezveny_db',

	synchronize: false,
	entities: [
		'src/data/models/**/*.ts'
	],
	migrations: [
		'src/data/migrations/*.ts'
	],
	cli: {
		migrationsDir: 'src/data/migrations'
	}
}