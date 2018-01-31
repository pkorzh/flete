import {
	GraphQLObjectType,
	GraphQLSchema,
} from 'graphql';

import postsQuery from './queries';


// lets define our root query
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	description: 'This is the default root query provided by our application',
	fields: {
		posts: postsQuery()
	}
});


const schema = new GraphQLSchema({
	query: RootQuery
});

export {
	schema
}