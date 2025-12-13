#!/usr/bin/env node

/**
 * Cleanup Script for Test Users
 *
 * Deletes test users created by the load testing script from both
 * the database and Supabase Auth.
 *
 * Usage:
 *   node cleanup-test-users.js [options]
 *
 * Options:
 *   --pattern <pattern>  Email pattern to match (default: @example.com)
 *   --name <pattern>     Name pattern to match (default: Test User)
 *   --dry-run           Show what would be deleted without actually deleting
 *   --confirm            Skip confirmation prompt
 *   --help, -h           Show this help message
 */

import 'dotenv/config';
import prisma from './src/db/client.js';
import { supabaseAdmin } from './src/lib/supabase.js';

const DEFAULT_EMAIL_PATTERN = '@example.com';
const DEFAULT_NAME_PATTERN = 'Test User';

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    emailPattern: DEFAULT_EMAIL_PATTERN,
    namePattern: DEFAULT_NAME_PATTERN,
    dryRun: false,
    confirm: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--pattern' && args[i + 1]) {
      config.emailPattern = args[i + 1];
      i++;
    } else if (arg === '--name' && args[i + 1]) {
      config.namePattern = args[i + 1];
      i++;
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--confirm') {
      config.confirm = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Cleanup Script for Test Users

Usage:
  node cleanup-test-users.js [options]

Options:
  --pattern <pattern>    Email pattern to match (default: ${DEFAULT_EMAIL_PATTERN})
  --name <pattern>       Name pattern to match (default: ${DEFAULT_NAME_PATTERN})
  --dry-run             Show what would be deleted without actually deleting
  --confirm              Skip confirmation prompt
  --help, -h             Show this help message

Examples:
  node cleanup-test-users.js --dry-run
  node cleanup-test-users.js --pattern @example.com --confirm
  node cleanup-test-users.js --name "Test User" --dry-run
      `);
      process.exit(0);
    }
  }

  return config;
}

async function findTestUsers(emailPattern, namePattern) {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: emailPattern } },
          { name: { contains: namePattern } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        supabaseUserId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  } catch (error) {
    console.error('❌ Error finding test users:', error);
    throw error;
  }
}

async function deleteFromSupabaseAuth(supabaseUserId) {
  if (!supabaseUserId) {
    return { success: true, skipped: true };
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteFromDatabase(userId) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteUser(user) {
  const results = {
    email: user.email,
    name: user.name,
    db: null,
    supabase: null,
  };

  if (user.supabaseUserId) {
    results.supabase = await deleteFromSupabaseAuth(user.supabaseUserId);
  } else {
    results.supabase = { success: true, skipped: true };
  }

  results.db = await deleteFromDatabase(user.id);

  return results;
}

async function main() {
  const config = parseArgs();

  console.log('\n🧹 Test User Cleanup Script');
  console.log('='.repeat(50));
  console.log(`📊 Configuration:`);
  console.log(`   Email pattern: ${config.emailPattern}`);
  console.log(`   Name pattern: ${config.namePattern}`);
  console.log(`   Dry run: ${config.dryRun ? 'Yes' : 'No'}`);
  console.log('='.repeat(50));

  try {
    console.log('\n🔍 Searching for test users...');
    const testUsers = await findTestUsers(
      config.emailPattern,
      config.namePattern
    );

    if (testUsers.length === 0) {
      console.log('✅ No test users found matching the criteria.');
      return;
    }

    console.log(`\n📋 Found ${testUsers.length} test user(s):`);
    testUsers.slice(0, 10).forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.name} (${
          user.email
        }) - Created: ${user.createdAt.toISOString()}`
      );
    });
    if (testUsers.length > 10) {
      console.log(`   ... and ${testUsers.length - 10} more`);
    }

    if (!config.dryRun && !config.confirm) {
      console.log(
        `\n⚠️  This will delete ${testUsers.length} user(s) from both the database and Supabase Auth.`
      );
      console.log('   This action cannot be undone!');
      console.log('\n   Run with --dry-run to preview what would be deleted.');
      console.log('   Run with --confirm to skip this prompt.\n');

      console.log('   To proceed, run: node cleanup-test-users.js --confirm');
      return;
    }

    if (config.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No users will be deleted');
      console.log('='.repeat(50));
      return;
    }

    console.log(`\n🗑️  Deleting ${testUsers.length} user(s)...`);
    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const user of testUsers) {
      const result = await deleteUser(user);
      results.push(result);

      if (result.db.success && result.supabase.success) {
        successCount++;
        if (testUsers.length <= 20) {
          console.log(`   ✅ Deleted: ${user.email}`);
        }
      } else {
        failCount++;
        console.log(`   ❌ Failed: ${user.email}`);
        if (result.db.error) {
          console.log(`      DB Error: ${result.db.error}`);
        }
        if (result.supabase.error) {
          console.log(`      Supabase Error: ${result.supabase.error}`);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Cleanup Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successfully deleted: ${successCount}/${testUsers.length}`);
    console.log(`❌ Failed: ${failCount}/${testUsers.length}`);

    if (failCount > 0) {
      console.log('\n❌ Failed Deletions:');
      results
        .filter(
          (r) => !r.db.success || (r.supabase.error && !r.supabase.skipped)
        )
        .forEach((r) => {
          console.log(`   ${r.email}`);
          if (r.db.error) console.log(`      DB: ${r.db.error}`);
          if (r.supabase.error)
            console.log(`      Supabase: ${r.supabase.error}`);
        });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Cleanup completed!');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
