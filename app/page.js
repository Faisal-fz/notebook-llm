'use client'
import { useState, useRef } from 'react';
import { Upload, FileText, MessageSquare, Send, X, Copy, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function NotebookLLM() {
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pastedText, setPastedText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.type === 'application/pdf') {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('pdf', file);
          
          const response = await axios.post('/api/upload-pdf', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          const newDocument = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: 'pdf',
            size: file.size,
            status: 'uploaded',
            chunks: response.data.chunks
          };
          
          setDocuments(prev => [...prev, newDocument]);
          
        } catch (error) {
          console.error('Upload error:', error);
          alert('Error uploading PDF');
        } finally {
          setIsUploading(false);
        }
      } else {
        // Handle other file types (for display only)
        const newDocument = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'unsupported'
        };
        setDocuments(prev => [...prev, newDocument]);
      }
    }
  };

  const handlePasteText = async () => {
    if (pastedText.trim()) {
      setIsUploading(true);
      try {
        await axios.post('/api/indexing', { text: pastedText });
        
        const newDocument = {
          id: Date.now(),
          name: `Pasted Text ${documents.filter(d => d.type === 'text').length + 1}`,
          type: 'text',
          content: pastedText,
          size: pastedText.length,
          status: 'indexed'
        };
        
        setDocuments(prev => [...prev, newDocument]);
        setPastedText('');
        
      } catch (error) {
        console.error('Indexing error:', error);
        alert('Error indexing text');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', { 
        message: chatInput 
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded': return 'text-green-600 bg-green-50';
      case 'indexed': return 'text-blue-600 bg-blue-50';
      case 'unsupported': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded': return 'Uploaded & Indexed';
      case 'indexed': return 'Indexed';
      case 'unsupported': return 'Unsupported Format';
      default: return 'Processing';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Document Upload */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Document Chat</h1>
          <p className="text-gray-600">Upload documents or paste text to get started</p>
        </div>

        {/* Upload Section */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Upload Documents</h3>
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors ${
                isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Processing...</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF files supported</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Paste Text</h3>
            <div className="space-y-3">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your text content here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isUploading}
              />
              <button
                onClick={handlePasteText}
                disabled={!pastedText.trim() || isUploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Processing...' : 'Add Text'}
              </button>
            </div>
          </div>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Documents ({documents.length})</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {doc.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">
                            {doc.type === 'text' ? `${doc.size} chars` : formatFileSize(doc.size)}
                          </p>
                          {doc.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                              {getStatusText(doc.status)}
                            </span>
                          )}
                        </div>
                        {doc.chunks && (
                          <p className="text-xs text-gray-400">{doc.chunks} chunks indexed</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Chat with Your Documents
            </h2>
            {documents.length > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {documents.length} document{documents.length !== 1 ? 's' : ''} loaded
              </span>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg mb-2">Start a conversation</p>
              <p>Upload some documents and ask questions about them</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-500 text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                documents.length === 0
                  ? "Upload documents first to start chatting..."
                  : "Ask a question about your documents..."
              }
              disabled={documents.length === 0 || isLoading}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || documents.length === 0 || isLoading}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
