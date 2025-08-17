import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, UserPlus, Edit, Trash2, Shield, Mail, Building } from 'lucide-react';
import { adminService } from '../../lib/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { Admin } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { formatDate } from '../../lib/utils';

interface AddAdminEmailFormData {
  email: string;
  displayName: string;
}

export const AdminManagement: React.FC = () => {
  const [adminEmails, setAdminEmails] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addAdminData, setAddAdminData] = useState<AddAdminEmailFormData>({
    email: '',
    displayName: ''
  });

  const { userProfile, isManager } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    loadAdminEmails();
  }, []);

  const loadAdminEmails = async () => {
    try {
      const adminsData = await adminService.getAllAdmins();
      setAdminEmails(adminsData);
    } catch (error) {
      console.error('Error loading admin emails:', error);
      
      // Check if it's a schema issue and offer to fix it
      if (error instanceof Error && error.name === 'NotFoundError') {
        addToast({
          type: 'error',
          title: 'Database Schema Issue',
          message: 'Database needs to be upgraded. Click "Fix Database" to resolve this issue.',
          duration: 10000
        });
      } else {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load admin emails. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceUpgrade = async () => {
    try {
      setIsLoading(true);
      await adminService.forceDatabaseUpgrade();
      
      addToast({
        type: 'success',
        title: 'Database Upgraded',
        message: 'Database has been successfully upgraded. Please refresh the page.'
      });
      
      // Reload admin emails after upgrade
      await loadAdminEmails();
    } catch (error) {
      console.error('Error upgrading database:', error);
      addToast({
        type: 'error',
        title: 'Upgrade Failed',
        message: 'Failed to upgrade database. Please refresh the page and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    if (!isManager) {
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'Only managers can add new admin emails.'
      });
      return;
    }

    setIsAddingAdmin(true);
    try {
      // Add admin email to the admins collection for company registration
      const adminData = {
        email: addAdminData.email,
        displayName: addAdminData.displayName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        addedBy: userProfile.uid
      };

      await adminService.createAdmin(adminData, userProfile.uid);

      addToast({
        type: 'success',
        title: 'Admin Email Added',
        message: `Admin email has been added successfully. Companies can now sign up using this email.`
      });

      setShowAddModal(false);
      setAddAdminData({ email: '', displayName: '' });
      
      // Refresh admin emails list
      await loadAdminEmails();
    } catch (error: unknown) {
      console.error('Error adding admin email:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add admin email. Please try again.'
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    if (!userProfile?.uid) return;

    try {
      await adminService.updateAdmin(adminId, { 
        isActive: !currentStatus, 
        updatedAt: new Date() 
      }, userProfile.uid);

      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Admin email ${currentStatus ? 'deactivated' : 'activated'} successfully.`
      });

      await loadAdminEmails();
    } catch (error) {
      console.error('Error updating admin status:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update admin status. Please try again.'
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!userProfile?.uid) return;

    if (!window.confirm('Are you sure you want to delete this admin email? This will prevent companies from signing up with this email.')) {
      return;
    }

    try {
      await adminService.deleteAdmin(adminId, userProfile.uid);

      addToast({
        type: 'success',
        title: 'Admin Email Deleted',
        message: 'Admin email has been deleted successfully.'
      });

      await loadAdminEmails();
    } catch (error) {
      console.error('Error deleting admin email:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete admin email. Please try again.'
      });
    }
  };

  const filteredAdminEmails = adminEmails.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Email Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage admin emails that allow companies to sign up for the platform
          </p>
        </div>
        {isManager && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Admin Email</span>
          </Button>
        )}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search admin emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAdminEmails.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ? 'No admin emails found matching your search.' : 'No admin emails found. Add admin emails to allow companies to sign up.'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={handleForceUpgrade}
                    variant="outline"
                    className="mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Fixing Database...' : 'Fix Database'}
                  </Button>
                )}
              </div>
            ) : (
              filteredAdminEmails.map((admin) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {admin.displayName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {admin.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Added {formatDate(admin.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAdminStatus(admin.id, admin.isActive)}
                        className={admin.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {admin.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Admin Email"
      >
        {isManager ? (
          <form onSubmit={handleAddAdminEmail} className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add an admin email to allow companies to sign up for the platform. Companies will be able to register using this email address.
              </p>
            </div>
            <Input
              label="Full Name"
              value={addAdminData.displayName}
              onChange={(e) => setAddAdminData({...addAdminData, displayName: e.target.value})}
              placeholder="Enter full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={addAdminData.email}
              onChange={(e) => setAddAdminData({...addAdminData, email: e.target.value})}
              placeholder="Enter email address"
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isAddingAdmin}
              >
                Add Admin Email
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-red-600 font-semibold p-4">Only managers can add new admin emails.</div>
        )}
      </Modal>
    </div>
  );
}; 