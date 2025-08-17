import React, { useState } from 'react';
import { X, RefreshCw, Copy, Mail } from 'lucide-react';

interface AttendantFormProps {
  onSubmit: (email: string, tempPassword: string, role: 'attendant' | 'admin') => void;
  onCancel: () => void;
  generateTempPassword: () => string;
  isManager?: boolean;
}

const AttendantForm: React.FC<AttendantFormProps> = ({
  onSubmit,
  onCancel,
  generateTempPassword,
  isManager = false
}) => {
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState(generateTempPassword());
  const [role, setRole] = useState<'attendant' | 'admin'>('attendant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // For admin invitations, password is not required
    if (role === 'attendant' && !tempPassword.trim()) {
      setError('Temporary password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(email.trim(), tempPassword, role);
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isAdminInvitation = isManager && role === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-w-[95vw] my-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
            {isAdminInvitation ? 'Send Admin Invitation' : (isManager ? 'Create User Account' : 'Create Attendant Account')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5 lg:h-6 lg:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 lg:px-4 py-2 lg:py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder={isAdminInvitation ? "admin@example.com" : "attendant@example.com"}
            />
          </div>

          {isManager && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'attendant' | 'admin')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="attendant">Attendant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {!isAdminInvitation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Temporary Password *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Temporary password"
                />
                <button
                  type="button"
                  onClick={() => setTempPassword(generateTempPassword())}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                  title="Generate new password"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tempPassword)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  title="Copy password"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The attendant will be required to change this password on first login.
              </p>
            </div>
          )}

          <div className={`rounded-lg p-3 lg:p-4 ${
            isAdminInvitation 
              ? 'bg-purple-50 dark:bg-purple-900/20' 
              : 'bg-blue-50 dark:bg-blue-900/20'
          }`}>
            <h3 className={`font-medium mb-2 text-sm ${
              isAdminInvitation 
                ? 'text-purple-800 dark:text-purple-300' 
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              {isAdminInvitation ? 'Admin Invitation Process:' : 'Important Instructions:'}
            </h3>
            <ul className={`text-xs space-y-1 ${
              isAdminInvitation 
                ? 'text-purple-700 dark:text-purple-300' 
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {isAdminInvitation ? (
                <>
                  <li>• An invitation will be created for the provided email address</li>
                  <li>• Share the signup link with the admin: <strong>/signup</strong></li>
                  <li>• The admin will set their own password during signup</li>
                  <li>• The invitation expires in 7 days</li>
                  <li>• Admins can manage attendants and access reports</li>
                </>
              ) : (
                <>
                  <li>• Share the email and temporary password with the {isManager ? 'user' : 'attendant'}</li>
                  <li>• They must change the password on first login</li>
                  <li>• The account will be active immediately after creation</li>
                  {isManager && (
                    <li>• Admins can manage attendants and access reports</li>
                  )}
                </>
              )}
            </ul>
          </div>

          {isAdminInvitation && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 lg:p-4">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2 text-sm">
                Next Steps:
              </h3>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-2">
                <p><strong>1.</strong> After sending the invitation, notify the admin via email or message</p>
                <p><strong>2.</strong> Share this signup link: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 py-0.5 rounded text-xs">/signup</code></p>
                <p><strong>3.</strong> Tell them to use the same email address they were invited with</p>
                <p><strong>4.</strong> The invitation will be automatically validated during signup</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              {loading 
                ? (isAdminInvitation ? 'Sending...' : 'Creating...') 
                : (isAdminInvitation ? 'Send Invitation' : `Create ${isManager ? 'User' : 'Attendant'}`)
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendantForm;