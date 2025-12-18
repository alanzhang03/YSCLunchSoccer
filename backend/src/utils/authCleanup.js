import 'dotenv/config';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../lib/supabase.js';

export async function listAuthUsers() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return null;
    }

    return data.users;
  } catch (error) {
    console.error('Error listing users:', error);
    return null;
  }
}

export async function findAuthUserByEmail(email) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error finding user:', error);
      return null;
    }

    const user = data.users.find((u) => u.email === email);
    return user || null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

export async function deleteAuthUserByEmail(email) {
  try {
    const user = await findAuthUserByEmail(email);

    if (!user) {
      console.log(`User with email ${email} not found in Supabase Auth`);
      return { success: false, message: 'User not found' };
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }

    console.log(`Successfully deleted user ${email} from Supabase Auth`);
    return { success: true, message: `User ${email} deleted successfully` };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAuthUserById(userId) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }

    console.log(`Successfully deleted user ${userId} from Supabase Auth`);
    return { success: true, message: `User ${userId} deleted successfully` };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

if (process.argv[1] && process.argv[1].includes('authCleanup.js')) {
  const command = process.argv[2];
  const email = process.argv[3];

  if (command === 'list') {
    console.log('Listing all users in Supabase Auth...\n');
    listAuthUsers().then((users) => {
      if (users) {
        console.log(`Found ${users.length} users:\n`);
        users.forEach((user) => {
          console.log(`- ${user.email} (ID: ${user.id})`);
        });
      }
    });
  } else if (command === 'find' && email) {
    console.log(`Finding user with email: ${email}...\n`);
    findAuthUserByEmail(email).then((user) => {
      if (user) {
        console.log('User found:');
        console.log(`  Email: ${user.email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Created: ${user.created_at}`);
      } else {
        console.log('User not found in Supabase Auth');
      }
    });
  } else if (command === 'delete' && email) {
    console.log(`Deleting user with email: ${email}...\n`);
    deleteAuthUserByEmail(email).then((result) => {
      if (result.success) {
        console.log(`✓ ${result.message}`);
      } else {
        console.log(`✗ Error: ${result.error || result.message}`);
      }
    });
  } else {
    console.log('Usage:');
    console.log(
      '  node src/utils/authCleanup.js list                    - List all users'
    );
    console.log(
      '  node src/utils/authCleanup.js find <email>            - Find user by email'
    );
    console.log(
      '  node src/utils/authCleanup.js delete <email>          - Delete user by email'
    );
  }
}
