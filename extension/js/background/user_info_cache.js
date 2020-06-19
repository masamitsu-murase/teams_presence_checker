var TeamsPresenceChecker;
if (!TeamsPresenceChecker) {
    TeamsPresenceChecker = {};
}

(function (ctx) {
    "use strict";

    class UserInfoCache {
        constructor() {
            this.setMemberList([]);
        }

        clear() {
            this.setMemberList([]);
        }

        get memberList() {
            return this._member_list;
        }

        userInfo(member) {
            return this._user_info_map[member];
        }

        get usersInfo() {
            const user_info_map = this._user_info_map;
            return this._member_list.map(x => user_info_map[x]);
        }

        get userIds() {
            const user_info_map = this._user_info_map;
            return this._member_list.map(x => user_info_map[x]["id"]);
        }

        unknownMembers() {
            const user_info_map = this._user_info_map;
            return this._member_list.filter(x => !(x in user_info_map));
        }

        setMemberList(member_list) {
            this._member_list = member_list;
            this._user_info_map = {};
        }

        setUserInfo(member, user_info) {
            this._user_info_map[member] = user_info;
        }

        setUsersInfo(members, users_info) {
            for (let i = 0; i < members.length; i++) {
                const member = members[i];
                const user_info = users_info[i];
                this._user_info_map[member] = user_info;
            }
        }
    }

    ctx.UserInfoCache = UserInfoCache;
})(TeamsPresenceChecker);
