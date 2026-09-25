/**
 * Checks which browser origins the API will accept.
 *
 *   npm run check:cors
 *
 * Reads CLIENT_ORIGIN from the running server's environment and asks it a real
 * preflight question for each origin, so the answer is the server's, not a
 * re-implementation of its logic here.
 */
import 'dotenv/config';

const BASE = process.env.SMOKE_URL ?? 'http://127.0.0.1:4000';

const CASES = [
  ['http://localhost:5173', 'local development'],
  ['https://dipisha-portfolio.vercel.app', 'a Vercel production domain'],
  ['https://dipisha-portfolio-git-main-abc.vercel.app', 'a Vercel preview'],
  ['https://not-your-site.example.com', 'an unrelated site'],
  ['https://evil.vercel.app.attacker.com', 'a lookalike domain'],
];

async function run() {
  console.log(`\nCLIENT_ORIGIN = ${process.env.CLIENT_ORIGIN ?? '(unset → localhost only)'}`);
  console.log(`Asking ${BASE} for a real preflight\n`);

  for (const [origin, description] of CASES) {
    const response = await fetch(`${BASE}/api/content`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
      },
    });

    const allowed = response.headers.get('access-control-allow-origin');
    const ok = allowed === origin;
    console.log(`  ${ok ? '✓ allowed' : '· blocked'}  ${description}`);
    console.log(`             ${origin}`);
  }

  console.log('\nAnything blocked here cannot call the API from a browser.\n');
}

run().catch((error) => {
  console.error('✗', error.message);
  process.exitCode = 1;
});
