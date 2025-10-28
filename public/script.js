// 用户数据库（现在从服务器加载）
let userDatabase = {};

// 生成随机6位字母密码的函数
function generateRandomPassword() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return password;
}

// 验证学号格式（8位数字）
function validateStudentId(studentId) {
    const regex = /^\d{8}$/;
    return regex.test(studentId);
}

// 验证密码格式（6位字母）
function validatePassword(password) {
    const regex = /^[a-zA-Z]{6}$/;
    return regex.test(password);
}

// 显示错误信息
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    const inputElement = errorElement.previousElementSibling;
    inputElement.classList.add('error');
    inputElement.classList.remove('valid');
}

// 清除错误信息
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    const inputElement = errorElement.previousElementSibling;
    inputElement.classList.remove('error');
    inputElement.classList.add('valid');
}

// 显示登录结果
function showLoginResult(message, isSuccess) {
    const resultElement = document.getElementById('loginResult');
    resultElement.textContent = message;
    resultElement.className = `login-result ${isSuccess ? 'success' : 'error'}`;
}

// 实时验证输入
function setupRealTimeValidation() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // 学号实时验证
    usernameInput.addEventListener('input', function() {
        const value = this.value;
        if (value.length === 0) {
            clearError('usernameError');
            this.classList.remove('error', 'valid');
        } else if (validateStudentId(value)) {
            clearError('usernameError');
        } else {
            showError('usernameError', '学号必须是8位数字');
        }
    });

    // 密码实时验证
    passwordInput.addEventListener('input', function() {
        const value = this.value;
        if (value.length === 0) {
            clearError('passwordError');
            this.classList.remove('error', 'valid');
        } else if (validatePassword(value)) {
            clearError('passwordError');
        } else {
            showError('passwordError', '密码必须是6位字母');
        }
    });
}

// 填入演示账户
function fillDemoAccount() {
    // 使用数据库中的第一个账号作为演示账户
    const firstAccount = Object.entries(userDatabase)[0];
    if (firstAccount) {
        document.getElementById('username').value = firstAccount[0];
        document.getElementById('password').value = firstAccount[1];
        
        // 触发验证
        document.getElementById('username').dispatchEvent(new Event('input'));
        document.getElementById('password').dispatchEvent(new Event('input'));
    }
}

// 登录过程（使用API）
function simulateLogin(username, password) {
    return new Promise(async (resolve) => {
        try {
            // 尝试从服务器API登录
            const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000');
            const response = await fetch(`${apiBase}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: username, password: password })
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                // 保存用户完整信息和 token
                localStorage.setItem('userProfile', JSON.stringify(data.user));
                localStorage.setItem('authToken', data.token); // 保存 JWT token
                resolve({ 
                    success: true, 
                    message: `欢迎回来！${data.user.name || '学号 ' + username} 登录成功！`,
                    user: data.user
                });
            } else {
                resolve({ success: false, message: data.error || '登录失败' });
            }
        } catch (error) {
            console.error('登录错误:', error);
            // 如果API失败，回退到本地数据库
            setTimeout(() => {
                if (userDatabase[username] === password) {
                    resolve({ success: true, message: `欢迎回来！学号 ${username} 登录成功！` });
                } else {
                    resolve({ success: false, message: '学号或密码错误，请检查后重试' });
                }
            }, 500);
        }
    });
}

// 加载用户数据库
async function loadUserDatabase() {
    try {
        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000');
        const response = await fetch(`${apiBase}/api/users`);
        const data = await response.json();
        
        if (data.users) {
            // 转换为旧的格式用于兼容
            data.users.forEach(user => {
                // 这里不存储密码，但保留用户ID映射
                userDatabase[user.studentId] = '***'; // 密码安全
            });
            console.log(`已加载 ${data.users.length} 个用户`);
        }
    } catch (error) {
        console.error('加载用户数据库失败，使用默认账户:', error);
        // 回退到默认账户
        userDatabase = {
            '12345678': 'abcdef'
        };
    }
}

// 处理登录表单提交
function handleLogin(event) {
    // 安全地调用 preventDefault
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginBtn = document.querySelector('.login-btn');
    
    // 验证输入
    let hasError = false;
    
    if (!validateStudentId(username)) {
        showError('usernameError', '学号必须是8位数字');
        hasError = true;
    }
    
    if (!validatePassword(password)) {
        showError('passwordError', '密码必须是6位字母');
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    // 显示加载状态
    loginBtn.classList.add('loading');
    loginBtn.innerHTML = '登录中...';
    loginBtn.disabled = true;
    
    // 执行登录
    simulateLogin(username, password).then(result => {
        // 移除加载状态
        loginBtn.classList.remove('loading');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 登录';
        loginBtn.disabled = false;
        
        // 显示结果
        showLoginResult(result.message, result.success);
        
        // 如果登录成功，跳转到学习平台
        if (result.success) {
            // 保存当前用户信息
            localStorage.setItem('currentStudentId', username);
            
            // 延迟0.8秒后跳转，让用户看到成功消息
            setTimeout(() => {
                // 跳转到学习平台
                window.location.href = 'learning-platform.html';
            }, 800);
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 设置实时验证
    setupRealTimeValidation();
    
    // 绑定登录表单提交事件
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 加载用户数据库
    await loadUserDatabase();
    
    // 显示数据库中的第一个账号作为演示账户
    const firstAccount = Object.entries(userDatabase)[0];
    if (firstAccount && firstAccount[1] !== '***') {
        document.getElementById('demoUsername').textContent = firstAccount[0];
        document.getElementById('demoPassword').textContent = firstAccount[1];
    } else {
        // 显示默认账户
        document.getElementById('demoUsername').textContent = '12345678';
        document.getElementById('demoPassword').textContent = 'abcdef';
    }
    
    console.log('登录系统已初始化');
    console.log('当前用户数据库:', userDatabase);
});

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    // Enter键快速登录
    if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm.checkValidity()) {
            // 创建一个伪事件对象以避免 preventDefault 错误
            const fakeEvent = { preventDefault: () => {} };
            handleLogin(fakeEvent);
        }
    }
});

// 工具函数：生成新的随机密码（供管理员使用）
function generateNewPassword() {
    return generateRandomPassword();
}

// 工具函数：添加新用户（供管理员使用）
function addUser(studentId, password) {
    if (validateStudentId(studentId) && validatePassword(password)) {
        userDatabase[studentId] = password;
        return true;
    }
    return false;
}

// 工具函数：更新用户密码（供管理员使用）
function updateUserPassword(studentId, newPassword) {
    if (validateStudentId(studentId) && validatePassword(newPassword)) {
        if (userDatabase[studentId]) {
            userDatabase[studentId] = newPassword;
            return true;
        }
    }
    return false;
}

// 导出函数供外部使用
window.loginSystem = {
    generateNewPassword,
    addUser,
    updateUserPassword,
    getUserDatabase: () => ({ ...userDatabase })
};
