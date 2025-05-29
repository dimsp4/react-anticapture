/**
 * Displays a warning message to the user, instructing them to close devtools/console.
 * This function directly manipulates the DOM.
 */
export const warningDevtools = (): void => {
    document.body.innerHTML = '<p class="font-weight-bold">Please close devtools/console to continue.</p>';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.display = 'flex';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    document.body.style.backgroundColor = '#f0f0f0';
    document.body.style.color = '#333';
};

/**
 * Checks if a given key combination matches any of the blacklisted commands.
 * @param keyCombinationCodes An array of `KeyboardEvent.code` values representing the pressed keys.
 * @returns `true` if the combination is blacklisted, `false` otherwise.
 */
export const isBlacklistedCommand = (keyCombinationCodes: string[]): boolean => {
    // Define the blacklisted commands using the more specific 'event.code' values
    // For modifier keys, we will check for either left or right variants.
    const blacklistCommands: string[][] = [
        // Screenshot/Screen Recording (using event.code for precision)
        ["PrintScreen"],
        ["Meta"],
        ["Alt", "PrintScreen"], // This will be handled specially
        ["Meta", "PrintScreen"], // This will be handled specially
        ["Meta", "Shift"],       // This will be handled specially
        ["Meta", "Shift", "KeyS"],
        ["Meta", "Shift", "Digit3"],
        ["Meta", "Shift", "Digit4"],
        ["Control", "Shift", "KeyP"], // This will be handled specially
        ["Meta", "KeyG"],
        ["Meta", "Alt", "KeyR"],
        ["Shift", "Meta", "Digit5"],

        // Inspect Element / Developer Tools
        ["F12"],
        ["Control", "Shift", "KeyI"],
        ["Control", "Shift", "KeyC"],
        ["Control", "Shift", "KeyJ"],
        ["Control", "KeyU"],
    ];

    // Helper function to normalize modifier codes
    // e.g., converts 'MetaLeft' or 'MetaRight' to 'Meta' for comparison
    const normalizeCode = (code: string): string => {
        if (code === 'MetaLeft' || code === 'MetaRight') return 'Meta';
        if (code === 'AltLeft' || code === 'AltRight') return 'Alt';
        if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
        if (code === 'ControlLeft' || code === 'ControlRight') return 'Control';
        return code;
    };

    // Normalize the incoming key combination codes
    const normalizedKeyCombination = keyCombinationCodes.map(normalizeCode);

    // Sort the normalized incoming key combination for consistent comparison
    const sortedNormalizedKeyCombination = [...normalizedKeyCombination].sort();

    return blacklistCommands.some(blacklisted => {
        // Normalize the blacklisted command for consistent comparison
        const sortedNormalizedBlacklisted = [...blacklisted].map(normalizeCode).sort();

        // Check if the lengths match and all normalized keys are present in both arrays in order
        return sortedNormalizedBlacklisted.length === sortedNormalizedKeyCombination.length &&
               sortedNormalizedBlacklisted.every((key, index) => key === sortedNormalizedKeyCombination[index]);
    });
};

/**
 * Requests the browser to enter fullscreen mode for a given element.
 * @param element The HTML element to make fullscreen.
 */
export const enterFullscreen = (element: HTMLElement | null): void => {
    if (element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) { /* Safari */
            (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) { /* Firefox */
            (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) { /* IE11 */
            (element as any).msRequestFullscreen();
        }
    }
};

/**
 * Requests the browser to exit fullscreen mode.
 * This function should be called on the `document` object.
 */
export const exitFullscreen = (): void => {
    if (document.fullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) { /* Safari */
            (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) { /* Firefox */
            (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) { /* IE11 */
            (document as any).msExitFullscreen();
        }
    }
};