const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { extractTextFromFiles } = require('../utils/fileProcessor');
const { readDB, writeDB } = require('../utils/database');

const router = express.Router();

// 确保所有API路由都返回JSON（使用中间件包装，避免过早设置）
router.use((req, res, next) => {
    // 保存原始的 json 方法，以便在错误时也能使用
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return originalJson(data);
    };
    next();
});

// 配置multer存储
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'tmp');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名，保留原始扩展名
        // 使用安全的文件名，避免中文编码问题
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
        'application/pdf', // PDF
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'text/plain', // .txt
        'image/jpeg', // .jpg
        'image/png' // .png
    ];
    
    // 也检查文件扩展名（某些浏览器可能不会正确设置 MIME 类型）
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        // 错误会通过 multer 的错误处理中间件返回JSON
        cb(new Error(`不支持的文件类型: ${file.mimetype || '未知'}，仅支持 PDF、Word、TXT 和图片`), false);
    }
};

// 配置multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// 文件上传路由（用于导师聊天）
// 注意：由于在 server.js 中使用 app.use('/api/upload', uploadRoutes)
// 这个路由的实际路径是 /api/upload/upload，需要保持为 '/' 以匹配 /api/upload
// 注意：multer 的错误需要通过错误处理中间件捕获
router.post('/', (req, res, next) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            // multer 错误，立即返回 JSON 响应
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ 
                        error: '文件大小超出限制',
                        message: '单个文件大小不能超过10MB'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ 
                        error: '文件数量超出限制',
                        message: '一次最多上传10个文件'
                    });
                }
                return res.status(400).json({ 
                    error: '文件上传错误',
                    message: err.message
                });
            }
            
            // 文件过滤器返回的错误
            if (err.message && err.message.includes('不支持的文件类型')) {
                return res.status(400).json({ 
                    error: '文件类型不支持',
                    message: err.message
                });
            }
            
            // 其他错误传递给下一个错误处理中间件
            return next(err);
        }
        // 没有错误，继续处理
        next();
    });
}, async (req, res) => {
    try {
        // 确保响应是JSON格式
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '请选择文件' });
        }

        // 提取文件信息（处理中文文件名）
        const files = req.files.map(file => ({
            path: file.path,
            name: file.originalname, // 保留原始文件名（包含中文）
            mimeType: file.mimetype,
            size: file.size
        }));

        // 提取文件文本内容
        // extractTextFromFiles 现在不会抛出错误，即使所有文件处理失败也返回成功
        const result = await extractTextFromFiles(files);
        console.log('文件提取结果:', { 
            success: result.success, 
            contentsCount: result.contents?.length || 0,
            errorsCount: result.errors?.length || 0
        });

        // 返回文件信息和提取的文本内容（包含文件路径）
        const response = {
            success: true,
            files: files.map(f => ({ 
                name: f.name, 
                size: f.size,
                path: f.path  // 添加文件路径，供前端保存时使用
            })),
            extractedText: result.totalText || '',
            message: `成功处理 ${result.contents?.length || 0} 个文件`
        };
        
        // 如果有部分文件处理失败，添加警告信息
        if (result.errors && result.errors.length > 0) {
            response.warnings = result.errors;
            console.warn('部分文件处理有警告:', result.errors);
        }

        // 确保响应未发送，然后发送JSON响应
        if (!res.headersSent) {
            console.log('发送成功响应，文件数:', response.files.length);
            console.log('响应内容示例:', JSON.stringify({
                success: response.success,
                filesCount: response.files.length,
                message: response.message
            }));
            return res.json(response);  // 使用 return 确保响应只发送一次
        } else {
            console.warn('警告：响应已发送，无法发送文件上传成功响应');
        }

        // 注意：这里暂时不删除文件，让前端处理完后再调用删除接口
    } catch (error) {
        console.error('文件上传处理失败:', error);
        console.error('错误堆栈:', error.stack);
        // 确保错误响应也是JSON格式，并且响应未发送
        if (!res.headersSent) {
            res.status(500).json({ 
                error: '文件处理失败',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            console.error('无法发送错误响应，因为响应已发送');
        }
    }
});

// 通用错误处理中间件 - 处理路由中的其他错误
router.use((err, req, res, next) => {
    // 确保错误响应是JSON格式
    if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(err.status || 500).json({ 
            error: '文件处理失败',
            message: err.message || '未知错误',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// 统一类别到数据库键的映射
function getDbMapping(category) {
    switch(category) {
        case 'textbook':
        case 'materials':
            return { dbKey: 'materials', arrayKey: 'materials', fileIdPrefix: 'mat_' };
        case 'lessonPlan':
        case 'lesson_plans':
            return { dbKey: 'lessonPlans', arrayKey: 'lessonPlans', fileIdPrefix: 'lp_' };
        case 'resource':
        case 'resources':
            return { dbKey: 'resources', arrayKey: 'resources', fileIdPrefix: 'res_' };
        default:
            return null;
    }
}

// 保存文件到数据库（教材、教案、知识库）
router.post('/save-file', async (req, res) => {
    // 确保响应是JSON格式（必须在最开始设置）
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // 添加请求日志
    console.log('收到 save-file 请求:', {
        method: req.method,
        path: req.path,
        contentType: req.headers['content-type'],
        bodyKeys: req.body ? Object.keys(req.body) : 'no body'
    });
    
    try {
        // 检查请求体
        if (!req.body) {
            console.error('保存文件失败: 请求体为空');
            return res.status(400).json({ error: '请求体为空' });
        }
        
        const { category, fileData } = req.body;

        if (!category || !fileData) {
            console.error('保存文件失败: 缺少必需参数', { 
                category, 
                fileData: !!fileData,
                bodyKeys: Object.keys(req.body)
            });
            return res.status(400).json({ error: '缺少必需参数', details: 'category 或 fileData 为空' });
        }
        
        console.log('保存文件请求:', { 
            category, 
            fileName: fileData.name || fileData.title,
            fileDataKeys: Object.keys(fileData)
        });

            const mapping = getDbMapping(category);
            if (!mapping) {
                return res.status(400).json({ error: '无效的类别' });
            }
            const { dbKey, arrayKey, fileIdPrefix } = mapping;

        // 读取现有数据
        let existingData;
        try {
            existingData = readDB(dbKey);
            if (!existingData || !existingData[arrayKey]) {
                existingData = { [arrayKey]: [] };
            }
        } catch (readError) {
            console.error('读取数据库失败，使用空数据:', readError);
            existingData = { [arrayKey]: [] };
        }
        
        // 检查是否已存在同名文件
        const fileName = fileData.name || fileData.title;
        if (!fileName) {
            return res.status(400).json({ 
                error: '文件名不能为空',
                message: 'fileData.name 或 fileData.title 必须提供'
            });
        }
        
        const existingFile = existingData[arrayKey].find(
            file => (file.name === fileName || file.title === fileName)
        );
        
        if (existingFile) {
            return res.status(400).json({ 
                error: '文件已存在',
                existingFile: existingFile,
                message: `文件 "${fileName}" 已存在于数据库中`
            });
        }
        
        // 生成新ID
        const existingCount = existingData[arrayKey].length;
        const newId = `${fileIdPrefix}${String(existingCount + 1).padStart(3, '0')}`;

        // 添加时间戳和必要字段
        const newFile = {
            id: newId,
            title: fileName,  // 确保有 title 字段
            name: fileName,  // 确保有 name 字段
            ...fileData,
            uploadDate: new Date().toISOString(),
            // 确保有文件路径（如果前端提供了）
            filePath: fileData.filePath || null
        };

        // 添加到数组
        existingData[arrayKey].push(newFile);

        // 保存到数据库
        let success;
        try {
            success = writeDB(dbKey, existingData);
        } catch (writeError) {
            console.error('写入数据库异常:', writeError);
            return res.status(500).json({ 
                error: '保存文件失败',
                message: `数据库写入异常: ${writeError.message}`
            });
        }

        if (success) {
            console.log('文件保存成功:', { fileId: newId, fileName: newFile.name || newFile.title, category });
            return res.json({
                success: true,
                fileId: newId,
                message: '文件保存成功'
            });
        } else {
            console.error('保存文件失败: 数据库写入失败', { dbKey, fileId: newId });
            return res.status(500).json({ error: '保存文件失败: 数据库写入失败' });
        }
    } catch (error) {
        console.error('保存文件失败:', error);
        console.error('错误堆栈:', error.stack);
        // 确保错误响应也是JSON格式，并且响应未发送
        if (!res.headersSent) {
            return res.status(500).json({ 
                error: '保存文件失败',
                message: error.message || '未知错误',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        } else {
            console.error('无法发送错误响应，因为响应已发送');
        }
    }
});

    // 删除文件
router.delete('/delete-file/:category/:fileId', async (req, res) => {
    try {
        const { category, fileId } = req.params;
            const mapping = getDbMapping(category);
            if (!mapping) {
                return res.status(400).json({ error: '无效的类别' });
            }
            const { dbKey, arrayKey } = mapping;

        // 读取现有数据
        const existingData = readDB(dbKey) || { [arrayKey]: [] };
        
        // 查找文件记录
        const fileIndex = existingData[arrayKey].findIndex(file => file.id === fileId);
        
        if (fileIndex === -1) {
            return res.status(404).json({ error: '文件不存在' });
        }

        const fileRecord = existingData[arrayKey][fileIndex];
        const filePath = fileRecord.filePath;

        // 如果存在文件路径，删除服务器上的实际文件
        if (filePath) {
            try {
                // 检查文件是否存在
                await fs.access(filePath);
                // 删除文件
                await fs.unlink(filePath);
                console.log('已删除服务器文件:', filePath);
            } catch (fileError) {
                // 文件不存在或删除失败，记录但不阻止删除数据库记录
                if (fileError.code === 'ENOENT') {
                    console.warn('文件不存在，跳过删除:', filePath);
                } else {
                    console.error('删除服务器文件失败:', fileError);
                    // 即使文件删除失败，也继续删除数据库记录
                }
            }
        }

        // 删除数据库中的文件记录
        existingData[arrayKey].splice(fileIndex, 1);

        // 保存到数据库
        const success = writeDB(dbKey, existingData);

        if (success) {
            console.log('文件删除成功:', { fileId, fileName: fileRecord.name || fileRecord.title, filePath });
            res.json({
                success: true,
                message: '文件删除成功'
            });
        } else {
            res.status(500).json({ error: '删除文件失败' });
        }
    } catch (error) {
        console.error('删除文件失败:', error);
        res.status(500).json({ error: '删除文件失败: ' + error.message });
    }
});

// 删除临时文件
router.post('/upload/cleanup', async (req, res) => {
    try {
        const { filePaths } = req.body;
        
        if (!filePaths || !Array.isArray(filePaths)) {
            return res.status(400).json({ error: '无效的文件路径列表' });
        }

        const results = [];
        for (const filePath of filePaths) {
            try {
                await fs.unlink(filePath);
                results.push({ path: filePath, success: true });
            } catch (error) {
                results.push({ path: filePath, success: false, error: error.message });
            }
        }

        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        console.error('清理文件失败:', error);
        res.status(500).json({ error: '清理文件失败: ' + error.message });
    }
});

module.exports = router;

