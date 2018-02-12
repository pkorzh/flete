import AWS from 'aws-sdk';
import { marshalItem } from 'dynamodb-marshaler';
import { ok_response } from '../../src/response';

const dynamodb = new AWS.DynamoDB();
const matchHtmlRegExp = /["'&<>]/;

function escapeHtml(string) {
	let str = '' + string;
	let match = matchHtmlRegExp.exec(str);

	if (!match) {
		return str;
	}

	let escape;
	let html = '';
	let index = 0;
	let lastIndex = 0;

	for (index = match.index; index < str.length; index++) {
		switch (str.charCodeAt(index)) {
			case 34: // "
				escape = '&quot;';
				break;
			case 38: // &
				escape = '&amp;';
				break;
			case 39: // '
				escape = '&#39;';
				break;
			case 60: // <
				escape = '&lt;';
				break;
			case 62: // >
				escape = '&gt;';
				break;
			default:
				continue;
	}

		if (lastIndex !== index) {
			html += str.substring(lastIndex, index);
		}

		lastIndex = index + 1;
		html += escape;
	}

	return lastIndex !== index
		? html + str.substring(lastIndex, index)
		: html;
}

function wrapEntity (content, entity) {
	switch (entity.type) {
		case 'bold':
			return `<b>${content}</b>`
		case 'italic':
			return `<i>${content}</i>`
		case 'code':
			return `<code>${escapeHtml(content)}</code>`
		case 'pre':
			return `<pre>${escapeHtml(content)}</pre>`
		case 'text_link':
			return `<a href="${entity.url}">${content}</a>`
		case 'url':
			return `<a href="${content}">${content}</a>`
		default:
			return content
	}
}

function applyEntity (text, entity) {
	const head = text.substring(0, entity.offset-1)
	const tail = text.substring(entity.offset + entity.length)
	const content = wrapEntity(text.substring(entity.offset-1, entity.offset + entity.length), entity)
	return `${head}${content}${tail}`;
}

export function handler(event, context, callback) {
	console.log(event.body);

	let { update_id, channel_post } = JSON.parse(event.body);

	if (!channel_post) {
		callback(null, ok_response({ok: true}));
		return;
	}

	let { chat, message_id, text, entities, photo, date } = channel_post;

	if (!text) {
		callback(null, ok_response({ok: true}));
		return;
	}

	if (entities) {
		let suffix = '';

		for (var i = entities.length - 1; i >= 0; i--) {
			if (entities[i].offset === 0 && entities[i].length === 2) {
				suffix += `<img src="${entities[i].url}" />`;
				entities.splice(i, 1);
			}
		}

		text = entities.reduceRight(applyEntity, text) + suffix;
	}

	const params = {
		Item: marshalItem({
			chat_username: chat.username,
			date: new Date(date * 1000).toISOString(),
			message_id,
			text: text.replace(/(?:\r\n|\r|\n)/g, '<br>')
		}),
		TableName: process.env.POSTS_DYNAMODB_TABLE
	};

	dynamodb.putItem(params, function(err, data) {
		if (err) {
			console.log(err);
			callback(err);
		} else {
			callback(null, ok_response({ok: true}));
		}
	});
};