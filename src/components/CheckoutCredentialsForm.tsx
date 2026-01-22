'use client';

import { useEffect, useState } from 'react';

interface GameAccount {
  id: string;
  account_name: string;
  game_platform: string;
  username: string;
  has_2fa_codes: boolean;
}

interface CredentialSelection {
  type: 'saved' | 'new';
  savedAccountId?: string;
  newCredentials?: {
    game_platform: string;
    username: string;
    password: string;
    two_factor_codes?: string[];
  };
  saveNewAccount?: boolean;
  newAccountName?: string;
}

interface CheckoutCredentialsFormProps {
  onSelectionChange: (selection: CredentialSelection | null) => void;
  isAuthenticated: boolean;
}

const PLATFORMS = [
  { value: 'activision', label: 'Activision' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'steam', label: 'Steam' },
  { value: 'battlenet', label: 'Battle.net' },
  { value: 'epicgames', label: 'Epic Games' },
  { value: 'ubisoft', label: 'Ubisoft' },
];

export default function CheckoutCredentialsForm({ onSelectionChange, isAuthenticated }: CheckoutCredentialsFormProps) {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionType, setSelectionType] = useState<'saved' | 'new'>('saved');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveNewAccount, setSaveNewAccount] = useState(false);

  // New credentials form
  const [newCredentials, setNewCredentials] = useState({
    game_platform: 'activision',
    username: '',
    password: '',
    two_factor_codes: '',
    account_name: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    } else {
      setLoading(false);
      setSelectionType('new');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Update parent with current selection
    updateParentSelection();
  }, [selectionType, selectedAccountId, newCredentials, saveNewAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts/game-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        // If user has saved accounts, pre-select the first one
        if (data.accounts?.length > 0) {
          setSelectedAccountId(data.accounts[0].id);
        } else {
          setSelectionType('new');
        }
      }
    } catch (error) {
      console.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const updateParentSelection = () => {
    if (selectionType === 'saved' && selectedAccountId) {
      onSelectionChange({
        type: 'saved',
        savedAccountId: selectedAccountId,
      });
    } else if (selectionType === 'new') {
      if (!newCredentials.username || !newCredentials.password) {
        onSelectionChange(null); // Invalid - missing required fields
        return;
      }

      const twoFactorCodes = newCredentials.two_factor_codes
        .split('\n')
        .map((code) => code.trim())
        .filter((code) => code.length > 0);

      onSelectionChange({
        type: 'new',
        newCredentials: {
          game_platform: newCredentials.game_platform,
          username: newCredentials.username,
          password: newCredentials.password,
          two_factor_codes: twoFactorCodes.length > 0 ? twoFactorCodes : undefined,
        },
        saveNewAccount: saveNewAccount && isAuthenticated,
        newAccountName: saveNewAccount ? newCredentials.account_name : undefined,
      });
    }
  };

  const getPlatformLabel = (value: string) => {
    return PLATFORMS.find((p) => p.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-400">Loading saved accounts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-primary-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Game Account for Boosting</h3>
      <p className="text-sm text-gray-400 mb-4">
        Provide your game account credentials so our boosters can access your account to complete the service.
      </p>

      {/* Selection Type Toggle - Only show if user has saved accounts */}
      {accounts.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectionType('saved')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
              selectionType === 'saved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Use Saved Account
          </button>
          <button
            type="button"
            onClick={() => setSelectionType('new')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
              selectionType === 'new'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Enter New Credentials
          </button>
        </div>
      )}

      {/* Saved Account Selection */}
      {selectionType === 'saved' && accounts.length > 0 && (
        <div className="space-y-3">
          {accounts.map((account) => (
            <label
              key={account.id}
              className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                selectedAccountId === account.id
                  ? 'border-primary-500 bg-primary-900/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="savedAccount"
                value={account.id}
                checked={selectedAccountId === account.id}
                onChange={() => setSelectedAccountId(account.id)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedAccountId === account.id ? 'border-primary-500' : 'border-gray-600'
                }`}
              >
                {selectedAccountId === account.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{account.account_name}</span>
                  <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                    {getPlatformLabel(account.game_platform)}
                  </span>
                  {account.has_2fa_codes && (
                    <span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">2FA</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{account.username}</div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* New Credentials Form */}
      {(selectionType === 'new' || accounts.length === 0) && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Platform *</label>
            <select
              value={newCredentials.game_platform}
              onChange={(e) => setNewCredentials({ ...newCredentials, game_platform: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username / Email *</label>
            <input
              type="text"
              value={newCredentials.username}
              onChange={(e) => setNewCredentials({ ...newCredentials, username: e.target.value })}
              placeholder="Enter your game account username or email"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newCredentials.password}
                onChange={(e) => setNewCredentials({ ...newCredentials, password: e.target.value })}
                placeholder="Enter your game account password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">2FA Backup Codes (Optional)</label>
            <textarea
              value={newCredentials.two_factor_codes}
              onChange={(e) => setNewCredentials({ ...newCredentials, two_factor_codes: e.target.value })}
              placeholder="Enter backup codes, one per line"
              rows={2}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              If your account has 2FA enabled, provide backup codes so our boosters can access if needed
            </p>
          </div>

          {/* Save to account option */}
          {isAuthenticated && (
            <div className="border-t border-gray-700 pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveNewAccount}
                  onChange={(e) => setSaveNewAccount(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <span className="text-white text-sm font-medium">Save to my account for future orders</span>
                  <p className="text-xs text-gray-500">Your credentials will be encrypted and stored securely</p>
                </div>
              </label>

              {saveNewAccount && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={newCredentials.account_name}
                    onChange={(e) => setNewCredentials({ ...newCredentials, account_name: e.target.value })}
                    placeholder="e.g., My Main Activision"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Security Note */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <div className="text-xs text-gray-400">
            <span className="font-medium text-gray-300">Your credentials are secure.</span> All passwords are encrypted
            using AES-256 encryption and automatically deleted 14 days after your order is completed.
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CredentialSelection };
