const express = require('express');
const path = require('path');
const { config } = require('dotenv');

// Load .env file
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// DeepSeek API proxy
app.post('/api/consult', async (req, res) => {
  const { name, birthDate, phone, departure, destination, departureTime } = req.body;

  // Validate required fields
  if (!name || !birthDate) {
    return res.status(400).json({ error: '姓名、出生日期是必填项' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 DeepSeek API Key，请在 .env 文件中设置 DEEPSEEK_API_KEY' });
  }

  // Build the prompt for DeepSeek
  const systemPrompt = `你是一位精通《易经》的命理大师，同时深谙王阳明心学。请根据用户提供的信息，运用易经智慧与心学哲学进行占卜解读。

【心学核心】
请将王阳明心学的核心思想融入占卜：
- 致良知：引导求测者相信内心本有的判断，莫向外求，占卜是印证内心，而非依赖外在指引
- 知行合一：提醒求测者"知"与"行"不可分割，知道机遇不等于抓住机遇，吉卦更需要行动去兑现
- 心外无物：占卜结果反映的是心境而非宿命，境由心造，出行顺利与否，根本在于心态
- 事上磨练：旅途中的小波折是修行的机会，不必畏惧变化，坦然应对即为得道
- 立志勤学：每次出行都是一次立志与践行的过程，鼓励求测者带着正念出发

请遵循以下规则：
1. 首先，根据出生年月日推算命局，简要说明命局特点
2. 根据出发地和目的地方向，结合出发日期，运用梅花易数起卦
3. 给出出行日期吉凶、出行工具的推荐
4. 利用易经和风水学，给出财运分析、出行遇见贵人的概率、贵人的外貌衣着
5. 利用易经和风水学，给出桃花运的机率、搭讪的成功率
6. 利用易经和风水学，给出出行工作的顺利程度
7. 利用易经和风水学，给出出行目的地天气、健康状态
8. 利用易经和风水学，给出出行目的地的美食
9. 最后，根据以上所有分析，给出一段精炼的小结，高度概括本次出行最核心的3-5个要点，并融入心学智慧
10. 语言风格：用大白话说，通俗易懂，像朋友聊天一样，但保留易经的专业性，不要文绉绉，适当融入心学的点睛之语
11. 每次占卜结果请附带一个"卦象符号"用Unicode符号表示

请以以下格式回复：
---
【出行日期吉凶】
（出行日期的吉凶判断与宜忌）

【出行工具建议】
（推荐的出行方式及理由）

【财运解读】
（出行期间的财运分析）

【遇见贵人的概率】
（遇见贵人的概率评估）

【贵人外貌及衣着】
（详细描述贵人外貌：脸型、眼神、神态、气质，以及衣着：颜色、款式、材质、配饰，用词生动、画面感强）

【桃花运机率】
（桃花运的机率分析）

【搭讪的成功率】
（搭讪的成功率及建议）

【工作的顺利程度】
（出行工作的顺利程度分析）

【目的地天气】
（目的地天气预测）

【健康状态】
（出行期间的健康状态提醒）

【目的地的美食】
（目的地的美食推荐）

【小结】
（精炼概括以上所有板块的核心要点，3-5句话，说清楚这次出行最重要的是什么、要注意什么）
---`;

  const userMessage = `求测者信息：
姓名：${name}
出生年月：${birthDate}
联系方式：${phone || '未提供'}
出发地：${departure || '未提供'}
目的地：${destination || '未提供'}
出发日期：${departureTime || '未提供'}

请为这位求测者进行一次出行占卜，预测此次出行的运势与吉凶。`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', response.status, errorData);
      return res.status(response.status).json({
        error: `DeepSeek API 请求失败 (${response.status})，请检查 API Key 是否正确`
      });
    }

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content;

    if (!reading) {
      return res.status(500).json({ error: 'DeepSeek 未返回有效结果，请稍后重试' });
    }

    res.json({
      success: true,
      reading: reading,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: '服务器内部错误：' + error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.DEEPSEEK_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║         每日一卦 · Daily Hexagram              ║
║           易经智慧 · AI 占卜                    ║
╠════════════════════════════════════════════════╣
║  🌐 服务器已启动                               ║
║  📍 http://localhost:${PORT}                      ║
║  💡 按 Ctrl+C 停止服务器                       ║
╚════════════════════════════════════════════════╝
  `);
  
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('⚠️  警告：未设置 DEEPSEEK_API_KEY');
    console.warn('   请在 server/.env 文件中添加：');
    console.warn('   DEEPSEEK_API_KEY=your_api_key_here');
    console.warn('   \n📋 获取 API Key：https://platform.deepseek.com\n');
  }
});
