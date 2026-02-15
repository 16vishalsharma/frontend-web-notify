export interface IBloggerLoginData {
  email: string;
  password: string;
}

export interface IAuthState {
  isLoggedIn: boolean;
  bloggerName: string | null;
  bloggerEmail: string | null;
  bloggerId: string | null;
}
