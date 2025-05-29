import { FC, PropsWithChildren } from 'react';
import { useAntiCapture, UseAntiCaptureProps } from './useFullPage'; // Import types
import { CLIPBOARD, ENTER } from '@/shared/constant';
import classes from "./FullPage.module.css"

/**
 * Props for the FullPage component.
 * Extends the UseAntiCaptureProps to allow passing hook configurations directly.
 */
export interface FullPageProps extends UseAntiCaptureProps {
}

/**
 * A React component that wraps your application content to provide full-page anti-capture protection.
 * It uses the `useAntiCapture` hook internally to manage blur, alerts, and event listeners.
 */
const FullPage: FC<PropsWithChildren<FullPageProps>> = (props) => {
    const {
        children,
        userSelect,
        ...hookProps // Destructure remaining props to pass directly to the hook
    } = props;

    const { blurPage, alertText } = useAntiCapture(hookProps); // Pass hookProps to the hook

    return (
        <>
            <div className={classes.alertAnticapture} style={{
                display: alertText.text ? 'block' : 'none'
            }}>
                {alertText.text && <p style={{ fontWeight: "bolder", color: alertText.color, margin: 0 }}>{alertText.text}</p>}
            </div>
            <div
                id='anticapture-wrapper'
                className={`
                ${classes.anticaptureWrapper} 
                ${blurPage ? classes.anticaptureBlurPage : ""} 
                ${userSelect ? classes.userSelect : ""}
                `}
                style={{
                    transition: 'filter 0.1s ease-in-out',
                }}
            >
                {children}
            </div>
        </>
    );
};

export { FullPage };