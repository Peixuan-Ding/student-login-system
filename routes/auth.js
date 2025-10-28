const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { readDB, writeDB } = require('../utils/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 用户登录
router.post('/login', [
    body('studentId').trim().isLength({ min: 1 }).withMessage('学号不能为空'),
    body('password').trim().isLength({ min: 1 }).withMessage('密码不能为空')
], async (req, res) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        
        const { studentId, password } = req.body;
        
        const dbData = readDB('users');
        if (!dbData || !dbData.users) {
            return res.status(500).json({ error: '数据库初始化失败' });
        }
        
        const user = dbData.users.find(u => u.studentId === studentId && u.isActive);
        
        if (!user) {
            return res.status(401).json({ error: '用户不存在或已禁用' });
        }
        
        // 检查密码（支持旧明文和新加密密码）
        let isPasswordValid = false;
        if (user.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            isPasswordValid = user.password === password;
            // 如果匹配，立即加密密码
            if (isPasswordValid) {
                user.password = await bcrypt.hash(password, 10);
                writeDB('users', dbData);
            }
        }
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: '密码错误' });
        }
        
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        writeDB('users', dbData);
        
        // 生成 JWT token
        const token = jwt.sign(
            { studentId: user.studentId, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // 返回用户信息（不包含密码）和 token
        const { password: _, ...userInfo } = user;
        res.json({ 
            success: true, 
            user: userInfo,
            token: token
        });
    } catch (error) {
        console.error('登录失败:', error);
        res.status(500).json({ 
            error: '登录失败，请稍后重试',
            message: error.message
        });
    }
});

module.exports = router;

