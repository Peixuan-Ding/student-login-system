const fs = require('fs').promises;
const path = require('path');

// pdf-parse 2.4.5 是 ES 模块，需要通过兼容方式导入
// PDFParse 是一个类，需要用 new 实例化，然后调用 getText() 方法
const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

if (!PDFParse || typeof PDFParse !== 'function') {
    throw new Error('pdf-parse 模块未正确导入，找不到 PDFParse 类');
}

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
            // PDFParse 是一个类，需要用 new 实例化
            // 需要将 Node.js Buffer 转换为 Uint8Array
            const uint8Array = new Uint8Array(dataBuffer);
            const pdfParser = new PDFParse({ data: uint8Array });
            // getText() 返回一个 Promise<TextResult>，TextResult 包含 text 属性
            const textResult = await pdfParser.getText();
            const text = textResult.text || '';
            return { success: true, content: text };
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
            console.error('错误详情:', {
                filePath,
                mimeType,
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack?.substring(0, 200)
            });
            return { success: false, content: '', error: error.message || '文件处理失败' };
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
    const errors = [];
    
    for (const file of files) {
        try {
            const result = await extractTextFromFile(file.path, file.mimeType);
            if (result.success) {
                results.push({
                    name: file.name,
                    content: result.content
                });
                totalText += `\n\n===== 文件: ${file.name} =====\n${result.content}`;
            } else {
                const errorMsg = result.error || '未知错误';
                console.warn(`文件 ${file.name} 处理失败: ${errorMsg}`);
                errors.push({ name: file.name, error: errorMsg });
            }
        } catch (error) {
            const errorMsg = error.message || '处理文件时发生异常';
            console.error(`文件 ${file.name} 处理异常:`, error);
            errors.push({ name: file.name, error: errorMsg });
        }
    }
    
    // 不再抛出错误，即使所有文件处理失败也返回结果
    // 这样可以让文件上传成功，只是文本提取失败
    // 用户仍然可以保存文件信息到数据库
    
    return {
        success: true,
        contents: results,
        totalText: totalText.trim(),
        errors: errors.length > 0 ? errors : undefined
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

