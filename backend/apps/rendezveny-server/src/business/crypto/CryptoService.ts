import { Injectable } from '@nestjs/common';
import { pbkdf2, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
	public async hashPassword(
		password: string, version: number, salt?: string
	): Promise<{ hashedPassword: string, salt: string}> {
		const saltToUse
			= (typeof salt === 'string')
			? new Buffer(salt, 'base64')
			: await this.getRandomBytesV1();

		if(version === 1) {
			const hashedPassword = await this.hashPasswordV1(password, saltToUse);
			return {
				hashedPassword: hashedPassword,
				salt: saltToUse.toString('base64')
			};
		}
		else {
			throw new Error();
		}
	}

	private async hashPasswordV1(password: string, salt: Buffer): Promise<string> {
		return new Promise((resolve, reject) => {
			pbkdf2(
				password,
				salt,
				// eslint-disable-next-line no-magic-numbers
				10000,
				// eslint-disable-next-line no-magic-numbers
				64,
				'sha512',
				(err, result) => {
					if(err) {
						reject(err);
					}
					else {
						resolve(result.toString('base64'));
					}
				}
			);
		});
	}

	private async getRandomBytesV1(): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line no-magic-numbers
			randomBytes(64, (err, buffer) => {
				if(err) {
					reject(err);
				}
				else {
					resolve(buffer);
				}
			});
		});
	}
}