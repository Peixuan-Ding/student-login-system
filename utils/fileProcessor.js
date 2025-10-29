const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * 处理上传的文件，提取文本内容
 * @param {string} filePath - 文件路径
 * @param {string} mimeType - 文件MIME类型
 * @returns {Promise<{success: boolean, content: string, error?: string}>}
 */
async function extractTextFromFile(filePath, mimeType) {
    try {
        const ext = path.extname(filePath).toLowerCase();
        
        // PDF文件
        if (mimeType === 'application/pdf' || ext === '.pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return { success: true, content: data.text };
        }
        
        // Word文档
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimeType === 'application/msword' || 
            ext === '.docx' || ext === '.doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            return { success: true, content: result.value };
        }
        
        // 纯文本文件
        if (mimeType === 'text/plain' || ext === '.txt') {
            const content = await fs.readFile(filePath, 'utf-8');
            return { success: true, content };
        }
        
        // 图片文件（返回提示）
        if (mimeType.startsWith('image/')) {
            return { success: false, content: '', error: '图片文件暂不支持文本提取' };
        }
        
        return { success: false, content: '', error: '不支持的文件类型' };
    } catch (error) {
        console.error('提取文件文本内容失败:', error);
        return { success: false, content: '', error: error.message };
    }
}

/**
 * 批量处理文件，提取所有文本内容
 * @param {Array<{path: string, mimeType: string, name: string}>} files - 文件列表
 * @returns {Promise<{success: boolean, contents: Array, totalText: string}>}
 */
async function extractTextFromFiles(files) {
    const results = [];
    let totalText = '';
    
    for (const file of files) {
        const result = await extractTextFromFile(file.path, file.mimeType);
        if (result.success) {
            results.push({
                name: file.name,
                content: result.content
            });
            totalText += `\n\n===== 文件: ${file.name} =====\n${result.content}`;
        } else {
            console.warn(`文件 ${file.name} 处理失败: ${result.error}`);
        }
    }
    
    return {
        success: true,
        contents: results,
        totalText: totalText.trim()
    };
}

/**
 * 清理临时文件
 * @param {string} filePath - 文件路径
 */
async function cleanupFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error('删除临时文件失败:', error);
    }
}

module.exports = {
    extractTextFromFile,
    extractTextFromFiles,
    cleanupFile
};

