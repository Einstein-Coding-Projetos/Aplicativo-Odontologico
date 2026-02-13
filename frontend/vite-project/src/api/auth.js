import api from "./axios";

export function login(data) {
  return api.post("accounts/login", data);
}
