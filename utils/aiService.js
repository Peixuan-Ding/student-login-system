const axios = require('axios');
const { getConfig } = require('./config');

// 内部 AI API 调用函数（避免 HTTP 自调用）
async function callAIAPI(model, params) {
    const config = getConfig();
    
    let apiKey, baseUrl, modelName;
    switch (model) {
        case 'deepseek':
            apiKey = process.env.DEEPSEEK_API_KEY || config.deepseek.apiKey;
            baseUrl = config.deepseek.baseUrl;
            modelName = 'deepseek-v3';
            break;
        case 'kimi':
            apiKey = process.env.KIMI_API_KEY || config.kimi.apiKey;
            baseUrl = config.kimi.baseUrl;
            modelName = 'moonshot-v1-8k'; // 或其他可用模型
            break;
        case 'chatgpt':
            apiKey = process.env.OPENAI_API_KEY || config.chatgpt.apiKey;
            baseUrl = config.chatgpt.baseUrl;
            modelName = 'gpt-3.5-turbo';
            break;
        case 'doubao':
            apiKey = process.env.DOUBAO_API_KEY || config.doubao.apiKey;
            baseUrl = config.doubao.baseUrl;
            modelName = 'ep-'; // 豆包模型前缀
            break;
        default:
            apiKey = process.env.DEEPSEEK_API_KEY || config.deepseek.apiKey;
            baseUrl = config.deepseek.baseUrl;
            modelName = 'deepseek-v3';
    }
    
    if (!apiKey) {
        throw new Error(`${model.toUpperCase()}_API_KEY not configured`);
    }

    const { messages, temperature = 0.7, max_tokens = 2000, stream = false } = params;
    
    // 使用统一的接口地址
    const url = `${baseUrl}/v1/chat/completions`;
    
    const requestBody = {
        model: params.model || modelName,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        stream: stream
    };
    
    const response = await axios.post(
        url,
        requestBody,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        }
    );

    return response.data;
}

module.exports = { callAIAPI };

