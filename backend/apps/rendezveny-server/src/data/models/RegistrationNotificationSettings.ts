/* eslint-disable no-bitwise,no-magic-numbers */
export enum RegistrationNotificationSettings {
	NONE = 0,
	PUSH_HOUR = 1 << 0,
	EMAIL_HOUR = 1 << 1,
	PUSH_MORNING = 1 << 2,
	EMAIL_MORNING = 1 << 3,
	PUSH_THREE_DAYS = 1 << 4,
	EMAIL_THREE_DAYS = 1 << 5,
	ALL = ~(~0 << 16)
}

export const DEFAULT = RegistrationNotificationSettings.ALL;
