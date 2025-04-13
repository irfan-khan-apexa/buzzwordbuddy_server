const axios = require('axios');

const cohereAPI = 'https://api.cohere.ai/v1/generate';
const COHERE_API_KEY = process.env.COHERE_API_KEY;

async function getSentenceFeedback({ buzzword, sentence }) {
    const prompt = `The user wrote: "${sentence}" using the term "${buzzword}". 
Give short feedback ,that they have used that word in sentence or not and how well they grmaticially used the word, and rate it from 1 (poor) to 5 (excellent).
also correct that sentence gramatically`;

    const res = await axios.post(
        cohereAPI,
        {
            model: 'command-r-plus',
            prompt,
            max_tokens: 100,
            temperature: 0.7,
        },
        {
            headers: {
                Authorization: `Bearer ${COHERE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const text = res.data.generations[0].text.trim();
    return text;
}

module.exports = { getSentenceFeedback };
