const baseUrl = 'https://dev.ext-api.scaffoldeth.xyz/app'

export function apiRequest({path, method = 'GET', data, accessToken}) {
  return fetch(`${baseUrl}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.json())
}
