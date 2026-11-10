"use client";

import { useLaunch } from "./LaunchProvider";

export default function JoinHeading() {
  const { launched } = useLaunch();
  return (
    <h2 id="join-title" className="h2">
      {launched ? (
        <>
          Founding enrolment is open.{" "}
          <span className="quiet">Your plan starts with one payment.</span>
        </>
      ) : (
        <>
          Get the launch alert.{" "}
          <span className="quiet">On WhatsApp, the moment doors open.</span>
        </>
      )}
    </h2>
  );
}
