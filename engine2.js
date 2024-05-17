const bodyParser = require('body-parser');
const { model } = require('mongoose');
const OpenAI = require('openai');

app.use(bodyParser.urlencoded({ extended: true })); 

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const localStorage1 = new LocalStorage('./scratch2');

//=======================================================

//Memory Retrieval //

let data1 = localStorage1.getItem('memory1');
let memory1 = data1 ? JSON.parse(data1) : [];

app.post('/languages/:languageName/new', async (req, res) => {
    const userMessage1 = req.body.englishTo;
    const response1 = await getResponse1(userMessage1);
    res.redirect('/:languageName/new');
});

async function getResponse1(userMessage1) {
    memory1.push({role: 'user', content: userMessage1});

    const response1 = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: memory1,
        max_tokens: 100
    });

    const answer1 = response1.data.choices[0].message.content;
    console.log(answer1, '+++');  
 
    memory1.push({role: 'assitant', content: answer1});
    localStorage.setItem('memory', JSON.stringify(memory1));
}

app.get('/languages/new', async (req, res) => {
    const lastResponse1 = memory1.length > 0 ? memory1[memory1.length - 1].content : '';
    res.render('new.ejs', {answer: lastResponse1 || 'No response yet!'});
});

console.log('tutto bene1');