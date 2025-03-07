// src/pages/MealPlanner.js
import React, { useState } from "react";
import axios from "axios";
import { Button, Container, Typography, Box, Paper } from "@mui/material";

const Recommendations = () => {
  const [mealPlan, setMealPlan] = useState("");

  const generateMealPlan = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-meal-plan",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")} `},
        }
      );
      setMealPlan(response.data.mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ color: "#00ff00" }}>
        Meal Planner
      </Typography>
      <Button variant="contained" color="primary" onClick={generateMealPlan}>
        Generate Meal Plan
      </Button>
      <Box mt={4}>
        <Paper sx={{ backgroundColor: "#121212", padding: 2 }}>
          <Typography variant="h6" sx={{ color: "#00ff00" }}>
            Your Meal Plan:
          </Typography>
          <pre style={{ color: "#ffffff" }}>{mealPlan}</pre>
        </Paper>
      </Box>
    </Container>
  );
};

export default Recommendations;