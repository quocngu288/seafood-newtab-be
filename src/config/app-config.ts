import { ConfigService } from '@nestjs/config';

const DEV_JWT_SECRET = 'seafood-dev-secret';
const DEV_ADMIN_USERNAME = 'admin';
const DEV_ADMIN_PASSWORD = 'admin123';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Railway MongoDB plugin exposes MONGO_URL; we also accept MONGODB_URI */
export function resolveMongoUri(configService: ConfigService): string {
  return (
    configService.get<string>('MONGODB_URI') ??
    configService.get<string>('MONGO_URL') ??
    'mongodb://127.0.0.1:27017/seafood'
  );
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

  const mongoUri = resolveMongoUri(configService);
  const required = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
  const missing = required.filter((key) => !configService.get<string>(key));

  if (!mongoUri || mongoUri.includes('127.0.0.1')) {
    missing.push('MONGODB_URI (or MONGO_URL)');
  }

  const apiPublicUrl = configService.get<string>('API_PUBLIC_URL')?.trim();
  if (!apiPublicUrl || !apiPublicUrl.startsWith('https://')) {
    missing.push('API_PUBLIC_URL (https://your-backend.up.railway.app)');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required env in production: ${missing.join(', ')}`);
  }
}
