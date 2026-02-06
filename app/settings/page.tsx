"use client";

/**
 * Settings Page
 * Allows users to change their password and profile picture
 */

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile picture change state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [imageSuccess, setImageSuccess] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRevertingToDefault, setIsRevertingToDefault] = useState(false);
  
  // Require authentication - redirects to login if not authenticated
  useRequireAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    if (!user?.apiKey) {
      setPasswordError("API key not found. Please log in again.");
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      await apiService.changePassword(user.apiKey, newPassword);
      
      setPasswordSuccess("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB");
      return;
    }
    
    setImageError("");
    setImageSuccess("");
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    processImageFile(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      setImageError("Please select an image first");
      return;
    }
    
    if (!user?.apiKey) {
      setImageError("API key not found. Please log in again.");
      return;
    }
    
    setIsUploadingImage(true);
    setImageError("");
    setImageSuccess("");
    
    try {
      // Convert image to base64
      const base64String = await fileToBase64(selectedImage);
      
      // Upload with isRevert=false
      await apiService.changeProfilePicture(user.apiKey, base64String, false);
      
      setImageSuccess("Profile picture updated successfully!");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      setTimeout(() => {
        setImageSuccess("");
        setImagePreview(null);
      }, 3000);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelImageUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError("");
    setImageSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRevertToDefault = async () => {
    if (!user?.apiKey) {
      setImageError("API key not found. Please log in again.");
      return;
    }
    
    setIsRevertingToDefault(true);
    setImageError("");
    setImageSuccess("");
    
    // Clear any selected image
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    try {
      // Send empty PicString with isRevert=true
      await apiService.changeProfilePicture(user.apiKey, "", true);
      
      setImageSuccess("Profile picture reverted to default successfully!");
      
      setTimeout(() => {
        setImageSuccess("");
      }, 3000);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Failed to revert to default picture. Please try again.");
    } finally {
      setIsRevertingToDefault(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">GooseNet</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user?.profilePicString && (
              <img
                src={getProfilePicSrc(user.profilePicString)}
                alt={user.userName}
                referrerPolicy="no-referrer"
                className="cursor-pointer hidden md:block h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <button
              onClick={handleLogout}
              className="cursor-pointer rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-12 sm:px-6 sm:py-24 overflow-hidden">
        {/* Glowing purple/blue background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 dark:from-purple-500/15 dark:via-blue-500/15 dark:to-purple-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/25 dark:bg-blue-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Settings
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Manage your account settings
            </p>
          </div>

          <div className="space-y-8">
            {/* Change Password Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                    placeholder="Enter your new password"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be 8 or more characters</p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400"
                    placeholder="Confirm your new password"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Passwords must match</p>
                </div>
                
                {passwordError && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 px-4 py-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-sm text-red-800 dark:text-red-300">{passwordError}</p>
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 px-4 py-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-800 dark:text-green-300">{passwordSuccess}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </form>
            </div>

            {/* Change Profile Picture Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Change Profile Picture</h2>
              </div>
              
              <div className="space-y-4">
                {/* Current Profile Picture */}
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Picture</p>
                    {user?.profilePicString ? (
                      <img
                        src={getProfilePicSrc(user.profilePicString)}
                        alt={user.userName}
                        referrerPolicy="no-referrer"
                        className="h-24 w-24 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Picture Preview</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-24 rounded-full border-2 border-blue-600 dark:border-blue-400 object-cover"
                      />
                    </div>
                  )}
                </div>
                
                {/* Revert to Default Button */}
                {user?.profilePicString && (
                  <div>
                    <button
                      onClick={handleRevertToDefault}
                      disabled={isRevertingToDefault || isUploadingImage}
                      className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRevertingToDefault ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Reverting...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Revert to Default
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Drag and Drop Zone */}
                <div>
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select New Picture
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className={`h-12 w-12 ${
                          isDragging
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <div className="text-sm">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          Click to upload
                        </span>
                        <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Accepted formats: JPG, PNG, GIF, WebP (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                
                {imageError && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 px-4 py-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-sm text-red-800 dark:text-red-300">{imageError}</p>
                  </div>
                )}
                
                {imageSuccess && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 px-4 py-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-800 dark:text-green-300">{imageSuccess}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleImageUpload}
                    disabled={!selectedImage || isUploadingImage}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploadingImage ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      "Upload Picture"
                    )}
                  </button>
                  
                  {selectedImage && (
                    <button
                      onClick={handleCancelImageUpload}
                      disabled={isUploadingImage}
                      className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

