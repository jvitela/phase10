const ResponseAction = require("../phase10/entities/ResponseAction");

describe("ResponseAction", () => {
  test("export", () => {
    expect(ResponseAction).toBeInstanceOf(Function);
  });

  test("constructor", () => {
    const resp = new ResponseAction(1, "foo", "bar");
    expect(resp).toBeInstanceOf(ResponseAction);
  });

  test("properties", () => {
    const resp = new ResponseAction(200, "Foo", { message: "Bar" });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({
        action: "Foo",
        payload: { message: "Bar" },
      })
    );
  });
});
