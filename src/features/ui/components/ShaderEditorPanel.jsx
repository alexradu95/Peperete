import React, { useState, useEffect } from 'react';
import { getAllTemplates, getTemplate } from '../../scene/materials/shaderTemplates';

/**
 * ShaderEditorPanel - UI for editing custom shaders in real-time
 */
export function ShaderEditorPanel({ surfaceId, initialShaderData, onApply, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState('BLANK');
  const [vertexShader, setVertexShader] = useState('');
  const [fragmentShader, setFragmentShader] = useState('');
  const [activeTab, setActiveTab] = useState('fragment'); // 'vertex' or 'fragment'
  const templates = getAllTemplates();

  // Initialize with existing shader data or blank template
  useEffect(() => {
    if (initialShaderData) {
      setVertexShader(initialShaderData.vertexShader || '');
      setFragmentShader(initialShaderData.fragmentShader || '');
    } else {
      const template = getTemplate('BLANK');
      setVertexShader(template.vertexShader);
      setFragmentShader(template.fragmentShader);
    }
  }, [initialShaderData]);

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = getTemplate(templateKey);
    setVertexShader(template.vertexShader);
    setFragmentShader(template.fragmentShader);
  };

  const handleApply = () => {
    onApply({
      vertexShader,
      fragmentShader,
      uniforms: { time: 0 }
    });
  };

  const handleLivePreview = () => {
    // Apply without closing the editor for live preview
    onApply({
      vertexShader,
      fragmentShader,
      uniforms: { time: 0 }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] animate-fadeIn" onClick={onClose}>
      <div className="bg-[#1e1e1e] text-[#d4d4d4] rounded-lg w-[90%] max-w-[1200px] h-[85vh] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center py-5 px-6 border-b border-[#3e3e3e]">
          <h2 className="m-0 text-xl font-semibold text-white">Shader Editor</h2>
          <button className="bg-transparent border-none text-[#d4d4d4] text-[32px] cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all leading-none hover:bg-[#3e3e3e] hover:text-white" onClick={onClose}>×</button>
        </div>

        <div className="py-4 px-6 border-b border-[#3e3e3e] flex gap-6 items-center flex-wrap">
          <div className="flex items-center gap-2 m-0">
            <label className="m-0 text-sm text-[#cccccc] font-medium">Template:</label>
            <select
              className="bg-[#2d2d2d] text-[#d4d4d4] border border-[#3e3e3e] hover:border-[#505050] focus:outline-none focus:border-[#007acc] px-3 py-1.5 rounded text-sm cursor-pointer min-w-[200px]"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {templates.map(template => (
                <option key={template.key} value={template.key}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 ml-auto">
            <button
              className={`bg-transparent ${activeTab === 'vertex' ? 'bg-[#252525] text-white border-b-2 border-b-[#007acc]' : 'text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white'} border-none px-4 py-2 rounded-t cursor-pointer text-sm font-medium transition-all`}
              onClick={() => setActiveTab('vertex')}
            >
              Vertex Shader
            </button>
            <button
              className={`bg-transparent ${activeTab === 'fragment' ? 'bg-[#252525] text-white border-b-2 border-b-[#007acc]' : 'text-[#cccccc] hover:bg-[#2d2d2d] hover:text-white'} border-none px-4 py-2 rounded-t cursor-pointer text-sm font-medium transition-all`}
              onClick={() => setActiveTab('fragment')}
            >
              Fragment Shader
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[#252525] custom-scrollbar">
          {activeTab === 'vertex' && (
            <div className="flex flex-col h-full">
              <label className="text-sm text-[#cccccc] mb-2 font-medium">Vertex Shader (GLSL)</label>
              <textarea
                className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] border border-[#3e3e3e] rounded p-4 font-['Consolas','Monaco','Courier_New',monospace] text-sm leading-relaxed resize-none outline-none whitespace-pre overflow-x-auto focus:border-[#007acc] focus:shadow-[0_0_0_2px_rgba(0,122,204,0.2)] selection:bg-[#264f78] custom-scrollbar"
                value={vertexShader}
                onChange={(e) => setVertexShader(e.target.value)}
                spellCheck={false}
                placeholder="Enter vertex shader code..."
              />
            </div>
          )}

          {activeTab === 'fragment' && (
            <div className="flex flex-col h-full">
              <label className="text-sm text-[#cccccc] mb-2 font-medium">Fragment Shader (GLSL)</label>
              <textarea
                className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] border border-[#3e3e3e] rounded p-4 font-['Consolas','Monaco','Courier_New',monospace] text-sm leading-relaxed resize-none outline-none whitespace-pre overflow-x-auto focus:border-[#007acc] focus:shadow-[0_0_0_2px_rgba(0,122,204,0.2)] selection:bg-[#264f78] custom-scrollbar"
                value={fragmentShader}
                onChange={(e) => setFragmentShader(e.target.value)}
                spellCheck={false}
                placeholder="Enter fragment shader code..."
              />
            </div>
          )}
        </div>

        <div className="px-6 border-t border-[#3e3e3e]">
          <details className="py-3">
            <summary className="cursor-pointer text-sm text-[#4ec9b0] hover:text-[#6dd4bd] font-medium select-none flex items-center gap-2">💡 Help & Tips</summary>
            <div className="mt-3 p-4 bg-[#2d2d2d] rounded text-[13px] leading-relaxed">
              <h4 className="my-3 first:mt-0 text-sm text-[#4ec9b0]">Available Uniforms:</h4>
              <ul className="m-0 mb-3 pl-5">
                <li className="my-1 text-[#cccccc]"><code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">uniform float time</code> - Animated time value (auto-updated)</li>
              </ul>

              <h4 className="my-3 first:mt-0 text-sm text-[#4ec9b0]">Available Varyings:</h4>
              <ul className="m-0 mb-3 pl-5">
                <li className="my-1 text-[#cccccc]"><code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">varying vec2 vUv</code> - UV coordinates (0.0 to 1.0)</li>
              </ul>

              <h4 className="my-3 first:mt-0 text-sm text-[#4ec9b0]">Vertex Shader Built-ins:</h4>
              <ul className="m-0 mb-3 pl-5">
                <li className="my-1 text-[#cccccc]"><code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">attribute vec3 position</code> - Vertex position</li>
                <li className="my-1 text-[#cccccc]"><code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">attribute vec2 uv</code> - UV coordinates</li>
                <li className="my-1 text-[#cccccc]"><code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">uniform mat4 projectionMatrix</code></li>
                <li className="my-1 text-[#cccccc]"><code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">uniform mat4 modelViewMatrix</code></li>
              </ul>

              <h4 className="my-3 first:mt-0 text-sm text-[#4ec9b0]">Tips:</h4>
              <ul className="m-0 mb-3 pl-5">
                <li className="my-1 text-[#cccccc]">Use "Live Preview" to see changes without closing the editor</li>
                <li className="my-1 text-[#cccccc]">Fragment shader sets the final color with <code className="bg-[#1e1e1e] px-1.5 py-0.5 rounded font-['Consolas','Monaco','Courier_New',monospace] text-xs text-[#ce9178]">gl_FragColor</code></li>
                <li className="my-1 text-[#cccccc]">Colors are vec4(r, g, b, a) with values from 0.0 to 1.0</li>
                <li className="my-1 text-[#cccccc]">If shader fails to compile, surface will show magenta color</li>
              </ul>
            </div>
          </details>
        </div>

        <div className="py-4 px-6 border-t border-[#3e3e3e] flex gap-3 justify-end">
          <button className="px-5 py-2.5 border-none rounded text-sm font-medium cursor-pointer transition-all bg-[#0e639c] hover:bg-[#1177bb] text-white" onClick={handleLivePreview}>
            🔄 Live Preview
          </button>
          <button className="px-5 py-2.5 border-none rounded text-sm font-medium cursor-pointer transition-all bg-[#0e7a0d] hover:bg-[#13a10e] text-white" onClick={handleApply}>
            ✓ Apply Shader
          </button>
          <button className="px-5 py-2.5 border-none rounded text-sm font-medium cursor-pointer transition-all bg-[#3e3e3e] hover:bg-[#505050] hover:text-white text-[#d4d4d4]" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
