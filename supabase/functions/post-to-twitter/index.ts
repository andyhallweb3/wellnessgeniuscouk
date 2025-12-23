import { createHmac } from "node:crypto";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) {
    throw new Error("Missing TWITTER_CONSUMER_KEY environment variable");
  }
  if (!API_SECRET) {
    throw new Error("Missing TWITTER_CONSUMER_SECRET environment variable");
  }
  if (!ACCESS_TOKEN) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN environment variable");
  }
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET environment variable");
  }
}

// IMPORTANT: We intentionally do not include the POST parameters in the OAuth signature
// since that's not how Twitter's API expects it.
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("Signature Base String:", signatureBaseString);
  console.log("Generated Signature:", signature);

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

const BASE_URL = "https://api.x.com/2";

async function sendTweet(tweetText: string): Promise<any> {
  const url = `${BASE_URL}/tweets`;
  const method = "POST";
  const params = { text: tweetText };

  const oauthHeader = generateOAuthHeader(method, url);
  console.log("OAuth Header:", oauthHeader);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();
  console.log("Response Status:", response.status);
  console.log("Response Body:", responseText);

  if (!response.ok) {
    throw new Error(
      `Twitter API error: ${response.status} - ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

// Generate a summary from newsletter articles for Twitter
function generateTweetFromArticles(articles: any[]): string {
  if (!articles || articles.length === 0) {
    return "📰 New edition of Wellness Genius Weekly is out! AI insights for the wellness industry. Subscribe at wellnessgenius.co #AI #Wellness #Newsletter";
  }

  const topArticle = articles[0];
  const title = topArticle.title || topArticle.source || "industry insights";
  
  // Create a compelling tweet with the top story
  const hashtags = "#AI #Wellness #FitnessTech";
  const cta = "\n\n📬 Subscribe: wellnessgenius.co";
  
  // Calculate available characters for the headline
  const fixedLength = hashtags.length + cta.length + 5; // 5 for emoji and spacing
  const maxHeadline = 280 - fixedLength;
  
  let headline = `🔥 ${title}`;
  if (headline.length > maxHeadline) {
    headline = headline.substring(0, maxHeadline - 3) + "...";
  }
  
  return `${headline}\n\n${hashtags}${cta}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Post to Twitter function called ===");
    
    // Validate environment variables
    validateEnvironmentVariables();
    
    // Parse request body
    const body = await req.json();
    const { articles, customTweet } = body;
    
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    // Use custom tweet text if provided, otherwise generate from articles
    let tweetText: string;
    if (customTweet && customTweet.trim()) {
      tweetText = customTweet.trim();
    } else {
      tweetText = generateTweetFromArticles(articles);
    }
    
    console.log("Tweet text:", tweetText);
    console.log("Tweet length:", tweetText.length);
    
    // Validate tweet length
    if (tweetText.length > 280) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Tweet is too long (${tweetText.length}/280 characters)` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Send the tweet
    const result = await sendTweet(tweetText);
    
    console.log("Tweet posted successfully:", result);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        tweet: result,
        text: tweetText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error("Error posting to Twitter:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
