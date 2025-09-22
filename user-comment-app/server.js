const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// Routes
const userRoutes = require("./routes/user.routes");
const commentRoutes = require("./routes/comment.routes");

app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT, () =>
            console.log(`Server running on port ${process.env.PORT}`)
        );
    })
    .catch(err => console.error(err));
