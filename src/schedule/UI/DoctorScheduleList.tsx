import React, { Fragment } from "react";

import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { TAuthState } from "../../types/auth";
import {
  hideCardNotification,
  showCardNotification,
} from "../../store/actions/notification";
import { Loader } from "../../shared/UI/Loader";
import { getScheduleByUser } from "../API";
import { buildScheduleList } from "../../utils/buildScheduleList";
import { Schedule } from "../../types/schedule";

interface DoctorScheduleListProps {
  doctorId: string;
}

export const DoctorScheduleList: React.FC<DoctorScheduleListProps> = (
  props
) => {
  const dispatch: any = useDispatch();

  const token = useSelector(
    (state: TAuthState) => state.auth.accessToken
  ) as string;

  const doctorId = props.doctorId;

  const { isLoading, data } = useQuery({
    queryKey: [`doctor-schedule-${doctorId}`],
    queryFn: () => getScheduleByUser({ userId: doctorId, token: token }),
    onSuccess: () => {
      //TODO: dispatch an action to store schedules in the redux store
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

  if (!data) return;

  const scheduleList = buildScheduleList(data.data?.schedules);

  console.log("data scheduleList=>", scheduleList);

  const showScheduleItem = (schedule: Schedule): boolean => {
    let showSchedule: boolean = !!(
      schedule.scheduleId && schedule.scheduleTime[0]
    );
    if (showSchedule) return true;

    return false;
  };

  return (
    <Fragment>
      <div>
        <div className="text-sm text-gray-800">
          <div
            className=" border-b-[1px] border-gray-300
            text-primary space-y-4 py-4 h-auto"
          >
            {scheduleList.map((schedule, index) => {
              if (showScheduleItem(schedule)) {
                return (
                  <div key={index} className="flex items-center gap-4">
                    <p className="w-20 text-start first-letter:uppercase">
                      {schedule.weekday}
                    </p>
                    <p className="space-x-2">
                      {schedule.scheduleTime.map((timeSlot, index) => (
                        <span
                          key={index}
                          className="bg-gray-300 rounded p-2 text-center
                          text-[12px] font-semibold"
                        >
                          {timeSlot.start} - {timeSlot.end}
                        </span>
                      ))}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </Fragment>
  );
};