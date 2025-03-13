import { NextResponse } from 'next/server';

// 从环境变量获取API密钥
const getApiKey = () => {
  // 在生产环境中，应该使用环境变量
  // return process.env.TTS_API_KEY;
  
  // 临时方案，将在生产环境中替换
  const parts = [
    'adg', 'as2', '134', '232', '35s', 'aeg'
  ];
  return parts.join('');
};

export async function POST(request) {
  try {
    const requestBody = await request.json();
    
    // 转发请求到实际的TTS API
    const response = await fetch('https://ttsapi.pyvideotrans.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    // 获取音频数据并返回
    const audioData = await response.arrayBuffer();
    
    // 返回音频数据
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mp3',
      },
    });
  } catch (error) {
    console.error('TTS API错误:', error);
    return NextResponse.json({ 
      error: '语音合成服务暂时不可用，请稍后再试' 
    }, { status: 500 });
  }
}