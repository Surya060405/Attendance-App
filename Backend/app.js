const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const userModel = require('./models/user');
const path = require('path');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "https://attendanceapp-gamma.vercel.app", 
  credentials: true 
}));

// app.use(express.static(path.join(__dirname,"/frontend/dist")))




// Database Connection - ( MongoDB Atlas )
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' MongoDB Connected');
  } catch (err) {
    console.error(' MongoDB Connection Error:', err);
    process.exit(1); // Exit process with failure
  }
};

// Call the connect function
connectDB();

// MIDDLEWARE - TO CHECK WHETHER USER LOGGED IN OR NOT
const isLoggedin = function(req,res,next){
    
    try{
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Login required' });

    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next() ;
    }
    catch(err){
          return res.status(403).json({ message: 'Invalid Token' });
    }

}

app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// REGISTER ROUTE
app.post('/register', async (req, res) => {

  try {
    const { name, enrollmentId, password } = req.body;

    let user = await userModel.findOne({ enrollmentId });
    if (user) return res.status(409).json({ message: 'User Already Exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await userModel.create({
      name,
      enrollmentId,
      password: hashedPassword,
    });

    const token = jwt.sign({ enrollmentId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'None',
        secure: true, 
      })
      .status(201)
      .send({ message: 'User Registered Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// LOGIN ROUTE
app.post('/login', async (req, res) => {
  try {
    const { enrollmentId, password } = req.body;

    const user = await userModel.findOne({ enrollmentId });
    if (!user)
      return res.status(404).json({ message: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect Password' });

    const token = jwt.sign({ enrollmentId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      })
      .status(200)
      .json({ message: 'Login Successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.post('/mark-attendance' , isLoggedin , async (req,res) => {
       
     const { name , enrollmentId } = req.body ;
     
    try {
  return res.status(200).json({ message: 'User is Logged In' });

} catch (error) {
  return res.status(500).json({ message: 'Failed to mark attendance.' });
}

})

app.get('/auth/check', (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ loggedIn: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(403).json({ loggedIn: false });
  }
});



const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

});
