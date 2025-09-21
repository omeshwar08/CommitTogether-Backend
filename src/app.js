const express = require("express")
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const authRouters = require("./routers/authentications")
const profileRouter = require("./routers/profile")
const requestRouter = require("./routers/request")
const userRouter = require("./routers/userRouter")

app.use("/", authRouters)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)

connectDB()
    .then(() => {
        console.log("DB successfully connected");
        app.listen(3000, () => {
            console.log("Server connected successfully");
        })
    })
    .catch((error) => {
        console.error(error)
    })