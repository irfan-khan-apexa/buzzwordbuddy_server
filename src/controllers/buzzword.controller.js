const { Buzzword, UserSentence, sequelize } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config()
// const OpenAI = require('openai');



const { CohereClient } = require('cohere-ai');
require('dotenv').config();


const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});






exports.getDailyBuzzwords = async (req, res) => {
    try {
        const buzzwords = await Buzzword.findAll({
            order: sequelize.random(),
            limit: 5,
            raw: true
        });
        console.log(buzzwords);

        res.json(buzzwords);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch buzzwords' });
    }
};

exports.searchBuzzwords = async (req, res) => {
    const query = req.query.q;

    try {
        const results = await Buzzword.findAll({
            where: {
                [Op.or]: [
                    {
                        term: {
                            [Op.like]: `%${query}%`
                        }
                    },
                    // Only try to match ID if the query is a number
                    !isNaN(query) ? { id: parseInt(query) } : null
                ].filter(Boolean)  // removes null if query is not a number
                // term: {
                //     [Op.like]: `%${query}%`
                // },
                // id: query  // Sequelize handles it as integer if id is a number
            },
            // limit: 10,
            raw: true
        });
        console.log(results);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};

exports.submitUserSentence = async (req, res) => {
    const { term_id, user_sentence } = req.body;
    if (!term_id || !user_sentence) {
        return res.status(400).json({ error: 'term_id and sentence required' });
    }

    try {
        const result = await UserSentence.create({ term_id, user_sentence });
        console.log(result);
        res.status(201).json({ message: 'Submitted!', id: result.id });
    } catch (error) {
        res.status(500).json({ error: 'Submit failed' });
    }
};

exports.getUserSentencesByTerm = async (req, res) => {
    const { id } = req.params;

    try {
        const sentences = await UserSentence.findAll({
            where: { term_id: id },
            order: [['created_at', 'DESC']],
        });

        res.json(sentences);
    } catch (error) {
        console.error('Error fetching user sentences:', error);
        res.status(500).json({ error: 'Could not fetch user sentences' });
    }
};
