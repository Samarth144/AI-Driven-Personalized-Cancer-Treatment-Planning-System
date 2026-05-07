import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DailyQuestionnaireModal.css';

const questions = [
  {
    id: 'fuel',
    title: 'The "Fuel" Check',
    prompt: 'How have you been feeling about food and water since your last check-in? Is your body feeling nourished and ready for the day?',
    type: 'choice',
    options: [
      { value: 'good', label: '😊 Feeling good', description: 'I’m eating and drinking well.' },
      { value: 'difficult', label: '😐 A bit difficult', description: 'I\'m finding it hard to eat enough or stay hydrated.' },
      { value: 'struggling', label: '⚠️ Struggling', description: 'I have very little appetite or feel too sick to eat/drink.' }
    ]
  },
  {
    id: 'body',
    title: 'The "Body" Check',
    prompt: 'Are you experiencing any new symptoms or physical changes today? Please describe how your body is feeling in your own words.',
    type: 'text',
    placeholder: 'Example: A slight tingling in my fingers, or a dull ache in my back that feels different this morning.'
  },
  {
    id: 'outlook',
    title: 'The "Outlook" Check',
    prompt: 'Looking at the day ahead, how much of your normal routine do you feel ready to take on today?',
    type: 'scale',
    min: 1,
    max: 5,
    labels: {
      1: 'I feel like I need to stay in bed and focus on resting today.',
      3: 'I feel okay for light activities, but I’ll need to take things slow and rest often.',
      5: 'I feel strong and ready to handle my usual tasks and routine.'
    }
  }
];

function DailyQuestionnaireModal({ onSubmit, patientName }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    fuelStatus: 'good',
    fuelComment: '',
    symptoms: '',
    energyLevel: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(answers);
    setIsSubmitting(false);
  };

  const currentQuestion = questions[step];

  return (
    <div className="dq-overlay">
      <motion.div 
        className="dq-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <div className="dq-header">
          <div className="dq-progress">
            {questions.map((_, i) => (
              <div key={i} className={`dq-dot ${i <= step ? 'active' : ''}`} />
            ))}
          </div>
          <h2>Good morning, {patientName}!</h2>
          <p>Let's see how you're feeling before we look at your plan.</p>
        </div>

        <div className="dq-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="dq-question-wrap"
            >
              <h3 className="dq-q-title">{currentQuestion.title}</h3>
              <p className="dq-q-prompt">{currentQuestion.prompt}</p>

              {currentQuestion.type === 'choice' && (
                <div className="dq-options">
                  {currentQuestion.options.map(opt => (
                    <button 
                      key={opt.value}
                      className={`dq-opt-btn ${answers.fuelStatus === opt.value ? 'selected' : ''}`}
                      onClick={() => setAnswers({ ...answers, fuelStatus: opt.value })}
                    >
                      <div className="dq-opt-label">{opt.label}</div>
                      <div className="dq-opt-desc">{opt.description}</div>
                    </button>
                  ))}
                  <textarea 
                    className="dq-textarea mt-16"
                    placeholder="Any specific comments about your appetite or hydration?"
                    value={answers.fuelComment}
                    onChange={(e) => setAnswers({ ...answers, fuelComment: e.target.value })}
                  />
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <textarea 
                  className="dq-textarea large"
                  placeholder={currentQuestion.placeholder}
                  value={answers.symptoms}
                  onChange={(e) => setAnswers({ ...answers, symptoms: e.target.value })}
                  autoFocus
                />
              )}

              {currentQuestion.type === 'scale' && (
                <div className="dq-scale-wrap">
                  <div className="dq-scale-icons">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num}
                        className={`dq-scale-btn ${answers.energyLevel === num ? 'selected' : ''}`}
                        onClick={() => setAnswers({ ...answers, energyLevel: num })}
                      >
                        {num === 1 && '🔋'}
                        {num === 3 && '⚡'}
                        {num === 5 && '🔥'}
                        <span className="dq-scale-num">{num}</span>
                      </button>
                    ))}
                  </div>
                  <div className="dq-scale-hint">
                    {currentQuestion.labels[answers.energyLevel] || 'Choose how you feel'}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="dq-footer">
          <button 
            className="dq-btn-primary" 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Calibrating...' : (step === questions.length - 1 ? 'Submit & See My Plan' : 'Next')}
          </button>
          <div className="dq-footer-hint">Your answers help calibrate your personalized AI insights for today.</div>
        </div>
      </motion.div>
    </div>
  );
}

export default DailyQuestionnaireModal;