const express = require('express');
const { readDB } = require('../utils/database');

const router = express.Router();

// 获取课程列表
router.get('/courses', (req, res) => {
    try {
        const dbData = readDB('courses');
        res.json(dbData || { courses: [] });
    } catch (error) {
        console.error('获取课程列表失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 获取教学材料
router.get('/materials', (req, res) => {
    try {
        const dbData = readDB('materials');
        res.json(dbData || { materials: [] });
    } catch (error) {
        console.error('获取教学材料失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 获取教案
router.get('/lesson-plans', (req, res) => {
    try {
        const dbData = readDB('lessonPlans');
        res.json(dbData || { lessonPlans: [] });
    } catch (error) {
        console.error('获取教案失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 获取资源
router.get('/resources', (req, res) => {
    try {
        const dbData = readDB('resources');
        res.json(dbData || { resources: [] });
    } catch (error) {
        console.error('获取资源失败:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

