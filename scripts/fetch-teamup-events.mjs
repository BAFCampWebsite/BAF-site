import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const envPath = resolve(repoRoot, '.env');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const contents = readFileSync(filePath, 'utf8');
  const values = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function loadConfig() {
  const fileValues = parseEnvFile(envPath);
  const env = { ...fileValues, ...process.env };

  const apiKey = env.TEAMUP_API_KEY;
  const calendarId = env.CALENDAR_ID;
  const startDate = env.START_DATE;
  const endDate = env.END_DATE;

  if (!apiKey || !calendarId || !startDate || !endDate) {
    throw new Error('Missing Teamup config. Expected TEAMUP_API_KEY, CALENDAR_ID, START_DATE, and END_DATE in .env.');
  }

  return { apiKey, calendarId, startDate, endDate };
}

async function fetchEvents({ apiKey, calendarId, startDate, endDate }) {
  const url = new URL(`https://api.teamup.com/${calendarId}/events`);
  url.searchParams.set('startDate', startDate);
  url.searchParams.set('endDate', endDate);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, text/html',
      'Teamup-Token': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Teamup API request failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function main() {
  const { apiKey, calendarId, startDate, endDate } = loadConfig();
  const payload = await fetchEvents({ apiKey, calendarId, startDate, endDate });

  const outputPath = process.argv[2]
    ? resolve(repoRoot, process.argv[2])
    : resolve(repoRoot, 'public', 'teamup-events.json');

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify({
    calendarId,
    startDate,
    endDate,
    events: Array.isArray(payload.events) ? payload.events : [],
  }, null, 2)}\n`);

  console.log(`Saved Teamup events to ${outputPath}`);
  console.log(`Events count: ${Array.isArray(payload.events) ? payload.events.length : 0}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
