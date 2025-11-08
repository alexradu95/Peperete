import React, { useState, useEffect } from 'react';
import { getAllTemplates, getTemplate } from '../../scene/materials/shaderTemplates';
import './ShaderEditorPanel.css';

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
    <div className="shader-editor-overlay" onClick={onClose}>
      <div className="shader-editor-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shader-editor-header">
          <h2>Shader Editor</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="shader-editor-toolbar">
          <div className="form-group">
            <label>Template:</label>
            <select value={selectedTemplate} onChange={(e) => handleTemplateChange(e.target.value)}>
              {templates.map(template => (
                <option key={template.key} value={template.key}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="editor-tabs">
            <button
              className={`tab ${activeTab === 'vertex' ? 'active' : ''}`}
              onClick={() => setActiveTab('vertex')}
            >
              Vertex Shader
            </button>
            <button
              className={`tab ${activeTab === 'fragment' ? 'active' : ''}`}
              onClick={() => setActiveTab('fragment')}
            >
              Fragment Shader
            </button>
          </div>
        </div>

        <div className="shader-editor-content">
          {activeTab === 'vertex' && (
            <div className="editor-section">
              <label>Vertex Shader (GLSL)</label>
              <textarea
                className="shader-code-editor"
                value={vertexShader}
                onChange={(e) => setVertexShader(e.target.value)}
                spellCheck={false}
                placeholder="Enter vertex shader code..."
              />
            </div>
          )}

          {activeTab === 'fragment' && (
            <div className="editor-section">
              <label>Fragment Shader (GLSL)</label>
              <textarea
                className="shader-code-editor"
                value={fragmentShader}
                onChange={(e) => setFragmentShader(e.target.value)}
                spellCheck={false}
                placeholder="Enter fragment shader code..."
              />
            </div>
          )}
        </div>

        <div className="shader-editor-help">
          <details>
            <summary>💡 Help & Tips</summary>
            <div className="help-content">
              <h4>Available Uniforms:</h4>
              <ul>
                <li><code>uniform float time</code> - Animated time value (auto-updated)</li>
              </ul>

              <h4>Available Varyings:</h4>
              <ul>
                <li><code>varying vec2 vUv</code> - UV coordinates (0.0 to 1.0)</li>
              </ul>

              <h4>Vertex Shader Built-ins:</h4>
              <ul>
                <li><code>attribute vec3 position</code> - Vertex position</li>
                <li><code>attribute vec2 uv</code> - UV coordinates</li>
                <li><code>uniform mat4 projectionMatrix</code></li>
                <li><code>uniform mat4 modelViewMatrix</code></li>
              </ul>

              <h4>Tips:</h4>
              <ul>
                <li>Use "Live Preview" to see changes without closing the editor</li>
                <li>Fragment shader sets the final color with <code>gl_FragColor</code></li>
                <li>Colors are vec4(r, g, b, a) with values from 0.0 to 1.0</li>
                <li>If shader fails to compile, surface will show magenta color</li>
              </ul>
            </div>
          </details>
        </div>

        <div className="shader-editor-footer">
          <button className="btn-preview" onClick={handleLivePreview}>
            🔄 Live Preview
          </button>
          <button className="btn-apply" onClick={handleApply}>
            ✓ Apply Shader
          </button>
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
