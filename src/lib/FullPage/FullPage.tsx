import type {FC, PropsWithChildren} from 'react';

import type {UseAntiCaptureProps} from './useFullPage';
import {useAntiCapture} from './useFullPage'; // Import types
import './FullPage.css';

/**
 * Props for the FullPage component.
 * Extends the UseAntiCaptureProps to allow passing hook configurations directly.
 */
export type FullPageProps = {} & UseAntiCaptureProps;

/**
 * A React component that wraps your application content to provide full-page anti-capture protection.
 */
const FullPage: FC<PropsWithChildren<FullPageProps>> = ({
    children,
    userSelect = true,
    ...hookProps // Destructure remaining props to pass directly to the hook
}) => {
    const {blurPage, alertText} = useAntiCapture(hookProps); // Pass hookProps to the hook

    return (
        <>
            <div
                className="alert-anticapture"
                style={{
                    display: alertText.text ? 'block' : 'none',
                }}>
                {alertText.text && (
                    <p style={{fontWeight: 'bolder', color: alertText.color, margin: 0}}>{alertText.text}</p>
                )}
            </div>
            <div
                id="anticapture-wrapper"
                className={`anticapture-wrapper ${blurPage ? 'anticapture-blur-page' : ''}  ${userSelect ? 'user-select-on' : ''}`}
                style={{
                    transition: 'filter 0.1s ease-in-out',
                }}>
                {children}
            </div>
        </>
    );
};

export {FullPage};
