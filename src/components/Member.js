export class Member {
  constructor(name, email, startDate = new Date()) {
    this.name = name;
    this.email = email;
    this.startDate = new Date(startDate);
  }

  getMembershipDuration() {
    const now = new Date();
    const diffTime = now - this.startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = (diffDays / 365).toFixed(1);
    return diffYears;
  }

  isLoyalMember() {
    return this.getMembershipDuration() >= 1;
  }
}
