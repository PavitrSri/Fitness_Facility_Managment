import React, { useState, useEffect } from "react";
import "./Booking.css";
import request from "./ConnectBackend.js";
import Cookies from "js-cookie";

// Fixed daily times
const Open_hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
let setAvailableTimes

async function loadAvailableTimes(formData) {
    if (!formData.serviceID || !formData.date) return;

      
      const booked = await request("getBookedTimes", [
        formData.serviceID,
        formData.date
      ]);

      
      const bookedHours = booked.map(b => {
     // If backend returns full datetime: "2025-01-20T13:00:00"
        const date = new Date(b);
        const hh = String(date.getHours()).padStart(2, "0");
    return `${hh}:00`;
});


    
      const freeTimes = Open_hours.filter(
        time => !bookedHours.includes(time)
      );

      // 
      setAvailableTimes(
        freeTimes.map((time, i) => ({
          serviceTimeID: i,
          startTime: time
        }))
      );
    
  }


export default function Booking() {


  const [services, setServices] = useState([]);
  
  const [equipment, setEquipment] = useState([]);

let availableTimes;
[availableTimes, setAvailableTimes] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    serviceID: "",
    equipmentID: "",
    date: "",
    serviceTimeID: "",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  // Fetch backend data
  useEffect(() => {
    async function loadData() {
      const servicesRes = await request("getServices", null);
      const equipmentRes = await request("getEquipment", null);

      setServices(servicesRes || []);
      setEquipment(equipmentRes || []);
    }
    loadData();
  }, []);


useEffect(() => {
  
  loadAvailableTimes(formData);
}, [formData.serviceID, formData.date]);


  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit booking
  const handleSubmit = async () => {
    const newErrors = {};
    const required = ["serviceID", "date", "serviceTimeID"];

    required.forEach(f => {
      if (!formData[f]) newErrors[f] = "Required";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Get actual selected time
    const selectedTime = availableTimes.find(
    t => t.serviceTimeID === Number(formData.serviceTimeID)
    )?.startTime;

  

const finalDateTime = `${formData.date}T${selectedTime}:00`;




    
      await request("addBooking", [
        Cookies.get("token"),                   // user token
        formData.equipmentID || null,      // equipment optional
        formData.serviceID || null,        // service
        finalDateTime,                     // full datetime
        formData.notes || "",              // notes
        true                               // status
      ]);

      alert("Booking confirmed!");
      //  reset form and refresh available times
      setFormData(prev => ({ ...prev, serviceTimeID: "" }));
      loadAvailableTimes(formData);
      
  };

  return (
    <div className="booking-container">
      <h2>Make a Booking</h2>

      
      <select
        name="serviceID"
        value={formData.serviceID}
        onChange={handleChange}
      >
        <option value="">Select service</option>
        {services.map(s => (
          <option key={s.serviceID} value={s.serviceID}>
            {s.description}
          </option>
        ))}
      </select>
      {errors.serviceID && <span className="error-text">Required</span>}


      
      <select
        name="equipmentID"
        value={formData.equipmentID}
        onChange={handleChange}
      >
        <option value="">(Optional) Choose equipment</option>
        {equipment.map(eq => (
          <option key={eq.equipmentID} value={eq.equipmentID}>
            {eq.description}
          </option>
        ))}
      </select>

    
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />
      {errors.date && <span className="error-text">Required</span>}

      
      <select
        name="serviceTimeID"
        value={formData.serviceTimeID}
        onChange={handleChange}
        disabled={!formData.serviceID || !formData.date}
      >
        <option value="">Select time slot</option>
        {availableTimes.map(t => (
          <option key={t.serviceTimeID} value={t.serviceTimeID}>
            {t.startTime}
          </option>
        ))}
      </select>
      {errors.serviceTimeID && <span className="error-text">Required</span>}

      
      <textarea
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Notes or special requests"
      />

      <button onClick={handleSubmit}>Confirm Booking</button>
    </div>
  );
}