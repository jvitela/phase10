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

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeOneOf(received, items) {
    const pass = items.includes(received);
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be one of (${items.join(", ")})`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be one of (${items.join(", ")})`,
        pass: false,
      };
    }
  },
});

beforeEach(() => {
  console.info("Before each...");
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
  console.info.mockRestore();
  console.log.mockRestore();
  console.info("after each...");
});

module.exports = {
  fnSuccessReq,
  fnErrorReq,
  fnSuccess,
  fnError,
};
