# 数据库说明文档

## 📁 数据库结构

本项目使用 JSON 文件作为数据库，存储在 `database/` 目录下。

### 数据文件说明

#### 1. `users.json` - 用户数据
```json
{
  "users": [
    {
      "studentId": "12345678",    // 学号（8位数字）
      "password": "abcdef",       // 密码（6位字母）
      "name": "张三",             // 姓名
      "grade": "三年级",          // 年级
      "email": "zhangsan@example.com",
      "avatar": "👨‍🎓",         // 头像
      "role": "student",          // 角色
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-10-27T00:00:00.000Z",
      "isActive": true            // 是否激活
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2024-10-27T00:00:00.000Z",
    "totalUsers": 5
  }
}
```

#### 2. `courses.json` - 课程数据
包含所有课程信息和章节内容。

#### 3. `materials.json` - 教学材料
上传的教学文档、教材等。

#### 4. `lesson-plans.json` - 教案
教师备课生成的教案记录。

#### 5. `resources.json` - 学习资源
题库、参考资料等资源。

#### 6. `chat-sessions.json` - 聊天会话
AI对话历史记录。

---

## 🔐 默认账户

项目预设了以下测试账户：

| 学号 | 密码 | 姓名 | 年级 | 状态 |
|------|------|------|------|------|
| 12345678 | abcdef | 张三 | 三年级 | ✅ 激活 |
| 20240001 | student | 李四 | 四年级 | ✅ 激活 |
| 20240002 | test123 | 王五 | 五年级 | ✅ 激活 |
| 20240003 | demoab | 赵六 | 六年级 | ✅ 激活 |
| 20240004 | student | 小红 | 一年级 | ✅ 激活 |

---

## 📡 API 接口说明

### 用户相关接口

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "studentId": "12345678",
  "password": "abcdef"
}
```

响应：
```json
{
  "success": true,
  "user": {
    "studentId": "12345678",
    "name": "张三",
    "grade": "三年级",
    ...
  }
}
```

#### 获取用户列表
```http
GET /api/users
```

#### 添加新用户
```http
POST /api/users
Content-Type: application/json

{
  "studentId": "20240005",
  "password": "passwd",
  "name": "新用户",
  "grade": "二年级",
  "email": "newuser@example.com"
}
```

#### 更新用户信息
```http
PUT /api/users/:studentId
Content-Type: application/json

{
  "name": "新名称",
  "grade": "新年级"
}
```

### 其他接口

- `GET /api/courses` - 获取课程列表
- `GET /api/materials` - 获取教学材料
- `GET /api/lesson-plans` - 获取教案
- `GET /api/resources` - 获取资源

---

## 🛠️ 使用指南

### 1. 启动服务器
```bash
npm start
```
服务器将运行在 `http://localhost:3000`

### 2. 测试登录
访问 `http://localhost:3000`
使用账户：`12345678` / `abcdef`

### 3. 管理用户
#### 添加新用户
可以直接编辑 `database/users.json` 或使用 API 接口添加。

#### 修改用户信息
```bash
# 直接编辑 users.json 文件
# 或使用 API 接口
```

---

## ⚠️ 注意事项

1. **密码安全**: `users.json` 包含明文密码，不要提交到公开仓库
2. **数据备份**: 定期备份 `database/` 目录下的所有文件
3. **并发控制**: 当前实现不支持并发写入，在高并发场景下需要改进
4. **性能考虑**: 如果用户量很大，建议迁移到真实的数据库（MySQL、PostgreSQL等）

---

## 🔄 数据迁移

### 从硬编码迁移到数据库
项目已经从 `script.js` 中的硬编码用户数据库迁移到 JSON 文件数据库，所有用户数据现在存储在 `database/users.json`。

### 备份数据
```bash
# 备份整个数据库目录
cp -r database database_backup_$(date +%Y%m%d)
```

### 恢复数据
```bash
# 恢复备份
cp -r database_backup_20241027 database
```

---

## 📈 扩展建议

### 升级到真实数据库

如果项目需要扩展，建议升级到以下方案之一：

#### 方案1: SQLite
```bash
npm install better-sqlite3
```
适合轻量级应用，单文件数据库。

#### 方案2: MongoDB
```bash
npm install mongodb mongoose
```
适合文档型数据，灵活易扩展。

#### 方案3: PostgreSQL/MySQL
```bash
npm install pg mysql2
```
适合复杂查询和高性能需求。

---

## 🐛 故障排除

### 问题：用户无法登录
- 检查服务器是否运行
- 检查 `database/users.json` 是否存在
- 检查 JSON 格式是否正确

### 问题：数据丢失
- 从备份恢复
- 检查 `.gitignore` 是否排除了数据库文件

### 问题：文件权限错误
```bash
# Linux/Mac
chmod -R 755 database/

# Windows (PowerShell)
icacls database /grant Users:F
```

---

## 📞 技术支持

如有问题，请检查：
1. 服务器日志
2. 浏览器控制台
3. 数据库文件完整性

