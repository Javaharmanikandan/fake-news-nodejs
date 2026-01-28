// ====================================================
// REPORT CONTROLLER
// ====================================================
// Handles community reporting and voting
// ====================================================

const { query } = require('../db/connection');

// Submit a report/vote
const submitReport = async (req, res) => {
    try {
        const { newsId, userId, vote, comment } = req.body;

        // Validate input
        if (!newsId || !userId || !vote) {
            return res.status(400).json({ 
                error: 'News ID, User ID, and vote are required' 
            });
        }

        if (!['Fake', 'Real'].includes(vote)) {
            return res.status(400).json({ 
                error: 'Vote must be either "Fake" or "Real"' 
            });
        }

        // Check if user already reported this news
        const existingReport = await query(
            'SELECT id FROM reports WHERE news_id = $1 AND user_id = $2',
            [newsId, userId]
        );

        let report;
        if (existingReport.rows.length > 0) {
            // Update existing report
            const result = await query(
                `UPDATE reports 
                 SET vote = $1, comment = $2, created_at = CURRENT_TIMESTAMP
                 WHERE news_id = $3 AND user_id = $4
                 RETURNING *`,
                [vote, comment || null, newsId, userId]
            );
            report = result.rows[0];
        } else {
            // Create new report
            const result = await query(
                `INSERT INTO reports (news_id, user_id, vote, comment) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                [newsId, userId, vote, comment || null]
            );
            report = result.rows[0];
        }

        res.json({
            message: 'Report submitted successfully',
            report: report
        });

    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get reports for a news item
const getReportsByNewsId = async (req, res) => {
    try {
        const { newsId } = req.params;

        const result = await query(
            `SELECT r.*, u.name as user_name, u.email
             FROM reports r
             JOIN users u ON r.user_id = u.id
             WHERE r.news_id = $1
             ORDER BY r.created_at DESC`,
            [newsId]
        );

        res.json({
            reports: result.rows
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    submitReport,
    getReportsByNewsId
};

