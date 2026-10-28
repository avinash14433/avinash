import 'dotenv/config';

// Defaults are the public Sauce Demo practice values; override any of them via .env or CI variables.
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  password: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
};

export const users = {
  standard: process.env.STANDARD_USER ?? 'standard_user',
  lockedOut: process.env.LOCKED_OUT_USER ?? 'locked_out_user',
  problem: process.env.PROBLEM_USER ?? 'problem_user',
};
