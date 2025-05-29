import devTools from "devtools-detect";
import { CLIPBOARD, COPY, ENTER, DEFAULT, AlertType } from "@/shared/constant";
import { warningDevtools, isBlacklistedCommand, exitFullscreen } from "@/shared/utils";
import { useState, useEffect } from 'react';

/**
 * Interface for the props of the useAntiCapture hook.
 */
export interface UseAntiCaptureProps {
    /**
    * An optional HTMLElement to attach click listeners for dismissing blur.
    * Defaults to the component's internal wrapper if not provided.
    */
    targetClick?: HTMLElement | null;
    /**
    * If true, prevents clipboard copy/paste actions and context menu.
    */
    clipboardPrevent?: boolean;
    /**
    * If true, detects and prevents developer tools from being open.
    */
    devtoolsPrevent?: boolean;
    /**
    * If true, prevents common screenshot and screen recording keyboard shortcuts.
    */
    screenshotPrevent?: boolean;
    /**
    * If true, turn on user-select css
    */
    userSelect?: boolean;
}

/**
 * Return type of the useAntiCapture hook.
 */
export interface UseAntiCaptureReturn {
    /**
    * True if the page content should be blurred.
    */
    blurPage: boolean;
    /**
    * Object containing the current alert message details.
    */
    alertText: { text: string; color: string; type: AlertType };
}

/**
 * A React hook to implement anti-capture functionalities like preventing screenshots,
 * clipboard operations, and devtools usage.
 * @param props Configuration options for anti-capture features.
 * @returns An object containing `blurPage` state and `alertText` for UI feedback.
 */
export const useAntiCapture = ({
    targetClick,
    clipboardPrevent = false,
    devtoolsPrevent = false,
    screenshotPrevent = true,
}: UseAntiCaptureProps): UseAntiCaptureReturn => {
    const [pressedKeys, setPressedKeys] = useState<Record<string, boolean>>({});
    const [alertText, setAlertText] = useState<{ text: string; color: string; type: AlertType }>({ text: "Press enter to continue.", color: 'black', type: ENTER });
    const [isDevToolsOpen, setIsDevToolsOpen] = useState<boolean>(devTools.isOpen);
    const [blurPage, setBlurPage] = useState<boolean>(true); // Controlled centrally

    const addObjectKey = (key: string): void => setPressedKeys((prevKeys) => ({ ...prevKeys, [key]: true }));
    const deleteObjectKey = (key: string): void => setPressedKeys((prevKeys) => {
        const newKeys = { ...prevKeys };
        delete newKeys[key];
        return newKeys;
    });
    const deleteAllObjectKey = (): void => setPressedKeys({});

    const setAlertPopUp = (type: AlertType): void => {
        switch (type) {
            case COPY:
                setAlertText({ text: "This page is prohibited from being copied or captured!", color: 'red', type: COPY });
                break;
            case CLIPBOARD:
                setAlertText({ text: "Please allow clipboard on your browser to continue.", color: 'red', type: CLIPBOARD });
                break;
            case ENTER:
                setAlertText({ text: "Press enter to continue.", color: 'black', type: ENTER });
                break;
            case DEFAULT:
                setAlertText({ text: "", color: '', type: DEFAULT });
                break;
            default:
                break;
        }
    };

    const keyPressedArray = (): string[] => Object.keys(pressedKeys);
    useEffect(() => {
        if (pressedKeys && Object.keys(pressedKeys).length > 0 && alertText.type !== CLIPBOARD) {
            const result = isBlacklistedCommand(keyPressedArray())

            if (result) {
                setBlurPage(true)
                setAlertPopUp(COPY)
                deleteAllObjectKey()
            }
        }
    }, [pressedKeys])

    // --- DevTools Prevention ---
    if (devtoolsPrevent) useEffect(() => {
        const handleChange = (event: CustomEvent<{ isOpen: boolean; orientation: 'vertical' | 'horizontal' }>) => {
            if (event.detail.isOpen) {
                setIsDevToolsOpen(true);
            } else {
                window.location.reload();
            }
        };

        window.addEventListener("devtoolschange", handleChange as EventListener);

        let intervalLog: ReturnType<typeof setInterval> | undefined;
        if (isDevToolsOpen) {
            console.clear();
            intervalLog = setInterval(() => {
                console.log("%c Close your devtools/console!", 'background: #222; color: #bada55; font-size: 50px; text-align: end');
                setTimeout(() => { console.clear(); }, 900);
            }, 1000);
            warningDevtools();
        }

        return () => {
            if (intervalLog) clearInterval(intervalLog);
            window.removeEventListener("devtoolschange", handleChange as EventListener);
        };
    }, [isDevToolsOpen, devtoolsPrevent]);

    // --- Clipboard and Context Menu Prevention ---
    if (clipboardPrevent) useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault();
        const rewriteClipboard = (e: ClipboardEvent) => {
            e.preventDefault();
            navigator.clipboard.writeText("");
            setAlertPopUp(COPY);
            setBlurPage(true);
        };

        window.addEventListener("contextmenu", preventDefault);
        window.addEventListener("copy", rewriteClipboard);
        window.addEventListener("paste", rewriteClipboard);

        return () => {
            window.removeEventListener("contextmenu", preventDefault);
            window.removeEventListener("copy", rewriteClipboard);
            window.removeEventListener("paste", rewriteClipboard);
        };
    }, [clipboardPrevent]);

    // --- Keydown and Keyup Handling for Screenshots/Inspect Element ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                if (alertText.type === ENTER || alertText.type === CLIPBOARD) {
                    setAlertPopUp(DEFAULT);
                    setBlurPage(false);
                }
            } else {
                if (screenshotPrevent) {
                    // Prevent common inspect element/devtools shortcuts
                    if (event.key === "F12") event.preventDefault();
                    if (event.ctrlKey && event.code === "KeyU") event.preventDefault();
                    if (event.ctrlKey && event.shiftKey && ['KeyI', 'KeyC', 'KeyJ'].includes(event.code)) event.preventDefault();
                }

                // Add pressed key using event.code
                addObjectKey(event.code);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (alertText.type === ENTER || alertText.type === CLIPBOARD) {
                deleteObjectKey(event.code);
                return;
            }

            if (screenshotPrevent && event.key === "PrintScreen") {
                event.preventDefault();
                setBlurPage(true);
                setAlertPopUp(COPY);
                navigator.clipboard.writeText("");
            } else {
                // Delete released key using event.code
                deleteObjectKey(event.code);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [alertText.type, screenshotPrevent]);

    // --- Page Blur on Mouse Leave ---
    useEffect(() => {
        const blurPageOnMouseLeave = () => {
            if ([ENTER, CLIPBOARD].includes(alertText.type)) return;
            setBlurPage(true);
        };

        document.querySelector("html")?.addEventListener("mouseleave", blurPageOnMouseLeave);

        return () => {
            document.querySelector("html")?.removeEventListener("mouseleave", blurPageOnMouseLeave);
        };
    }, [alertText.type]);

    const handleWrapperClick = (e: MouseEvent) => {

        if (blurPage && ![ENTER, CLIPBOARD].includes(alertText.type)) {
            setBlurPage(false);
            if (alertText.type === COPY) {
                setAlertPopUp(DEFAULT);
            }
        }
    };
    // --- Click to Dismiss Blur/Alert ---
    useEffect(() => {
        let targetElement: HTMLElement | null = targetClick || document.querySelector("html");

        if (targetElement) {
            targetElement.addEventListener("click", handleWrapperClick);
        }

        return () => {
            if (targetElement) {
                targetElement.removeEventListener("click", handleWrapperClick);
            }
        };
    }, [alertText, blurPage, targetClick]);

    return {
        blurPage,
        alertText,
    };
};
