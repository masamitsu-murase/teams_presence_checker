var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    const fetchCurrentStatus = async function () {
        return await browser.runtime.sendMessage({ "type": "fetchCurrentStatus" });
    };

    const updateView = function (vm, status) {
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

    const refreshStatus = async function (vm) {
        try {
            const status = await fetchCurrentStatus();
            updateView(vm, status);
        } catch (err) {
            console.error(err);
            vm.healthy = false;
        }
    };

    const openOptions = function (event) {
        browser.runtime.openOptionsPage();
    };

    ctx.refreshStatus = refreshStatus;
    ctx.openOptions = openOptions;
})(TeamsPresenceChecker);

