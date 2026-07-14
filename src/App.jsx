import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Plus, 
  Trash2, 
  Download, 
  RefreshCw, 
  Sliders, 
  FileText, 
  HelpCircle,
  Sparkles,
  Clipboard,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_FROM = `From,
Aaral
8940436789
No 12 pandian street
Cit Nagar east
Nandanam
Chennai _600035`;

const DEFAULT_RECIPIENT_INPUT = `To,
Name - Girish

Door no- 65

Full address with Landmark-
no.65 V.O.C street, Nandhavana
Mettur, Avadi Chennai -600071
Landmark : Sri Krishna temple

Pincode- 600071

Two phone number: 7401373919
6381278473

---

To
Balaji
No.45/9 Vadivelu main Street
Perambur Chennai-11
9283762392

---

To
HEMANT CHOPDA
CO MAHAVEER CHAND
SANTOS KUMAR JWELLERS
HALWAI LINE NEAR PUNJAB
JWELLERS RAIPUR CG PIN
492001
9926934070

---

To,
Nagarajan M
No 269 C kalyanapuram 2nd
street Vyasarpadi chennai-600039
Ph(8608170160/8610026020)
+91 86081 70160`;

export default function App() {
  // --- State ---
  const [fromAddress, setFromAddress] = useState(() => {
    const saved = localStorage.getItem('label_from_address_v2');
    return saved !== null ? saved : DEFAULT_FROM;
  });

  const [recipients, setRecipients] = useState(() => {
    const saved = localStorage.getItem('label_recipients_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [bulkInput, setBulkInput] = useState('');
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'print'
  const [parseSuccessMsg, setParseSuccessMsg] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('label_from_address_v2', fromAddress);
  }, [fromAddress]);

  useEffect(() => {
    localStorage.setItem('label_recipients_v2', JSON.stringify(recipients));
  }, [recipients]);

  // --- Handlers ---
  const handleRecipientChange = (id, text) => {
    setRecipients(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, text };
      }
      return item;
    }));
  };

  const deleteRecipient = (id) => {
    setRecipients(prev => prev.filter(item => item.id !== id));
  };

  const addEmptyRecipient = () => {
    const newCard = {
      id: Math.random().toString(36).substring(2, 9),
      text: 'To,\n'
    };
    setRecipients(prev => [...prev, newCard]);
  };

  const clearAllRecipients = () => {
    if (window.confirm('Are you sure you want to clear all recipient labels?')) {
      setRecipients([]);
      localStorage.removeItem('label_recipients_v2');
    }
  };

  // --- Adaptive Block Parser ---
  const handleParse = () => {
    if (!bulkInput.trim()) return;

    let blocks = [];

    // Case A: Separator line '---' is used
    if (bulkInput.includes('---')) {
      blocks = bulkInput.split(/(?:\r?\n\s*---\s*\r?\n)/).map(b => b.trim()).filter(Boolean);
    } 
    // Case B: Contains multiple lines starting with "To"
    else if ((bulkInput.match(/^to\b/im) || []).length > 1) {
      const lines = bulkInput.split(/\r?\n/);
      let currentBlock = [];
      lines.forEach((line) => {
        const trimmed = line.trim();
        // If we see a line starting with "To" (case insensitive) and already have lines, it's a new block
        if (/^to\b/i.test(trimmed) && currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n').trim());
          currentBlock = [];
        }
        currentBlock.push(line);
      });
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n').trim());
      }
    } 
    // Case C: Fallback to standard double blank line split
    else {
      blocks = bulkInput.split(/(?:\r?\n\s*\r?\n)/).map(b => b.trim()).filter(Boolean);
    }

    const parsedCards = blocks.map(block => ({
      id: Math.random().toString(36).substring(2, 9),
      text: block
    }));

    if (parsedCards.length > 0) {
      setRecipients(prev => [...prev, ...parsedCards]);
      setBulkInput('');
      setParseSuccessMsg(`Successfully imported ${parsedCards.length} label(s) matching your pasted format!`);
      setTimeout(() => setParseSuccessMsg(''), 4000);
    }
  };

  const loadExample = () => {
    setBulkInput(DEFAULT_RECIPIENT_INPUT);
  };

  // --- jsPDF Generation ---
  const generatePDF = () => {
    if (recipients.length === 0) {
      alert('Please add at least one recipient label before generating.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const cardWidth = 105;
    const cardHeight = 148.5;

    recipients.forEach((rec, index) => {
      const pageIndex = Math.floor(index / 4);
      const cardOnPage = index % 4;

      // Add page for subsequent sets of 4 labels
      if (pageIndex > 0 && cardOnPage === 0) {
        doc.addPage();
      }

      const col = cardOnPage % 2;
      const row = Math.floor(cardOnPage / 2);

      const xStart = col * cardWidth;
      const yStart = row * cardHeight;

      // 1. Draw solid black quadrant boundaries (0.3mm wide lines)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([], 0); // Solid borders
      doc.rect(xStart, yStart, cardWidth, cardHeight);

      // 2. Draw combined text block line-by-line continuously
      let currentY = yStart + 15;
      const fullText = `${rec.text || ''}\n\n${fromAddress || ''}`;
      const lines = fullText.split('\n');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      lines.forEach(line => {
        // Handle empty line height
        if (!line.trim()) {
          currentY += 5;
          return;
        }

        const wrappedLines = doc.splitTextToSize(line, 81);
        doc.text(wrappedLines, xStart + 12, currentY);
        currentY += wrappedLines.length * 5;
      });
    });

    doc.save('labelcraft_shipping_labels.pdf');
  };

  // --- Pagination helper for print simulator ---
  const pagesCount = Math.ceil(recipients.length / 4) || 1;
  const pagesArray = Array.from({ length: pagesCount }, (_, i) => i);

  return (
    <div id="root">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="app-title">LabelCraft Pro</h1>
            <p className="app-subtitle">Bulk Shipping Label Creator (2x2 Grid A4)</p>
          </div>
        </div>
        <div className="control-actions">
          {recipients.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={clearAllRecipients}>
                <RefreshCw size={16} />
                Clear All
              </button>
              <button className="btn btn-primary" onClick={generatePDF}>
                <Download size={16} />
                Generate PDF ({recipients.length} Labels)
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="main-content">
        
        {/* Left Control Panel */}
        <section className="left-panel">
          
          {/* Sender Profile (From Address) */}
          <div className="panel-section">
            <h2 className="section-title">
              <Sliders size={18} className="text-secondary" />
              Sender Info (From)
            </h2>
            <div className="form-group">
              <label>Sender Address Format</label>
              <textarea 
                rows={7}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}
                value={fromAddress} 
                onChange={(e) => setFromAddress(e.target.value)}
                placeholder="From,&#10;Your Company Name&#10;Street Details&#10;Phone: XXXXXXXXXX"
              />
            </div>
          </div>

          {/* Bulk Addresses Paste Block */}
          <div className="panel-section">
            <h2 className="section-title">
              <Clipboard size={18} className="text-secondary" />
              Bulk Address Input
            </h2>
            <p className="help-text" style={{ marginBottom: '0.75rem' }}>
              Paste raw addresses exactly as you copied them. Separate each label block with <code>---</code> or a blank line.
            </p>
            <textarea
              className="bulk-textarea"
              placeholder="To,&#10;Recipient Name&#10;Street Address&#10;Phone Details&#10;&#10;---&#10;&#10;To&#10;Next Recipient&#10;..."
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
            />
            {parseSuccessMsg && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--success)', 
                marginTop: '0.5rem',
                fontWeight: '600'
              }}>
                <CheckCircle2 size={16} />
                {parseSuccessMsg}
              </div>
            )}
            <div className="action-row">
              <button className="btn btn-secondary btn-block" onClick={loadExample}>
                Load Example
              </button>
              <button className="btn btn-primary btn-block" onClick={handleParse} disabled={!bulkInput.trim()}>
                Parse & Add
              </button>
            </div>
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <HelpCircle size={14} /> Smart Layout Engine
              </h3>
              <p className="help-text">
                - Auto-splits bulk pastes cleanly into individual label cards.<br/>
                - Preserves all of your newlines, labels, landmarks, and numbers exactly as pasted.<br/>
                - Automatically highlights the "To," and "From," titles on the output PDF.
              </p>
            </div>
          </div>

        </section>

        {/* Right Output Panel */}
        <section className="right-panel">
          <div className="right-panel-header">
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
                onClick={() => setActiveTab('cards')}
              >
                <Sliders size={16} />
                Edit Labels ({recipients.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'print' ? 'active' : ''}`}
                onClick={() => setActiveTab('print')}
              >
                <FileText size={16} />
                A4 Print Preview
              </button>
            </div>
            <div>
              {activeTab === 'print' && recipients.length > 0 && (
                <span className="page-indicator">
                  Total: {pagesCount} A4 Page{pagesCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* TAB 1: CARD EDITOR */}
          {activeTab === 'cards' && (
            <div className="cards-grid">
              {recipients.map((rec, idx) => (
                <div key={rec.id} className="address-card" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <span className="card-index">Label #{idx + 1}</span>
                    <button 
                      className="btn btn-danger btn-icon-only" 
                      onClick={() => deleteRecipient(rec.id)}
                      title="Delete Label"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label>Label Content (Raw Text)</label>
                    <textarea 
                      style={{ flex: 1, minHeight: '180px', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}
                      value={rec.text}
                      onChange={(e) => handleRecipientChange(rec.id, e.target.value)}
                      placeholder="Enter address details exactly..."
                    />
                  </div>
                </div>
              ))}

              {/* Add card placeholder */}
              <div className="add-card-placeholder" onClick={addEmptyRecipient} style={{ minHeight: '280px' }}>
                <Plus size={32} />
                <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Add New Label</span>
              </div>
            </div>
          )}

          {/* TAB 2: A4 PRINT SIMULATOR */}
          {activeTab === 'print' && (
            <div className="print-simulator">
              {recipients.length === 0 ? (
                <div className="empty-state" style={{ width: '100%' }}>
                  <FileText size={48} className="empty-state-icon" />
                  <h3 className="empty-state-title">No Labels Added</h3>
                  <p>Paste address lists on the left pane and parse them to see the print preview.</p>
                </div>
              ) : (
                pagesArray.map(pageIdx => {
                  // Get up to 4 labels for this page
                  const startIdx = pageIdx * 4;
                  const pageLabels = recipients.slice(startIdx, startIdx + 4);

                  return (
                    <div key={pageIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="page-indicator">Page {pageIdx + 1} of {pagesCount}</div>
                      
                      {/* A4 Sheet Preview */}
                      <div className="a4-page-container">
                        {/* Renders 4 slots per A4 page */}
                        {Array.from({ length: 4 }).map((_, slotIdx) => {
                          const label = pageLabels[slotIdx];

                          if (!label) {
                            return (
                              <div key={slotIdx} className="a4-label" style={{ backgroundColor: '#fafafa' }}>
                                <div style={{ color: '#d1d5db', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '12px', fontStyle: 'italic' }}>
                                  Empty Slot
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={label.id} className="a4-label">
                              <div style={{ 
                                fontSize: '13.5px', 
                                color: '#000', 
                                whiteSpace: 'pre-wrap', 
                                fontFamily: 'var(--font-sans)', 
                                lineHeight: '1.45',
                                textAlign: 'left'
                              }}>
                                {label.text}
                                {'\n\n'}
                                {fromAddress}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </section>

      </main>
    </div>
  );
}
