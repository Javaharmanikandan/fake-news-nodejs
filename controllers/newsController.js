// ====================================================
// NEWS CONTROLLER
// ====================================================
// Handles news submission, detection, and history
// ====================================================

const axios = require('axios');
const { query } = require('../db/connection');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

// Extract domain from URL
const extractDomain = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return null;
    }
};

// Submit news for detection
const submitNews = async (req, res) => {
    try {
        const { userId, title, content, url, imageFilename } = req.body;

        // Validate input
        if (!content || content.trim().length < 10) {
            return res.status(400).json({ 
                error: 'News content must be at least 10 characters' 
            });
        }

        // Extract domain from URL
        const sourceDomain = extractDomain(url);

        // Insert news into database
        const newsResult = await query(
            `INSERT INTO news (user_id, title, content, url, image_filename, source_domain) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [userId, title || null, content, url || null, imageFilename || null, sourceDomain]
        );

        const news = newsResult.rows[0];

        // Call AI service for detection
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
                text: content,
                url: url
            });

            const detectionData = aiResponse.data;

            // Save detection result
            const detectionResult = await query(
                `INSERT INTO detection_results 
                 (news_id, result, confidence, explanation) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                [
                    news.id,
                    detectionData.result,
                    detectionData.confidence,
                    detectionData.explanation
                ]
            );

            // Update news with credibility level
            const credibilityLevel = detectionData.source_credibility || 'medium';
            await query(
                'UPDATE news SET credibility_level = $1 WHERE id = $2',
                [credibilityLevel, news.id]
            );

            res.json({
                message: 'News submitted and analyzed successfully',
                news: {
                    id: news.id,
                    title: news.title,
                    content: news.content,
                    url: news.url,
                    sourceDomain: news.source_domain,
                    credibilityLevel: credibilityLevel
                },
                detection: {
                    result: detectionData.result,
                    confidence: detectionData.confidence,
                    explanation: detectionData.explanation
                }
            });

        } catch (aiError) {
            console.error('AI service error:', aiError.message);
            
            // Save news even if AI service fails
            res.status(500).json({
                error: 'News saved but AI detection failed',
                news: {
                    id: news.id
                }
            });
        }

    } catch (error) {
        console.error('Submit news error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user's news history
const getNewsHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get news with latest detection result
        const result = await query(
            `SELECT 
                n.id, n.title, n.content, n.url, n.image_filename, 
                n.source_domain, n.credibility_level, n.created_at,
                dr.result, dr.confidence, dr.explanation, dr.detected_at
             FROM news n
             LEFT JOIN detection_results dr ON n.id = dr.news_id
             WHERE n.user_id = $1
             ORDER BY n.created_at DESC
             LIMIT 50`,
            [userId]
        );

        res.json({
            news: result.rows
        });

    } catch (error) {
        console.error('Get news history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single news item with detection result
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get news with detection result
        const newsResult = await query(
            `SELECT 
                n.*, 
                dr.result, dr.confidence, dr.explanation, dr.detected_at
             FROM news n
             LEFT JOIN detection_results dr ON n.id = dr.news_id
             WHERE n.id = $1`,
            [id]
        );

        if (newsResult.rows.length === 0) {
            return res.status(404).json({ error: 'News not found' });
        }

        // Get community reports
        const reportsResult = await query(
            `SELECT r.*, u.name as user_name
             FROM reports r
             JOIN users u ON r.user_id = u.id
             WHERE r.news_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );

        res.json({
            news: newsResult.rows[0],
            reports: reportsResult.rows
        });

    } catch (error) {
        console.error('Get news by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    submitNews,
    getNewsHistory,
    getNewsById
};

