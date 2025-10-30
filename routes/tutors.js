const express = require('express');
const { readDB, writeDB } = require('../utils/database');

const router = express.Router();

// 获取导师列表
router.get('/', (req, res) => {
    try {
        const db = readDB('tutors') || { tutors: [] };
        res.json(db);
    } catch (e) {
        console.error('获取导师列表失败:', e);
        res.status(500).json({ error: '获取导师列表失败' });
    }
});

// 新增导师
router.post('/', (req, res) => {
    try {
        const { name, subject, goal, note, fileContext } = req.body || {};
        if (!name) return res.status(400).json({ error: '导师名称必填' });
        const db = readDB('tutors') || { tutors: [] };
        const id = 'tut_' + Date.now();
        const tutor = { id, name, subject: subject || '', goal: goal || '', note: note || '', fileContext: fileContext || '', createdAt: new Date().toISOString() };
        db.tutors.unshift(tutor);
        if (!writeDB('tutors', db)) return res.status(500).json({ error: '保存失败' });
        res.json({ success: true, tutor });
    } catch (e) {
        console.error('新增导师失败:', e);
        res.status(500).json({ error: '新增导师失败' });
    }
});

// 更新导师
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, goal, note, fileContext } = req.body || {};
        const db = readDB('tutors') || { tutors: [] };
        const idx = db.tutors.findIndex(t => t.id === id);
        if (idx === -1) return res.status(404).json({ error: '导师不存在' });
        db.tutors[idx] = {
            ...db.tutors[idx],
            name: name ?? db.tutors[idx].name,
            subject: subject ?? db.tutors[idx].subject,
            goal: goal ?? db.tutors[idx].goal,
            note: note ?? db.tutors[idx].note,
            fileContext: fileContext ?? db.tutors[idx].fileContext
        };
        if (!writeDB('tutors', db)) return res.status(500).json({ error: '保存失败' });
        res.json({ success: true, tutor: db.tutors[idx] });
    } catch (e) {
        console.error('更新导师失败:', e);
        res.status(500).json({ error: '更新导师失败' });
    }
});

// 删除导师
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB('tutors') || { tutors: [] };
        const idx = db.tutors.findIndex(t => t.id === id);
        if (idx === -1) return res.status(404).json({ error: '导师不存在' });
        db.tutors.splice(idx, 1);
        if (!writeDB('tutors', db)) return res.status(500).json({ error: '删除失败' });
        res.json({ success: true });
    } catch (e) {
        console.error('删除导师失败:', e);
        res.status(500).json({ error: '删除导师失败' });
    }
});

module.exports = router;


