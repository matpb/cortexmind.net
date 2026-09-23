import { m } from '$lib/paraglide/messages.js';
import { downloads } from '$lib/releases';

export const prerender = true;

export function GET() {
  const p = downloads.platforms;
  const body = `# CortexMind

${m['home.meta.description']()}

## Version

Current version: ${downloads.version} (released ${downloads.pub_date})

## Downloads

- macOS (Apple Silicon, .dmg): ${p.macos_apple_silicon.url}
- Windows (x64, .exe): ${p.windows_x64.url}
- Linux (x64, .AppImage): ${p.linux_x64.url}
- Machine-readable manifest: https://cortexmind.net/downloads.json

## Connecting an agent

CortexMind exposes an MCP endpoint at http://localhost:14200/mcp, authenticated with a bearer token. The token lives in the local config file at ~/.cortexmind/config.toml (key mcp_bearer_token).

## Setup

The docs page at https://cortexmind.net/docs#ai-install holds a copy-paste prompt that an agentic AI with shell access can run to install CortexMind, connect itself over MCP, and seed the memory by interviewing the user.

Connecting ChatGPT or Claude on the web (custom connector, Public URL + CortexMind password): https://cortexmind.net/connect

## Pricing

${m['home.pricing.monthly.price']()} USD per month (${m['home.pricing.monthly.tag']()}), or ${m['home.pricing.yearly.price']()} USD per year.

## More

- Changelog: https://cortexmind.net/changelog
- Privacy: https://cortexmind.net/privacy
- Terms: https://cortexmind.net/terms
- Downloads manifest: https://cortexmind.net/downloads.json
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}
