import { NextResponse } from 'next/server';

const QUERY_ID = '6622482';
const DUNE_API_BASE = 'https://api.dune.com/api/v1';

// Make this route dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '1000';
  const forceRefresh = searchParams.get('refresh') === 'true';
  
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
    // If forceRefresh, execute the query first
    if (forceRefresh) {
      console.log('Executing Dune query...');
      
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
        // If execute fails, fall back to cached results
      } else {
        const executeData = await executeRes.json();
        const executionId = executeData.execution_id;
        console.log('Execution ID:', executionId);

        // 2. Poll for results (max 60 seconds)
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
          await sleep(2000); // Wait 2 seconds between checks
          
          const statusRes = await fetch(
            `${DUNE_API_BASE}/execution/${executionId}/status`,
            { headers }
          );
          
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            console.log('Execution status:', statusData.state);
            
            if (statusData.state === 'QUERY_STATE_COMPLETED') {
              console.log('Query execution completed!');
              break;
            } else if (statusData.state === 'QUERY_STATE_FAILED') {
              console.error('Query execution failed');
              break;
            }
          }
          
          attempts++;
        }
      }
    }

    // 3. Fetch the results (either fresh or cached)
    const response = await fetch(
      `${DUNE_API_BASE}/query/${QUERY_ID}/results?limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Dune API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.result || !data.result.rows || data.result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found. Query may need to be executed first.' },
        { status: 404 }
      );
    }

    // Add metadata to response
    const responseData = {
      ...data,
      _meta: {
        fetchedAt: new Date().toISOString(),
        executionTime: data.result?.metadata?.execution_time_millis,
        lastExecuted: data.execution_ended_at,
      }
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    console.error('Error fetching Dune data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
