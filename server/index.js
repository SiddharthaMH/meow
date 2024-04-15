const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());
//await pool.connect();
app.listen(5003, () =>
{
    console.log("listening to Sid's port 5000");
});

app.post("/sregister", async(req,res)=>{
    console.log('Hello');
    console.log('desc ',req.body);
    try {
        const {username, password} = req.body;
        console.log(username);// name is username, email is password
        const newuser = await pool.query("INSERT INTO auth Values($1,$2)",[username,password]);
        res.status(200);
    } catch (error) {
        console.log(error.message);
    }
    res.send("user successfully registered");
}),


    app.post("/ssignin", async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Query the database to find a user with the provided username and password
            const newuser = await pool.query("SELECT * FROM auth WHERE name = $1 AND password = $2", [username, password]);
            
            if (newuser.rows.length === 0) {
                // No user found with the provided credentials
                return res.status(401).json({ error: "Invalid username or password" });
            }
            
            // User authenticated successfully
            res.status(200).json({ message: "Sign-in successful", newuser: newuser.rows[0] });
        } catch (error) {
            console.error("Error signing in:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
}),


app.post("/fregister", async (req, res) => {
    console.log('desc ', req.body);
    try {
        const { facultyId, username, password } = req.body;
        console.log(username);// name is username, email is password
        const newuser = await pool.query("INSERT INTO teach VALUES($1,$2,$3)", [username, password, facultyId]);
        res.status(200).json({ message: "User successfully registered" });
    } catch (error) {
        console.log(error.message);
        if (error.message.includes('duplicate key value violates unique constraint "unique_username_constraint"')) {
            res.status(400).json({ error: 'Username already exists' });
        } else if (error.message.includes('duplicate key value violates unique constraint "teach_pkey"')) {
            res.status(400).json({ error: 'Faculty ID already registered' });
        } else {
            res.status(500).json({ error: 'An error occurred while registering faculty' });
        }
    }
}),






app.post("/fsignin", async (req, res) => {
    try {
        const { facultyId, username, password } = req.body;
        
        // Query the database to find a user with the provided username and password
        const newuser = await pool.query("SELECT * FROM teach WHERE username = $1 AND password = $2 AND fid = $3", [username, password,facultyId]);
        
        if (newuser.rows.length === 0) {
            // No user found with the provided credentials
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        // User authenticated successfully
        res.status(200).json({ message: "Sign-in successful", newuser: newuser.rows[0] });
    } catch (error) {
        console.error("Error signing in:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}),
app.post("/update-timings", async (req, res) => {
    try {
      const { facultyId, dayOfWeek, startTime, endTime } = req.body;
        console.log("Hi",req.body);
        console.log("Faculty id:",facultyId);
        console.log("Day:",dayOfWeek);
        console.log("Start:",startTime);
        console.log("End:",endTime);
      // Get current time
      const currentTime = new Date();
  
      // Insert or update the timings in the database
      const result = await pool.query(
        `INSERT INTO faculty_schedule (fid, day_of_week, start_time, end_time, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (fid, day_of_week)
         DO UPDATE SET start_time = $3, end_time = $4, updated_at = $5`,
        [facultyId, dayOfWeek, startTime, endTime, currentTime]
      );
  
      res.status(200).send("Timings updated successfully");
    } catch (error) {
      console.error("Error updating timings:", error);
      res.status(500).send("Internal Server Error");
    }
}),

app.put("/update-existing-timings", async (req, res) => {
    try {
      const { facultyId, dayOfWeek, startTime, endTime } = req.body;
  
      // Get current time
      const currentTime = new Date();
  
      // Update the timings in the database
      const result = await pool.query(
        `UPDATE faculty_schedule
         SET start_time = $1, end_time = $2, updated_at = $3
         WHERE fid = $4 AND day_of_week = $5`,
        [startTime, endTime, currentTime, facultyId, dayOfWeek]
      );
  
      res.status(200).send("Existing timings updated successfully");
    } catch (error) {
      console.error("Error updating existing timings:", error);
      res.status(500).send("Internal Server Error");
    }
  }),

  app.post("/update-live-status", async (req, res) => {
    try {
        const { facultyId, liveStatus } = req.body;

        // Update the live status in the database
        const result = await pool.query(
            "UPDATE faculty SET live_status = $1 WHERE fid = $2",
            [liveStatus, facultyId]
        );

        res.status(200).send("Live status updated successfully");
    } catch (error) {
        console.error("Error updating live status:", error.message);
        res.status(500).send("Internal Server Error: " + error.message); // Add error message to response
    }
});



