import { NextResponse } from 'next/server';

const QUERY_ID = '6622482';
const DUNE_API_BASE = 'https://api.dune.com/api/v1';

// Helper function to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  // Verify cron secret (optional but recommended for security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow if no secret is set (for testing) or if it matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.DUNE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'DUNE_API_KEY environment variable is not set' },
      { status: 500 }
    );
  }

  const headers = {
    'x-dune-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    console.log('🔄 Cron job started: Executing Dune query...');
    
    // 1. Execute the query
    const executeRes = await fetch(
      `${DUNE_API_BASE}/query/${QUERY_ID}/execute`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!executeRes.ok) {
      const errorText = await executeRes.text();
      console.error('Execute error:', errorText);
      return NextResponse.json(
        { error: `Failed to execute query: ${errorText}` },
        { status: 500 }
      );
    }

    const executeData = await executeRes.json();
    const executionId = executeData.execution_id;
    console.log('Execution ID:', executionId);

    // 2. Poll for results (max 120 seconds for cron)
    let attempts = 0;
    const maxAttempts = 60;
    let finalState = 'UNKNOWN';
    
    while (attempts < maxAttempts) {
      await sleep(2000); // Wait 2 seconds between checks
      
      const statusRes = await fetch(
        `${DUNE_API_BASE}/execution/${executionId}/status`,
        { headers }
      );
      
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        finalState = statusData.state;
        console.log(`Attempt ${attempts + 1}: ${finalState}`);
        
        if (finalState === 'QUERY_STATE_COMPLETED') {
          console.log('✅ Query execution completed!');
          return NextResponse.json({
            success: true,
            message: 'Query executed successfully',
            executionId,
            state: finalState,
            timestamp: new Date().toISOString(),
          });
        } else if (finalState === 'QUERY_STATE_FAILED') {
          console.error('❌ Query execution failed');
          return NextResponse.json(
            { 
              error: 'Query execution failed',
              executionId,
              state: finalState,
            },
            { status: 500 }
          );
        }
      }
      
      attempts++;
    }

    // Timeout
    return NextResponse.json({
      success: false,
      message: 'Query execution timed out',
      executionId,
      state: finalState,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute cron job' },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggers
export async function POST(request) {
  return GET(request);
}



