const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { readDB, writeDB } = require('../utils/database');

const router = express.Router();

// 获取用户列表
router.get('/', (req, res) => {
    try {
        const dbData = readDB('users');
        if (!dbData) {
            return res.status(500).json({ error: '数据库读取失败' });
        }
        
        const usersWithoutPassword = dbData.users.map(({ password, ...user }) => user);
        res.json({ users: usersWithoutPassword, metadata: dbData.metadata });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({ error: error.message });
    }
});

// 添加新用户
router.post('/', [
    body('studentId').trim().notEmpty().withMessage('学号不能为空'),
    body('password').trim().isLength({ min: 6 }).withMessage('密码至少6位'),
    body('name').optional().trim(),
    body('email').optional().isEmail().withMessage('邮箱格式不正确')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        
        const { studentId, password, name, grade, email } = req.body;
        
        const dbData = readDB('users');
        if (!dbData || !dbData.users) {
            return res.status(500).json({ error: '数据库初始化失败' });
        }
        
        const existingUser = dbData.users.find(u => u.studentId === studentId);
        if (existingUser) {
            return res.status(400).json({ error: '用户已存在' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            studentId,
            password: hashedPassword,
            name: name || '新用户',
            grade: grade || '',
            email: email || '',
            avatar: '👤',
            role: 'student',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
        };
        
        dbData.users.push(newUser);
        dbData.metadata.totalUsers = dbData.users.length;
        dbData.metadata.lastUpdated = new Date().toISOString();
        
        writeDB('users', dbData);
        
        const { password: _, ...userInfo } = newUser;
        res.json({ success: true, user: userInfo });
    } catch (error) {
        console.error('添加用户失败:', error);
        res.status(500).json({ 
            error: '添加用户失败，请稍后重试',
            message: error.message
        });
    }
});

// 更新用户信息
router.put('/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body;
        
        const dbData = readDB('users');
        if (!dbData) {
            return res.status(500).json({ error: '数据库读取失败' });
        }
        
        const userIndex = dbData.users.findIndex(u => u.studentId === studentId);
        if (userIndex === -1) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        dbData.users[userIndex] = {
            ...dbData.users[userIndex],
            ...updates,
            studentId: dbData.users[userIndex].studentId
        };
        
        dbData.metadata.lastUpdated = new Date().toISOString();
        writeDB('users', dbData);
        
        const { password: _, ...userInfo } = dbData.users[userIndex];
        res.json({ success: true, user: userInfo });
    } catch (error) {
        console.error('更新用户失败:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

