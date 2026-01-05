"use client";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const variantClasses = {
        danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
        info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    };

    const iconColors = {
        danger: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
        warning: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
        info: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform transition-all">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${iconColors[variant]}`}>
                            {variant === "danger" && (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            {variant === "warning" && (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            {variant === "info" && (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-semibold rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2.5 text-white font-semibold rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${variantClasses[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
