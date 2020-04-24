const fnSuccessReq = (resp) =>
  jest.fn(() => ({
    promise: async () => resp,
  }));

const fnErrorReq = (err) =>
  jest.fn(() => ({
    promise: async () => {
      throw err;
    },
  }));

const fnSuccess = (resp) => jest.fn(async () => resp);

const fnError = (err) =>
  jest.fn(async () => {
    throw err;
  });

module.exports = {
  fnSuccessReq,
  fnErrorReq,
  fnSuccess,
  fnError,
};
