import type { FC } from 'react';
import './index.css';
import AntiCapture from '@/lib';

const App: FC = () => {
    return (
        <AntiCapture
        clipboardPrevent
        screenshotPrevent
        devtoolsPrevent
        >
            <main>
                <h1>Welcome to the AntiCapture Demo</h1>
                <p>This is a demonstration of the AntiCapture functionality.</p>
                <p>Try to take a screenshot or copy text to see the anti-capture features in action!</p>
                <div className="anticapture-demo">
                    {/* Your demo content goes here */}
                    <p>Hover and Unhover over this page to see the anti-capture effect. Click the blur page to unblur. </p>
                </div>
            </main>
        </AntiCapture>
    );
};

export default App;
