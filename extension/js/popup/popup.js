var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    const fetchCurrentStatus = async function () {
        return await browser.runtime.sendMessage({ "type": "fetchCurrentStatus" });
    };

    const updateView = function (status) {
        console.log(status);
    };

    const refreshStatus = async function () {
        const status = await fetchCurrentStatus();
        updateView(status);
    };

    document.addEventListener("DOMContentLoaded", e => {
        const elem = document.getElementById("refresh_link");
        elem.addEventListener("click", e => {
            refreshStatus();
        });
    });
})(TeamsPresenceChecker);

