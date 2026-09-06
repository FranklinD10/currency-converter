// TEMP OPS PROBE - restores nothing, always exits 0. Removed after probe.
try {
  const ip = await (await fetch('https://api.ipify.org', { signal: AbortSignal.timeout(15000) })).text();
  console.log('[cf-probe] build egress ip:', ip);
} catch (e) { console.log('[cf-probe] ipify fail:', String(e && e.message || e)); }
try {
  const tok = process.env.CLOUDFLARE_API_TOKEN || '';
  console.log('[cf-probe] token present:', tok ? 'yes' : 'NO');
  if (!tok) process.exit(0);
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  const r = await fetch('https://api.cloudflare.com/client/v4/zones?name=frapps.tech', {
    headers: { Authorization: 'Bearer ' + tok }, signal: ctl.signal
  });
  clearTimeout(t);
  const j = await r.json();
  console.log('[cf-probe] zones http:', r.status, 'success:', j.success);
  if (j.success && j.result && j.result[0]) console.log('[cf-probe] zone id:', j.result[0].id);
  else console.log('[cf-probe] errors:', JSON.stringify(j.errors).slice(0, 300));
} catch (e) { console.log('[cf-probe] cf fail:', String(e && e.message || e)); }
