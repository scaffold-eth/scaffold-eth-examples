const apiResponses = {
  _200: (body: { [key: string]: any }) => {
      return {
          statusCode: 200,
          body: JSON.stringify(body, null, 2),
          headers: {
            'Access-Control-Allow-Origin' : 'http://localhost:3000,https://mysterydrop.app,https://test-cors.org,https://dev.mysterydrop.app',
            'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                  /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true,
            // 'Access-Control-Allow-Credentials' : true,
        }
      }
  },
  _400: (body: { [key: string]: any }) => {
      return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(body, null, 2),
      }
  },
}

export default apiResponses