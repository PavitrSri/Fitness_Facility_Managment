

//Spike 2 - Display Gym Hours 
//Store the hours as its going to be constant

const gymHrs = {
    "Monday - Friday" : "6 a.m - 11 p.m" ,
    "Saturday - Sunday" : "8 a.m - 10 p.m"
}
//component that sould appear on the screen
function Gymhrs(){
  return(
    <div>
        <h2>Hours of Operation</h2>
        <h3>Regular Hours</h3>
        <p> Monday - Friday" : "6 a.m - 11 p.m </p>
        <p> Saturday - Sunday" : "8 a.m - 10 p.m </p>
        <p><em> Holiday hours may differ </em></p>
    </div>
  );
    }
    //to display on the website
function App(){
    display(Gymhrs)
}


