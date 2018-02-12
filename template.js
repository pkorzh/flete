module.exports = {
	AWSTemplateFormatVersion: '2010-09-09',
	Description: 'Create Cloud API Stack',
	Parameters: {},
	Conditions: {},
	Resources: {
		lambdaRestApiRole: {
			Type: 'AWS::IAM::Role',
			Properties: {
				AssumeRolePolicyDocument: {
					Version: '2012-10-17',
					Statement: [
						{
							Effect: 'Allow',
							Principal: { Service: ['lambda.amazonaws.com'] },
							Action: ['sts:AssumeRole']
						}
					]
				},
				ManagedPolicyArns: [
					'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
				],
				Policies: [
					{
						PolicyName: 'DynamoDBPolicy',
						PolicyDocument: {
							Version: '2012-10-17',
							Statement: [
								{
									Effect: 'Allow',
									Action: [
										'dynamodb:*'
									],
									Resource: [
										{
											'Fn::GetAtt': ['postsTable', 'Arn']
										}
									]
								}
							]
						}
					}
				]
			}
		},
		webhookHandler: {
			Type: 'AWS::Lambda::Function',
			Properties: {
				Environment: {
					Variables: {
						POSTS_DYNAMODB_TABLE: {Ref: 'postsTable'}
					}
				}
			}
		},
		postsHandler: {
			Type: 'AWS::Lambda::Function',
			Properties: {
				Environment: {
					Variables: {
						POSTS_DYNAMODB_TABLE: {Ref: 'postsTable'}
					}
				}
			}
		},
		postsTable: {
			Type: 'AWS::DynamoDB::Table',
			Properties: {
				AttributeDefinitions: [
					{
						AttributeName: 'chat_username',
						AttributeType: 'S'
					},
					{
						AttributeName: 'date',
						AttributeType: 'S'
					}
				],
				KeySchema: [
					{
						AttributeName: 'chat_username',
						KeyType: 'HASH'
					},
					{
						AttributeName: 'date',
						KeyType: 'RANGE'
					}
				],
				ProvisionedThroughput: {
					WriteCapacityUnits: 5,
					ReadCapacityUnits: 5
				}
			}
		},
		platononfrontendDistribution : {
			Type : 'AWS::CloudFront::Distribution',
			Properties : {
				DistributionConfig : {
					Origins : [ {
						DomainName : 'platononfrontend.com.s3.amazonaws.com',
						Id : 'myS3Origin',
						S3OriginConfig : {
							OriginAccessIdentity : 'origin-access-identity/cloudfront/E2JPIL745EJ0HJ'
						}
					}],
					Enabled : 'true',
					DefaultRootObject : 'index.html',
					Aliases : [ 'platononfrontend.com' ],
					DefaultCacheBehavior : {
						AllowedMethods : [ 'GET', 'HEAD', 'OPTIONS',],  
						TargetOriginId : 'myS3Origin',
						ForwardedValues : {
							QueryString : 'false',
							Cookies : { 'Forward' : 'none' }
						},
						ViewerProtocolPolicy : 'redirect-to-https'
					},
					PriceClass : 'PriceClass_200'
				}
			}
		}
	},
	Outputs: {}
};