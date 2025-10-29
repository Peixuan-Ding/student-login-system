const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { extractTextFromFiles } = require('../utils/fileProcessor');
const { readDB, writeDB } = require('../utils/database');

const router = express.Router();

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
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
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
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`不支持的文件类型: ${file.mimetype}，仅支持 PDF、Word、TXT 和图片`), false);
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
router.post('/upload', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: '请选择文件' });
        }

        // 提取文件信息
        const files = req.files.map(file => ({
            path: file.path,
            name: file.originalname,
            mimeType: file.mimetype,
            size: file.size
        }));

        // 提取文件文本内容
        const result = await extractTextFromFiles(files);

        // 返回文件信息和提取的文本内容
        res.json({
            success: true,
            files: files.map(f => ({ name: f.name, size: f.size })),
            extractedText: result.totalText,
            message: `成功处理 ${files.length} 个文件`
        });

        // 注意：这里暂时不删除文件，让前端处理完后再调用删除接口
    } catch (error) {
        console.error('文件上传处理失败:', error);
        res.status(500).json({ error: '文件处理失败: ' + error.message });
    }
});

// 保存文件到数据库（教材、教案、知识库）
router.post('/save-file', async (req, res) => {
    try {
        const { category, fileData } = req.body;

        if (!category || !fileData) {
            return res.status(400).json({ error: '缺少必需参数' });
        }

        let dbKey, arrayKey, fileIdPrefix;
        
        switch(category) {
            case 'textbook':
            case 'materials':
                dbKey = 'materials';
                arrayKey = 'materials';
                fileIdPrefix = 'mat_';
                break;
            case 'lessonPlan':
            case 'lesson_plans':
                dbKey = 'lessonPlans';
                arrayKey = 'lessonPlans';
                fileIdPrefix = 'lp_';
                break;
            case 'resource':
            case 'resources':
                dbKey = 'resources';
                arrayKey = 'resources';
                fileIdPrefix = 'res_';
                break;
            default:
                return res.status(400).json({ error: '无效的类别' });
        }

        // 读取现有数据
        const existingData = readDB(dbKey) || { [arrayKey]: [] };
        
        // 生成新ID
        const existingCount = existingData[arrayKey].length;
        const newId = `${fileIdPrefix}${String(existingCount + 1).padStart(3, '0')}`;

        // 添加时间戳
        const newFile = {
            id: newId,
            ...fileData,
            uploadDate: new Date().toISOString()
        };

        // 添加到数组
        existingData[arrayKey].push(newFile);

        // 保存到数据库
        const success = writeDB(dbKey, existingData);

        if (success) {
            res.json({
                success: true,
                fileId: newId,
                message: '文件保存成功'
            });
        } else {
            res.status(500).json({ error: '保存文件失败' });
        }
    } catch (error) {
        console.error('保存文件失败:', error);
        res.status(500).json({ error: '保存文件失败: ' + error.message });
    }
});

// 删除文件
router.delete('/delete-file/:category/:fileId', async (req, res) => {
    try {
        const { category, fileId } = req.params;

        let dbKey, arrayKey;
        
        switch(category) {
            case 'textbook':
            case 'materials':
                dbKey = 'materials';
                arrayKey = 'materials';
                break;
            case 'lessonPlan':
            case 'lesson_plans':
                dbKey = 'lessonPlans';
                arrayKey = 'lessonPlans';
                break;
            case 'resource':
            case 'resources':
                dbKey = 'resources';
                arrayKey = 'resources';
                break;
            default:
                return res.status(400).json({ error: '无效的类别' });
        }

        // 读取现有数据
        const existingData = readDB(dbKey) || { [arrayKey]: [] };
        
        // 查找并删除文件
        const index = existingData[arrayKey].findIndex(file => file.id === fileId);
        
        if (index === -1) {
            return res.status(404).json({ error: '文件不存在' });
        }

        // 删除文件记录
        existingData[arrayKey].splice(index, 1);

        // 保存到数据库
        const success = writeDB(dbKey, existingData);

        if (success) {
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

