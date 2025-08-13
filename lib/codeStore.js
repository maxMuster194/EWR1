// lib/codes.js
let codes = {};

export function setCode(email, code) {
  codes[email] = code;
}

export function getCode(email) {
  return codes[email];
}

export function clearCode(email) {
  delete codes[email];
}
0