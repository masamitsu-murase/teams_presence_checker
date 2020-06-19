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
        const presences = status.presences;
        const users_info = status.users_info;
        const vue_users = [];
        for (let i = 0; i < presences.length; i++) {
            const presence = presences[i];
            const user = {
                displayName: `${users_info[i].surname} ${users_info[i].givenName}`,
                mail: users_info[i].mail
            };
            const availability_map = {
                "Available": "green",
                "Busy": "red",
                "Away": "yellow",
                "BeRightBack": "gray"
            };
            user.presence_color = availability_map[presence.availability];
            user.title = `${presence.availability}: ${presence.activity}`;
            vue_users.push(user);
        }
        vm.users.splice.apply(vm.users, [0, vm.users.length].concat(vue_users));
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
            },
            methods: {
                openOptions: function (event) {
                    browser.runtime.openOptionsPage();
                }
            }
        });

        const refresh_link = document.getElementById("refresh_link");
        if (refresh_link) {
            refresh_link.addEventListener("click", e => {
                e.preventDefault();
                refreshStatus();
            });
        }

        refreshStatus();
    });
})(TeamsPresenceChecker);

