'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, GameAccount } from '@/contexts/AccountContext';
import { useToast } from '@/contexts/ToastContext';
import ConfirmationModal from '@/components/ConfirmationModal';

interface GameAccountDetails extends GameAccount {
  password: string;
  two_factor_codes: string[] | null;
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

export default function GameAccountsPage() {
  const router = useRouter();
  const { userData, gameAccounts, gameAccountsLoading, fetchGameAccounts } = useAccount();
  const { showToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<GameAccount | null>(null);
  const [viewedAccount, setViewedAccount] = useState<GameAccountDetails | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    account_name: '',
    game_platform: 'activision',
    username: '',
    password: '',
    two_factor_codes: '',
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Redirect non-customers
  useEffect(() => {
    if (userData && userData.role !== 'customer') {
      router.replace('/account/profile');
    }
  }, [userData, router]);

  const handleAddAccount = async () => {
    if (!formData.account_name || !formData.username || !formData.password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const twoFactorCodes = formData.two_factor_codes
        .split('\n')
        .map((code) => code.trim())
        .filter((code) => code.length > 0);

      const response = await fetch('/api/accounts/game-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_name: formData.account_name,
          game_platform: formData.game_platform,
          username: formData.username,
          password: formData.password,
          two_factor_codes: twoFactorCodes.length > 0 ? twoFactorCodes : undefined,
        }),
      });

      if (response.ok) {
        showToast('Game account saved successfully', 'success');
        setShowAddModal(false);
        resetForm();
        fetchGameAccounts(true);
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to save game account', 'error');
      }
    } catch (error) {
      showToast('Failed to save game account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount || !formData.account_name || !formData.username) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const twoFactorCodes = formData.two_factor_codes
        .split('\n')
        .map((code) => code.trim())
        .filter((code) => code.length > 0);

      const updateData: Record<string, any> = {
        account_name: formData.account_name,
        game_platform: formData.game_platform,
        username: formData.username,
        two_factor_codes: twoFactorCodes.length > 0 ? twoFactorCodes : null,
      };

      // Only update password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/accounts/game-accounts/${selectedAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        showToast('Game account updated successfully', 'success');
        setShowEditModal(false);
        resetForm();
        fetchGameAccounts(true);
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update game account', 'error');
      }
    } catch (error) {
      showToast('Failed to update game account', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/accounts/game-accounts/${selectedAccount.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Game account deleted successfully', 'success');
        setShowDeleteModal(false);
        setSelectedAccount(null);
        fetchGameAccounts(true);
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete game account', 'error');
      }
    } catch (error) {
      showToast('Failed to delete game account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewAccount = async (account: GameAccount) => {
    setSelectedAccount(account);
    setViewLoading(true);
    setShowViewModal(true);

    try {
      const response = await fetch(`/api/accounts/game-accounts/${account.id}`);
      if (response.ok) {
        const data = await response.json();
        setViewedAccount(data.account);
      } else {
        showToast('Failed to load account details', 'error');
        setShowViewModal(false);
      }
    } catch (error) {
      showToast('Failed to load account details', 'error');
      setShowViewModal(false);
    } finally {
      setViewLoading(false);
    }
  };

  const openEditModal = async (account: GameAccount) => {
    setSelectedAccount(account);
    setViewLoading(true);

    try {
      const response = await fetch(`/api/accounts/game-accounts/${account.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          account_name: data.account.account_name,
          game_platform: data.account.game_platform,
          username: data.account.username,
          password: '', // Don't pre-fill password for security
          two_factor_codes: data.account.two_factor_codes?.join('\n') || '',
        });
        setShowEditModal(true);
      } else {
        showToast('Failed to load account details', 'error');
      }
    } catch (error) {
      showToast('Failed to load account details', 'error');
    } finally {
      setViewLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      account_name: '',
      game_platform: 'activision',
      username: '',
      password: '',
      two_factor_codes: '',
    });
    setSelectedAccount(null);
    setShowPassword(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const getPlatformLabel = (value: string) => {
    return PLATFORMS.find((p) => p.value === value)?.label || value;
  };

  if (!userData || userData.role !== 'customer') {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Game Accounts</h2>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Saved Game Accounts</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Save your game account credentials for quick checkout. Your passwords are encrypted.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          + Add Account
        </button>
      </div>

      {/* Accounts List */}
      {gameAccountsLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-zinc-700 rounded w-32"></div>
                    <div className="h-5 bg-zinc-700 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-zinc-700 rounded w-40 mt-2"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 bg-zinc-700 rounded w-14"></div>
                  <div className="h-8 bg-zinc-700 rounded w-12"></div>
                  <div className="h-8 bg-zinc-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : gameAccounts.length === 0 ? (
        <div className="bg-zinc-800/50 rounded-lg p-8 text-center">
          <div className="text-zinc-400 mb-2">No saved game accounts yet</div>
          <p className="text-sm text-zinc-500">Add your game account credentials to use them at checkout</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gameAccounts.map((account) => (
            <div key={account.id} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{account.account_name}</span>
                    <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-xs">
                      {getPlatformLabel(account.game_platform)}
                    </span>
                    {account.has_2fa_codes && (
                      <span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">2FA</span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">Username: {account.username}</div>
                  {account.last_used_at && (
                    <div className="text-xs text-zinc-500 mt-1">
                      Last used: {new Date(account.last_used_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewAccount(account)}
                    className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(account)}
                    className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6 border border-zinc-700">
            <h3 className="text-lg font-medium text-white mb-4">Add Game Account</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Account Name *</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="e.g., My Main Activision"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Platform *</label>
                <select
                  value={formData.game_platform}
                  onChange={(e) => setFormData({ ...formData, game_platform: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Username / Email *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your account username or email"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your account password"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">2FA Backup Codes (Optional)</label>
                <textarea
                  value={formData.two_factor_codes}
                  onChange={(e) => setFormData({ ...formData, two_factor_codes: e.target.value })}
                  placeholder="Enter backup codes, one per line"
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  If your account has 2FA, enter backup codes so boosters can access if needed
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAccount}
                disabled={saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6 border border-zinc-700">
            <h3 className="text-lg font-medium text-white mb-4">Edit Game Account</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Account Name *</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Platform *</label>
                <select
                  value={formData.game_platform}
                  onChange={(e) => setFormData({ ...formData, game_platform: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  {PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Username / Email *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Password <span className="text-zinc-500">(leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password to change"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">2FA Backup Codes</label>
                <textarea
                  value={formData.two_factor_codes}
                  onChange={(e) => setFormData({ ...formData, two_factor_codes: e.target.value })}
                  placeholder="Enter backup codes, one per line"
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAccount}
                disabled={saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Account Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6 border border-zinc-700">
            <h3 className="text-lg font-medium text-white mb-4">Account Credentials</h3>

            {viewLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : viewedAccount ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Platform</label>
                  <div className="text-white">{getPlatformLabel(viewedAccount.game_platform)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono">{viewedAccount.username}</span>
                    <button
                      onClick={() => copyToClipboard(viewedAccount.username, 'username')}
                      className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                    >
                      {copiedField === 'username' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono">
                      {showPassword ? viewedAccount.password : '••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(viewedAccount.password, 'password')}
                      className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                    >
                      {copiedField === 'password' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {viewedAccount.two_factor_codes && viewedAccount.two_factor_codes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">2FA Backup Codes</label>
                    <div className="bg-zinc-800 rounded-lg p-3 space-y-1">
                      {viewedAccount.two_factor_codes.map((code, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-white font-mono text-sm">{code}</span>
                          <button
                            onClick={() => copyToClipboard(code, `code-${index}`)}
                            className="px-2 py-0.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded transition-colors"
                          >
                            {copiedField === `code-${index}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-400 py-4">Failed to load credentials</div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewedAccount(null);
                  setShowPassword(false);
                }}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAccount(null);
        }}
        onConfirm={handleDeleteAccount}
        title="Delete Game Account"
        message={`Are you sure you want to delete "${selectedAccount?.account_name}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
      />
    </div>
  );
}
