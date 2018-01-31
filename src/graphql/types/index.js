import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLID,
	GraphQLInt,
} from 'graphql';


const PostType = new GraphQLObjectType({
	name: 'Post',
	description: 'Post Type, For all the posts present in Reddit.',

	fields: () => ({
		id: {
			type: GraphQLID,
			description: 'ID of the post',
		},
		title: {
			type: GraphQLString,
			description: 'Title of the post',
		}
	})

});

export {
	PostType
};