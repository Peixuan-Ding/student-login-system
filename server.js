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
const tutorRoutes = require('./routes/tutors');

// 导入工具
const { initConfig } = require('./utils/config');

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化配置
initConfig();

// 中间件
app.use(cors());
// JSON解析中间件 - 添加错误处理
app.use(express.json({
    limit: '10mb',  // 增加请求体大小限制
    strict: true
}));

// JSON解析错误处理中间件 - 必须在express.json()之后
app.use((err, req, res, next) => {
    // 如果是JSON解析错误
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON解析错误:', err.message);
        // 如果是API请求，返回JSON错误
        if (req.path.startsWith('/api')) {
            return res.status(400).json({
                error: '无效的JSON请求',
                message: '请求体格式不正确，请检查JSON格式'
            });
        }
    }
    next(err);
});

// API 路由 - 确保所有/api路由都有JSON错误处理
app.use('/api', (req, res, next) => {
    // 为所有API请求设置JSON内容类型
    res.type('json');
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', contentRoutes);
app.use('/api', aiRoutes);
app.use('/api/upload', uploadRoutes);  // 修改为 /api/upload 以匹配前端路径
app.use('/api/tutors', tutorRoutes);

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
