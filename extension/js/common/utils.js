var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    const base64_url = function (binary_str) {
        const base64 = btoa(binary_str);
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    };

    // Calcuate S256 signature.
    //  e.g. dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk => E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    const calculateS256 = async function (ascii) {
        const encoder = new TextEncoder();
        const uint8_data = encoder.encode(ascii);
        const digest = await crypto.subtle.digest("SHA-256", uint8_data);
        const uint8_digest = new Uint8Array(digest);
        const ascii_digest = Array.from(uint8_digest).map(c => String.fromCharCode(c)).join("");
        return base64_url(ascii_digest);
    };

    const getCodeFromUrl = function (url, expected_url, state) {
        if (`${url.protocol}//${url.host}${url.pathname}` !== `${expected_url}`) {
            throw `Unexpected URL: ${url}`;
        }

        const actual_state = url.searchParams.get("state")
        if (actual_state !== state) {
            throw `Invalid state: ${actual_state}`;
        }

        if (!url.searchParams.has("code")) {
            throw `"code" was not found in search parameter.`;
        }

        return url.searchParams.get("code");
    };

    ctx.calculateS256 = calculateS256;
    ctx.getCodeFromUrl = getCodeFromUrl;
})(TeamsPresenceChecker);

