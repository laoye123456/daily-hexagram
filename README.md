# 每日一卦 · Daily Hexagram

> 以《易经》之智慧，窥天命之玄机

一个基于 DeepSeek AI 的智能易经占卜工具，结合出生信息与出行方向，为用户提供卦象解读与出行建议。

## 功能特性

- 📝 输入姓名、出生日期时辰、手机号、出发地/目的地/出发时间
- 🔮 AI 驱动的易经卦象解读
- 🧧 古典东方美学界面设计
- 📱 响应式布局，适配手机与桌面端

## 快速开始

### 1. 安装依赖

```bash
cd daily-hexagram
npm install
```

### 2. 配置 DeepSeek API Key

编辑 `server/.env` 文件，填入你的 DeepSeek API Key：

```
DEEPSEEK_API_KEY=sk-your-api-key-here
```

获取 API Key：[https://platform.deepseek.com](https://platform.deepseek.com)

### 3. 启动服务器

```bash
npm start
```

服务器启动后访问：**http://localhost:3000**

## 项目结构

```
daily-hexagram/
├── server/
│   ├── server.js       # Express 后端服务
│   ├── .env            # 环境变量配置
│   └── .env.example    # 环境变量示例
├── public/
│   ├── index.html      # 主页面
│   ├── style.css       # 样式表
│   └── app.js          # 前端逻辑
├── package.json
└── README.md
```

## 技术栈

- **后端**：Node.js + Express
- **AI**：DeepSeek API (deepseek-chat)
- **前端**：原生 HTML/CSS/JavaScript（无框架依赖）
- **字体**：Noto Serif SC / 站酷小薇体 / 马善政楷书

## 设计理念

界面采用古典东方神秘主义风格：
- 深邃墨黑底色配金色/朱红点缀
- 水墨晕染背景效果
- 六十四卦符号装饰
- 书法意境字体

## 注意事项

- 每日一卦，心诚则灵
- 占卜结果仅供参考
- 请妥善保管 API Key，不要泄露给他人
