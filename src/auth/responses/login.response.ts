export class LoginResponse {
  message: string;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}
