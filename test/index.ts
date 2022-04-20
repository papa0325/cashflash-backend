/* eslint-disable */
import * as Lab from "@hapi/lab";
import { expect } from "@hapi/code";
import { init } from "../src/server";

const { afterEach, beforeEach, suite, test } = (exports.lab = Lab.script());

suite("GET /", () => {
  let server;

  beforeEach(async () => {
    server = await init();
  });

  test("test documentation", async () => {
    const res = await server.inject({
      method: "get",
      url: "/api/documentation.json"
    });
    expect(res.statusCode).to.equal(200);
  });

  // let accessToken;
  // test("login", async () => {
  //   const res = await server.inject({
  //     method: "post",
  //     url: "/api/login",
  //     payload: {
  //       email: "timofvy1@mail.ru",
  //       password: "1234567"
  //     }
  //   });
  //   accessToken = res.result.result.access;
  //   expect(res.statusCode).to.equal(200);
  // });

  // test("getOrderByUser", async () => {
  //   const res = await server.inject({
  //     method: "get",
  //     url: "/api/ordersByUser",
  //     headers: {
  //       Authorization: "Bearer " + accessToken
  //     }
  //   });
  //   console.log(res.result.result);
  //   expect(res.statusCode).to.equal(200);
  // });
});
