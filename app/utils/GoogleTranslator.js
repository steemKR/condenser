export default function ({ text, to }) {

  return fetch('/api/v1/translation', {
    method: 'post',
    mode: 'no-cors',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json'
    },
    body: JSON.stringify({ text, to })
  }).then(r => r.json());
}
