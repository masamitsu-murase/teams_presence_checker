var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    var authenticate = function () {
        var url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
        var redirect_uri = chrome.identity.getRedirectURL();
        var scope = ["User.Read", "User.ReadBasic.All", "offline_access", "openid", "profile"];
        var client_id = "ec292358-d8ed-4329-b033-c13416337105";
        var param = new URLSearchParams();
        param.append("client_id", client_id);
        param.append("redirect_uri", redirect_uri);
        param.append("scope", scope.join(" "));
        param.append("response_type", "code");
        param.append("prompt", "select_account");
        console.log(`${url}?${param}`);
        var details = {
            url: `${url}?${param}`,
            interactive: true
        };
    };

    var myStatus = async function (token) {
        var headers = {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        };
        let response = await fetch("https://graph.microsoft.com/v1.0/me")
    };

    console.log("popup");

    document.addEventListener("DOMContentLoaded", e => {
        document.querySelector("li").addEventListener("click", e => {
            console.log(browser.identity.getRedirectURL());
            console.log("click");
            authenticate();
        });

        document.querySelector("#popup_button").addEventListener("click", e => {
            console.log("clicked");
            browser.browserAction.openPopup();
        });
    });
})(TeamsPresenceChecker);

