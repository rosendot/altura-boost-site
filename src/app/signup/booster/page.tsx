'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const surveyQuestions: SurveyQuestion[] = [
    {
      id: 'legalName',
      question: 'Legal full name',
      type: 'text',
      required: true,
      placeholder: 'Enter your full legal name',
    },
    {
      id: 'displayName',
      question: 'Display name / Username (in-game)',
      type: 'text',
      required: true,
      placeholder: 'Your in-game display name',
    },
    {
      id: 'age',
      question: 'Age (must be 18+)',
      type: 'select',
      options: ['18', '19', '20', '21', '22-25', '26-30', '31-40', '40+'],
      required: true,
    },
    {
      id: 'country',
      question: 'Country',
      type: 'text',
      required: true,
      placeholder: 'Enter your country',
    },
    {
      id: 'timezone',
      question: 'Time zone',
      type: 'select',
      options: [
        'PST (Pacific)',
        'MST (Mountain)',
        'CST (Central)',
        'EST (Eastern)',
        'GMT (UK)',
        'CET (Central Europe)',
        'EET (Eastern Europe)',
        'IST (India)',
        'JST (Japan)',
        'AEST (Australia)',
        'Other',
      ],
      required: true,
    },
    {
      id: 'platforms',
      question: 'Preferred platform(s)',
      type: 'checkbox',
      options: ['PC', 'PlayStation', 'Xbox'],
      required: true,
    },
    {
      id: 'games',
      question: 'Game(s)',
      type: 'checkbox',
      options: ['Warzone', 'Multiplayer', 'Zombies'],
      required: true,
    },
    {
      id: 'services',
      question: 'Which services are you applying for?',
      type: 'checkbox',
      options: ['Camo Boost', 'Rank Boost', 'Challenges / Unlocks', 'Coaching (Coming Soon)', 'Other'],
      required: true,
    },
    {
      id: 'otherServices',
      question: 'If you selected "Other" above, please explain',
      type: 'textarea',
      required: false,
      placeholder: 'Describe the other services you can provide...',
    },
    {
      id: 'kd',
      question: 'K/D ratio (if applying for multiplayer)',
      type: 'text',
      required: false,
      placeholder: 'e.g. 2.5',
    },
    {
      id: 'highestRank',
      question: 'Highest rank completed',
      type: 'text',
      required: false,
      placeholder: 'e.g. Iridescent, Top 250, Crimson',
    },
    {
      id: 'proofScreenshots',
      question: 'Screenshot proof of K/D and highest rank',
      type: 'file',
      required: false,
      accept: 'image/*',
      multiple: true,
    },
    {
      id: 'previousExperience',
      question: 'Previous boosting experience?',
      type: 'radio',
      options: ['Yes', 'No'],
      required: true,
    },
    {
      id: 'whyBetter',
      question: 'What makes you better than other players offering this same service?',
      type: 'textarea',
      required: true,
      placeholder: 'Tell us what sets you apart...',
    },
    {
      id: 'availability',
      question: 'Average availability per week?',
      type: 'select',
      options: ['Less than 10 hours', '10-20 hours', '20-40 hours', '40+ hours'],
      required: true,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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
      const supabase = createClient();

      // Sign up user with client-side Supabase - automatically creates session
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.username,
            role: 'booster',
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error('Account creation failed');
      }

      // Upload screenshot files if any
      const uploadedFilePaths: string[] = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${authData.user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('booster-applications')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload screenshot: ' + uploadError.message);
          }

          uploadedFilePaths.push(filePath);
        }
      }

      // Prepare final answers with file paths
      const finalAnswers = {
        ...surveyAnswers,
        proofScreenshots: uploadedFilePaths,
      };

      // Update the booster application with questionnaire responses
      // User is now authenticated, so RLS allows this update
      const { error: updateError } = await supabase
        .from('booster_applications')
        .update({ questionnaire_responses: finalAnswers })
        .eq('user_id', authData.user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to save questionnaire responses: ' + updateError.message);
      }

      // User is now automatically logged in with session
      // Redirect to account page where they'll see pending status
      router.push('/account');
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
        style={{ backgroundImage: "url('/login_page_background.webp')" }}
        aria-hidden="true"
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" aria-hidden="true"></div>

      {/* Sign Up Form */}
      <div className="max-w-2xl w-full bg-gray-900 border border-primary-700 rounded-lg p-6 card-glow relative z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">
          {currentStep === 'account' ? 'Booster Application' : 'Booster Application'}
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          {currentStep === 'account' ? 'Step 1: Create your account' : 'Step 2: Complete the questionnaire'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6" role="progressbar" aria-label="Application progress" aria-valuenow={currentStep === 'account' ? 1 : 2} aria-valuemin={1} aria-valuemax={2}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'account' ? 'bg-primary-500' : 'bg-primary-700'
              }`}
              aria-current={currentStep === 'account' ? 'step' : undefined}
            >
              1
            </div>
            <div className="w-16 h-1 bg-gray-700 mx-2" aria-hidden="true"></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'survey' ? 'bg-primary-500' : 'bg-gray-700'
              }`}
              aria-current={currentStep === 'survey' ? 'step' : undefined}
            >
              2
            </div>
          </div>
        </div>

        {currentStep === 'account' ? (
          <form onSubmit={handleAccountSubmit} className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-400 mb-1">
                Username <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleAccountChange}
                placeholder="Choose a username"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                aria-required="true"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
                Email <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleAccountChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                aria-required="true"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
                Password <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleAccountChange}
                placeholder="Create a password"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                aria-required="true"
                aria-invalid={error === 'Passwords do not match!' ? 'true' : 'false'}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-400 mb-1">
                Confirm Password <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleAccountChange}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                aria-required="true"
                aria-invalid={error === 'Passwords do not match!' ? 'true' : 'false'}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold mt-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              NEXT
            </button>

            <div className="mt-4 text-center text-sm">
              <p className="text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-primary-400 hover:text-primary-300 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Login
                </a>
              </p>
              <p className="text-gray-400 mt-2">
                Looking to buy boosts?{' '}
                <a href="/signup/customer" className="text-primary-400 hover:text-primary-300 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
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
                <label htmlFor={`survey-${q.id}`} className="block text-sm text-gray-300 mb-2">
                  {q.question}
                  {q.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
                </label>

                {q.type === 'text' && (
                  <input
                    type="text"
                    id={`survey-${q.id}`}
                    value={(surveyAnswers[q.id] as string) || ''}
                    onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    aria-required={q.required}
                    required={q.required}
                  />
                )}

                {q.type === 'textarea' && (
                  <textarea
                    id={`survey-${q.id}`}
                    value={(surveyAnswers[q.id] as string) || ''}
                    onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    aria-required={q.required}
                    required={q.required}
                  />
                )}

                {q.type === 'select' && (
                  <select
                    id={`survey-${q.id}`}
                    value={(surveyAnswers[q.id] as string) || ''}
                    onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    aria-required={q.required}
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
                  <div className="space-y-2" role="radiogroup" aria-labelledby={`survey-${q.id}`} aria-required={q.required}>
                    {q.options?.map((option) => (
                      <label key={option} className="flex items-center text-gray-300">
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={(surveyAnswers[q.id] as string) === option}
                          onChange={(e) => handleSurveyChange(q.id, e.target.value)}
                          className="mr-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-checked={(surveyAnswers[q.id] as string) === option}
                          required={q.required}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'checkbox' && (
                  <div className="space-y-2" role="group" aria-labelledby={`survey-${q.id}`}>
                    {q.options?.map((option) => (
                      <label key={option} className="flex items-center text-gray-300">
                        <input
                          type="checkbox"
                          checked={((surveyAnswers[q.id] as string[]) || []).includes(option)}
                          onChange={(e) => handleCheckboxChange(q.id, option, e.target.checked)}
                          className="mr-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-checked={((surveyAnswers[q.id] as string[]) || []).includes(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'file' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      id={`survey-${q.id}`}
                      accept={q.accept || 'image/*'}
                      multiple={q.multiple}
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:cursor-pointer hover:file:bg-primary-500"
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Selected files:</p>
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg">
                            <span className="text-sm text-gray-300 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="ml-2 text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCurrentStep('account')}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-bold focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                BACK
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
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
