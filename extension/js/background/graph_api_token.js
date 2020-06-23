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

    const randomAscii = function (length) {
        const uint32_max = 0xFFFFFFFF;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            + "abcdefghijklmnopqrstuvwxyz" + "0123456789" + "-._~";
        const chars_length = chars.length;

        const random_values = new Uint32Array(length);
        crypto.getRandomValues(random_values);
        const normalized_random_values = random_values.map(v => {
            return Math.floor(v / uint32_max * chars_length);
        });
        const random_chars = Array.from(normalized_random_values)
            .map(ch => chars[ch])
            .join("");

        return random_chars;
    };


    class GraphApiToken {
        constructor(tenant, client_id) {
            this.tenant = "";
            this.client_id = "";

            this.access_token = null;
            this.refresh_token = null;
            this.expires_at = null;
            this.code_verifier = null;
            this.state = null;

            this.margin_expiration = 5 * 60 * 1000;
            this.scope = [
                "offline_access",
                "openid",
                "profile",
                "User.Read",
                "User.ReadBasic.All",
                "Presence.Read.All"
            ];
            this.redirect_uri = "https://login.microsoftonline.com/common/oauth2/nativeclient";
        }

        setTenantAndClientId(tenant, client_id) {
            if (this.tenant == tenant && this.client_id == client_id) {
                return;
            }

            this.tenant = tenant;
            this.client_id = client_id;
            this.clear();
        }

        isLoggedIn() {
            return this.access_token != null;
        }

        hasValidTenantAndClientId() {
            return this.tenant && this.client_id;
        }

        get authorizeUrl() {
            return `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/authorize`;
        }

        get tokenUrl() {
            return `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`;
        }

        async generateCodeChallenge() {
            const challenge_length = 128;
            const random_chars = randomAscii(challenge_length);
            const s256 = await calculateS256(random_chars);

            this.code_verifier = random_chars;

            return s256;
        }

        getCodeVerifier() {
            return this.code_verifier;
        }

        async initialize(url) {
            url = new URL(url);
            const search_params = url.searchParams;
            const state = search_params.get("state");
            if (state != this.state) {
                throw new Error(`Invalid state: ${state}`);
            }
            if (`${url.protocol}//${url.host}${url.pathname}` != this.redirect_uri) {
                throw new Error(`Invalid redirect_uri: ${url}`);
            }
            if (!search_params.has("code")) {
                throw new Error(`code is not defined.`);
            }

            const code = url.searchParams.get("code");

            let token_param = new URLSearchParams();
            token_param.append("client_id", this.client_id);
            token_param.append("grant_type", "authorization_code");
            token_param.append("scope", this.scope.join(" "));
            token_param.append("code", code);
            token_param.append("redirect_uri", this.redirect_uri);
            token_param.append("code_verifier", this.getCodeVerifier());

            const token_response = await fetch(this.tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: token_param
            });

            const token_obj = await token_response.json()
            const mandatory_keys = ["access_token", "expires_in", "refresh_token"];
            if (mandatory_keys.some(key => !(key in token_obj))) {
                throw new Error("A mandatory key was not found in a response.");
            }

            this.access_token = token_obj.access_token;
            this.refresh_token = token_obj.refresh_token;
            this.expires_at = Date.now() + token_obj.expires_in * 1000;
        }

        async update() {
            let token_param = new URLSearchParams();
            token_param.append("client_id", this.client_id);
            token_param.append("grant_type", "refresh_token");
            token_param.append("scope", this.scope.join(" "));
            token_param.append("refresh_token", this.refresh_token);

            const token_response = await fetch(this.tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: token_param
            });

            const token_obj = await token_response.json()
            const mandatory_keys = ["access_token", "expires_in"];
            if (mandatory_keys.some(key => !(key in token_obj))) {
                throw new Error("A mandatory key was not found in a response.");
            }

            this.access_token = token_obj.access_token;
            if ("refresh_token" in token_obj) {
                this.refresh_token = token_obj.refresh_token;
            }
            this.expires_at = Date.now() + token_obj.expires_in * 1000;
        }

        clear() {
            this.access_token = this.refresh_token = this.expires_at = null;
            this.code_verifier = this.state = null;
        }

        expiresSoon() {
            if (Date.now() + this.margin_expiration >= this.expires_at) {
                return true;
            } else {
                return false;
            }
        }

        async getAuthorizationHeader() {
            if (!this.access_token) {
                throw new Error("GraphApiToken is not initialized.");
            }

            if (this.expiresSoon()) {
                await this.update();
            }

            return `Bearer ${this.access_token}`;
        }

        async getAuthorizationUrl() {
            const code_challenge = await this.generateCodeChallenge();
            this.state = randomAscii(32);

            const param = new URLSearchParams();
            param.append("client_id", this.client_id);
            param.append("response_type", "code");
            param.append("redirect_uri", this.redirect_uri);
            param.append("scope", this.scope.join(" "));
            param.append("code_challenge_method", "S256");
            param.append("code_challenge", code_challenge);
            param.append("state", this.state);

            return `${this.authorizeUrl}?${param.toString()}`;
        }
    }

    ctx.GraphApiToken = GraphApiToken;
})(TeamsPresenceChecker);

