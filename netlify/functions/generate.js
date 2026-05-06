const https = require("https");

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY is not set in Netlify environment variables" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  delete payload.stream;

  const bodyStr = JSON.stringify(payload);

  const result = await new Promise((resolve, reject) => {
    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });

    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });

  let parsed;
  try {
    parsed = JSON.parse(result.body);
  } catch {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Bad response from Anthropic" }) };
  }

  if (result.status !== 200) {
    return {
      statusCode: result.status,
      headers,
      body: JSON.stringify({ error: parsed.error?.message || "Anthropic API error" }),
    };
  }

  const text = parsed.content?.[0]?.text ?? "";
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ text }),
  };
};
