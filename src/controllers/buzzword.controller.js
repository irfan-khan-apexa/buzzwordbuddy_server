const { Buzzword, UserSentence, sequelize } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config()
const { getSentenceFeedback } = require('../services/aiFeedback');

// const OpenAI = require('openai');

// const openai = new OpenAI({
//     demoapiKey: "ghfj-proj-e-
// });


const { CohereClient } = require('cohere-ai');
require('dotenv').config();


const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

exports.getDailyBuzzwords = async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    //cheat api
    // const today = "2025-04-14"
    // const today = req.query.date || new Date().toISOString().split('T')[0];


    try {
        //  testing by one word 
        // await sequelize.query("DELETE FROM daily_buzzwords WHERE date = ?", {
        //     replacements: [today],
        // });
        // // // Check if today's buzzwords are already saved
        const [existing] = await sequelize.query(
            'SELECT * FROM daily_buzzwords WHERE date = ?',
            {
                replacements: [today],
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (existing) {
            const ids = JSON.parse(existing.buzzword_ids);
            const buzzwords = await Buzzword.findAll({ where: { id: ids } });
            return res.json(buzzwords);
        }

        // Get buzzword IDs used in the last 15 days
        const recent = await sequelize.query(
            'SELECT buzzword_ids FROM daily_buzzwords ORDER BY date DESC LIMIT 15',
            { type: sequelize.QueryTypes.SELECT }
        );

        const recentlyUsedIds = new Set();
        recent.forEach(entry => {
            const ids = JSON.parse(entry.buzzword_ids);
            ids.forEach(id => recentlyUsedIds.add(id));
        });

        // Fetch all buzzwords and exclude recent ones
        const allBuzzwords = await Buzzword.findAll();
        const available = allBuzzwords.filter(bw => !recentlyUsedIds.has(bw.id));

        // Randomly pick 5 buzzwords
        const shuffled = available.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        const selectedIds = selected.map(b => b.id);
        await sequelize.query(
            'INSERT INTO daily_buzzwords (date, buzzword_ids) VALUES (?, ?)',
            {
                replacements: [today, JSON.stringify(selectedIds)],
                type: sequelize.QueryTypes.INSERT,
            }
        );

        res.json(selected);
    } catch (error) {
        console.error('getDailyBuzzwords error:', error);

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

// exports.submitUserSentence = async (req, res) => {
//     const { term_id, user_sentence } = req.body;
//     if (!term_id || !user_sentence) {
//         return res.status(400).json({ error: 'term_id and sentence required' });
//     }

//     try {
//         const result = await UserSentence.create({ term_id, user_sentence });

//         console.log(result);

//         res.status(201).json({ message: 'Submitted!', id: result.id });
//     } catch (error) {
//         res.status(500).json({ error: 'Submit failed' });
//     }
// };

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


exports.getAllUserSubmissions = async (req, res) => {
    const { date } = req.query;

    let whereClause = {};
    if (date) {
        whereClause = sequelize.where(
            sequelize.fn('DATE', sequelize.col('created_at')),
            date
        );
    }

    try {
        const sentences = await UserSentence.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            include: [{ model: Buzzword }],
        });
        console.log(sentences);

        res.json(sentences);
    } catch (error) {
        console.log(error);

        console.error('Error fetching all user sentences:', error);
        res.status(500).json({ error: 'Could not fetch data' });
    }
};


exports.submitUserSentence = async (req, res) => {
    const { term_id, user_sentence } = req.body;

    if (!term_id || !user_sentence) {
        return res.status(400).json({ error: 'term_id and sentence required' });
    }

    try {
        const buzzword = await Buzzword.findByPk(term_id);
        const feedback = await getSentenceFeedback({
            buzzword: buzzword.term,
            sentence: user_sentence,
        });

        // const result = await UserSentence.create({ term_id, user_sentence });

        const ratingMatch = feedback.match(/Rating:\s*(\d)/);
        const rating = ratingMatch ? parseInt(ratingMatch[1]) : null;

        const result = await UserSentence.create({
            term_id,
            user_sentence,
            rating,
        });


        res.status(201).json({
            message: 'Submitted!',
            id: result.id,
            feedback,
            rating,
        });
    } catch (err) {
        console.error('Submission error:', err);
        res.status(500).json({ error: 'Submit failed' });
    }
};


