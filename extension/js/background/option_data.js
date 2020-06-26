var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    const guid_pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    class OptionData {
        constructor() {
            this._tenant = "";
            this._client_id = "";
            this._member_list_raw = "";
        }

        async save() {
            await browser.storage.local.set({
                "option_data": {
                    "tenant": this._tenant,
                    "client_id": this._client_id,
                    "member_list_raw": this._member_list_raw
                }
            });
        }

        get tenant() {
            return this._tenant;
        }

        set tenant(tenant_value) {
            tenant_value = tenant_value.toLowerCase().trim();
            if (!(tenant_value.match(guid_pattern) || tenant_value == "common")) {
                throw new Error("Tenant is invalid.");
            }
            this._tenant = tenant_value;
        }

        get client_id() {
            return this._client_id;
        }

        set client_id(client_id_value) {
            client_id_value = client_id_value.toLowerCase().trim();
            if (!(client_id_value.match(guid_pattern))) {
                throw new Error("Client ID is invalid.");
            }
            this._client_id = client_id_value;
        }

        get member_list_raw() {
            return this._member_list_raw;
        }

        get member_list() {
            return this.parseMemberList(this._member_list_raw);
        }

        set member_list_raw(raw_value) {
            this.parseMemberList(raw_value);
            this._member_list_raw = raw_value;
        }

        parseMemberList(member_list_raw) {
            const mail_pattern = "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*";
            member_list_raw = member_list_raw.trim().replace(/\s*,\s*/g, ",").replace(/\s+/g, ",");
            const member_list = member_list_raw.split(",");
            if (!(member_list.every(item => item.match(mail_pattern)))) {
                throw new Error("Member list is invalid.");
            }
            return member_list;
        }
    }

    OptionData.load = async function () {
        try {
            const raw_option_data = (await browser.storage.local.get("option_data")).option_data;
            const new_option_data = new OptionData();
            new_option_data.tenant = raw_option_data.tenant;
            new_option_data.client_id = raw_option_data.client_id;
            new_option_data.member_list_raw = raw_option_data.member_list_raw;
            return new_option_data;
        } catch (error) {
            return new OptionData();
        }
    }

    ctx.OptionData = OptionData;
})(TeamsPresenceChecker);
