/**
 * AudioMind adapted for Whistant JSC (JavaScriptCore)
 * No Node.js modules. Returns result via a global variable _audiomindResult.
 */

var PROXY_URL = "https://audiomind-proxy-sable.vercel.app/api/audio";
var PRO_KEY = "";
var MAX_WAIT = 180;
var POLL = 5;

function audiomind_sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
}

function audiomind_extractUrl(data) {
    if (!data) return null;
    return data.audio_url || data.url ||
        (data.result && data.result.audio_url) ||
        (data.output && data.output.audio_url) || null;
}

async function audiomind_poll(url, headers) {
    var start = Date.now();
    var attempt = 0;
    while (Date.now() - start < MAX_WAIT * 1000) {
        attempt++;
        await audiomind_sleep(POLL * 1000);
        try {
            var r = await fetch(url, {method:"GET", headers:headers});
            var d = await r.json();
            var s = (d.status||"").toLowerCase();
            var au = audiomind_extractUrl(d);
            if (au || s==="completed"||s==="succeeded") {
                _audiomindResult = JSON.stringify({audio_url:au||d.audio_url||null,status:s,polled:true,attempts:attempt});
                return;
            }
            if (s==="failed"||s==="error") {
                _audiomindResult = JSON.stringify({error:"generation failed",status:s,polled:true,attempts:attempt});
                return;
            }
        } catch(e) {
            _audiomindResult = JSON.stringify({error:"poll failed:"+e.message,polled:true,attempts:attempt});
            return;
        }
    }
    _audiomindResult = JSON.stringify({status:"timeout",url:url,polled:true,timeout:true});
}

async function audiomind_run(paramsJson) {
    var p;
    try { p = JSON.parse(paramsJson); } catch(e) {
        _audiomindResult = JSON.stringify({error:"bad json:"+e.message});
        return;
    }
    var text = p.text||p.prompt||"";
    var prompt = p.prompt||p.text||"";
    if(!text&&!prompt) { _audiomindResult = JSON.stringify({error:"missing prompt"}); return; }

    var body = {
        action:p.action||"tts",
        text:text,
        prompt:prompt,
        duration_seconds:p.duration_seconds||null,
        model:p.model||undefined,
        fast:p.fast||undefined
    };
    var h = {"Content-Type":"application/json"};
    if(p.api_key||PRO_KEY) h["X-Audiomind-Key"] = p.api_key||PRO_KEY;
    var url = p.backend_url||PROXY_URL;

    try {
        var res = await fetch(url, {method:"POST",headers:h,body:JSON.stringify(body)});
        var data = await res.json();
        if(!res.ok) {
            _audiomindResult = JSON.stringify({error:data.message||data.error||("HTTP "+res.status),status:res.status});
            return;
        }
        var s = (data.status||"").toLowerCase();
        if(data.status_url && (s==="in_progress"||s==="processing"||s==="pending"||s==="queued")) {
            await audiomind_poll(data.status_url, h);
            return;
        }
        var au = audiomind_extractUrl(data);
        _audiomindResult = JSON.stringify({audio_url:au,status:data.status||"completed",data:data});
    } catch(e) {
        _audiomindResult = JSON.stringify({error:e.message});
    }
}

// Start execution
var _audiomindResult = "pending...";
audiomind_run(JSON.stringify({
    prompt:"short test tone",
    action:"music",
    duration_seconds:30
}));
