/**
 * Environment Configuration Validator
 * 
 * Validates that all required environment variables are set
 * before starting the application in production.
 * 
 * Usage: node scripts/validate-env.js
 * 
 * Will exit with code 1 if any required variables are missing.
 */

const chalk = require('chalk') || { red: (s) => s, green: (s) => s, yellow: (s) => s, cyan: (s) => s };

// Configuration for environment validation
const ENV_CONFIG = {
    // Required in ALL environments
    required: [
        {
            name: 'JWT_SECRET',
            minLength: 32,
            description: 'JWT secret for token signing',
            securityLevel: 'critical'
        }
    ],

    // Required only in production
    productionRequired: [
        {
            name: 'ALLOWED_ORIGINS',
            description: 'Allowed CORS origins (comma-separated)',
            validator: (value) => !value.includes('localhost') && !value.includes('*'),
            validatorMessage: 'Should not contain localhost or wildcards in production'
        },
        {
            name: 'SESSION_SECRET',
            minLength: 32,
            description: 'Session secret for cookies',
            securityLevel: 'critical'
        }
    ],

    // Recommended but not required
    recommended: [
        { name: 'LOG_LEVEL', default: 'warn', description: 'Logging level' },
        { name: 'RATE_LIMIT_WINDOW_MS', default: '900000', description: 'Rate limit window' },
        { name: 'RATE_LIMIT_MAX_REQUESTS', default: '100', description: 'Max requests per window' }
    ],

    // Security checks
    securityChecks: [
        {
            check: () => process.env.CSRF_COOKIE_SECURE === 'true',
            message: 'CSRF_COOKIE_SECURE should be true in production',
            level: 'warning'
        },
        {
            check: () => {
                const secret = process.env.JWT_SECRET || '';
                return secret.length >= 32 && !/^(your|change|secret|password)/i.test(secret);
            },
            message: 'JWT_SECRET appears to be a placeholder or too short',
            level: 'critical'
        },
        {
            check: () => {
                const origins = process.env.ALLOWED_ORIGINS || '';
                return !origins.includes('http://localhost');
            },
            message: 'ALLOWED_ORIGINS contains localhost (should use https in production)',
            level: 'warning'
        }
    ]
};

function validateEnvironment() {
    const isProd = process.env.NODE_ENV === 'production';
    const errors = [];
    const warnings = [];

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║          Environment Configuration Validator              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log(`Environment: ${isProd ? 'PRODUCTION' : process.env.NODE_ENV || 'development'}\n`);

    // Check required variables
    console.log('📋 Checking required variables...\n');

    for (const config of ENV_CONFIG.required) {
        const value = process.env[config.name];

        if (!value) {
            errors.push(`❌ ${config.name} is required but not set`);
        } else if (config.minLength && value.length < config.minLength) {
            errors.push(`❌ ${config.name} must be at least ${config.minLength} characters`);
        } else {
            console.log(`  ✓ ${config.name} is set`);
        }
    }

    // Check production-required variables
    if (isProd) {
        console.log('\n📋 Checking production-required variables...\n');

        for (const config of ENV_CONFIG.productionRequired) {
            const value = process.env[config.name];

            if (!value) {
                errors.push(`❌ ${config.name} is required in production but not set`);
            } else if (config.validator && !config.validator(value)) {
                errors.push(`❌ ${config.name}: ${config.validatorMessage}`);
            } else if (config.minLength && value.length < config.minLength) {
                errors.push(`❌ ${config.name} must be at least ${config.minLength} characters`);
            } else {
                console.log(`  ✓ ${config.name} is set`);
            }
        }

        // Run security checks
        console.log('\n🔒 Running security checks...\n');

        for (const check of ENV_CONFIG.securityChecks) {
            if (!check.check()) {
                if (check.level === 'critical') {
                    errors.push(`❌ SECURITY: ${check.message}`);
                } else {
                    warnings.push(`⚠️  ${check.message}`);
                }
            } else {
                console.log(`  ✓ ${check.message.split(' ')[0]}... OK`);
            }
        }
    }

    // Check recommended variables
    console.log('\n📋 Checking recommended variables...\n');

    for (const config of ENV_CONFIG.recommended) {
        const value = process.env[config.name];

        if (!value) {
            warnings.push(`⚠️  ${config.name} is not set (default: ${config.default})`);
        } else {
            console.log(`  ✓ ${config.name} = ${value}`);
        }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════\n');

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:\n');
        warnings.forEach(w => console.log(`   ${w}`));
        console.log('');
    }

    if (errors.length > 0) {
        console.log('❌ ERRORS:\n');
        errors.forEach(e => console.log(`   ${e}`));
        console.log('\n❌ Environment validation FAILED\n');
        console.log('Please fix the errors above before starting in production.\n');
        process.exit(1);
    } else {
        console.log('✅ Environment validation PASSED\n');
    }
}

// Helper to generate secrets
function generateSecrets() {
    const crypto = require('crypto');

    console.log('\n🔐 Generated Secrets:\n');
    console.log(`JWT_SECRET=${crypto.randomBytes(32).toString('base64')}`);
    console.log(`SESSION_SECRET=${crypto.randomBytes(32).toString('base64')}`);
    console.log(`\n💡 Add these to your .env or secret store.\n`);
}

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--generate-secrets')) {
    generateSecrets();
} else {
    validateEnvironment();
}
