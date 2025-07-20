import express from "express";
import axios from "axios";

const app = express();
const port = 3000; 
const API_URL_info = "https://openlibrary.org/search.json";
const API_URL_cover = "https://covers.openlibrary.org/b/olid/";

var userBooks = [];

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));


app.use((req, res, next) => {
    res.locals.getFullYear = () => new Date().getFullYear();
    res.locals.booksList = userBooks;
    res.locals.urlCover = API_URL_cover;
    next();
});


app.get("/", (req, res)=>{
    res.render("index.ejs");
})

app.get("/me", (req, res) =>{
    res.render("me.ejs");
})

app.get("/user-shelf", (req,res)=>{
    res.render("userShelf.ejs", {booksList: userBooks});
})

app.post("/find-book", async (req,res)=> {
    console.log(JSON.stringify(req.body))

    try {
        const result = await axios.get(API_URL_info + "?q=title_suggest:" + req.body.searchContent);
        const books = result.data.docs;
        // console.log(books);
        
        // const editionKey =  firstEdition?.key?.split("/books/")[1];
        // console.log(editionKey);
        res.render("index.ejs", {booksList : userBooks, books: books, urlCover : API_URL_cover});
    } catch (error) {
        
    }
})

app.post("/add-book", (req,res)=>{
    try {
        const bookJSON = req.body.addedBook;
        const book = JSON.parse(bookJSON);
        
        const fullInfo = new Object();
        fullInfo.book = book;
        fullInfo.status = req.body.readingStatus;


        console.log("the following is added in such form :" + JSON.stringify(fullInfo));
        userBooks.push(fullInfo);
        res.redirect("/");
    } catch (error) {
        console.error("Error parsing book:", error.message)
        res.redirect("/");
    }
})

app.listen(port, ()=>{
    console.log(`App is listening on port ${port}`);
})