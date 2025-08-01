import express from "express";
import axios from "axios";
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import session from "express-session";


const app = express();
const port = 3000; 
const API_URL_info = "https://openlibrary.org/search.json";
const API_URL_cover = "https://covers.openlibrary.org/b/olid/";
const __dirname = dirname(fileURLToPath(import.meta.url));

var userBooks = [];
const simonaList = [];

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: "b00k4w0rm5",
    resave: false, 
    saveUninitialized: true
}))


app.use((req, res, next) => {
    res.locals.getFullYear = () => new Date().getFullYear();
    res.locals.booksList = userBooks;
    res.locals.userBookKeys = userBooks.map(b => b.book.key);   
    res.locals.urlCover = API_URL_cover;
    res.locals.simonaList = simonaList;
    next();
});


app.get("/", (req, res)=>{
    res.render("index.ejs");
})

app.get("/me", async(req, res) =>{
     
    simonaList.length = 0; 
    await fetchSimonaBook("Nightbane", "Alex Aster", "planning");
    await fetchSimonaBook("2001", "Arthur C. Clarke", "reading");
    await fetchSimonaBook("The gamification of learning and instruction", "Karl M. Kapp", "reading");


    res.render("me.ejs");
    console.log(simonaList)
})

app.get("/user-shelf", (req,res)=>{
    res.render("userShelf.ejs", {booksList: userBooks});
})

app.post("/find-book", async (req,res)=> {
    console.log(JSON.stringify(req.body))
    req.session.lastSearch = req.body.searchContent;;

    try {
        const result = await axios.get(API_URL_info + "?q=title_suggest:" + req.body.searchContent);
        const books = result.data.docs;
        res.render("index.ejs", {booksList : userBooks, books: books, urlCover : API_URL_cover});
    } catch (error) {
        
    }
})

app.post("/add-book", async (req,res)=>{
    try {
        const bookJSON = req.body.addedBook;
        const book = JSON.parse(bookJSON);
        
        const fullInfo = new Object();
        fullInfo.book = book;
        fullInfo.status = req.body.readingStatus;

        console.log("the following is being added in such form :" + JSON.stringify(fullInfo));
        userBooks.push(fullInfo);

        const query = req.session.lastSearch;
        if(query){
            const result = await axios.get(API_URL_info + "?q=title_suggest:"+ query );
            const books = result.data.docs;

            //update locals so that search result doesnt reset + added book label is still present
            res.locals.booksList = userBooks;
            res.locals.userBookKeys = userBooks.map(b => b.book.key);
            res.locals.urlCover = API_URL_cover;


            res.render("index.ejs", {books: books});
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.error("Error parsing book:", error.message)
        res.redirect("/");
    }
})

app.listen(port, ()=>{
    console.log(`App is listening on port ${port}`);
})

async function fetchSimonaBook(title, author, status){
    const res = await axios.get(API_URL_info, {
        params: { title, author }
    });

    const book = res.data.docs[0];
    if (!book) return;

    const reasons = await fetchReasons();

    const reasonObj = reasons.find(b => 
        b.title.toLowerCase() === title.toLowerCase() &&
        b.author.toLowerCase() === author.toLowerCase()
    );

    const reason = reasonObj ? reasonObj.reason : 'No reason provided';
    const motivation = reasonObj ? reasonObj.motivation : 'No motivation provided';

    simonaList.push({ book, status, reason, motivation });
}

async function fetchReasons() {
    const filePath = path.join(__dirname, 'public', 'booksInfo.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}