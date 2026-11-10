import fs from 'node:fs';

const repo = 'Gsaecy/Zero-State-Radar';
const workflowId = process.env.WORKFLOW_ID || '413297939';
const token = process.env.GITHUB_TOKEN;
const headers = {
  'user-agent': 'dsh-ci-test',
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'x-github-api-version': '2022-11-28',
};

async function api(method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: { ...headers, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

const dispatch = await api('POST', `/repos/${repo}/actions/workflows/${workflowId}/dispatches`, {
  ref: 'main',
  inputs: { tag: 'v0.1.1' },
});
console.log('dispatch status:', dispatch.status);
if (dispatch.status !== 204) { console.log(JSON.stringify(dispatch.json).slice(0, 500)); process.exit(1); }

let run = null;
for (let i = 0; i < 36; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const runs = await api('GET', `/repos/${repo}/actions/runs?workflow_id=${workflowId}&per_page=3`);
  const list = runs.json?.workflow_runs ?? [];
  const candidate = list.find((r) => r.event === 'workflow_dispatch' && r.head_branch === 'main');
  if (candidate) {
    run = candidate;
    console.log(`run ${run.id}: ${run.status} / ${run.conclusion ?? '-'}  (${run.run_started_at})`);
    if (run.status === 'completed') break;
  } else {
    console.log(`waiting for run... (${i})`);
  }
}
if (!run) { console.error('no run appeared'); process.exit(2); }
if (run.status !== 'completed') { console.error('run did not complete in time:', run.html_url); process.exit(3); }

console.log('conclusion:', run.conclusion, '| url:', run.html_url);
const jobs = await api('GET', `/repos/${repo}/actions/runs/${run.id}/jobs`);
for (const job of jobs.json?.jobs ?? []) {
  console.log('job:', job.name, job.status, job.conclusion);
  for (const step of job.steps ?? []) console.log('  -', step.number, step.name, '=>', step.conclusion);
}

if (run.conclusion !== 'success') {
  const logs = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${run.id}/logs`, { headers, redirect: 'follow' });
  console.log('logs status:', logs.status);
  if (logs.ok) {
    const buf = Buffer.from(await logs.arrayBuffer());
    fs.writeFileSync('ci-logs.zip', buf);
    console.log('logs saved:', buf.length, 'bytes');
  }
}
