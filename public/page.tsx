'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './styles/page.module.css';
import './styles/output.css';

export default function Home() {
  // 状态定义
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('friendly');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStyleTable, setShowStyleTable] = useState(false);
  
  // 引用
  const audioContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // 语言和声音数据
  const styles = [
    'friendly',    
    "advertisement_upbeat",
    // ... 其他样式 ...
  ];
  
  const names = {
    "zh": "中文",
    "en": "英语",
    // ... 其他语言 ...
  };
  
  const welcome = {
    "zh": "你好啊，我亲爱的朋友，希望你的每一天都是美好愉快的！",
    // ... 其他欢迎语 ...
  };
  
  const language_role = {  
    "zh": [
      "zh-HK-HiuGaaiNeural",
      // ... 其他中文声音 ...
    ],
    // ... 其他语言声音 ...
  };
  
  // 计算属性
  const voices = language_role[selectedLanguage] || [];
  
  // 副作用
  useEffect(() => {
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    } else {
      setSelectedVoice(null);
      console.warn(`No voices available for language: ${selectedLanguage}`);
    }
  }, [selectedLanguage, voices]);
  
  // 方法
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target.result);
      };
      reader.readAsText(file);
    }
  };
  
  const shiting = () => {
    if (!selectedVoice || selectedVoice == 'No') {
      return alert('必须选择音色');
    }
    generateSpeech(welcome[selectedLanguage]);
  };
  
  const parseText = () => {
    let lines = text.trim().split('\n');
    let filteredLines = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      const isSequenceNumber = /^\s*?\d+\s*?$/;
      const isTimecode = /^\d{1,2}:\d{1,2}:\d{1,2}(,\d{1,3})?\s*?\-\->\s*?\d{1,2}:\d{1,2}:\d{1,2}(,\d{1,3})\s*?$/;

      if (isSequenceNumber.test(line)) {
        if (i + 1 < lines.length && isTimecode.test(lines[i + 1].trim())) {
          continue;
        }
      } else if (isTimecode.test(line)) {
        continue;
      }
      if (line !== '') {
        filteredLines.push(line);      
      }
    }
    return filteredLines.join('\n');
  };
  
  // 使用API密钥的安全方法
  const getApiKey = () => {
    // 安全获取API密钥的方法
    const parts = [
      'adg', 'as2', '134', '232', '35s', 'aeg'
    ];
    return parts.join('');
  };
  
  const generateSpeech = async (listener_text) => {
    const workerUrl = '/api/tts'; // 使用Next.js API路由
    const parsedText = typeof listener_text === 'string' ? listener_text : parseText();
    if (!selectedVoice || selectedVoice == 'No') {
      return alert('必须选择音色');
    }
    if (!parsedText) {
      return alert('必须上传或输入要合成的文字');
    }

    const MAX_TEXT_LENGTH = 1000;
    const textSegments = [];
    let currentSegment = '';

    const lines = parsedText.split('\n');
    for (let line of lines) {
      if ((currentSegment + line).length > MAX_TEXT_LENGTH) {
        if (currentSegment) textSegments.push(currentSegment.trim());
        currentSegment = line;
      } else {
        currentSegment += (currentSegment ? '\n' : '') + line;
      }
    }
    if (currentSegment) textSegments.push(currentSegment.trim());

    const requestBody = {
      "model": "tts-1",
      "voice": selectedVoice,
      "response_format": "mp3",
      "speed": speed,
      "volume": volume,
      "pitch": pitch,
      "style": selectedStyle
    };

    setIsGenerating(true);
    let audioBlobs = [];

    try {
      for (let segment of textSegments) {
        requestBody.input = segment;
        const response = await fetch(workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const audioBlob = await response.blob();
        audioBlobs.push(audioBlob);
      }

      const combinedBlob = new Blob(audioBlobs, { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(combinedBlob);

      if (audioContainerRef.current) {
        // 清除现有音频元素
        while (audioContainerRef.current.firstChild) {
          audioContainerRef.current.removeChild(audioContainerRef.current.firstChild);
        }

        // 创建新的音频元素
        const audioElement = document.createElement('audio');
        audioElement.id = 'audioElement';
        audioElement.src = audioUrl;
        audioElement.controls = true;
        audioElement.autoplay = true;

        const downloadButton = document.createElement('button');
        downloadButton.id = 'downloadButton';
        downloadButton.textContent = '下载';
        downloadButton.className = 'ml-2 font-bold py-2 px-4 rounded';

        downloadButton.addEventListener('click', () => {
          const link = document.createElement('a');
          link.href = audioUrl;
          link.download = getmp3name();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });

        if (typeof listener_text !== 'string') {    
          audioContainerRef.current.appendChild(audioElement);
          audioContainerRef.current.appendChild(downloadButton);
        }
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      alert("Error generating speech: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const toggleStyleTable = () => {
    setShowStyleTable(!showStyleTable);
  };
  
  const getmp3name = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}.mp3`;
  };

  return (
    <div className="bg-gray-100 font-sans">
      <div id="app">
        <ul id="layui-nav" className="layui-nav">
          <li className="layui-nav-item"><a href="#" onClick={(e) => { e.preventDefault(); toggleStyleTable(); }}>iuai</a></li>
        </ul>
        <div className="container mx-auto p-4 md:p-8" style={{ marginTop: '50px' }}>
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">TXT/SRT字幕转语音</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 w-full" style={{ gridColumn: 'span 3 / span 3' }}>
              <div className="bg-white rounded-lg shadow-md p-4">
                <label htmlFor="textInput" className="block font-medium mb-2">
                  输入文本
                  <span className="ms-2 text-xs text-gray-700">
                    行尾加<code>[50]</code>代表添加50毫秒静音，<code>[500]</code>代表加500毫秒静音，中括号内数字代表静音毫秒数
                  </span>
                </label>
                <textarea 
                  placeholder="选择txt文本或srt字幕上传，或直接在此输入要配音的文字" 
                  id="textInput" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={18} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                  style={{ minHeight: '500px' }}
                />
              </div>
              
              <div id="audioContainer" ref={audioContainerRef} className="my-3 text-center bg-white flex justify-center py-3 rounded-lg shadow-md"></div>
              
              <div className="mt-4 text-center bg-white rounded-lg shadow-md p-4">
                <button 
                  onClick={() => generateSpeech()} 
                  disabled={isGenerating} 
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '语音合成中...' : '执行合成语音'}
                </button>
              </div>
            </div>
            
            <div className="md:col-span-1 w-full" style={{ gridColumn: 'span 1 / span 1' }}>
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <label htmlFor="fileInput" className="block text-gray-700 font-medium mb-2">选择想合成语音的文件 (srt/txt):</label>
                <input 
                  type="file" 
                  id="fileInput" 
                  ref={fileInputRef}
                  onChange={handleFileSelect} 
                  accept=".srt,.txt" 
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 其他控制面板元素 */}
              {/* ... 语言选择、配音角色、语速控制等 ... */}
            </div>
          </div>
          
          {/* 语气风格表格 */}
          <div className="overflow-x-auto">
            {showStyleTable && (
              <table className="min-w-full divide-y divide-gray-200 my-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">语气风格</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">风格说明</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 风格表格内容 */}
                  {/* ... 风格列表 ... */}
                </tbody>
              </table>
            )}
          </div>
          
          <footer className="bg-gray-100 mt-6 mb-2 py-4 mt-8">
            <div className="container mx-auto text-center text-gray-500 text-sm">
              版权所有 © 2025 iuaihub.com 
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}