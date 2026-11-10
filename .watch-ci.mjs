const repo = 'Gsaecy/Zero-State-Radar';
const token = process.env.GITHUB_TOKEN;
const headers = {
  'user-agent': 'dsh-ci-watch',
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'x-github-api-version': '2022-11-28',
};
async function api(path) {
  const res = await fetch('https://api.github.com' + path, { headers });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let run = null;
for (let i = 0; i < 45; i++) {
  const runs = await api(`/repos/${repo}/actions/runs?per_page=5`);
  const list = runs.json?.workflow_runs ?? [];
  const candidate = list.find((r) => r.name === 'release' && r.event === 'push' && r.head_branch === 'v0.1.3');
  if (candidate) {
    run = candidate;
    console.log(`run ${run.id}: ${run.status} / ${run.conclusion ?? '-'}`);
    if (run.status === 'completed') break;
  } else {
    console.log(`waiting for the v0.1.3 run... (${i})`);
  }
  await sleep(5000);
}
if (!run) { console.error('no run seen'); process.exit(1); }
console.log('conclusion:', run.conclusion, '|', run.html_url);

const jobs = await api(`/repos/${repo}/actions/runs/${run.id}/jobs`);
for (const job of jobs.json?.jobs ?? []) {
  console.log(`job: ${job.name} ${job.status} ${job.conclusion}`);
  for (const step of job.steps ?? []) console.log('  -', step.number, step.name, '=>', step.conclusion);
}

// npm job log tail (to show the skip message)
const npmJob = (jobs.json?.jobs ?? []).find((j) => j.name === 'npm-publish');
if (npmJob) {
  const logs = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${run.id}/logs`, { headers, redirect: 'follow' });
  if (logs.ok) {
    const buf = Buffer.from(await logs.arrayBuffer());
    console.log('logs zip bytes:', buf.length);
  }
}

const rel = await api(`/repos/${repo}/releases/tags/v0.1.3`);
console.log('release v0.1.3:', rel.status, rel.json?.html_url ?? JSON.stringify(rel.json).slice(0, 200));
for (const a of rel.json?.assets ?? []) console.log('asset:', a.name, a.size, 'digest', a.digest);
const latest = await api(`/repos/${repo}/releases/latest`);
console.log('latest:', latest.json?.tag_name);
