#!/usr/bin/env node

/**
 * Test script for Break Deletion mutations
 * 
 * This script tests:
 * 1. Loading all breaks
 * 2. Deleting a single break
 * 3. Deleting all breaks
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Read cookies from cookies.txt
const cookiesPath = path.join(__dirname, 'cookies.txt');
let cookieHeader = '';

if (fs.existsSync(cookiesPath)) {
  cookieHeader = fs.readFileSync(cookiesPath, 'utf-8').trim();
  console.log('Using cookies from cookies.txt\n');
}

const API_URL = 'http://localhost:3000/api/graphql';

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

async function makeGraphQLRequest(query, variables = {}) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      log('GraphQL Errors:', 'red');
      result.errors.forEach((error) => {
        console.error(`  - ${error.message}`);
        if (error.extensions) {
          console.error('    Code:', error.extensions.code);
          if (error.extensions.code === 'INTERNAL_SERVER_ERROR') {
            log('\n  ⚠ Internal Server Error Details:', 'yellow');
            console.log('    This usually indicates:');
            console.log('    • Database constraint violation');
            console.log('    • Foreign key constraint blocking deletion');
            console.log('    • Backend validation error');
            console.log('    • Check your backend/server logs for more details');
          }
          if (Object.keys(error.extensions).length > 1) {
            console.error('    Full extensions:', JSON.stringify(error.extensions, null, 2));
          }
        }
        if (error.path) {
          console.error('    Path:', error.path.join(' → '));
        }
      });
      return null;
    }

    return result.data;
  } catch (error) {
    log(`Request failed: ${error.message}`, 'red');
    return null;
  }
}

// Test 1: Load all breaks
async function testLoadBreaks() {
  logSection('Test 1: Load All Breaks');

  const query = `
    query GetAllDayTemplateBreaks {
      getAllDayTemplateBreaks {
        id
        dayTemplateId
        dayTemplate {
          id
          dayOfWeek
        }
        name
        type
        afterPeriod
        durationMinutes
        icon
        color
        applyToAllDays
      }
    }
  `;

  const data = await makeGraphQLRequest(query);

  if (data?.getAllDayTemplateBreaks) {
    const breaks = data.getAllDayTemplateBreaks;
    const validBreaks = breaks.filter(b => b.dayTemplateId || b.dayTemplate);
    const orphanedBreaks = breaks.filter(b => !b.dayTemplateId && !b.dayTemplate);
    
    log(`✓ Found ${breaks.length} break(s)`, 'green');
    
    if (validBreaks.length > 0) {
      console.log(`\n  ${validBreaks.length} Valid Breaks (can be deleted):`);
      validBreaks.forEach((breakItem, idx) => {
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = breakItem.dayTemplate ? dayNames[breakItem.dayTemplate.dayOfWeek] : 'N/A';
        
        console.log(`\n  ${idx + 1}. ${breakItem.name || breakItem.type} ✓`);
        console.log(`     ID: ${breakItem.id}`);
        console.log(`     Day Template ID: ${breakItem.dayTemplateId || breakItem.dayTemplate?.id || 'N/A'}`);
        console.log(`     Day: ${dayName}`);
        console.log(`     Type: ${breakItem.type}`);
        console.log(`     Duration: ${breakItem.durationMinutes} minutes`);
        console.log(`     After Period: ${breakItem.afterPeriod}`);
        if (breakItem.applyToAllDays) {
          console.log(`     Applies to all days: Yes`);
        }
      });
    }
    
    if (orphanedBreaks.length > 0) {
      log(`\n  ⚠ ${orphanedBreaks.length} Orphaned Breaks (NOT associated with day template):`, 'yellow');
      orphanedBreaks.forEach((breakItem, idx) => {
        console.log(`\n  ${idx + 1}. ${breakItem.name || breakItem.type} ⚠`);
        console.log(`     ID: ${breakItem.id}`);
        console.log(`     Type: ${breakItem.type}`);
        console.log(`     Duration: ${breakItem.durationMinutes} minutes`);
        console.log(`     Status: Cannot be deleted (no day template association)`);
      });
      
      log('\n  💡 These breaks need to be fixed or deleted directly from the database', 'yellow');
    }
    
    return breaks;
  } else {
    log('✗ Failed to load breaks', 'red');
    return null;
  }
}

// Test 2: Delete a single break
async function testDeleteBreak(breakId) {
  logSection(`Test 2: Delete Single Break (${breakId})`);

  const mutation = `
    mutation DeleteDayTemplateBreak($id: ID!) {
      deleteDayTemplateBreak(id: $id) {
        success
        message
      }
    }
  `;

  log(`Deleting break with ID: ${breakId}`, 'yellow');

  const data = await makeGraphQLRequest(mutation, { id: breakId });

  if (data?.deleteDayTemplateBreak) {
    const result = data.deleteDayTemplateBreak;
    
    if (result.success) {
      log('✓ Break deleted successfully', 'green');
      console.log(`  Message: ${result.message}`);
    } else {
      log('✗ Break deletion failed', 'red');
      console.log(`  Message: ${result.message}`);
    }
    
    return result;
  } else {
    log('✗ Failed to delete break', 'red');
    log('\n💡 Common causes:', 'yellow');
    console.log('  1. Break is orphaned (no day template association)');
    console.log('  2. Database constraints prevent deletion');
    console.log('  3. Related records exist that block deletion');
    console.log('  4. Server-side error (check backend logs)');
    console.log('\n  Run with --verbose to see full error details');
    return null;
  }
}

// Test 3: Delete all breaks
async function testDeleteAllBreaks() {
  logSection('Test 3: Delete All Breaks');

  const mutation = `
    mutation DeleteAllTimetableBreaks {
      deleteAllTimetableBreaks
    }
  `;

  log('Deleting all breaks...', 'yellow');

  const data = await makeGraphQLRequest(mutation);

  if (data?.deleteAllTimetableBreaks !== undefined) {
    const result = data.deleteAllTimetableBreaks;
    
    if (result) {
      log('✓ All breaks deleted successfully', 'green');
    } else {
      log('✗ Failed to delete all breaks', 'red');
    }
    
    return result;
  } else {
    log('✗ Failed to delete all breaks', 'red');
    return null;
  }
}

// Main execution
async function main() {
  log('Starting Break Deletion Tests', 'bright');
  log('API URL: ' + API_URL, 'blue');

  // Test 1: Load all breaks
  const breaks = await testLoadBreaks();
  
  if (!breaks || breaks.length === 0) {
    log('\n⚠ No breaks found. Cannot test deletion.', 'yellow');
    log('Create some breaks first using the createBreak mutation.', 'yellow');
    return;
  }

  // Test 2: Delete a single break (if ID provided via command line)
  const breakIdArg = process.argv.find(arg => arg.startsWith('--id='));
  if (breakIdArg) {
    const breakId = breakIdArg.split('=')[1];
    
    // Check if this break has a day template association
    const breakToDelete = breaks.find(b => b.id === breakId);
    if (!breakToDelete) {
      log(`\n✗ Break with ID ${breakId} not found`, 'red');
    } else if (!breakToDelete.dayTemplateId && !breakToDelete.dayTemplate) {
      log(`\n✗ Cannot delete break "${breakToDelete.name || breakToDelete.type}"`, 'red');
      log('This break is not associated with a day template.', 'yellow');
      log('It needs to be deleted directly from the database or fixed first.', 'yellow');
    } else {
      await testDeleteBreak(breakId);
      
      // Show remaining breaks
      log('\nReloading breaks to verify deletion...', 'blue');
      await testLoadBreaks();
    }
  } else if (breaks.length > 0) {
    const validBreak = breaks.find(b => b.dayTemplateId || b.dayTemplate);
    if (validBreak) {
      log('\n💡 To delete a specific break, run:', 'blue');
      console.log(`   node test-break-deletion.js --id=${validBreak.id}`);
    }
  }

  // Test 3: Delete all breaks (only if --delete-all flag is provided)
  const shouldDeleteAll = process.argv.includes('--delete-all');
  if (shouldDeleteAll) {
    log('\n⚠ WARNING: This will delete ALL breaks!', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    await testDeleteAllBreaks();
    
    // Verify all breaks deleted
    log('\nVerifying all breaks deleted...', 'blue');
    await testLoadBreaks();
  } else {
    log('\n💡 To delete all breaks, run:', 'blue');
    console.log('   node test-break-deletion.js --delete-all');
  }

  logSection('All Tests Complete');
  log('Usage:', 'blue');
  console.log('  node test-break-deletion.js                    # List all breaks');
  console.log('  node test-break-deletion.js --id=<break-id>    # Delete specific break');
  console.log('  node test-break-deletion.js --delete-all       # Delete all breaks (CAUTION!)');
}

main().catch((error) => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});

