/**
 * Class for DynamoDB CRUD operations
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/querycommandinput.html
 */

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export class Dynamo {
  static queryTable = async (
    tableName: string,
    condition: string,
    filterExp?: string,
    projectionExp?: string
  ) => {
    const command = new QueryCommand({
      TableName: `NoteMaster_${tableName}`, // name of table
      KeyConditionExpression: condition, // key values for item retrieval
      ProjectionExpression: projectionExp, // which attributes to return
      FilterExpression: filterExp, // filters applied after query operation
    });
    try {
      const response = await client.send(command);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  };
}
