#!/usr/bin/env node

/**
 * Test script for Week Template queries and mutations
 * 
 * This script tests:
 * 1. Loading week templates (basic)
 * 2. Loading week templates (with full details)
 * 3. Updating a week template
 * 4. Rebuilding week template periods
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
          console.error('    Extensions:', JSON.stringify(error.extensions, null, 2));
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

// Test 1: Load week templates (basic)
async function testLoadWeekTemplatesBasic() {
  logSection('Test 1: Load Week Templates (Basic)');

  const query = `
    query GetWeekTemplates($input: GetWeekTemplatesInput!) {
      getWeekTemplates(input: $input) {
        id
        name
        numberOfDays
        termId
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    input: { includeDetails: false }
  });

  if (data?.getWeekTemplates) {
    log(`✓ Found ${data.getWeekTemplates.length} week template(s)`, 'green');
    data.getWeekTemplates.forEach((template) => {
      console.log(`\n  Template: ${template.name}`);
      console.log(`    ID: ${template.id}`);
      console.log(`    Days: ${template.numberOfDays}`);
      if (template.termId) {
        console.log(`    Term ID: ${template.termId}`);
      } else {
        console.log(`    Term ID: None (not associated with a term)`);
      }
    });
    return data.getWeekTemplates;
  } else {
    log('✗ Failed to load week templates', 'red');
    return null;
  }
}

// Test 2: Load week templates (with full details)
async function testLoadWeekTemplatesDetails() {
  logSection('Test 2: Load Week Templates (Full Details)');

  const query = `
    query GetWeekTemplates($input: GetWeekTemplatesInput!) {
      getWeekTemplates(input: $input) {
        id
        name
        numberOfDays
        termId
        dayTemplates {
          id
          dayOfWeek
          startTime
          periodCount
          gradeLevels {
            id
            name
          }
          streams {
            id
            stream {
              name
            }
          }
          periods {
            id
            periodNumber
            startTime
            endTime
          }
        }
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    input: { includeDetails: true }
  });

  if (data?.getWeekTemplates) {
    log(`✓ Found ${data.getWeekTemplates.length} week template(s) with details`, 'green');
    data.getWeekTemplates.forEach((template) => {
      console.log(`\n  Template: ${template.name}`);
      console.log(`    ID: ${template.id}`);
      console.log(`    Days: ${template.numberOfDays}`);
      
      if (template.dayTemplates) {
        console.log(`\n    Day Templates (${template.dayTemplates.length}):`);
        template.dayTemplates
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .forEach((day) => {
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            console.log(`      ${dayNames[day.dayOfWeek - 1]}: ${day.startTime} (${day.periodCount} periods)`);
            
            if (day.periods && day.periods.length > 0) {
              console.log(`        Periods: ${day.periods.length}`);
              const firstPeriod = day.periods[0];
              const lastPeriod = day.periods[day.periods.length - 1];
              console.log(`          First: ${firstPeriod.startTime} - ${firstPeriod.endTime}`);
              console.log(`          Last: ${lastPeriod.startTime} - ${lastPeriod.endTime}`);
            }
          });
      }
    });
    return data.getWeekTemplates;
  } else {
    log('✗ Failed to load week templates with details', 'red');
    return null;
  }
}

// Test 3: Update week template
async function testUpdateWeekTemplate(templateId, newStartTime = '08:30') {
  logSection(`Test 3: Update Week Template (${templateId})`);

  const mutation = `
    mutation UpdateWeekTemplate($input: UpdateWeekTemplateInput!) {
      updateWeekTemplate(input: $input) {
        id
        defaultStartTime
        dayTemplates {
          id
          dayOfWeek
          startTime
          periods {
            periodNumber
            startTime
            endTime
          }
        }
      }
    }
  `;

  log(`Updating start time to: ${newStartTime}`, 'yellow');

  const data = await makeGraphQLRequest(mutation, {
    input: {
      id: templateId,
      defaultStartTime: newStartTime
    }
  });

  if (data?.updateWeekTemplate) {
    log('✓ Week template updated successfully', 'green');
    console.log(`\n  Template ID: ${data.updateWeekTemplate.id}`);
    console.log(`  New Start Time: ${data.updateWeekTemplate.defaultStartTime}`);
    
    if (data.updateWeekTemplate.dayTemplates) {
      console.log(`\n  Updated Day Templates (${data.updateWeekTemplate.dayTemplates.length}):`);
      data.updateWeekTemplate.dayTemplates
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .forEach((day) => {
          const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          console.log(`    ${dayNames[day.dayOfWeek - 1]}: ${day.startTime}`);
          if (day.periods && day.periods.length > 0) {
            console.log(`      ${day.periods.length} periods (${day.periods[0].startTime} - ${day.periods[day.periods.length - 1].endTime})`);
          }
        });
    }
    return data.updateWeekTemplate;
  } else {
    log('✗ Failed to update week template', 'red');
    return null;
  }
}

// Test 4: Rebuild week template periods
async function testRebuildWeekTemplatePeriods(templateId, options = {}) {
  logSection(`Test 4: Rebuild Week Template Periods (${templateId})`);

  const {
    startTime = '08:00',
    periodCount = 9,
    periodDuration = 40,
    force = false
  } = options;

  const mutation = `
    mutation RebuildWeekTemplatePeriods(
      $id: String!
      $startTime: String!
      $periodCount: Int!
      $periodDuration: Int!
      $force: Boolean
    ) {
      rebuildWeekTemplatePeriods(
        id: $id
        startTime: $startTime
        periodCount: $periodCount
        periodDuration: $periodDuration
        force: $force
      ) {
        id
        defaultPeriodCount
        dayTemplates {
          id
          periods {
            id
            periodNumber
            startTime
            endTime
          }
        }
      }
    }
  `;

  log(`Rebuilding with:`, 'yellow');
  console.log(`  Start Time: ${startTime}`);
  console.log(`  Period Count: ${periodCount}`);
  console.log(`  Period Duration: ${periodDuration} minutes`);
  console.log(`  Force: ${force}`);

  const data = await makeGraphQLRequest(mutation, {
    id: templateId,
    startTime,
    periodCount,
    periodDuration,
    force
  });

  if (data?.rebuildWeekTemplatePeriods) {
    log('✓ Week template periods rebuilt successfully', 'green');
    console.log(`\n  Template ID: ${data.rebuildWeekTemplatePeriods.id}`);
    console.log(`  Period Count: ${data.rebuildWeekTemplatePeriods.defaultPeriodCount}`);
    
    if (data.rebuildWeekTemplatePeriods.dayTemplates) {
      console.log(`\n  Rebuilt Day Templates (${data.rebuildWeekTemplatePeriods.dayTemplates.length}):`);
      data.rebuildWeekTemplatePeriods.dayTemplates.forEach((day, idx) => {
        if (day.periods && day.periods.length > 0) {
          console.log(`    Day ${idx + 1}: ${day.periods.length} periods`);
          console.log(`      First: Period ${day.periods[0].periodNumber} (${day.periods[0].startTime} - ${day.periods[0].endTime})`);
          console.log(`      Last: Period ${day.periods[day.periods.length - 1].periodNumber} (${day.periods[day.periods.length - 1].startTime} - ${day.periods[day.periods.length - 1].endTime})`);
        }
      });
    }
    return data.rebuildWeekTemplatePeriods;
  } else {
    log('✗ Failed to rebuild week template periods', 'red');
    log('This might be because timetable entries exist. Try with force: true', 'yellow');
    return null;
  }
}

// Main execution
async function main() {
  log('Starting Week Template Tests', 'bright');
  log('API URL: ' + API_URL, 'blue');

  // Test 1: Load basic templates
  const templates = await testLoadWeekTemplatesBasic();
  
  if (!templates || templates.length === 0) {
    log('\n⚠ No templates found. Cannot continue with other tests.', 'yellow');
    log('Create a week template first using the createWeekTemplate mutation.', 'yellow');
    return;
  }

  // Test 2: Load templates with details
  await testLoadWeekTemplatesDetails();

  // Test 3: Update template (using first template)
  const firstTemplate = templates[0];
  log(`\nUsing template: ${firstTemplate.name} (${firstTemplate.id})`, 'blue');
  
  const shouldUpdate = process.argv.includes('--update');
  if (shouldUpdate) {
    await testUpdateWeekTemplate(firstTemplate.id, '08:30');
  } else {
    log('\nSkipping update test (use --update flag to run)', 'yellow');
  }

  // Test 4: Rebuild periods
  const shouldRebuild = process.argv.includes('--rebuild');
  const shouldForce = process.argv.includes('--force');
  
  if (shouldRebuild) {
    await testRebuildWeekTemplatePeriods(firstTemplate.id, {
      startTime: '08:00',
      periodCount: 9,
      periodDuration: 40,
      force: shouldForce
    });
  } else {
    log('\nSkipping rebuild test (use --rebuild flag to run, --force to force rebuild)', 'yellow');
  }

  logSection('All Tests Complete');
  log('Usage:', 'blue');
  console.log('  node test-week-templates.js                 # Basic load test only');
  console.log('  node test-week-templates.js --update        # Include update test');
  console.log('  node test-week-templates.js --rebuild       # Include rebuild test');
  console.log('  node test-week-templates.js --rebuild --force  # Force rebuild (deletes entries)');
}

main().catch((error) => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});

