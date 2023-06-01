import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

/**
 * @param password password to hash
 * @param salt salt to use, if not provided, a random salt will be generated
 * @returns salt.hashedPassword
 * @description
 * 	Hash the password with the salt.
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('password');
 * console.log(hashedPassword); // `{salt}.{hashedPassword}`
 *
 * const hashedPassword = await hashPassword('password', 'secretSalt');
 * console.log(hashedPassword); // `secretSalt.{hashedPassword}`
 * ```
 */
export async function hashPassword(password: string, salt?: string) {
	if (!salt)
		salt = randomBytes(8).toString('hex');
	const buf = (await scrypt(password, salt, 32)) as Buffer;

	const hashedPassword = `${salt}.${buf.toString('hex')}`;
	return hashedPassword;
}

/**
 * @param storedPassword salt.hashedPassword
 * @param suppliedPassword password to check
 * @returns boolean
 * @description
 * 	Compare the password with the stored password.
 * @example
 * ```typescript
 * const storedPassword = await hashPassword('password');
 * const isPasswordValid = await verifyPassword(storedPassword, 'password');
 * 		// isPasswordValid === true
 * isPasswordValid = await verifyPassword(storedPassword, 'wrongpassword');
 * 		// isPasswordValid === false
 * ```
 */
export async function verifyPassword(storedPassword: string, suppliedPassword: string) {
	const [salt, storedHash] = storedPassword.split('.');
	const hashedSuppliedPassword = await hashPassword(suppliedPassword, salt);
	return hashedSuppliedPassword === storedPassword;
}