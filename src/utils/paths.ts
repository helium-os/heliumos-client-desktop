import { Env, getEnv } from '@/utils/utils';

const env = getEnv();

const origin = env === Env.Prod ? '' : 'https://heliumos-user-web.testinner.easypayx.com';

export const loginPath = `${origin}/user/login`;

export const registerPath = `${origin}/user/register`;

export const heliumOSAdminPath = `${origin}/page/index`;
