export const buildRequestUrl = (baseUrl, searchParams = {}) => {
    if(!searchParams || Object.keys(searchParams).length === 0) return baseUrl;
    const query = Object.entries(searchParams)
     .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
     .join('&');
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}`;
};

export const removeCustomKeys = (options = {}) => {
    const requestOptions = {};
    for (const key in options) {
        if(key === 'search' || key === 'headers') continue;
        requestOptions[key] = options[key];
    }
    return requestOptions;
};

export const extractHeaders = (options = {}, addAcceptAndContentTypeJSON = true) => {
  const { headers = {} } = options;
  if (!addAcceptAndContentTypeJSON) return headers;

  const keys = Object.keys(headers).map(key => key.toLowerCase());
  const newHeaders = { ...headers };

  if (!keys.includes('accept')) {
    newHeaders['Accept'] = 'application/json';
  }
  if (!keys.includes('content-type') && typeof options.body === 'string') {
    newHeaders['Content-Type'] = 'application/json';
  }
  return newHeaders;
};