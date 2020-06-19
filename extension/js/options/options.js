var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    const saveOptions = async function (dialog) {
        const tenant_value = document.getElementById("tenant").value;
        const client_id_value = document.getElementById("client_id").value;
        const member_list_value = document.getElementById("member_list").value;
        const message = {
            "type": "saveOptions",
            "args": {
                "tenant": tenant_value,
                "client_id": client_id_value,
                "member_list": member_list_value
            }
        };
        const result = await browser.runtime.sendMessage(message);

        if (!(result.result) && result.error_message.length > 0) {
            const msg = result.error_message.join("\n");
            document.querySelector("#error_message").textContent = msg;
            dialog.open();
            return;
        }

        M.toast({ html: "Saved successfully!" })
    };

    const login = async function () {
        browser.runtime.sendMessage({ "type": "login", "args": [] });
    };

    const logout = async function () {
        browser.runtime.sendMessage({ "type": "logout", "args": [] });
    };

    const synchronizeLoginStatus = async function () {
        const login_status = await browser.runtime.sendMessage({ "type": "loginStatus", "args": [] });
        document.getElementById("login_status").textContent = login_status.loggedin ? "OK" : "Not logged in.";
        document.getElementById("tenant_status").textContent = login_status.tenant;
        document.getElementById("client_id_status").textContent = login_status.client_id;

        if (login_status.tenant && login_status.client_id) {
            document.getElementById("login_button").classList.remove("disabled");
        } else {
            document.getElementById("login_button").classList.add("disabled");
        }
        if (login_status.loggedin) {
            document.getElementById("logout_button").classList.remove("disabled");
        } else {
            document.getElementById("logout_button").classList.add("disabled");
        }
    };

    const loadOptions = async function () {
        const optoin_data = await browser.runtime.sendMessage({ "type": "loadOptions", "args": [] });
        document.getElementById("tenant").value = optoin_data.tenant;
        document.getElementById("client_id").value = optoin_data.client_id;
        document.getElementById("member_list").value = optoin_data.member_list;
        M.updateTextFields();
        M.textareaAutoResize(document.getElementById('member_list'));
    };

    document.addEventListener("DOMContentLoaded", e => {
        const dialog_elem = document.getElementById("error_dialog");
        const dialog = M.Modal.init(dialog_elem);

        loadOptions();
        synchronizeLoginStatus();

        document.getElementById("main_form").addEventListener("submit", e => {
            e.preventDefault();
            saveOptions(dialog);
        });
        document.getElementById("login_button").addEventListener("click", e => {
            e.preventDefault();
            login();
        });
        document.getElementById("logout_button").addEventListener("click", e => {
            e.preventDefault();
            logout();
        });
    });

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case "loginStatusChanged":
                synchronizeLoginStatus();
                break;
            default:
                break;
        }
    })
})(TeamsPresenceChecker);

