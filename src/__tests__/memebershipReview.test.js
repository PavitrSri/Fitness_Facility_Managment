// membershipReview.test.js
const MembershipManager = require('../components/MembershipManager');
const ReviewManager = require('../components/ReviewManager');

describe('Gym Membership System', () => {
  let memberManager;
  let reviewManager;

  beforeEach(() => {
    memberManager = new MembershipManager.MembershipManager();
    reviewManager = new ReviewManager.ReviewManager();
  });

  test('Enroll members with correct name, email, and start date', () => {
    const startDate1 = "2022-09-01";
    const startDate2 = "2024-01-01";

    const member1 = memberManager.enrollMember("John Doe", "john@example.com", startDate1);
    const member2 = memberManager.enrollMember("Jane Smith", "jane@example.com", startDate2);

    expect(memberManager.members.length).toBe(2);

    // Test all parameters
    expect(member1.name).toBe("John Doe");
    expect(member1.email).toBe("john@example.com");
    expect(member1.startDate.toISOString().split('T')[0]).toBe(startDate1);

    expect(member2.name).toBe("Jane Smith");
    expect(member2.email).toBe("jane@example.com");
    expect(member2.startDate.toISOString().split('T')[0]).toBe(startDate2);
  });

  test('Add reviews with all parameters', () => {
    const reviewDate = new Date();

    reviewManager.addReview("John Doe", 5, "Amazing gym!");
    reviewManager.addReview("Jane Smith", 4, "Good equipment.");

    expect(reviewManager.reviews.length).toBe(2);

    // Test all parameters for first review
    const r1 = reviewManager.reviews[0];
    expect(r1.author).toBe("John Doe");
    expect(r1.rating).toBe(5);
    expect(r1.comment).toBe("Amazing gym!");
    expect(r1.date).toBeInstanceOf(Date);

    // Test all parameters for second review
    const r2 = reviewManager.reviews[1];
    expect(r2.author).toBe("Jane Smith");
    expect(r2.rating).toBe(4);
    expect(r2.comment).toBe("Good equipment.");
    expect(r2.date).toBeInstanceOf(Date);
  });

  test('Calculate average rating correctly', () => {
    reviewManager.addReview("John Doe", 5, "Amazing gym!");
    reviewManager.addReview("Jane Smith", 4, "Good equipment.");

    expect(reviewManager.averageRating()).toBe("4.50");
  });

});
