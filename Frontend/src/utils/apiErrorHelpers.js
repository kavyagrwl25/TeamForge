export const RATE_LIMIT_MESSAGE =
  "Too many requests. Please try again later.";
export const LOGIN_RATE_LIMIT_MESSAGE =
  "Too many login attempts. Please wait and try again.";

export const NOT_FOUND_MESSAGE = "We couldn't find what you were looking for.";

export const UNAUTHORIZED_MESSAGE =
  "Your session has expired. Please log in again.";
export const INVALID_LOGIN_MESSAGE = "Invalid email or password";

export const isRateLimitError = (error) => {
  return Boolean(error?.response && error.response.status === 429);
};

export const normalizeApiError = (error, options = {}) => {
  if (!error?.response) {
    return error;
  }

  const { status } = error.response;

  if (isRateLimitError(error)) {
    error.userMessage = RATE_LIMIT_MESSAGE;
    error.response.data = {
      ...(error.response.data ?? {}),
      message: RATE_LIMIT_MESSAGE,
    };

    return error;
  }

  if (status === 404) {
    error.userMessage = NOT_FOUND_MESSAGE;
    return error;
  }

  if (status === 401 && options.unauthorizedMessage) {
    error.userMessage = options.unauthorizedMessage;
  }

  return error;
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (error?.userMessage) {
    return error.userMessage;
  }

  if (isRateLimitError(error)) {
    return RATE_LIMIT_MESSAGE;
  }

  return error?.response?.data?.message || error?.message || fallback;
};

export const getLoginErrorMessage = (
  error,
  fallback = "Login failed. Please try again."
) => {
  const status = error?.response?.status;

  if (status === 401) {
    return INVALID_LOGIN_MESSAGE;
  }

  if (status === 429) {
    return LOGIN_RATE_LIMIT_MESSAGE;
  }

  if (status === 400) {
    return error?.response?.data?.message || fallback;
  }

  return getApiErrorMessage(error, fallback);
};

export const shouldNotifyGlobalApiError = (error, options = {}) => {
  const status = error?.response?.status;
  const { suppressNotification = false } = options;

  if (suppressNotification) {
    return false;
  }

  return status === 404 || status === 429;
};
