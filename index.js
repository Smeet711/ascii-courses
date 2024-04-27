require("dotenv").config();
const cors = require("cors");  // react can connect with server with the help of cors.
const express = require("express");   // to start the server
const connectDB = require("./connectDB");
const Book = require('./models/Books');
const multer = require("multer");     // 
const cloudinary = require("./utils/cloudinary");

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();
// middlewares below
app.use(cors());
app.use(express.urlencoded( { extended: true } ));

app.use(express.json());
app.use("/uploads", express.static("uploads"));  // to give access to db

// all apis below




// Get All Books
app.get("/api/books", async (req, res) => {
  try {
    const category = req.query.category;   // filtering data based on filters
    //const stars = req.query.stars;    // you can also do based on rating, price, title a-z

    const filter = {};
    if(category) {
      filter.category = category;
    }

    const data = await Book.find(filter);
    
    if (!data) {
      throw new Error("An error occurred while fetching books.");
    }
    
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Book.findById(courseId);

    if (!course) {
      throw new Error("Course not found");
    }

    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the course." });
  }
});


// Create A Book
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
})

const upload = multer({ storage: storage })

app.post("/api/books", upload.single("thumbnail")  ,async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const newBook = new Book({
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
      thumbnail: req.file.filename,
      price:req.body.price
    })

    await Book.create(newBook);
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});

// new api
// app.post("/api/createcourse", upload.single("thumbnail"), async (req, res) => {
//   try {
//     // Upload image to cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path);

//     // Create new book
//     const newBook = new Book({
//       title: req.body.title,
//       slug: req.body.slug,
//       stars: req.body.stars,
//       description: req.body.description,
//       category: req.body.category,
//       thumbnail: result.secure_url, // Save the image link instead of filename
//       cloudinary_id: result.public_id, // Save the public id for potential future use
//       price: req.body.price
//     });

//     // Save book
//     await newBook.save();

//     // Send response
//     res.json(newBook);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "An error occurred while uploading the book." });
//   }
// });
//

app.post("/api/createcourse", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary

    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }


    const result = await cloudinary.uploader.upload(req.file.path);

    // Create new course
    const newCourse = new Book({
      name: req.body.name,
      image: result.secure_url, // Save the image link instead of filename
      description: req.body.description,
      startDate: req.body.startDate,
      timings: req.body.timings,
      targetAudience: req.body.targetAudience,
      fees: req.body.fees,
      seatsAvailable: req.body.seatsAvailable,
    });

    // Save course
    await newCourse.save();

    // Send response
    res.json(newCourse);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred while uploading the course." });
  }
});



// Update A Book
app.put("/api/books", upload.single("thumbnail"), async (req, res) => {
  try {

    const bookId = req.body.bookId;

    const updateBook = {
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
      price:req.body.price
    }

    if (req.file) {
      updateBook.thumbnail = req.file.filename;
    }

    await Book.findByIdAndUpdate(bookId, updateBook)
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});

// to delete Book
app.delete("/api/books/:id", async(req,res) => {
  const bookId = req.params.id;

  try {
    await Book.deleteOne({_id: bookId});
    res.json("How dare you!" + req.body.bookId);
  } catch (error) {
    res.json(error);
  }
});


// app.post("/api/books", async (req, res) => {
//   try {
//     console.log(req.body);

//     const newBook = new Book({
//       title: req.body.title,
//       slug: req.body.slug,
//       stars: req.body.stars,
//       description: req.body.description,
//       category: req.body.category,
//       //thumbnail: req.file.thumbnail,
//     })

//     await Book.create(newBook);
//     res.json("Data Submitted");
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred while fetching books." });
//   }
// });

app.get("/", (req, res) => {
  res.json("Hello mate!");
});

app.get("*", (req, res) => {
  res.sendStatus("404");
});

app.listen(PORT, ()=> {
  console.log(`Server is running on Port: ${PORT}`);
});