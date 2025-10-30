const express = require('express');
const { readDB } = require('../utils/database');

const router = express.Router();

// 映射 URL -> 数据库键与包裹字段名
const CONTENT_MAP = {
    courses: { dbKey: 'courses', wrapper: 'courses' },
    'lesson-plans': { dbKey: 'lessonPlans', wrapper: 'lessonPlans' },
    materials: { dbKey: 'materials', wrapper: 'materials' },
    resources: { dbKey: 'resources', wrapper: 'resources' }
};

// 统一的内容读取路由，兼容现有路径：
// /api/courses, /api/lesson-plans, /api/materials, /api/resources
router.get('/:type(courses|lesson-plans|materials|resources)', (req, res) => {
    const { type } = req.params;
    try {
        const map = CONTENT_MAP[type];
        const dbData = readDB(map.dbKey);
        // 确保返回对象结构稳定
        const payload = dbData && typeof dbData === 'object' ? dbData : { [map.wrapper]: [] };
        res.json(payload);
    } catch (error) {
        console.error(`获取${type}失败:`, error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

