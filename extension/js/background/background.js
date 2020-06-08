var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    class GraphApiToken {
        constructor(tenant, client_id) {
            this.tenant = tenant;
            this.client_id = client_id;

            this.access_token = null;
            this.refresh_token = null;
            this.expires_at = null;
            this.code_verifier = null;

            this.margin_expiration = 5 * 60;
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

        get authorizeUrl() {
            return `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/authorize`;
        }

        get tokenUrl() {
            return `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`;
        }

        generateCodeChallenge() {
            const verifier_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                + "abcdefghijklmnopqrstuvwxyz" + "0123456789" + "-._~";
            const verifier_chars_length = verifier_chars.length;
            const challenge_length = 128;
            let random_values = new Uint32Array(challenge_length);
            crypto.getRandomValues(random_values);
            const normalized_random_values = random_values.map(v => {
                return Math.floor(v / uint32_max * verifier_chars_length);
            });
            const random_chars = Array.from(normalized_random_values)
                .map(ch => String.fromCharCode(ch))
                .join("");
            const s256 = ctx.calculateS256(random_chars);

            this.code_verifier = 
        }

        getCodeVerifier(refresh) {
            if (refresh) {
            }
        }

        async initialize(code) {
            let token_param = new URLSearchParams();
            token_param.append("client_id", this.client_id);
            token_param.append("grant_type", "authorization_code");
            token_param.append("scope", this.scope.join(" "));
            token_param.append("code", code);
            token_param.append("redirect_uri", this.redirect_uri);
            if (code_verifier) {
                token_param.append("code_verifier", code_verifier);
            }

            const token_response = await fetch(this.token_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: token_param
            });

            const token_obj = await token_response.json()
            const mandatory_keys = ["access_token", "expires_in", "refresh_token"];
            if (mandatory_keys.some(key => !(key in token_obj))) {
                throw "A mandatory key was not found in a response.";
            }

            this.access_token = token_obj.access_token;
            this.refresh_token = token_obj.refresh_token;
            this.expires_at = Date.now() + token_obj.expires_in;
        }

        async update() {
            let token_param = new URLSearchParams();
            token_param.append("client_id", this.client_id);
            token_param.append("grant_type", "refresh_token");
            token_param.append("scope", this.scope.join(" "));
            token_param.append("refresh_token", this.refresh_token);

            const token_response = await fetch(this.token_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: token_param
            });

            const token_obj = await token_response.json()
            const mandatory_keys = ["access_token", "expires_in"];
            if (mandatory_keys.some(key => !(key in token_obj))) {
                throw "A mandatory key was not found in a response.";
            }

            this.access_token = token_obj.access_token;
            if ("refresh_token" in token_obj) {
                this.refresh_token = token_obj.refresh_token;
            }
            this.expires_at = Date.now() + token_obj.expires_in;
        }

        clear() {
            this.access_token = this.refresh_token = this.expires_at = null;
        }

        expires_soon() {
            if (Date.now() + this.margin_expiration >= this.expires_at) {
                return true;
            } else {
                return false;
            }
        }

        async getAuthorizationHeader() {
            if (!this.access_token) {
                throw "GraphApiToken is not initialized.";
            }

            if (this.expires_soon()) {
                await this.update();
            }

            return `Bearer ${this.access_token}`;
        }
    }

    var gGraphApiToken = new GraphApiToken("common", "ec292358-d8ed-4329-b033-c13416337105");

    const getGraphApi = async function (path) {
        const url_base = "https://graph.microsoft.com";
        const headers = {
            "Authorization": await gGraphApiToken.getAuthorizationHeader()
        };
        const response = await fetch(`${url_base}${path}`, {
            method: "GET",
            headers: headersrs
        });
        const json_response = await response.json();
        return json_response;
    };

    const postGraphApi = async function (path, data_obj) {
        const url_base = "https://graph.microsoft.com";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": await gGraphApiToken.getAuthorizationHeader()
        };
        const json_str = JSON.stringify(data_obj);
        const response = await fetch(`${url_base}${path}`, {
            method: "POST",
            headers: headersrs,
            body: json_str
        });
        const json_response = await response.json();
        return json_response;
    };

    // let token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
    // let client_id = "ec292358-d8ed-4329-b033-c13416337105";
    // let scope = ["User.Read", "User.ReadBasic.All", "offline_access", "openid", "profile"];
    // let redirect_uri = "https://login.microsoftonline.com/common/oauth2/nativeclient";
    const requestAccessToken = async function (token_url, code, client_id, scope, redirect_uri, code_verifier) {
        let token_param = new URLSearchParams();
        token_param.append("client_id", client_id);
        token_param.append("grant_type", "authorization_code");
        token_param.append("scope", scope.join(" "));
        token_param.append("code", code);
        token_param.append("redirect_uri", redirect_uri);
        if (code_verifier) {
            token_param.append("code_verifier", code_verifier);
        }

        const token_response = await fetch(token_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: token_param
        });

        const token_obj = await token_response.json()
        const mandatory_keys = ["access_token", "expires_in", "refresh_token"];
        if (mandatory_keys.some(key => !(key in token_obj))) {
            throw "A mandatory key was not found in a response.";
        }
        return token_obj;
    };

    const getCurrentPresences = async function (user_ids) {
        const parameter = { "ids": user_ids };
        const presences = await postGraphApi("/beta/communications/getPresencesByUserId", parameter)
        const presence_map = {};
        for (let presence of presences) {
            presence_map[presence["id"]] = presence;
        }
        return presence_map;
    };

    const onClicked = async function (tab) {
    };

    chrome.browserAction.onClicked.addListener(tab => {
        console.log("onClicked");
        onClicked(tab);
    });
})(TeamsPresenceChecker);
