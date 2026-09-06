// TEMP OPS PROBE - writes reachability result into public/ so it can be read
// over HTTP. Contains no secrets. Removed after probe.
import fs from 'node:fs';
const out = { egressIp: null, tokenPresent: false, cfHttp: null, cfSuccess: null, zoneId: null, cfError: null };
try {
  out.egressIp = await (await fetch('https://api.ipify.org', { signal: AbortSignal.timeout(15000) })).text();
  console.log('[cf-probe] build egress ip:', out.egressIp);
} catch (e) { console.log('[cf-probe] ipify fail:', String((e && e.message) || e)); }
try {
  const tok = process.env.CLOUDFLARE_API_TOKEN || '';
  out.tokenPresent = !!tok;
  console.log('[cf-probe] token present:', out.tokenPresent ? 'yes' : 'NO');
  if (tok) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    const r = await fetch('https://api.cloudflare.com/client/v4/zones?name=frapps.tech', {
      headers: { Authorization: 'Bearer ' + tok }, signal: ctl.signal
    });
    clearTimeout(t);
    out.cfHttp = r.status;
    const j = await r.json();
    out.cfSuccess = j.success;
    if (j.success && j.result && j.result[0]) out.zoneId = j.result[0].id;
    else out.cfError = JSON.stringify(j.errors).slice(0, 200);
    console.log('[cf-probe] zones http:', out.cfHttp, 'success:', out.cfSuccess, 'err:', out.cfError);
  }
} catch (e) { out.cfError = String((e && e.message) || e); console.log('[cf-probe] cf fail:', out.cfError); }
fs.writeFileSync(new URL('../public/cf-probe-result.json', import.meta.url), JSON.stringify(out));
console.log('[cf-probe] result file written');
