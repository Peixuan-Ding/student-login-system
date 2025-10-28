const axios = require('axios');
const { getConfig } = require('./config');

// 内部 AI API 调用函数（避免 HTTP 自调用）
async function callAIAPI(model, params) {
    const config = getConfig();
    
    let apiKey, baseUrl;
    switch (model) {
        case 'deepseek':
            apiKey = process.env.DEEPSEEK_API_KEY || config.deepseek.apiKey;
            baseUrl = config.deepseek.baseUrl;
            break;
        case 'kimi':
            apiKey = process.env.KIMI_API_KEY || config.kimi.apiKey;
            baseUrl = config.kimi.baseUrl;
            break;
        case 'chatgpt':
            apiKey = process.env.OPENAI_API_KEY || config.chatgpt.apiKey;
            baseUrl = config.chatgpt.baseUrl;
            break;
        case 'doubao':
            apiKey = process.env.DOUBAO_API_KEY || config.doubao.apiKey;
            baseUrl = config.doubao.baseUrl;
            break;
        default:
            apiKey = process.env.DEEPSEEK_API_KEY || config.deepseek.apiKey;
            baseUrl = config.deepseek.baseUrl;
    }
    
    if (!apiKey) {
        throw new Error(`${model.toUpperCase()}_API_KEY not configured`);
    }

    const { messages, temperature = 0.7, max_tokens = 2000 } = params;
    
    // 根据模型选择正确的 URL
    let url;
    if (model === 'kimi') {
        url = `${baseUrl}/v1/chat/completions`;
    } else if (model === 'doubao') {
        url = `${baseUrl}/chat`;
    } else {
        url = `${baseUrl}/chat/completions`;
    }
    
    const response = await axios.post(
        url,
        {
            model: params.model || (model === 'kimi' ? 'moonshot-v1-8k' : model === 'chatgpt' ? 'gpt-3.5-turbo' : 'deepseek-chat'),
            messages: messages,
            temperature: temperature,
            max_tokens: max_tokens
        },
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

