import { ConfigService } from '@nestjs/config';

const DEV_JWT_SECRET = 'seafood-dev-secret';
const DEV_ADMIN_USERNAME = 'admin';
const DEV_ADMIN_PASSWORD = 'admin123';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (secret) return secret;

  if (isProduction()) {
    throw new Error('JWT_SECRET is required in production');
  }

  return DEV_JWT_SECRET;
}

export function getAdminCredentials(configService: ConfigService): {
  username: string;
  password: string;
} {
  const username =
    configService.get<string>('ADMIN_USERNAME') ??
    (isProduction() ? undefined : DEV_ADMIN_USERNAME);
  const password =
    configService.get<string>('ADMIN_PASSWORD') ??
    (isProduction() ? undefined : DEV_ADMIN_PASSWORD);

  if (!username || !password) {
    throw new Error(
      'ADMIN_USERNAME and ADMIN_PASSWORD are required in production',
    );
  }

  return { username, password };
}

export function validateProductionEnv(configService: ConfigService): void {
  if (!isProduction()) return;

  const required = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'MONGODB_URI'];
  const missing = required.filter((key) => !configService.get<string>(key));

  if (missing.length > 0) {
    throw new Error(`Missing required env in production: ${missing.join(', ')}`);
  }
}
