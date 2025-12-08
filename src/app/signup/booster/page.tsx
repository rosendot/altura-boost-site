'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required?: boolean;
}

export default function BoosterSignUpPage() {
  const [currentStep, setCurrentStep] = useState<'account' | 'survey'>('account');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Generic survey questions - your client can update these later
  const surveyQuestions: SurveyQuestion[] = [
    {
      id: 'experience',
      question: 'How many years of gaming experience do you have?',
      type: 'select',
      options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'],
      required: true,
    },
    {
      id: 'games',
      question: 'Which games are you proficient in?',
      type: 'checkbox',
      options: ['League of Legends', 'Valorant', 'CS2', 'Dota 2', 'Overwatch', 'Other'],
      required: true,
    },
    {
      id: 'availability',
      question: 'What is your weekly availability (in hours)?',
      type: 'select',
      options: ['Less than 10 hours', '10-20 hours', '20-30 hours', '30+ hours'],
      required: true,
    },
    {
      id: 'motivation',
      question: 'Why do you want to become a booster?',
      type: 'textarea',
      required: true,
    },
    {
      id: 'additional',
      question: 'Any additional information you would like to share?',
      type: 'textarea',
      required: false,
    },
  ];

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSurveyChange = (questionId: string, value: string | string[]) => {
    setSurveyAnswers({
      ...surveyAnswers,
      [questionId]: value,
    });
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentValues = (surveyAnswers[questionId] as string[]) || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v) => v !== option);
    setSurveyAnswers({
      ...surveyAnswers,
      [questionId]: newValues,
    });
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setCurrentStep('survey');
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup/booster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          questionnaire_responses: surveyAnswers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      alert(data.message || 'Application submitted successfully! Redirecting to login...');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="fixed inset-0 bg-black flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: "url('/assets/images/login_page_background.webp')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

      {/* Sign Up Form */}
      <div className="max-w-2xl w-full bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">
          {currentStep === 'account' ? 'Booster Application' : 'Booster Application'}
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          {currentStep === 'account' ? 'Step 1: Create your account' : 'Step 2: Complete the questionnaire'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'account' ? 'bg-primary-500' : 'bg-primary-700'
              }`}
            >
              1
            </div>
            <div className="w-16 h-1 bg-gray-700 mx-2"></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'survey' ? 'bg-primary-500' : 'bg-gray-700'
              }`}
            >
              2
            </div>
          </div>
        </div>

        {currentStep === 'account' ? (
          <form onSubmit={handleAccountSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleAccountChange}
                placeholder="Choose a username"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleAccountChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleAccountChange}
                placeholder="Create a password"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleAccountChange}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-4"
            >
              NEXT
            </button>

            <div className="mt-4 text-center text-sm">
              <p className="text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-primary-400 hover:text-primary-300 transition font-semibold">
                  Login
                </a>
              </p>
              <p className="text-gray-400 mt-2">
                Looking to buy boosts?{' '}
                <a href="/signup/customer" className="text-primary-400 hover:text-primary-300 transition font-semibold">
                  Sign up as Customer
                </a>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSurveySubmit} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
              Please answer the following questions to complete your booster application.
            </p>

            {surveyQuestions.map((q) => (
              <div key={q.id}>
                <label className="block text-sm text-gray-300 mb-2">
                  {q.question}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {q.type === 'text' && (
                  <input
                    type="text"
                    value={(surveyAnswers[q.id] as string) || ''}
                    onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                    required={q.required}
                  />
                )}

                {q.type === 'textarea' && (
                  <textarea
                    value={(surveyAnswers[q.id] as string) || ''}
                    onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                    required={q.required}
                  />
                )}

                {q.type === 'select' && (
                  <select
                    value={(surveyAnswers[q.id] as string) || ''}
                    onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:border-primary-500 transition"
                    required={q.required}
                  >
                    <option value="">Select an option...</option>
                    {q.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {q.type === 'radio' && (
                  <div className="space-y-2">
                    {q.options?.map((option) => (
                      <label key={option} className="flex items-center text-gray-300">
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={(surveyAnswers[q.id] as string) === option}
                          onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                          className="mr-2"
                          required={q.required}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'checkbox' && (
                  <div className="space-y-2">
                    {q.options?.map((option) => (
                      <label key={option} className="flex items-center text-gray-300">
                        <input
                          type="checkbox"
                          checked={((surveyAnswers[q.id] as string[]) || []).includes(option)}
                          onChange={(e) => handleCheckboxChange(q.id, option, e.target.checked)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep('account')}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-bold"
              >
                BACK
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
