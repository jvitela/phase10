const {
  fnSuccessReq,
  fnErrorReq,
  fnSuccess,
  fnError,
} = require("../TestUtils");

describe("TestUtils", () => {
  test("fnSuccessReq", () => {
    const mock = {
      get: fnSuccessReq("success"),
    };
    expect(mock.get().promise()).resolves.toBe("success");
  });

  test("fnErrorReq", () => {
    const mock = {
      get: fnErrorReq(new Error("error")),
    };
    expect(mock.get().promise()).rejects.toThrow("error");
  });

  test("fnSuccess", () => {
    const mock = {
      promise: fnSuccess("success"),
    };
    expect(mock.promise()).resolves.toBe("success");
  });

  test("fnError", () => {
    const mock = {
      promise: fnError(new Error("error")),
    };
    expect(mock.promise()).rejects.toThrow("error");
  });
});
