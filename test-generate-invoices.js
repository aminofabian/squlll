// Test script to run the generateInvoices mutation
// Usage: bun test-generate-invoices.js

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql';

async function run() {
  const mutation = `
    mutation GenerateInvoices($input: CreateInvoiceInput!) {
      generateInvoices(input: $input) {
        id
        invoiceNumber
        student { user { id name } }
        term { id name }
        totalAmount
        balanceAmount
        status
        items { id feeBucket { name } amount }
      }
    }
  `;

  // Sample input from user request
  const variables = {
    input: {
      studentId: '5383a3f8-fc62-4850-8534-313bcc639304',
      termId: '2897a69e-6a2b-47e3-8aa3-2dad9eed863e',
      issueDate: '2024-09-01',
      dueDate: '2024-12-15',
      notes: 'Term 1 fees',
    },
  };

  try {
    console.log(`\n🧪 Sending generateInvoices mutation → ${GRAPHQL_ENDPOINT}`);
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }

    const json = await res.json();

    if (json.errors) {
      console.error('❌ GraphQL Errors:');
      console.error(JSON.stringify(json.errors, null, 2));
      process.exit(1);
    }

    console.log('✅ Success. Response data:');
    console.log(JSON.stringify(json.data, null, 2));

    // Optional: quick shape check
    const result = json.data?.generateInvoices;
    if (!Array.isArray(result) || result.length === 0) {
      console.warn('⚠️ No invoices returned. Verify IDs and term setup.');
    } else {
      const first = result[0];
      console.log('\n🔎 First invoice summary:');
      console.log(
        `# ${first.invoiceNumber} | status=${first.status} | total=${first.totalAmount} | items=${first.items?.length ?? 0}`
      );
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
    console.error('\n💡 Ensure Next.js is running on http://localhost:3000 and your schema exposes generateInvoices.');
    process.exit(1);
  }
}

run();


