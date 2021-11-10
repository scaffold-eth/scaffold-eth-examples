import {APIGatewayEvent, Context} from "aws-lambda"
import * as handler from "../functions/handler"

test("hello", async () => {
  const event = { body: "Test Body" } as APIGatewayEvent
  const context = {} as Context

  const response = await handler.defaultCORS(event)

  expect(response.statusCode).toEqual(200)
  expect(typeof response.body).toBe("string")
})
