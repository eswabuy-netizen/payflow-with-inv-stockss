import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX, Key, Mail } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AttendantForm from './AttendantForm';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

const AttendantManagement: React.FC = () => {
  const [attendants, setAttendants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<User | null>(null);
  const [deleteAttendant, setDeleteAttendant] = useState<User | null>(null);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (currentUser?.companyId) {
      loadAttendants();
    }
  }, [currentUser?.companyId]);

  const loadAttendants = async () => {
    if (!currentUser?.companyId) return;
    
    try {
      const attendantsData = await userService.getAttendants(currentUser.companyId);
      setAttendants(attendantsData);
    } catch (error) {
      console.error('Error loading attendants:', error);
      showToast('Failed to load attendants', 'error');
    } finally {
      setLoading(false);
    }
  };

    const handleCreateAttendant = async (email: string, tempPassword: string, role: 'attendant' | 'admin' = 'attendant') => {
    if (!currentUser?.companyId) {
      console.error('No company ID found for current user');
      showToast('User company ID not found. Please refresh the page and try again.', 'error');
      return;
    }

    console.log('Current user data:', {
      uid: currentUser.uid,
      role: currentUser.role,
      companyId: currentUser.companyId,
      email: currentUser.email
    });

    try {
      if (role === 'admin' && currentUser.role === 'manager') {
        // Create admin invitation instead of direct account
        console.log('Creating admin invitation for:', email);
        await userService.createAdminInvitation(email, currentUser.uid, currentUser.companyId);
        showToast('Admin invitation sent successfully. The admin will receive an email to complete their signup.', 'success');
      } else {
        // Create attendant account directly
        console.log('Creating attendant account for:', email);
        await userService.createAttendant(email, tempPassword, currentUser.uid, currentUser.companyId, role);
        showToast(`${role === 'admin' ? 'Admin' : 'Attendant'} created successfully`, 'success');
      }
      await loadAttendants();
      setShowForm(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      showToast(error.message || 'Failed to create user', 'error');
    }
  };

  const handleToggleActive = async (attendant: User) => {
    try {
      if (attendant.active) {
        await userService.deactivateAttendant(attendant.uid);
        showToast('Attendant deactivated', 'success');
      } else {
        await userService.reactivateAttendant(attendant.uid);
        showToast('Attendant reactivated', 'success');
      }
      await loadAttendants();
    } catch (error) {
      console.error('Error toggling attendant status:', error);
      showToast('Failed to update attendant status', 'error');
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {currentUser?.role === 'manager' ? 'User Management' : 'Attendant Management'}
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">
            {currentUser?.role === 'manager' 
              ? 'Create and manage attendant accounts and send admin invitations' 
              : 'Create and manage attendant accounts'
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm lg:text-base"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
          {currentUser?.role === 'manager' ? 'Add User' : 'Add Attendant'}
        </button>
      </div>

      {/* Attendants List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {attendants.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {currentUser?.role === 'manager' ? 'No users found' : 'No attendants found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {currentUser?.role === 'manager' 
                ? 'Get started by creating a new user account or sending admin invitations.' 
                : 'Get started by creating a new attendant account.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  {currentUser?.role === 'manager' && (
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                  )}
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendants.map((attendant) => (
                  <tr key={attendant.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {attendant.email}
                      </div>
                    </td>
                    {currentUser?.role === 'manager' && (
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendant.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        }`}>
                          {attendant.role === 'admin' ? 'Admin' : 'Attendant'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendant.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {attendant.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        attendant.isTemporaryPassword
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {attendant.isTemporaryPassword ? 'Temporary' : 'Updated'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {attendant.createdAt ? 
                        (attendant.createdAt instanceof Date ? 
                          attendant.createdAt.toLocaleDateString() : 
                          (attendant.createdAt as Timestamp).toDate().toLocaleDateString()
                        ) : 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(attendant)}
                          className={`p-2 rounded-md transition-colors duration-200 ${
                            attendant.active
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-50'
                          }`}
                          title={attendant.active ? 'Deactivate' : 'Activate'}
                        >
                          {attendant.active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Attendant Form Modal */}
      {showForm && (
        <AttendantForm
          onSubmit={handleCreateAttendant}
          onCancel={() => setShowForm(false)}
          generateTempPassword={generateTempPassword}
          isManager={currentUser?.role === 'manager'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteAttendant && (
        <DeleteConfirmModal
          title={`Deactivate ${deleteAttendant.role === 'admin' ? 'Admin' : 'Attendant'}`}
          message={`Are you sure you want to deactivate "${deleteAttendant.email}"? They will not be able to log in.`}
          onConfirm={() => {
            handleToggleActive(deleteAttendant);
            setDeleteAttendant(null);
          }}
          onCancel={() => setDeleteAttendant(null)}
        />
      )}
    </div>
  );
};

export default AttendantManagement;