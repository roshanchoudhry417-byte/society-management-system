/**
 * Standardized API response wrapper.
 * Ensures all API responses follow a consistent format.
 */
class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  /**
   * Send the response via Express res object.
   */
  send(res) {
    const body = {
      success: this.success,
      message: this.message,
    };
    if (this.data !== null && this.data !== undefined) body.data = this.data;
    if (this.meta) body.meta = this.meta;
    return res.status(this.statusCode).json(body);
  }
}

module.exports = ApiResponse;
