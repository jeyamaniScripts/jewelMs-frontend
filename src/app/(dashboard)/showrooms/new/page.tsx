"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ShowroomForm from "@/components/showroom/ShowroomForm";
import CredentialsPanel from "@/components/shared/CredentialsPanel";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearShowroomCredentials } from "@/redux/slices/showroomSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewShowroomPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lastCreatedCredentials = useAppSelector((state) => state.showroom.lastCreatedCredentials);

  return (
    <div>
      <PageHeader
        title="Add Showroom"
        subtitle="Open a new showroom. A Showroom Admin login is generated automatically."
      />

      {lastCreatedCredentials ? (
        <div className="max-w-lg">
          <CredentialsPanel
            credentials={lastCreatedCredentials}
            onDone={() => {
              dispatch(clearShowroomCredentials());
              router.push("/showrooms");
            }}
          />
        </div>
      ) : (
        <ShowroomForm onCreated={() => dispatch(showToast("Showroom created", "success"))} />
      )}
    </div>
  );
}
