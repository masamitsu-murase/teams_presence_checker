var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

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

