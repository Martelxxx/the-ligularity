// Purpose: Main server section for the application.
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);


const express = require('express');
const app = express();

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./scratch');


const methodOverride = require('method-override'); 

const morgan = require('morgan');

mongoose.connect(process.env.MONGODB_URI,)

mongoose.connection.on("connected", () => {
    console.log(`Connect to MongoDB ${mongoose.connection.name}.`);
});

const Language = require('./models/language.js');
const agents = require('./Data Arrays/agents.js');
const purposeful = require('./Data Arrays/purposeful.js');
const context = require('./Data Arrays/context.js');
const consonants = require('./Data Arrays/consonants.js');
const vowels = require('./Data Arrays/vowels.js');
const grammar = require('./Data Arrays/grammar.js');
const { log } = require('console');
const { name } = require('ejs');


app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public'));

app.use(methodOverride('_method'));

app.use(morgan('dev'));

// ============== CRUD Routes ==============

app.get('/', async (req, res) => {
    res.render('index.ejs');
});

app.get('/languages/new', async (req, res) => {
    const languages = await Language.find();
    res.render('languages/new.ejs', { agents: agents, purposeful: purposeful, context: context, consonants: consonants, vowels: vowels, grammar: grammar, languages: languages});
});

app.get('/confirmation', (req, res) => {
    res.render('languages/confirmation.ejs', { grammar: grammar });
});

app.post('/languages', async (req, res) => {
    const languages = await Language.create(req.body);
    res.render('languages/confirmation.ejs', { 
        language: languages, grammar: grammar });
}); 


app.get('/languages/index', async (req, res) => {
    const languages = await Language.find();
    res.render('languages/index.ejs', { languages, grammar });
});

app.delete('/languages/:languageName', async (req, res) => {
    const languageName = req.params.languageName;
    await Language.findOneAndDelete({ name: languageName });
    res.redirect('/languages/index');
});

app.get('/languages/:languageName/edit', async (req, res) => {
    const languageName = req.params.languageName;
    const foundLanguage = await Language.findOne({ name: languageName });
    res.render("languages/edit.ejs", { language: foundLanguage, agents: agents, purposeful: purposeful, context: context, consonants: consonants, vowels: vowels, grammar: grammar });
});   

app.get('/languages/:languageName/translator', async (req, res) => {
    const languageName = req.params.languageName;
    const foundLanguage = await Language.findOne({ name: languageName });
    const userMessage = req.body.englishTo;
    const response = await getResponse(''); 
    res.render("languages/translator.ejs", {lastResponse: response.choices[0].message.content, name: languageName});
});

app.put('/languages/:languageName', async (req, res) => {
    const languageName = req.params.languageName;
    await Language.findOneAndUpdate({ name: languageName }, req.body, { new: true });
    res.redirect('/languages/index');
});
    
// ============== Populate Respective <textarea> with proper purpose from Data Arrays 4/27 ============== 

app.get('/api/agents', (req, res) => {
    res.json(agents );
});

app.get('/api/purposeful', (req, res) => {
    res.json(purposeful );
});

app.get('/api/context', (req, res) => {
    res.json(context );
});

app.get('/api/consonants', (req, res) => {
    res.json(consonants );
});

app.get('/api/vowels', (req, res) => {
    res.json(vowels );
});

app.get('/api/grammar', (req, res) => {
    res.json(grammar );
});

// =========================================

let data = localStorage.getItem('memory');
let memory = data ? JSON.parse(data) : [];

app.post('/languages/:languageName/translator', async (req, res) => {
    const languageName = req.params.languageName;
    const userMessage = req.body.englishTo;
    const response = await getResponse(userMessage);
    res.render('languages/translator.ejs', {lastResponse: response.choices[0].message.content, name: languageName, grammar: grammar}); 
});

app.post('/memory', (req, res) => { 
    res.redirect('languages/index');
});
 
async function getResponse(userMessage) {
    memory.push({role: 'user', content: userMessage});

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: memory,
        max_tokens: 250
    });  

    const answer = response.choices[0].message.content;
    console.log(answer, '+++');   
 
    memory.push({role: 'assistant', content: answer});
    localStorage.setItem('memory', JSON.stringify(memory));


    return response;

}

console.log('tutto bene');

app.listen(3226, () => {
    console.log('server 3032 started');
  });  

