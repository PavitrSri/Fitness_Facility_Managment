import request from "./ConnectBackend.js";
import Cookies from "js-cookie";
import React, { useState } from "react";
import "./LoginSignup.css";
 
export default function LoginSignup({onLoginSuccess}) {
  const [currentPage, setCurrentPage] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
 
 
  const handleInputChange = (e) => {
  const field = e.target.name;
  const value = e.target.value;
 
  setFormData({
    ...formData,
    [field]: value
  });
 
  if (errors[field]) {
    setErrors({
      ...errors,
      [field]: ""
    });
  }
};
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    // for basic form validation..I’ll change this up later maybe to include validation errors from backend
    const newErrors = {};
 
    // Required fields
    let requiredFields = [];
 
if (currentPage === "login") {
  requiredFields = ["email", "password"];
} else {
  requiredFields = ["name", "email", "password", "confirmPassword"];
}
 
  for (let i = 0; i < requiredFields.length; i++) {
  let field = requiredFields[i];
  if (!formData[field]) {
    newErrors[field] = field + " is required";
  }
}
 
    // Password match check while signing up
    if (currentPage === "signup") {
        if (formData.password && formData.confirmPassword) {
            if (formData.password !== formData.confirmPassword) {
             newErrors.confirmPassword = "Passwords do not match";
            }
        }
  }
 
 
    setErrors(newErrors);
 
    //  check for any errors, if not then continue to submit to backend
  if (Object.keys(newErrors).length === 0) {
    
            let response;
            if (currentPage === "login") {
            response = await request("login", [formData.email, formData.password]);
            } else {
            response = await request("addUser", [formData.name, formData.email, formData.password]);
            }
 
            //console.log(`${currentPage} response:`, response); // was debugging.... remove this  
            if (currentPage === "login") {
                if (response&&response.token) {     //Taskina- Making changes to make admin logic work
                 document.cookie = `token=${response.token}; path=/`;
                 alert("Login successful!");
                 const userInfo = await request("getUser",[response.token]);
                  if(userInfo?.isAdmin){
                    onLoginSuccess("admin");
                  } else {
                    onLoginSuccess("home");
                  }
                }
              } else{
              if (response){
                alert("Signup successful!");
                setCurrentPage("login");
             }
              else {
                alert("Signup failed! Email may already be in use."); 
              }
            } 
 
  }
};
 
 
  return (
    <div className="auth-container">
      <h2>{currentPage === "login" ? "Log In" : "Sign Up"}</h2>
 
      <form onSubmit={handleSubmit}>
        {currentPage === "signup" && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
           
                   
           
          </>
        )}
 
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          autoComplete="email"
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
       
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          autoComplete={currentPage === "login" ? "current-password" : "new-password"}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
 
        {currentPage === "signup" && (
          <>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </>
        )}
 
        <button type="submit">
          {currentPage === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
 
      <p className="switch-page">
  {currentPage === "login"
    ? "Don't have an account?"
    : "Already have an account?"}{" "}
 
  <span
    onClick={() => {
      // Switch page
      setCurrentPage(currentPage === "login" ? "signup" : "login");
 
      // Clear form data and erros when we swich pages
      setFormData({
        email: "",
        password: "",
        name: "",
        confirmPassword: ""
      });
      setErrors({});
    }}
  >
    {currentPage === "login" ? "Sign Up" : "Log In"}
    </span>
  </p>
 
 </div>
  );
}
