const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_DIR = path.join(__dirname, '..', 'database');
const DB_FILES = {
    users: path.join(DB_DIR, 'users.json'),
    courses: path.join(DB_DIR, 'courses.json'),
    materials: path.join(DB_DIR, 'materials.json'),
    lessonPlans: path.join(DB_DIR, 'lesson-plans.json'),
    resources: path.join(DB_DIR, 'resources.json'),
        tutors: path.join(DB_DIR, 'tutors.json')
};

// 数据库操作辅助函数
function readDB(fileKey) {
    try {
        const filePath = DB_FILES[fileKey];
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error(`读取数据库文件失败: ${fileKey}`, error);
    }
    return null;
}

function writeDB(fileKey, data) {
    try {
        const filePath = DB_FILES[fileKey];
        // 确保目录存在
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`写入数据库文件失败: ${fileKey}`, error);
        return false;
    }
}

module.exports = { readDB, writeDB, DB_FILES };

