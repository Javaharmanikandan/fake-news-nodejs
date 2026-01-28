// ====================================================
// ADMIN CONTROLLER
// ====================================================
// Handles admin operations
// ====================================================

const { query } = require('../db/connection');

// Get all reported news
const getReportedNews = async (req, res) => {
    try {
        // Get news with report counts
        const result = await query(
            `SELECT 
                n.*,
                COUNT(DISTINCT r.id) as report_count,
                COUNT(DISTINCT CASE WHEN r.vote = 'Fake' THEN r.id END) as fake_votes,
                COUNT(DISTINCT CASE WHEN r.vote = 'Real' THEN r.id END) as real_votes,
                dr.result, dr.confidence, dr.explanation
             FROM news n
             LEFT JOIN reports r ON n.id = r.news_id
             LEFT JOIN detection_results dr ON n.id = dr.news_id
             GROUP BY n.id, dr.result, dr.confidence, dr.explanation
             HAVING COUNT(DISTINCT r.id) > 0
             ORDER BY report_count DESC, n.created_at DESC`
        );

        res.json({
            reportedNews: result.rows
        });

    } catch (error) {
        console.error('Get reported news error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add verified fake news to database
const addFakeNews = async (req, res) => {
    try {
        const { title, content, sourceUrl, tags, verifiedBy } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await query(
            `INSERT INTO fake_news_db (title, content, source_url, verified_by, tags) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [
                title,
                content || null,
                sourceUrl || null,
                verifiedBy || 'admin',
                tags || []
            ]
        );

        res.json({
            message: 'Fake news added to database',
            fakeNews: result.rows[0]
        });

    } catch (error) {
        console.error('Add fake news error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all fake news from database
const getFakeNewsDatabase = async (req, res) => {
    try {
        const { search } = req.query;

        let queryText = 'SELECT * FROM fake_news_db';
        let params = [];

        if (search) {
            queryText += ' WHERE title ILIKE $1 OR content ILIKE $1';
            params.push(`%${search}%`);
        }

        queryText += ' ORDER BY created_at DESC LIMIT 100';

        const result = await query(queryText, params);

        res.json({
            fakeNews: result.rows
        });

    } catch (error) {
        console.error('Get fake news database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete news item (admin only)
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM news WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'News not found' });
        }

        res.json({
            message: 'News deleted successfully'
        });

    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getReportedNews,
    addFakeNews,
    getFakeNewsDatabase,
    deleteNews
};

