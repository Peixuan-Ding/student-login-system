const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

// 读取配置
function getConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('读取配置文件失败:', error);
    }
    return getDefaultConfig();
}

// 默认配置
function getDefaultConfig() {
    return {
        deepseek: {
            apiKey: '',
            baseUrl: 'https://api.deepseek.com'
        },
        kimi: {
            apiKey: '',
            baseUrl: 'https://api.moonshot.cn'
        },
        chatgpt: {
            apiKey: '',
            baseUrl: 'https://api.openai.com'
        },
        doubao: {
            apiKey: '',
            baseUrl: 'https://ark.cn-beijing.volces.com/api/v3'
        }
    };
}

// 保存配置
function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('保存配置文件失败:', error);
        return false;
    }
}

// 创建默认配置文件（如果不存在）
function initConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        saveConfig(getDefaultConfig());
        console.log('已创建默认配置文件: config.json');
        console.log('请在 config.json 中添加你的 API 密钥');
    }
}

module.exports = { getConfig, saveConfig, initConfig };

