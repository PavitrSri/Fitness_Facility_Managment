import { Review } from './Review.js';
import request from './ConnectBackend.js';
import Cookies from 'js-cookie';

export class ReviewManager {
  constructor(containerId = "ReviewManagerDisplay") {
    this.reviews = [];
    this.containerId = containerId;
    this.container = this._createContainer();
    this.initReviews();
  }
  
  async initReviews() {  
    const storedReviews = await request("getReviews", null);
    console.log(storedReviews);
    console.log(storedReviews.length);
    if (!storedReviews) return;
    storedReviews.map((r) => this.reviews.push(new Review(
      r.name,
      r.rating,
      r.content,
      r.date
    )));
    console.log(this.reviews);
    /*
    for (let i = 0; i < storedReviews.length; i++) {
      let review = new Review(
        storedReviews[i].name,
        storedReviews[i].rating,
        storedReviews[i].content,
        storedReviews[i].date
      );
      console.log(this.reviews);
      this.reviews.push(review);
    }
      */
  }

async getReviews() {
  return [...this.reviews];
}


  _createContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      //container.style.border = "1px solid #000";
      //container.style.padding = "10px";
      //container.style.margin = "10px 0";
      //container.innerHTML = "<h2>Reviews</h2>";
      document.body.appendChild(container);
    }
    return container;
  }

  async addReview(rating, comment) {
    const cookie = Cookies.get("token");
    const user = await request("getUser", [cookie]);
    if (!user) {
      alert("❌ You must be logged in to leave a review.");
      return;
    }

    const author = user.name;

    if (rating < 1 || rating > 5) {
      alert("❌ Invalid rating. Must be between 1 and 5.");
      return;
    }

    await request("addReview", [cookie, rating, comment]);

    const review = new Review(author, rating, comment, new Date());
    this.reviews.push(review);

   // this.displayReviews();
    alert("✅ Review added successfully!");
  }

  /*displayReviews() {
    if (!this.container) return;

    this.container.innerHTML = "<h2>Reviews</h2><h3>All Reviews:</h3>";

    if (this.reviews.length === 0) {
      this.container.innerHTML += "<p>No reviews yet.</p>";
      return;
    }

    this.reviews.forEach((r) => {
      const reviewDiv = document.createElement("div");
      reviewDiv.innerHTML = `⭐ ${r.rating}/5 by ${r.author}<br>"${r.comment}" - ${r.date.toLocaleDateString()}`;
      reviewDiv.style.border = "1px solid #ccc";
      reviewDiv.style.padding = "5px";
      reviewDiv.style.margin = "5px 0";
      this.container.appendChild(reviewDiv);
    });

    const avgDiv = document.createElement("div");
    avgDiv.innerHTML = `<strong>Average Rating: ${this.averageRating()}</strong>`;
    avgDiv.style.marginTop = "10px";
    this.container.appendChild(avgDiv);
  }*/

  averageRating() {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews.length).toFixed(2);
  }
}
