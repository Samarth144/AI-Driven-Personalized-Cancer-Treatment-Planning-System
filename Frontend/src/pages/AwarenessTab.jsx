import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import apiClient from '../utils/apiClient';
import DailyQuestionnaireModal from '../components/DailyQuestionnaireModal';
import NotificationModal from '../components/NotificationModal';
import './AwarenessTab.css';

/* CONSTANTS — emoji map, color map, title map, priority label map */
const CATEGORY_MAP = {
  morning: { emoji: '🌅', color: '#00F0FF' },
  afternoon: { emoji: '☀️', color: '#F59E0B' },
  evening: { emoji: '🌙', color: '#7C5CFF' },
  red_flags:             { emoji: '⚠️', bg: 'rgba(239, 68, 68, 0.15)', title: 'Signs to never ignore' },
  medication_compliance: { emoji: '💊', bg: 'rgba(91, 111, 246, 0.15)', title: 'Taking your treatment' },
  nutrition:             { emoji: '🥗', bg: 'rgba(33, 212, 189, 0.15)', title: 'What to eat (and avoid)' },
  physical_activity:     { emoji: '🏃', bg: 'rgba(33, 212, 189, 0.15)', title: 'Moving your body' },
  sleep_rest:            { emoji: '😴', bg: 'rgba(124, 92, 255, 0.15)', title: 'Sleep like a healer' },
  mental_health:         { emoji: '🧘', bg: 'rgba(124, 92, 255, 0.15)', title: 'Taking care of your mind' }
};

const PRIORITY_MAP = {
  CRITICAL:  { label: 'Watch closely', color: '#EF4444' },
  IMPORTANT: { label: 'Daily habit',   color: '#F59E0B' },
  ROUTINE:   { label: 'Feel better',   color: '#21D4BD' }
};

function AwarenessTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [adherenceHistory, setAdherenceHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [awarenessData, setAwarenessData] = useState(null);
  const [error, setError] = useState(null);

  // UI state
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  // Auto-rotate tips
  useEffect(() => {
    if (!awarenessData) return;
    const interval = setInterval(() => {
      setActiveTipIndex(prev => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, [awarenessData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pid = params.get('patientId');
    if (pid && pid !== 'null' && pid !== 'undefined') {
      fetchPatientAndData(pid);
    } else {
        setLoadingPatient(false);
        setError("Invalid or missing patient ID.");
    }
  }, [location.search]);

  const fetchPatientAndData = async (pid) => {
    try {
        setLoadingPatient(true);
        const res = await apiClient.get(`/patients/${pid}`);
        if (res.data.success) {
            const p = res.data.data;
            setPatient(p);
            
            // Check if questionnaire is needed today
            const today = new Date().toISOString().split('T')[0];
            if (p.lastQuestionnaireDate !== today) {
                setShowModal(true);
            } else {
                fetchDailyTasks(pid);
            }
            fetchAdherenceHistory(pid);
            fetchAlerts(pid);
            generateAwarenessPlan(p); 
        } else {
            setError("Failed to load patient profile.");
        }
    } catch (err) {
        console.error("Error fetching patient", err);
        setError("Network error fetching patient.");
    } finally {
        setLoadingPatient(false);
    }
  };

  const fetchDailyTasks = async (pid) => {
      try {
          const res = await apiClient.get(`/patients/${pid}/awareness/tasks`);
          if (res.data.success) setDailyTasks(res.data.data);
      } catch (err) { console.error("Error fetching tasks", err); }
  };

  const fetchAdherenceHistory = async (pid) => {
      try {
          const res = await apiClient.get(`/patients/${pid}/awareness/adherence`);
          if (res.data.success) setAdherenceHistory(res.data.data);
      } catch (err) { console.error("Error fetching adherence", err); }
  };

  const fetchAlerts = async (pid) => {
    try {
      console.log("Fetching alerts for dashboard... Target PID:", pid);
      const res = await apiClient.get(`/dashboard/alerts`);
      if (res.data.success) {
          // Ensure we compare strings as IDs might be formatted differently
          const patientAlerts = res.data.data.filter(a => String(a.patientId) === String(pid));
          console.log("Total alerts from server:", res.data.data.length);
          console.log("Filtered alerts for patient:", patientAlerts.length);
          setAlerts(patientAlerts);
      }
    } catch (err) { console.error("Error fetching alerts", err); }
  };

  const handleMarkRead = async (alertId) => {
    try {
      // Logic for marking read (backend may need an endpoint for this)
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    } catch (err) { console.error("Mark read error", err); }
  };

  const handleQuestionnaireSubmit = async (answers) => {
      try {
          const res = await apiClient.post(`/patients/${patient.id}/awareness/questionnaire`, answers);
          if (res.data.success) {
              setShowModal(false);
              setDailyTasks(res.data.data.tasks);
              fetchAdherenceHistory(patient.id);
              fetchAlerts(patient.id);
          }
      } catch (err) {
          console.error("Questionnaire submission error", err);
          alert("Failed to save check-in. Please try again.");
      }
  };

  const toggleTask = async (taskId, currentStatus) => {
      try {
          const res = await apiClient.patch(`/patients/${patient.id}/awareness/tasks/${taskId}`, { isCompleted: !currentStatus });
          if (res.data.success) {
              setDailyTasks(prev => prev.map(t => t.id === taskId ? res.data.data : t));
              fetchAdherenceHistory(patient.id);
          }
      } catch (err) { console.error("Task toggle error", err); }
  };

  const generateAwarenessPlan = async (patientData, forceRetry = false) => {
    if (!patientData) return;
    if (awarenessData && !forceRetry) return;

    setLoadingData(true);
    setError(null);

    try {
      const response = await apiClient.get(`/patients/${patientData.id}/awareness`);
      if (response.data.success) {
          setAwarenessData(response.data.data);
      } else {
          throw new Error(response.data.message || "Failed to generate guidance.");
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(err.response?.data?.message || err.message || "An unexpected error occurred during AI generation.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleExpand = (key) => {
    setExpandedCards(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });
  };

  if (loadingPatient) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#071033' }}>
          <div style={{ color: '#21D4BD', fontFamily: 'Inter, sans-serif' }}>Loading patient profile...</div>
        </div>
      );
  }

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="aw">
        <div className="aw-inner">
            
            {showModal && (
                <DailyQuestionnaireModal 
                    patientName={patient?.firstName} 
                    onSubmit={handleQuestionnaireSubmit} 
                />
            )}

            <AnimatePresence>
              {showNotifications && (
                <NotificationModal 
                  alerts={alerts} 
                  onClose={() => setShowNotifications(false)} 
                  onMarkRead={handleMarkRead}
                />
              )}
            </AnimatePresence>

            <div className="controls-row">
                <button className="ctrl-btn" onClick={() => navigate(-1)}>Back</button>
                <button className="ctrl-btn notification-btn" onClick={() => {
                  console.log("Opening notifications modal...");
                  setShowNotifications(true);
                }}>
                  🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>
                <button className="ctrl-btn" onClick={async () => {
                    if (window.confirm("DEBUG: Reset today's check-in and tasks?")) {
                        try {
                            const res = await apiClient.post(`/patients/${patient.id}/awareness/reset-test`);
                            if (res.data.success) {
                                window.location.reload();
                            }
                        } catch (err) { alert("Reset failed"); }
                    }
                }}>Dev: Reset Check-in</button>
                <button className="ctrl-btn" onClick={async () => {
                    const res = await apiClient.get(`/patients/${patient.id}/awareness/export-plan`, { responseType: 'blob' });
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `DailyPlan_${patient.lastName}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                }}>Export Today's Plan</button>
                <button className="ctrl-btn primary" onClick={() => generateAwarenessPlan(patient, true)} disabled={loadingData}>
                    {loadingData ? 'Analyzing...' : 'Refresh Intel'}
                </button>
            </div>

            {error && (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: '#EF4444', fontWeight: 600 }}>Generation failed: {error}</div>
                </div>
            )}

            <div className="aw-hero">
                <div className="hero-icon">🌟</div>
                <div className="hero-text">
                <h2>Daily Wellness & Awareness</h2>
                <p>Personalized tasks and insights based on your clinical profile and daily check-ins.</p>
                </div>
            </div>

            {/* DAILY CHECKLIST */}
            <div className="checklist-section">
                <div className="section-header">
                    <h3>Today's Plan</h3>
                    <div className="progress-bar-wrap">
                        <div className="progress-text">
                            {dailyTasks.filter(t => t.isCompleted).length} of {dailyTasks.length} done
                        </div>
                        <div className="progress-bar-bg">
                            <div 
                                className="progress-bar-fill" 
                                style={{ width: `${(dailyTasks.filter(t => t.isCompleted).length / (dailyTasks.length || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="tasks-grid">
                    {['morning', 'afternoon', 'evening'].map(time => (
                        <div key={time} className="time-block" data-time={time}>
                            <div className="time-header">
                                <span className="time-emoji">{CATEGORY_MAP[time].emoji}</span>
                                <span className="time-name">{time}</span>
                            </div>
                            <div className="task-list">
                                {dailyTasks.filter(t => t.timeOfDay === time).map(task => (
                                    <div key={task.id} className={`task-card ${task.isCompleted ? 'completed' : ''} ${task.isCritical ? 'critical' : ''}`}>
                                        <div className="task-main" onClick={() => toggleTask(task.id, task.isCompleted)}>
                                            <div className="task-checkbox">
                                                {task.isCompleted && <div className="check-mark">✓</div>}
                                            </div>
                                            <div className="task-info">
                                                <div className="task-title">{task.title}</div>
                                                <div className="task-desc">{task.description}</div>
                                            </div>
                                        </div>
                                        <div className="task-why">
                                            <span className="why-tag">Why?</span> {task.whyItMatters}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ADHERENCE HEATMAP */}
            <div className="heatmap-section">
                <div className="section-label">Last 30 Days Adherence</div>
                <div className="heatmap-grid">
                    {adherenceHistory.map(day => (
                        <div 
                            key={day.date} 
                            className="heat-square"
                            style={{ 
                                backgroundColor: day.score >= 70 ? '#21D4BD' : (day.score >= 30 ? '#F59E0B' : '#EF4444'),
                                opacity: day.score === 0 ? 0.3 : 1
                            }}
                            title={`${day.date}: ${day.score}% adherence`}
                        ></div>
                    ))}
                    {/* Fill up to 30 days if needed */}
                    {[...Array(Math.max(0, 30 - adherenceHistory.length))].map((_, i) => (
                        <div key={`empty-${i}`} className="heat-square empty"></div>
                    ))}
                </div>
                <div className="heat-legend">
                    <div className="legend-item"><div className="legend-sq" style={{backgroundColor: '#21D4BD'}}></div> Great (&gt;70%)</div>
                    <div className="legend-item"><div className="legend-sq" style={{backgroundColor: '#F59E0B'}}></div> Partial (30-70%)</div>
                    <div className="legend-item"><div className="legend-sq" style={{backgroundColor: '#EF4444'}}></div> Low (&lt;30%)</div>
                </div>
            </div>

            {/* AI Awareness Cards */}
            {!loadingData && awarenessData && (
                <div className="awareness-cards-section">
                    <div className="section-label">General Wellness Intelligence</div>
                    <div className="cards-grid">
                        {Object.entries(awarenessData).map(([key, data], index) => {
                            const mapConf = CATEGORY_MAP[key] || CATEGORY_MAP.mental_health;
                            const pConf = PRIORITY_MAP[data.priority] || PRIORITY_MAP.ROUTINE;
                            const isExpanded = expandedCards.has(key);

                            return (
                                <div key={key} className={`acard ${isExpanded ? 'open' : ''}`} style={{ animationDelay: `${index * 0.08 + 0.1}s` }}>
                                    <div className="acard-head" onClick={() => handleToggleExpand(key)}>
                                        <div className="acard-emoji" style={{ background: mapConf.bg }}>{mapConf.emoji}</div>
                                        <div className="acard-meta">
                                            <div className="acard-tag" style={{ color: pConf.color }}>{pConf.label}</div>
                                            <div className="acard-title">{mapConf.title}</div>
                                            <div className="acard-why">{data.personalisation_reason}</div>
                                        </div>
                                        <div className="acard-expand">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <line x1="4" y1="0" x2="4" y2="8" stroke="#94A3B8" strokeWidth="1.5" />
                                                <line x1="0" y1="4" x2="8" y2="4" stroke="#94A3B8" strokeWidth="1.5" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="acard-body">
                                        <div className="bullet-list">
                                            {data.recommendations && data.recommendations.map((rec, rIdx) => (
                                                <div key={`${key}-rec-${rIdx}`} className="bullet-item">
                                                    <div className="bullet-dot"></div>
                                                    <div className="bullet-text">{rec}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <div className="disclaimer">
                This plan is tailored specifically to {patient?.firstName ? `${patient.firstName}'s` : 'your'} clinical profile and is here to support — not replace — {patient?.oncologist?.name ? `Dr. ${patient.oncologist.name.split(' ').pop()}'s`  : "your doctor's"} advice. Always consult your Resonance care team before implementing changes.
            </div>

        </div>
    </div>
  );
}

export default AwarenessTab;