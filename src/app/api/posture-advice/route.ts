import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = DEEPSEEK_BASE_URL.endsWith('/chat/completions')
  ? DEEPSEEK_BASE_URL
  : `${DEEPSEEK_BASE_URL.replace(/\/$/, '')}/v1/chat/completions`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issues, landmarks } = body;

    if (!issues || !Array.isArray(issues)) {
      return NextResponse.json(
        { error: 'Invalid request: issues array required' },
        { status: 400 }
      );
    }

    const issueDescriptions = issues
      .map((i: { type: string; message: string; severity: number }) => {
        const typeLabels: Record<string, string> = {
          slouch: '驼背/圆肩',
          shoulder_uneven: '双肩不平',
          body_tilt: '身体歪斜',
          head_forward: '头部前伸',
        };
        return `- ${typeLabels[i.type] || i.type}: ${i.message} (严重程度: ${Math.round(i.severity * 100)}%)`;
      })
      .join('\n');

    const prompt = `你是一位专业的体态矫正教练和盆底肌训练专家。用户正在做提肛（凯格尔）训练，系统检测到以下姿势问题：

${issueDescriptions}

${landmarks ? `关键骨骼点数据（参考）: ${JSON.stringify(landmarks)}` : ''}

请给出：
1. 简要指出当前姿势问题（1-2句话）
2. 给出3条具体的、可操作的矫正建议，用中文
3. 一句积极的鼓励

请以JSON格式回复：
{
  "issues": ["问题描述1"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "encouragement": "鼓励的话"
}`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的体态矫正教练和盆底肌康复训练专家。回复简洁实用，直接给出可执行的建议。只回复JSON格式。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI 服务暂时不可用 (${response.status})` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试解析 JSON 回复
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      // 如果不是 JSON，构造默认回复
      return NextResponse.json({
        issues: ['姿势需要调整'],
        suggestions: ['请保持背部挺直', '放松双肩，保持水平', '收下巴，头部向后靠'],
        encouragement: '坚持训练，每一次都在进步！',
      });
    }
  } catch (error) {
    console.error('Posture advice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
