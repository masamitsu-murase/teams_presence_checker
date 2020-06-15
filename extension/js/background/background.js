var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(async function (ctx) {
    "use strict";

    const gGraphApiToken = new ctx.GraphApiToken("", "");
    const gOptionData = await ctx.OptionData.load();
    const gUserInfoCache = new ctx.UserInfoCache();

    const getGraphApi = async function (path, query) {
        const url_base = "https://graph.microsoft.com";
        const headers = {
            "Authorization": await gGraphApiToken.getAuthorizationHeader()
        };
        const url = `${url_base}${path}`;
        if (query) {
            url += url + `?${query}`;
        }
        const response = await fetch(url, {
            method: "GET",
            headers: headers
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
            headers: headers,
            body: json_str
        });
        const json_response = await response.json();
        return json_response;
    };

    const getUsersInfo = async function (members) {
        if (members.length == 0) {
            throw new Error("Invalid members");
        }
        const search_params = new URLSearchParams();
        const filter = members.map(m => `(mail eq ${m})`).join(" or ");
        search_params.append("$filter", filter);
        const users_info = await getGraphApi("/v1.0/users", search_params);

        const mail_to_user_info = {};
        users_info.value.forEach(ui => mail_to_user_info[ui["mail"]] = ui);

        const sorted_users_info = members.map(m => (mail_to_user_info[m] || null));
        return sorted_users_info;
    };

    const getUserIds = async function () {
        const unknown_members = gUserInfoCache.unknownMembers();
        if (unknown_members.length > 0) {
            const unknown_members_info = await getUsersInfo(unknownMembers);
            // TODO
        }
    };

    const getCurrentPresences = async function () {
        const user_ids = await getUserIds();
        const parameter = { "ids": user_ids };
        const presences = await postGraphApi("/beta/communications/getPresencesByUserId", parameter)
        const presence_list = [];
        for (let presence of presences) {
            presence_list.push({
            })
            presence_map[presence["id"]] = presence;
        }
        return presence_map;
    };

    const fetchCurrentStatus = async function (args) {
        return await getGraphApi("/v1.0/me");
    };

    const notifyLoginStatusChanged = function () {
        browser.runtime.sendMessage({
            "type": "loginStatusChanged", "args": {
                "loggedin": gGraphApiToken.isLoggedIn(),
                "tenant": gGraphApiToken.tenant,
                "client_id": gGraphApiToken.client_id
            }
        });
    };

    const login = async function (args) {
        if (!(gGraphApiToken.hasValidTenantAndClientId())) {
            throw new Error("Tenant or Client ID is not valid.");
        }
        const url = await gGraphApiToken.getAuthorizationUrl();
        await browser.tabs.create({ active: true, url: url });
        notifyLoginStatusChanged();
    };

    const initializeToken = async function (args) {
        await gGraphApiToken.initialize(args.url);
        notifyLoginStatusChanged();
    };

    const saveOptions = async function (args) {
        const error_message = [];
        try {
            gOptionData.tenant = args.tenant;
        } catch (error) {
            error_message.push(error.message);
        }
        try {
            gOptionData.client_id = args.client_id;
        } catch (error) {
            error_message.push(error.message);
        }
        try {
            gOptionData.member_list = args.member_list;
        } catch (error) {
            error_message.push(error.message);
        }
        if (error_message.length > 0) {
            return { "result": false, "error_message": error_message };
        }

        await gOptionData.save();

        gGraphApiToken.setTenantAndClientId(gOptionData.tenant, gOptionData.client_id);
        gUserIdCache.setMemberList(gOptionData.member_list);
        notifyLoginStatusChanged();

        return { "result": true };
    };

    const loginStatus = async function (args) {
        return {
            "loggedin": gGraphApiToken.isLoggedIn(),
            "tenant": gGraphApiToken.tenant,
            "client_id": gGraphApiToken.client_id
        };
    };

    const loadOptions = async function (args) {
        return {
            "tenant": gOptionData.tenant,
            "client_id": gOptionData.client_id,
            "member_list": gOptionData.member_list
        };
    };

    const closeThisTab = function (tab) {
        browser.tabs.remove(tab.id);
    };

    const onMessage = function (message, sender, sendResponse) {
        console.log("onMessage");
        try {
            switch (message.type) {
                case "closeThisTab":
                    closeThisTab(sender.tab);
                    return;
                case "login":
                    return login(message.args);
                case "initializeToken":
                    return initializeToken(message.args);
                case "loginStatus":
                    return loginStatus(message.args);
                case "fetchCurrentStatus":
                    return fetchCurrentStatus(message.args);
                case "saveOptions":
                    return saveOptions(message.args);
                case "loadOptions":
                    return loadOptions(message.args);
                default:
                    throw new Error(`Unknown type: ${message.type}`);
            }
        } catch (err) {
            console.error(err);
            return Promise.reject(`${err}`);
        }
    }

    // chrome.browserAction.onClicked.addListener(tab => {
    //     console.log("onClicked");
    //     onClicked(tab);
    // });

    browser.runtime.onMessage.addListener(onMessage);

    ctx.a = gGraphApiToken;
})(TeamsPresenceChecker);
