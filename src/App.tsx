import React, { Fragment, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { notificationActions } from "./store";
import { authenticate } from "./store/actions/auth";
import { Notification } from "./shared/UI/Notification";
import { TAuthState, TAuth } from "./types/auth";
import { TNotificationState } from "./types/notification";
import { AuthRoutes } from "./routes/AuthRoutes";
import { PatientRoutes } from "./routes/PatientRoutes";
import { DoctorRoutes } from "./routes/DoctorRoutes";
// import { useGetDeviceToken } from "./hooks/useGetDeviceToken";
import { useLiveNotification } from "./hooks/useLiveNotification";
import { useGetOnlineStatus } from "./hooks/useGetOnlineStatus";
import { useUpdateOnlineStatus } from "./hooks/useUpdateOnlineStatus";
import { useLiveConfNotification } from "./hooks/useLiveConfNotification";
import { LandingPage } from "./common/pages/LandingPage";
// import { Chat } from "./chat/pages/Chat";
// import { io, Socket } from "socket.io-client";

export const App: React.FC = () => {
  const auth = useSelector((state: TAuthState) => state.auth);
  const isLoggedIn = auth.isLoggedIn;
  const isPatient = auth.user?.role === "patient";
  const isDoctor = auth.user?.role === "doctor";
  // const socket: Socket = io(socketUrl);
  // const isAdmin = auth.user?.role === "admin";

  const isLoggedInPatient = isLoggedIn && isPatient;
  const isLoggedInDoctor = isLoggedIn && isDoctor;
  // const  isLoggedInAdmin = isLoggedIn && isAdmin;

  const dispatch: any = useDispatch();

  const notification = useSelector(
    (state: TNotificationState) => state.notification
  );

  const closeCardHandler = () => {
    dispatch(notificationActions.hideCardNotification());
  };

  useEffect(() => {
    setTimeout(() => {
      dispatch(notificationActions.hideCardNotification());
    }, 4000);
  }, [dispatch]);

  // useGetDeviceToken();
  useLiveNotification();
  useLiveConfNotification();
  useGetOnlineStatus();
  useUpdateOnlineStatus();

  useEffect(() => {
    const tryLogin = async () => {
      const strAuthData = localStorage.getItem("auth");
      const parsedAuthData: TAuth = strAuthData && JSON.parse(strAuthData);

      if (!parsedAuthData) {
        localStorage.clear();
        return <Navigate to="/" />;
      }

      const { user, accessToken, expirationTime } = parsedAuthData;

      if (!user || !accessToken) {
        localStorage.clear();
        return <Navigate to="/" />;
      }

      const expiryTime = new Date(expirationTime);
      const currentTime = new Date(Date.now());
      const isExpired = expiryTime < currentTime;

      if (isExpired) {
        localStorage.clear();
        return <Navigate to="/" />;
      }

      dispatch(authenticate(parsedAuthData));
    };
    tryLogin();
  }, [dispatch]);

  return (
    <Fragment>
      <div className="text-base overflow-x-hidden bg-gray-100">
        <BrowserRouter>
          {!isLoggedIn && (
            <Fragment>
              {notification.showCardNotification && (
                <Notification
                  type={notification.cardNotificationType}
                  message={notification.cardMessage}
                  onClose={closeCardHandler}
                />
              )}
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/*" element={<AuthRoutes />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route
                  path="/doctor/dashboard"
                  element={<Navigate to="/auth/doctor/signin" replace />}
                />
                <Route
                  path="/patient/dashboard"
                  element={<Navigate to="/auth/patient/signin" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Fragment>
          )}

          {isLoggedInPatient && (
            <>
              {/* <Chat socket={socket} /> */}
              <Fragment>
                {notification.showCardNotification && (
                  <Notification
                    type={notification.cardNotificationType}
                    message={notification.cardMessage}
                    onClose={closeCardHandler}
                  />
                )}
                <Routes>
                  <Route path="/patient/*" element={<PatientRoutes />} />
                  <Route
                    path="*"
                    element={<Navigate to="/patient/medical-history" replace />}
                  />
                </Routes>
              </Fragment>
            </>
          )}

          {isLoggedInDoctor && (
            <>
              {/* <Chat socket={socket} /> */}
              <Fragment>
                {notification.showCardNotification && (
                  <Notification
                    type={notification.cardNotificationType}
                    message={notification.cardMessage}
                    onClose={closeCardHandler}
                  />
                )}
                <Routes>
                  <Route path="/doctor/*" element={<DoctorRoutes />} />
                  <Route
                    path="*"
                    element={<Navigate to="/doctor/my-patients" replace />}
                  />
                </Routes>
              </Fragment>
            </>
          )}
        </BrowserRouter>
      </div>
    </Fragment>
  );
};
