require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');

// 导入工具
const { initConfig } = require('./utils/config');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化配置
initConfig();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', contentRoutes);
app.use('/api', aiRoutes);
app.use('/api', uploadRoutes);

// 根路径重定向到登录页（必须在静态文件服务之前）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📝 配置文件路径: ${path.join(__dirname, 'config.json')}`);
    console.log('💡 请在 config.json 或 .env 中配置你的 API 密钥');
    console.log('🔐 安全提醒: 生产环境请使用环境变量存储敏感信息');
});
