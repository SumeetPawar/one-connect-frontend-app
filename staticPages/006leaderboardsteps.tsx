// app/leaderboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Award } from 'lucide-react';

interface LeaderboardUser {
  user_id: string;
  username: string;
  total_steps: number;
  current_streak: number;
  rank: number;
  avatar_color?: string;
  weekly_avg?: number;
}

type LeaderboardType = 'steps' | 'consistency';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('consistency');
  const [stepsLeaders, setStepsLeaders] = useState<LeaderboardUser[]>([]);
  const [consistencyLeaders, setConsistencyLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabSwitching, setTabSwitching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  const pullThreshold = 80;

  useEffect(() => {
    fetchLeaderboards();
    
    // Scroll listener for scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchTab = (tab: LeaderboardType) => {
    if (tab === activeTab) return;
    
    setTabSwitching(true);
    
    // Show skeleton for 400ms before switching
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => {
        setTabSwitching(false);
      }, 100);
    }, 400);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    
    // Track pull start for refresh
    if (window.scrollY === 0) {
      setPullStart(e.targetTouches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Handle pull-to-refresh
    if (pullStart !== null && window.scrollY === 0) {
      const pullDistance = e.targetTouches[0].clientY - pullStart;
      if (pullDistance > 0 && pullDistance < pullThreshold) {
        setIsPulling(true);
      }
    }
  };

  const onTouchEnd = () => {
    // Handle horizontal swipe
    if (touchStart && touchEnd) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe && activeTab === 'consistency') {
        switchTab('steps');
      }
      if (isRightSwipe && activeTab === 'steps') {
        switchTab('consistency');
      }
    }
    
    // Handle pull-to-refresh
    if (pullStart !== null && isPulling) {
      setIsRefreshing(true);
      setIsPulling(false);
      
      // Simulate refresh
      setTimeout(() => {
        fetchLeaderboards();
        setIsRefreshing(false);
      }, 1500);
    }
    
    setPullStart(null);
    setIsPulling(false);
  };

  const fetchLeaderboards = async () => {
    try {
      // Get current user - hardcoded for demo
      setCurrentUserId('5'); // Lisa Thompson will be "You"

      // Mock data for demonstration - 58 total users
      const mockStepsData: LeaderboardUser[] = [
        { user_id: '1', username: 'Sarah Chen', total_steps: 124500, current_streak: 28, rank: 1, avatar_color: '#8B5CF6', weekly_avg: 12450 },
        { user_id: '2', username: 'Marcus Johnson', total_steps: 118200, current_streak: 21, rank: 2, avatar_color: '#EC4899', weekly_avg: 11820 },
        { user_id: '3', username: 'Emily Rodriguez', total_steps: 112800, current_streak: 35, rank: 3, avatar_color: '#3B82F6', weekly_avg: 11280 },
        { user_id: '4', username: 'David Kim', total_steps: 108400, current_streak: 14, rank: 4, avatar_color: '#10B981', weekly_avg: 10840 },
        { user_id: '5', username: 'Lisa Thompson', total_steps: 102900, current_streak: 19, rank: 5, avatar_color: '#F59E0B', weekly_avg: 10290 },
        { user_id: '6', username: 'James Park', total_steps: 98600, current_streak: 42, rank: 6, avatar_color: '#EF4444', weekly_avg: 9860 },
        { user_id: '7', username: 'Anna Martinez', total_steps: 94200, current_streak: 7, rank: 7, avatar_color: '#8B5CF6', weekly_avg: 9420 },
        { user_id: '8', username: 'Tom Wilson', total_steps: 89800, current_streak: 31, rank: 8, avatar_color: '#06B6D4', weekly_avg: 8980 },
        { user_id: '9', username: 'Jessica Lee', total_steps: 87500, current_streak: 18, rank: 9, avatar_color: '#F59E0B', weekly_avg: 8750 },
        { user_id: '10', username: 'Michael Brown', total_steps: 85300, current_streak: 25, rank: 10, avatar_color: '#10B981', weekly_avg: 8530 },
        { user_id: '11', username: 'Rachel Green', total_steps: 83100, current_streak: 12, rank: 11, avatar_color: '#EC4899', weekly_avg: 8310 },
        { user_id: '12', username: 'Kevin Zhang', total_steps: 81200, current_streak: 33, rank: 12, avatar_color: '#3B82F6', weekly_avg: 8120 },
        { user_id: '13', username: 'Nicole Anderson', total_steps: 79400, current_streak: 9, rank: 13, avatar_color: '#8B5CF6', weekly_avg: 7940 },
        { user_id: '14', username: 'Robert Taylor', total_steps: 77800, current_streak: 22, rank: 14, avatar_color: '#EF4444', weekly_avg: 7780 },
        { user_id: '15', username: 'Amy Wu', total_steps: 76200, current_streak: 16, rank: 15, avatar_color: '#06B6D4', weekly_avg: 7620 },
        { user_id: '16', username: 'Daniel Harris', total_steps: 74600, current_streak: 28, rank: 16, avatar_color: '#F59E0B', weekly_avg: 7460 },
        { user_id: '17', username: 'Sophia Moore', total_steps: 73100, current_streak: 11, rank: 17, avatar_color: '#10B981', weekly_avg: 7310 },
        { user_id: '18', username: 'Chris Martin', total_steps: 71500, current_streak: 19, rank: 18, avatar_color: '#EC4899', weekly_avg: 7150 },
        { user_id: '19', username: 'Olivia Davis', total_steps: 70200, current_streak: 24, rank: 19, avatar_color: '#3B82F6', weekly_avg: 7020 },
        { user_id: '20', username: 'Ryan Garcia', total_steps: 68800, current_streak: 8, rank: 20, avatar_color: '#8B5CF6', weekly_avg: 6880 },
        { user_id: '21', username: 'Emma White', total_steps: 67400, current_streak: 30, rank: 21, avatar_color: '#EF4444', weekly_avg: 6740 },
        { user_id: '22', username: 'Brandon Lee', total_steps: 66100, current_streak: 14, rank: 22, avatar_color: '#06B6D4', weekly_avg: 6610 },
        { user_id: '23', username: 'Mia Thomas', total_steps: 64800, current_streak: 21, rank: 23, avatar_color: '#F59E0B', weekly_avg: 6480 },
        { user_id: '24', username: 'Justin Clark', total_steps: 63500, current_streak: 17, rank: 24, avatar_color: '#10B981', weekly_avg: 6350 },
        { user_id: '25', username: 'Isabella Lopez', total_steps: 62300, current_streak: 26, rank: 25, avatar_color: '#EC4899', weekly_avg: 6230 },
        { user_id: '26', username: 'Tyler Scott', total_steps: 61100, current_streak: 10, rank: 26, avatar_color: '#3B82F6', weekly_avg: 6110 },
        { user_id: '27', username: 'Ava Robinson', total_steps: 59900, current_streak: 23, rank: 27, avatar_color: '#8B5CF6', weekly_avg: 5990 },
        { user_id: '28', username: 'Jason King', total_steps: 58700, current_streak: 15, rank: 28, avatar_color: '#EF4444', weekly_avg: 5870 },
        { user_id: '29', username: 'Grace Hall', total_steps: 57600, current_streak: 29, rank: 29, avatar_color: '#06B6D4', weekly_avg: 5760 },
        { user_id: '30', username: 'Nathan Wright', total_steps: 56400, current_streak: 13, rank: 30, avatar_color: '#F59E0B', weekly_avg: 5640 },
        { user_id: '31', username: 'Chloe Adams', total_steps: 55300, current_streak: 20, rank: 31, avatar_color: '#10B981', weekly_avg: 5530 },
        { user_id: '32', username: 'Eric Turner', total_steps: 54200, current_streak: 16, rank: 32, avatar_color: '#EC4899', weekly_avg: 5420 },
        { user_id: '33', username: 'Lily Phillips', total_steps: 53100, current_streak: 27, rank: 33, avatar_color: '#3B82F6', weekly_avg: 5310 },
        { user_id: '34', username: 'Andrew Carter', total_steps: 52100, current_streak: 9, rank: 34, avatar_color: '#8B5CF6', weekly_avg: 5210 },
        { user_id: '35', username: 'Zoe Mitchell', total_steps: 51000, current_streak: 22, rank: 35, avatar_color: '#EF4444', weekly_avg: 5100 },
        { user_id: '36', username: 'Matthew Evans', total_steps: 50000, current_streak: 18, rank: 36, avatar_color: '#06B6D4', weekly_avg: 5000 },
        { user_id: '37', username: 'Hannah Cooper', total_steps: 49000, current_streak: 25, rank: 37, avatar_color: '#F59E0B', weekly_avg: 4900 },
        { user_id: '38', username: 'Jacob Rivera', total_steps: 48100, current_streak: 11, rank: 38, avatar_color: '#10B981', weekly_avg: 4810 },
        { user_id: '39', username: 'Victoria Bell', total_steps: 47200, current_streak: 19, rank: 39, avatar_color: '#EC4899', weekly_avg: 4720 },
        { user_id: '40', username: 'Dylan Murphy', total_steps: 46300, current_streak: 24, rank: 40, avatar_color: '#3B82F6', weekly_avg: 4630 },
        { user_id: '41', username: 'Samantha Reed', total_steps: 45500, current_streak: 8, rank: 41, avatar_color: '#8B5CF6', weekly_avg: 4550 },
        { user_id: '42', username: 'Connor Bailey', total_steps: 44600, current_streak: 31, rank: 42, avatar_color: '#EF4444', weekly_avg: 4460 },
        { user_id: '43', username: 'Natalie Cox', total_steps: 43800, current_streak: 14, rank: 43, avatar_color: '#06B6D4', weekly_avg: 4380 },
        { user_id: '44', username: 'Ethan Howard', total_steps: 43000, current_streak: 21, rank: 44, avatar_color: '#F59E0B', weekly_avg: 4300 },
        { user_id: '45', username: 'Madison Ward', total_steps: 42200, current_streak: 17, rank: 45, avatar_color: '#10B981', weekly_avg: 4220 },
        { user_id: '46', username: 'Luke Torres', total_steps: 41400, current_streak: 26, rank: 46, avatar_color: '#EC4899', weekly_avg: 4140 },
        { user_id: '47', username: 'Addison Peterson', total_steps: 40700, current_streak: 10, rank: 47, avatar_color: '#3B82F6', weekly_avg: 4070 },
        { user_id: '48', username: 'Cameron Gray', total_steps: 39900, current_streak: 23, rank: 48, avatar_color: '#8B5CF6', weekly_avg: 3990 },
        { user_id: '49', username: 'Brooklyn Ramirez', total_steps: 39200, current_streak: 15, rank: 49, avatar_color: '#EF4444', weekly_avg: 3920 },
        { user_id: '50', username: 'Austin James', total_steps: 38500, current_streak: 28, rank: 50, avatar_color: '#06B6D4', weekly_avg: 3850 },
        { user_id: '51', username: 'Ella Watson', total_steps: 37800, current_streak: 12, rank: 51, avatar_color: '#F59E0B', weekly_avg: 3780 },
        { user_id: '52', username: 'Logan Brooks', total_steps: 37100, current_streak: 20, rank: 52, avatar_color: '#10B981', weekly_avg: 3710 },
        { user_id: '53', username: 'Aria Kelly', total_steps: 36500, current_streak: 16, rank: 53, avatar_color: '#EC4899', weekly_avg: 3650 },
        { user_id: '54', username: 'Mason Sanders', total_steps: 35800, current_streak: 27, rank: 54, avatar_color: '#3B82F6', weekly_avg: 3580 },
        { user_id: '55', username: 'Scarlett Price', total_steps: 35200, current_streak: 9, rank: 55, avatar_color: '#8B5CF6', weekly_avg: 3520 },
        { user_id: '56', username: 'Carter Bennett', total_steps: 34600, current_streak: 22, rank: 56, avatar_color: '#EF4444', weekly_avg: 3460 },
        { user_id: '57', username: 'Avery Wood', total_steps: 34000, current_streak: 18, rank: 57, avatar_color: '#06B6D4', weekly_avg: 3400 },
        { user_id: '58', username: 'Jackson Barnes', total_steps: 33400, current_streak: 25, rank: 58, avatar_color: '#F59E0B', weekly_avg: 3340 },
      ];

      const mockConsistencyData: LeaderboardUser[] = [
        { user_id: '6', username: 'James Park', total_steps: 98600, current_streak: 42, rank: 1, avatar_color: '#EF4444', weekly_avg: 9860 },
        { user_id: '3', username: 'Emily Rodriguez', total_steps: 112800, current_streak: 35, rank: 2, avatar_color: '#3B82F6', weekly_avg: 11280 },
        { user_id: '12', username: 'Kevin Zhang', total_steps: 81200, current_streak: 33, rank: 3, avatar_color: '#3B82F6', weekly_avg: 8120 },
        { user_id: '8', username: 'Tom Wilson', total_steps: 89800, current_streak: 31, rank: 4, avatar_color: '#06B6D4', weekly_avg: 8980 },
        { user_id: '42', username: 'Connor Bailey', total_steps: 44600, current_streak: 31, rank: 5, avatar_color: '#EF4444', weekly_avg: 4460 },
        { user_id: '21', username: 'Emma White', total_steps: 67400, current_streak: 30, rank: 6, avatar_color: '#EF4444', weekly_avg: 6740 },
        { user_id: '29', username: 'Grace Hall', total_steps: 57600, current_streak: 29, rank: 7, avatar_color: '#06B6D4', weekly_avg: 5760 },
        { user_id: '1', username: 'Sarah Chen', total_steps: 124500, current_streak: 28, rank: 8, avatar_color: '#8B5CF6', weekly_avg: 12450 },
        { user_id: '16', username: 'Daniel Harris', total_steps: 74600, current_streak: 28, rank: 9, avatar_color: '#F59E0B', weekly_avg: 7460 },
        { user_id: '50', username: 'Austin James', total_steps: 38500, current_streak: 28, rank: 10, avatar_color: '#06B6D4', weekly_avg: 3850 },
        { user_id: '33', username: 'Lily Phillips', total_steps: 53100, current_streak: 27, rank: 11, avatar_color: '#3B82F6', weekly_avg: 5310 },
        { user_id: '54', username: 'Mason Sanders', total_steps: 35800, current_streak: 27, rank: 12, avatar_color: '#3B82F6', weekly_avg: 3580 },
        { user_id: '25', username: 'Isabella Lopez', total_steps: 62300, current_streak: 26, rank: 13, avatar_color: '#EC4899', weekly_avg: 6230 },
        { user_id: '46', username: 'Luke Torres', total_steps: 41400, current_streak: 26, rank: 14, avatar_color: '#EC4899', weekly_avg: 4140 },
        { user_id: '10', username: 'Michael Brown', total_steps: 85300, current_streak: 25, rank: 15, avatar_color: '#10B981', weekly_avg: 8530 },
        { user_id: '37', username: 'Hannah Cooper', total_steps: 49000, current_streak: 25, rank: 16, avatar_color: '#F59E0B', weekly_avg: 4900 },
        { user_id: '58', username: 'Jackson Barnes', total_steps: 33400, current_streak: 25, rank: 17, avatar_color: '#F59E0B', weekly_avg: 3340 },
        { user_id: '19', username: 'Olivia Davis', total_steps: 70200, current_streak: 24, rank: 18, avatar_color: '#3B82F6', weekly_avg: 7020 },
        { user_id: '40', username: 'Dylan Murphy', total_steps: 46300, current_streak: 24, rank: 19, avatar_color: '#3B82F6', weekly_avg: 4630 },
        { user_id: '27', username: 'Ava Robinson', total_steps: 59900, current_streak: 23, rank: 20, avatar_color: '#8B5CF6', weekly_avg: 5990 },
        { user_id: '48', username: 'Cameron Gray', total_steps: 39900, current_streak: 23, rank: 21, avatar_color: '#8B5CF6', weekly_avg: 3990 },
        { user_id: '14', username: 'Robert Taylor', total_steps: 77800, current_streak: 22, rank: 22, avatar_color: '#EF4444', weekly_avg: 7780 },
        { user_id: '35', username: 'Zoe Mitchell', total_steps: 51000, current_streak: 22, rank: 23, avatar_color: '#EF4444', weekly_avg: 5100 },
        { user_id: '56', username: 'Carter Bennett', total_steps: 34600, current_streak: 22, rank: 24, avatar_color: '#EF4444', weekly_avg: 3460 },
        { user_id: '2', username: 'Marcus Johnson', total_steps: 118200, current_streak: 21, rank: 25, avatar_color: '#EC4899', weekly_avg: 11820 },
        { user_id: '23', username: 'Mia Thomas', total_steps: 64800, current_streak: 21, rank: 26, avatar_color: '#F59E0B', weekly_avg: 6480 },
        { user_id: '44', username: 'Ethan Howard', total_steps: 43000, current_streak: 21, rank: 27, avatar_color: '#F59E0B', weekly_avg: 4300 },
        { user_id: '31', username: 'Chloe Adams', total_steps: 55300, current_streak: 20, rank: 28, avatar_color: '#10B981', weekly_avg: 5530 },
        { user_id: '52', username: 'Logan Brooks', total_steps: 37100, current_streak: 20, rank: 29, avatar_color: '#10B981', weekly_avg: 3710 },
        { user_id: '5', username: 'Lisa Thompson', total_steps: 102900, current_streak: 19, rank: 30, avatar_color: '#F59E0B', weekly_avg: 10290 },
        { user_id: '18', username: 'Chris Martin', total_steps: 71500, current_streak: 19, rank: 31, avatar_color: '#EC4899', weekly_avg: 7150 },
        { user_id: '39', username: 'Victoria Bell', total_steps: 47200, current_streak: 19, rank: 32, avatar_color: '#EC4899', weekly_avg: 4720 },
        { user_id: '9', username: 'Jessica Lee', total_steps: 87500, current_streak: 18, rank: 33, avatar_color: '#F59E0B', weekly_avg: 8750 },
        { user_id: '36', username: 'Matthew Evans', total_steps: 50000, current_streak: 18, rank: 34, avatar_color: '#06B6D4', weekly_avg: 5000 },
        { user_id: '57', username: 'Avery Wood', total_steps: 34000, current_streak: 18, rank: 35, avatar_color: '#06B6D4', weekly_avg: 3400 },
        { user_id: '24', username: 'Justin Clark', total_steps: 63500, current_streak: 17, rank: 36, avatar_color: '#10B981', weekly_avg: 6350 },
        { user_id: '45', username: 'Madison Ward', total_steps: 42200, current_streak: 17, rank: 37, avatar_color: '#10B981', weekly_avg: 4220 },
        { user_id: '15', username: 'Amy Wu', total_steps: 76200, current_streak: 16, rank: 38, avatar_color: '#06B6D4', weekly_avg: 7620 },
        { user_id: '32', username: 'Eric Turner', total_steps: 54200, current_streak: 16, rank: 39, avatar_color: '#EC4899', weekly_avg: 5420 },
        { user_id: '53', username: 'Aria Kelly', total_steps: 36500, current_streak: 16, rank: 40, avatar_color: '#EC4899', weekly_avg: 3650 },
        { user_id: '28', username: 'Jason King', total_steps: 58700, current_streak: 15, rank: 41, avatar_color: '#EF4444', weekly_avg: 5870 },
        { user_id: '49', username: 'Brooklyn Ramirez', total_steps: 39200, current_streak: 15, rank: 42, avatar_color: '#EF4444', weekly_avg: 3920 },
        { user_id: '4', username: 'David Kim', total_steps: 108400, current_streak: 14, rank: 43, avatar_color: '#10B981', weekly_avg: 10840 },
        { user_id: '22', username: 'Brandon Lee', total_steps: 66100, current_streak: 14, rank: 44, avatar_color: '#06B6D4', weekly_avg: 6610 },
        { user_id: '43', username: 'Natalie Cox', total_steps: 43800, current_streak: 14, rank: 45, avatar_color: '#06B6D4', weekly_avg: 4380 },
        { user_id: '30', username: 'Nathan Wright', total_steps: 56400, current_streak: 13, rank: 46, avatar_color: '#F59E0B', weekly_avg: 5640 },
        { user_id: '11', username: 'Rachel Green', total_steps: 83100, current_streak: 12, rank: 47, avatar_color: '#EC4899', weekly_avg: 8310 },
        { user_id: '51', username: 'Ella Watson', total_steps: 37800, current_streak: 12, rank: 48, avatar_color: '#F59E0B', weekly_avg: 3780 },
        { user_id: '17', username: 'Sophia Moore', total_steps: 73100, current_streak: 11, rank: 49, avatar_color: '#10B981', weekly_avg: 7310 },
        { user_id: '38', username: 'Jacob Rivera', total_steps: 48100, current_streak: 11, rank: 50, avatar_color: '#10B981', weekly_avg: 4810 },
        { user_id: '26', username: 'Tyler Scott', total_steps: 61100, current_streak: 10, rank: 51, avatar_color: '#3B82F6', weekly_avg: 6110 },
        { user_id: '47', username: 'Addison Peterson', total_steps: 40700, current_streak: 10, rank: 52, avatar_color: '#3B82F6', weekly_avg: 4070 },
        { user_id: '13', username: 'Nicole Anderson', total_steps: 79400, current_streak: 9, rank: 53, avatar_color: '#8B5CF6', weekly_avg: 7940 },
        { user_id: '34', username: 'Andrew Carter', total_steps: 52100, current_streak: 9, rank: 54, avatar_color: '#8B5CF6', weekly_avg: 5210 },
        { user_id: '55', username: 'Scarlett Price', total_steps: 35200, current_streak: 9, rank: 55, avatar_color: '#8B5CF6', weekly_avg: 3520 },
        { user_id: '20', username: 'Ryan Garcia', total_steps: 68800, current_streak: 8, rank: 56, avatar_color: '#8B5CF6', weekly_avg: 6880 },
        { user_id: '41', username: 'Samantha Reed', total_steps: 45500, current_streak: 8, rank: 57, avatar_color: '#8B5CF6', weekly_avg: 4550 },
        { user_id: '7', username: 'Anna Martinez', total_steps: 94200, current_streak: 7, rank: 58, avatar_color: '#8B5CF6', weekly_avg: 9420 },
      ];

      setStepsLeaders(mockStepsData);
      setConsistencyLeaders(mockConsistencyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
    }
    return name.charAt(0);
  };

  const getRankTier = (rank: number) => {
    if (rank <= 3) return { label: 'Legend', color: 'from-yellow-400 to-orange-500', emoji: '👑' };
    if (rank <= 5) return { label: 'Elite', color: 'from-purple-500 to-purple-600', emoji: '💎' };
    if (rank <= 10) return { label: 'Champion', color: 'from-blue-500 to-cyan-500', emoji: '⭐' };
    if (rank <= 20) return { label: 'Leader', color: 'from-green-500 to-emerald-600', emoji: '🎯' };
    if (rank <= 30) return { label: 'Challenger', color: 'from-orange-500 to-amber-600', emoji: '🔥' };
    return { label: 'Competitor', color: 'from-gray-500 to-gray-600', emoji: '💪' };
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const activeLeaders = activeTab === 'steps' ? stepsLeaders : consistencyLeaders;
  const topThree = activeLeaders.slice(0, 3);
  const restOfLeaders = activeLeaders.slice(3);

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-zinc-800 rounded"></div>
        <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-24"></div>
          <div className="h-3 bg-zinc-800 rounded w-32"></div>
        </div>
      </div>
    </div>
  );

  if (loading || tabSwitching) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white pb-6">
        {/* Date Range Indicator */}
        <div className="px-5 pt-6 pb-2">
          <div className="h-4 bg-zinc-800 rounded w-32 mx-auto animate-pulse"></div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 mb-6 pt-2">
          <div className="bg-zinc-900 rounded-xl p-1 flex gap-1">
            <div className="flex-1 h-12 bg-zinc-800 rounded-lg animate-pulse"></div>
            <div className="flex-1 h-12 bg-zinc-800 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* AI Card Skeleton */}
        <div className="px-5 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 animate-pulse">
            <div className="space-y-3">
              <div className="h-6 bg-zinc-800 rounded w-40"></div>
              <div className="h-4 bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Rankings Skeleton */}
        <div className="px-5 mb-3">
          <div className="h-4 bg-zinc-800 rounded w-24 animate-pulse"></div>
        </div>

        {/* Podium Skeleton */}
        <div className="px-5 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-14 h-14 bg-zinc-800 rounded-full animate-pulse mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* List Skeleton */}
        <div className="px-5 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-zinc-950 text-white pb-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800">
        <div className="px-5 py-4 flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Leaderboard</h1>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm font-semibold">Refreshing...</span>
              </>
            ) : (
              <span className="text-sm font-semibold">Pull to refresh</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switcher - Moved to Top */}
      <div className="px-5 mb-6 pt-4">
        <div className="bg-zinc-900 rounded-xl p-1 flex gap-1">
          <button
            onClick={() => switchTab('consistency')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'consistency'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="text-sm">Most Consistent</span>
          </button>
          <button
            onClick={() => switchTab('steps')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'steps'
                ? 'bg-purple-600 text-white font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Most Steps</span>
          </button>
        </div>
      </div>

      {/* Unified Insights Card - Redesigned */}
      <div className="px-5 mb-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600/15 to-blue-600/10 rounded-2xl border border-purple-500/30 shadow-xl"
        >
          {/* Top Section: Challenge Context (Most Important) */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-5 py-4 border-b border-purple-500/20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">February Challenge</h3>
                  <p className="text-xs text-purple-200">Reach 200K steps by Feb 28</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">51%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Complete</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-black/20 rounded-full overflow-hidden mb-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '51%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-white/90 to-white/70 rounded-full"
              />
            </div>
            
            {/* Milestones - Horizontal */}
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex flex-col items-center">
                <span className="text-green-400 mb-0.5">✅</span>
                <span className="text-gray-400">50K</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-green-400 mb-0.5">✅</span>
                <span className="text-gray-400">100K</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-purple-300 mb-0.5">●</span>
                <span className="text-white font-bold">103K</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-600 mb-0.5">○</span>
                <span className="text-gray-500">150K</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-600 mb-0.5">○</span>
                <span className="text-gray-500">200K</span>
              </div>
            </div>
            
            {/* Meta Info */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-purple-500/20">
              <div className="flex items-center gap-1.5 text-xs text-purple-200">
                <span>⏰</span>
                <span className="font-medium">21 days left</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-purple-400"></div>
              <div className="flex items-center gap-1.5 text-xs text-purple-200">
                <span>👥</span>
                <span className="font-medium">127 competing</span>
              </div>
            </div>
          </div>

          {/* Performance Dashboard - Badges Only */}
          <div className="px-5 py-4">
            {/* Stats Row - Hero Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${getRankTier(5).color} flex items-center justify-center shadow-lg shadow-purple-500/30`}>
                  <span className="text-xl">{getRankTier(5).emoji}</span>
                </div>
                <p className="text-[11px] text-white font-semibold">{getRankTier(5).label}</p>
                <p className="text-[9px] text-gray-500 font-medium">Rank #{5}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    {activeTab === 'steps' ? '📈' : '🔥'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  {activeTab === 'steps' ? '+18%' : '19 Days'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-sm font-bold text-white tracking-tight">9.2K</span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Daily Avg</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rankings Section */}
      <div className="px-5 mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rankings</h2>
      </div>

      {/* Top 3 - Integrated Style */}
      <div className="px-5 mb-3">
        <div className="space-y-2">
          {topThree.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-xl p-3 ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-600/10 to-yellow-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                  : index === 1
                  ? 'bg-zinc-800/50 border-zinc-600/50'
                  : 'bg-zinc-900/50 border-amber-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Number on Left */}
                <div className={`w-8 text-center px-3 py-1 rounded-lg ${
                  index === 0 ? 'bg-yellow-400/20' : index === 1 ? 'bg-zinc-600/20' : 'bg-amber-600/20'
                }`}>
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-400' : 'text-amber-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base ${
                    index === 0 ? 'ring-2 ring-yellow-400' : index === 1 ? 'ring-2 ring-zinc-400' : 'ring-2 ring-amber-600'
                  }`}
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {getInitials(user.username)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-base truncate ${
                      index === 0 ? 'text-yellow-100' : 'text-white'
                    }`}>
                      {user.username}
                    </p>
                    {index === 0 && (
                      <span className="text-xs font-bold text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                        👑
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {activeTab === 'steps' ? (
                      <>
                        <span className={index === 0 ? 'text-yellow-200' : ''}>{formatNumber(user.total_steps)} steps</span>
                        <span className="text-gray-700">•</span>
                        <span>{user.current_streak}d streak</span>
                      </>
                    ) : (
                      <>
                        <span className={index === 0 ? 'text-yellow-200' : ''}>{user.current_streak}d streak</span>
                        <span className="text-gray-700">•</span>
                        <span>{formatNumber(user.total_steps)} steps</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rest of Rankings */}
      <div className="px-5">
        <div className="space-y-1.5">
          <AnimatePresence mode="wait">
            {restOfLeaders.map((user, index) => (
              <motion.div
                key={`${activeTab}-${user.user_id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`border rounded-xl p-3.5 transition-all ${
                  user.user_id === currentUserId
                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Left: Rank Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    user.user_id === currentUserId 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-zinc-800 border border-zinc-700'
                  }`}>
                    <span className={`text-sm font-bold ${
                      user.user_id === currentUserId ? 'text-purple-300' : 'text-gray-400'
                    }`}>
                      {user.rank}
                    </span>
                  </div>

                  {/* Center: Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.user_id === currentUserId ? 'ring-2 ring-purple-400' : ''
                      }`}
                      style={{ backgroundColor: user.avatar_color }}
                    >
                      {user.user_id === currentUserId 
                        ? 'YO' 
                        : getInitials(user.username)
                      }
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      {/* Name + You Badge */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-semibold text-sm truncate ${
                          user.user_id === currentUserId ? 'text-purple-200' : 'text-white'
                        }`}>
                          {user.user_id === currentUserId ? 'You' : user.username}
                        </p>
                        {user.user_id === currentUserId && (
                          <span className="flex-shrink-0 bg-purple-500/30 text-purple-200 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Me
                          </span>
                        )}
                      </div>
                      
                      {/* Primary Metric (Bold + Larger) */}
                      <div className="flex items-baseline gap-2">
                        {activeTab === 'steps' ? (
                          <>
                            <span className={`text-base font-bold ${
                              user.user_id === currentUserId ? 'text-purple-100' : 'text-white'
                            }`}>
                              {formatNumber(user.total_steps)}
                            </span>
                            <span className="text-xs text-gray-500">steps</span>
                          </>
                        ) : (
                          <>
                            <span className={`text-base font-bold ${
                              user.user_id === currentUserId ? 'text-purple-100' : 'text-white'
                            }`}>
                              {user.current_streak} days
                            </span>
                            <span className="text-xs text-gray-500">streak</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Visual Indicators */}
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {/* Fire Streak (if 7+ days) */}
                    {user.current_streak >= 7 && activeTab === 'steps' && (
                      <div className="bg-orange-500/20 px-2 py-1 rounded-md border border-orange-500/30">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">🔥</span>
                          <span className="text-xs font-bold text-orange-300">{user.current_streak}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Rank Change Indicator - Varied Movement */}
                    {(() => {
                      // Create realistic rank changes based on position
                      let change = 0;
                      let direction = '−';
                      let colorClass = 'bg-zinc-800 border-zinc-700';
                      let textClass = 'text-gray-500';
                      let numberClass = 'text-gray-500';
                      
                      // Top performers - climbing
                      if (user.rank <= 3) {
                        change = 2;
                        direction = '↑';
                        colorClass = 'bg-green-500/20 border-green-500/30';
                        textClass = 'text-green-300';
                        numberClass = 'text-green-200';
                      }
                      // Big jumpers - ranks 4-6
                      else if (user.rank >= 4 && user.rank <= 6) {
                        change = 3;
                        direction = '↑';
                        colorClass = 'bg-green-500/20 border-green-500/30';
                        textClass = 'text-green-300';
                        numberClass = 'text-green-200';
                      }
                      // Slight climb - ranks 7-10
                      else if (user.rank >= 7 && user.rank <= 10) {
                        change = 1;
                        direction = '↑';
                        colorClass = 'bg-green-500/20 border-green-500/30';
                        textClass = 'text-green-300';
                        numberClass = 'text-green-200';
                      }
                      // Stable middle - ranks 11-15
                      else if (user.rank >= 11 && user.rank <= 15) {
                        change = 0;
                        direction = '−';
                      }
                      // Falling - ranks 16-25
                      else if (user.rank >= 16 && user.rank <= 25) {
                        change = 1;
                        direction = '↓';
                        colorClass = 'bg-red-500/20 border-red-500/30';
                        textClass = 'text-red-300';
                        numberClass = 'text-red-200';
                      }
                      // Big drops - ranks 26-35
                      else if (user.rank >= 26 && user.rank <= 35) {
                        change = 2;
                        direction = '↓';
                        colorClass = 'bg-red-500/20 border-red-500/30';
                        textClass = 'text-red-300';
                        numberClass = 'text-red-200';
                      }
                      // Lower ranks - mixed
                      else {
                        change = user.rank % 3 === 0 ? 1 : 0;
                        direction = user.rank % 3 === 0 ? '↓' : '−';
                        if (direction === '↓') {
                          colorClass = 'bg-red-500/20 border-red-500/30';
                          textClass = 'text-red-300';
                          numberClass = 'text-red-200';
                        }
                      }
                      
                      return (
                        <div className={`px-2 py-1 rounded-md border ${colorClass}`}>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-bold ${textClass}`}>
                              {direction === '↑' ? '⬆️' : direction === '↓' ? '⬇️' : '➖'}
                            </span>
                            <span className={`text-xs font-bold ${numberClass}`}>
                              {change}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg shadow-purple-600/50 z-50 hover:bg-purple-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}