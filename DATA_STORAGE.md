# 📊 项目数据存储需求文档

> **后端数据存储完整清单**

## 📋 目录

1. [用户认证数据](#1-用户认证数据)
2. [会话与状态数据](#2-会话与状态数据)
3. [聊天与对话历史](#3-聊天与对话历史)
4. [教学内容数据](#4-教学内容数据)
5. [学习进度数据](#5-学习进度数据)
6. [系统配置数据](#6-系统配置数据)
7. [数据库设计建议](#数据库设计建议)

---

## 1. 用户认证数据

### 1.1 用户账户表 (users)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `studentId` | VARCHAR(8) | 学号（主键） | PRIMARY KEY, NOT NULL |
| `password` | VARCHAR(255) | 密码（加密后） | NOT NULL |
| `name` | VARCHAR(50) | 姓名 | |
| `major` | VARCHAR(100) | 专业 | |
| `avatar` | VARCHAR(255) | 头像URL | |
| `email` | VARCHAR(100) | 邮箱 | UNIQUE |
| `phone` | VARCHAR(20) | 手机号 | |
| `status` | TINYINT | 账户状态（0=禁用,1=正常） | DEFAULT 1 |
| `createdAt` | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| `updatedAt` | TIMESTAMP | 更新时间 | ON UPDATE CURRENT_TIMESTAMP |

**当前模拟数据**（`script.js`）：
```javascript
const userDatabase = {
    '12345678': 'abcdef',  // 明文密码（需要改为加密存储）
    '87654321': 'xyzabc',
    // ... 更多账户
};
```

**安全要求**：
- ✅ 密码必须使用BCrypt等加密算法
- ✅ 添加密码强度验证
- ✅ 实现登录失败锁定机制
- ✅ 存储登录日志

---

## 2. 会话与状态数据

### 2.1 当前会话信息

| 键名 | 类型 | 说明 | 存储位置 |
|------|------|------|----------|
| `currentStudentId` | String | 当前登录学号 | localStorage |
| `userProfile` | Object | 用户资料JSON | localStorage |
| `sessionToken` | String | 会话令牌 | Cookie/HTTP Header |

**当前实现**：
```javascript
// 登录成功后保存
localStorage.setItem('currentStudentId', studentId);

// 退出时清除
localStorage.removeItem('currentStudentId');
localStorage.removeItem('userProfile');
```

### 2.2 用户设置

| 键名 | 类型 | 说明 |
|------|------|------|
| `language` | String | 语言设置（zh-CN/en） |
| `theme` | String | 主题设置 |
| `notifications` | Boolean | 通知开关 |

**当前实现**：
```javascript
localStorage.setItem('language', 'zh-CN');
```

---

## 3. 聊天与对话历史

### 3.1 对话历史表 (chat_history)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | BIGINT | 消息ID | PRIMARY KEY, AUTO_INCREMENT |
| `studentId` | VARCHAR(8) | 学号（外键） | FOREIGN KEY, NOT NULL |
| `sessionId` | VARCHAR(36) | 会话ID | NOT NULL |
| `chatType` | VARCHAR(20) | 对话类型 | NOT NULL |
| `role` | VARCHAR(10) | 角色（user/assistant） | NOT NULL |
| `content` | TEXT | 消息内容 | NOT NULL |
| `metadata` | JSON | 额外信息（模型、API调用等） | |
| `createdAt` | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

**对话类型**：
- `explore` - AI问答助手
- `myTutor` - 我的导师
- `professionalTutor` - 专业导师
- `lessonPlan` - 教案生成对话

**当前实现**：
```javascript
// 存储到 localStorage
const historyData = {
    chatType: 'myTutor',
    messages: [...],
    timestamp: new Date().toISOString(),
    sessionId: generateSessionId()
};
localStorage.setItem('chatHistory', JSON.stringify([...]));
```

### 3.2 专业导师会话 (professional_tutor_sessions)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `sessionId` | VARCHAR(36) | 会话ID（主键） |
| `studentId` | VARCHAR(8) | 学号（外键） |
| `title` | VARCHAR(200) | 会话标题 |
| `startTime` | TIMESTAMP | 开始时间 |
| `endTime` | TIMESTAMP | 结束时间 |
| `status` | VARCHAR(20) | 状态（active/ended） |
| `totalMessages` | INT | 消息总数 |

---

## 4. 教学内容数据

### 4.1 课程教材表 (textbooks)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | INT | 教材ID（主键） |
| `name` | VARCHAR(200) | 教材名称 |
| `type` | VARCHAR(20) | 文件类型（PDF/DOCX等） |
| `size` | VARCHAR(20) | 文件大小 |
| `url` | VARCHAR(255) | 下载URL |
| `subject` | VARCHAR(50) | 学科 |
| `week` | TINYINT | 周次（1-13） |
| `uploadTime` | TIMESTAMP | 上传时间 |

**当前数据规模**：9门学科 × 13周 = 117条教材记录

### 4.2 教学计划表 (lesson_plans)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | INT | 教案ID（主键） |
| `studentId` | VARCHAR(8) | 创建者学号（外键） |
| `subject` | VARCHAR(50) | 学科 |
| `grade` | VARCHAR(20) | 年级 |
| `topic` | VARCHAR(200) | 主题 |
| `duration` | VARCHAR(20) | 时长 |
| `content` | TEXT | 教案内容（HTML格式） |
| `theme` | VARCHAR(100) | 主题 |
| `type` | VARCHAR(50) | 类型 |
| `objectives` | TEXT | 教学目标 |
| `createdAt` | TIMESTAMP | 创建时间 |

**当前实现**（最近50条）：
```javascript
const history = JSON.parse(localStorage.getItem('lessonPlanHistory') || '[]');
// 最多保存50条记录
```

### 4.3 学习资源表 (learning_resources)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | INT | 资源ID（主键） |
| `name` | VARCHAR(200) | 资源名称 |
| `type` | VARCHAR(20) | 类型（mp4/mp3/zip等） |
| `size` | VARCHAR(20) | 文件大小 |
| `url` | VARCHAR(255) | 资源URL |
| `subject` | VARCHAR(50) | 学科分类 |

**当前数据规模**：8门学科 × 3种类型 = 24条资源记录

---

## 5. 学习进度数据

### 5.1 学习记录表 (learning_progress)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | BIGINT | 记录ID（主键） |
| `studentId` | VARCHAR(8) | 学号（外键） |
| `resourceType` | VARCHAR(50) | 资源类型（教材/视频/练习） |
| `resourceId` | INT | 资源ID |
| `progress` | TINYINT | 完成进度（0-100） |
| `timeSpent` | INT | 学习时长（秒） |
| `lastAccessed` | TIMESTAMP | 最后访问时间 |
| `status` | VARCHAR(20) | 状态（started/completed） |

### 5.2 练习统计表 (exercise_statistics)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | BIGINT | 统计ID（主键） |
| `studentId` | VARCHAR(8) | 学号（外键） |
| `exerciseType` | VARCHAR(50) | 练习类型 |
| `totalQuestions` | INT | 总题数 |
| `correctAnswers` | INT | 正确答案数 |
| `accuracy` | DECIMAL(5,2) | 正确率 |
| `lastAttempt` | TIMESTAMP | 最后尝试时间 |

---

## 6. 系统配置数据

### 6.1 API配置

| 键名 | 类型 | 说明 |
|------|------|------|
| `deepseek_api_key` | String | DeepSeek API密钥 |
| `currentModel` | String | 当前使用的AI模型 |
| `apiEndpoint` | String | API接口地址 |

**当前实现**：
```javascript
// 存储API密钥
localStorage.setItem('deepseek_api_key', apiKey);

// 支持的模型
const models = ['deepseek', 'kimi', 'chatgpt', 'doubao'];
```

### 6.2 系统日志

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | BIGINT | 日志ID（主键） |
| `studentId` | VARCHAR(8) | 用户学号 |
| `action` | VARCHAR(100) | 操作类型 |
| `details` | JSON | 详细信息 |
| `ipAddress` | VARCHAR(50) | IP地址 |
| `userAgent` | VARCHAR(255) | 用户代理 |
| `createdAt` | TIMESTAMP | 创建时间 |

---

## 数据库设计建议

### 🎯 推荐数据库

1. **MySQL/PostgreSQL** - 关系型数据库（推荐）
   - 用户数据、教学数据、学习进度

2. **Redis** - 缓存和会话存储
   - 临时会话数据
   - 热门资源缓存

3. **MongoDB** - 非关系型数据库（可选）
   - 聊天历史
   - 日志记录

### 📊 数据库关系图

```
┌─────────────┐
│   users     │ (用户表)
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┐
       │                  │                  │
┌──────▼──────┐  ┌─────────▼──────────┐  ┌────▼─────────────┐
│chat_history │  │learning_progress  │  │lesson_plans      │
└─────────────┘  └───────────────────┘  └──────────────────┘
                         │
                         │
                  ┌──────▼──────┐
                  │  exercises  │
                  └─────────────┘
```

### 🔑 主要索引建议

```sql
-- 用户表
CREATE INDEX idx_studentId ON users(studentId);

-- 对话历史表
CREATE INDEX idx_chat_history ON chat_history(studentId, createdAt);
CREATE INDEX idx_sessionId ON chat_history(sessionId);

-- 学习进度表
CREATE INDEX idx_progress ON learning_progress(studentId, resourceId);

-- 教案表
CREATE INDEX idx_lesson_plans ON lesson_plans(studentId, createdAt);
```

---

## 📈 数据规模估算

### 当前项目（演示版本）

| 数据类型 | 记录数 | 存储大小（估算） |
|---------|--------|----------------|
| 用户账户 | 10条 | ~5KB |
| 对话历史 | 0条 | 0KB |
| 教案记录 | 0条 | 0KB |
| 教学资源 | 141条 | ~50KB |
| **总计** | **151条** | **~55KB** |

### 生产环境估算

假设500名学生，使用1年：

| 数据类型 | 记录数 | 存储大小 |
|---------|--------|---------|
| 用户账户 | 500条 | ~100KB |
| 对话历史 | 50,000条 | ~500MB |
| 教案记录 | 5,000条 | ~50MB |
| 学习进度 | 20,000条 | ~10MB |
| 系统日志 | 100,000条 | ~200MB |
| **总计** | **175,500条** | **~760MB** |

---

## ✅ 安全建议

### 密码存储
```javascript
// ❌ 错误：明文存储
password: 'abcdef'

// ✅ 正确：使用BCrypt加密
password: '$2b$10$...'  // 加密后的hash值
```

### 数据验证
- 输入数据必须验证格式
- 防止SQL注入和XSS攻击
- 实现CSRF防护

### 访问控制
- 实现基于角色的权限管理
- 记录所有敏感操作日志
- 定期备份重要数据

---

## 🚀 下一步行动

1. **设计数据库表结构** - 根据上述需求创建SQL脚本
2. **实现后端API** - Node.js/Express 或 Python/Django
3. **数据迁移** - 将模拟数据迁移到真实数据库
4. **添加认证中间件** - JWT token机制
5. **实现日志系统** - 记录所有重要操作
6. **性能优化** - 添加缓存和索引

---

## 📝 总结

当前项目使用的**localStorage**只是浏览器本地存储，**不适用于生产环境**。

**生产环境需要**：
- ✅ 真实的数据库存储（MySQL/PostgreSQL）
- ✅ 安全的密码加密机制
- ✅ 会话管理和身份验证
- ✅ 数据备份和恢复策略
- ✅ 日志和监控系统

---

**文档版本**：1.0  
**最后更新**：2024年  
**维护者**：AI Assistant
