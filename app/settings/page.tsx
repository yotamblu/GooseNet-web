"use client";

/**
 * Settings Page
 * Allows users to change their password and profile picture
 */

import { useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";
import { apiService } from "../services/api";
import {
  AppShell,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
  Tabs,
  fadeUp,
  stagger,
  transitionQuick,
} from "../components/ui";

type SettingsTab = "profile" | "security";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
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

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useRequireAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

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
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB");
      return;
    }

    setImageError("");
    setImageSuccess("");
    setSelectedImage(file);

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
      const base64String = await fileToBase64(selectedImage);

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

    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
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
      <AppShell title="Settings" subtitle="Manage your account" maxWidth="md">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
          <Spinner size="lg" variant="brand" />
          <p className="text-sm">Loading your settings…</p>
        </div>
      </AppShell>
    );
  }

  const tabItems = [
    { value: "profile" as const, label: "Profile" },
    { value: "security" as const, label: "Security" },
  ];

  return (
    <AppShell title="Settings" subtitle="Manage your account" maxWidth="md" gradientTitle>
      <div className="flex flex-col gap-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          <div className="-mx-1 px-1 overflow-x-auto scrollbar-thin">
            <Tabs<SettingsTab>
              items={tabItems}
              value={activeTab}
              onChange={(v) => setActiveTab(v)}
              variant="pills"
              ariaLabel="Settings sections"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto justify-center"
            iconLeft={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to dashboard
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "profile" ? (
            <motion.div
              key="profile"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: transitionQuick }}
              className="flex flex-col gap-6"
            >
              <motion.div variants={fadeUp}>
                <Card variant="glass" padding="lg">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-lg">Profile picture</CardTitle>
                      <CardDescription>
                        Upload a new avatar or revert to the default goose.
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-center sm:justify-start gap-6 sm:gap-8">
                      <div className="text-center">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Current
                        </p>
                        <div className="group relative mx-auto h-24 w-24">
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/60 via-purple-500/50 to-teal-400/50 blur-md opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                          {user?.profilePicString ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={getProfilePicSrc(user.profilePicString)}
                              alt={user.userName}
                              referrerPolicy="no-referrer"
                              className="relative h-24 w-24 rounded-full border-2 border-white dark:border-gray-900 object-cover shadow-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="relative h-24 w-24 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-lg">
                              <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {imagePreview && (
                          <motion.div
                            key="preview"
                            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 320, damping: 26 }}
                            className="text-center"
                          >
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              New preview
                            </p>
                            <div className="relative mx-auto h-24 w-24">
                              <span
                                aria-hidden
                                className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-teal-400 blur-md opacity-80 animate-pulse-glow"
                              />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="relative h-24 w-24 rounded-full border-2 border-white dark:border-gray-900 object-cover shadow-lg"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex-1 basis-full sm:basis-auto min-w-[12rem] space-y-3 text-center sm:text-left">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {user?.userName ?? "Your profile"}
                          </div>
                          {user?.role && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {user.role.toLowerCase()}
                            </div>
                          )}
                        </div>
                        {user?.profilePicString && (
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            onClick={handleRevertToDefault}
                            disabled={isRevertingToDefault || isUploadingImage}
                            loading={isRevertingToDefault}
                            iconLeft={
                              !isRevertingToDefault ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : undefined
                            }
                          >
                            {isRevertingToDefault ? "Reverting…" : "Revert to default"}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="profilePicture" className="mb-2 block">
                        Select a new picture
                      </Label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isDragging
                            ? "border-blue-500 bg-blue-50/70 dark:border-blue-400 dark:bg-blue-400/10 shadow-glow-brand"
                            : "border-gray-300 dark:border-white/10 hover:border-blue-500/70 dark:hover:border-blue-400/70 bg-gray-50/80 dark:bg-white/[0.02]"
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
                          <motion.svg
                            animate={isDragging && !reduce ? { y: [-2, 2, -2] } : { y: 0 }}
                            transition={{ repeat: isDragging ? Infinity : 0, duration: 1.2 }}
                            className={`h-12 w-12 ${
                              isDragging
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </motion.svg>
                          <div className="text-sm">
                            <span className="font-semibold text-gradient-brand">Click to upload</span>
                            <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG, GIF, WebP · up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {imageError && (
                        <motion.div
                          key="img-err"
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-400/30 px-4 py-3 flex items-start gap-2"
                          role="alert"
                        >
                          <svg className="h-5 w-5 text-rose-600 dark:text-rose-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.75-2.97l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z" />
                          </svg>
                          <p className="text-sm text-rose-800 dark:text-rose-200">{imageError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {imageSuccess && (
                        <motion.div
                          key="img-ok"
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-400/30 px-4 py-3 flex items-start gap-2"
                          role="status"
                        >
                          <svg className="h-5 w-5 text-teal-600 dark:text-teal-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm text-teal-800 dark:text-teal-200">{imageSuccess}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                      {selectedImage && (
                        <Button
                          variant="secondary"
                          onClick={handleCancelImageUpload}
                          disabled={isUploadingImage}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="gradient"
                        onClick={handleImageUpload}
                        disabled={!selectedImage || isUploadingImage}
                        loading={isUploadingImage}
                        className="w-full sm:w-auto"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {imageSuccess ? (
                            <motion.span
                              key="uploaded"
                              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                              className="inline-flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Uploaded
                            </motion.span>
                          ) : (
                            <motion.span
                              key="upload"
                              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                            >
                              {isUploadingImage ? "Uploading…" : "Upload picture"}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="security"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: transitionQuick }}
              className="flex flex-col gap-6"
            >
              <motion.div variants={fadeUp}>
                <Card variant="glass" padding="lg">
                  <CardHeader>
                    <div>
                      <CardTitle className="text-lg">Change password</CardTitle>
                      <CardDescription>
                        Use at least 8 characters. A strong, unique password keeps your flock safe.
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      label="New password"
                      placeholder="Enter your new password"
                      helperText="Password must be 8 or more characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />

                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      label="Confirm new password"
                      placeholder="Confirm your new password"
                      helperText="Passwords must match"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />

                    <AnimatePresence>
                      {passwordError && (
                        <motion.div
                          key="pw-err"
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-400/30 px-4 py-3 flex items-start gap-2"
                          role="alert"
                        >
                          <svg className="h-5 w-5 text-rose-600 dark:text-rose-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.75-2.97l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z" />
                          </svg>
                          <p className="text-sm text-rose-800 dark:text-rose-200">{passwordError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {passwordSuccess && (
                        <motion.div
                          key="pw-ok"
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-400/30 px-4 py-3 flex items-start gap-2"
                          role="status"
                        >
                          <svg className="h-5 w-5 text-teal-600 dark:text-teal-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-sm text-teal-800 dark:text-teal-200">{passwordSuccess}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                      <Button
                        type="submit"
                        variant="gradient"
                        className="w-full sm:w-auto"
                        disabled={isChangingPassword}
                        loading={isChangingPassword}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {passwordSuccess ? (
                            <motion.span
                              key="saved"
                              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                              transition={{ type: "spring", stiffness: 400, damping: 22 }}
                              className="inline-flex items-center gap-2"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Saved
                            </motion.span>
                          ) : (
                            <motion.span
                              key="save"
                              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                            >
                              {isChangingPassword ? "Changing…" : "Change password"}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card
                  variant="default"
                  padding="lg"
                  className="border-rose-300/70 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-500/[0.04]"
                >
                  <CardHeader>
                    <div>
                      <CardTitle className="text-lg text-rose-700 dark:text-rose-300">
                        Danger zone
                      </CardTitle>
                      <CardDescription>
                        Sign out of this device. You&apos;ll need to log in again to access GooseNet.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-end">
                    <Button variant="danger" onClick={handleLogout} className="w-full sm:w-auto">
                      Log out
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
