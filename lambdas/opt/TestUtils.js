const fnSuccessReq = (resp) =>
  jest.fn(() => ({
    promise: () =>
      new Promise((resolve) => setTimeout(() => resolve(resp), 100)),
  }));

const fnErrorReq = (err) =>
  jest.fn(() => ({
    promise: () =>
      new Promise((_, reject) => setTimeout(() => reject(err), 100)),
  }));

const fnSuccess = (resp) =>
  jest.fn(() => new Promise((resolve) => setTimeout(() => resolve(resp), 100)));

const fnError = (err) =>
  jest.fn(() => new Promise((_, reject) => setTimeout(() => reject(err), 100)));

module.exports = {
  fnSuccessReq,
  fnErrorReq,
  fnSuccess,
  fnError,
};
