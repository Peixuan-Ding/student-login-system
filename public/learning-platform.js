// 学习平台主要功能
class LearningPlatform {
    constructor() {
        this.currentUser = null;
        this.chatHistory = [];
        this.myTutorHistory = [];
        this.professionalTutorHistory = [];
        this.professionalTutorSessions = []; // 通用问答助手会话列表
        this.currentProfessionalSession = null; // 当前会话ID
        this.isTyping = false;
        this.currentSection = 'explore';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.currentLanguage = 'zh-CN';
        this.currentModel = 'deepseek';
        this.currentWeek = 1; // 当前教学周
        this.currentView = 'weekly'; // 当前视图：weekly 或 category
        // 初始化为空数组，将从后端加载
        this.textbookData = [];
        this.lessonPlanData = [];
        this.resourceData = [];
        this.translations = {
            'zh-CN': {
                'welcome': '欢迎，',
                'searchPlaceholder': '搜索课程、知识点...',
                'settings': '设置',
                'learningHistory': '学习记录',
                'logout': '退出登录',
                'explore': '探索',
                'myTutor': '学科专业导师',
                'professionalTutor': '通用问答助手',
                'personalProfile': 'Padlet-学生',
                'textbooks': '教材',
                'lessonPlans': '教案',
                'resources': '个人知识库',
                'studentManagement': 'Dashboard-教师',
                'platformTitle': '学科教学智能平台',
                'platformSubtitle': '为学生打造的专业化AI学习平台'
            },
            'zh-TW': {
                'welcome': '歡迎，',
                'searchPlaceholder': '搜尋課程、知識點...',
                'settings': '設定',
                'learningHistory': '學習記錄',
                'logout': '登出',
                'explore': '探索',
                'myTutor': '我的導師',
                'professionalTutor': '專業導師',
                'courses': '課程',
                'personalProfile': '個人檔案',
                'textbooks': '教材',
                'lessonPlans': '教案',
                'resources': '資源',
                'studentManagement': '學生管理',
                'platformTitle': '學科教學智能平台',
                'platformSubtitle': '為學生打造的專業化AI學習平台'
            },
            'en': {
                'welcome': 'Welcome, ',
                'searchPlaceholder': 'Search courses, knowledge points...',
                'settings': 'Settings',
                'learningHistory': 'Learning History',
                'logout': 'Logout',
                'explore': 'Explore',
                'myTutor': 'My Tutor',
                'professionalTutor': 'Professional Tutor',
                'courses': 'Courses',
                'personalProfile': 'Personal Profile',
                'textbooks': 'Textbooks',
                'lessonPlans': 'Lesson Plans',
                'resources': 'Resources',
                'studentManagement': 'Student Management',
                'platformTitle': 'Subject-based Teaching Tool',
                'platformSubtitle': 'AI Learning Platform Designed for Students'
            }
        };
        
        this.init();
        this.loadProfessionalTutorSessions(); // 加载会话历史
        this.loadFileData(); // 加载文件数据
    }

    // 从后端加载文件数据
    async loadFileData() {
        try {
            // 加载教材数据
            const materialsRes = await fetch('/api/materials');
            const materialsData = await materialsRes.json();
            this.textbookData = (materialsData.materials || []).map(file => ({
                id: file.id,
                name: file.title || file.name,
                type: file.fileType?.toUpperCase() || 'PDF',
                size: file.size || '0MB',
                date: new Date(file.uploadDate).toLocaleDateString('zh-CN'),
                week: file.week || 1,
                subject: file.subject || '',
                tags: file.tags || []
            }));

            // 加载教案数据
            const lessonPlansRes = await fetch('/api/lesson-plans');
            const lessonPlansData = await lessonPlansRes.json();
            this.lessonPlanData = (lessonPlansData.lessonPlans || []).map(file => ({
                id: file.id,
                name: file.title || file.name,
                type: file.fileType?.toUpperCase() || 'DOCX',
                size: file.size || '0KB',
                date: new Date(file.uploadDate || file.createdAt).toLocaleDateString('zh-CN'),
                week: file.week || 1,
                subject: file.subject || '',
                tags: file.tags || [],
                subtype: file.subtype
            }));

            // 加载资源数据
            const resourcesRes = await fetch('/api/resources');
            if (!resourcesRes.ok) {
                console.error('加载资源数据失败，状态码:', resourcesRes.status);
                throw new Error(`加载资源数据失败: ${resourcesRes.status}`);
            }
            const resourcesData = await resourcesRes.json();
            console.log('加载的资源数据:', resourcesData);
            console.log('resources 数组:', resourcesData.resources);
            console.log('resources 长度:', resourcesData.resources?.length || 0);
            
            this.resourceData = (resourcesData.resources || []).map(file => {
                const mapped = {
                id: file.id,
                name: file.title || file.name,
                    type: (file.fileType || 'file').toUpperCase(),
                    originalType: file.fileType || 'file',
                size: file.size || '0MB',
                    date: file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
                    iconClass: file.iconClass || getIconClassFromFileType(file.fileType || 'file'),
                    tags: file.tags || []
                };
                console.log('映射的文件:', mapped);
                return mapped;
            });
            console.log('处理后的资源数据:', this.resourceData);
            console.log('resourceData 长度:', this.resourceData.length);

            // 更新UI
            this.refreshCurrentView();
        } catch (error) {
            console.error('加载文件数据失败:', error);
        }
    }

    // 刷新当前视图
    refreshCurrentView() {
        if (this.currentSection === 'textbooks') {
            this.loadTextbookContent();
        } else if (this.currentSection === 'lessonPlans') {
            this.loadLessonPlanContent();
        } else if (this.currentSection === 'resources') {
            this.loadResourceContent();
        }
    }

    // 已废弃：假数据生成函数，现在从API加载

    init() {
        this.loadUserInfo();
        this.bindEvents();
        this.updateUI();
        this.loadLanguage();
        
        console.log('智慧学习平台已初始化');
    }

    // 加载用户信息
    loadUserInfo() {
        const studentId = localStorage.getItem('currentStudentId') || '12345678';
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        this.currentUser = {
            studentId: studentId,
            name: userProfile.name || '学生',
            major: userProfile.major || '',
            grade: userProfile.grade || '2024'
        };
        
        document.getElementById('currentUser').textContent = this.currentUser.name;
    }

    // 绑定事件
    bindEvents() {
        // 我的导师输入
        const myTutorInput = document.getElementById('myTutorInput');
        if (myTutorInput) {
            myTutorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                    this.sendMyTutorMessage();
                }
            });

            myTutorInput.addEventListener('input', () => {
                this.autoResizeTextarea(myTutorInput);
            });
        }

        // 通用问答助手输入
        const professionalTutorInput = document.getElementById('professionalTutorInput');
        if (professionalTutorInput) {
            professionalTutorInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendProfessionalTutorMessage();
                }
            });

            professionalTutorInput.addEventListener('input', () => {
                this.autoResizeTextarea(professionalTutorInput);
            });
        }

        // 全局搜索
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });
        }

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // 模型切换
        const modelSelect = document.getElementById('modelSelect');
        const applyModelBtn = document.getElementById('applyModelBtn');
        if (applyModelBtn && modelSelect) {
            applyModelBtn.addEventListener('click', () => {
                const val = modelSelect.value || 'deepseek';
                this.setModel(val);
            });
        }
    }

    // 自动调整文本框高度
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // 显示指定区域
    showSection(sectionId) {
        // 隐藏所有区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 移除所有导航项的活动状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 显示指定区域
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 激活对应的导航项
        const navItem = document.querySelector(`[onclick*="${sectionId}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        this.currentSection = sectionId;

        // 进入通用问答助手时同步模型展示
        if (sectionId === 'professionalTutor') {
            this.updateModelDisplay();
        }

        // 如果是个人档案页面，生成日历并加载课程数据
        if (sectionId === 'personalProfile') {
            this.generateCalendar();
            this.loadCourseModules();
            // 延迟加载课程数据，确保DOM已渲染
            setTimeout(() => {
                initPadletCourseView();
                renderScheduleFiles(); // 渲染课表文件列表
            }, 100);
        }

        // 如果是课程页面（探索页面中的courses），初始化课程视图
        if (sectionId === 'courses') {
            // 确保课程视图加载
            setTimeout(() => {
                loadCourseWeeklyContent();
            }, 100);
        }

        // 如果是教材页面，初始化教材视图
        if (sectionId === 'textbooks') {
            // 异步初始化，确保数据已加载
            this.initTextbookView().catch(err => {
                console.error('初始化教材视图失败:', err);
            });
        }

        // 如果是教案页面，初始化教案视图
        if (sectionId === 'lessonPlans') {
            // 异步初始化，确保数据已加载
            this.initLessonPlanView().catch(err => {
                console.error('初始化教案视图失败:', err);
            });
        }

        // 如果是个人知识库页面，初始化资源视图
        if (sectionId === 'resources') {
            // 异步初始化，确保数据已加载
            this.initResourceView().catch(err => {
                console.error('初始化资源视图失败:', err);
            });
        }
    }

    setModel(model) {
        const allowed = ['deepseek', 'kimi', 'chatgpt', 'doubao'];
        this.currentModel = allowed.includes(model) ? model : 'deepseek';
        this.updateModelDisplay();
        this.showNotification(`已切换模型为：${this.currentModel}`, 'info');
    }

    updateModelDisplay() {
        const el = document.getElementById('currentModel');
        if (el) el.textContent = this.currentModel;
        const select = document.getElementById('modelSelect');
        if (select) select.value = this.currentModel;
    }

    // 用户菜单
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }


    // 显示设置
    showSettings() {
        this.closeUserMenu();
        this.showNotification('设置功能开发中...', 'info');
    }

    // 显示学习记录
    showLearningHistory() {
        this.closeUserMenu();
        this.showNotification('学习记录功能开发中...', 'info');
    }

    // 关闭用户菜单
    closeUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    // 退出登录
    logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('currentStudentId');
            localStorage.removeItem('userProfile');
            window.location.href = 'index.html';
        }
    }

    // 执行搜索
    performSearch(query) {
        if (!query.trim()) return;
        this.showNotification(`搜索"${query}"功能开发中...`, 'info');
    }

    // 处理窗口大小变化
    handleResize() {
        // 响应式处理
        if (window.innerWidth <= 768) {
            // 移动端处理
        }
    }

    // 更新UI
    updateUI() {
        // 更新各种UI元素
        this.updateStatistics();
    }

    // 更新统计信息
    updateStatistics() {
        // 更新学习统计
        const learningDays = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));
        // 这里可以添加更多统计更新逻辑
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 探索页面功能
    openEssayCorrection() {
        this.showSection('essayCorrection');
        this.initEssayCorrection();
    }

    openFourSchoolExam() {
        this.showNotification('四校联考功能开发中...', 'info');
    }

    openCreativeWriting() {
        this.showNotification('创意写作功能开发中...', 'info');
    }

    openIELTSPrep() {
        this.showNotification('雅思备考功能开发中...', 'info');
    }

    openLessonPlanAssistant() {
        this.showSection('lessonPlanAssistant');
        this.initLessonPlanAssistant();
    }

    initLessonPlanAssistant() {
        this.selectedLessonPlanModel = null;
        this.bindLessonPlanEvents();
    }

    bindLessonPlanEvents() {
        // AI模型选择
        const modelOptions = document.querySelectorAll('.model-option');
        modelOptions.forEach(option => {
            option.addEventListener('click', () => this.selectLessonPlanModel(option));
        });
    }

    selectLessonPlanModel(element) {
        // 移除之前的选中状态
        document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
        
        // 添加选中状态
        element.classList.add('selected');
        
        // 保存选中的模型
        this.selectedLessonPlanModel = element.dataset.model;
    }

    generateLessonPlanContent(formData) {
        // 这里应该是实际的AI调用，目前返回示例数据
        const { subject, grade, topic, duration, theme, objectives, type } = formData;
        
        return `
<h2>${topic || '教案标题'}</h2>

<div class="lesson-info">
    <p><strong>科目：</strong>${subject || '未填写'}</p>
    <p><strong>年级：</strong>${grade || '未填写'}</p>
    <p><strong>课时时长：</strong>${duration || '未填写'}分钟</p>
    <p><strong>课程类型：</strong>${type || '未填写'}</p>
    ${theme ? `<p><strong>教学主题：</strong>${theme}</p>` : ''}
</div>

<h3>一、教学目标</h3>
<p>${objectives || '请填写教学目标'}</p>

<h3>二、教学重点</h3>
<ul>
    <li>重点理解并掌握核心知识点</li>
    <li>提高学生的实际应用能力</li>
</ul>

<h3>三、教学难点</h3>
<ul>
    <li>知识点的综合运用</li>
    <li>学生思维能力的培养</li>
</ul>

<h3>四、教学过程</h3>

<h4>（一）导入（5分钟）</h4>
<p>通过问题或情境引导学生进入新课学习</p>

<h4>（二）新课讲授（25分钟）</h4>
<ol>
    <li>讲解核心知识点</li>
    <li>分析重点内容</li>
    <li>解决难点问题</li>
</ol>

<h4>（三）课堂练习（10分钟）</h4>
<p>组织学生进行相关练习，巩固所学知识</p>

<h4>（四）课堂小结（5分钟）</h4>
<p>总结本节课重点内容，布置课后作业</p>

<h3>五、板书设计</h3>
<p>根据教学内容设计清晰的板书结构</p>

<h3>六、作业布置</h3>
<ul>
    <li>完成相关练习题</li>
    <li>预习下一课内容</li>
</ul>
        `;
    }

    generateLessonPlan() {
        if (!this.selectedLessonPlanModel) {
            this.showNotification('请先选择AI模型', 'warning');
            return;
        }

        // 收集表单数据
        const formData = {
            subject: document.getElementById('lessonSubject').value,
            grade: document.getElementById('lessonGrade').value,
            topic: document.getElementById('lessonTopic').value,
            duration: document.getElementById('lessonDuration').value,
            theme: document.getElementById('lessonTheme').value,
            objectives: document.getElementById('lessonObjectives').value,
            type: document.getElementById('lessonType').value
        };

        // 验证必填项
        if (!formData.subject || !formData.grade || !formData.topic) {
            this.showNotification('请填写完整的课程信息', 'warning');
            return;
        }

        // 显示加载状态
        this.showNotification('正在生成教案...', 'info');

        // 生成教案内容
        setTimeout(() => {
            const content = this.generateLessonPlanContent(formData);
            document.getElementById('lessonPlanContent').innerHTML = content;
            document.getElementById('lessonPlanPreview').style.display = 'block';
            this.showNotification('教案生成成功！', 'success');
        }, 1500);
    }

    resetLessonPlanForm() {
        document.getElementById('lessonSubject').value = '';
        document.getElementById('lessonGrade').value = '';
        document.getElementById('lessonTopic').value = '';
        document.getElementById('lessonDuration').value = '';
        document.getElementById('lessonTheme').value = '';
        document.getElementById('lessonObjectives').value = '';
        document.getElementById('lessonType').value = '';
        document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
        this.selectedLessonPlanModel = null;
        document.getElementById('lessonPlanPreview').style.display = 'none';
    }

    saveLessonPlan() {
        const content = document.getElementById('lessonPlanContent').innerHTML;
        if (!content) {
            this.showNotification('没有可保存的教案', 'warning');
            return;
        }

        // 保存到本地存储或发送到服务器
        const lessonPlan = {
            subject: document.getElementById('lessonSubject').value,
            grade: document.getElementById('lessonGrade').value,
            topic: document.getElementById('lessonTopic').value,
            duration: document.getElementById('lessonDuration').value,
            theme: document.getElementById('lessonTheme').value,
            type: document.getElementById('lessonType').value,
            content: content,
            createdAt: new Date().toISOString()
        };

        const history = JSON.parse(localStorage.getItem('lessonPlanHistory') || '[]');
        history.unshift(lessonPlan);
        if (history.length > 50) history.pop(); // 只保留最近50条
        localStorage.setItem('lessonPlanHistory', JSON.stringify(history));

        this.showNotification('教案已保存', 'success');
    }

    downloadLessonPlan() {
        const content = document.getElementById('lessonPlanContent').innerHTML;
        if (!content) {
            this.showNotification('没有可下载的教案', 'warning');
            return;
        }

        const subject = document.getElementById('lessonSubject').value || '课程';
        const grade = document.getElementById('lessonGrade').value || '';
        const topic = document.getElementById('lessonTopic').value || '教案';
        
        const fileName = `${subject}-${grade}-${topic}-教案.html`;
        const blob = new Blob([`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${topic}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        h2 { color: #333; }
        .lesson-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
${content}
</body>
</html>
        `], { type: 'text/html' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('教案已下载', 'success');
    }

    editLessonPlan() {
        document.getElementById('lessonPlanPreview').style.display = 'none';
        this.showNotification('请修改表单信息后重新生成教案', 'info');
    }

    showLessonPlanHistory() {
        const history = JSON.parse(localStorage.getItem('lessonPlanHistory') || '[]');
        if (history.length === 0) {
            this.showNotification('暂无备课历史', 'info');
            return;
        }
        this.showNotification(`您有 ${history.length} 条备课记录`, 'info');
    }

    // 我的导师功能
    askMyTutor(question) {
        const myTutorInput = document.getElementById('myTutorInput');
        if (myTutorInput) {
            myTutorInput.value = question;
            this.sendMyTutorMessage();
        }
    }

    async sendMyTutorMessage() {
        const input = document.getElementById('myTutorInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        this.addMyTutorMessage(message, 'user');
        this.showMyTutorTyping();

        try {
            const response = await this.callMyTutorAPI(message);
            this.hideMyTutorTyping();
            this.addMyTutorMessage(response, 'assistant');
        } catch (error) {
            console.error('MyTutor API调用失败:', error);
            this.hideMyTutorTyping();
            const response = this.generateMyTutorResponse(message);
            this.addMyTutorMessage(response, 'assistant');
        }
    }

    // 通过后端代理使用 DeepSeek，面向"我的导师"的提示词
    async callMyTutorAPI(message) {
        // 拉取本地知识库（user_upload 下文本内容）
        const base = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        let knowledge = '';
        try {
            const kbResp = await fetch(`${base}/knowledge?maxChars=200000`);
            if (kbResp.ok) {
                const kb = await kbResp.json();
                knowledge = kb.textCorpus || '';
            }
        } catch (e) {
            console.warn('获取本地知识库失败，将仅使用对话上下文');
        }

        // 检查是否有上传的文件上下文
        const fileContext = window.uploadedFilesContext || '';
        
        // 组装系统提示词：强制回答限定在本地知识库和上传的文件
        let contextPrompt = '';
        if (fileContext) {
            contextPrompt = `\n\n此外，用户上传了文件，文件内容如下：\n${fileContext}`;
        }
        
        const systemPrompt = `你是一位贴心的学习导师。你必须严格基于"本地知识库"和用户上传的文件内容回答。
如果用户问题在本地知识库和上传文件中找不到相关信息，统一回答：本地知识库中没有相关内容。
禁止凭空编造或超出本地知识库范围的推测。回答应简明、结构清晰，必要时给出知识库中的引用片段。

本地知识库如下：\n${knowledge}${contextPrompt}`;

        // 组装消息历史
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        const recent = this.myTutorHistory.slice(-10).map(m => ({ role: m.role, content: m.content }));
        messages.push(...recent);
        messages.push({ role: 'user', content: message });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        try {
            const resp = await fetch(`${base}/deepseek/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages,
                    temperature: 0.7,
                    max_tokens: 2000, // 增加token以便处理更多文件内容
                    stream: false,
                    fileContext: fileContext // 传递文件上下文
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!resp.ok) {
                const t = await resp.text();
                throw new Error(`API请求失败: ${resp.status} ${t}`);
            }
            const data = await resp.json();
            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API响应格式错误');
            }
            return data.choices[0].message.content;
        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') throw new Error('请求超时，请检查网络连接');
            throw e;
        }
    }

    addMyTutorMessage(content, sender) {
        const messagesContainer = document.getElementById('myTutorMessages');
        if (!messagesContainer) return;
        
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? 'fas fa-user' : 'fas fa-user-graduate';
        const time = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.myTutorHistory.push({
            content: content,
            sender: sender,
            role: sender,
            timestamp: new Date().toISOString()
        });
    }

    generateMyTutorResponse(userMessage) {
        const responses = {
            '学习计划,计划,规划': `作为您的学习导师，我来帮您制定一个科学的学习计划：

**制定原则：**
• **SMART目标**：具体、可衡量、可实现、相关、有时限
• **循序渐进**：从简单到复杂，逐步提升
• **平衡发展**：兼顾各科目，避免偏科

**建议步骤：**
1. **评估现状**：分析当前学习水平和薄弱环节
2. **设定目标**：制定短期（1个月）和长期（1学期）目标
3. **时间分配**：合理分配各科目学习时间
4. **定期调整**：每周回顾，每月调整

**时间管理技巧：**
• 使用番茄工作法（25分钟专注学习）
• 制定每日学习清单
• 设置学习提醒和奖励机制

您希望我帮您制定哪个科目的学习计划？`,

            '学习效率,效率,专注力,专注': `提高学习效率是每个学生都关心的问题，让我为您提供专业的指导：

**环境优化：**
• 选择安静、光线充足的学习环境
• 整理学习桌面，减少干扰因素
• 关闭手机通知，专注学习

**学习方法：**
• **主动学习**：提问、总结、复述
• **间隔重复**：定期复习，加深记忆
• **费曼技巧**：用简单语言解释复杂概念

**时间管理：**
• 制定学习计划，按计划执行
• 使用时间追踪工具
• 合理安排休息时间

**健康习惯：**
• 保证充足睡眠（7-8小时）
• 定期运动，保持身体健康
• 均衡饮食，补充营养

您目前在哪个方面遇到困难？我可以提供更具体的建议。`,

            '学习方法,方法,技巧': `学习方法的选择对学习效果至关重要，让我为您推荐一些有效的方法：

**经典学习方法：**
• **SQ3R法**：Survey（浏览）、Question（提问）、Read（阅读）、Recite（复述）、Review（复习）
• **康奈尔笔记法**：记录、简化、背诵、思考、复习
• **思维导图**：可视化知识结构，便于记忆

**现代学习技巧：**
• **主动回忆**：不看笔记回忆内容
• **间隔重复**：科学安排复习时间
• **交叉学习**：不同科目交替学习

**学科特定方法：**
• **数学**：多练习，理解概念，举一反三
• **语文**：多阅读，积累词汇，练习写作
• **英语**：听说读写并重，创造语言环境

**学习工具推荐：**
• 笔记软件：Notion、OneNote
• 记忆工具：Anki、Quizlet
• 时间管理：Forest、番茄钟

您想了解哪种学习方法的具体应用？`,

            '学习问题,问题,困难': `学习过程中遇到问题是正常的，让我帮您分析并提供解决方案：

**常见学习问题：**
• **注意力不集中**：环境干扰、缺乏兴趣、疲劳
• **记忆困难**：方法不当、重复不够、理解不深
• **理解困难**：基础薄弱、方法错误、缺乏练习

**问题诊断方法：**
1. **自我反思**：分析问题出现的具体情境
2. **寻求反馈**：向老师、同学请教
3. **测试评估**：通过练习检验掌握程度

**解决策略：**
• **分步骤解决**：将大问题分解为小问题
• **寻求帮助**：主动向老师、同学求助
• **调整方法**：尝试不同的学习方法
• **保持耐心**：学习是一个渐进的过程

**预防措施：**
• 建立良好的学习习惯
• 定期复习，及时巩固
• 保持积极的学习态度

请告诉我您遇到的具体问题，我可以提供更有针对性的建议。`
        };

        const lowerMessage = userMessage.toLowerCase();
        for (const [keywords, response] of Object.entries(responses)) {
            if (keywords.split(',').some(keyword => lowerMessage.includes(keyword))) {
                return response;
            }
        }

        return `感谢您的提问！作为您的学习导师，我会根据您的具体情况提供个性化的指导。

**我的专长领域：**
• 学习计划制定和时间管理
• 学习方法和技巧指导
• 学习问题诊断和解决
• 学习习惯培养和优化

**建议您：**
1. 描述具体的学习情况
2. 说明遇到的具体困难
3. 分享您的学习目标

这样我就能为您提供更精准的指导和建议。您还有什么其他问题吗？`;
    }

    showMyTutorTyping() {
        const messagesContainer = document.getElementById('myTutorMessages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span>导师正在思考</span>
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideMyTutorTyping() {
        const typingMessage = document.querySelector('#myTutorMessages .message.typing');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    clearMyTutorChat() {
        if (confirm('确定要清空与我的导师的对话记录吗？')) {
            const messagesContainer = document.getElementById('myTutorMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-content">
                            <i class="fas fa-user-graduate"></i>
                            <h3>欢迎使用我的导师！</h3>
                            <p>我是您的专属学习导师，可以为您提供个性化的学习指导和答疑服务。</p>
                            <div class="quick-questions">
                                <h4>快速开始：</h4>
                                <div class="question-chips">
                                    <span class="chip" onclick="askMyTutor('请帮我制定学习计划')">制定学习计划</span>
                                    <span class="chip" onclick="askMyTutor('如何提高学习效率？')">提高学习效率</span>
                                    <span class="chip" onclick="askMyTutor('推荐一些学习方法')">学习方法推荐</span>
                                    <span class="chip" onclick="askMyTutor('帮我分析学习问题')">学习问题分析</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            // 在清空前保存整段会话为一条历史
            if (this.myTutorHistory && this.myTutorHistory.length > 0) {
                this.saveChatHistory('myTutor', this.myTutorHistory);
            }
            this.myTutorHistory = [];
        }
    }

    newMyTutorChat() {
        if (confirm('确定要开始新的对话吗？当前对话将被保存到历史记录中。')) {
            // 保存当前对话为一条历史
            if (this.myTutorHistory && this.myTutorHistory.length > 0) {
                this.saveChatHistory('myTutor', this.myTutorHistory);
            }
            // 清空当前对话
            this.clearMyTutorChat();
            this.showNotification('已开始新的对话', 'success');
        }
    }

    // 对话历史记录管理
    saveChatHistory(chatType, messages) {
        try {
            const historyData = {
                chatType: chatType,
                messages: messages,
                timestamp: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };
            
            // 同时保存到localStorage和尝试保存到文件
            this.saveToLocalStorage(historyData);
            this.saveToFile(historyData, chatType);
            
            console.log(`对话历史已保存: ${chatType}`);
        } catch (error) {
            console.error('保存对话历史失败:', error);
        }
    }

    saveToLocalStorage(historyData) {
        try {
            const existingHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            existingHistory.push(historyData);
            localStorage.setItem('chatHistory', JSON.stringify(existingHistory));
            console.log('已保存到localStorage');
        } catch (error) {
            console.error('保存到localStorage失败:', error);
        }
    }

    saveToFile(historyData, chatType) {
        try {
            // 将历史记录保存到浏览器的IndexedDB中，作为localStorage的补充
            this.saveToIndexedDB(historyData);
            
            // 同时尝试通过服务器保存（如果服务器运行）
            this.saveToServer(historyData, chatType);
            
        } catch (error) {
            console.error('保存到文件失败:', error);
        }
    }

    saveToIndexedDB(historyData) {
        try {
            // 使用IndexedDB作为更可靠的本地存储
            const request = indexedDB.open('ChatHistoryDB', 1);
            
            request.onerror = () => {
                console.log('IndexedDB不可用，仅使用localStorage');
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['chatHistory'], 'readwrite');
                const store = transaction.objectStore('chatHistory');
                store.add(historyData);
                console.log('已保存到IndexedDB');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('chatHistory')) {
                    db.createObjectStore('chatHistory', { keyPath: 'sessionId' });
                }
            };
        } catch (error) {
            console.error('保存到IndexedDB失败:', error);
        }
    }

    saveToServer(historyData, chatType) {
        // 尝试通过服务器保存（如果服务器运行）
        const base = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        fetch(`${base}/save-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filePath: `Cache/chat_history_${chatType}_${Date.now()}.json`,
                data: historyData
            })
        }).then(response => {
            if (response.ok) {
                console.log('已保存到服务器');
            }
        }).catch(() => {
            console.log('服务器不可用，仅使用本地存储');
        });
    }

    loadChatHistory(chatType) {
        try {
            // 首先尝试从localStorage加载
            const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            const filteredHistory = history.filter(item => item.chatType === chatType);
            
            if (filteredHistory.length === 0) {
                return [];
            }
            
            // 按时间排序，最新的在前
            return filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('加载对话历史失败:', error);
            return [];
        }
    }

    showChatHistoryModal(chatType) {
        const modal = document.getElementById('chatHistoryModal');
        const historyContent = document.getElementById('historyContent');
        
        if (!modal || !historyContent) return;
        
        const history = this.loadChatHistory(chatType);
        
        if (history.length === 0) {
            historyContent.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-inbox" style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"></i>
                    <h3 style="color: #6b7280; margin-bottom: 8px;">暂无历史对话</h3>
                    <p style="color: #9ca3af;">开始与${chatType === 'myTutor' ? '我的导师' : chatType === 'professionalTutor' ? '问答助手' : '专业导师'}对话后，历史记录将在这里显示</p>
                </div>
            `;
        } else {
            let historyHTML = '<div class="history-list">';
            
            history.forEach((session, index) => {
                const sessionDate = new Date(session.timestamp).toLocaleString('zh-CN');
                const messageCount = session.messages ? session.messages.length : 0;
                const firstMessage = session.messages && session.messages.length > 0 
                    ? session.messages[0].content.substring(0, 50) + '...' 
                    : '空对话';
                
                historyHTML += `
                    <div class="history-item" onclick="loadHistorySession('${session.sessionId}', '${chatType}')">
                        <div class="history-header">
                            <h4>对话 ${index + 1}</h4>
                            <span class="history-date">${sessionDate}</span>
                        </div>
                        <div class="history-preview">
                            <p>${firstMessage}</p>
                            <div class="history-meta">
                                <span class="message-count">${messageCount} 条消息</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            historyHTML += '</div>';
            historyContent.innerHTML = historyHTML;
        }
        
        modal.style.display = 'flex';
    }

    loadHistorySession(sessionId, chatType) {
        try {
            const history = this.loadChatHistory(chatType);
            const session = history.find(item => item.sessionId === sessionId);
            
            if (!session) {
                this.showNotification('未找到指定的对话记录', 'error');
                return;
            }
            
            // 加载历史对话到当前界面
            const messagesContainer = document.getElementById(`${chatType}Messages`);
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
                
                if (session.messages && session.messages.length > 0) {
                    session.messages.forEach(msg => {
                        this.addMessageToContainer(messagesContainer, msg.content, msg.role, chatType);
                    });
                } else {
                    // 显示欢迎消息
                    this.showWelcomeMessage(messagesContainer, chatType);
                }
            }
            
            hideChatHistory();
            this.showNotification('历史对话已加载', 'success');
        } catch (error) {
            console.error('加载历史会话失败:', error);
            this.showNotification('加载历史对话失败', 'error');
        }
    }

    addMessageToContainer(container, content, role, chatType) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = role === 'user' ? 'fas fa-user' : 
                      chatType === 'myTutor' ? 'fas fa-user-graduate' : 'fas fa-chalkboard-teacher';
        const time = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    showWelcomeMessage(container, chatType) {
        const welcomeHTML = chatType === 'myTutor' ? `
            <div class="welcome-message">
                <div class="welcome-content">
                    <i class="fas fa-user-graduate"></i>
                    <h3>欢迎使用我的导师！</h3>
                    <p>我是您的专属学习导师，可以为您提供个性化的学习指导和答疑服务。</p>
                    <div class="quick-questions">
                        <h4>快速开始：</h4>
                        <div class="question-chips">
                            <span class="chip" onclick="askMyTutor('请帮我制定学习计划')">制定学习计划</span>
                            <span class="chip" onclick="askMyTutor('如何提高学习效率？')">提高学习效率</span>
                            <span class="chip" onclick="askMyTutor('推荐一些学习方法')">学习方法推荐</span>
                            <span class="chip" onclick="askMyTutor('帮我分析学习问题')">学习问题分析</span>
                        </div>
                    </div>
                </div>
            </div>
        ` : `
            <div class="welcome-message">
                <div class="welcome-content modern-welcome">
                    <div class="welcome-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)"/>
                            <path d="M2 17L12 22L22 17" fill="url(#gradient2)"/>
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h3>你好，我是 DeepSeek AI</h3>
                    <p class="welcome-subtitle">我可以帮助你解答问题、分析数据、撰写文档，或进行任何对话</p>
                    
                    <div class="quick-suggestions">
                        <h4>试试问我：</h4>
                        <div class="suggestion-grid">
                            <div class="suggestion-card" onclick="askProfessionalTutor('写一篇关于人工智能的科普文章')">
                                <i class="fas fa-pen"></i>
                                <span>写文章</span>
                            </div>
                            <div class="suggestion-card" onclick="askProfessionalTutor('解释一下什么是量子计算')">
                                <i class="fas fa-lightbulb"></i>
                                <span>解释概念</span>
                            </div>
                            <div class="suggestion-card" onclick="askProfessionalTutor('帮我写一段Python代码实现快速排序')">
                                <i class="fas fa-code"></i>
                                <span>编写代码</span>
                            </div>
                            <div class="suggestion-card" onclick="askProfessionalTutor('推荐几本值得读的科幻小说')">
                                <i class="fas fa-book"></i>
                                <span>书籍推荐</span>
                            </div>
                            <div class="suggestion-card" onclick="askProfessionalTutor('分析一下当前科技行业的发展趋势')">
                                <i class="fas fa-chart-line"></i>
                                <span>行业分析</span>
                            </div>
                            <div class="suggestion-card" onclick="askProfessionalTutor('给我制定一个学习计划来提高编程技能')">
                                <i class="fas fa-tasks"></i>
                                <span>制定计划</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = welcomeHTML;
    }

    clearAllChatHistory() {
        if (confirm('确定要清空所有历史对话记录吗？此操作不可恢复。')) {
            try {
                localStorage.removeItem('chatHistory');
                this.showNotification('所有历史对话已清空', 'success');
                hideChatHistory();
            } catch (error) {
                console.error('清空历史记录失败:', error);
                this.showNotification('清空历史记录失败', 'error');
            }
        }
    }

    // 通用问答助手功能
    askProfessionalTutor(question) {
        const professionalTutorInput = document.getElementById('professionalTutorInput');
        if (professionalTutorInput) {
            professionalTutorInput.value = question;
            this.sendProfessionalTutorMessage();
        }
    }

    async sendProfessionalTutorMessage() {
        const input = document.getElementById('professionalTutorInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;

        input.value = '';
        input.style.height = 'auto';
        this.addProfessionalTutorMessage(message, 'user');
        this.showProfessionalTutorTyping();

        try {
            // 固定使用 deepseek 模型
            const response = await this.callAIAPI(message, 'deepseek');
            this.hideProfessionalTutorTyping();
            this.addProfessionalTutorMessage(response, 'assistant');
        } catch (error) {
            console.error('deepseek API调用失败:', error);
            this.hideProfessionalTutorTyping();
            // 显示真实错误信息给用户
            const errorMessage = error.message || 'API调用失败，请检查服务器配置和API密钥';
            this.addProfessionalTutorMessage(`❌ 错误: ${errorMessage}\n\n请检查：\n1. 服务器是否正在运行（http://localhost:3000）\n2. config.json 中的 API 密钥是否正确\n3. 网络连接是否正常`, 'assistant');
        }
    }

    async callAIAPI(message, model = 'deepseek') {
        // 通过后端代理调用 AI API（不在前端暴露密钥）

        // 构建多轮对话消息历史
        const messages = [
            {
                role: 'system',
                content: '你是一位专业的学科导师，具有深厚的学术背景和丰富的教学经验。请以专业、准确、易懂的方式回答学生的问题，提供有价值的学术指导和专业建议。'
            }
        ];

        // 添加当前会话的历史消息（最多保留最近10轮对话）
        const currentSession = this.getCurrentProfessionalSession();
        if (currentSession && currentSession.messages) {
            const recentMessages = currentSession.messages.slice(-20); // 保留最近20条消息
            messages.push(...recentMessages);
        }

        // 添加当前用户消息
        messages.push({
            role: 'user',
            content: message
        });

        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 300秒超时

        try {
            console.log(`使用模型: ${model}，发送消息历史:`, messages.length, '条消息');
            
            // 根据模型选择 API 端点
            const apiEndpoints = {
                'deepseek': '/deepseek/chat',
                'kimi': '/kimi/chat',
                'chatgpt': '/chatgpt/chat',
                'doubao': '/doubao/chat'
            };
            
            const endpoint = apiEndpoints[model] || '/deepseek/chat';
            
            // 根据模型选择对应的模型名称
            const modelNames = {
                'deepseek': 'deepseek-chat',
                'kimi': 'moonshot-v1-8k',
                'chatgpt': 'gpt-3.5-turbo',
                'doubao': 'ep-xxx'
            };
            
            const modelName = modelNames[model] || 'deepseek-chat';
            
            const base = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
            
            // 获取 JWT token（如果存在）
            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // 如果有 token，添加到请求头
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${base}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: modelName,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API响应错误:', response.status, errorText);
                if (response.status === 401) {
                    throw new Error('API密钥无效或已过期，请在 config.json 或环境变量中配置你的 API 密钥');
                }
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API响应格式错误');
            }
            
            const assistantResponse = data.choices[0].message.content;
            
            // 保存对话历史到当前会话
            this.saveMessageToSession(message, 'user');
            this.saveMessageToSession(assistantResponse, 'assistant');
            
            return assistantResponse;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }
            throw error;
        }
    }

    getDeepSeekAPIKey() {
        try {
            return localStorage.getItem('deepseek_api_key') || '';
        } catch (e) {
            return '';
        }
    }

    setDeepSeekAPIKey(apiKey) {
        try {
            localStorage.setItem('deepseek_api_key', apiKey);
        } catch (e) {}
    }

    // DeepSeek 配置相关功能已移除
    showDeepSeekConfig() {}

    hideDeepSeekConfig() {}

    handleModalClick() {}

    async testDeepSeekAPI() { return false; }

    saveDeepSeekConfig() {}

    updateDeepSeekStatus() {}

    async testNetworkConnection() { return { success: false, message: 'disabled' }; }

    addProfessionalTutorMessage(content, sender) {
        const messagesContainer = document.getElementById('professionalTutorMessages');
        if (!messagesContainer) return;
        
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? 'fas fa-user' : 'fas fa-chalkboard-teacher';
        const time = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${this.formatMessage(content)}</div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.professionalTutorHistory.push({
            content: content,
            sender: sender,
            role: sender,
            timestamp: new Date().toISOString()
        });
    }

    generateProfessionalTutorResponse(userMessage) {
        const responses = {
            '专业概念,概念,定义': `我来为您详细解释专业概念：

**概念理解的重要性：**
• 专业概念是学科知识的基础
• 正确理解概念有助于深入学习
• 概念间的联系构成知识体系

**理解方法：**
1. **定义分析**：理解概念的核心要素
2. **实例说明**：通过具体例子加深理解
3. **对比分析**：区分相似概念的不同
4. **应用实践**：在实际问题中运用概念

**学习建议：**
• 建立概念地图，梳理概念关系
• 定期复习，巩固概念理解
• 主动提问，澄清模糊认识

请告诉我您想了解哪个具体的专业概念？`,

            '专业研究,研究,研究方法': `专业研究是深入学科的重要途径，让我为您介绍研究方法：

**研究方法类型：**
• **文献研究**：查阅相关文献，了解研究现状
• **实验研究**：通过实验验证假设
• **调查研究**：收集数据，分析现象
• **案例研究**：深入分析典型案例

**研究步骤：**
1. **确定研究问题**：明确研究目标和范围
2. **文献综述**：了解相关研究现状
3. **设计研究方案**：选择合适的研究方法
4. **数据收集**：按照方案收集数据
5. **数据分析**：运用统计方法分析数据
6. **结果解释**：解释研究结果的意义

**研究工具：**
• 文献检索：知网、万方、维普
• 数据分析：SPSS、R、Python
• 写作工具：LaTeX、Word

您想了解哪个学科的研究方法？`,

            '专业学习资源,学习资源,资源': `专业学习资源的选择对学习效果至关重要：

**学术资源：**
• **学术期刊**：Nature、Science、Cell等顶级期刊
• **专业书籍**：经典教材和专著
• **学术会议**：了解最新研究动态
• **在线课程**：Coursera、edX、MOOC

**实践资源：**
• **实验室**：动手实践，验证理论
• **实习机会**：接触实际工作环境
• **项目参与**：参与科研项目
• **学术交流**：与同行交流学习

**数字资源：**
• **数据库**：专业数据库和文献库
• **软件工具**：专业软件和工具
• **在线平台**：专业学习平台
• **社交媒体**：学术社交网络

**选择建议：**
• 根据学习目标选择合适资源
• 注重资源的质量和权威性
• 结合多种资源，形成学习体系

您想了解哪个专业领域的学习资源？`,

            '专业发展趋势,发展趋势,趋势': `了解专业发展趋势对职业规划很重要：

**趋势分析方法：**
• **文献分析**：通过学术文献了解发展趋势
• **行业报告**：关注行业研究报告
• **专家观点**：听取领域专家意见
• **技术发展**：关注相关技术发展

**常见趋势：**
• **技术融合**：多学科交叉融合
• **数字化**：数字化转型和智能化
• **可持续发展**：绿色和可持续发展
• **个性化**：个性化和定制化服务

**应对策略：**
• 持续学习，跟上发展趋势
• 培养跨学科能力
• 关注新兴技术和应用
• 建立专业网络

**职业规划建议：**
• 了解行业需求变化
• 培养未来所需技能
• 关注职业发展机会
• 制定长期职业规划

您想了解哪个专业领域的发展趋势？`
        };

        const lowerMessage = userMessage.toLowerCase();
        for (const [keywords, response] of Object.entries(responses)) {
            if (keywords.split(',').some(keyword => lowerMessage.includes(keyword))) {
                return response;
            }
        }

        return `感谢您的提问！我是您的智能问答助手，可以为您提供全方位的帮助和支持。

**我可以为您：**
• 解答各种问题，无论是学术还是生活
• 提供深度分析和见解
• 协助学习和研究
• 推荐学习资源和工具
• 处理各种文档和内容创作

**我的特点：**
• 全面智能分析
• 及时准确的信息
• 友好耐心的交流
• 个性化的建议

请随时向我提问，我会尽力帮助您！`;
    }

    showProfessionalTutorTyping() {
        const messagesContainer = document.getElementById('professionalTutorMessages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-chalkboard-teacher"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span>问答助手正在分析</span>
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideProfessionalTutorTyping() {
        const typingMessage = document.querySelector('#professionalTutorMessages .message.typing');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    clearProfessionalTutorChat() {
        if (confirm('确定要清空与问答助手的对话记录吗？')) {
            const messagesContainer = document.getElementById('professionalTutorMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <i class="fas fa-chalkboard-teacher" style="font-size: 64px; color: #667eea; margin-bottom: 20px;"></i>
                        <h3>欢迎使用通用问答助手！</h3>
                        <p class="welcome-subtitle">我是您的智能问答助手，可以帮助您解答问题、分析数据、撰写文档，或进行任何对话</p>
                        
                        <div class="quick-suggestions">
                            <h4>试试问我：</h4>
                            <div class="suggestion-grid">
                                <div class="suggestion-card" onclick="askProfessionalTutor('写一篇关于人工智能的科普文章')">
                                    <i class="fas fa-pen"></i>
                                    <span>写文章</span>
                                </div>
                                <div class="suggestion-card" onclick="askProfessionalTutor('解释一下什么是量子计算')">
                                    <i class="fas fa-lightbulb"></i>
                                    <span>解释概念</span>
                                </div>
                                <div class="suggestion-card" onclick="askProfessionalTutor('帮我写一段Python代码实现快速排序')">
                                    <i class="fas fa-code"></i>
                                    <span>编写代码</span>
                                </div>
                                <div class="suggestion-card" onclick="askProfessionalTutor('推荐几本值得读的科幻小说')">
                                    <i class="fas fa-book"></i>
                                    <span>书籍推荐</span>
                                </div>
                                <div class="suggestion-card" onclick="askProfessionalTutor('分析一下当前科技行业的发展趋势')">
                                    <i class="fas fa-chart-line"></i>
                                    <span>行业分析</span>
                                </div>
                                <div class="suggestion-card" onclick="askProfessionalTutor('给我制定一个学习计划来提高编程技能')">
                                    <i class="fas fa-tasks"></i>
                                    <span>制定计划</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }
            
            // 在清空前将本段会话保存为一条历史记录
            if (this.currentProfessionalSession && this.currentProfessionalSession.messages.length > 0) {
                this.currentProfessionalSession.endTime = new Date().toISOString();
                this.saveProfessionalTutorSessions();
                this.saveChatHistory('professionalTutor', this.currentProfessionalSession.messages);
            }
            
            // 清空当前会话的消息历史
            if (this.currentProfessionalSession) {
                this.currentProfessionalSession.messages = [];
                this.saveProfessionalTutorSessions();
            }
            
            this.professionalTutorHistory = [];
        }
    }

    // 新建问答助手对话
    newProfessionalChat() {
        if (confirm('确定要开始新的对话吗？当前对话将被保存到历史记录中。')) {
            // 保存当前会话（如果有消息的话）
            if (this.currentProfessionalSession && this.currentProfessionalSession.messages.length > 0) {
                this.currentProfessionalSession.endTime = new Date().toISOString();
                this.saveProfessionalTutorSessions();
                // 将整段会话保存为一条历史记录
                this.saveChatHistory('professionalTutor', this.currentProfessionalSession.messages);
            }
            
            // 创建新会话
            const newSession = {
                id: this.generateSessionId(),
                title: '新对话',
                startTime: new Date().toISOString(),
                endTime: null,
                messages: []
            };
            
            this.currentProfessionalSession = newSession;
            this.professionalTutorSessions.unshift(newSession); // 添加到列表开头
            this.saveProfessionalTutorSessions();
            
            // 清空界面
            this.clearProfessionalTutorChat();
            
            // 更新会话标题
            this.updateSessionTitle();
        }
    }

    // 会话管理功能
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentProfessionalSession() {
        if (!this.currentProfessionalSession) {
            // 如果没有当前会话，创建一个新的
            this.currentProfessionalSession = {
                id: this.generateSessionId(),
                title: '新对话',
                startTime: new Date().toISOString(),
                endTime: null,
                messages: []
            };
            this.professionalTutorSessions.unshift(this.currentProfessionalSession);
            this.saveProfessionalTutorSessions();
        }
        return this.currentProfessionalSession;
    }

    saveMessageToSession(content, role) {
        const session = this.getCurrentProfessionalSession();
        session.messages.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // 自动更新会话标题（基于第一条用户消息）
        if (role === 'user' && session.messages.filter(m => m.role === 'user').length === 1) {
            session.title = content.length > 30 ? content.substring(0, 30) + '...' : content;
            this.updateSessionTitle();
        }
        
        this.saveProfessionalTutorSessions();
    }

    saveProfessionalTutorSessions() {
        try {
            localStorage.setItem('professionalTutorSessions', JSON.stringify(this.professionalTutorSessions));
        } catch (error) {
            console.error('保存会话历史失败:', error);
        }
    }

    loadProfessionalTutorSessions() {
        try {
            const saved = localStorage.getItem('professionalTutorSessions');
            if (saved) {
                this.professionalTutorSessions = JSON.parse(saved);
                // 恢复最后一个未结束的会话
                const lastSession = this.professionalTutorSessions.find(s => !s.endTime);
                if (lastSession) {
                    this.currentProfessionalSession = lastSession;
                }
            }
        } catch (error) {
            console.error('加载会话历史失败:', error);
            this.professionalTutorSessions = [];
        }
    }

    updateSessionTitle() {
        const sessionTitle = document.getElementById('session-title');
        const sessionTime = document.getElementById('session-time');
        const sessionInfo = document.getElementById('session-info');
        
        if (this.currentProfessionalSession) {
            if (sessionTitle) {
                sessionTitle.textContent = this.currentProfessionalSession.title;
            }
            
            if (sessionTime) {
                const startTime = new Date(this.currentProfessionalSession.startTime);
                const timeStr = startTime.toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                sessionTime.textContent = timeStr;
            }
            
            if (sessionInfo) {
                sessionInfo.style.display = 'block';
            }
        }
    }

    // 课程页面功能
    filterCourseContent(type) {
        const buttons = document.querySelectorAll('.course-filter .btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }

        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.tab-panel');

        if (type === 'all') {
            tabs.forEach(tab => tab.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            if (tabs[0]) tabs[0].classList.add('active');
            if (panels[0]) panels[0].classList.add('active');
        } else {
            tabs.forEach(tab => {
                if (tab.dataset.tab === type) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
            
            panels.forEach(panel => {
                if (panel.id === 'course' + type.charAt(0).toUpperCase() + type.slice(1)) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        }
    }

    // 个人档案功能
    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${this.currentYear}年${monthNames[this.currentMonth]}`;
        }

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // 获取今天的日期
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === this.currentYear && today.getMonth() === this.currentMonth;
        const todayDate = today.getDate();

        calendarGrid.innerHTML = '';

        // 添加星期标题
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // 添加空白日期
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        let checkedDays = 0;
        
        // 添加日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // 标记今天
            if (isCurrentMonth && day === todayDate) {
                dayElement.classList.add('today');
            }
            
            // 模拟打卡数据（过去的日期有更高的打卡概率）
            const isPastDay = !isCurrentMonth || day < todayDate;
            const checkProbability = isPastDay ? 0.8 : 0.3;
            
            if (Math.random() < checkProbability) {
                dayElement.classList.add('checked');
                checkedDays++;
            }
            
            // 添加点击事件
            dayElement.addEventListener('click', () => {
                if (!dayElement.classList.contains('empty')) {
                    this.toggleCheckIn(dayElement, day);
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }

        // 更新统计数据
        this.updateCalendarStats(checkedDays, daysInMonth);
    }

    // 切换打卡状态
    toggleCheckIn(dayElement, day) {
        const isChecked = dayElement.classList.contains('checked');
        
        // 允许切换打卡状态
        dayElement.classList.toggle('checked');
        
        // 显示通知
        if (isChecked) {
            this.showNotification(`取消${day}日打卡`, 'info');
        } else {
            this.showNotification(`${day}日打卡成功！`, 'success');
        }
        
        // 重新计算统计数据
        const checkedDays = document.querySelectorAll('.calendar-day.checked').length;
        const totalDays = document.querySelectorAll('.calendar-day:not(.empty)').length;
        this.updateCalendarStats(checkedDays, totalDays);
    }

    // 更新日历统计数据
    updateCalendarStats(checkedDays, totalDays) {
        const checkRate = totalDays > 0 ? Math.round((checkedDays / totalDays) * 100) : 0;
        
        // 更新统计显示
        const statNumbers = document.querySelectorAll('.calendar-stats .stat-number');
        if (statNumbers.length >= 2) {
            statNumbers[0].textContent = checkedDays;
            statNumbers[1].textContent = `${checkRate}%`;
        }

        // 更新进度条
        const bar = document.getElementById('checkRateBar');
        if (bar) {
            bar.style.width = `${checkRate}%`;
        }

        // 同步更新功能卡片上的概览信息
        const cardDays = document.getElementById('calendarCardDays');
        const cardRate = document.getElementById('calendarCardRate');
        if (cardDays) cardDays.textContent = String(checkedDays);
        if (cardRate) cardRate.textContent = `${checkRate}%`;
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    // 语言切换功能
    loadLanguage() {
        const savedLanguage = localStorage.getItem('language') || 'zh-CN';
        this.currentLanguage = savedLanguage;
        document.getElementById('languageSelect').value = savedLanguage;
        this.updateLanguage();
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        this.updateLanguage();
    }

    updateLanguage() {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = this.translations[this.currentLanguage][key];
                } else {
                    element.textContent = this.translations[this.currentLanguage][key];
                }
            }
        });
        
        // 更新平台标题和副标题
        const titleElement = document.getElementById('platformTitle');
        const subtitleElement = document.getElementById('platformSubtitle');
        if (titleElement && this.translations[this.currentLanguage]['platformTitle']) {
            titleElement.textContent = this.translations[this.currentLanguage]['platformTitle'];
        }
        if (subtitleElement && this.translations[this.currentLanguage]['platformSubtitle']) {
            subtitleElement.textContent = this.translations[this.currentLanguage]['platformSubtitle'];
        }
    }

    // 文件管理功能
    uploadFile(type) {
        try {
            const categoryMap = {
                'textbook': 'materials',
                'lessonPlan': 'lesson_plans',
                'resource': 'resources'
            };
            const target = categoryMap[type] || 'resources';
            const modal = document.getElementById('uploadModal');
            const select = document.getElementById('uploadCategory');
            if (select) {
                select.value = target;
            }
            if (modal) {
                modal.style.display = 'flex';
            } else {
                // 兜底：直接打开文件选择并调用上传
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.onchange = async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    const formData = new FormData();
                    formData.append('category', target);
                    for (let i = 0; i < files.length; i++) {
                        formData.append('files', files[i]);
                    }
                    const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
                    const resp = await fetch(`${apiBase}/upload`, { method: 'POST', body: formData });
                    if (resp.ok) {
                        this.showNotification('上传成功', 'success');
                    } else {
                        this.showNotification('上传失败，请检查服务器是否已启动', 'error');
                    }
                };
                input.click();
            }
        } catch (error) {
            console.error('打开上传对话框失败:', error);
            this.showNotification('打开上传对话框失败', 'error');
        }
    }

    filterFiles(type) {
        const buttons = document.querySelectorAll('.file-filters .btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }
        
        this.showNotification(`筛选${type}文件功能开发中...`, 'info');
    }

    // 学生管理功能
    addStudent() {
        this.showNotification('添加学生功能开发中...', 'info');
    }

    exportStudentData() {
        this.showNotification('导出学生数据功能开发中...', 'info');
    }

    searchStudents(query) {
        this.showNotification(`搜索学生"${query}"功能开发中...`, 'info');
    }

    filterStudentsByGrade(grade) {
        this.showNotification(`筛选${grade}级学生功能开发中...`, 'info');
    }

    // 格式化消息内容
    formatMessage(content) {
        if (!content) return '';
        
        let text = content;
        
        // 先处理代码块（三个反引号）以避免在其中处理其他markdown
        const codeBlockPlaceholders = [];
        text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            const index = codeBlockPlaceholders.length;
            codeBlockPlaceholders.push({
                type: 'block',
                html: `<pre class="code-block"><code>${this.escapeHtml(code.trim())}</code></pre>`
            });
            return `___CODEBLOCK_${index}___`;
        });
        
        // 转义 HTML
        text = this.escapeHtml(text);
        
        // 恢复代码块
        codeBlockPlaceholders.forEach((placeholder, index) => {
            text = text.replace(`___CODEBLOCK_${index}___`, placeholder.html);
        });
        
        // 处理标题
        text = text.replace(/^### (.*)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*)/gm, '<h1>$1</h1>');
        
        // 处理无序列表
        text = text.replace(/^[\-*] (.+)/gm, '<li>$1</li>');
        // 将连续的 <li> 包装在 <ul> 中
        text = text.replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>');
        
        // 处理有序列表  
        text = text.replace(/^\d+\. (.+)/gm, '<li>$1</li>');
        // 将连续的有序列表项包装
        text = text.replace(/(<li>\d+\..*?<\/li>\n?)+/gs, '<ol>$&</ol>');
        
        // 处理引用
        text = text.replace(/^&gt; (.+)/gm, '<blockquote>$1</blockquote>');
        
        // 处理删除线
        text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // 处理粗体（**text**）
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体（*text*）
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 处理链接 [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // 处理代码（单个反引号）
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理换行
        text = text.replace(/\n\n+/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');
        
        // 包裹段落
        if (text.trim() && !text.trim().match(/^<(h[1-3]|ul|li|blockquote|pre|code)/)) {
            text = '<p>' + text + '</p>';
        }
        
        return text;
    }
    
    // 转义HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // 作文批改功能
    initEssayCorrection() {
        this.currentStep = 1;
        this.essayFile = null;
        this.standardFile = null;
        this.selectedModel = null;
        this.selectedExternalTools = new Set(); // 存储选中的外部工具
        this.standardSkipped = false; // 是否跳过评分标准上传
        
        this.bindEssayCorrectionEvents();
        this.updateStepDisplay();
    }

    bindEssayCorrectionEvents() {
        // 作文文件上传
        const essayFileInput = document.getElementById('essayFile');
        if (essayFileInput) {
            essayFileInput.addEventListener('change', (e) => this.handleEssayFileUpload(e));
        }

        // 批改标准文件上传
        const standardFileInput = document.getElementById('standardFile');
        if (standardFileInput) {
            standardFileInput.addEventListener('change', (e) => this.handleStandardFileUpload(e));
        }

        // AI模型选择
        const modelCards = document.querySelectorAll('.model-card');
        modelCards.forEach(card => {
            card.addEventListener('click', () => this.selectModel(card));
        });

        // 拖拽上传
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const essayUploadArea = document.getElementById('essayUploadArea');
        const standardUploadArea = document.getElementById('standardUploadArea');

        [essayUploadArea, standardUploadArea].forEach(area => {
            if (area) {
                area.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    area.classList.add('dragover');
                });

                area.addEventListener('dragleave', () => {
                    area.classList.remove('dragover');
                });

                area.addEventListener('drop', (e) => {
                    e.preventDefault();
                    area.classList.remove('dragover');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        if (area.id === 'essayUploadArea') {
                            this.handleEssayFileUpload({ target: { files: [files[0]] } });
                        } else if (area.id === 'standardUploadArea') {
                            this.handleStandardFileUpload({ target: { files: [files[0]] } });
                        }
                    }
                });
            }
        });
    }

    handleEssayFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['.doc', '.docx', '.pdf', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showNotification('请上传 .doc, .docx, .pdf 或 .txt 格式的文件', 'error');
            return;
        }

        // 验证文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('文件大小不能超过 10MB', 'error');
            return;
        }

        this.essayFile = file;
        this.displayFileInfo('essay', file);
        this.showNotification('作文文件上传成功！', 'success');
    }

    handleStandardFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['.doc', '.docx', '.pdf', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            this.showNotification('请上传 .doc, .docx, .pdf 或 .txt 格式的文件', 'error');
            return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('文件大小不能超过 5MB', 'error');
            return;
        }

        this.standardFile = file;
        this.standardSkipped = false; // 取消跳过状态
        this.displayFileInfo('standard', file);
        
        // 标记评分标准卡片为选中状态
        const standardCard = document.getElementById('uploadStandardCard');
        if (standardCard) {
            standardCard.classList.add('selected');
        }
        
        this.showNotification('评分标准文件上传成功！', 'success');
    }

    displayFileInfo(type, file) {
        const fileNameElement = document.getElementById(`${type}FileName`);
        const fileSizeElement = document.getElementById(`${type}FileSize`);
        const fileInfoElement = document.getElementById(`${type}FileInfo`);
        const uploadAreaElement = document.getElementById(`${type}UploadArea`);

        if (fileNameElement) fileNameElement.textContent = file.name;
        if (fileSizeElement) fileSizeElement.textContent = this.formatFileSize(file.size);
        if (fileInfoElement) fileInfoElement.style.display = 'block';
        if (uploadAreaElement) uploadAreaElement.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeEssayFile() {
        this.essayFile = null;
        document.getElementById('essayFile').value = '';
        document.getElementById('essayFileInfo').style.display = 'none';
        document.getElementById('essayUploadArea').style.display = 'block';
        this.showNotification('已移除作文文件', 'info');
    }

    removeStandardFile() {
        this.standardFile = null;
        this.standardSkipped = false;
        document.getElementById('standardFile').value = '';
        document.getElementById('standardFileInfo').style.display = 'none';
        document.getElementById('standardUploadArea').style.display = 'block';
        
        // 取消评分标准卡片的选中状态
        const standardCard = document.getElementById('uploadStandardCard');
        if (standardCard) {
            standardCard.classList.remove('selected');
        }
        
        this.showNotification('已移除评分标准文件', 'info');
    }

    switchCorrectionMode(mode) {
        this.correctionMode = mode;
        
        // 更新标签页
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[onclick="switchCorrectionMode('${mode}')"]`).classList.add('active');
        
        // 更新内容
        document.querySelectorAll('.option-content').forEach(content => content.classList.remove('active'));
        document.getElementById(mode === 'upload' ? 'uploadStandard' : 'selectAI').classList.add('active');
        
        // 清除之前的选择
        if (mode === 'ai') {
            this.standardFile = null;
            document.getElementById('standardFile').value = '';
            document.getElementById('standardFileInfo').style.display = 'none';
            document.getElementById('standardUploadArea').style.display = 'block';
        } else {
            this.selectedModel = null;
            document.querySelectorAll('.model-card').forEach(card => card.classList.remove('selected'));
        }
    }

    selectModel(card) {
        // 移除其他选择
        document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
        
        // 选择当前模型
        card.classList.add('selected');
        this.selectedModel = card.dataset.model;
        
        // 标记AI模型卡片为选中状态
        const aiCard = document.getElementById('selectAICard');
        if (aiCard) {
            aiCard.classList.add('selected');
        }
        
        this.showNotification(`已选择 ${card.querySelector('h4').textContent} 模型`, 'success');
    }

    nextStep() {
        if (this.currentStep < 3) {
            // 验证当前步骤
            if (this.currentStep === 1) {
                // 检查是否至少选择了一种批改方式
                const hasStandard = this.standardFile || this.standardSkipped;
                const hasModel = this.selectedModel;
                const hasTools = this.selectedExternalTools.size > 0;
                
                if (!hasStandard && !hasModel && !hasTools) {
                    this.showNotification('请至少选择一种批改方式：上传评分标准、选择AI模型或外部工具', 'error');
                    return;
                }
            }
            
            if (this.currentStep === 2 && !this.essayFile) {
                this.showNotification('请先上传学生作文', 'error');
                return;
            }
            
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // 更新步骤指示器
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // 更新步骤面板
        document.querySelectorAll('.step-panel').forEach((panel, index) => {
            panel.classList.remove('active');
            if (index + 1 === this.currentStep) {
                panel.classList.add('active');
            }
        });

        // 更新按钮
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const startBtn = document.getElementById('startBtn');

        if (prevBtn) prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = this.currentStep < 3 ? 'block' : 'none';
        if (startBtn) startBtn.style.display = this.currentStep === 3 ? 'block' : 'none';
    }

    startCorrection() {
        if (!this.essayFile) {
            this.showNotification('请先上传学生作文', 'error');
            return;
        }

        // 检查是否至少选择了一种批改方式
        const hasStandard = this.standardFile || this.standardSkipped;
        const hasModel = this.selectedModel;
        const hasTools = this.selectedExternalTools.size > 0;
        
        if (!hasStandard && !hasModel && !hasTools) {
            this.showNotification('请至少选择一种批改方式', 'error');
            return;
        }

        // 显示加载状态
        this.showCorrectionLoading();
        
        // 模拟批改过程
        setTimeout(() => {
            this.showCorrectionResult();
        }, 3000);
    }

    showCorrectionLoading() {
        const resultContent = document.getElementById('correctionResult');
        if (resultContent) {
            resultContent.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 60px 20px;">
                    <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <h3 style="color: #1f2937; margin-bottom: 12px;">AI正在批改作文...</h3>
                    <p style="color: #6b7280;">请稍候，这可能需要几分钟时间</p>
                    <div class="loading-progress" style="margin-top: 20px;">
                        <div class="progress-bar" style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                            <div class="progress-fill" style="height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 0%; animation: progress 3s ease-in-out forwards;"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showCorrectionResult() {
        const resultContent = document.getElementById('correctionResult');
        if (resultContent) {
            // 生成外部工具建议
            const externalToolsSuggestions = this.generateExternalToolsSuggestions();
            
            resultContent.innerHTML = `
                <div class="correction-report">
                    <div class="score-section" style="text-align: center; margin-bottom: 30px; padding: 30px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #1f2937; margin-bottom: 20px;">作文评分</h2>
                        <div class="score-display" style="font-size: 48px; font-weight: 700; color: #10b981; margin-bottom: 10px;">85分</div>
                        <div class="score-level" style="color: #6b7280; font-size: 16px;">良好</div>
                        ${this.selectedModel ? `<div class="ai-model-used" style="margin-top: 12px; color: #6b7280; font-size: 14px;">使用模型：${this.getModelDisplayName(this.selectedModel)}</div>` : ''}
                    </div>
                    
                    <div class="evaluation-sections">
                        <div class="evaluation-item" style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <h3 style="color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                                优点
                            </h3>
                            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                                <li>文章结构清晰，逻辑性强</li>
                                <li>语言表达流畅，用词准确</li>
                                <li>观点明确，论证有力</li>
                                <li>字迹工整，格式规范</li>
                            </ul>
                        </div>
                        
                        <div class="evaluation-item" style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <h3 style="color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                                需要改进
                            </h3>
                            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                                <li>部分段落之间的过渡不够自然</li>
                                <li>可以增加更多具体的例子来支撑观点</li>
                                <li>结尾部分可以更加简洁有力</li>
                            </ul>
                        </div>
                        
                        <div class="evaluation-item" style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <h3 style="color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-lightbulb" style="color: #3b82f6;"></i>
                                建议
                            </h3>
                            <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                                <li>多阅读优秀范文，学习写作技巧</li>
                                <li>加强段落间的逻辑连接</li>
                                <li>注重细节描写，增强文章感染力</li>
                                <li>定期练习写作，提高表达能力</li>
                            </ul>
                        </div>
                        
                        ${externalToolsSuggestions}
                    </div>
                </div>
            `;
        }
        
        this.showNotification('作文批改完成！', 'success');
    }

    generateExternalToolsSuggestions() {
        if (this.selectedExternalTools.size === 0) {
            return '';
        }

        const toolSuggestions = {
            'grammarly': {
                name: 'Grammarly',
                icon: 'fas fa-spell-check',
                color: '#15c39a',
                suggestions: [
                    '检测到3处语法错误，建议修正',
                    '发现2个拼写错误，已标注',
                    '建议优化句子结构，提高可读性'
                ]
            },
            'linguix': {
                name: 'Linguix',
                icon: 'fas fa-language',
                color: '#6366f1',
                suggestions: [
                    '智能建议：使用更准确的词汇表达',
                    '检测到重复用词，建议使用同义词',
                    '建议调整句式，增强表达效果'
                ]
            },
            'quillbot': {
                name: 'Quillbot',
                icon: 'fas fa-edit',
                color: '#8b5cf6',
                suggestions: [
                    '文本改写建议：优化表达方式',
                    '同义词替换：丰富词汇选择',
                    '句式调整：提高文章流畅度'
                ]
            },
            'prowritingaid': {
                name: 'ProWritingAid',
                icon: 'fas fa-pen-fancy',
                color: '#f59e0b',
                suggestions: [
                    '写作分析：文章整体结构良好',
                    '风格检查：建议统一语气',
                    '可读性评分：8.5/10，表现优秀'
                ]
            },
            'hemingway': {
                name: 'Hemingway Editor',
                icon: 'fas fa-book',
                color: '#ef4444',
                suggestions: [
                    '可读性分析：适合目标读者群体',
                    '简洁性检查：建议简化部分长句',
                    '被动语态：发现2处，建议改为主动语态'
                ]
            },
            'whitesmoke': {
                name: 'WhiteSmoke',
                icon: 'fas fa-cloud',
                color: '#06b6d4',
                suggestions: [
                    '多语言检查：未发现语言错误',
                    '翻译建议：部分表达可更地道',
                    '风格优化：建议增强文章感染力'
                ]
            }
        };

        let suggestionsHtml = '';
        this.selectedExternalTools.forEach(toolName => {
            const tool = toolSuggestions[toolName];
            if (tool) {
                suggestionsHtml += `
                    <div class="evaluation-item" style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <h3 style="color: #1f2937; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <i class="${tool.icon}" style="color: ${tool.color};"></i>
                            ${tool.name} 分析
                        </h3>
                        <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                            ${tool.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        });

        return suggestionsHtml;
    }

    getModelDisplayName(modelName) {
        const modelNames = {
            'gpt-4': 'GPT-4',
            'claude-3': 'Claude-3',
            'gemini-pro': 'Gemini Pro',
            'local-model': '本地模型'
        };
        return modelNames[modelName] || modelName;
    }

    startNewCorrection() {
        // 重置所有状态
        this.currentStep = 1;
        this.essayFile = null;
        this.standardFile = null;
        this.selectedModel = null;
        this.selectedExternalTools.clear();
        this.standardSkipped = false;
        
        // 重置文件输入
        document.getElementById('essayFile').value = '';
        document.getElementById('standardFile').value = '';
        
        // 重置显示
        document.getElementById('essayFileInfo').style.display = 'none';
        document.getElementById('standardFileInfo').style.display = 'none';
        document.getElementById('essayUploadArea').style.display = 'block';
        document.getElementById('standardUploadArea').style.display = 'block';
        
        // 重置评分标准按钮状态
        document.getElementById('standardActions').style.display = 'block';
        document.getElementById('skipActions').style.display = 'none';
        
        // 重置模型选择
        document.querySelectorAll('.model-card').forEach(card => card.classList.remove('selected'));
        
        // 重置外部工具选择
        document.querySelectorAll('.tool-card').forEach(card => card.classList.remove('selected'));
        document.getElementById('toolsSummary').style.display = 'none';
        
        // 重置选项卡片
        document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
        
        // 更新步骤显示
        this.updateStepDisplay();
        
        this.showNotification('已开始新的批改任务', 'info');
    }

    downloadResult() {
        this.showNotification('下载功能开发中...', 'info');
    }

    showCorrectionHistory() {
        this.showNotification('批改历史功能开发中...', 'info');
    }

    // 外部工具选择功能
    toggleExternalTool(toolName, isSelected) {
        const toolCard = document.querySelector(`[data-tool="${toolName}"]`);
        
        if (isSelected) {
            this.selectedExternalTools.add(toolName);
            if (toolCard) {
                toolCard.classList.add('selected');
            }
            
            // 标记外部工具卡片为选中状态
            const toolsCard = document.getElementById('selectToolsCard');
            if (toolsCard) {
                toolsCard.classList.add('selected');
            }
        } else {
            this.selectedExternalTools.delete(toolName);
            if (toolCard) {
                toolCard.classList.remove('selected');
            }
            
            // 如果没有选中任何外部工具，取消外部工具卡片的选中状态
            if (this.selectedExternalTools.size === 0) {
                const toolsCard = document.getElementById('selectToolsCard');
                if (toolsCard) {
                    toolsCard.classList.remove('selected');
                }
            }
        }
        
        this.updateSelectedToolsDisplay();
    }

    updateSelectedToolsDisplay() {
        const toolsSummary = document.getElementById('toolsSummary');
        const selectedToolsList = document.getElementById('selectedToolsList');
        
        if (this.selectedExternalTools.size > 0) {
            if (toolsSummary) toolsSummary.style.display = 'block';
            if (selectedToolsList) {
                selectedToolsList.innerHTML = '';
                this.selectedExternalTools.forEach(toolName => {
                    const toolCard = document.querySelector(`[data-tool="${toolName}"]`);
                    const toolTitle = toolCard ? toolCard.querySelector('h5').textContent : toolName;
                    
                    const toolTag = document.createElement('div');
                    toolTag.className = 'selected-tool-tag';
                    toolTag.innerHTML = `
                        ${toolTitle}
                        <button class="remove-btn" onclick="removeExternalTool('${toolName}')">×</button>
                    `;
                    selectedToolsList.appendChild(toolTag);
                });
            }
        } else {
            if (toolsSummary) toolsSummary.style.display = 'none';
        }
    }

    removeExternalTool(toolName) {
        this.selectedExternalTools.delete(toolName);
        
        // 移除选中状态
        const toolCard = document.querySelector(`[data-tool="${toolName}"]`);
        if (toolCard) {
            toolCard.classList.remove('selected');
        }
        
        // 如果没有选中任何外部工具，取消外部工具卡片的选中状态
        if (this.selectedExternalTools.size === 0) {
            const toolsCard = document.getElementById('selectToolsCard');
            if (toolsCard) {
                toolsCard.classList.remove('selected');
            }
        }
        
        this.updateSelectedToolsDisplay();
        this.showNotification(`已移除 ${toolName} 工具`, 'info');
    }

    // 跳过评分标准上传
    skipStandardUpload() {
        this.standardSkipped = true;
        this.standardFile = null;
        
        // 标记评分标准卡片为选中状态
        const standardCard = document.getElementById('uploadStandardCard');
        if (standardCard) {
            standardCard.classList.add('selected');
        }
        
        // 隐藏上传区域和跳过按钮，显示取消跳过按钮
        document.getElementById('standardUploadArea').style.display = 'none';
        document.getElementById('standardFileInfo').style.display = 'none';
        document.getElementById('standardActions').style.display = 'none';
        document.getElementById('skipActions').style.display = 'block';
        
        this.showNotification('已跳过评分标准上传', 'info');
    }

    // 取消跳过评分标准
    cancelSkipStandard() {
        this.standardSkipped = false;
        
        // 取消评分标准卡片的选中状态
        const standardCard = document.getElementById('uploadStandardCard');
        if (standardCard) {
            standardCard.classList.remove('selected');
        }
        
        // 显示上传区域和跳过按钮，隐藏取消跳过按钮
        document.getElementById('standardUploadArea').style.display = 'block';
        document.getElementById('standardFileInfo').style.display = 'none';
        document.getElementById('standardActions').style.display = 'block';
        document.getElementById('skipActions').style.display = 'none';
        
        this.showNotification('已取消跳过评分标准', 'info');
    }

    // 教材功能
    switchTextbookView(view) {
        this.currentView = view;
        
        // 更新按钮状态
        document.getElementById('toggle-weekly').classList.toggle('active', view === 'weekly');
        document.getElementById('toggle-category').classList.toggle('active', view === 'category');
        
        // 显示/隐藏视图
        document.getElementById('weekly-view').style.display = view === 'weekly' ? 'block' : 'none';
        document.getElementById('category-view').style.display = view === 'category' ? 'block' : 'none';
        
        // 加载内容
        if (view === 'weekly') {
            this.loadWeeklyContent();
        } else {
            this.loadCategoryContent();
        }
    }

    loadWeeklyContent() {
        const weeklyContent = document.getElementById('weekly-content');
        const weekFiles = this.textbookData.filter(file => file.week === this.currentWeek);
        
        if (weekFiles.length === 0) {
            weeklyContent.innerHTML = `
                <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>第${this.currentWeek}周暂无教材资料</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="file-list">
                <div class="file-list-header">
                    <div class="file-name">文件名</div>
                    <div class="file-type">类型</div>
                    <div class="file-size">大小</div>
                    <div class="file-date">上传时间</div>
                    <div class="file-actions-header">操作</div>
                </div>
        `;
        
        weekFiles.forEach(file => {
            const iconClass = this.getFileIconClass(file.type);
            const bgClass = this.getFileIconBgClass(file.type);
            html += `
                <div class="file-list-item">
                    <div class="file-name">
                        <div class="file-icon ${bgClass}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            <div class="file-tags">
                                ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="file-type">${file.type}</div>
                    <div class="file-size">${file.size}</div>
                    <div class="file-date">${file.date}</div>
                    <div class="file-actions">
                        <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('textbook', ${file.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('textbook', ${file.id}, '${file.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('materials', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        weeklyContent.innerHTML = html;
    }

    loadCategoryContent() {
        const categoryContent = document.getElementById('category-content');
        
        // 如果没有数据，显示空状态
        if (!this.textbookData || this.textbookData.length === 0) {
            categoryContent.innerHTML = `
                <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>暂无教材文件</p>
                    <p style="font-size: 14px; margin-top: 8px;">点击上方"上传教材"按钮添加文件</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="file-list">
                <div class="file-list-header">
                    <div class="file-name">文件名</div>
                    <div class="file-type">类型</div>
                    <div class="file-size">大小</div>
                    <div class="file-date">上传时间</div>
                    <div class="file-actions-header">操作</div>
                </div>
        `;
        
        this.textbookData.forEach(file => {
            const iconClass = this.getFileIconClass(file.type);
            const bgClass = this.getFileIconBgClass(file.type);
            html += `
                <div class="file-list-item">
                    <div class="file-name">
                        <div class="file-icon ${bgClass}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            <div class="file-tags">
                                ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="file-type">${file.type}</div>
                    <div class="file-size">${file.size}</div>
                    <div class="file-date">${file.date}</div>
                    <div class="file-actions">
                        <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('textbook', ${file.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('textbook', ${file.id}, '${file.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('materials', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        categoryContent.innerHTML = html;
    }

    getFileIconClass(type) {
        const iconMap = {
            'PDF': 'fas fa-file-pdf',
            'DOCX': 'fas fa-file-word',
            'DOC': 'fas fa-file-word',
            'PPT': 'fas fa-file-powerpoint',
            'PPTX': 'fas fa-file-powerpoint',
            'XLS': 'fas fa-file-excel',
            'XLSX': 'fas fa-file-excel',
            'MP4': 'fas fa-video',
            'MP3': 'fas fa-music',
            'PNG': 'fas fa-image',
            'JPG': 'fas fa-image',
            'ZIP': 'fas fa-file-archive',
            'RAR': 'fas fa-file-archive'
        };
        return iconMap[type] || 'fas fa-file';
    }

    getFileIconBgClass(type) {
        const bgClassMap = {
            'PDF': 'file-pdf',
            'DOCX': 'file-word',
            'DOC': 'file-word',
            'PPT': 'file-ppt',
            'PPTX': 'file-pptx',
            'XLS': 'file-default',
            'XLSX': 'file-default',
            'MP4': 'file-video',
            'MP3': 'file-audio',
            'PNG': 'file-image',
            'JPG': 'file-image',
            'ZIP': 'file-archive',
            'RAR': 'file-archive'
        };
        return bgClassMap[type] || 'file-default';
    }

    previousWeek() {
        if (this.currentWeek > 1) {
            this.currentWeek--;
            document.getElementById('current-week-display').textContent = `第${this.currentWeek}周`;
            this.loadWeeklyContent();
        }
    }

    nextWeek() {
        this.currentWeek++;
        document.getElementById('current-week-display').textContent = `第${this.currentWeek}周`;
        this.loadWeeklyContent();
    }

    jumpToWeek() {
        const weekInput = document.getElementById('week-jump-input');
        const targetWeek = parseInt(weekInput.value);
        
        if (isNaN(targetWeek) || targetWeek < 1 || targetWeek > 16) {
            // 简单的提示（可以用更美观的toast替代）
            alert('请输入有效的周数（1-16）');
            return;
        }
        
        this.currentWeek = targetWeek;
        document.getElementById('current-week-display').textContent = `第${this.currentWeek}周`;
        this.loadWeeklyContent();
        
        // 清空输入框
        weekInput.value = '';
    }

    async initTextbookView() {
        // 初始化教材视图
        // 确保数据已加载（如果还没有加载）
        if (!this.textbookData || this.textbookData.length === 0) {
            console.log('教材数据未加载，先加载数据...');
            await this.loadFileData();
        }
        this.loadTextbookContent();
    }

    async initLessonPlanView() {
        // 初始化教案视图
        // 确保数据已加载（如果还没有加载）
        if (!this.lessonPlanData || this.lessonPlanData.length === 0) {
            console.log('教案数据未加载，先加载数据...');
            await this.loadFileData();
        }
        this.loadLessonPlanContent();
    }

    async initResourceView() {
        // 初始化个人知识库视图
        // 确保数据已加载（如果还没有加载）
        if (!this.resourceData || this.resourceData.length === 0) {
            console.log('资源数据未加载，先加载数据...');
            await this.loadFileData();
        }
        this.loadResourceContent();
    }

    // 加载个人知识库内容
    loadResourceContent() {
        const resourceList = document.getElementById('resourceFileList');
        if (!resourceList) {
            console.warn('resourceFileList 元素未找到');
            return;
        }

        console.log('加载资源内容，当前 resourceData:', this.resourceData);
        console.log('resourceData 长度:', this.resourceData?.length || 0);

        // 更新统计信息
        this.updateResourceStats();

        // 获取当前筛选和搜索条件
        const currentFilter = window.currentResourceFilter || 'all';
        const searchTerm = (document.getElementById('resourceSearch')?.value || '').toLowerCase();

        // 过滤数据
        let filteredData = this.resourceData || [];
        
        console.log('过滤前的数据:', filteredData.length);
        
        // 按类型筛选
        if (currentFilter !== 'all') {
            filteredData = filteredData.filter(resource => {
                const type = (resource.type || resource.originalType || '').toLowerCase();
                if (currentFilter === 'pdf') return type.includes('pdf');
                if (currentFilter === 'image') return type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg') || type.includes('gif');
                if (currentFilter === 'video') return type.includes('video') || type.includes('mp4') || type.includes('avi') || type.includes('mov');
                if (currentFilter === 'audio') return type.includes('audio') || type.includes('mp3') || type.includes('wav');
                if (currentFilter === 'document') return type.includes('doc') || type.includes('docx') || type.includes('txt');
                return true;
            });
        }

        // 按搜索词筛选
        if (searchTerm) {
            filteredData = filteredData.filter(resource => 
                (resource.name || '').toLowerCase().includes(searchTerm)
            );
        }

        // 显示/隐藏清空搜索按钮
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        }

        console.log('过滤后的数据:', filteredData);
        console.log('过滤后的数据长度:', filteredData.length);
        
        // 显示空状态
        if (filteredData.length === 0) {
            const emptyMessage = searchTerm || currentFilter !== 'all' 
                ? '没有找到符合条件的文件' 
                : '暂无资源文件';
            const emptyHint = searchTerm || currentFilter !== 'all'
                ? '尝试调整搜索条件或筛选条件'
                : '点击上方上传区域添加文件到知识库';
            
            console.log('显示空状态:', { emptyMessage, emptyHint, searchTerm, currentFilter });
            resourceList.innerHTML = `
                <div class="empty-resource-state">
                    <i class="fas fa-inbox"></i>
                    <p>${emptyMessage}</p>
                    <p class="empty-hint">${emptyHint}</p>
                </div>
            `;
            return;
        }

        console.log('开始渲染文件列表，文件数:', filteredData.length);

        // 渲染文件列表
        let html = `
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
        `;

        filteredData.forEach(resource => {
            // 获取图标类名
            let iconClass = 'fas fa-file';
            if (resource.iconClass) {
                iconClass = resource.iconClass.startsWith('fa-') || resource.iconClass.startsWith('fas ') 
                    ? `fas ${resource.iconClass.replace(/^fa-/, 'fa-')}` 
                    : `fas fa-${resource.iconClass}`;
            } else if (resource.type || resource.originalType) {
                const fileType = (resource.type || resource.originalType || '').toLowerCase();
                if (fileType.includes('pdf')) iconClass = 'fas fa-file-pdf';
                else if (fileType.includes('doc')) iconClass = 'fas fa-file-word';
                else if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) iconClass = 'fas fa-file-image';
                else if (fileType.includes('video') || fileType.includes('mp4')) iconClass = 'fas fa-file-video';
                else if (fileType.includes('audio') || fileType.includes('mp3')) iconClass = 'fas fa-file-audio';
                else if (fileType.includes('zip') || fileType.includes('rar')) iconClass = 'fas fa-file-archive';
            }
            
            const bgClass = this.getFileIconBgClass(resource.type || 'FILE');
            
            html += `
                <div class="file-list-item" data-resource-id="${resource.id}">
                    <div class="file-name">
                        <div class="file-icon ${bgClass}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="file-details">
                            <h4>${resource.name}</h4>
                            <div class="file-tags">
                                ${(resource.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="file-type">${resource.type}</div>
                    <div class="file-size">${resource.size}</div>
                    <div class="file-date">${resource.date}</div>
                    <div class="file-actions">
                        <button class="btn btn-primary btn-sm" title="查看" onclick="viewResource(${resource.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadResource(${resource.id})">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('resources', '${resource.id}', '${(resource.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        console.log('渲染的HTML长度:', html.length);
        console.log('设置 resourceList.innerHTML');
        resourceList.innerHTML = html;
        console.log('文件列表已更新，当前元素子节点数:', resourceList.children.length);
    }

    // 加载教材内容
    loadTextbookContent() {
        const textbookList = document.getElementById('textbookFileList');
        if (!textbookList) {
            console.warn('textbookFileList 元素未找到');
            return;
        }

        console.log('加载教材内容，当前 textbookData:', this.textbookData);

        // 获取当前筛选和搜索条件
        const currentFilter = window.currentTextbookFilter || 'all';
        const searchTerm = (document.getElementById('textbookSearch')?.value || '').toLowerCase();

        // 过滤数据
        let filteredData = this.textbookData || [];
        
        // 按类型筛选
        if (currentFilter !== 'all') {
            filteredData = filteredData.filter(file => {
                const type = (file.type || '').toLowerCase();
                if (currentFilter === 'pdf') return type.includes('pdf');
                if (currentFilter === 'document') return type.includes('doc') || type.includes('docx');
                if (currentFilter === 'image') return type.includes('image') || type.includes('jpg') || type.includes('png');
                return true;
            });
        }

        // 按搜索词筛选
        if (searchTerm) {
            filteredData = filteredData.filter(file => 
                (file.name || '').toLowerCase().includes(searchTerm)
            );
        }

        // 显示/隐藏清空搜索按钮
        const clearSearchBtn = document.getElementById('clearTextbookSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        }

        // 显示空状态
        if (filteredData.length === 0) {
            const emptyMessage = searchTerm || currentFilter !== 'all' 
                ? '没有找到符合条件的文件' 
                : '暂无教材文件';
            const emptyHint = searchTerm || currentFilter !== 'all'
                ? '尝试调整搜索条件或筛选条件'
                : '点击上方上传区域添加教材文件';
            
            textbookList.innerHTML = `
                <div class="empty-resource-state">
                    <i class="fas fa-inbox"></i>
                    <p>${emptyMessage}</p>
                    <p class="empty-hint">${emptyHint}</p>
                </div>
            `;
            return;
        }

        // 渲染文件列表
        let html = `
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
        `;

        filteredData.forEach(file => {
            let iconClass = 'fas fa-file';
            const fileType = (file.type || '').toLowerCase();
            if (fileType.includes('pdf')) iconClass = 'fas fa-file-pdf';
            else if (fileType.includes('doc')) iconClass = 'fas fa-file-word';
            else if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) iconClass = 'fas fa-file-image';
            
            const bgClass = this.getFileIconBgClass(file.type || 'FILE');
            
            html += `
                <div class="file-list-item" data-file-id="${file.id}">
                    <div class="file-name">
                        <div class="file-icon ${bgClass}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            ${file.subject ? `<div class="file-tags"><span class="tag">${file.subject}</span></div>` : ''}
                        </div>
                    </div>
                    <div class="file-type">${file.type || 'FILE'}</div>
                    <div class="file-size">${file.size || '0MB'}</div>
                    <div class="file-date">${file.date || ''}</div>
                    <div class="file-actions">
                        <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('materials', '${file.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('materials', '${file.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('materials', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        textbookList.innerHTML = html;
    }

    // 加载教案内容
    loadLessonPlanContent() {
        const lessonPlanList = document.getElementById('lessonPlanFileList');
        if (!lessonPlanList) {
            console.warn('lessonPlanFileList 元素未找到');
            return;
        }

        console.log('加载教案内容，当前 lessonPlanData:', this.lessonPlanData);

        // 获取当前筛选和搜索条件
        const currentFilter = window.currentLessonPlanFilter || 'all';
        const searchTerm = (document.getElementById('lessonPlanSearch')?.value || '').toLowerCase();

        // 过滤数据
        let filteredData = this.lessonPlanData || [];
        
        // 按类型筛选
        if (currentFilter !== 'all') {
            filteredData = filteredData.filter(file => {
                const type = (file.type || '').toLowerCase();
                if (currentFilter === 'pdf') return type.includes('pdf');
                if (currentFilter === 'document') return type.includes('doc') || type.includes('docx');
                if (currentFilter === 'ppt') return type.includes('ppt') || type.includes('powerpoint');
                return true;
            });
        }

        // 按搜索词筛选
        if (searchTerm) {
            filteredData = filteredData.filter(file => 
                (file.name || '').toLowerCase().includes(searchTerm)
            );
        }

        // 显示/隐藏清空搜索按钮
        const clearSearchBtn = document.getElementById('clearLessonPlanSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        }

        // 显示空状态
        if (filteredData.length === 0) {
            const emptyMessage = searchTerm || currentFilter !== 'all' 
                ? '没有找到符合条件的文件' 
                : '暂无教案文件';
            const emptyHint = searchTerm || currentFilter !== 'all'
                ? '尝试调整搜索条件或筛选条件'
                : '点击上方上传区域添加教案文件';
            
            lessonPlanList.innerHTML = `
                <div class="empty-resource-state">
                    <i class="fas fa-inbox"></i>
                    <p>${emptyMessage}</p>
                    <p class="empty-hint">${emptyHint}</p>
                </div>
            `;
            return;
        }

        // 渲染文件列表
        let html = `
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
        `;

        filteredData.forEach(file => {
            let iconClass = 'fas fa-file';
            const fileType = (file.type || '').toLowerCase();
            if (fileType.includes('pdf')) iconClass = 'fas fa-file-pdf';
            else if (fileType.includes('doc')) iconClass = 'fas fa-file-word';
            else if (fileType.includes('ppt')) iconClass = 'fas fa-file-powerpoint';
            
            const bgClass = this.getFileIconBgClass(file.type || 'FILE');
            
            html += `
                <div class="file-list-item" data-file-id="${file.id}">
                    <div class="file-name">
                        <div class="file-icon ${bgClass}">
                            <i class="${iconClass}"></i>
                        </div>
                        <div class="file-details">
                            <h4>${file.name}</h4>
                            ${file.subject ? `<div class="file-tags"><span class="tag">${file.subject}</span></div>` : ''}
                            ${file.subtype ? `<div class="file-tags"><span class="tag">${file.subtype}</span></div>` : ''}
                        </div>
                    </div>
                    <div class="file-type">${file.type || 'FILE'}</div>
                    <div class="file-size">${file.size || '0KB'}</div>
                    <div class="file-date">${file.date || ''}</div>
                    <div class="file-actions">
                        <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('lesson_plans', '${file.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('lesson_plans', '${file.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('lesson_plans', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        lessonPlanList.innerHTML = html;
    }

    // 更新教材统计信息
    updateTextbookStats() {
        const textbooks = this.textbookData || [];
        
        // 总文件数
        const totalCount = textbooks.length;
        const totalCountEl = document.getElementById('textbooksTotalCount');
        if (totalCountEl) {
            totalCountEl.textContent = totalCount;
        }

        // 计算总大小
        let totalSizeBytes = 0;
        textbooks.forEach(t => {
            const size = t.size || '0';
            if (typeof size === 'string') {
                const match = size.match(/(\d+\.?\d*)\s*(KB|MB|GB|B)/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2].toUpperCase();
                    if (unit === 'KB') totalSizeBytes += value * 1024;
                    else if (unit === 'MB') totalSizeBytes += value * 1024 * 1024;
                    else if (unit === 'GB') totalSizeBytes += value * 1024 * 1024 * 1024;
                    else totalSizeBytes += value;
                }
            }
        });
        
        const totalSizeEl = document.getElementById('textbooksTotalSize');
        if (totalSizeEl) {
            let sizeText = '0 B';
            if (totalSizeBytes >= 1024 * 1024 * 1024) {
                sizeText = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            } else if (totalSizeBytes >= 1024 * 1024) {
                sizeText = (totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
            } else if (totalSizeBytes >= 1024) {
                sizeText = (totalSizeBytes / 1024).toFixed(2) + ' KB';
            } else {
                sizeText = totalSizeBytes + ' B';
            }
            totalSizeEl.textContent = sizeText;
        }

        // PDF数量
        const pdfCount = textbooks.filter(t => {
            const type = (t.type || '').toLowerCase();
            return type.includes('pdf');
        }).length;
        const pdfCountEl = document.getElementById('textbooksPdfCount');
        if (pdfCountEl) {
            pdfCountEl.textContent = pdfCount;
        }

        // 文档数量
        const docCount = textbooks.filter(t => {
            const type = (t.type || '').toLowerCase();
            return type.includes('doc') || type.includes('docx');
        }).length;
        const docCountEl = document.getElementById('textbooksDocCount');
        if (docCountEl) {
            docCountEl.textContent = docCount;
        }
    }

    // 更新教案统计信息
    updateLessonPlanStats() {
        const lessonPlans = this.lessonPlanData || [];
        
        // 总文件数
        const totalCount = lessonPlans.length;
        const totalCountEl = document.getElementById('lessonPlansTotalCount');
        if (totalCountEl) {
            totalCountEl.textContent = totalCount;
        }

        // 计算总大小
        let totalSizeBytes = 0;
        lessonPlans.forEach(lp => {
            const size = lp.size || '0';
            if (typeof size === 'string') {
                const match = size.match(/(\d+\.?\d*)\s*(KB|MB|GB|B)/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2].toUpperCase();
                    if (unit === 'KB') totalSizeBytes += value * 1024;
                    else if (unit === 'MB') totalSizeBytes += value * 1024 * 1024;
                    else if (unit === 'GB') totalSizeBytes += value * 1024 * 1024 * 1024;
                    else totalSizeBytes += value;
                }
            }
        });
        
        const totalSizeEl = document.getElementById('lessonPlansTotalSize');
        if (totalSizeEl) {
            let sizeText = '0 B';
            if (totalSizeBytes >= 1024 * 1024 * 1024) {
                sizeText = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            } else if (totalSizeBytes >= 1024 * 1024) {
                sizeText = (totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
            } else if (totalSizeBytes >= 1024) {
                sizeText = (totalSizeBytes / 1024).toFixed(2) + ' KB';
            } else {
                sizeText = totalSizeBytes + ' B';
            }
            totalSizeEl.textContent = sizeText;
        }

        // Word文档数量
        const docCount = lessonPlans.filter(lp => {
            const type = (lp.type || '').toLowerCase();
            return type.includes('doc') || type.includes('docx');
        }).length;
        const docCountEl = document.getElementById('lessonPlansDocCount');
        if (docCountEl) {
            docCountEl.textContent = docCount;
        }

        // PDF数量
        const pdfCount = lessonPlans.filter(lp => {
            const type = (lp.type || '').toLowerCase();
            return type.includes('pdf');
        }).length;
        const pdfCountEl = document.getElementById('lessonPlansPdfCount');
        if (pdfCountEl) {
            pdfCountEl.textContent = pdfCount;
        }
    }

    // 更新资源统计信息
    updateResourceStats() {
        const resources = this.resourceData || [];
        
        // 总文件数
        const totalCount = resources.length;
        const totalCountEl = document.getElementById('totalFilesCount');
        if (totalCountEl) {
            totalCountEl.textContent = totalCount;
        }

        // 计算总大小
        let totalSizeBytes = 0;
        resources.forEach(r => {
            const size = r.size || '0';
            if (typeof size === 'string') {
                const match = size.match(/(\d+\.?\d*)\s*(KB|MB|GB|B)/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2].toUpperCase();
                    if (unit === 'KB') totalSizeBytes += value * 1024;
                    else if (unit === 'MB') totalSizeBytes += value * 1024 * 1024;
                    else if (unit === 'GB') totalSizeBytes += value * 1024 * 1024 * 1024;
                    else totalSizeBytes += value;
                }
            }
        });
        
        const totalSizeEl = document.getElementById('totalSize');
        if (totalSizeEl) {
            let sizeText = '0 B';
            if (totalSizeBytes >= 1024 * 1024 * 1024) {
                sizeText = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
            } else if (totalSizeBytes >= 1024 * 1024) {
                sizeText = (totalSizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
            } else if (totalSizeBytes >= 1024) {
                sizeText = (totalSizeBytes / 1024).toFixed(2) + ' KB';
            } else {
                sizeText = totalSizeBytes + ' B';
            }
            totalSizeEl.textContent = sizeText;
        }

        // 图片数量
        const imageCount = resources.filter(r => {
            const type = (r.type || r.originalType || '').toLowerCase();
            return type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg') || type.includes('gif');
        }).length;
        const imageCountEl = document.getElementById('imageCount');
        if (imageCountEl) {
            imageCountEl.textContent = imageCount;
        }

        // 视频数量
        const videoCount = resources.filter(r => {
            const type = (r.type || r.originalType || '').toLowerCase();
            return type.includes('video') || type.includes('mp4') || type.includes('avi') || type.includes('mov');
        }).length;
        const videoCountEl = document.getElementById('videoCount');
        if (videoCountEl) {
            videoCountEl.textContent = videoCount;
        }
    }

    // 初始化Padlet-学生的课程内容
    initPadletCourses() {
        // 调用已存在的函数初始化课程视图
        if (typeof initPadletCourseView === 'function') {
            initPadletCourseView();
        }
    }

    // 加载课程模块数据
    loadCourseModules() {
        const courseModules = document.querySelectorAll('.course-module');
        if (!courseModules.length) return;

        // 为每个课程模块加载文件和进度
        courseModules.forEach((module, index) => {
            this.renderCourseFiles(module, index);
        });
    }

    // 渲染课程文件列表
    renderCourseFiles(moduleElement, moduleIndex) {
        // 获取教材和教案文件
        const courseTextbooks = this.textbookData.filter(file => file.week === (moduleIndex + 1));
        const courseLessonPlans = this.lessonPlanData.filter(file => file.week === (moduleIndex + 1));

        // 更新教材文件列表
        const textbookFilesContainer = moduleElement.querySelector('.course-files:first-of-type .file-list-mini');
        if (textbookFilesContainer) {
            if (courseTextbooks.length > 0) {
            textbookFilesContainer.innerHTML = courseTextbooks.map(file => this.createFileItemMini(file)).join('');
            } else {
                // 没有文件时显示空状态
                textbookFilesContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">暂无教材</div>';
            }
        }

        // 更新教案文件列表
        const lessonPlanFilesContainer = moduleElement.querySelector('.course-files:last-of-type .file-list-mini');
        if (lessonPlanFilesContainer) {
            if (courseLessonPlans.length > 0) {
            lessonPlanFilesContainer.innerHTML = courseLessonPlans.map(file => this.createFileItemMini(file)).join('');
            } else {
                // 没有文件时显示空状态
                lessonPlanFilesContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">暂无教案</div>';
            }
        }

        // 计算并更新进度（基于真实文件数量，不再使用假数据）
        const totalFiles = courseTextbooks.length + courseLessonPlans.length;
        const progress = 0; // 不再使用假进度，实际进度应该基于完成情况计算
        const progressFill = moduleElement.querySelector('.progress-fill');
        const progressText = moduleElement.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `${progress}% 完成`;
        }
    }

    // 创建文件项HTML
    createFileItemMini(file) {
        const iconClass = this.getFileIconClass(file.type);
        const subtypeLabel = file.subtype === 'teaching_content' ? '教学内容设计' : 
                            file.subtype === 'student_analysis' ? '学情分析' : '';
        const subtypeTag = subtypeLabel ? `<span class="tag tag-subtype">${subtypeLabel}</span>` : '';
        return `
            <div class="file-item-mini">
                <i class="${iconClass}"></i>
                <span>${file.name}</span>
                ${subtypeTag}
                <div class="file-actions-mini">
                    <button class="btn-mini" title="查看" onclick="window.learningPlatform.viewFile('${file.name}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-mini" title="下载" onclick="window.learningPlatform.downloadFile('${file.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 获取文件图标类
    getFileIconClass(type) {
        const iconMap = {
            'PDF': 'fas fa-file-pdf',
            'DOCX': 'fas fa-file-word',
            'DOC': 'fas fa-file-word',
            'XLSX': 'fas fa-file-excel',
            'XLS': 'fas fa-file-excel',
            'PPTX': 'fas fa-file-powerpoint',
            'PPT': 'fas fa-file-powerpoint',
            'ZIP': 'fas fa-file-archive',
            'RAR': 'fas fa-file-archive',
            'TXT': 'fas fa-file-alt',
            'MD': 'fas fa-file-alt'
        };
        return iconMap[type.toUpperCase()] || 'fas fa-file';
    }

    // 查看文件
    viewFile(fileName) {
        console.log('查看文件:', fileName);
        this.showNotification(`正在打开 ${fileName}`, 'info');
        // TODO: 实现文件查看功能
    }

    // 下载文件
    downloadFile(fileName) {
        console.log('下载文件:', fileName);
        this.showNotification(`正在下载 ${fileName}`, 'info');
        // TODO: 实现文件下载功能
    }
}

// 全局函数
function changeLanguage(language) {
    if (window.learningPlatform) {
        window.learningPlatform.changeLanguage(language);
    }
}

function askMyTutor(question) {
    if (window.learningPlatform) {
        window.learningPlatform.askMyTutor(question);
    }
}

function sendMyTutorMessage() {
    if (window.learningPlatform) {
        window.learningPlatform.sendMyTutorMessage();
    }
}

function clearMyTutorChat() {
    if (window.learningPlatform) {
        window.learningPlatform.clearMyTutorChat();
    }
}

function clearChat() {
    if (window.learningPlatform) {
        window.learningPlatform.clearMyTutorChat();
    }
}

function newChat() {
    if (window.learningPlatform) {
        window.learningPlatform.newMyTutorChat();
    }
}

function askProfessionalTutor(question) {
    if (window.learningPlatform) {
        window.learningPlatform.askProfessionalTutor(question);
    }
}

function sendProfessionalTutorMessage() {
    if (window.learningPlatform) {
        window.learningPlatform.sendProfessionalTutorMessage();
    }
}

function clearProfessionalTutorChat() {
    if (window.learningPlatform) {
        window.learningPlatform.clearProfessionalTutorChat();
    }
}

function newProfessionalChat() {
    if (window.learningPlatform) {
        window.learningPlatform.newProfessionalChat();
    }
}

function filterCourseContent(type) {
    if (window.learningPlatform) {
        window.learningPlatform.filterCourseContent(type);
    }
}

function previousMonth() {
    if (window.learningPlatform) {
        window.learningPlatform.previousMonth();
    }
}

function nextMonth() {
    if (window.learningPlatform) {
        window.learningPlatform.nextMonth();
    }
}

function uploadFile(type) {
    if (window.learningPlatform) {
        window.learningPlatform.uploadFile(type);
    }
}

function filterFiles(type) {
    if (window.learningPlatform) {
        window.learningPlatform.filterFiles(type);
    }
}

function addStudent() {
    if (window.learningPlatform) {
        window.learningPlatform.addStudent();
    }
}

function exportStudentData() {
    if (window.learningPlatform) {
        window.learningPlatform.exportStudentData();
    }
}

function searchStudents(query) {
    if (window.learningPlatform) {
        window.learningPlatform.searchStudents(query);
    }
}

function filterStudentsByGrade(grade) {
    if (window.learningPlatform) {
        window.learningPlatform.filterStudentsByGrade(grade);
    }
}

function showSection(sectionId) {
    if (window.learningPlatform) {
        window.learningPlatform.showSection(sectionId);
    }
}

function toggleUserMenu() {
    if (window.learningPlatform) {
        window.learningPlatform.toggleUserMenu();
    }
}

// 教材视图切换函数
function switchTextbookView(view) {
    if (window.learningPlatform) {
        window.learningPlatform.switchTextbookView(view);
    }
}

// 周导航函数
function previousWeek() {
    if (window.learningPlatform) {
        window.learningPlatform.previousWeek();
    }
}

function nextWeek() {
    if (window.learningPlatform) {
        window.learningPlatform.nextWeek();
    }
}

function jumpToWeek() {
    if (window.learningPlatform) {
        window.learningPlatform.jumpToWeek();
    }
}

function handleWeekJumpKeyPress(event) {
    if (event.key === 'Enter') {
        jumpToWeek();
    }
}

// 课程视图切换函数
function switchCourseView(view) {
    const weeklyBtn = document.getElementById('toggle-course-weekly');
    const categoryBtn = document.getElementById('toggle-course-category');
    const weeklyView = document.getElementById('course-weekly-view');
    const categoryView = document.getElementById('course-category-view');
    
    if (view === 'weekly') {
        weeklyBtn.classList.add('active');
        categoryBtn.classList.remove('active');
        weeklyView.style.display = 'block';
        categoryView.style.display = 'none';
        loadCourseWeeklyContent();
    } else {
        weeklyBtn.classList.remove('active');
        categoryBtn.classList.add('active');
        weeklyView.style.display = 'none';
        categoryView.style.display = 'block';
        loadCourseCategoryContent();
    }
}

// 课程周导航函数
let currentCourseWeek = 1;

function previousCourseWeek() {
    if (currentCourseWeek > 1) {
        currentCourseWeek--;
        document.getElementById('current-course-week-display').textContent = `第${currentCourseWeek}周`;
        loadCourseWeeklyContent();
    }
}

function nextCourseWeek() {
    if (currentCourseWeek < 16) {
    currentCourseWeek++;
    document.getElementById('current-course-week-display').textContent = `第${currentCourseWeek}周`;
        loadCourseWeeklyContent();
    }
}

function jumpToCourseWeek() {
    const weekInput = document.getElementById('course-week-jump-input');
    const targetWeek = parseInt(weekInput.value);
    
    if (isNaN(targetWeek) || targetWeek < 1 || targetWeek > 16) {
        alert('请输入有效的周数（1-16）');
        return;
    }
    
    currentCourseWeek = targetWeek;
    document.getElementById('current-course-week-display').textContent = `第${currentCourseWeek}周`;
    weekInput.value = '';
    loadCourseWeeklyContent();
}

function handleCourseWeekJumpKeyPress(event) {
    if (event.key === 'Enter') {
        jumpToCourseWeek();
    }
}

// 课程文件筛选
function filterCourseFiles(type) {
    // 更新按钮状态
    document.querySelectorAll('#course-category-view .file-filters button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(type === 'all' ? '全部' : type === 'textbook' ? '教材' : type === 'lessonPlan' ? '教案' : '资源')) {
            btn.classList.add('active');
        }
    });
    
    // 加载筛选后的文件列表
    loadCourseCategoryContent(type);
}

// 加载课程周内容
function loadCourseWeeklyContent() {
    const weeklyContent = document.getElementById('course-weekly-content');
    if (!weeklyContent) return;
    
    const platform = window.learningPlatform;
    if (!platform) return;
    
    // 合并教材和教案数据
    const weekFiles = [
        ...platform.textbookData.filter(file => file.week === currentCourseWeek).map(file => ({...file, category: '教材'})),
        ...platform.lessonPlanData.filter(file => file.week === currentCourseWeek).map(file => ({...file, category: '教案'}))
    ];
    
    if (weekFiles.length === 0) {
        weeklyContent.innerHTML = `
            <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>第${currentCourseWeek}周暂无课程资料</p>
                <p style="font-size: 14px; margin-top: 8px;">请上传文件后查看</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="file-list">
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
    `;
    
    weekFiles.forEach(file => {
        const iconClass = platform.getFileIconClass(file.type);
        const bgClass = platform.getFileIconBgClass(file.type);
        html += `
            <div class="file-list-item">
                <div class="file-name">
                    <div class="file-icon ${bgClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <div class="file-tags">
                            <span class="tag">${file.category}</span>
                            ${(file.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="file-type">${file.type}</div>
                <div class="file-size">${file.size}</div>
                <div class="file-date">${file.date}</div>
                <div class="file-actions">
                    <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('${file.category === '教材' ? 'textbook' : 'lessonPlan'}', ${file.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('${file.category === '教材' ? 'textbook' : 'lessonPlan'}', ${file.id}, '${file.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('${file.category === '教材' ? 'materials' : 'lesson_plans'}', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    weeklyContent.innerHTML = html;
}

// 加载课程分类内容
function loadCourseCategoryContent(type = 'all') {
    const categoryContent = document.getElementById('course-category-content');
    if (!categoryContent) return;
    
    const platform = window.learningPlatform;
    if (!platform) return;
    
    // 合并所有文件数据
    let allFiles = [
        ...platform.textbookData.map(file => ({...file, category: '教材'})),
        ...platform.lessonPlanData.map(file => ({...file, category: '教案'})),
        ...platform.resourceData.map(file => ({...file, category: '资源'}))
    ];
    
    // 根据类型筛选
    if (type === 'textbook') {
        allFiles = allFiles.filter(file => file.category === '教材');
    } else if (type === 'lessonPlan') {
        allFiles = allFiles.filter(file => file.category === '教案');
    } else if (type === 'resource') {
        allFiles = allFiles.filter(file => file.category === '资源');
    }
    // type === 'all' 时显示所有文件
    
    if (allFiles.length === 0) {
        categoryContent.innerHTML = `
            <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>暂无课程文件</p>
                <p style="font-size: 14px; margin-top: 8px;">请上传文件后查看</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="file-list">
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
    `;
    
    allFiles.forEach(file => {
        const iconClass = platform.getFileIconClass(file.type);
        const bgClass = platform.getFileIconBgClass(file.type);
        const categoryKey = file.category === '教材' ? 'materials' : file.category === '教案' ? 'lesson_plans' : 'resources';
        html += `
            <div class="file-list-item">
                <div class="file-name">
                    <div class="file-icon ${bgClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <div class="file-tags">
                            <span class="tag">${file.category}</span>
                            ${(file.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="file-type">${file.type}</div>
                <div class="file-size">${file.size}</div>
                <div class="file-date">${file.date}</div>
                <div class="file-actions">
                    <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('${categoryKey}', ${file.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('${categoryKey}', ${file.id}, '${file.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('${categoryKey}', ${file.id}, '${file.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    categoryContent.innerHTML = html;
}

// 教案视图切换函数
function switchLessonPlanView(view) {
    const weeklyBtn = document.getElementById('toggle-lesson-plan-weekly');
    const categoryBtn = document.getElementById('toggle-lesson-plan-category');
    const weeklyView = document.getElementById('lesson-plan-weekly-view');
    const categoryView = document.getElementById('lesson-plan-category-view');
    
    if (view === 'weekly') {
        weeklyBtn.classList.add('active');
        categoryBtn.classList.remove('active');
        weeklyView.style.display = 'block';
        categoryView.style.display = 'none';
        loadLessonPlanWeeklyContent();
    } else {
        weeklyBtn.classList.remove('active');
        categoryBtn.classList.add('active');
        weeklyView.style.display = 'none';
        categoryView.style.display = 'block';
        loadLessonPlanCategoryContent();
    }
}

// 教案周导航函数
let currentLessonPlanWeek = 1;

function previousLessonPlanWeek() {
    if (currentLessonPlanWeek > 1) {
        currentLessonPlanWeek--;
        document.getElementById('current-lesson-plan-week-display').textContent = `第${currentLessonPlanWeek}周`;
        loadLessonPlanWeeklyContent();
    }
}

function nextLessonPlanWeek() {
    if (currentLessonPlanWeek < 16) {
        currentLessonPlanWeek++;
        document.getElementById('current-lesson-plan-week-display').textContent = `第${currentLessonPlanWeek}周`;
        loadLessonPlanWeeklyContent();
    }
}

function jumpToLessonPlanWeek() {
    const weekInput = document.getElementById('lesson-plan-week-jump-input');
    const targetWeek = parseInt(weekInput.value);
    
    if (isNaN(targetWeek) || targetWeek < 1 || targetWeek > 16) {
        alert('请输入有效的周数（1-16）');
        return;
    }
    
    currentLessonPlanWeek = targetWeek;
    document.getElementById('current-lesson-plan-week-display').textContent = `第${currentLessonPlanWeek}周`;
    weekInput.value = '';
    loadLessonPlanWeeklyContent();
}

function handleLessonPlanWeekJumpKeyPress(event) {
    if (event.key === 'Enter') {
        jumpToLessonPlanWeek();
    }
}

// 加载教案周内容
function loadLessonPlanWeeklyContent() {
    const weeklyContent = document.getElementById('lesson-plan-weekly-content');
    if (!weeklyContent) return;
    
    const platform = window.learningPlatform;
    if (!platform) return;
    
    const weekFiles = platform.lessonPlanData.filter(file => file.week === currentLessonPlanWeek);
    
    if (weekFiles.length === 0) {
        weeklyContent.innerHTML = `
            <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>第${currentLessonPlanWeek}周暂无教案资料</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="file-list" style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
    `;
    
    weekFiles.forEach(file => {
        const iconClass = platform.getFileIconClass(file.type);
        const bgClass = platform.getFileIconBgClass(file.type);
        html += `
            <div class="file-list-item">
                <div class="file-name">
                    <div class="file-icon ${bgClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <div class="file-tags">
                            ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="file-type">${file.type}</div>
                <div class="file-size">${file.size}</div>
                <div class="file-date">${file.date}</div>
                <div class="file-actions">
                    <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('lessonPlan', ${file.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('lessonPlan', ${file.id}, '${file.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('lesson_plans', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    weeklyContent.innerHTML = html;
}

// 加载教案类型内容
function loadLessonPlanCategoryContent() {
    const categoryContent = document.getElementById('lesson-plan-category-content');
    if (!categoryContent) return;
    
    const platform = window.learningPlatform;
    if (!platform) return;
    
    // 如果没有数据，显示空状态
    if (!platform.lessonPlanData || platform.lessonPlanData.length === 0) {
        categoryContent.innerHTML = `
            <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>暂无教案文件</p>
                <p style="font-size: 14px; margin-top: 8px;">点击上方"上传教案"按钮添加文件</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="file-list" style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div class="file-list-header">
                <div class="file-name">文件名</div>
                <div class="file-type">类型</div>
                <div class="file-size">大小</div>
                <div class="file-date">上传时间</div>
                <div class="file-actions-header">操作</div>
            </div>
    `;
    
    platform.lessonPlanData.forEach(file => {
        const iconClass = platform.getFileIconClass(file.type);
        const bgClass = platform.getFileIconBgClass(file.type);
        html += `
            <div class="file-list-item">
                <div class="file-name">
                    <div class="file-icon ${bgClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <div class="file-tags">
                            ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="file-type">${file.type}</div>
                <div class="file-size">${file.size}</div>
                <div class="file-date">${file.date}</div>
                <div class="file-actions">
                    <button class="btn btn-primary btn-sm" title="查看" onclick="viewFile('lessonPlan', ${file.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" title="下载" onclick="downloadFile('lessonPlan', ${file.id}, '${file.name}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" title="删除" onclick="deleteFile('lesson_plans', '${file.id}', '${(file.name || '').replace(/'/g, "\\'").replace(/"/g, "&quot;")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    categoryContent.innerHTML = html;
}

// 教案文件筛选
function filterLessonPlanFiles(type) {
    // 更新按钮状态
    document.querySelectorAll('#lesson-plan-category-view .file-filters button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(type === 'all' ? '全部' : type === 'docx' ? 'Word' : type === 'ppt' ? 'PPT' : 'PDF')) {
            btn.classList.add('active');
        }
    });
    
    // 这里可以添加实际的筛选逻辑
    console.log('筛选教案文件类型:', type);
}

function showSettings() {
    if (window.learningPlatform) {
        window.learningPlatform.showSettings();
    }
}

function showLearningHistory() {
    if (window.learningPlatform) {
        window.learningPlatform.showLearningHistory();
    }
}

function logout() {
    if (window.learningPlatform) {
        window.learningPlatform.logout();
    }
}

function openEssayCorrection() {
    if (window.learningPlatform) {
        window.learningPlatform.openEssayCorrection();
    }
}

function openFourSchoolExam() {
    if (window.learningPlatform) {
        window.learningPlatform.openFourSchoolExam();
    }
}

function openCreativeWriting() {
    if (window.learningPlatform) {
        window.learningPlatform.openCreativeWriting();
    }
}

function openIELTSPrep() {
    if (window.learningPlatform) {
        window.learningPlatform.openIELTSPrep();
    }
}

function openLessonPlanAssistant() {
    if (window.learningPlatform) {
        window.learningPlatform.openLessonPlanAssistant();
    }
}

// 作文批改相关全局函数
function switchCorrectionMode(mode) {
    if (window.learningPlatform) {
        window.learningPlatform.switchCorrectionMode(mode);
    }
}

function removeEssayFile() {
    if (window.learningPlatform) {
        window.learningPlatform.removeEssayFile();
    }
}

function removeStandardFile() {
    if (window.learningPlatform) {
        window.learningPlatform.removeStandardFile();
    }
}

function nextStep() {
    if (window.learningPlatform) {
        window.learningPlatform.nextStep();
    }
}

function previousStep() {
    if (window.learningPlatform) {
        window.learningPlatform.previousStep();
    }
}

function startCorrection() {
    if (window.learningPlatform) {
        window.learningPlatform.startCorrection();
    }
}

function startNewCorrection() {
    if (window.learningPlatform) {
        window.learningPlatform.startNewCorrection();
    }
}

function downloadResult() {
    if (window.learningPlatform) {
        window.learningPlatform.downloadResult();
    }
}

function showCorrectionHistory() {
    if (window.learningPlatform) {
        window.learningPlatform.showCorrectionHistory();
    }
}

// 外部工具相关全局函数

function removeExternalTool(toolName) {
    if (window.learningPlatform) {
        window.learningPlatform.removeExternalTool(toolName);
    }
}

function skipStandardUpload() {
    if (window.learningPlatform) {
        window.learningPlatform.skipStandardUpload();
    }
}

function cancelSkipStandard() {
    if (window.learningPlatform) {
        window.learningPlatform.cancelSkipStandard();
    }
}

function toggleExternalToolCard(toolName) {
    if (window.learningPlatform) {
        const isSelected = window.learningPlatform.selectedExternalTools.has(toolName);
        window.learningPlatform.toggleExternalTool(toolName, !isSelected);
    }
}

// DeepSeek API配置相关全局函数
// DeepSeek配置相关全局函数已删除

function saveDeepSeekConfig() {
    if (window.learningPlatform) {
        window.learningPlatform.saveDeepSeekConfig();
    }
}

// 上传资源相关
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'flex';
}

// 切换教案子类型显示
function toggleLessonPlanSubtype() {
    const categoryEl = document.getElementById('uploadCategory');
    const subtypeGroup = document.getElementById('lessonPlanSubtypeGroup');
    if (categoryEl && subtypeGroup) {
        if (categoryEl.value === 'lesson_plans') {
            subtypeGroup.style.display = 'block';
        } else {
            subtypeGroup.style.display = 'none';
        }
    }
}

function hideUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.style.display = 'none';
}

async function uploadFiles() {
    try {
        const categoryEl = document.getElementById('uploadCategory');
        const subtypeEl = document.getElementById('lessonPlanSubtype');
        const filesEl = document.getElementById('uploadFiles');
        const resultEl = document.getElementById('uploadResult');
        if (!categoryEl || !filesEl) return;

        const category = categoryEl.value;
        const files = filesEl.files;
        if (!files || files.length === 0) {
            if (resultEl) resultEl.textContent = '请先选择文件';
            return;
        }

        // 创建表单数据上传文件
        const formData = new FormData();
        formData.append('category', category);
        
        // 如果是教案，添加子类型
        if (category === 'lesson_plans' && subtypeEl) {
            formData.append('subtype', subtypeEl.value);
        }
        
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        
        // 先上传文件
        const uploadResp = await fetch(`${apiBase}/upload`, {
            method: 'POST',
            body: formData
        });
        
        // 检查响应类型，确保是JSON
        const contentType = uploadResp.headers.get('content-type');
        let uploadData;
        
        // 先克隆响应，以便在需要时读取文本
        const responseClone = uploadResp.clone();
        
        if (!contentType || !contentType.includes('application/json')) {
            // 如果返回的不是JSON，读取文本以获取错误信息
            const text = await responseClone.text();
            console.error('服务器返回了非JSON响应:', text.substring(0, 500));
            throw new Error(`服务器错误: 返回了 ${contentType || '未知类型'} 而不是JSON。这通常意味着服务器路由错误或文件处理失败。\n响应内容: ${text.substring(0, 200)}`);
        }
        
        // 尝试解析JSON响应
        try {
            uploadData = await uploadResp.json();
        } catch (parseError) {
            // 如果JSON解析失败，尝试从克隆的响应中读取文本
            try {
                const text = await responseClone.text();
                console.error('JSON解析失败，响应内容:', text.substring(0, 500));
                throw new Error(`服务器返回了无效的JSON响应。这可能是文件处理过程中的错误。\n状态码: ${uploadResp.status}\n响应: ${text.substring(0, 200)}`);
            } catch (textError) {
                // 如果克隆的响应也已读取，直接抛出原始错误
                throw new Error(`JSON解析失败: ${parseError.message}\n状态码: ${uploadResp.status}`);
            }
        }
        
        if (!uploadResp.ok) {
            // 处理错误响应
            throw new Error(uploadData.error || uploadData.message || `上传失败: HTTP ${uploadResp.status}`);
        }
        console.log('文件上传成功，准备保存到数据库:', uploadData);
        // 记录最近一次上传提取的文本，供“新建我的专业导师”导入
        if (uploadData && uploadData.extractedText) {
            window.latestUploadedExtractedText = uploadData.extractedText;
        }
        
        // 保存文件信息到数据库
        let successes = [];
        let errors = [];
        
        if (uploadData.files && uploadData.files.length > 0) {
            const savePromises = [];
            
            for (let i = 0; i < uploadData.files.length; i++) {
                const fileInfo = uploadData.files[i];
                const file = files[i];
                
                // 构建文件数据
                const fileType = getFileTypeFromName(fileInfo.name);
                const iconClass = getIconClassFromFileType(fileType);
                
                const fileData = {
                    title: fileInfo.name,
                    name: fileInfo.name,
                    fileType: fileType,
                    iconClass: iconClass,
                    size: formatFileSize(fileInfo.size),
                    filePath: fileInfo.path || null, // 保存文件路径
                    week: 1, // 默认第一周，用户可以后续修改
                    subject: '', // 默认空，用户可以后续修改
                    tags: []
                };
                
                // 如果是教案，添加subtype
                if (category === 'lesson_plans' && subtypeEl) {
                    fileData.subtype = subtypeEl.value;
                }
                
                // 保存到数据库
                const savePromise = fetch(`${apiBase}/upload/save-file`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        category: category,
                        fileData: fileData
                    })
                }).then(async (response) => {
                    // 检查响应类型，确保是JSON
                    const contentType = response.headers.get('content-type');
                    let data;
                    
                    // 先克隆响应，以便在需要时读取文本
                    const responseClone = response.clone();
                    
                    if (!contentType || !contentType.includes('application/json')) {
                        // 如果返回的不是JSON，读取文本以获取错误信息
                        const text = await responseClone.text();
                        console.error('save-file 服务器返回了非JSON响应:', text.substring(0, 500));
                        throw new Error(`服务器错误: 返回了 ${contentType || '未知类型'} 而不是JSON。响应: ${text.substring(0, 200)}`);
                    }
                    
                    // 尝试解析JSON响应
                    try {
                        data = await response.json();
                    } catch (parseError) {
                        // 如果JSON解析失败，尝试从克隆的响应中读取文本
                        try {
                            const text = await responseClone.text();
                            console.error('save-file JSON解析失败，响应内容:', text.substring(0, 500));
                            throw new Error(`服务器返回了无效的JSON响应。状态码: ${response.status}，响应: ${text.substring(0, 200)}`);
                        } catch (textError) {
                            throw new Error(`JSON解析失败: ${parseError.message}，状态码: ${response.status}`);
                        }
                    }
                    
                    if (!response.ok) {
                        // 处理重复文件错误
                        if (response.status === 400 && data.error === '文件已存在') {
                            throw new Error(`文件 "${fileInfo.name}" 已存在`);
                        }
                        throw new Error(data.error || data.message || '保存文件失败');
                    }
                    return data;
                }).catch(error => {
                    // 增强错误信息
                    console.error(`保存文件 "${fileInfo.name}" 失败:`, error);
                    throw error;
                });
                
                savePromises.push(savePromise);
            }
            
            // 等待所有文件保存完成，收集错误
            const results = await Promise.allSettled(savePromises);
            errors = [];
            successes = [];
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successes.push(uploadData.files[index].name);
                } else {
                    errors.push({
                        file: uploadData.files[index].name,
                        error: result.reason.message
                    });
                }
            });
            
            // 显示结果
            if (errors.length > 0) {
                const errorMsg = errors.map(e => `${e.file}: ${e.error}`).join('\n');
                console.warn('部分文件保存失败:', errors);
                
                // 如果有些文件成功了，显示警告而不是错误
                if (successes.length > 0) {
                    alert(`部分文件保存失败：\n${errorMsg}\n\n但 ${successes.length} 个文件已成功保存。`);
                } else {
                    // 所有文件都失败了才显示错误
                    alert(`所有文件保存失败：\n${errorMsg}`);
                    return; // 提前返回，不显示成功消息
                }
            }
            
            if (successes.length === 0 && errors.length > 0) {
                // 所有文件都失败了
                console.error('所有文件保存失败');
                return;
            }
            
            console.log('文件保存结果:', { 成功: successes.length, 失败: errors.length, 成功文件: successes });
        }
        
        if (resultEl) {
            const successCount = successes ? successes.length : uploadData.files?.length || 0;
            resultEl.textContent = `上传成功，共 ${successCount} 个文件`;
        }
        
        hideUploadModal();
        const successCount = successes ? successes.length : uploadData.files?.length || 0;
        if (successCount > 0) {
            alert(`上传成功，共 ${successCount} 个文件`);
        }
        
            // 重新加载文件数据并刷新当前视图
        if (window.learningPlatform) {
                console.log('重新加载文件数据...');
            await window.learningPlatform.loadFileData();
                // 确保当前视图已刷新
                window.learningPlatform.refreshCurrentView();
                
                // 根据当前页面刷新相应的内容
                if (window.learningPlatform.currentSection === 'resources') {
                    console.log('当前在资源页面，重新加载资源内容');
                    window.learningPlatform.loadResourceContent();
                } else if (window.learningPlatform.currentSection === 'textbooks') {
                    console.log('当前在教材页面，重新加载教材内容');
                    window.learningPlatform.loadTextbookContent();
                } else if (window.learningPlatform.currentSection === 'lessonPlans') {
                    console.log('当前在教案页面，重新加载教案内容');
                    window.learningPlatform.loadLessonPlanContent();
                }
                
                console.log('文件数据已刷新');
        }
    } catch (err) {
        console.error('上传失败:', err);
        alert('上传失败: ' + (err.message || '请检查服务器是否已启动 (npm start)'));
    }
}

// 根据文件名获取文件类型
function getFileTypeFromName(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
        'pdf': 'pdf',
        'doc': 'doc',
        'docx': 'docx',
        'txt': 'txt',
        'jpg': 'jpg',
        'jpeg': 'jpeg',
        'png': 'png',
        'gif': 'gif',
        'mp4': 'video',
        'avi': 'video',
        'mp3': 'audio',
        'wav': 'audio',
        'zip': 'zip',
        'rar': 'rar'
    };
    return typeMap[ext] || 'file';
}

// 根据文件类型获取图标类名
function getIconClassFromFileType(fileType) {
    const iconMap = {
        'pdf': 'file-pdf',
        'doc': 'file-word',
        'docx': 'file-word',
        'txt': 'file-alt',
        'jpg': 'file-image',
        'jpeg': 'file-image',
        'png': 'file-image',
        'gif': 'file-image',
        'video': 'file-video',
        'mp4': 'file-video',
        'avi': 'file-video',
        'audio': 'file-audio',
        'mp3': 'file-audio',
        'wav': 'file-audio',
        'zip': 'file-archive',
        'rar': 'file-archive'
    };
    return iconMap[fileType.toLowerCase()] || 'file';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + 'B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + 'KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }
}

// 文件删除功能 - 确保在全局作用域
window.deleteFile = async function deleteFile(category, fileId, fileName) {
    // 显示确认对话框
    const confirmed = confirm(`确定要删除文件 "${fileName}" 吗？\n\n此操作将：\n1. 从服务器删除实际文件\n2. 从数据库中删除文件记录\n\n此操作无法撤销！`);
    
    if (!confirmed) {
        return;
    }
    
    try {
        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        
        console.log('删除文件请求:', { category, fileId, fileName });
        
        const resp = await fetch(`${apiBase}/upload/delete-file/${category}/${fileId}`, {
            method: 'DELETE'
        });
        
        if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({ error: '删除失败' }));
            throw new Error(errorData.error || errorData.message || '删除失败');
        }
        
        const data = await resp.json();
        
        if (data.success) {
            // 显示成功提示
            if (window.learningPlatform && window.learningPlatform.showNotification) {
                window.learningPlatform.showNotification('文件删除成功', 'success');
            } else {
            alert('删除成功');
            }
            
            console.log('文件删除成功，刷新数据...');
            
            // 重新加载文件数据并刷新当前视图
            if (window.learningPlatform) {
                await window.learningPlatform.loadFileData();
                
                // 确保当前视图已刷新
                window.learningPlatform.refreshCurrentView();
                
                // 如果当前在资源页面，强制重新加载资源内容
                if (window.learningPlatform.currentSection === 'resources') {
                    window.learningPlatform.loadResourceContent();
                }
            }
        } else {
            throw new Error(data.error || '删除失败');
        }
    } catch (error) {
        console.error('删除文件失败:', error);
        const errorMessage = error.message || '删除失败，请检查服务器是否已启动';
        
        // 显示错误提示
        if (window.learningPlatform && window.learningPlatform.showNotification) {
            window.learningPlatform.showNotification(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
    }
}

// 文件查看功能
function viewFile(category, fileId) {
    alert('查看功能待实现');
}

// 文件下载功能
function downloadFile(category, fileId, fileName) {
    alert('下载功能待实现');
}

// 历史对话相关全局函数
function showChatHistory(chatType) {
    if (window.learningPlatform) {
        window.learningPlatform.showChatHistoryModal(chatType);
    }
}

function hideChatHistory() {
    const modal = document.getElementById('chatHistoryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function loadHistorySession(sessionId, chatType) {
    if (window.learningPlatform) {
        window.learningPlatform.loadHistorySession(sessionId, chatType);
    }
}

function clearAllHistory() {
    if (window.learningPlatform) {
        window.learningPlatform.clearAllChatHistory();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const isEmbed = params.get('embed') === '1' || params.get('embed') === 'true';
    const targetSection = params.get('section');

    // 若 embed 模式，跳过登录校验并应用样式覆盖
    if (!isEmbed) {
        const currentStudentId = localStorage.getItem('currentStudentId');
        if (!currentStudentId) {
            alert('请先登录');
            window.location.href = 'index.html';
            return;
        }
    }

    // 初始化学习平台
    window.learningPlatform = new LearningPlatform();

    // embed 模式样式覆盖与定位
    if (isEmbed) {
        const style = document.createElement('style');
        style.textContent = `
            .top-navbar, .sidebar { display: none !important; }
            .content-area { margin-left: 0 !important; }
            .content-section { height: auto !important; }
            body { background: #fff !important; }
        `;
        document.head.appendChild(style);
        // 显示指定 section（默认 myTutor）
        const section = targetSection || 'myTutor';
        if (typeof window.learningPlatform.showSection === 'function') {
            window.learningPlatform.showSection(section);
        }
    }

    // 更新DeepSeek状态
    if (window.learningPlatform.updateDeepSeekStatus) {
        window.learningPlatform.updateDeepSeekStatus();
    }

    // 点击外部关闭下拉菜单
    document.addEventListener('click', function(e) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        
        if (userMenu && dropdown && !userMenu.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// 备课助手相关全局函数
function generateLessonPlan() {
    if (window.learningPlatform) {
        window.learningPlatform.generateLessonPlan();
    }
}

function resetLessonPlanForm() {
    if (window.learningPlatform) {
        window.learningPlatform.resetLessonPlanForm();
    }
}

function saveLessonPlan() {
    if (window.learningPlatform) {
        window.learningPlatform.saveLessonPlan();
    }
}

function downloadLessonPlan() {
    if (window.learningPlatform) {
        window.learningPlatform.downloadLessonPlan();
    }
}

function editLessonPlan() {
    if (window.learningPlatform) {
        window.learningPlatform.editLessonPlan();
    }
}

function showLessonPlanHistory() {
    if (window.learningPlatform) {
        window.learningPlatform.showLessonPlanHistory();
    }
}

// Padlet-学生课程功能（按学科分类）
// 当前选中的学科和教学周
let currentPadletCourseSubject = null;
let currentPadletCourseWeek = 1;
const TOTAL_WEEKS = 13; // 总教学周数

// 初始化Padlet课程视图
function initPadletCourseView() {
    // 获取学科列表
    const subjects = getUniqueSubjects();
    
    // 生成学科标签
    generateSubjectTabs(subjects);
    
    // 如果已有选中的学科，保持选中状态；否则选择第一个
    if (subjects.length > 0) {
        if (!currentPadletCourseSubject) {
            currentPadletCourseSubject = subjects[0];
        }
        selectSubject(currentPadletCourseSubject);
    } else {
        // 没有学科时显示空状态
        const contentDiv = document.getElementById('padlet-course-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>暂无课程文件</p>
                    <p style="font-size: 14px; margin-top: 8px;">请上传文件后查看</p>
                </div>
            `;
        }
    }
}

// 获取唯一的学科列表
function getUniqueSubjects() {
    const platform = window.learningPlatform;
    if (!platform) return [];
    
    const textbookData = platform.textbookData || [];
    const lessonPlanData = platform.lessonPlanData || [];
    
    // 从教材和教案的subject字段中提取学科信息
    const subjects = new Set();
    
    textbookData.forEach(item => {
        if (item.subject) {
            subjects.add(item.subject);
        }
    });
    
    lessonPlanData.forEach(item => {
        if (item.subject) {
            subjects.add(item.subject);
        }
    });
    
    // 不再使用默认假学科，如果没有数据则返回空数组
    // 这样用户看到的就是空状态提示
    
    return Array.from(subjects);
}

// 生成学科标签
function generateSubjectTabs(subjects) {
    const subjectTabs = document.getElementById('subject-tabs');
    if (!subjectTabs) return;
    
    let html = '';
    subjects.forEach(subject => {
        html += `<button class="btn btn-secondary subject-tab" onclick="selectSubject('${subject}')">${subject}</button>`;
    });
    
    subjectTabs.innerHTML = html;
}

// 选择学科
function selectSubject(subject) {
    currentPadletCourseSubject = subject;
    
    // 更新学科标签样式
    const subjectTabs = document.querySelectorAll('.subject-tab');
    subjectTabs.forEach(tab => {
        if (tab.textContent === subject) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 生成教学周标签
    generateWeekTabs();
    
    // 默认选择第1周
    currentPadletCourseWeek = 1;
    selectWeek(1);
}

// 生成教学周标签（Week1-Week13）
function generateWeekTabs() {
    const weekTabs = document.getElementById('week-tabs');
    if (!weekTabs) return;
    
    let html = '';
    for (let week = 1; week <= TOTAL_WEEKS; week++) {
        html += `<button class="btn btn-secondary week-tab" onclick="selectWeek(${week})">Week${week}</button>`;
    }
    
    weekTabs.innerHTML = html;
}

// 选择教学周
function selectWeek(week) {
    currentPadletCourseWeek = week;
    
    // 更新教学周标签样式
    const weekTabs = document.querySelectorAll('.week-tab');
    weekTabs.forEach(tab => {
        if (tab.textContent === `Week${week}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 加载该学科该周的课程数据
    loadPadletCourseData();
}

// 加载Padlet课程数据（按学科和教学周）
function loadPadletCourseData() {
    const contentDiv = document.getElementById('padlet-course-content');
    if (!contentDiv) return;
    
    if (!currentPadletCourseSubject) {
        contentDiv.innerHTML = '<div class="empty-message" style="padding: 40px; text-align: center; color: #6b7280;">请选择学科</div>';
        return;
    }
    
    const platform = window.learningPlatform;
    if (!platform) return;
    
    const textbookData = platform.textbookData || [];
    const lessonPlanData = platform.lessonPlanData || [];
    
    // 筛选当前学科和当前周的数据
    const weekData = [
        ...textbookData.filter(item => 
            item.week === currentPadletCourseWeek && 
            item.subject === currentPadletCourseSubject
        ).map(item => ({...item, category: '教材'})),
        ...lessonPlanData.filter(item => 
            item.week === currentPadletCourseWeek && 
            item.subject === currentPadletCourseSubject
        ).map(item => ({...item, category: '教案'}))
    ];
    
    // 如果没有数据，显示空状态
    if (weekData.length === 0) {
        contentDiv.innerHTML = `
            <div style="padding: 60px 20px; text-align: center; color: #6b7280;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p>第${currentPadletCourseWeek}周暂无课程资料</p>
                <p style="font-size: 14px; margin-top: 8px;">请上传文件后查看</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="file-list">';
    html += '<div class="file-list-header">';
    html += '<div class="file-name">文件名</div>';
    html += '<div class="file-type">类型</div>';
    html += '<div class="file-size">大小</div>';
    html += '<div class="file-date">上传时间</div>';
    html += '<div class="file-actions-header">操作</div>';
    html += '</div>';
    
    if (weekData.length === 0) {
        html += `<div class="empty-message" style="padding: 40px; text-align: center; color: #6b7280;">${currentPadletCourseSubject} - Week${currentPadletCourseWeek} 暂无课程资料</div>`;
    } else {
        weekData.forEach(item => {
            html += generateFileListItem(item);
        });
    }
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

// 课表上传功能
let scheduleFiles = []; // 存储课表文件

function uploadSchedule() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileData = {
                id: Date.now(),
                name: file.name,
                type: file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'IMAGE' : 'DOC',
                size: (file.size / 1024).toFixed(1) + 'KB',
                date: new Date().toISOString().split('T')[0],
                file: file
            };
            
            scheduleFiles.push(fileData);
            renderScheduleFiles();
            
            if (window.learningPlatform) {
                window.learningPlatform.showNotification('课表上传成功！', 'success');
            }
        }
    };
    input.click();
}

// 渲染课表文件列表
function renderScheduleFiles() {
    const contentDiv = document.getElementById('schedule-file-list');
    if (!contentDiv) return;
    
    let html = '<div class="file-list">';
    html += '<div class="file-list-header">';
    html += '<div class="file-name">文件名</div>';
    html += '<div class="file-type">类型</div>';
    html += '<div class="file-size">大小</div>';
    html += '<div class="file-date">上传时间</div>';
    html += '<div class="file-actions-header">操作</div>';
    html += '</div>';
    
    if (scheduleFiles.length === 0) {
        html += '<div class="empty-message" style="padding: 40px; text-align: center; color: #6b7280;">暂无课表文件</div>';
    } else {
        scheduleFiles.forEach(item => {
            html += generateScheduleFileItem(item);
        });
    }
    
    html += '</div>';
    contentDiv.innerHTML = html;
}

// 生成课表文件项HTML
function generateScheduleFileItem(item) {
    const fileIcon = item.type === 'PDF' ? 'fa-file-pdf' : item.type === 'IMAGE' ? 'fa-file-image' : 'fa-file-alt';
    
    return `
        <div class="file-list-item" data-id="${item.id}">
            <div class="file-name">
                <div class="file-icon">
                    <i class="fas ${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <h4>${item.name}</h4>
                </div>
            </div>
            <div class="file-type">${item.type}</div>
            <div class="file-size">${item.size}</div>
            <div class="file-date">${item.date}</div>
            <div class="file-actions">
                <button class="btn btn-sm" onclick="previewScheduleFile(${item.id})" title="预览">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm" onclick="deleteScheduleFile(${item.id})" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// 预览课表文件
function previewScheduleFile(id) {
    const file = scheduleFiles.find(f => f.id === id);
    if (file && file.file) {
        const url = URL.createObjectURL(file.file);
        window.open(url, '_blank');
    }
}

// 删除课表文件
function deleteScheduleFile(id) {
    scheduleFiles = scheduleFiles.filter(f => f.id !== id);
    renderScheduleFiles();
}

// 生成文件列表项HTML
function generateFileListItem(item) {
    const platform = window.learningPlatform;
    const fileIconClass = platform ? platform.getFileIconClass(item.type) : 'fas fa-file';
    const bgClass = platform ? platform.getFileIconBgClass(item.type) : 'file-default';
    const category = item.category || '';
    
    return `
        <div class="file-list-item" data-category="${category}" data-week="${item.week || 0}">
            <div class="file-name">
                <div class="file-icon ${bgClass}">
                    <i class="${fileIconClass}"></i>
                </div>
                <div class="file-details">
                    <h4>${item.name}</h4>
                    <div class="file-tags">
                        <span class="tag">${category}</span>
                        ${item.tags ? item.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
            <div class="file-type">${item.type}</div>
            <div class="file-size">${item.size}</div>
            <div class="file-date">${item.date}</div>
            <div class="file-actions">
                <button class="btn btn-primary btn-sm" title="查看">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary btn-sm" title="下载">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `;
}

// Padlet-学生卡片点击函数
function openStudyCalendar() {
    // 确保在personalProfile页面
    const currentSection = document.getElementById('personalProfile');
    if (!currentSection || !currentSection.classList.contains('active')) {
        console.log('请先进入Padlet-学生页面');
        return;
    }
    
    const cardsSection = document.querySelector('#personalProfile .explore-cards');
    const contentSection = document.getElementById('study-calendar-content');
    
    if (cardsSection && contentSection) {
        cardsSection.style.display = 'none';
        contentSection.style.display = 'block';
    }
}

function openLearningLog() {
    // 确保在personalProfile页面
    const currentSection = document.getElementById('personalProfile');
    if (!currentSection || !currentSection.classList.contains('active')) {
        console.log('请先进入Padlet-学生页面');
        return;
    }
    
    const cardsSection = document.querySelector('#personalProfile .explore-cards');
    const contentSection = document.getElementById('learning-log-content');
    
    if (cardsSection && contentSection) {
        cardsSection.style.display = 'none';
        contentSection.style.display = 'block';
    }
}

// ========== 新建我的专业导师 ==========
function openCreateTutorModal() {
    const modal = document.getElementById('createTutorModal');
    const result = document.getElementById('createTutorResult');
    if (result) result.style.display = 'none';
    if (modal) modal.style.display = 'flex';
}

function closeCreateTutorModal() {
    const modal = document.getElementById('createTutorModal');
    if (modal) modal.style.display = 'none';
}

function importLatestUploadedText() {
    const el = document.getElementById('tutorFileContext');
    if (!el) return;
    const text = window.latestUploadedExtractedText || '';
    if (!text) {
        alert('没有可导入的文本，请先通过“上传并提取”上传文件。');
        return;
    }
    el.value = (el.value ? el.value + '\n\n' : '') + text;
}

async function submitCreateTutor() {
    try {
        const name = (document.getElementById('tutorName')?.value || '').trim();
        const subject = (document.getElementById('tutorSubject')?.value || '').trim();
        const goal = (document.getElementById('tutorGoal')?.value || '').trim();
        const note = (document.getElementById('tutorNote')?.value || '').trim();
        const fileContext = (document.getElementById('tutorFileContext')?.value || '').trim();
        
        if (!name || !subject) {
            alert('请填写导师名称和学科/领域');
            return;
        }
        
        const systemPrompt = `你是一位专业的学科导师，名称为“${name}”，擅长领域：${subject}。请根据用户的目标提供结构化、步骤清晰、可执行的指导。${goal ? '用户的目标：' + goal + '。' : ''}${note ? '补充背景：' + note : ''}`;
        
        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        const resp = await fetch(`${apiBase}/deepseek/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: goal ? `请结合我的目标“${goal}”给出详细行动建议。` : '请给出本周的个性化学习建议与行动清单。' }
                ],
                fileContext: fileContext
            })
        });
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(text || '请求失败');
        }
        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content || JSON.stringify(data);
        const resultBox = document.getElementById('createTutorResult');
        const answerEl = document.getElementById('createTutorAnswer');
        if (answerEl) answerEl.textContent = content;
        if (resultBox) resultBox.style.display = 'block';

        // 保存导师配置到后端
        try {
            const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
            await fetch(`${apiBase}/tutors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subject, goal, note, fileContext })
            });
        } catch (e) {
            console.warn('保存导师到后端失败（不影响当前回答展示）:', e);
        }
    } catch (e) {
        alert('创建失败：' + (e.message || '未知错误'));
        console.error(e);
    }
}

function openExistingTutorModal() {
    const modal = document.getElementById('existingTutorModal');
    if (modal) modal.style.display = 'flex';
    loadExistingTutors();
}

function closeExistingTutorModal() {
    const modal = document.getElementById('existingTutorModal');
    if (modal) modal.style.display = 'none';
}

let selectedTutorId = null;
function loadExistingTutors() {
    const listEl = document.getElementById('tutorList');
    if (!listEl) return;
    (async () => {
        try {
            const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
            const resp = await fetch(`${apiBase}/tutors`);
            const data = await resp.json();
            const list = data?.tutors || [];
            if (list.length === 0) {
                listEl.innerHTML = '<div class="empty-resource-state"><i class="fas fa-inbox"></i><p>暂无已保存的导师</p><p class="empty-hint">请先创建一个导师</p></div>';
                selectedTutorId = null;
                return;
            }
            let html = '<div class="file-list-header"><div class="file-name">导师</div><div class="file-type">学科</div><div class="file-date">创建时间</div><div class="file-actions-header">操作</div></div>';
            list.forEach(t => {
                html += `<div class=\"file-list-item\" data-id=\"${t.id}\">\n                    <div class=\"file-name\"><strong>${t.name}</strong></div>\n                    <div class=\"file-type\">${t.subject || '-'}</div>\n                    <div class=\"file-date\">${new Date(t.createdAt).toLocaleString()}</div>\n                    <div class=\"file-actions\">\n                        <button class=\"btn btn-secondary btn-sm\" onclick=\"selectTutorItem('${t.id}')\"><i class=\"fas fa-check\"></i> 选择</button>\n                        <button class=\"btn btn-primary btn-sm\" onclick=\"editTutor('${t.id}')\"><i class=\"fas fa-pen\"></i></button>\n                        <button class=\"btn btn-danger btn-sm\" onclick=\"deleteTutor('${t.id}')\"><i class=\"fas fa-trash\"></i></button>\n                    </div>\n                </div>`;
            });
            listEl.innerHTML = html;
            selectedTutorId = list[0].id;
        } catch (e) {
            console.error('加载导师失败:', e);
            listEl.innerHTML = '<div class="empty-resource-state"><i class="fas fa-exclamation-circle"></i><p>加载失败</p></div>';
        }
    })();
}

function selectTutorItem(id) {
    selectedTutorId = id;
    const items = document.querySelectorAll('#tutorList .file-list-item');
    items.forEach(el => {
        if (el.getAttribute('data-id') === id) el.classList.add('active'); else el.classList.remove('active');
    });
}

async function startQnAWithSelectedTutor() {
    try {
        if (!selectedTutorId) {
            alert('请先选择一个导师');
            return;
        }
        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        const listResp = await fetch(`${apiBase}/tutors`);
        const listData = await listResp.json();
        const tutor = (listData?.tutors || []).find(t => t.id === selectedTutorId);
        if (!tutor) {
            alert('未找到导师');
            return;
        }
        const question = (document.getElementById('existingTutorQuestion')?.value || '').trim() || '请给出本周的个性化学习建议与行动清单。';
        const systemPrompt = `你是一位专业的学科导师，名称为“${tutor.name}”，擅长领域：${tutor.subject}。请根据用户的目标提供结构化、步骤清晰、可执行的指导。${tutor.goal ? '用户的目标：' + tutor.goal + '。' : ''}${tutor.note ? '补充背景：' + tutor.note : ''}`;
        const resp = await fetch(`${apiBase}/deepseek/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: question } ],
                fileContext: tutor.fileContext || ''
            })
        });
        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content || JSON.stringify(data);
        closeExistingTutorModal();
        // 复用创建弹窗展示结果
        openCreateTutorModal();
        const resultBox = document.getElementById('createTutorResult');
        const answerEl = document.getElementById('createTutorAnswer');
        if (answerEl) answerEl.textContent = content;
        if (resultBox) resultBox.style.display = 'block';
    } catch (e) {
        alert('请求失败：' + (e.message || '未知错误'));
        console.error(e);
    }
}

// 编辑/删除（管理）
async function editTutor(id) {
    try {
        const name = prompt('新的导师名称');
        if (name === null) return;
        const subject = prompt('新的学科/领域');
        if (subject === null) return;
        const goal = prompt('新的指导目标（可留空）') || '';
        const note = prompt('新的备注（可留空）') || '';
        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        const resp = await fetch(`${apiBase}/tutors/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, subject, goal, note })
        });
        if (!resp.ok) throw new Error('更新失败');
        loadExistingTutors();
    } catch (e) {
        alert('更新失败：' + (e.message || '未知错误'));
    }
}

async function deleteTutor(id) {
    if (!confirm('确定删除该导师吗？此操作不可撤销。')) return;
    try {
        const apiBase = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        const resp = await fetch(`${apiBase}/tutors/${id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('删除失败');
        loadExistingTutors();
    } catch (e) {
        alert('删除失败：' + (e.message || '未知错误'));
    }
}

function openSchedule() {
    // 确保在personalProfile页面
    const currentSection = document.getElementById('personalProfile');
    if (!currentSection || !currentSection.classList.contains('active')) {
        console.log('请先进入Padlet-学生页面');
        return;
    }
    
    const cardsSection = document.querySelector('#personalProfile .explore-cards');
    const contentSection = document.getElementById('schedule-content');
    
    if (cardsSection && contentSection) {
        cardsSection.style.display = 'none';
        contentSection.style.display = 'block';
        renderScheduleFiles();
    }
}

function openCourses() {
    // 确保在personalProfile页面
    const currentSection = document.getElementById('personalProfile');
    if (!currentSection || !currentSection.classList.contains('active')) {
        console.log('请先进入Padlet-学生页面');
        return;
    }
    
    const cardsSection = document.querySelector('#personalProfile .explore-cards');
    const contentSection = document.getElementById('courses-content');
    
    if (cardsSection && contentSection) {
        cardsSection.style.display = 'none';
        contentSection.style.display = 'block';
        
        // 初始化课程内容
        if (window.learningPlatform) {
            window.learningPlatform.initPadletCourses();
        }
    }
}

function goBackToPadletModules() {
    // 显示卡片区域（仅在personalProfile页面）
    const currentSection = document.getElementById('personalProfile');
    const cardsSection = currentSection ? currentSection.querySelector('.explore-cards') : null;
    
    if (cardsSection) {
        cardsSection.style.display = 'grid';
    } else {
        // 如果在其他区域，查找所有explore-cards
        const allCardsSections = document.querySelectorAll('.explore-cards');
        allCardsSections.forEach(section => {
            section.style.display = 'grid';
        });
    }
    
    // 隐藏所有详细内容
    const contentSections = ['study-calendar-content', 'learning-log-content', 'schedule-content', 'courses-content'];
    contentSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
}

// 文件上传相关函数
// 存储已选择的文件
let selectedFiles = [];

// 更新已选文件数量显示
function updateSelectedFilesCount() {
    const countElement = document.getElementById('selectedFilesCount');
    if (countElement) {
        countElement.textContent = `已选择：${selectedFiles.length} 个文件`;
    }
}

function toggleFileUpload() {
    const modal = document.getElementById('fileUploadModal');
    if (modal) {
        modal.style.display = 'flex';
        // 重置到新上传标签
        switchUploadTab('new');
        // 更新文件数量
        updateSelectedFilesCount();
    }
}

function closeFileUploadModal() {
    const modal = document.getElementById('fileUploadModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // 清空已选择的文件
    selectedFiles = [];
    const fileList = document.getElementById('myTutorNewFileList');
    if (fileList) {
        fileList.innerHTML = '';
    }
    // 重置文件输入
    const fileInput = document.getElementById('myTutorFileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    // 重置标签到新上传
    switchUploadTab('new');
}

async function confirmFileUpload() {
    if (selectedFiles.length === 0) {
        alert('请先选择文件');
        return;
    }
    
    console.log('已选择的文件:', selectedFiles);
    
    // 只上传新选择的文件
    const newFiles = selectedFiles.filter(f => f.source === 'new' && f.file);
    
    if (newFiles.length === 0) {
        // 只选择了已有文件，不需要上传
        const fileNames = selectedFiles.map((f) => f.name).join(', ');
        alert(`已附加 ${selectedFiles.length} 个文件：\n${fileNames}`);
        closeFileUploadModal();
        return;
    }
    
    // 创建FormData对象
    const formData = new FormData();
    newFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
    });
    
    // 显示上传进度
    const uploadBtn = document.querySelector('.file-upload-modal .modal-footer .btn-primary');
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上传中...';
    }
    
    try {
        const base = (location.origin && location.origin.startsWith('http') ? location.origin : 'http://localhost:3000') + '/api';
        const response = await fetch(`${base}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 保存提取的文本内容到全局变量
            window.uploadedFilesContext = result.extractedText || '';
            window.uploadedFiles = selectedFiles.map(f => ({ name: f.name, size: f.size }));
            
            const fileNames = selectedFiles.map((f) => f.name).join(', ');
            alert(`成功上传 ${result.files.length} 个文件：\n${fileNames}\n\n文件内容已解析，现在可以向导师提问！`);
            
            // 显示上传的文件标签
            showUploadedFilesBadge();
        } else {
            throw new Error(result.error || '上传失败');
        }
    } catch (error) {
        console.error('文件上传失败:', error);
        alert('文件上传失败: ' + error.message);
    } finally {
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-check"></i> 确认';
        }
    }
    
    // 关闭弹窗
    closeFileUploadModal();
}

function switchUploadTab(type) {
    const newUpload = document.getElementById('newUpload');
    const existingUpload = document.getElementById('existingUpload');
    const tabs = document.querySelectorAll('.upload-tab');
    
    tabs.forEach((tab, index) => {
        if ((type === 'new' && index === 0) || (type === 'existing' && index === 1)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    if (type === 'new') {
        newUpload.style.display = 'block';
        existingUpload.style.display = 'none';
    } else {
        newUpload.style.display = 'none';
        existingUpload.style.display = 'block';
        loadExistingFiles('textbooks');
    }
}

function switchFileSource(type) {
    const tabs = document.querySelectorAll('.source-tab');
    tabs.forEach((tab, index) => {
        if ((type === 'textbooks' && index === 0) || (type === 'lessonPlans' && index === 1) || (type === 'resources' && index === 2)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    loadExistingFiles(type);
}

async function loadExistingFiles(type) {
    const fileList = document.getElementById('existingFilesList');
    if (!fileList) return;
    
    fileList.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">正在加载文件...</p>';
    
    try {
        let apiUrl = '';
        let dataKey = '';
        
        // 根据类型确定API端点和数据键
        if (type === 'textbooks') {
            apiUrl = '/api/materials';
            dataKey = 'materials';
        } else if (type === 'lessonPlans') {
            apiUrl = '/api/lesson-plans';
            dataKey = 'lessonPlans';
        } else if (type === 'resources') {
            apiUrl = '/api/resources';
            dataKey = 'resources';
        } else {
            fileList.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">未知的文件类型</p>';
            return;
        }
        
        // 从API加载真实数据
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('加载文件列表失败');
        }
        
        const data = await response.json();
        const files = data[dataKey] || [];
        
        if (files.length === 0) {
            fileList.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">暂无文件</p>';
            return;
        }
        
        // 渲染文件列表
        fileList.innerHTML = files.map(file => {
            // 根据文件类型选择图标
            const fileType = (file.fileType || '').toLowerCase();
            let iconClass = 'fa-file';
            if (fileType === 'pdf') iconClass = 'fa-file-pdf';
            else if (fileType === 'docx' || fileType === 'doc') iconClass = 'fa-file-word';
            else if (fileType === 'video' || fileType === 'mp4') iconClass = 'fa-file-video';
            else if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'image') iconClass = 'fa-file-image';
            else if (fileType === 'audio' || fileType === 'mp3') iconClass = 'fa-file-audio';
            else if (fileType === 'zip' || fileType === 'rar') iconClass = 'fa-file-archive';
            
            const fileName = file.title || file.name || '未命名文件';
            const fileSize = file.size || '0MB';
            
            return `
            <div class="file-item" data-file-id="${file.id}" onclick="selectExistingFile(${file.id}, '${fileName.replace(/'/g, "\\'")}')">
                <i class="fas ${iconClass}"></i>
                <div class="file-info">
                    <div class="file-name">${fileName}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
            </div>
        `;
        }).join('');
        
    } catch (error) {
        console.error('加载文件列表失败:', error);
        fileList.innerHTML = '<p style="text-align:center;padding:20px;color:#dc2626;">加载失败，请重试</p>';
    }
}

function selectExistingFile(id, name) {
    const fileItem = document.querySelector(`#existingFilesList .file-item[data-file-id="${id}"]`);
    if (!fileItem) return;
    
    // 检查文件是否已选择
    const isSelected = fileItem.style.borderColor === 'rgb(102, 126, 234)';
    
    if (isSelected) {
        // 取消选择
        fileItem.style.borderColor = '';
        fileItem.style.backgroundColor = '';
        fileItem.style.border = '';
        
        // 从数组中移除
        selectedFiles = selectedFiles.filter(f => !(f.id === id && f.source === 'existing'));
    } else {
        // 选择文件
        fileItem.style.borderColor = '#667eea';
        fileItem.style.backgroundColor = '#f0f4ff';
        fileItem.style.border = '2px solid #667eea';
        
        // 添加到数组
        const file = { id, name, size: '未知大小', source: 'existing' };
        selectedFiles.push(file);
    }
    
    // 更新文件数量
    updateSelectedFilesCount();
    console.log('已选择文件:', selectedFiles);
}

function handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const fileList = document.getElementById('myTutorNewFileList');
    if (!fileList) return;
    
    Array.from(files).forEach((file, index) => {
        // 添加到文件数组
        selectedFiles.push({ file, name: file.name, size: file.size, source: 'new' });
        
        // 创建文件项
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item-uploaded';
        fileItem.setAttribute('data-file-index', selectedFiles.length - 1);
        fileItem.innerHTML = `
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button class="btn-remove" onclick="removeFile(${selectedFiles.length - 1})">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileList.appendChild(fileItem);
    });
    
    // 更新文件数量
    updateSelectedFilesCount();
}

function removeFile(index) {
    // 从数组中移除
    selectedFiles.splice(index, 1);
    
    // 从DOM中移除
    const fileList = document.getElementById('myTutorNewFileList');
    if (fileList) {
        fileList.innerHTML = '';
        // 重新渲染文件列表
        selectedFiles.forEach((item, idx) => {
            if (item.source === 'new') {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item-uploaded';
                fileItem.setAttribute('data-file-index', idx);
                fileItem.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span class="file-name">${item.name}</span>
                    <span class="file-size">${formatFileSize(item.size)}</span>
                    <button class="btn-remove" onclick="removeFile(${idx})">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                fileList.appendChild(fileItem);
            }
        });
    }
    
    // 更新文件数量
    updateSelectedFilesCount();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 显示已上传的文件标签
function showUploadedFilesBadge() {
    // 查找或创建已上传文件显示的容器
    let badgeContainer = document.getElementById('uploadedFilesBadge');
    if (!badgeContainer) {
        const inputWrapper = document.querySelector('#myTutor .input-wrapper');
        if (inputWrapper) {
            badgeContainer = document.createElement('div');
            badgeContainer.id = 'uploadedFilesBadge';
            badgeContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; padding: 10px; background: #f0f4ff; border-radius: 8px;';
            inputWrapper.insertAdjacentElement('beforebegin', badgeContainer);
        }
    }
    
    if (!badgeContainer || !window.uploadedFiles) return;
    
    // 显示已上传的文件
    badgeContainer.innerHTML = '<span style="color: #667eea; font-weight: 600; margin-right: auto;"><i class="fas fa-paperclip"></i> 已附加文件：</span>' +
        window.uploadedFiles.map(file => 
            `<span style="background: white; padding: 4px 12px; border-radius: 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fas fa-file"></i> ${file.name}
                <button onclick="removeUploadedFile('${file.name}')" style="background: none; border: none; color: #999; cursor: pointer; margin-left: 4px;">
                    <i class="fas fa-times"></i>
                </button>
            </span>`
        ).join('');
}

// 移除已上传的文件
function removeUploadedFile(fileName) {
    if (!window.uploadedFiles) return;
    
    // 从数组中移除
    window.uploadedFiles = window.uploadedFiles.filter(f => f.name !== fileName);
    
    // 如果所有文件都被移除，清空上下文
    if (window.uploadedFiles.length === 0) {
        window.uploadedFilesContext = '';
        const badgeContainer = document.getElementById('uploadedFilesBadge');
        if (badgeContainer) {
            badgeContainer.remove();
        }
    } else {
        // 更新显示
        showUploadedFilesBadge();
    }
}

// 资源管理相关全局函数

// 搜索资源
function filterResources() {
    if (window.learningPlatform) {
        window.learningPlatform.loadResourceContent();
    }
}

// 清空搜索
function clearResourceSearch() {
    const searchInput = document.getElementById('resourceSearch');
    if (searchInput) {
        searchInput.value = '';
        filterResources();
    }
}

// 按类型筛选资源
function filterResourcesByType(type) {
    window.currentResourceFilter = type;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === type) {
            btn.classList.add('active');
        }
    });
    
    // 重新加载内容
    if (window.learningPlatform) {
        window.learningPlatform.loadResourceContent();
    }
}

// 查看资源
function viewResource(id) {
    console.log('查看资源:', id);
    if (window.learningPlatform) {
        window.learningPlatform.showNotification(`正在打开资源 ${id}`, 'info');
    }
    // TODO: 实现文件查看功能
}

// 下载资源
function downloadResource(id) {
    console.log('下载资源:', id);
    if (window.learningPlatform) {
        window.learningPlatform.showNotification(`正在下载资源 ${id}`, 'info');
    }
    // TODO: 实现文件下载功能
}

// 触发资源上传（点击上传区域时）
function triggerResourceUpload() {
    uploadFile('resource');
}

// 处理资源拖放
function handleResourceDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.backgroundColor = '#f0f4ff';
}

// 处理资源拖放离开
function handleResourceDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.backgroundColor = '';
}

// 处理资源拖放放下
function handleResourceDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.backgroundColor = '';
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        // 暂时通过触发文件选择器来处理拖放的文件
        // 更好的方式是将文件直接传递给uploadFile函数
        uploadFile('resource');
        // TODO: 实现直接处理拖放文件的功能
    }
}

// ========== 教材相关函数 ==========

// 触发教材上传
function triggerTextbookUpload() {
    uploadFile('textbook');
}

// 处理教材拖放
function handleTextbookDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.backgroundColor = '#f0f4ff';
}

function handleTextbookDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.backgroundColor = '';
}

function handleTextbookDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.backgroundColor = '';
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        uploadFile('textbook');
    }
}

// 搜索教材
function filterTextbooks() {
    if (window.learningPlatform) {
        window.learningPlatform.loadTextbookContent();
    }
}

// 按类型筛选教材
function filterTextbooksByType(type) {
    window.currentTextbookFilter = type;
    
    // 更新按钮状态
    document.querySelectorAll('#textbooks .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === type) {
            btn.classList.add('active');
        }
    });
    
    // 重新加载内容
    if (window.learningPlatform) {
        window.learningPlatform.loadTextbookContent();
    }
}

// 清空教材搜索
function clearTextbookSearch() {
    const searchInput = document.getElementById('textbookSearch');
    if (searchInput) {
        searchInput.value = '';
        filterTextbooks();
    }
}

// ========== 教案相关函数 ==========

// 触发教案上传
function triggerLessonPlanUpload() {
    uploadFile('lessonPlan');
}

// 处理教案拖放
function handleLessonPlanDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.backgroundColor = '#f0f4ff';
}

function handleLessonPlanDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.backgroundColor = '';
}

function handleLessonPlanDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const uploadArea = event.currentTarget;
    uploadArea.style.borderColor = '#cbd5e1';
    uploadArea.style.backgroundColor = '';
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        uploadFile('lessonPlan');
    }
}

// 搜索教案
function filterLessonPlans() {
    if (window.learningPlatform) {
        window.learningPlatform.loadLessonPlanContent();
    }
}

// 按类型筛选教案
function filterLessonPlansByType(type) {
    window.currentLessonPlanFilter = type;
    
    // 更新按钮状态
    document.querySelectorAll('#lessonPlans .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === type) {
            btn.classList.add('active');
        }
    });
    
    // 重新加载内容
    if (window.learningPlatform) {
        window.learningPlatform.loadLessonPlanContent();
    }
}

// 清空教案搜索
function clearLessonPlanSearch() {
    const searchInput = document.getElementById('lessonPlanSearch');
    if (searchInput) {
        searchInput.value = '';
        filterLessonPlans();
    }
}

// 导出供外部使用
window.LearningPlatform = LearningPlatform;