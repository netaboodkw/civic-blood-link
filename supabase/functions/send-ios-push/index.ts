import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Generate JWT for APNs authentication
async function generateAPNsJWT(): Promise<string> {
  const keyId = Deno.env.get('APNS_KEY_ID')!;
  const teamId = Deno.env.get('APNS_TEAM_ID')!;
  const privateKeyPEM = Deno.env.get('APNS_PRIVATE_KEY')!;

  const header = {
    alg: 'ES256',
    kid: keyId,
  };

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: teamId,
    iat: now,
  };

  // Encode header and claims
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedClaims = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Import the private key
  const pemContents = privateKeyPEM
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false,
    ['sign']
  );

  // Sign the token
  const dataToSign = new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`);
  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256',
    },
    key,
    dataToSign
  );

  // Convert signature to base64url
  const signatureArray = new Uint8Array(signature);
  const encodedSignature = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedClaims}.${encodedSignature}`;
}

// Send push notification to a single device
async function sendPushToDevice(
  deviceToken: string,
  title: string,
  body: string,
  jwt: string,
  data?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  const bundleId = 'com.nabdatdam.app';
  const apnsUrl = `https://api.push.apple.com/3/device/${deviceToken}`;

  const payload = {
    aps: {
      alert: {
        title,
        body,
      },
      sound: 'default',
      badge: 1,
    },
    ...data,
  };

  try {
    const response = await fetch(apnsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${jwt}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`Push sent successfully to ${deviceToken.substring(0, 10)}...`);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`Failed to send push to ${deviceToken.substring(0, 10)}...: ${response.status} - ${errorText}`);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error sending push to ${deviceToken.substring(0, 10)}...:`, error);
    return { success: false, error: errorMessage };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_ids, title, body, data } = await req.json() as PushPayload;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get push tokens for specified users or all users with tokens
    let query = supabase
      .from('profiles')
      .select('id, push_token')
      .not('push_token', 'is', null);

    if (user_ids && user_ids.length > 0) {
      query = query.in('id', user_ids);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log('No users with push tokens found');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No users with push tokens' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending push to ${profiles.length} devices`);

    // Generate APNs JWT
    const jwt = await generateAPNsJWT();

    // Send push to all devices
    const results = await Promise.all(
      profiles.map(profile => 
        sendPushToDevice(profile.push_token!, title, body, jwt, data)
      )
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Push notification results: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed,
        total: profiles.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in send-ios-push:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});