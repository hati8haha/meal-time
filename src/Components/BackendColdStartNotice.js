import React from "react";
import {
  startBackendColdStartMonitor,
  subscribeBackendColdStart,
} from "../utils/backendColdStartMonitor";

function BackendColdStartNotice() {
  const [isColdStarting, setIsColdStarting] = React.useState(false);

  React.useEffect(() => {
    startBackendColdStartMonitor();

    return subscribeBackendColdStart((event) => {
      setIsColdStarting(Boolean(event.detail && event.detail.isColdStarting));
    });
  }, []);

  if (!isColdStarting) return null;

  return (
    <div className="backend-cold-start-notice" role="status" aria-live="polite">
      <div className="backend-cold-start-notice__spinner" aria-hidden="true" />
      <div>
        <div className="backend-cold-start-notice__title">伺服器正在喚醒</div>
        <div className="backend-cold-start-notice__message">
          連線需要一點時間，資料回來後會自動更新。
        </div>
      </div>
    </div>
  );
}

export default BackendColdStartNotice;
