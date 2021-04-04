import { GqlExceptionFilter } from '@nestjs/graphql';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { BusinessException } from '../../../business/utils/BusinessException';
import { GraphQLError } from 'graphql';

@Catch(BusinessException)
export class BusinessExceptionFilter implements GqlExceptionFilter {
	public catch(exception: BusinessException, _host: ArgumentsHost): GraphQLError {
		console.error(exception);
		return new GraphQLError(exception.message, null, null, null, null, exception, {
			code: exception.tag,
			exception: {
				payload: exception.payload,
				stacktrace: exception.stack?.split('\n')
			}
		});
	}
}
