"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ShowroomForm from "@/components/showroom/ShowroomForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchShowroomById, clearActiveShowroom } from "@/redux/slices/showroomSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditShowroomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeShowroom, status } = useAppSelector((state) => state.showroom);

  useEffect(() => {
    dispatch(fetchShowroomById(id));
    return () => {
      dispatch(clearActiveShowroom());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeShowroom) {
    return <p className="text-ink-muted">Loading showroom...</p>;
  }
  if (!activeShowroom) return null;

  return (
    <div>
      <PageHeader title="Edit Showroom" subtitle={`Editing ${activeShowroom.showroomName}.`} />
      <ShowroomForm
        editingShowroomId={activeShowroom.id}
        defaultValues={{
          showroomName: activeShowroom.showroomName,
          shortName: activeShowroom.shortName ?? "",
          isMainBranch: activeShowroom.isMainBranch ?? false,
          managerName: activeShowroom.managerName,
          contactEmail: activeShowroom.contactEmail,
          contactPhone: activeShowroom.contactPhone,
          address: activeShowroom.address ?? "",
        }}
        onCreated={() => {
          dispatch(showToast("Showroom updated", "success"));
          router.push("/showrooms");
        }}
      />
    </div>
  );
}
