const bodyParser = require('body-parser');
const { model } = require('mongoose');
const OpenAI = require('openai');

app.use(bodyParser.urlencoded({ extended: true })); 

const openai = new OpenAI(process.env.OPENAI_API_KEY);

const localStorage = new LocalStorage('./scratch');

//=======================================================

//Memory Retrieval //

let data = localStorage.getItem('memory');
let memory = data ? JSON.parse(data) : [];

app.post('/languages/:languageName/translator', async (req, res) => {
    const userMessage = req.body.englishTo;
    const response = await getResponse(userMessage);
    res.redirect('/:languageName/translator');
});

async function getResponse(userMessage) {
    memory.push({role: 'user', content: userMessage});

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: memory,
        max_tokens: 100
    });

    const answer = response.data.choices[0].message.content;
    console.log(answer, '+++');  
 
    memory.push({role: 'assitant', content: answer});
    localStorage.setItem('memory', JSON.stringify(memory));
}


app.get('/languages/:languageName/translator', async (req, res) => {
    const lastResponse = memory.length > 0 ? memory[memory.length - 1].content : '';
    res.render('translator.ejs', {answer: lastResponse || 'No response yet!'});
});

console.log('tutto bene');



