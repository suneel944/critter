import { test } from "../../fixtures/session"
import { ConfigManager, ResponseValidator } from "../../../src/framework"
import RequestBuilder from "../../../src/framework/api/builders/RequestBuilder"

let config: ConfigManager

test.describe("ReqRes API Tests", () => {
  test.beforeAll(async () => {
    config = ConfigManager.getInstance()
  })

  test(
    "Fetch a list of users with pagination",
    { tag: "@unit-api" },
    async ({ session }) => {
      // Arrange
      const client = session.api({
        baseURL: config.get("reqResBaseUrl") as string,
        defaultHeaders: {
          "x-api-key": config.get("reqResApiKey") as string,
        },
      })

      const getUserRequest = await RequestBuilder.get("/api/users").build()

      // Act
      const response = await session.apiSend(client, getUserRequest)

      // Assert
      await ResponseValidator.expectStatus(response, 200)
    },
  )

  test(
    "Fetch a single user by ID",
    { tag: "@unit-api" },
    async ({ session }) => {
      // Arrange
      const client = session.api({
        baseURL: config.get("reqResBaseUrl") as string,
        defaultHeaders: {
          "x-api-key": config.get("reqResApiKey") as string,
        },
      })

      const getSpecificUserRequest =
        await RequestBuilder.get("/api/users/1").build()

      // Act
      const response = await session.apiSend(client, getSpecificUserRequest)

      // Assert
      await ResponseValidator.expectStatus(response, 200)
    },
  )
})
