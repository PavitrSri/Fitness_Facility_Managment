import request from "./ConnectBackend.js";
import Cookies from "js-cookie";
export class MembershipManager {
  async enrollMember() {
    const cookie = Cookies.get("token");
    return await request("addMembership", [cookie]);
  }

  async checkMembershipStatus() {
    const cookie = Cookies.get("token");
    const result = await request("getMemberships", [cookie]);
    return result !== undefined && result.length > 0;
  }
}
