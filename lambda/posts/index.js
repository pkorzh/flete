import AWS from 'aws-sdk';
import { unmarshalItem } from 'dynamodb-marshaler';
import { ok_response } from '../../src/response';

const dynamodb = new AWS.DynamoDB();

export function handler(event, context, callback) {

	const params = {
		TableName: process.env.POSTS_DYNAMODB_TABLE,
		Limit: 10,
		ExpressionAttributeValues: {
			':chat_username': {
				S: 'platononfrontend'
			}
		},
		KeyConditionExpression: 'chat_username = :chat_username',
		ScanIndexForward: false,
	};

	dynamodb.query(params, function(err, data) {
		if (err) {
			console.log(err);
			callback(err);
		} else {
			console.log(JSON.stringify(data));
			callback(null, ok_response(data.Items.map(unmarshalItem)));
		}
	});

};