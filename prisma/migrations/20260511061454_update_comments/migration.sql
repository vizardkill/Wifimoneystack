-- Prisma Database Comments Generator v1.7.0

-- users comments
COMMENT ON TABLE "users" IS 'Usuario registrado en el marketplace';

-- user_auth_providers comments
COMMENT ON TABLE "user_auth_providers" IS 'Proveedor de autenticación del usuario (JWT, Google, etc.)';

-- password_reset_tokens comments
COMMENT ON TABLE "password_reset_tokens" IS 'Token para reseteo de contraseña';

-- email_verification_tokens comments
COMMENT ON TABLE "email_verification_tokens" IS 'Token de verificación de correo electrónico';

-- countries comments
COMMENT ON TABLE "countries" IS 'País con código ISO (para selector de auth)';
