#!/usr/bin/env node

/**
 * Load Testing Script for Signup Endpoint
 *
 * Simulates multiple concurrent user signups to test your application's performance.
 *
 * Usage:
 *   node load-test-signup.js [options]
 *
 * Options:
 *   --users <number>     Number of users to create (default: 10)
 *   --concurrent <number> Number of concurrent requests (default: 5)
 *   --url <url>          API base URL (default: http://localhost:5001)
 *   --delay <ms>         Delay between batches in milliseconds (default: 100)
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5001';
const DEFAULT_USERS = 10;
const DEFAULT_CONCURRENT = 5;
const DEFAULT_DELAY = 100;

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    users: DEFAULT_USERS,
    concurrent: DEFAULT_CONCURRENT,
    url: API_BASE_URL,
    delay: DEFAULT_DELAY,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--users' && args[i + 1]) {
      config.users = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--concurrent' && args[i + 1]) {
      config.concurrent = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--url' && args[i + 1]) {
      config.url = args[i + 1];
      i++;
    } else if (arg === '--delay' && args[i + 1]) {
      config.delay = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Load Testing Script for Signup Endpoint

Usage:
  node load-test-signup.js [options]

Options:
  --users <number>       Number of users to create (default: ${DEFAULT_USERS})
  --concurrent <number>  Number of concurrent requests (default: ${DEFAULT_CONCURRENT})
  --url <url>            API base URL (default: ${API_BASE_URL})
  --delay <ms>           Delay between batches in milliseconds (default: ${DEFAULT_DELAY})
  --help, -h             Show this help message

Examples:
  node load-test-signup.js --users 50 --concurrent 10
  node load-test-signup.js --users 100 --concurrent 20 --url http://localhost:5001
      `);
      process.exit(0);
    }
  }

  return config;
}

function generateUserData(index) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);

  return {
    name: `Test User ${index}`,
    email: `testuser${timestamp}-${random}-${index}@example.com`,
    phoneNum: `555-${String(Math.floor(Math.random() * 10000)).padStart(
      4,
      '0'
    )}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    password: `TestPassword${index}!`,
    skill: Math.floor(Math.random() * 10) + 1,
  };
}

async function signupUser(url, userData, index) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${url}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        index,
        duration,
        status: response.status,
        user: data.user?.email || userData.email,
      };
    } else {
      return {
        success: false,
        index,
        duration,
        status: response.status,
        error: data.error || 'Unknown error',
        email: userData.email,
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      index,
      duration,
      status: 0,
      error: error.message,
      email: userData.email,
    };
  }
}

async function processBatch(url, batch, batchNumber) {
  console.log(
    `\n📦 Processing batch ${batchNumber} (${batch.length} users)...`
  );

  const promises = batch.map((userData, index) =>
    signupUser(url, userData, batchNumber * batch.length + index)
  );

  const results = await Promise.all(promises);
  return results;
}

async function main() {
  const config = parseArgs();

  console.log('\n🚀 Starting Load Test for Signup Endpoint');
  console.log('='.repeat(50));
  console.log(`📊 Configuration:`);
  console.log(`   Total users: ${config.users}`);
  console.log(`   Concurrent requests: ${config.concurrent}`);
  console.log(`   API URL: ${config.url}`);
  console.log(`   Delay between batches: ${config.delay}ms`);
  console.log('='.repeat(50));

  const users = Array.from({ length: config.users }, (_, i) =>
    generateUserData(i + 1)
  );

  const batches = [];
  for (let i = 0; i < users.length; i += config.concurrent) {
    batches.push(users.slice(i, i + config.concurrent));
  }

  const allResults = [];
  const startTime = Date.now();

  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(config.url, batches[i], i);
    allResults.push(...batchResults);

    if (i < batches.length - 1 && config.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, config.delay));
    }
  }

  const totalTime = Date.now() - startTime;

  const successful = allResults.filter((r) => r.success);
  const failed = allResults.filter((r) => !r.success);
  const durations = allResults.map((r) => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  const errorGroups = {};
  failed.forEach((result) => {
    const key = result.error || `Status ${result.status}`;
    errorGroups[key] = (errorGroups[key] || 0) + 1;
  });

  console.log('\n' + '='.repeat(50));
  console.log('📈 Results Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successful.length}/${config.users}`);
  console.log(`❌ Failed: ${failed.length}/${config.users}`);
  console.log(`⏱️  Total time: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`📊 Average response time: ${avgDuration.toFixed(2)}ms`);
  console.log(`⚡ Fastest response: ${minDuration}ms`);
  console.log(`🐌 Slowest response: ${maxDuration}ms`);
  console.log(
    `🚀 Throughput: ${((config.users / totalTime) * 1000).toFixed(
      2
    )} requests/second`
  );

  if (failed.length > 0) {
    console.log('\n❌ Error Breakdown:');
    Object.entries(errorGroups).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`);
    });

    console.log('\n📋 Failed Requests (first 10):');
    failed.slice(0, 10).forEach((result) => {
      console.log(
        `   User ${result.index + 1} (${result.email}): ${
          result.error || `Status ${result.status}`
        }`
      );
    });
  }

  if (successful.length > 0) {
    console.log('\n✅ Sample Successful Signups (first 5):');
    successful.slice(0, 5).forEach((result) => {
      console.log(
        `   User ${result.index + 1}: ${result.user} (${result.duration}ms)`
      );
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Load test completed!');
  console.log('='.repeat(50) + '\n');

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
