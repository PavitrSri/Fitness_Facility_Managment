import React, { useState } from "react";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";
import img7 from "../assets/7.jpg";
import img8 from "../assets/8.jpg";
import img9 from "../assets/9.jpg";
import img10 from "../assets/10.jpg";
import img11 from "../assets/11.jpg";
import img12 from "../assets/12.jpg"; 
import "./Schedule.css";  

const images = [
  img1, img2, img3, img4, img5, img6,
  img7, img8, img9, img10, img11, img12
];
function Schedule() {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((index+1)%images.length);
  };

  const prev = () => {
    setIndex((index-1+images.length)%images.length);
  };

  return (
    <div className="slider">
      <img src={images[index]} alt="slide" className="slide-img" />

      <div className="slider-buttons">
        <button onClick={prev}>←</button>
        <button onClick={next}>→</button>
      </div>
    </div>
  );
}

export default Schedule;