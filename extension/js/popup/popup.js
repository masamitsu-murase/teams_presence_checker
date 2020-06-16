var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    let vm = null;

    const fetchCurrentStatus = async function () {
        return await browser.runtime.sendMessage({ "type": "fetchCurrentStatus" });
    };

    const updateView = function (status) {
        vm.healthy = true;
        console.log(status);
    };

    const refreshStatus = async function () {
        try {
            const status = await fetchCurrentStatus();
            updateView(status);
        } catch (err) {
            console.error(err);
            vm.healthy = false;
        }
    };

    document.addEventListener("DOMContentLoaded", e => {
        vm = new Vue({
            el: "#app",
            data: {
                healthy: true,
                users: []
            }
        });

        const refresh_link = document.getElementById("refresh_link");
        if (refresh_link) {
            refresh_link.addEventListener("click", e => {
                e.preventDefault();
                refreshStatus();
            });
        }
        const open_options = document.getElementById("open_options");
        if (open_options) {
            addEventListener("click", e => {
                e.preventDefault();
                browser.runtime.openOptionsPage();
            });
        }

        refreshStatus();
    });
})(TeamsPresenceChecker);

