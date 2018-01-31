import {
	GraphQLList,
	GraphQLString,
	GraphQLNonNull,
} from 'graphql';

import { PostType } from '../types';

import { postsResolver } from '../resolvers';

export function postsQuery() {
	return {
		type: new GraphQLList(PostType),
		description: 'This will return all the posts we find in the given subreddit.',
		args: {
			subreddit: {
				type: GraphQLString,
				description: 'Please enter subreddit name',
			}
		},
		resolve(parent, args, context, info) {
			return postsResolver(args);
		}
	};
}