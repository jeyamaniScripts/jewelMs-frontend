"use client";

import { useEffect } from "react";
import { MdDiamond, MdStorefront, MdPeople, MdCheckCircle } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchDashboardStats } from "@/redux/slices/dashboardSlice";
import { ROLE_LABEL } from "@/constants/roles";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  const { stats, status } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const isLoading = status === "loading" && !stats;

  return (
    <div>
      <PageHeader
        title={`Welcome back${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        subtitle={role ? `Signed in as ${ROLE_LABEL[role]}` : undefined}
      />

      {isLoading ? (
        <p className="text-ink-muted">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats?.totalBrands !== undefined && (
            <StatCard label="Jewelry Brands" value={stats.totalBrands} icon={MdDiamond} />
          )}
          {stats?.activeBrands !== undefined && (
            <StatCard label="Active Brands" value={stats.activeBrands} icon={MdCheckCircle} />
          )}
          {stats?.totalShowrooms !== undefined && (
            <StatCard label="Showrooms" value={stats.totalShowrooms} icon={MdStorefront} />
          )}
          {stats?.activeShowrooms !== undefined && (
            <StatCard label="Active Showrooms" value={stats.activeShowrooms} icon={MdCheckCircle} />
          )}
          {stats?.totalEmployees !== undefined && (
            <StatCard label="Employees" value={stats.totalEmployees} icon={MdPeople} />
          )}
          {stats?.activeEmployees !== undefined && (
            <StatCard label="Active Employees" value={stats.activeEmployees} icon={MdCheckCircle} />
          )}
        </div>
      )}
    </div>
  );
}
