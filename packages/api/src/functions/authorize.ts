import * as _ from "lodash";
import * as jwt from 'jsonwebtoken';
import {buildIAMPolicy} from '../lib/utils'

/**
  * Authorizer functions are executed before your actual functions.
  * @method authorize
  * @param {String} event.headers.authorization - JWT
  * @throws Returns 401 if the token is invalid or has expired.
  * @throws Returns 403 if the token does not have sufficient permissions.
  */
export function handler(event, context, callback) {
  console.log({event})
  if (!event.headers.authorization) {
    return callback('Unauthorized');
  }

  const tokenParts = event.headers.authorization.split(' ');
  const tokenValue = tokenParts[1];

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    // no auth token!
    return callback('Unauthorized');
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    const publicAddress = decoded.publicAddress;

    const authorizerContext = { user: publicAddress };
    // Return an IAM policy document for the current endpoint
    const policyDocument = buildIAMPolicy(publicAddress, 'Allow', event.routeArn, authorizerContext);

    callback(null, policyDocument);
  } catch (e) {
    console.log({e})
    callback('Unauthorized'); // Return a 401 Unauthorized response
  }
}