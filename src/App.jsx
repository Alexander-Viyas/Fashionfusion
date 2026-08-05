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
  CheckCircle2,
  Settings,
  Type,
  Ruler,
  Maximize2,
  Printer
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
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'print' | 'settings'
  const [parseSuccessMsg, setParseSuccessMsg] = useState('');

  // settings state
  const [toFontSize, setToFontSize] = useState(() => {
    const saved = localStorage.getItem('label_to_font_size');
    return saved ? parseInt(saved, 10) : 12;
  });

  const [fromFontSize, setFromFontSize] = useState(() => {
    const saved = localStorage.getItem('label_from_font_size');
    return saved ? parseInt(saved, 10) : 10;
  });

  const [dividerStyle, setDividerStyle] = useState(() => {
    const saved = localStorage.getItem('label_divider_style');
    return saved !== null ? saved : 'solid';
  });

  const [showBarcode, setShowBarcode] = useState(() => {
    const saved = localStorage.getItem('label_show_barcode');
    return saved !== null ? saved === 'true' : true;
  });

  const [labelMargin, setLabelMargin] = useState(() => {
    const saved = localStorage.getItem('label_margin');
    return saved ? parseFloat(saved) : 0.3;
  });

  // border settings
  const [borderStyle, setBorderStyle] = useState(() => {
    const saved = localStorage.getItem('label_border_style');
    return saved !== null ? saved : 'solid';
  });

  const [borderWidth, setBorderWidth] = useState(() => {
    const saved = localStorage.getItem('label_border_width');
    return saved ? parseFloat(saved) : 1.5;
  });

  const [borderColor, setBorderColor] = useState(() => {
    const saved = localStorage.getItem('label_border_color');
    return saved !== null ? saved : '#000000';
  });

  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('label_logo_url') || null;
  });

  const [showLogo, setShowLogo] = useState(() => {
    const saved = localStorage.getItem('label_show_logo');
    return saved !== null ? saved === 'true' : false;
  });

  const [previewScale, setPreviewScale] = useState(1.0);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('label_from_address_v2', fromAddress);
  }, [fromAddress]);

  useEffect(() => {
    localStorage.setItem('label_recipients_v2', JSON.stringify(recipients));
  }, [recipients]);

  useEffect(() => {
    localStorage.setItem('label_to_font_size', toFontSize.toString());
  }, [toFontSize]);

  useEffect(() => {
    localStorage.setItem('label_from_font_size', fromFontSize.toString());
  }, [fromFontSize]);

  useEffect(() => {
    localStorage.setItem('label_divider_style', dividerStyle);
  }, [dividerStyle]);

  useEffect(() => {
    localStorage.setItem('label_show_barcode', showBarcode.toString());
  }, [showBarcode]);

  useEffect(() => {
    localStorage.setItem('label_margin', labelMargin.toString());
  }, [labelMargin]);

  useEffect(() => {
    localStorage.setItem('label_border_style', borderStyle);
  }, [borderStyle]);

  useEffect(() => {
    localStorage.setItem('label_border_width', borderWidth.toString());
  }, [borderWidth]);

  useEffect(() => {
    localStorage.setItem('label_border_color', borderColor);
  }, [borderColor]);

  useEffect(() => {
    if (logoUrl) {
      localStorage.setItem('label_logo_url', logoUrl);
    } else {
      localStorage.removeItem('label_logo_url');
    }
  }, [logoUrl]);

  useEffect(() => {
    localStorage.setItem('label_show_logo', showLogo.toString());
  }, [showLogo]);

  // --- Direct Print Handler ---
  const printLabels = () => {
    if (recipients.length === 0) {
      alert('Please add at least one recipient label before printing.');
      return;
    }
    window.print();
  };

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
      unit: 'in',
      format: [4, 6]
    });

    recipients.forEach((rec, index) => {
      // Add page for subsequent labels
      if (index > 0) {
        doc.addPage([4, 6]);
      }

      const printWidth = 4.0 - (2 * labelMargin);

      // Helper: parse hex color to RGB for jsPDF
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };
      const borderRgb = hexToRgb(borderColor);
      const borderWidthIn = borderWidth / 72; // convert pt to inches

      // 1. Draw outer label border (full 4"x6" rect)
      if (borderStyle !== 'none') {
        doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
        doc.setLineWidth(borderWidthIn);
        if (borderStyle === 'dashed') {
          doc.setLineDashPattern([0.15, 0.1], 0);
        } else if (borderStyle === 'dotted') {
          doc.setLineDashPattern([0.03, 0.06], 0);
        } else {
          doc.setLineDashPattern([], 0);
        }
        doc.rect(borderWidthIn / 2, borderWidthIn / 2, 4.0 - borderWidthIn, 6.0 - borderWidthIn);
      }

      // 2. Draw horizontal divider line at Y = 3.0 inches (exact midpoint)
      doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
      doc.setLineWidth(borderWidthIn * 0.8);
      
      if (dividerStyle === 'solid') {
        doc.setLineDashPattern([], 0);
        doc.line(0, 3.0, 4.0, 3.0);
      } else if (dividerStyle === 'dashed') {
        doc.setLineDashPattern([0.1, 0.08], 0);
        doc.line(0, 3.0, 4.0, 3.0);
      } else if (dividerStyle === 'dotted') {
        doc.setLineDashPattern([0.02, 0.04], 0);
        doc.line(0, 3.0, 4.0, 3.0);
      }

      // 2. Draw TO address in top half (0 to 3 inches)
      const toHeaderY = labelMargin + 0.15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(toFontSize + 2);
      doc.setTextColor(0, 0, 0);
      doc.text('TO:', labelMargin, toHeaderY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(toFontSize);
      const wrappedToLines = doc.splitTextToSize(rec.text || '', printWidth);
      const toLineHeight = (toFontSize * 1.25) / 72; // height in inches

      let currentToY = toHeaderY + toLineHeight + 0.05;
      wrappedToLines.forEach(line => {
        // Only render if it fits inside the top 3 inches (allowing for margin)
        if (currentToY < 3.0 - labelMargin) {
          doc.text(line, labelMargin, currentToY);
          currentToY += toLineHeight;
        }
      });

      // 3. Draw FROM address in bottom half (3 to 6 inches)
      const fromHeaderY = 3.0 + labelMargin + 0.15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fromFontSize + 2);
      doc.text('FROM:', labelMargin, fromHeaderY);

      // Draw logo in PDF if enabled
      if (showLogo && logoUrl) {
        let format = 'PNG';
        if (logoUrl.startsWith('data:image/jpeg') || logoUrl.startsWith('data:image/jpg')) {
          format = 'JPEG';
        }
        const logoH = 0.35;
        const logoW = 1.0;
        const logoX = 4.0 - labelMargin - logoW;
        const logoY = 3.0 + labelMargin + 0.03;
        try {
          doc.addImage(logoUrl, format, logoX, logoY, logoW, logoH);
        } catch (e) {
          console.error("Failed to add image to PDF", e);
        }
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fromFontSize);
      const wrappedFromLines = doc.splitTextToSize(fromAddress || '', printWidth);
      const fromLineHeight = (fromFontSize * 1.25) / 72; // height in inches

      let currentFromY = fromHeaderY + fromLineHeight + 0.05;
      const maxFromY = showBarcode ? 4.95 : (6.0 - labelMargin);
      
      wrappedFromLines.forEach(line => {
        // Only render if it fits inside the bottom half boundaries
        if (currentFromY < maxFromY) {
          doc.text(line, labelMargin, currentFromY);
          currentFromY += fromLineHeight;
        }
      });

      // 4. Draw mock barcode if enabled
      if (showBarcode) {
        const barcodeX = (4.0 - 2.2) / 2; // Centered
        const barcodeY = 5.1;
        const barcodeW = 2.2;
        const barcodeH = 0.45;

        doc.setFillColor(0, 0, 0);
        const numBars = 35;
        const barWidth = barcodeW / numBars;
        const pattern = [1, 2, 1, 3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1];

        let currentX = barcodeX;
        for (let i = 0; i < numBars; i++) {
          const widthFactor = pattern[i % pattern.length];
          const w = barWidth * (widthFactor / 2);
          if (i % 2 === 0) {
            doc.rect(currentX, barcodeY, w, barcodeH, 'F');
          }
          currentX += barWidth;
        }

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        const barcodeText = `*FASHION-${rec.id.toUpperCase()}*`;
        doc.text(barcodeText, 2.0, barcodeY + barcodeH + 0.12, { align: 'center' });
      }
    });

    doc.save('fashionfusion_shipping_labels.pdf');
  };

  // --- Pagination helper for print simulator ---
  const pagesCount = recipients.length || 1;

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
            <p className="app-subtitle">Bulk Shipping Label Creator (4"x6" Thermal Labels)</p>
          </div>
        </div>
        <div className="control-actions">
          {recipients.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={clearAllRecipients}>
                <RefreshCw size={16} />
                Clear All
              </button>
              <button className="btn btn-secondary" onClick={printLabels}>
                <Printer size={16} />
                Print Labels
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
                - Auto-splits bulk address lists cleanly into individual label cards.<br/>
                - Automatically highlights the "To," and "From," titles on the output PDF.<br/>
                - Preserves all formatting, phone numbers, and landmarks precisely.
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
                4"x6" Preview
              </button>
              <button 
                className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={16} />
                Settings
              </button>
            </div>
            <div>
              {activeTab === 'print' && recipients.length > 0 && (
                <span className="page-indicator">
                  Total: {pagesCount} Label{pagesCount > 1 ? 's' : ''} (4"x6" Thermal)
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

          {/* TAB 2: 4"x6" PRINT SIMULATOR */}
          {activeTab === 'print' && (
            <div className="print-simulator-new">
              {recipients.length === 0 ? (
                <div className="empty-state" style={{ width: '100%' }}>
                  <FileText size={48} className="empty-state-icon" />
                  <h3 className="empty-state-title">No Labels Added</h3>
                  <p>Paste address lists on the left pane and parse them to see the print preview.</p>
                </div>
              ) : (
                <>
                  <div className="preview-controls-row">
                    <span className="scale-label">Zoom: {Math.round(previewScale * 100)}%</span>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="1.5" 
                      step="0.1" 
                      value={previewScale} 
                      onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                      className="scale-slider"
                      style={{ width: '120px' }}
                    />
                    <button className="btn btn-secondary btn-icon-only" onClick={() => setPreviewScale(1.0)} title="Reset Zoom">
                      <Maximize2 size={14} />
                    </button>
                    <button className="btn btn-print" onClick={printLabels}>
                      <Printer size={15} />
                      Print All Labels
                    </button>
                  </div>
                  
                  <div className="labels-sequence-container">
                    {recipients.map((rec, idx) => {
                      const barcodeValue = `FASHION-${rec.id.toUpperCase()}`;
                      
                      const wrapperStyle = {
                        width: `${4.0 * previewScale}in`,
                        height: `${6.0 * previewScale}in`,
                        overflow: 'hidden',
                        display: 'inline-block',
                        boxShadow: 'var(--shadow-lg)',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        border: borderStyle === 'none'
                          ? 'none'
                          : `${borderWidth}px ${borderStyle} ${borderColor}`,
                        margin: '10px'
                      };

                      const labelStyle = {
                        width: '4.0in',
                        height: '6.0in',
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top left',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxSizing: 'border-box'
                      };

                      const toSectionStyle = {
                        height: '3.0in',
                        padding: `${labelMargin}in`,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        position: 'relative',
                        overflow: 'hidden',
                        fontSize: `${toFontSize}pt`,
                        lineHeight: '1.3',
                        color: '#000000'
                      };

                      const fromSectionStyle = {
                        height: '3.0in',
                        padding: `${labelMargin}in`,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        position: 'relative',
                        overflow: 'hidden',
                        fontSize: `${fromFontSize}pt`,
                        lineHeight: '1.3',
                        color: '#000000'
                      };

                      return (
                        <div key={rec.id} className="label-preview-page">
                          <div className="page-indicator">Label {idx + 1} of {pagesCount}</div>
                          <div style={wrapperStyle}>
                            <div style={labelStyle}>
                              {/* TO Section (Top 3 inches) */}
                              <div style={toSectionStyle}>
                                <div style={{ fontWeight: 'bold', fontSize: `${toFontSize + 2}pt`, marginBottom: '4px' }}>TO:</div>
                                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>{rec.text}</div>
                              </div>
                              
                              {/* Midpoint Split Divider */}
                              <div className={`divider-line divider-${dividerStyle}`}></div>
                              
                              {/* FROM Section (Bottom 3 inches) */}
                              <div style={fromSectionStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', width: '100%' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: `${fromFontSize + 2}pt` }}>FROM:</div>
                                  {showLogo && logoUrl && (
                                    <img src={logoUrl} alt="Logo" style={{ height: '0.4in', maxWidth: '1.2in', objectFit: 'contain' }} />
                                  )}
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>{fromAddress}</div>
                                
                                {/* Mock Barcode inside Bottom half */}
                                {showBarcode && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '0.15in',
                                    left: '0',
                                    right: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    pointerEvents: 'none'
                                  }}>
                                    <div style={{ display: 'flex', height: '0.45in', background: '#fff', alignItems: 'center' }}>
                                      {Array.from({ length: 35 }).map((_, bIdx) => {
                                        const pattern = [1, 2, 1, 3, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1];
                                        const wFactor = pattern[bIdx % pattern.length];
                                        const w = wFactor * 1.5;
                                        return (
                                          <div 
                                            key={bIdx} 
                                            style={{
                                              width: `${w}px`,
                                              height: '0.45in',
                                              backgroundColor: bIdx % 2 === 0 ? '#000000' : 'transparent',
                                              marginLeft: '1px'
                                            }}
                                          />
                                        );
                                      })}
                                    </div>
                                    <div style={{ fontSize: '8pt', fontFamily: 'monospace', marginTop: '2px', color: '#000' }}>
                                      {barcodeValue}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="settings-panel">
              <div className="panel-section">
                <h2 className="section-title">
                  <Settings size={18} className="text-secondary" />
                  Global Shipping Info
                </h2>
                <div className="form-group">
                  <label>Stable Sender Address (FROM)</label>
                  <p className="help-text" style={{ marginBottom: '0.5rem' }}>
                    This address is stable and will appear on the bottom half of every sequential printed label.
                  </p>
                  <textarea 
                    rows={6}
                    style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.4' }}
                    value={fromAddress} 
                    onChange={(e) => setFromAddress(e.target.value)}
                    placeholder="From,&#10;Your Company Name&#10;Street Details&#10;Phone: XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="panel-section" style={{ marginTop: '1.25rem' }}>
                <h2 className="section-title">
                  <Sliders size={18} className="text-secondary" />
                  Label Customization & Layout
                </h2>
                
                <div className="settings-grid">
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Type size={14} /> TO Font Size ({toFontSize}pt)
                    </label>
                    <input 
                      type="range" 
                      min="9" 
                      max="18" 
                      value={toFontSize} 
                      onChange={(e) => setToFontSize(parseInt(e.target.value, 10))}
                      className="slider"
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Type size={14} /> FROM Font Size ({fromFontSize}pt)
                    </label>
                    <input 
                      type="range" 
                      min="8" 
                      max="16" 
                      value={fromFontSize} 
                      onChange={(e) => setFromFontSize(parseInt(e.target.value, 10))}
                      className="slider"
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Ruler size={14} /> Label Margin ({labelMargin}in)
                    </label>
                    <select 
                      value={labelMargin} 
                      onChange={(e) => setLabelMargin(parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem' }}
                      className="select-margin"
                    >
                      <option value={0.2}>Compact (0.2 in)</option>
                      <option value={0.3}>Standard (0.3 in)</option>
                      <option value={0.4}>Wide (0.4 in)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Divider Line Style</label>
                    <div className="radio-group" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {['solid', 'dashed', 'dotted', 'none'].map((style) => (
                        <button
                          key={style}
                          type="button"
                          className={`btn btn-secondary ${dividerStyle === style ? 'btn-primary' : ''}`}
                          style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                          onClick={() => setDividerStyle(style)}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={showBarcode} 
                        onChange={(e) => setShowBarcode(e.target.checked)}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      Show Mock barcode & serial number on labels
                    </label>
                  </div>
                </div>
              </div>

              {/* Logo Settings Section */}
              <div className="panel-section" style={{ marginTop: '1.25rem' }}>
                <h2 className="section-title">
                  <Sparkles size={18} className="text-secondary" />
                  Logo Settings
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox" 
                      checked={showLogo} 
                      onChange={(e) => setShowLogo(e.target.checked)}
                      style={{ width: 'auto', cursor: 'pointer' }}
                    />
                    Enable logo on labels
                  </label>

                  {showLogo && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-app)' }}>
                      <label style={{ textTransform: 'none', fontSize: '0.85rem' }}>Upload Shop/Store Logo (PNG or JPEG)</label>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              alert("Please upload a logo smaller than 1MB to ensure browser storage capacity.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLogoUrl(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ fontSize: '0.8rem' }}
                      />

                      {logoUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <img src={logoUrl} alt="Logo preview" style={{ height: '40px', maxWidth: '100px', objectFit: 'contain' }} />
                          <button 
                            type="button" 
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setLogoUrl(null);
                            }}
                          >
                            Remove Logo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Border Settings Section */}
              <div className="panel-section" style={{ marginTop: '1.25rem' }}>
                <h2 className="section-title">
                  <Ruler size={18} className="text-secondary" />
                  Label Border
                </h2>
                <div className="settings-grid">
                  <div className="form-group">
                    <label>Border Style</label>
                    <div className="radio-group" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {['solid', 'dashed', 'dotted', 'none'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`btn ${borderStyle === s ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem', textTransform: 'capitalize', minWidth: '60px' }}
                          onClick={() => setBorderStyle(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Border Width ({borderWidth}px)</label>
                    <input
                      type="range"
                      min="0.5"
                      max="6"
                      step="0.5"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
                      className="slider"
                      disabled={borderStyle === 'none'}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Border Color</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      {['#000000', '#1a1a2e', '#374151', '#6366f1', '#ef4444', '#10b981'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => setBorderColor(color)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: borderColor === color ? '3px solid var(--primary)' : '2px solid transparent',
                            outline: borderColor === color ? '2px solid white' : 'none',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'var(--transition)'
                          }}
                        />
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          style={{ width: '36px', height: '32px', cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}
                          title="Custom color"
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{borderColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Border Preview */}
              <div className="panel-section" style={{ marginTop: '1.25rem' }}>
                <h2 className="section-title">
                  <FileText size={18} className="text-secondary" />
                  Border Preview
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '160px',
                    height: '240px',
                    backgroundColor: '#fff',
                    border: borderStyle === 'none' ? '1px dashed #ccc' : `${borderWidth}px ${borderStyle} ${borderColor}`,
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    <div style={{ flex: 1, padding: '8px', fontSize: '10px', color: '#222', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <strong style={{ fontSize: '11px' }}>TO:</strong>
                      <span style={{ opacity: 0.7 }}>Recipient Name</span>
                      <span style={{ opacity: 0.7 }}>Address Line 1</span>
                      <span style={{ opacity: 0.7 }}>City, State</span>
                    </div>
                    <div style={{
                      borderTop: dividerStyle === 'none' ? 'none' : `2px ${dividerStyle} ${borderColor}`,
                    }} />
                    <div style={{ flex: 1, padding: '8px', fontSize: '10px', color: '#222', display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '11px' }}>FROM:</strong>
                        {showLogo && logoUrl && (
                          <img src={logoUrl} alt="Logo preview" style={{ height: '18px', maxWidth: '50px', objectFit: 'contain' }} />
                        )}
                      </div>
                      <span style={{ opacity: 0.7 }}>Your Company</span>
                      <span style={{ opacity: 0.7 }}>Your Address</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          PRINT-ONLY LABEL CONTAINER
          Hidden on screen. Rendered by window.print() only.
          Each .pl maps to exactly one 4"x6" thermal page.
          ===================================================== */}
      <div id="print-labels-container" aria-hidden="true">
        {recipients.map((rec) => {
          const barcodePattern = [1,2,1,3,1,2,3,1,1,2,1,3,2,1,1,3,1,2,1,2,3,1,2,1,1,3,2,1,2,1,3,1,1,2,1];
          const barcodeValue = `FASHION-${rec.id.toUpperCase()}`;

          // Compute border CSS for the outer label box
          const outerBorder = borderStyle === 'none'
            ? 'none'
            : `${borderWidth}px ${borderStyle} ${borderColor}`;

          // Midpoint divider border CSS
          const dividerBorder = dividerStyle === 'none'
            ? 'none'
            : `${Math.max(1, borderWidth * 0.7)}px ${dividerStyle} ${borderColor}`;

          // Compute font sizes for print (pt → in ratio)
          const toFontPt = `${toFontSize}pt`;
          const fromFontPt = `${fromFontSize}pt`;
          const toTitlePt = `${toFontSize + 3}pt`;
          const fromTitlePt = `${fromFontSize + 3}pt`;
          const marginIn = `${labelMargin}in`;

          return (
            <div
              key={rec.id}
              className="pl"
              style={{ border: outerBorder }}
            >
              {/* TOP 3 INCHES — TO address */}
              <div
                className="pl-to"
                style={{ padding: marginIn }}
              >
                <span className="pl-section-title" style={{ fontSize: toTitlePt }}>TO:</span>
                <div className="pl-text" style={{ fontSize: toFontPt, lineHeight: 1.35, fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap' }}>{(rec.text || '').trim()}</div>
              </div>

              {/* DIVIDER at exact 3-inch midpoint */}
              <div
                className="pl-divider"
                style={{ borderTop: dividerBorder }}
              />

              {/* BOTTOM 3 INCHES — FROM address */}
              <div
                className="pl-from"
                style={{ padding: marginIn, paddingBottom: showBarcode ? '0.85in' : marginIn }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', width: '100%' }}>
                  <span className="pl-section-title" style={{ fontSize: fromTitlePt, margin: 0 }}>FROM:</span>
                  {showLogo && logoUrl && (
                    <img src={logoUrl} alt="Logo" style={{ height: '0.4in', maxWidth: '1.2in', objectFit: 'contain' }} />
                  )}
                </div>
                <div className="pl-text" style={{ fontSize: fromFontPt, lineHeight: 1.35, fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap' }}>{(fromAddress || '').trim()}</div>

                {showBarcode && (
                  <div className="pl-barcode-wrap">
                    <div className="pl-barcode-bars">
                      {barcodePattern.map((wFactor, bIdx) => (
                        <span
                          key={bIdx}
                          className="pl-bar"
                          style={{
                            width: `${wFactor * 4}px`,
                            backgroundColor: bIdx % 2 === 0 ? '#000000' : 'transparent',
                            marginRight: '1px'
                          }}
                        />
                      ))}
                    </div>
                    <span className="pl-barcode-text">{barcodeValue}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

