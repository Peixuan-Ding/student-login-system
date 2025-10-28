// 通用错误处理中间件
function errorHandler(err, req, res, next) {
    console.error('服务器错误:', err);
    res.status(500).json({ 
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}

module.exports = errorHandler;

