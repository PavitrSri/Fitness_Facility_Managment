export class Review {
  constructor(author, rating, comment, date) {
    this.author = author;
    this.rating = rating;
    this.comment = comment;
    this.date = new Date(date);
  }
}
