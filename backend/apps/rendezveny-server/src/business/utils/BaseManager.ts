import { applyDecorators, Injectable } from '@nestjs/common';

export abstract class BaseManager {}

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/ban-types,max-len
export function Manager(): <TFunction extends Function, Y>(
	target: Record<string, unknown> | TFunction,
	propertyKey?: string | symbol,
	descriptor?: TypedPropertyDescriptor<Y>
) => void {
	return applyDecorators(Injectable());
}
