/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import { Card } from "@/components/ui/card"; // ✅ ShadCN Card
import SettingsDropdown from "@/components/profile/SettingsDropdown";

const ProfileHeader = () => {
  const user = useSelector((state: RootState) => state.user);
  const token = useSelector((state: RootState) => state.user.token);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // ✅ Correct backend URL

  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postCount: 0,
  });

  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    if (user?.id && token && API_BASE_URL) {
      setLoading(true); // ✅ Show loading while fetching
      axios
        .get(`${API_BASE_URL}/follow/stats/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setStats(
            response.data as {
              followersCount: number;
              followingCount: number;
              postCount: number;
            }
          );
          setLoading(false); // ✅ Hide loading after fetching
        })
        .catch((error) => {
          console.error("Error fetching stats:", error);
          setLoading(false);
        });
    }
  }, [user?.id, token, API_BASE_URL]);

  return (
    <Card className="p-6 shadow-lg bg-background rounded-xl">
      {" "}
      {/* ✅ ShadCN Card */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {user.username || "Guest"}
          </h2>
          <p className="text-gray-500">@{user.username || "unknown"}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>
              <strong className="text-foreground">
                {stats.followersCount}
              </strong>{" "}
              Followers
            </span>
            <span>
              <strong className="text-foreground">
                {stats.followingCount}
              </strong>{" "}
              Following
            </span>
            <span>
              <strong className="text-foreground">{stats.postCount}</strong>{" "}
              Posts
            </span>
          </div>
        </div>
        <SettingsDropdown /> {/* ✅ Only one settings dropdown */}
      </div>
    </Card>
  );
};

export default ProfileHeader;
