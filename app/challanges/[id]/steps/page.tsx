'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChallengeWeeklySteps, addSteps } from '../../../../lib/api';
import Header from '../../../commponents/Header';

// Helper functions
function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function formatNumber(n: number): string {
    return Number(n || 0).toLocaleString("en-IN");
}

function toISODate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseISODateLocal(iso: string) {
    const datePart = iso.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// string compare works for YYYY-MM-DD
function isWithinRange(dayISO: string, startISO: string, endISO: string) {
    return dayISO >= startISO && dayISO <= endISO;
}




function buildAiSummary(steps: number, goal: number, hasSteps: boolean) {
    const stepComparisons = [
        { steps: 1000, text: '🏠 You walked the length of 10 city blocks!' },
        { steps: 1500, text: '🕌 You walked the length of the Taj Mahal complex!' },
        { steps: 2000, text: '🗼 You walked the height of the Eiffel Tower (twice)!' },
        { steps: 2500, text: '🌉 You walked the length of Howrah Bridge, Kolkata!' },
        { steps: 3500, text: '🏞️ You walked the length of Central Park, NYC!' },
        { steps: 4000, text: '🛕 You walked the length of the Qutub Minar complex!' },
        { steps: 5000, text: '🏟️ You walked around Eden Gardens cricket stadium 10 times!' },
        { steps: 6000, text: '🛣️ You walked the length of Marine Drive, Mumbai!' },
        { steps: 7000, text: '🚇 You walked the length of the Delhi Metro Blue Line!' },
        { steps: 8000, text: '🌉 You walked the length of the Golden Gate Bridge and back!' },
        { steps: 9000, text: '🏞️ You walked the length of Cubbon Park, Bengaluru, 3 times!' },
        { steps: 10000, text: '🏔️ You climbed the Empire State Building (by stairs)!' },
        { steps: 12000, text: '✈️ You walked the length of 4 jumbo jets!' },
        { steps: 14000, text: '🏖️ You walked the entire Bondi Beach, Australia!' },
        { steps: 15000, text: '🏃 You completed a half marathon distance!' },
        { steps: 18000, text: '🚶 You walked the length of Manhattan Island!' },
        { steps: 20000, text: '🌍 You walked 10 miles - amazing achievement!' },
        { steps: 22000, text: '🕌 You walked the length of the Charminar area, Hyderabad, 5 times!' },
        { steps: 25000, text: '⛰️ You climbed Mount Fuji (by steps)!' },
        { steps: 30000, text: '🚀 You walked a marathon distance today!' },
    ];

    if (!hasSteps || steps === 0) return '';

    for (let i = stepComparisons.length - 1; i >= 0; i--) {
        if (steps >= stepComparisons[i].steps) return stepComparisons[i].text;
    }

    return `🚀 You have taken ${steps.toLocaleString()} steps! Keep going!`;
}

function getSwipeablePages() {
    const today = new Date();
    const dayIndex = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 372;

    const quoteDay = [
        'The journey of a thousand miles begins with a single step. – Lao Tzu',
        'Walking is man’s best medicine. – Hippocrates',
        'A walk a day keeps the doctor away.',
        'Every step is progress, no matter how small.',
        'Your body was made to move. Keep stepping!',
        'Success is the sum of small efforts, repeated day in and day out. – Robert Collier',
        'The best way to get ahead is to get started.',
        'You are only one workout away from a good mood.',
        'Health is the greatest wealth. – Virgil',
        'Take care of your body. It’s the only place you have to live. – Jim Rohn',
        'Walking 30 minutes a day can add years to your life.',
        'A healthy outside starts from the inside. – Robert Urich',
        'Movement is a medicine for creating change in a person’s physical, emotional, and mental states. – Carol Welch',
        'The groundwork for all happiness is good health. – Leigh Hunt',
        'Eat well, move daily, hydrate often, sleep lots, love your body.',
        'Small daily improvements are the key to staggering long-term results. – Robin Sharma',
        'A fit body, a calm mind, a house full of love. These things cannot be bought – they must be earned.',
        'Those who think they have no time for exercise will sooner or later have to find time for illness. – Edward Stanley',
        'The secret of getting ahead is getting started. – Mark Twain',
        'It’s never too early or too late to work towards being the healthiest you.',
        'Energy and persistence conquer all things. – Benjamin Franklin',
        'Fitness is not about being better than someone else. It’s about being better than you used to be.',
        'Your body achieves what your mind believes.',
        'Exercise not only changes your body, it changes your mind, your attitude and your mood.',
        'A little progress each day adds up to big results.',
        'Push yourself, because no one else is going to do it for you.',
        'You don’t have to be great to start, but you have to start to be great. – Zig Ziglar',
        'Don’t limit your challenges. Challenge your limits.',
        'Doubt kills more dreams than failure ever will.',
        'Great things never come from comfort zones.',
        'Dream big, work hard, stay focused, and surround yourself with good people.',
        'The only bad workout is the one that didn’t happen.',
        'You are stronger than you think.',
        'Don’t stop when you’re tired. Stop when you’re done.',
        'Difficult roads often lead to beautiful destinations.',
        'Believe you can and you’re halfway there. – Theodore Roosevelt',
        'Strength does not come from physical capacity. It comes from an indomitable will. – Mahatma Gandhi',
        'The pain you feel today will be the strength you feel tomorrow.',
        'You are capable of amazing things.',
        'Start where you are. Use what you have. Do what you can. – Arthur Ashe',
        'Don’t wish for it. Work for it.',
        'Success doesn’t come from what you do occasionally, it comes from what you do consistently.',
        'Your only limit is you.',
        'Motivation gets you going, but discipline keeps you growing.',
        'The difference between who you are and who you want to be is what you do.',
        'Perseverance is not a long race; it is many short races one after the other. – Walter Elliot',
        'You don’t have to go fast, you just have to go.',
        'Every accomplishment starts with the decision to try.',
        'Don’t count the days, make the days count. – Muhammad Ali',
        'Discipline is choosing between what you want now and what you want most.',
        'The best project you’ll ever work on is you.',
        'Your future self will thank you for the steps you take today.',
        'A little effort each day adds up to big results.'
    ];

    const dailyTips = [
        '🌿 Take the stairs instead of the elevator whenever possible.',
        '⚡ Walk during phone calls to add extra steps effortlessly.',
        '🎯 Park farther away to increase your daily step count.',
        '🔥 Set hourly reminders to stand up and walk for 2 minutes.',
        '🦵 Walk after meals to aid digestion and control blood sugar.',
        '☀️ Morning walks boost your mood and energy all day.',
        '👟 Invest in comfortable shoes - your feet will thank you!',
        '💧 Carry a water bottle and stay hydrated during walks.',
        '🧢 Wear a cap and sunscreen for outdoor walks in the sun.',
        '👫 Invite a friend or family member to join your walk.',
        '📱 Use a step tracker app to stay motivated.',
        '🕒 Try walking for 10 minutes after every meal.',
        '🚦 Use pedestrian crossings and stay alert while walking.',
        '🧘‍♀️ Practice deep breathing while walking for extra relaxation.',
        '🍎 Eat a light snack before long walks for sustained energy.',
        '🎧 Listen to podcasts or audiobooks to make walks enjoyable.',
        '🦶 Stretch your legs and ankles before and after walking.',
        '🌲 Choose green, shaded routes for a refreshing experience.',
        '🚶‍♂️ Walk at a pace that lets you talk but not sing.',
        '🛑 If you feel pain, slow down or take a break.',
        '💡 Walking 10,000 steps burns about 400-500 calories!',
        '🦴 Walking strengthens your bones and improves balance.',
        '❤️ Just 30 minutes of walking can reduce heart disease risk by 35%.',
        '🧠 Walking boosts creativity by up to 60%!',
        '😊 A 15-minute walk can reduce sugar cravings.',
        '🌙 Regular walking improves sleep quality significantly.',
        '💪 Walking tones your legs, abs, and arms naturally.',
        '🚶‍♂️ Walking is the most popular form of exercise in India!',
        '🌏 The average person walks about 100,000 miles in their lifetime.',
        '👣 Mahatma Gandhi often walked 18 km a day during his campaigns.',
        '🦶 2,000 steps is roughly 1 mile for most people.',
        '🏃‍♀️ Walking briskly can burn as many calories as slow jogging.',
        '🦚 Early morning walks in parks can boost your vitamin D naturally.',
        '🎵 Listening to music while walking can increase your pace by 15%.',
        '🌳 Walking in nature reduces stress and anxiety levels.',
        '🧘‍♂️ Mindful walking is a form of meditation practiced worldwide.',
        '🚶‍♀️ The world record for most steps in a day is over 100,000!',
        '🏞️ India has over 100,000 km of walking trails and footpaths.',
        '🦸‍♂️ Walking regularly can add years to your life.',
        '🍀 People who walk daily report higher happiness levels.'
    ];

    const dailyQuote = quoteDay[dayIndex % quoteDay.length];
    const dailyTip = dailyTips[dayIndex % dailyTips.length];

    return [
        { title: '', content: dailyQuote },
        { title: '', content: dailyTip }
    ];
}

export default function StepsTracker() {
    const [stepsToday, setStepsToday] = useState(0);
    const [stepsWeek, setStepsWeek] = useState(0);

    const [viewSteps, setViewSteps] = useState(0);
    const [viewLabel, setViewLabel] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('');

    const [logOpen, setLogOpen] = useState(false);
    const [inputSteps, setInputSteps] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const swipeablePages = useMemo(() => getSwipeablePages(), []);
    const params = useParams();
    const router = useRouter();

    const challengeId = params.id as string;

    const date = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    // API-driven state
    const [apiWeek, setApiWeek] = useState<any>(null);
    const [apiLoading, setApiLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // ✅ UPDATED: Sync state with backend data
    useEffect(() => {
        if (!apiWeek) return;

        // Set week total
        setStepsWeek(apiWeek.week_total_steps ?? 0);

        // Find today's steps from days array
        const todayStr = toISODate(new Date());
        const todayObj = apiWeek.days?.find((d: any) => String(d.day).split('T')[0] === todayStr);
        const todaySteps = todayObj?.total_steps ?? 0;

        setStepsToday(todaySteps);

        // Only update viewSteps if no specific day is selected
        if (!selectedLabel) {
            setViewSteps(todaySteps);
        }
    }, [apiWeek, selectedLabel]);

    useEffect(() => {
        if (!challengeId) return;

        setApiLoading(true);
        getChallengeWeeklySteps(challengeId, weekOffset)
            .then(data => {
                setApiWeek(data);
                setApiLoading(false);
            })
            .catch(err => {
                console.error('Failed to load challenge data:', err);
                setApiError(err.message || 'Could not load challenge data');
                setApiLoading(false);
            });
    }, [challengeId, weekOffset]);
    const navigationLimits = useMemo(() => {
        if (!apiWeek?.challenge_start || !apiWeek?.challenge_end) {
            return { canGoPrev: false, canGoNext: false };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - today.getDay() + 1);

        // Target week we're currently viewing
        const targetMonday = new Date(currentMonday);
        targetMonday.setDate(currentMonday.getDate() + (weekOffset * 7));

        const targetSunday = new Date(targetMonday);
        targetSunday.setDate(targetMonday.getDate() + 6);

        const challengeStart = parseISODateLocal(apiWeek.challenge_start);
        const challengeEnd = parseISODateLocal(apiWeek.challenge_end);

        // Previous week
        const prevMonday = new Date(targetMonday);
        prevMonday.setDate(targetMonday.getDate() - 7);
        const prevSunday = new Date(prevMonday);
        prevSunday.setDate(prevMonday.getDate() + 6);

        // Next week
        const nextMonday = new Date(targetMonday);
        nextMonday.setDate(targetMonday.getDate() + 7);
        const nextSunday = new Date(nextMonday);
        nextSunday.setDate(nextMonday.getDate() + 6);

        // Can go PREVIOUS if:
        // Previous week OVERLAPS with challenge range (at least one day in common)
        // Week overlaps if: prevSunday >= challengeStart
        const canGoPrev = prevSunday >= challengeStart;

        // Can go NEXT if:
        // 1. Next week OVERLAPS with challenge (nextMonday <= challengeEnd)
        // 2. Next week has already started (nextMonday <= today)
        const canGoNext = nextMonday <= challengeEnd && nextMonday <= today;

        return { canGoPrev, canGoNext };
    }, [apiWeek, weekOffset]);



    // Week range label
    const weekRangeLabel = useMemo(() => {
        if (!apiWeek?.week_start || !apiWeek?.week_end) return '';
        const start = parseISODateLocal(apiWeek.week_start);
        const end = parseISODateLocal(apiWeek.week_end);
        // Check if this is the current week
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        // Compare week start/end to current week
        if (
            start.getFullYear() === monday.getFullYear() &&
            start.getMonth() === monday.getMonth() &&
            start.getDate() === monday.getDate() &&
            end.getFullYear() === sunday.getFullYear() &&
            end.getMonth() === sunday.getMonth() &&
            end.getDate() === sunday.getDate()
        ) {
            return 'This Week';
        }
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }, [apiWeek]);

    // ✅ UPDATED: Get goals from API response
    const goalToday: number = apiWeek?.goal_daily_target ?? 5000;
    const goalWeek: number = apiWeek?.goal_period_target ?? 35000;

    // ✅ UPDATED: Map backend days to weekDays for UI
    const weekDays = useMemo(() => {
        const todayISO = toISODate(new Date());
        const startISO = apiWeek?.challenge_start ? String(apiWeek.challenge_start).split('T')[0] : undefined; // "2026-01-01"
        const endISO = apiWeek?.challenge_end ? String(apiWeek.challenge_end).split('T')[0] : undefined;     // "2026-01-31"

        // If backend gave days => use those (already Mon-Sun)
        if (apiWeek?.days && apiWeek.days.length > 0) {
            const sortedDays = [...apiWeek.days].sort((a: any, b: any) =>
                String(a.day).localeCompare(String(b.day))
            );

            const mondayIndex = sortedDays.findIndex((d: any) => {
                const isoDay = String(d.day).split('T')[0];
                const dateObj = parseISODateLocal(isoDay);
                return dateObj.getDay() === 1;
            });

            const orderedDays =
                mondayIndex > 0
                    ? [...sortedDays.slice(mondayIndex), ...sortedDays.slice(0, mondayIndex)]
                    : sortedDays;

            return orderedDays.map((d: any) => {
                const isoDay = String(d.day).split('T')[0]; // backend ISO date
                const steps = d.total_steps ?? 0;
                const dateObj = parseISODateLocal(isoDay);
                const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                let inChallenge = true;
                if (startISO && endISO) inChallenge = isWithinRange(isoDay, startISO, endISO);

                return {
                    label,
                    short: label,
                    date: dateObj.getDate(),
                    isoDay,
                    steps,
                    done: steps >= goalToday,
                    today: isoDay === todayISO,
                    inChallenge,
                };
            });
        }

        // If no backend days => create current week Mon-Sun
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            const isoDay = toISODate(d);
            let inChallenge = true;
            if (startISO && endISO) inChallenge = isWithinRange(isoDay, startISO, endISO);

            return {
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                short: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate(),
                isoDay,
                steps: 0,
                done: false,
                today: isoDay === todayISO,
                inChallenge,
            };
        });
    }, [apiWeek, goalToday]);

    const todayIdx = useMemo(() => weekDays.findIndex((d: any) => d.today), [weekDays]);

    // Auto-select day only on week navigation, preserve selection on API refresh
    useEffect(() => {
        if (!weekDays || weekDays.length === 0) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If user has a selection, check if it's still valid in current week
        if (selectedLabel) {
            const currentSelection = weekDays.find((d: any) => d.label === selectedLabel);
            if (currentSelection && currentSelection.inChallenge) {
                // Check if selected day is not in the future
                const selectedDate = new Date(currentSelection.isoDay);
                selectedDate.setHours(0, 0, 0, 0);
                const isNotFuture = selectedDate <= today;

                if (isNotFuture) {
                    // Keep current selection, just update steps
                    setViewSteps(currentSelection.steps);
                    return;
                }
            }
        }

        // No valid selection - auto-select appropriate day
        const todayISO = toISODate(today);

        // Check if today is in this week
        const todayInWeek = weekDays.find((d: any) => d.isoDay === todayISO);

        if (todayInWeek && todayInWeek.inChallenge) {
            // Today is in this week and in challenge range
            setSelectedLabel(todayInWeek.label);
            setViewSteps(todayInWeek.steps);
            setViewLabel(todayInWeek.label); // Changed from 'Today' to day label
        } else {
            // Select first valid day (not future, in challenge range)
            let foundDay = false;

            // Go backwards from today to find most recent valid day
            for (let i = weekDays.length - 1; i >= 0; i--) {
                const day = weekDays[i];
                const dayDate = new Date(day.isoDay);
                dayDate.setHours(0, 0, 0, 0);
                const isNotFuture = dayDate <= today;

                if (day.inChallenge && isNotFuture) {
                    setSelectedLabel(day.label);
                    setViewSteps(day.steps);
                    setViewLabel(day.label);
                    foundDay = true;
                    break;
                }
            }

            // If no past/present day, select first valid day in challenge
            if (!foundDay) {
                for (let i = 0; i < weekDays.length; i++) {
                    const day = weekDays[i];
                    if (day.inChallenge) {
                        setSelectedLabel(day.label);
                        setViewSteps(day.steps);
                        setViewLabel(day.label);
                        break;
                    }
                }
            }
        }
    }, [weekOffset, weekDays]);

    // Update steps for selected day from API data
    useEffect(() => {
        if (!apiWeek || !weekDays || weekDays.length === 0) return;
        if (!selectedLabel) return;

        const selectedDay = weekDays.find((d: any) => d.label === selectedLabel);
        if (selectedDay && apiWeek?.days) {
            const selectedDayData = apiWeek.days?.find((d: any) => d.day === selectedDay.isoDay);
            const selectedSteps = selectedDayData?.total_steps ?? 0;
            setViewSteps(selectedSteps);
        }
    }, [selectedLabel, apiWeek, weekDays]);

    const streak = useMemo(() => {
        const idx = weekDays.findIndex((d: any) => d.today);
        if (idx < 0 || !weekDays[idx].done) return 0;
        let s = 0;
        for (let i = idx; i >= 0; i--) {
            if (weekDays[i].done) s += 1;
            else break;
        }
        return s;
    }, [weekDays]);

    const hasSteps = viewSteps > 0;
    const [showAchievementAnim, setShowAchievementAnim] = useState(false);

    const allPages = useMemo(() => {
        // return hasSteps
        return false
            ? [{ title: 'Your Achievement', content: buildAiSummary(viewSteps, goalToday, true) }, ...swipeablePages]
            : swipeablePages;
    }, [hasSteps, swipeablePages, viewSteps, goalToday]);

    useEffect(() => {
        if (hasSteps) {
            setShowAchievementAnim(true);
            const timeout = setTimeout(() => setShowAchievementAnim(false), 1200);
            return () => clearTimeout(timeout);
        }
    }, [viewSteps, hasSteps]);

    const safePageIndex = clamp(currentPageIndex, 0, Math.max(allPages.length - 1, 0));
    const displayedTitle = allPages[safePageIndex]?.title || '';
    const displayedContent = allPages[safePageIndex]?.content || '';

    const remainingToday = Math.max(goalToday - viewSteps, 0);

    const onSelectDay = (day: any, idx: number) => {
        // Don't allow clicking days outside challenge range
        if (day.inChallenge === false) return;

        // Allow clicking any day that's:
        // 1. Within challenge range
        // 2. Not in the future (today or before)
        const dayDate = new Date(day.isoDay);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dayDate.setHours(0, 0, 0, 0);

        const isFutureDay = dayDate > today;

        // Block future days
        if (isFutureDay) return;

        // Allow all past/present days within challenge
        setSelectedLabel(day.label);
        setViewSteps(day.steps);
        setViewLabel(day.label); // Always show day name (Wed, Thu, etc.) instead of "Today"
        setCurrentPageIndex(0);
    };

    // ✅ UPDATED: Add steps handler
    const onAddSteps = async () => {
        const n = Number(inputSteps);

        // Validate input
        if (!Number.isFinite(n) || n <= 0) {
            alert('Please enter a valid positive number');
            return;
        }

        if (n > 50000) {
            alert('Maximum allowed steps is 50,000 per entry');
            return;
        }

        if (n < 1) {
            alert('Minimum steps must be at least 1');
            return;
        }

        // Determine log_date (use local date, not UTC)
        const now = new Date();
        let log_date = now.toISOString().slice(0, 10);

        const startISO = apiWeek?.challenge_start;
        const endISO = apiWeek?.challenge_end;

        // If user selected a specific day (not today)
        if (viewLabel !== 'Today') {
            const selectedDay = weekDays.find((d: any) => d.label === selectedLabel);
            if (selectedDay && apiWeek?.days) {
                const match = apiWeek.days.find((d: any) => d.day === selectedDay.isoDay);
                if (match) {
                    log_date = match.day;
                }
            }
        }

        // Validate date is within challenge
        if (startISO && endISO && !isWithinRange(log_date, startISO, endISO)) {
            alert(`This date is outside the challenge period (${startISO} to ${endISO}).`);
            return;
        }

        setAddLoading(true);
        try {
            await addSteps({
                steps: n,
                log_date,
                source: 'manual',
                note: inputSteps ? 'Manual entry' : undefined
            });

            // Refresh weekly data
            const updated = await getChallengeWeeklySteps(challengeId, weekOffset);
            setApiWeek(updated);

            // Update viewSteps for the current selected day
            const selectedDay = weekDays.find((d: any) => d.label === selectedLabel);
            if (selectedDay) {
                const updatedDayData = updated.days?.find((d: any) => d.day === selectedDay.isoDay);
                const updatedSteps = updatedDayData?.total_steps ?? 0;
                setViewSteps(updatedSteps);

                // Check if target met and trigger confetti
                if (updatedSteps >= goalToday && updatedSteps - n < goalToday) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 2000);
                }
            }

            setInputSteps('');
            setLogOpen(false);
        } catch (err) {
            console.error('Failed to add steps:', err);
            alert('Failed to add steps. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    const weekProgress = goalWeek > 0 ? (stepsWeek / goalWeek) * 100 : 0;
    const dayProgress = goalToday > 0 ? (viewSteps / goalToday) * 100 : 0;

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEnd(0);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 30;
        const isRightSwipe = distance < -30;

        if (isLeftSwipe && safePageIndex < allPages.length - 1) {
            setCurrentPageIndex(prev => prev + 1);
        }
        if (isRightSwipe && safePageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    if (apiLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading challenge data...</p>
            </div>
        );
    }

    if (apiError) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px',
            }}>
                <p style={{ color: '#ef4444', textAlign: 'center' }}>{apiError}</p>
                <button
                    onClick={() => router.push('/challanges')}
                    style={{
                        padding: '12px 24px',
                        background: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Challenges
                </button>
            </div>
        );
    }
    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0f172a', padding: '0' }}>
            {/* Full-page Confetti Effect */}
            {showConfetti && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    overflow: 'hidden'
                }}>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                width: `${4 + Math.random() * 2}px`,
                                height: `${8 + Math.random() * 4}px`,
                                backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'][i % 5],
                                animation: `confettiFall ${2.5 + Math.random() * 1.5}s ease-out forwards`,
                                animationDelay: `${Math.random() * 0.3}s`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                                opacity: 0.7,
                                borderRadius: '2px'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ADD HEADER COMPONENT */}
            {/* <Header
        title="Steps"
        subtitle="Daily activity tracker"
        showAnimatedWord={false}
      /> */}

            {/* Header with Back Button */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 1) 100%)',
                padding: '2px 16px',
                paddingBottom: '0'
            }}>
                <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
                    {/* Streak Badge - Top Right (Absolute Position) */}
                    {apiWeek?.streak && apiWeek.streak.current_streak > 0 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '18px',
                                right: '0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 149, 0, 0.4)',
                                boxShadow: '0 4px 12px rgba(255, 149, 0, 0.3)',
                                minWidth: '64px',
                                zIndex: 10
                            }}
                        >
                            <div style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: 'rgba(255,255,255,0.9)',
                                letterSpacing: '0.5px',
                                lineHeight: '1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                            }}>
                                <span style={{ fontSize: '12px' }}>🔥</span>
                                <span>{apiWeek.streak.current_streak} Streak</span>
                            </div>
                        </div>
                    )}

                    {/* Title with Back Button */}
                    <div style={{
                        paddingRight: '80px' // Space for streak badge
                    }}>
                        {/* Back Button with Text - Android Style */}
                        <button
                            onClick={() => router.push('/challanges')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ffffff',
                                cursor: 'pointer',
                                padding: '18px 0px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginLeft: '-8px',
                                borderRadius: '20px',
                                WebkitTapHighlightColor: 'transparent',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                            <span style={{
                                fontSize: '17px',
                                fontWeight: '500',
                                letterSpacing: '-0.2px'
                            }}>
                                {apiWeek?.challenge_title || 'Challenges'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div
                style={{
                    background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 1) 100%)',
                    padding: '16px',
                }}
            >
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>

                    {/* Week Navigation with Limits */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        gap: '8px'
                    }}>
                        <button
                            onClick={() => setWeekOffset(weekOffset - 1)}
                            disabled={!navigationLimits.canGoPrev}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: navigationLimits.canGoPrev ? '#a855f7' : '#4a5568',
                                fontSize: '18px',
                                cursor: navigationLimits.canGoPrev ? 'pointer' : 'not-allowed',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                opacity: navigationLimits.canGoPrev ? 1 : 0.3
                            }}
                            aria-label="Previous week"
                            title={navigationLimits.canGoPrev ? "Previous week" : "Cannot go before challenge start"}
                        >
                            &#8592;
                        </button>

                        <span style={{
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 600,
                            minWidth: '140px',
                            textAlign: 'center'
                        }}>
                            {weekRangeLabel}
                        </span>

                        <button
                            onClick={() => setWeekOffset(weekOffset + 1)}
                            disabled={!navigationLimits.canGoNext}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: navigationLimits.canGoNext ? '#a855f7' : '#4a5568',
                                fontSize: '18px',
                                cursor: navigationLimits.canGoNext ? 'pointer' : 'not-allowed',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                opacity: navigationLimits.canGoNext ? 1 : 0.3
                            }}
                            aria-label="Next week"
                            title={navigationLimits.canGoNext ? "Next week" : "Cannot go beyond current week or challenge end"}
                        >
                            &#8594;
                        </button>
                    </div>

                    {/* Week Ticks */}
                    <div style={{ marginBottom: '24px' }}>
                        {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>This Week</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>🔥 {streak} day streak</span>
                        </div> */}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {weekDays.map((day: any, idx: number) => {
                                const isToday = day.today;
                                const isSelected = selectedLabel === day.label;

                                // Check if day is in future
                                const dayDate = new Date(day.isoDay);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                dayDate.setHours(0, 0, 0, 0);
                                const isFutureDay = dayDate > today;

                                // Disable if: outside challenge OR in the future
                                const isOutOfRange = !day.inChallenge;
                                const isDisabled = isOutOfRange || isFutureDay;

                                // Calculate progress percentage for circular indicator
                                const progressPercent = isOutOfRange ? 0 : Math.min((day.steps / goalToday) * 100, 100);
                                const radius = 20;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

                                return (
                                    <div key={day.label} style={{ textAlign: 'center', opacity: isDisabled ? 0.25 : 1 }}>
                                        <button
                                            onClick={() => !isDisabled && onSelectDay(day, idx)}
                                            disabled={isDisabled}
                                            style={{
                                                width: '100%',
                                                maxWidth: '44px',
                                                aspectRatio: '1',
                                                margin: '0 auto',
                                                display: 'block',
                                                position: 'relative',
                                                background: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                                                border: 'none',
                                                padding: '0',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                borderRadius: '50%',
                                                transition: 'background 0.2s ease',
                                            }}
                                        >
                                            {/* SVG Circular Progress Ring */}
                                            <svg
                                                width="100%"
                                                height="100%"
                                                viewBox="0 0 48 48"
                                                style={{
                                                    display: 'block',
                                                }}
                                            >
                                                {/* Background circle */}
                                                <circle
                                                    cx="24"
                                                    cy="24"
                                                    r={radius}
                                                    fill="none"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="2"
                                                />
                                                {/* Progress circle */}
                                                {progressPercent > 0 && (
                                                    <circle
                                                        cx="24"
                                                        cy="24"
                                                        r={radius}
                                                        fill="none"
                                                        stroke="#a855f7"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={strokeDashoffset}
                                                        transform="rotate(-90 24 24)"
                                                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                                    />
                                                )}
                                                {/* Selected state ring */}
                                                {isSelected && (
                                                    <circle
                                                        cx="24"
                                                        cy="24"
                                                        r="22"
                                                        fill="none"
                                                        stroke="#c084fc"
                                                        strokeWidth="3"
                                                    />
                                                )}
                                                {/* Purple fill when complete */}
                                                {day.done && (
                                                    <circle
                                                        cx="24"
                                                        cy="24"
                                                        r="17"
                                                        fill="rgba(168, 85, 247, 0.9)"
                                                    />
                                                )}
                                                {/* Day number text */}
                                                <text
                                                    x="24"
                                                    y="24"
                                                    textAnchor="middle"
                                                    dominantBaseline="central"
                                                    fill="#ffffff"
                                                    fontSize="14"
                                                    fontWeight="700"
                                                >
                                                    {isOutOfRange ? '—' : day.date}
                                                </text>
                                            </svg>

                                            {/* Today indicator */}
                                            {isToday && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-2px',
                                                    right: '-2px',
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#10b981',
                                                    border: '2px solid #fafbfc',
                                                    zIndex: 3,
                                                }}
                                                />
                                            )}
                                        </button>

                                        <p style={{
                                            fontSize: '9px',
                                            color: isSelected ? '#c084fc' : (isToday ? '#7c3aed' : '#94a3b8'),
                                            marginTop: '6px',
                                            fontWeight: isSelected ? '700' : '600',
                                            textTransform: 'uppercase',
                                        }}>
                                            {day.short}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 20px' }}>
                        <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="80" cy="80" r="64" fill="none" stroke="#e2e8f0" strokeWidth="11" />
                            <circle
                                cx="80"
                                cy="80"
                                r="64"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="11"
                                strokeLinecap="round"
                                strokeDasharray={`${(dayProgress / 100) * 402} 402`}
                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>

                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', lineHeight: '1' }}>{formatNumber(viewSteps)}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>{viewLabel}</div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{Math.round(dayProgress)}% of goal</div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                        Goal: {formatNumber(goalToday)} • {formatNumber(Math.max(goalToday - viewSteps, 0))} left
                    </div>

                    {/* Weekly Progress */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Weekly Progress</span>
                            <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: '600' }}>{Math.round(weekProgress)}%</span>
                        </div>

                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: `${weekProgress}%`,
                                    background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)',
                                    borderRadius: '999px',
                                    transition: 'width 0.5s ease',
                                }}
                            />
                        </div>

                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                            {formatNumber(stepsWeek)} / {formatNumber(goalWeek)} steps
                        </div>
                    </div>

                    {/* Swipe Card */}
                    <div
                        style={{
                            background: 'rgba(124, 58, 237, 0.15)',
                            border: '1px solid rgba(124, 58, 237, 0.3)',
                            borderRadius: '16px',
                            padding: '16px 16px 20px 16px',
                            marginBottom: '24px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            overflow: 'hidden',
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            style={{
                                display: 'flex',
                                width: `${allPages.length * 100}%`,
                                transform: `translateX(-${safePageIndex * (100 / allPages.length)}%)`,
                                transition: 'transform 260ms ease',
                            }}
                        >
                            {allPages.map((p, i) => (
                                <div key={i} style={{ width: `${100 / allPages.length}%`, padding: '0 6px', boxSizing: 'border-box' }}>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            color: 'rgba(255,255,255,0.85)',
                                            marginBottom: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {p.title}
                                    </div>

                                    <p
                                        style={{
                                            fontSize: '15px',
                                            color: '#e9d5ff',
                                            lineHeight: '1.6',
                                            fontWeight: '500',
                                            margin: '0 0 14px 0',
                                            textAlign: 'center',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
                                            transform: showAchievementAnim && i === 0 && hasSteps ? 'scale(1.05)' : 'scale(1)',
                                            opacity: showAchievementAnim && i === 0 && hasSteps ? 1 : 0.9,
                                        }}
                                    >
                                        {p.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                            {allPages.map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPageIndex(index)}
                                    style={{
                                        width: index === safePageIndex ? '24px' : '6px',
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: index === safePageIndex ? '#7c3aed' : 'rgba(255,255,255,0.3)',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                    aria-label={`Go to ${page.title}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Add Steps Button */}
                    <button
                        onClick={() => setLogOpen(true)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#ffffff',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                            transition: 'all 0.2s ease',
                            marginBottom: '12px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
                        }}
                    >
                        Add Steps
                    </button>

                    {/* Team Activity Button */}
                    <button
                        onClick={() => router.push(`/challanges/${challengeId}/leaderboard`)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '15px',
                            fontWeight: '600',
                            // color: '#a855f7',
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                        }}
                    >
                         
                        <span>Rankings ⭐</span>
                    </button>

                    {/* Modal */}
                    {logOpen && (
                        <div
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                zIndex: 1000,
                                backdropFilter: 'blur(4px)',
                                padding: '20px',
                            }}
                            onClick={() => {
                                setLogOpen(false);
                                setInputSteps('');
                            }}
                        >
                            <div
                                style={{
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '20px 20px 0 0',
                                    padding: '24px',
                                    width: '100%',
                                    maxWidth: '360px',
                                    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.18)',
                                    animation: 'slideUp 0.25s ease',
                                    marginBottom: 0,
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Add Steps</h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                                    {(() => {
                                        // Find selected day object
                                        const selectedDayObj = weekDays.find((d: any) => d.label === selectedLabel);
                                        if (selectedDayObj && !selectedDayObj.today) {
                                            // Previous day
                                            const dateObj = apiWeek?.days?.find((d: any) => {
                                                const date = parseISODateLocal(d.day);
                                                return date.getDate() === selectedDayObj.date;
                                            });
                                            if (dateObj) {
                                                const date = parseISODateLocal(dateObj.day);
                                                return `${selectedDayObj.label}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
                                            }
                                            return `${selectedDayObj.label}`;
                                        } else {
                                            // Today
                                            return `Today, ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
                                        }
                                    })()}
                                </p>

                                <input
                                    type="number"
                                    value={inputSteps}
                                    onChange={(e) => setInputSteps(e.target.value)}
                                    placeholder="Enter steps for the day"
                                    inputMode="numeric"
                                    min="1"
                                    max="50000"
                                    step="1"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        fontSize: '16px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        marginBottom: '20px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        color: '#0f172a',
                                    }}
                                // Remove auto-focus
                                />

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={onAddSteps}
                                        disabled={!inputSteps.trim() || addLoading}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#ffffff',
                                            background: inputSteps.trim() && !addLoading ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : '#e2e8f0',
                                            border: 'none',
                                            borderRadius: '12px',
                                            cursor: inputSteps.trim() && !addLoading ? 'pointer' : 'not-allowed',
                                            opacity: inputSteps.trim() && !addLoading ? 1 : 0.5,
                                        }}
                                    >
                                        {addLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                <span style={{ width: 16, height: 16, border: '3px solid #a855f7', borderTop: '3px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                                                Adding...
                                            </span>
                                        ) : 'Add'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setLogOpen(false);
                                            setInputSteps('');
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#94a3b8',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            @keyframes confettiFall {
            0% { top: -10px; opacity: 0.7; }
            100% { top: 100vh; opacity: 0.2; }
            }
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
                </div>
            </div>
        </div>
    );
}
