class ResponseAction {
  constructor(statusCode, action, payload) {
    this.statusCode = statusCode;
    this.body = JSON.stringify({
      action,
      payload,
    });
  }
}

module.exports = ResponseAction;
