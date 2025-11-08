import React, { useState, useEffect } from 'react';
import { SHADER_TEMPLATES, getTemplate } from '../../scene/materials/shaderTemplates';
import './ShaderEditorPanel.css';

/**
 * ShaderEditorPanel - UI for editing custom shaders in real-time
 * Allows users to select templates and edit vertex/fragment shaders
 */
export function ShaderEditorPanel({
  surfaceId,
  initialShaderData,
  onApply,
  onClose
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('BLANK');
  const [vertexShader, setVertexShader] = useState('');
  const [fragmentShader, setFragmentShader] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('fragment'); // 'vertex' or 'fragment'

  // Initialize with existing shader data or blank template
  useEffect(() => {
    if (initialShaderData) {
      setVertexShader(initialShaderData.vertexShader);
      setFragmentShader(initialShaderData.fragmentShader);
    } else {
      const template = getTemplate('BLANK');
      setVertexShader(template.vertexShader);
      setFragmentShader(template.fragmentShader);
    }
  }, [initialShaderData]);

  // Handle template selection
  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    const template = getTemplate(templateName);
    setVertexShader(template.vertexShader);
    setFragmentShader(template.fragmentShader);
    setError(null);
  };

  // Handle apply button
  const handleApply = () => {
    const shaderData = {
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0.0 }
      }
    };

    onApply(shaderData);
  };

  // Handle live preview (optional - apply changes as user types)
  const handleLivePreview = () => {
    handleApply();
  };

  return (
    <div className="shader-editor-overlay">
      <div className="shader-editor-panel">
        <div className="shader-editor-header">
          <h2>Shader Editor</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Template Selector */}
        <div className="template-selector">
          <label>
            <strong>Template:</strong>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              {Object.keys(SHADER_TEMPLATES).map((key) => (
                <option key={key} value={key}>
                  {SHADER_TEMPLATES[key].name}
                </option>
              ))}
            </select>
          </label>
          <p className="template-description">
            {SHADER_TEMPLATES[selectedTemplate]?.description}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="shader-tabs">
          <button
            className={`shader-tab ${activeTab === 'vertex' ? 'active' : ''}`}
            onClick={() => setActiveTab('vertex')}
          >
            Vertex Shader
          </button>
          <button
            className={`shader-tab ${activeTab === 'fragment' ? 'active' : ''}`}
            onClick={() => setActiveTab('fragment')}
          >
            Fragment Shader
          </button>
        </div>

        {/* Shader Code Editors */}
        <div className="shader-editors">
          {activeTab === 'vertex' && (
            <div className="editor-container">
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
            <div className="editor-container">
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

        {/* Error Display */}
        {error && (
          <div className="shader-error">
            <strong>Shader Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="shader-editor-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleLivePreview}>
            Live Preview
          </button>
          <button className="btn-primary" onClick={handleApply}>
            Apply Shader
          </button>
        </div>

        {/* Help Text */}
        <div className="shader-help">
          <details>
            <summary>Shader Help</summary>
            <div className="help-content">
              <h4>Available Uniforms:</h4>
              <ul>
                <li><code>uniform float time;</code> - Animation time (auto-incremented)</li>
              </ul>

              <h4>Available Varyings (from vertex shader):</h4>
              <ul>
                <li><code>varying vec2 vUv;</code> - Texture coordinates (0.0 to 1.0)</li>
              </ul>

              <h4>Vertex Shader Outputs:</h4>
              <ul>
                <li><code>gl_Position</code> - Vertex position (required)</li>
              </ul>

              <h4>Fragment Shader Outputs:</h4>
              <ul>
                <li><code>gl_FragColor</code> - Fragment color (required)</li>
              </ul>

              <h4>Tips:</h4>
              <ul>
                <li>Use <code>vUv</code> for position-based effects (0,0 = bottom-left, 1,1 = top-right)</li>
                <li>Use <code>time</code> uniform for animations</li>
                <li>Colors are in range 0.0 to 1.0</li>
                <li>Press "Live Preview" to see changes immediately</li>
                <li>Compilation errors will show magenta (pink) on the surface</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
