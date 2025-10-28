const express = require('express');
const axios = require('axios');
const { getConfig } = require('../utils/config');
const { callAIAPI } = require('../utils/aiService');

const router = express.Router();

// DeepSeek API 调用
router.post('/deepseek/chat', async (req, res) => {
    try {
        const config = getConfig();
        const apiKey = process.env.DEEPSEEK_API_KEY || config.deepseek.apiKey;
        
        if (!apiKey) {
            return res.status(401).json({ error: 'DEEPSEEK_API_KEY not configured' });
        }

        const { model = 'deepseek-chat', messages, temperature = 0.7, max_tokens = 2000 } = req.body;

        const response = await axios.post(
            `${config.deepseek.baseUrl}/chat/completions`,
            { model, messages, temperature, max_tokens },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('DeepSeek API 错误:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { message: error.message }
        });
    }
});

// Kimi API 调用
router.post('/kimi/chat', async (req, res) => {
    try {
        const config = getConfig();
        const apiKey = process.env.KIMI_API_KEY || config.kimi.apiKey;
        
        if (!apiKey) {
            return res.status(401).json({ error: 'KIMI_API_KEY not configured' });
        }

        const { model = 'moonshot-v1-8k', messages, temperature = 0.7, max_tokens = 2000 } = req.body;

        const response = await axios.post(
            `${config.kimi.baseUrl}/v1/chat/completions`,
            { model, messages, temperature, max_tokens },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Kimi API 错误:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { message: error.message }
        });
    }
});

// ChatGPT API 调用
router.post('/chatgpt/chat', async (req, res) => {
    try {
        const config = getConfig();
        const apiKey = process.env.OPENAI_API_KEY || config.chatgpt.apiKey;
        
        if (!apiKey) {
            return res.status(401).json({ error: 'OPENAI_API_KEY not configured' });
        }

        const { model = 'gpt-3.5-turbo', messages, temperature = 0.7, max_tokens = 2000 } = req.body;

        const response = await axios.post(
            `${config.chatgpt.baseUrl}/v1/chat/completions`,
            { model, messages, temperature, max_tokens },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('ChatGPT API 错误:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { message: error.message }
        });
    }
});

// 豆包 API 调用
router.post('/doubao/chat', async (req, res) => {
    try {
        const config = getConfig();
        const apiKey = process.env.DOUBAO_API_KEY || config.doubao.apiKey;
        
        if (!apiKey) {
            return res.status(401).json({ error: 'DOUBAO_API_KEY not configured' });
        }

        const { model = 'ep-xxx', messages, temperature = 0.7, max_tokens = 2000 } = req.body;

        const response = await axios.post(
            `${config.doubao.baseUrl}/chat`,
            { model, messages, temperature, max_tokens },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('豆包 API 错误:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || { message: error.message }
        });
    }
});

// 通用模型 API 调用（根据当前模型自动选择）
router.post('/chat', async (req, res) => {
    try {
        const { model = 'deepseek', ...params } = req.body;
        
        // 直接调用内部函数，避免 HTTP 自调用
        const response = await callAIAPI(model, params);
        res.json(response);
    } catch (error) {
        console.error('API 路由错误:', error.message);
        res.status(error.response?.status || 500).json({
            error: { message: error.message }
        });
    }
});

module.exports = router;

