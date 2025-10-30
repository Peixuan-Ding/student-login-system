// 通用错误处理中间件
function errorHandler(err, req, res, next) {
    console.error('服务器错误:', err);
    console.error('错误路径:', req.path);
    console.error('错误方法:', req.method);
    
    // 如果响应已经发送，直接返回
    if (res.headersSent) {
        return next(err);
    }
    
    // 确保响应头设置为JSON
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // 如果是API请求，确保返回JSON
    if (req.path.startsWith('/api')) {
        return res.status(err.status || 500).json({ 
            error: '服务器内部错误',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    } else {
        // 非API请求，也返回JSON（如果需要HTML错误页面，可以在这里修改）
        return res.status(err.status || 500).json({ 
            error: '服务器内部错误',
            message: err.message
        });
    }
}

module.exports = errorHandler;

