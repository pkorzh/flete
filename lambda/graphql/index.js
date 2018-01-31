import { ok_response } from '../../src/response';
import { graphql } from 'graphql';

import { schema } from '../../src/graphql/schema';

export function handler(event, context, callback) {

	graphql(schema, '{ posts }').then((data) => console.log(data));

	callback(null, ok_response({
		message: 'Greetings from API'
	}));
};