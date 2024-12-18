// src/App.tsx
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './App.css'
import { ArrowLeft, ArrowRight, RotateCcw, Home } from 'lucide-react'

interface Tab {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
}

function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: 'about:blank', title: 'New Tab', isActive: true }
  ]);
  const [currentUrl, setCurrentUrl] = useState('');
  
  const handleNavigate = async (url: string) => {
    try {
      await invoke('navigate_to', { url });
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.isActive ? { ...tab, url } : tab
        )
      );
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  const handleNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: 'about:blank',
      title: 'New Tab',
      isActive: true
    };
    
    setTabs(prevTabs => 
      prevTabs.map(tab => ({ ...tab, isActive: false })).concat(newTab)
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUrl) {
      const processedUrl = currentUrl.startsWith('http') 
        ? currentUrl 
        : `https://${currentUrl}`;
      handleNavigate(processedUrl);
    }
  }

  return (
    <div className="browser-container">
      {/* Tab Bar at top */}
      <div className="browser-tabs">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className={`tab ${tab.isActive ? 'active' : ''}`}
            onClick={() => {
              setTabs(prevTabs => 
                prevTabs.map(t => ({ ...t, isActive: t.id === tab.id }))
              );
            }}
          >
            <span className="tab-title">{tab.title}</span>
            <button 
              className="close-tab"
              onClick={(e) => {
                e.stopPropagation();
                setTabs(prevTabs => prevTabs.filter(t => t.id !== tab.id));
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button className="new-tab" onClick={handleNewTab}>+</button>
      </div>
      
      {/* Main Content Area */}
      <div className="browser-content">
        {/* Browser view will be rendered here */}
      </div>
      
      {/* Navigation Bar at bottom */}
      <div className="browser-toolbar">
        <div className="nav-buttons">
          <button className="nav-button" onClick={() => invoke('go_back')}>
            <ArrowLeft size={20} />
          </button>
          <button className="nav-button" onClick={() => invoke('go_forward')}>
            <ArrowRight size={20} />
          </button>
          <button className="nav-button" onClick={() => invoke('refresh')}>
            <RotateCcw size={20} />
          </button>
          <button className="nav-button" onClick={() => handleNavigate('about:home')}>
            <Home size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="url-form">
          <input
            type="text"
            className="url-input"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            placeholder="Enter URL or search terms"
          />
        </form>
      </div>
    </div>
  )
}

export default App