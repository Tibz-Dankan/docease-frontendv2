import React, { Fragment, useState } from "react";
import { PatientDisplayAppointmentCard } from "./PatientDisplayAppointmentCard";
import { useSelector, useDispatch } from "react-redux";
import { TAuthState } from "../../types/auth";
import { useQuery } from "@tanstack/react-query";
import {
  showCardNotification,
  hideCardNotification,
} from "../../store/reducers/notification";
import { getAppointmentsByPatient } from "../API";
import { Loader } from "../../shared/UI/Loader";
import { TAppointment } from "../../types/appointments";
import { Button } from "../../shared/UI/Button";

export const PatientAppointmentList: React.FC = () => {
  const dispatch: any = useDispatch();

  const [appointments, setAppointments] = useState<TAppointment[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  const token = useSelector(
    (state: TAuthState) => state.auth.accessToken
  ) as string;

  const userId = useSelector(
    (state: TAuthState) => state.auth.user?.userId
  ) as string;

  const { isLoading } = useQuery({
    queryKey: [`patient-${userId}`],
    queryFn: () =>
      getAppointmentsByPatient({ patientId: userId, token: token }),
    onSuccess: (response: any) => {
      setAppointments(() => {
        return response?.data.appointments;
      });
    },
    onError: (error: any) => {
      dispatch(showCardNotification({ type: "error", message: error.message }));
      setTimeout(() => {
        dispatch(hideCardNotification());
      }, 5000);
    },
  });

  if (isLoading) {
    return <Loader className="w-10 h-10 sm:w-16 sm:h-16 stroke-gray-600" />;
  }

  const getAppointmentsByPatientHandler = async () => {
    try {
      setIsReloading(() => true);
      const data: any = await getAppointmentsByPatient({
        patientId: userId,
        token: token,
      });
      setAppointments(() => {
        return data.data.appointments;
      });
      setIsReloading(() => false);
    } catch (error: any) {
      setIsReloading(() => false);
      dispatch(showCardNotification({ type: "error", message: error.message }));
      setTimeout(() => {
        dispatch(hideCardNotification());
      }, 5000);
    }
  };

  return (
    <Fragment>
      <div className="w-full relative">
        <div
          className="absolute -top-10 right-0 flex items-center
          justify-center bg-yellow-800 rounded text-white
          px-2 font-semibold"
          onClick={() => getAppointmentsByPatientHandler()}
        >
          {isReloading && (
            <Loader className="w-4 h-4 stroke-yellow-800s ml-2" />
          )}
          <Button
            label="Reload"
            type="button"
            className="bg-yellow-800 text-sm text-white py-1"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-16">
          {appointments.map((appointment, index) => (
            <div key={index}>
              <PatientDisplayAppointmentCard appointment={appointment} />
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};
