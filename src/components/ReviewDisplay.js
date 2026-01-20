import React, { useEffect, useRef, useState } from "react";
import { ReviewManager } from "./ReviewManager.js";
import request from "./ConnectBackend.js";
import Cookies from "js-cookie";

/**
 * Robust ReviewDisplay:
 * - Manager stored in a ref so it's created exactly once per mounted root.
 * - Deduplicates incoming reviews by id (or fallback composite key).
 * - Normalizes date to Date object for toLocaleDateString usage.
 * - Uses stable keys (id when available).
 */

function ReviewDisplay() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const managerRef = useRef(null);      // hold ReviewManager instance
  const initializedRef = useRef(false); // guard to avoid duplicate init flows

  // utility: dedupe and normalize date
  const dedupeAndNormalize = (arr) => {
    const seen = new Map();
    for (const r of (arr || [])) {
      // use id if present, otherwise create a composite key
      const id = r.id ?? r._id ?? `${r.author}||${r.rating}||${r.comment}||${r.date}`;
      if (!seen.has(id)) {
        // normalize date into a Date object if possible
        const dateObj = r.date ? new Date(r.date) : new Date();
        seen.set(id, { ...r, id, date: dateObj });
      }
    }
    return Array.from(seen.values());
  };

  useEffect(() => {
    // login check for showing form
    request("getUser", [Cookies.get("token")]).then((user) => {
      setLoggedIn(user !== undefined);
    });

    // create the manager exactly once per mounting of this tree
    if (!managerRef.current) {
      managerRef.current = new ReviewManager();
    }

    // initReviews/getReviews might be called multiple times (strict mode, HMR, etc).
    // Guard with initializedRef so we only start our load-flow once per mount.
    if (!initializedRef.current) {
      initializedRef.current = true;

      (async () => {
        const mgr = managerRef.current;

        // If your ReviewManager exposes initReviews, call it (optional).
        // Wrap in try/catch in case it throws or doesn't exist.
        try {
          if (typeof mgr.initReviews === "function") {
            await mgr.initReviews();
          }
        } catch (err) {
          // ignore init errors but still try to fetch reviews
          // console.error("initReviews error:", err);
        }

        // fetch current reviews and dedupe
        try {
          const rev = await mgr.getReviews();
          setReviews(dedupeAndNormalize(rev));
        } catch (err) {
          // console.error("getReviews failed:", err);
          setReviews([]);
        }
      })();
    }

    // cleanup: optional (not strictly needed here)
    return () => {
      // We do NOT reset initializedRef here so remounts in StrictMode behave fine.
      // If you want a fresh init after unmount, uncomment the next line:
      // initializedRef.current = false;
    };
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    const mgr = managerRef.current;
    if (!mgr) return;

    // ensure number rating
    const r = Number(rating) || 0;

    try {
      await mgr.addReview(parseInt(r, 10), comment);

      // fetch fresh list and dedupe
      const newList = await mgr.getReviews();
      setReviews(dedupeAndNormalize(newList));
    } catch (err) {
      // console.error("addReview/getReviews failed:", err);
    }

    setRating(5);
    setComment("");
  };

  const averageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return (sum / reviews.length).toFixed(2);
  };

  return (
    <div style={{ margin: "20px 0" }}>
      {loggedIn && (
        <form onSubmit={handleAddReview} style={{ marginBottom: "20px" }}>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} ⭐
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Your review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            style={{ margin: "0 10px", width: "300px" }}
          />

          <button type="submit">Add Review</button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div>
          {reviews.map((r) => (
            <div
              key={r.id} // stable key (falls back to composite id above)
              style={{
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#fafafa",
              }}
            >
              <strong>
                ⭐ {r.rating}/5 by {r.author}
              </strong>
              <p>"{r.comment}"</p>
              <small>{new Date(r.date).toLocaleDateString()}</small>
            </div>
          ))}

          <div style={{ marginTop: "10px" }}>
            <strong>Average Rating: {averageRating()}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewDisplay;
